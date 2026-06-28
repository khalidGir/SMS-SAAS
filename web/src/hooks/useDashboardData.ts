'use client';

import { useEffect, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';

export interface DashboardAnalytics {
  totalOutstandingFees: number;
  totalCollected: number;
  activeInvoiceCount: number;
  activeStudentCount: number;
  pendingEnrollmentCount: number;
  role: string;
}

/**
 * Loads analytics summary from GET /api/v1/analytics/summary on mount.
 *
 * Returns the standard useApi shape: { data, loading, error, request }.
 * The consumer calls `request()` (or relies on the auto-fetch on mount).
 * Pass `autoFetch = false` to skip the initial fetch.
 */
export function useDashboardData(autoFetch = true) {
  const { data, loading, error, request } = useApi<DashboardAnalytics>();

  const fetchSummary = useCallback(() => {
    return request('GET', '/api/v1/analytics/summary');
  }, [request]);

  useEffect(() => {
    if (autoFetch) {
      fetchSummary();
    }
  }, [autoFetch, fetchSummary]);

  return {
    analytics: data,
    loading,
    error,
    refresh: fetchSummary,
  };
}
