'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchSuperAdminDashboard, type SuperAdminDashboard } from '@/lib/api/dashboard';
import { fetchSchools, createSchool, type School, type SchoolInput } from '@/lib/api/schools';
import MetricCard from '@/components/shared/MetricCard';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import Skeleton from '@/components/shared/Skeleton';
import SchoolFormModal from '@/components/modules/super-admin/SchoolFormModal';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import type { CreateSchoolInput } from '@/lib/validations/schemas';

export default function SuperAdminDashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState<SuperAdminDashboard | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchSuperAdminDashboard(), fetchSchools()])
      .then(([d, s]) => {
        if (cancelled) return;
        setDashboard(d);
        setSchools(s);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Failed to load dashboard data');
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

  const handleCreateSchool = async (data: CreateSchoolInput) => {
    setSaving(true);
    try {
      await createSchool(data as SchoolInput);
      setShowSchoolModal(false);
      refresh();
    } catch {
      // error handled by form
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<School>[] = [
    { key: 'name', label: 'School', render: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
    { key: 'domain', label: 'Domain', render: (r) => r.domain },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status={r.status} variant="lifecycle" />,
    },
    { key: 'planType', label: 'Plan', render: (r) => r.planType },
    { key: 'userCount', label: 'Users', align: 'center', render: (r) => r.userCount },
    { key: 'createdAt', label: 'Created', render: (r) => formatDate(r.createdAt) },
    {
      key: 'actions',
      label: '',
      render: () => (
        <Link
          href="/dashboard/super-admin/schools"
          className="text-xs font-medium text-violet-600 hover:text-violet-500"
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome, {user?.name ?? 'Super Admin'}. Monitor platform-wide activity.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-8 w-16" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-dashed border-rose-200 bg-rose-50/50 px-4 py-8 text-center">
          <p className="text-sm text-rose-600">{error}</p>
          <button onClick={refresh} className="mt-2 text-sm font-medium text-violet-600 hover:text-violet-500">
            Retry
          </button>
        </div>
      ) : dashboard ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <MetricCard label="Total Schools" value={dashboard.totalSchools} />
            <MetricCard label="Active Schools" value={dashboard.activeSchools} />
            <MetricCard label="Suspended Schools" value={dashboard.suspendedSchools} />
            <MetricCard label="Platform Users" value={dashboard.platformUsers} />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowSchoolModal(true)}
              className="flex items-center gap-2 rounded-xl border border-gray-200/80 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <svg className="h-4 w-4 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add School
            </button>
            <Link
              href="/dashboard/super-admin/users"
              className="flex items-center gap-2 rounded-xl border border-gray-200/80 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <svg className="h-4 w-4 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Manage Users
            </Link>
            <button className="flex items-center gap-2 rounded-xl border border-gray-200/80 bg-white px-5 py-3 text-sm font-medium text-gray-400 shadow-sm cursor-not-allowed">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Global Settings
            </button>
          </div>
        </>
      ) : null}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">All Schools</h2>
          <Link href="/dashboard/super-admin/schools" className="text-sm font-medium text-violet-600 hover:text-violet-500">
            View All
          </Link>
        </div>
        <DataTable columns={columns} rows={schools} loading={loading} emptyMessage="No schools registered yet" />
      </div>

      {showSchoolModal && (
        <SchoolFormModal mode="create" loading={saving} onSubmit={handleCreateSchool} onClose={() => setShowSchoolModal(false)} />
      )}
    </div>
  );
}
