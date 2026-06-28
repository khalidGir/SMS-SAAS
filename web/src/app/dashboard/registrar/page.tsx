'use client';

import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import MetricCard from '@/components/shared/MetricCard';

export default function RegistrarDashboard() {
  const { user } = useAuth();
  const { analytics, loading, error } = useDashboardData();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Registrar Dashboard</h1>
      <p className="mt-1 text-gray-500">Welcome, {user?.name ?? 'Registrar'}.</p>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Active Students"
          value={analytics?.activeStudentCount ?? '—'}
          loading={loading}
          error={error}
        />
        <MetricCard
          label="Pending Enrollments"
          value={analytics?.pendingEnrollmentCount ?? '—'}
          loading={loading}
          error={error}
        />
        <MetricCard
          label="Total Outstanding"
          value={analytics ? `ETB ${analytics.totalOutstandingFees.toLocaleString()}` : '—'}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}
