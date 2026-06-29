'use client';

import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import MetricCard from '@/components/shared/MetricCard';
import { formatCurrency } from '@/lib/utils';

export default function AccountantDashboard() {
  const { user } = useAuth();
  const { analytics, loading, error, refresh } = useDashboardData();

  const pmt = analytics?.paymentMethodBreakdown;
  const totalPmt = pmt ? Object.values(pmt).reduce((a, b) => a + b, 0) : 0;
  const buckets = analytics?.agingBuckets;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">Accountant Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Welcome, {user?.name ?? 'Accountant'}.</p>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard
          label="Total Collected"
          value={analytics ? formatCurrency(analytics.totalCollected) : '—'}
          loading={loading}
          error={error}
          onRetry={refresh}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend={analytics ? { label: `ETB ${analytics.totalCollected.toLocaleString()} total`, positive: true } : undefined}
        />
        <MetricCard
          label="Outstanding Fees"
          value={analytics ? formatCurrency(analytics.totalOutstandingFees) : '—'}
          loading={loading}
          error={error}
          onRetry={refresh}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
        />
        <MetricCard
          label="Collection Rate"
          value={analytics?.collectionRate != null ? `${analytics.collectionRate}%` : '—'}
          loading={loading}
          error={error}
          onRetry={refresh}
          trend={analytics?.collectionRate != null ? { label: `${analytics.collectionRate}% of total billed`, positive: analytics.collectionRate >= 50 } : undefined}
        />
        <MetricCard
          label="Payments This Month"
          value={analytics?.paymentsThisMonth ?? '—'}
          loading={loading}
          error={error}
          onRetry={refresh}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <MetricCard
          label="Overdue Invoices"
          value={analytics?.overdueCount ?? '—'}
          loading={loading}
          error={error}
          onRetry={refresh}
        />
        <MetricCard
          label="Overdue Total"
          value={analytics?.overdueTotal != null ? formatCurrency(analytics.overdueTotal) : '—'}
          loading={loading}
          error={error}
          onRetry={refresh}
        />
      </div>

      {/* A/R Aging Buckets */}
      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">A/R Aging Summary</h2>
          {buckets ? (
            <div className="space-y-2">
              {[
                { label: '0–30 days', value: buckets['0-30'], color: 'bg-emerald-500' },
                { label: '31–60 days', value: buckets['31-60'], color: 'bg-amber-500' },
                { label: '61–90 days', value: buckets['61-90'], color: 'bg-orange-500' },
                { label: '90+ days', value: buckets['90+'], color: 'bg-rose-500' },
              ].map(({ label, value, color }) => {
                const total = Object.values(buckets).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? (value / total) * 100 : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-medium text-gray-900">{formatCurrency(value)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-8 animate-pulse rounded bg-gray-100" />)}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No aging data</p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Payment Methods</h2>
          {pmt && totalPmt > 0 ? (
            <div className="space-y-2">
              {Object.entries(pmt).map(([method, count]) => {
                const pct = (count / totalPmt) * 100;
                return (
                  <div key={method}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{method.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-violet-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-8 animate-pulse rounded bg-gray-100" />)}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No payment data</p>
          )}
        </div>
      </section>
    </div>
  );
}
