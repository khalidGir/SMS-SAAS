'use client';

import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import MetricCard from '@/components/shared/MetricCard';
import { formatCurrency } from '@/lib/utils';

export default function AccountantDashboard() {
  const { user } = useAuth();
  const { analytics, loading, error } = useDashboardData();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Accountant Dashboard</h1>
      <p className="mt-1 text-gray-500">Welcome, {user?.name ?? 'Accountant'}.</p>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Total Collected"
          value={analytics ? formatCurrency(analytics.totalCollected) : '—'}
          loading={loading}
          error={error}
        />
        <MetricCard
          label="Outstanding Fees"
          value={analytics ? formatCurrency(analytics.totalOutstandingFees) : '—'}
          loading={loading}
          error={error}
        />
        <MetricCard
          label="Active Invoices"
          value={analytics?.activeInvoiceCount ?? '—'}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}
