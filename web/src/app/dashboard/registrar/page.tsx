'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useApi } from '@/hooks/useApi';
import MetricCard from '@/components/shared/MetricCard';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import Skeleton from '@/components/shared/Skeleton';
import { formatCurrency } from '@/lib/utils';

interface StudentRecord {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  status: string;
}

export default function RegistrarDashboard() {
  const { user } = useAuth();
  const { analytics, loading, error, refresh } = useDashboardData();
  const { data: pendingStudents, loading: pendingLoading, request: fetchPending } = useApi<StudentRecord[]>();

  useEffect(() => {
    fetchPending('GET', '/api/v1/students?status=PENDING');
  }, [fetchPending]);

  const columns: Column<StudentRecord>[] = [
    { key: 'studentId', label: 'ID', render: (r) => <span className="font-mono text-xs text-gray-500">{r.studentId}</span> },
    { key: 'firstName', label: 'First Name', render: (r) => r.firstName },
    { key: 'lastName', label: 'Last Name', render: (r) => r.lastName },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} variant="lifecycle" /> },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">Registrar Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Welcome, {user?.name ?? 'Registrar'}.</p>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Active Students"
          value={analytics?.activeStudentCount ?? '—'}
          loading={loading}
          error={error}
          onRetry={refresh}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <MetricCard
          label="Pending Enrollments"
          value={analytics?.pendingEnrollmentCount ?? '—'}
          loading={loading}
          error={error}
          onRetry={refresh}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <MetricCard
          label="Suspended Students"
          value={analytics?.suspendedStudentCount ?? '—'}
          loading={loading}
          error={error}
          onRetry={refresh}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Total Classes"
          value={analytics?.totalClasses ?? '—'}
          loading={loading}
          error={error}
          onRetry={refresh}
        />
        <MetricCard
          label="Enrollment Rate"
          value={analytics?.enrollmentRate != null ? `${Math.round(analytics.enrollmentRate * 100)}%` : '—'}
          loading={loading}
          error={error}
          onRetry={refresh}
        />
        <MetricCard
          label="Male:Female Ratio"
          value={analytics?.maleFemaleRatio != null ? `${analytics.maleFemaleRatio}:1` : '—'}
          loading={loading}
          error={error}
          onRetry={refresh}
        />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-gray-900">Pending Admissions</h2>
        <DataTable columns={columns} rows={pendingStudents ?? []} loading={pendingLoading} emptyMessage="No pending admissions" />
      </section>
    </div>
  );
}
