'use client';

import { useEffect, useState } from 'react';
import { fetchSchools, type School } from '@/lib/api/schools';
import { fetchUsers, createUser, updateUserStatus, type PlatformUser, type PlatformUserInput } from '@/lib/api/users';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import CreateUserModal from '@/components/modules/super-admin/CreateUserModal';
import { formatDate } from '@/lib/utils';
import type { CreatePlatformUserInput } from '@/lib/validations/schemas';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  REGISTRAR: 'Registrar',
  ACCOUNTANT: 'Accountant',
};

export default function UsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchUsers(), fetchSchools()])
      .then(([u, s]) => {
        if (cancelled) return;
        setUsers(u);
        setSchools(s);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Failed to load users');
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

  const handleCreateUser = async (data: CreatePlatformUserInput) => {
    setSaving(true);
    try {
      await createUser(data as PlatformUserInput);
      setShowModal(false);
      refresh();
    } catch {
      // handled in form
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: PlatformUser) => {
    const newStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    await updateUserStatus(user.id, newStatus);
    refresh();
  };

  const columns: Column<PlatformUser>[] = [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium text-gray-900">{r.firstName} {r.lastName}</span> },
    { key: 'email', label: 'Email', render: (r) => r.email },
    {
      key: 'role',
      label: 'Role',
      render: (r) => (
        <span className="inline-flex rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-600/20">
          {ROLE_LABELS[r.role] ?? r.role}
        </span>
      ),
    },
    { key: 'schoolName', label: 'School', render: (r) => r.schoolName },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} variant="lifecycle" /> },
    { key: 'createdAt', label: 'Created', render: (r) => formatDate(r.createdAt) },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <button
          onClick={() => handleToggleStatus(r)}
          className={`text-xs font-medium ${r.status === 'ACTIVE' ? 'text-amber-600 hover:text-amber-500' : 'text-emerald-600 hover:text-emerald-500'}`}
        >
          {r.status === 'ACTIVE' ? 'Disable' : 'Enable'}
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Users</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage user accounts for all schools</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      {error && !loading && (
        <div className="rounded-lg border border-dashed border-rose-200 bg-rose-50/50 px-4 py-6 text-center">
          <p className="text-sm text-rose-600">{error}</p>
          <button onClick={refresh} className="mt-2 text-sm font-medium text-violet-600 hover:text-violet-500">Retry</button>
        </div>
      )}

      {!error && (
        <DataTable columns={columns} rows={users} loading={loading} emptyMessage="No users registered yet" />
      )}

      {showModal && (
        <CreateUserModal schools={schools} loading={saving} onSubmit={handleCreateUser} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
