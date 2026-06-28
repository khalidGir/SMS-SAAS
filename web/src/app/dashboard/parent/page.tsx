'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import MetricCard from '@/components/shared/MetricCard';
import StatusBadge from '@/components/shared/StatusBadge';
import Skeleton from '@/components/shared/Skeleton';
import type { ParentStudentData, InvoiceData } from '@/lib/validations/schemas';
import { formatCurrency } from '@/lib/utils';
import { ANIMATIONS } from '@/lib/animations';

export default function ParentDashboard() {
  const { user } = useAuth();
  const { data: students, loading: studentsLoading, request: fetchStudents } = useApi<ParentStudentData[]>();
  const { data: invoices, loading: invoicesLoading, request: fetchInvoices } = useApi<InvoiceData[]>();

  const loadAll = useCallback(() => {
    fetchStudents('GET', '/api/v1/parent/students');
    fetchInvoices('GET', '/api/v1/parent/invoices');
  }, [fetchStudents, fetchInvoices]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const totalOutstanding = invoices?.reduce((s, inv) => s + inv.outstandingAmount, 0) ?? 0;
  const totalPaid = invoices?.reduce((s, inv) => s + inv.paidAmount, 0) ?? 0;
  const loading = studentsLoading || invoicesLoading;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Parent Portal</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome, {user?.name ?? 'Parent'}.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <MetricCard
          label="Total Outstanding"
          value={formatCurrency(totalOutstanding)}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          loading={loading}
          skeletonWidth="w-3/4"
        />
        <MetricCard
          label="Total Paid"
          value={formatCurrency(totalPaid)}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          loading={loading}
          skeletonWidth="w-1/2"
        />
        <MetricCard
          label="Linked Students"
          value={students?.length ?? '—'}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          loading={loading}
          skeletonWidth="w-1/3"
        />
      </div>

      {studentsLoading ? (
        <div className="mt-10 space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className={`rounded-xl border border-gray-200/80 bg-white p-5 ${ANIMATIONS.fadeIn}`}>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="mt-2 h-4 w-32" />
              <Skeleton className="mt-3 h-4 w-full max-w-md" />
            </div>
          ))}
        </div>
      ) : students && students.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Your Students</h2>
          <ul className="space-y-4">
            {students.map((student) => {
              const studentInvoices = invoices?.filter((inv) => inv.studentId === student.id) ?? [];
              const outstanding = studentInvoices.reduce((s, inv) => s + inv.outstandingAmount, 0);
              const enrolment = student.enrollments?.[0];
              return (
                <li key={student.id} className={`rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${ANIMATIONS.fadeIn}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {enrolment?.class?.name ?? 'No class assigned'}
                        {enrolment?.session?.name ? ` · ${enrolment.session.name}` : ''}
                      </p>
                    </div>
                    <StatusBadge status={student.status} variant="lifecycle" />
                  </div>
                  <div className="mt-3 text-sm">
                    <span className="text-gray-600">
                      Invoices: <strong className="text-gray-900">{studentInvoices.length}</strong>
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-sm text-gray-600">
                      Outstanding: <strong className="text-base text-rose-600">{formatCurrency(outstanding)}</strong>
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className={`mt-6 ${ANIMATIONS.fadeIn}`}>
            <Link
              href="/dashboard/parent/invoices"
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View All Invoices
            </Link>
          </div>
        </section>
      ) : (
        <div className={`mt-10 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center ${ANIMATIONS.fadeIn}`}>
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-50">
              <svg className="h-8 w-8 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
              </svg>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-900">No linked students</h3>
          <p className="mt-1 text-sm text-gray-500">No students are linked to your account yet.</p>
        </div>
      )}
    </div>
  );
}
