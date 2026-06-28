'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import { formatCurrency, formatDate } from '@/lib/utils';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import RecordPaymentForm from '@/components/modules/finance/RecordPaymentForm';
import Toast from '@/components/shared/Toast';
import type { InvoiceData } from '@/lib/validations/schemas';

export default function InvoicesPage() {
  const { user } = useAuth();
  const { data: invoices, loading, error, request: fetchInvoices } = useApi<InvoiceData[]>();
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadInvoices = useCallback(() => {
    fetchInvoices('GET', '/api/v1/invoices');
  }, [fetchInvoices]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handlePaymentSuccess = () => {
    setToast({ message: 'Payment recorded successfully.', type: 'success' });
    setSelectedInvoice(null);
    loadInvoices();
  };

  const columns: Column<InvoiceData>[] = [
    { key: 'invoiceNo', label: 'Invoice', render: (inv) => <span className="font-medium text-gray-900">{inv.invoiceNo}</span> },
    { key: 'student', label: 'Student', render: (inv) => <span className="text-gray-700">{inv.student.firstName} {inv.student.lastName}</span> },
    { key: 'term', label: 'Term', render: (inv) => <span className="text-gray-700">{inv.term.name}</span> },
    { key: 'totalAmount', label: 'Total', align: 'right', render: (inv) => <span className="text-gray-900">{formatCurrency(inv.totalAmount)}</span> },
    { key: 'paidAmount', label: 'Paid', align: 'right', render: (inv) => <span className="text-gray-700">{formatCurrency(inv.paidAmount)}</span> },
    {
      key: 'outstanding', label: 'Outstanding', align: 'right',
      render: (inv) => (
        <span className={inv.outstandingAmount > 0 ? 'font-medium text-rose-700' : 'font-medium text-emerald-700'}>
          {formatCurrency(inv.outstandingAmount)}
        </span>
      ),
    },
    {
      key: 'paymentStatus', label: 'Status', align: 'center',
      render: (inv) => <StatusBadge status={inv.paymentStatus} variant="financial" />,
    },
    { key: 'dueDate', label: 'Due', align: 'center', render: (inv) => <span className="text-gray-600">{formatDate(inv.dueDate)}</span> },
    {
      key: 'action', label: '', align: 'right',
      render: (inv) =>
        inv.paymentStatus !== 'PAID' && inv.paymentStatus !== 'REFUNDED' ? (
          <button
            onClick={() => setSelectedInvoice(inv)}
            className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
          >
            Record Payment
          </button>
        ) : null,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="mt-1 text-gray-500">Welcome, {user?.name ?? 'Accountant'}.</p>
        </div>
        <button
          onClick={loadInvoices}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <DataTable
        columns={columns}
        rows={invoices ?? []}
        loading={loading}
        emptyMessage="No invoices found for this school."
      />

      {selectedInvoice && (
        <RecordPaymentForm
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
