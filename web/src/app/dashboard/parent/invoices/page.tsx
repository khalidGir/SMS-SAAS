'use client';

import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import PayNowModal from './PayNowModal';
import type { InvoiceWithPayments } from '@/lib/validations/schemas';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ANIMATIONS } from '@/lib/animations';

export default function ParentInvoicesPage() {
  const { user } = useAuth();
  const { data: invoices, loading, request: fetchInvoices } = useApi<InvoiceWithPayments[]>();
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithPayments | null>(null);

  const loadInvoices = useCallback(() => {
    fetchInvoices('GET', '/api/v1/parent/invoices');
  }, [fetchInvoices]);

  useEffect(() => { loadInvoices(); }, [loadInvoices]);

  const columns: Column<InvoiceWithPayments>[] = [
    {
      key: 'student',
      label: 'Student',
      render: (row) => (
        <span className="font-medium text-gray-900">
          {row.student.firstName} {row.student.lastName}
        </span>
      ),
    },
    {
      key: 'invoiceNo',
      label: 'Invoice No',
      render: (row) => (
        <span className="font-mono text-xs text-gray-600">{row.invoiceNo}</span>
      ),
    },
    {
      key: 'term',
      label: 'Term',
      render: (row) => (
        <span className="text-gray-700">{row.term.name}</span>
      ),
    },
    {
      key: 'netAmount',
      label: 'Net Amount',
      align: 'right',
      render: (row) => (
        <span className="font-medium text-gray-900">{formatCurrency(row.netAmount)}</span>
      ),
    },
    {
      key: 'paidAmount',
      label: 'Paid',
      align: 'right',
      render: (row) => (
        <span className="font-medium text-emerald-600">{formatCurrency(row.paidAmount)}</span>
      ),
    },
    {
      key: 'outstandingAmount',
      label: 'Outstanding',
      align: 'right',
      render: (row) => (
        <span className={`font-medium ${row.outstandingAmount > 0 ? 'text-rose-600' : 'text-gray-500'}`}>
          {formatCurrency(row.outstandingAmount)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.paymentStatus} variant="financial" />,
    },
    {
      key: 'action',
      label: '',
      render: (row) =>
        row.paymentStatus !== 'PAID' && row.paymentStatus !== 'REFUNDED' ? (
          <button
            aria-label={`Pay invoice ${row.invoiceNo}`}
            onClick={() => setSelectedInvoice(row)}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-violet-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            Pay Now
          </button>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and pay your outstanding invoices.
        </p>
      </div>

      <div className={ANIMATIONS.fadeIn}>
        <DataTable
          columns={columns}
          rows={invoices ?? []}
          loading={loading}
          emptyMessage="No invoices found for your linked students."
          skeletonRows={5}
        />
      </div>

      {selectedInvoice && (
        <PayNowModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
