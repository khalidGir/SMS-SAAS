'use client';

import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import MetricCard from '@/components/shared/MetricCard';
import EmptyState from '@/components/shared/EmptyState';
import { cn, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

const quickActions = [
  {
    label: 'New Session',
    href: '/dashboard/admin/sessions',
    color: 'bg-violet-50 text-violet-700 ring-violet-600/20',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
  {
    label: 'Manage Students',
    href: '/dashboard/admin/students',
    color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
      </svg>
    ),
  },
  {
    label: 'Generate Report',
    href: '/dashboard/accountant/reports',
    color: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { analytics, loading, error, refresh } = useDashboardData();

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.schoolName || 'Dashboard'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.name || 'Admin'}.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
        <MetricCard
          label="Total Collected"
          value={analytics ? formatCurrency(analytics.totalCollected) : '—'}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          loading={loading}
          error={error}
          onRetry={refresh}
          trend={
            analytics && analytics.totalCollected > 0
              ? { label: 'Total revenue this period', positive: true }
              : undefined
          }
          skeletonWidth="w-3/4"
        />
      </div>

      {/* Quick Actions */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                'flex items-center gap-3 rounded-xl border border-gray-200/80 px-4 py-3.5 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
                action.color,
              )}
            >
              {action.icon}
              {action.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Recent Activity
        </h2>
        <div className="rounded-xl border border-gray-200/80 bg-white shadow-sm">
          <EmptyState
            icon={
              <svg className="h-8 w-8 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="No recent activity"
            description="Activity log will appear here as actions are taken."
          />
        </div>
      </section>
    </div>
  );
}
