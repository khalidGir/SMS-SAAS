'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, formatDate } from '@/lib/utils';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import Toast from '@/components/shared/Toast';
import FeeStructureFormModal from '@/components/modules/finance/FeeStructureFormModal';
import type { FeeStructureData, FeeStructureInput } from '@/lib/validations/schemas';

export default function FeeStructurePage() {
  const { user } = useAuth();
  const [fees, setFees] = useState<FeeStructureData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingFee, setEditingFee] = useState<FeeStructureData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const refresh = useCallback(() => setRefreshCounter(c => c + 1), []);

  useEffect(() => {
    let cancelled = false;
    const token = sessionStorage.getItem('accessToken');
    setLoading(true);
    setError(null);

    fetch('/api/v1/fees', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => res.json())
      .then(json => {
        if (cancelled) return;
        if (json.status === 'success') {
          setFees(json.data);
        } else {
          setError(json?.error?.message || 'Failed to load fee structures');
        }
      })
      .catch(() => { if (!cancelled) setError('Network error'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [refreshCounter]);

  const openCreate = () => {
    setModalMode('create');
    setEditingFee(null);
    setShowModal(true);
  };

  const openEdit = (fee: FeeStructureData) => {
    setModalMode('edit');
    setEditingFee(fee);
    setShowModal(true);
  };

  const handleSubmit = async (data: FeeStructureInput) => {
    setSaving(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let res: Response;
      if (modalMode === 'create') {
        res = await fetch('/api/v1/fees', { method: 'POST', headers, body: JSON.stringify(data) });
      } else if (editingFee) {
        res = await fetch(`/api/v1/fees/${editingFee.id}`, { method: 'PUT', headers, body: JSON.stringify(data) });
      } else return;

      const json = await res.json();
      if (json.status !== 'success') {
        throw new Error(json?.error?.message || 'Operation failed');
      }

      setToast({
        message: modalMode === 'create' ? 'Fee structure created successfully.' : 'Fee structure updated successfully.',
        type: 'success',
      });
      setShowModal(false);
      refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (fee: FeeStructureData) => {
    const token = sessionStorage.getItem('accessToken');
    try {
      const res = await fetch(`/api/v1/fees/${fee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: fee.status === 'Active' ? 'Inactive' : 'Active' }),
      });
      const json = await res.json();
      if (json.status !== 'success') throw new Error(json?.error?.message || 'Failed to update status');
      setToast({ message: `Fee structure ${fee.status === 'Active' ? 'deactivated' : 'activated'}.`, type: 'success' });
      refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      setToast({ message: msg, type: 'error' });
    }
  };

  const handleDelete = async (fee: FeeStructureData) => {
    const msg = `Permanently delete "${fee.name}"? This will mark it as inactive and it won't be available for new invoices.`;
    if (!window.confirm(msg)) return;
    const token = sessionStorage.getItem('accessToken');
    try {
      const res = await fetch(`/api/v1/fees/${fee.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (json.status !== 'success') throw new Error(json?.error?.message || 'Failed to delete');
      setToast({ message: 'Fee structure deactivated.', type: 'success' });
      refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete';
      setToast({ message: msg, type: 'error' });
    }
  };

  const filtered = fees.filter(f => {
    if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!f.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const columns: Column<FeeStructureData>[] = [
    { key: 'name', label: 'Name', render: (f) => <span className="font-medium text-gray-900">{f.name}</span> },
    {
      key: 'term', label: 'Term', render: (f) => <span className="text-gray-700">{f.term?.name ?? '—'}</span>,
    },
    {
      key: 'baseAmount', label: 'Base Amount', align: 'right',
      render: (f) => <span className="text-gray-900">{formatCurrency(f.baseAmount)}</span>,
    },
    {
      key: 'dueDate', label: 'Due Date', align: 'center',
      render: (f) => <span className="text-gray-600">{formatDate(f.dueDate)}</span>,
    },
    {
      key: 'lateFee', label: 'Late Fee', align: 'right',
      render: (f) => <span className="text-gray-700">{f.lateFeeRate > 0 ? `${formatCurrency(f.lateFeeRate)}${f.lateFeeType === 'DAILY' ? '/day' : ''}` : '—'}</span>,
    },
    {
      key: 'frequency', label: 'Frequency', align: 'center',
      render: (f) => <span className="text-gray-600">{f.frequency}</span>,
    },
    {
      key: 'status', label: 'Status', align: 'center',
      render: (f) => <StatusBadge status={f.status} variant="lifecycle" />,
    },
    {
      key: 'actions', label: '', align: 'right',
      render: (f) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openEdit(f)}
            className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            onClick={() => handleToggleStatus(f)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
              f.status === 'Active'
                ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            {f.status === 'Active' ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => handleDelete(f)}
            className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Structures</h1>
          <p className="mt-1 text-gray-500">Welcome, {user?.name ?? 'Accountant'}.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          + Add Fee Structure
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          <option value="ALL">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        loading={loading}
        emptyMessage="No fee structures found."
      />

      {showModal && (
        <FeeStructureFormModal
          mode={modalMode}
          fee={editingFee}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
