'use client';

import { cn } from '@/lib/utils';
import Skeleton from './Skeleton';
import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { label: string; positive: boolean };
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  skeletonWidth?: string;
}

export default function MetricCard({
  label,
  value,
  icon,
  trend,
  loading,
  error,
  onRetry,
  skeletonWidth = 'w-2/3',
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all duration-200',
        !loading && !error && 'hover:shadow-md hover:-translate-y-0.5',
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            {icon}
          </div>
        )}
      </div>

      {loading ? (
        <div className="mt-3 space-y-2">
          <Skeleton className={cn('h-8', skeletonWidth)} />
          <Skeleton className="h-3 w-1/4" />
        </div>
      ) : error ? (
        <div className="mt-3 rounded-lg border border-dashed border-rose-200 bg-rose-50/50 px-3 py-3 text-center">
          <p className="text-xs text-rose-600">Failed to load</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-1 text-xs font-medium text-violet-600 hover:text-violet-500"
            >
              Retry
            </button>
          )}
        </div>
      ) : (
        <div className="mt-1">
          <p
            className={cn(
              'text-3xl font-bold tracking-tight text-gray-900',
              typeof value === 'number' && value < 0 && 'text-red-600',
            )}
          >
            {value}
          </p>
          {trend ? (
            <p
              className={cn(
                'mt-0.5 text-xs',
                trend.positive ? 'text-emerald-600' : 'text-rose-500',
              )}
            >
              {trend.label}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-gray-400">&nbsp;</p>
          )}
        </div>
      )}
    </div>
  );
}
