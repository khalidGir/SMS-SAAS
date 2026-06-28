'use client';

import { useEffect, useState } from 'react';
import { fetchSchools, createSchool, updateSchool, deleteSchool, type School, type SchoolInput } from '@/lib/api/schools';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import SchoolFormModal from '@/components/modules/super-admin/SchoolFormModal';
import { formatDate } from '@/lib/utils';
import type { CreateSchoolInput } from '@/lib/validations/schemas';

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [refreshCounter, setRefreshCounter] = useState(0);

  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchSchools()
      .then((data) => {
        if (cancelled) return;
        setSchools(data);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Failed to load schools');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [refreshCounter]);

  const refresh = () => {
    setLoading(true);
    setError(null);
    setRefreshCounter((c) => c + 1);
  };

  const filtered = schools.filter((s) => {
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !s.domain.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const openCreate = () => {
    setModalMode('create');
    setEditingSchool(null);
    setShowModal(true);
  };

  const openEdit = (school: School) => {
    setModalMode('edit');
    setEditingSchool(school);
    setShowModal(true);
  };

  const handleSubmit = async (data: CreateSchoolInput) => {
    setSaving(true);
    try {
      if (modalMode === 'create') {
        await createSchool(data as SchoolInput);
      } else if (editingSchool) {
        await updateSchool(editingSchool.id, data as SchoolInput);
      }
      setShowModal(false);
      refresh();
    } catch {
      // handled in form
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (school: School) => {
    const newStatus = school.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await updateSchool(school.id, { status: newStatus });
    refresh();
  };

  const handleDelete = async (school: School) => {
    if (!window.confirm(`Permanently delete "${school.name}"? This action cannot be undone.`)) return;
    await deleteSchool(school.id);
    refresh();
  };

  const columns: Column<School>[] = [
    { key: 'name', label: 'School', render: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
    { key: 'domain', label: 'Domain', render: (r) => r.domain },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} variant="lifecycle" /> },
    { key: 'planType', label: 'Plan', render: (r) => <span className="text-xs font-medium text-gray-600">{r.planType}</span> },
    { key: 'userCount', label: 'Users', align: 'center', render: (r) => r.userCount },
    { key: 'createdAt', label: 'Created', render: (r) => formatDate(r.createdAt) },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(r)} className="text-xs font-medium text-violet-600 hover:text-violet-500">Edit</button>
          <button
            onClick={() => handleToggleStatus(r)}
            className={`text-xs font-medium ${r.status === 'ACTIVE' ? 'text-amber-600 hover:text-amber-500' : 'text-emerald-600 hover:text-emerald-500'}`}
          >
            {r.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
          </button>
          <button onClick={() => handleDelete(r)} className="text-xs font-medium text-red-600 hover:text-red-500">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schools</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all schools on the platform</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add School
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schools..."
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {error && !loading && (
        <div className="rounded-lg border border-dashed border-rose-200 bg-rose-50/50 px-4 py-6 text-center">
          <p className="text-sm text-rose-600">{error}</p>
          <button onClick={refresh} className="mt-2 text-sm font-medium text-violet-600 hover:text-violet-500">Retry</button>
        </div>
      )}

      {!error && (
        <DataTable
          columns={columns}
          rows={filtered}
          loading={loading}
          emptyMessage={search || statusFilter !== 'ALL' ? 'No schools match the filters' : 'No schools registered yet'}
        />
      )}

      {showModal && (
        <SchoolFormModal mode={modalMode} school={editingSchool} loading={saving} onSubmit={handleSubmit} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
