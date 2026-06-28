'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import type { PaymentData } from '@/lib/validations/schemas';
import { formatCurrency, formatDate } from '@/lib/utils';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import Toast from '@/components/shared/Toast';
import VoidPaymentModal from './VoidPaymentModal';
import ReportGeneratorModal from '@/components/reports/ReportGeneratorModal';

export default function ReportsPage() {
  const { user } = useAuth();
  const { data: payments, loading, error, request: fetchPayments } = useApi<PaymentData[]>();
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showReportGenerator, setShowReportGenerator] = useState(false);

  const loadPayments = useCallback(() => {
    fetchPayments('GET', '/api/v1/payments');
  }, [fetchPayments]);

  useEffect(() => { loadPayments(); }, [loadPayments]);

  const columns: Column<PaymentData>[] = [
    { key: 'receiptNo', label: 'Receipt', render: (p) => <span className="font-medium text-gray-900">{p.receiptNo}</span> },
    { key: 'paymentDate', label: 'Date', render: (p) => <span className="text-gray-700">{formatDate(p.paymentDate)}</span> },
    {
      key: 'student', label: 'Student',
      render: (p) => <span className="text-gray-700">{p.invoice.student.firstName} {p.invoice.student.lastName}</span>,
    },
    { key: 'amount', label: 'Amount', align: 'right', render: (p) => <span className="text-gray-900">{formatCurrency(p.amount)}</span> },
    { key: 'paymentMethod', label: 'Method', align: 'center', render: (p) => <span className="text-gray-700">{p.paymentMethod}</span> },
    {
      key: 'recordedBy', label: 'Recorded By',
      render: (p) => <span className="text-gray-700">{p.recordedBy.firstName} {p.recordedBy.lastName}</span>,
    },
    {
      key: 'status', label: 'Status', align: 'center',
      render: (p) => p.isVoided
        ? <StatusBadge status="VOIDED" variant="financial" />
        : <StatusBadge status="CONFIRMED" variant="financial" />,
    },
  ];

  if (user?.role === 'ADMIN') {
    columns.push({
      key: 'action', label: '', align: 'right',
      render: (p) => !p.isVoided ? (
        <button
          onClick={() => setSelectedPayment(p)}
          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
        >
          Void
        </button>
      ) : null,
    });
  }

  return (
    <div className="p-6">
      {/* Reports Hub header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports Hub</h1>
          <p className="mt-1 text-gray-500">
            Welcome, {user?.name ?? 'Accountant'}. Generate financial reports or browse the payment ledger below.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadPayments}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowReportGenerator(true)}
            className="rounded-md bg-violet-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-violet-700"
          >
            Generate Report
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Payment Ledger section */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Payment Ledger</h2>
        <DataTable
          columns={columns}
          rows={payments ?? []}
          loading={loading}
          emptyMessage="No payments recorded yet."
        />
      </section>

      {selectedPayment && (
        <VoidPaymentModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onSuccess={() => {
            setSelectedPayment(null);
            loadPayments();
            setToast({ message: 'Payment voided successfully.', type: 'success' });
          }}
        />
      )}

      {showReportGenerator && (
        <ReportGeneratorModal onClose={() => setShowReportGenerator(false)} />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
