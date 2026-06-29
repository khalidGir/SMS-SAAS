'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useApi } from '@/hooks/useApi';
import { fetchSchools, createSchool, type School, type SchoolInput } from '@/lib/api/schools';
import MetricCard from '@/components/shared/MetricCard';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import SchoolFormModal from '@/components/modules/super-admin/SchoolFormModal';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import type { CreateSchoolInput } from '@/lib/validations/schemas';

interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  userName: string;
  userRole: string | null;
}

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const { analytics, loading, error, refresh } = useDashboardData();
  const { data: auditLogs, request: fetchAuditLogs } = useApi<AuditLogEntry[]>();

  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSchools()
      .then(setSchools)
      .finally(() => setSchoolsLoading(false));
    fetchAuditLogs('GET', '/api/v1/audit-logs?limit=10');
  }, [fetchAuditLogs]);

  const handleCreateSchool = async (data: CreateSchoolInput) => {
    setSaving(true);
    try {
      await createSchool(data as SchoolInput);
      setShowSchoolModal(false);
      refresh();
      const updated = await fetchSchools();
      setSchools(updated);
    } catch {
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

  const actionLabel = (action: string) => {
    const map: Record<string, string> = {
      LOGIN_SUCCESS: 'Login',
      LOGIN_FAILED: 'Failed login',
      LOGOUT: 'Logout',
      PAYMENT_RECORDED: 'Payment recorded',
      PAYMENT_VOIDED: 'Payment voided',
      PAYMENT_CONFIRMED: 'Payment confirmed',
      SETTINGS_UPDATED: 'Settings updated',
      SCHOOL_REGISTERED: 'School registered',
    };
    return map[action] || action;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome, {user?.name ?? 'Super Admin'}. Monitor platform-wide activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard
          label="Total Schools"
          value={analytics?.totalSchools ?? '—'}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          loading={loading}
          error={error}
          onRetry={refresh}
        />
        <MetricCard
          label="Active Schools"
          value={analytics?.activeSchools ?? '—'}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          loading={loading}
          error={error}
          onRetry={refresh}
        />
        <MetricCard
          label="Suspended Schools"
          value={analytics?.suspendedSchools ?? '—'}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
          loading={loading}
          error={error}
          onRetry={refresh}
        />
        <MetricCard
          label="Platform Users"
          value={analytics?.platformUsers ?? '—'}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          loading={loading}
          error={error}
          onRetry={refresh}
        />
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
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">All Schools</h2>
            <Link href="/dashboard/super-admin/schools" className="text-sm font-medium text-violet-600 hover:text-violet-500">
              View All
            </Link>
          </div>
          <DataTable columns={columns} rows={schools} loading={schoolsLoading} emptyMessage="No schools registered yet" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Platform Activity</h2>
          <div className="rounded-xl border border-gray-200/80 bg-white shadow-sm">
            {auditLogs && auditLogs.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {auditLogs.map(log => (
                  <li key={log.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{log.userName}</p>
                        <p className="text-xs text-gray-500">{actionLabel(log.action)} — {log.entityType}</p>
                      </div>
                      <span className="shrink-0 text-xs text-gray-400">{formatDate(log.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-400">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSchoolModal && (
        <SchoolFormModal mode="create" loading={saving} onSubmit={handleCreateSchool} onClose={() => setShowSchoolModal(false)} />
      )}
    </div>
  );
}
