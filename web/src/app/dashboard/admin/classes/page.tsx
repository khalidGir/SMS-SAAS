'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DataTable, { type Column } from '@/components/shared/DataTable';
import Toast from '@/components/shared/Toast';
import ClassFormModal from '@/components/modules/academic/ClassFormModal';
import type { ClassData, ClassInput } from '@/lib/validations/schemas';

export default function ClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const refresh = useCallback(() => setRefreshCounter(c => c + 1), []);

  useEffect(() => {
    let cancelled = false;
    const token = sessionStorage.getItem('accessToken');
    setLoading(true);
    setError(null);

    fetch('/api/v1/classes', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => res.json())
      .then(json => {
        if (cancelled) return;
        if (json.status === 'success') {
          setClasses(json.data);
        } else {
          setError(json?.error?.message || 'Failed to load classes');
        }
      })
      .catch(() => { if (!cancelled) setError('Network error'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [refreshCounter]);

  const openCreate = () => {
    setModalMode('create');
    setEditingClass(null);
    setShowModal(true);
  };

  const openEdit = (cls: ClassData) => {
    setModalMode('edit');
    setEditingClass(cls);
    setShowModal(true);
  };

  const handleSubmit = async (data: ClassInput) => {
    setSaving(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let res: Response;
      if (modalMode === 'create') {
        res = await fetch('/api/v1/classes', { method: 'POST', headers, body: JSON.stringify(data) });
      } else if (editingClass) {
        res = await fetch(`/api/v1/classes/${editingClass.id}`, { method: 'PUT', headers, body: JSON.stringify(data) });
      } else return;

      const json = await res.json();
      if (json.status !== 'success') {
        throw new Error(json?.error?.message || 'Operation failed');
      }

      setToast({
        message: modalMode === 'create' ? 'Class created successfully.' : 'Class updated successfully.',
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

  const handleDelete = async (cls: ClassData) => {
    const msg = `Delete "${cls.name}"? This action cannot be undone. Students enrolled in this class must be reassigned first.`;
    if (!window.confirm(msg)) return;

    const token = sessionStorage.getItem('accessToken');
    try {
      const res = await fetch(`/api/v1/classes/${cls.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (json.status !== 'success') {
        throw new Error(json?.error?.message || 'Failed to delete');
      }
      setToast({ message: 'Class deleted.', type: 'success' });
      refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete';
      setToast({ message: msg, type: 'error' });
    }
  };

  const filtered = classes.filter(c => {
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const columns: Column<ClassData>[] = [
    { key: 'name', label: 'Class Name', render: (c) => <span className="font-medium text-gray-900">{c.name}</span> },
    {
      key: 'capacity', label: 'Capacity', align: 'center',
      render: (c) => <span className="text-gray-700">{c.capacity}</span>,
    },
    {
      key: 'enrolled', label: 'Enrolled', align: 'center',
      render: (c) => {
        const count = c.enrolledCount ?? 0;
        const full = count >= c.capacity;
        return (
          <span className={full ? 'font-medium text-rose-700' : 'text-emerald-700'}>
            {count}/{c.capacity}
          </span>
        );
      },
    },
    {
      key: 'available', label: 'Available', align: 'center',
      render: (c) => {
        const avail = c.capacity - (c.enrolledCount ?? 0);
        return (
          <span className={avail <= 0 ? 'text-rose-600' : 'text-gray-600'}>
            {Math.max(0, avail)}
          </span>
        );
      },
    },
    {
      key: 'actions', label: '', align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openEdit(c)}
            className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(c)}
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
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="mt-1 text-gray-500">Welcome, {user?.name ?? 'Admin'}.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          + Add Class
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="mb-4 flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
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
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        loading={loading}
        emptyMessage="No classes found."
      />

      {showModal && (
        <ClassFormModal
          mode={modalMode}
          classData={editingClass}
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
