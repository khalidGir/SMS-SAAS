'use client';

import { useEffect, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';

export interface RecentPayment {
  receiptNo: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  studentName: string;
}

export interface PaymentMethodBreakdown {
  CASH: number;
  BANK_TRANSFER: number;
  TELEBIRR: number;
  CHEQUE: number;
  CARD: number;
}

export interface DashboardAnalytics {
  totalOutstandingFees: number;
  totalCollected: number;
  activeInvoiceCount: number;
  activeStudentCount: number;
  pendingEnrollmentCount: number;
  role: string;
  // SUPER_ADMIN
  totalSchools?: number;
  activeSchools?: number;
  suspendedSchools?: number;
  platformUsers?: number;
  // REGISTRAR
  totalClasses?: number;
  totalCapacity?: number;
  enrollmentRate?: number;
  suspendedStudentCount?: number;
  maleFemaleRatio?: number;
  // ACCOUNTANT
  collectionRate?: number;
  overdueCount?: number;
  overdueTotal?: number;
  paymentsThisMonth?: number;
  paymentMethodBreakdown?: PaymentMethodBreakdown;
  // CASHIER
  todayCollectionCount?: number;
  todayCollectionAmount?: number;
  recentPayments?: RecentPayment[];
  // ACCOUNTANT — aging
  agingBuckets?: {
    '0-30': number;
    '31-60': number;
    '61-90': number;
    '90+': number;
  };
  // ADMIN / ACCOUNTANT — monthly breakdown
  monthlyBreakdown?: { month: string; billed: number; collected: number }[];
  // PARENT
  upcomingDueCount?: number;
  nextDueDate?: string | null;
  nextDueAmount?: number;
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
