'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useApi } from '@/hooks/useApi';
import MetricCard from '@/components/shared/MetricCard';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  userName: string;
  userRole: string | null;
}

const actionLabel = (action: string) => {
  const map: Record<string, string> = {
    LOGIN_SUCCESS: 'Login', LOGIN_FAILED: 'Failed login', LOGOUT: 'Logout',
    PAYMENT_RECORDED: 'Payment recorded', PAYMENT_VOIDED: 'Payment voided',
    PAYMENT_CONFIRMED: 'Payment confirmed', SETTINGS_UPDATED: 'Settings updated',
    SCHOOL_REGISTERED: 'School registered',
  };
  return map[action] || action;
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const { analytics, loading, error, refresh } = useDashboardData();
  const { data: auditLogs, request: fetchAuditLogs } = useApi<AuditLogEntry[]>();

  useEffect(() => {
    fetchAuditLogs('GET', '/api/v1/audit-logs?limit=10');
  }, [fetchAuditLogs]);

  const chartData = analytics?.monthlyBreakdown ?? [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.schoolName || 'Dashboard'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.name || 'Admin'}.
        </p>
      </div>

      {/* Row 1: 4 Primary MetricCards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard
          label="Collection Efficiency"
          value={analytics?.collectionRate != null ? `${analytics.collectionRate}%` : '—'}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          loading={loading}
          error={error}
          onRetry={refresh}
          trend={analytics?.collectionRate != null
            ? { label: `${analytics.collectionRate}% of total billed`, positive: analytics.collectionRate >= 50 }
            : undefined}
        />
        <MetricCard
          label="Outstanding Receivables"
          value={analytics ? formatCurrency(analytics.totalOutstandingFees) : '—'}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          loading={loading}
          error={error}
          onRetry={refresh}
          skeletonWidth="w-3/4"
        />
        <MetricCard
          label="Active Students"
          value={analytics?.activeStudentCount ?? '—'}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          loading={loading}
          error={error}
          onRetry={refresh}
          trend={analytics ? { label: `${analytics.activeStudentCount} enrolled`, positive: true } : undefined}
        />
        <MetricCard
          label="Pending Admissions"
          value={analytics?.pendingEnrollmentCount ?? '—'}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          loading={loading}
          error={error}
          onRetry={refresh}
          skeletonWidth="w-1/2"
        />
      </div>

      {/* Row 2: Billed vs Collected Chart */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Billed vs Collected
        </h2>
        <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="billed" name="Billed Fees" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" name="Collected Cash" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : loading ? (
            <div className="flex h-[280px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
            </div>
          ) : (
            <div className="flex h-[280px] items-center justify-center">
              <p className="text-sm text-gray-400">No billing data available</p>
            </div>
          )}
        </div>
      </section>

      {/* Row 3: Recent Activity */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Recent Activity
        </h2>
        <div className="rounded-xl border border-gray-200/80 bg-white shadow-sm">
          {auditLogs && auditLogs.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {auditLogs.map(log => (
                <li key={log.id} className="flex items-start justify-between gap-2 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{log.userName}</p>
                    <p className="text-xs text-gray-500">{actionLabel(log.action)} — {log.entityType}</p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">{formatDate(log.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-400">No recent activity</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
