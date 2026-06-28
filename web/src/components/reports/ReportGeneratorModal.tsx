'use client';

import { useState, useCallback, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { formatCurrency, formatDate } from '@/lib/utils';
import { downloadCsv, printReport } from '@/lib/utils/export';
import Skeleton from '@/components/shared/Skeleton';

type ReportType = 'invoice-aging' | 'payment-ledger' | 'student-fee-status';

const REPORT_OPTIONS: { value: ReportType; label: string; desc: string }[] = [
  { value: 'invoice-aging', label: 'Invoice Aging', desc: 'Overdue and outstanding invoices grouped by status' },
  { value: 'payment-ledger', label: 'Payment Ledger', desc: 'All recorded payments with method and recorder details' },
  { value: 'student-fee-status', label: 'Student Fee Status', desc: 'Per-student balance summary and invoice count' },
];

interface InvoiceAgingRow {
  invoiceNo: string; studentName: string; studentId: string;
  netAmount: number; paidAmount: number; outstandingAmount: number;
  dueDate: string; daysOverdue: number;
  paymentStatus: string; temporalStatus: string;
}

interface PaymentLedgerRow {
  id: string; receiptNo: string; amount: number;
  paymentMethod: string; paymentDate: string;
  status: string; isVoided: boolean;
  invoice: { invoiceNo: string } | null;
  student: { firstName: string; lastName: string } | null;
  recordedBy: { firstName: string; lastName: string } | null;
}

interface StudentFeeRow {
  studentId: string; studentName: string; status: string;
  className: string; totalInvoiced: number; totalPaid: number;
  totalOutstanding: number; invoiceCount: number; unpaidCount: number;
}

export default function ReportGeneratorModal({ onClose }: { onClose: () => void }) {
  const [reportType, setReportType] = useState<ReportType>('invoice-aging');
  const [statusFilter, setStatusFilter] = useState('');
  const { data, loading, error, request } = useApi<any>();

  const loadReport = useCallback(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    const qs = params.toString();
    request('GET', `/api/v1/reports/${reportType}${qs ? `?${qs}` : ''}`);
  }, [reportType, statusFilter, request]);

  useEffect(() => { loadReport(); }, [loadReport]);

  const handleDownloadCsv = () => {
    if (!data) return;
    switch (reportType) {
      case 'invoice-aging': {
        const rows: InvoiceAgingRow[] = data.rows ?? [];
        downloadCsv(
          `Invoice_Aging_${new Date().toISOString().slice(0, 10)}`,
          ['Invoice No', 'Student', 'Student ID', 'Net Amount', 'Paid', 'Outstanding', 'Due Date', 'Days Overdue', 'Status'],
          rows.map(r => [r.invoiceNo, r.studentName, r.studentId, String(r.netAmount), String(r.paidAmount), String(r.outstandingAmount), r.dueDate, String(r.daysOverdue), r.paymentStatus]),
        );
        break;
      }
      case 'payment-ledger': {
        const rows: PaymentLedgerRow[] = data.rows ?? [];
        downloadCsv(
          `Payment_Ledger_${new Date().toISOString().slice(0, 10)}`,
          ['Receipt No', 'Date', 'Student', 'Amount', 'Method', 'Recorded By', 'Status'],
          rows.map(r => [r.receiptNo, r.paymentDate, r.student ? `${r.student.firstName} ${r.student.lastName}` : '', String(r.amount), r.paymentMethod, r.recordedBy ? `${r.recordedBy.firstName} ${r.recordedBy.lastName}` : '', r.isVoided ? 'VOIDED' : r.status]),
        );
        break;
      }
      case 'student-fee-status': {
        const rows: StudentFeeRow[] = data.rows ?? [];
        downloadCsv(
          `Student_Fee_Status_${new Date().toISOString().slice(0, 10)}`,
          ['Student ID', 'Name', 'Status', 'Class', 'Total Invoiced', 'Total Paid', 'Outstanding', 'Invoices', 'Unpaid'],
          rows.map(r => [r.studentId, r.studentName, r.status, r.className, String(r.totalInvoiced), String(r.totalPaid), String(r.totalOutstanding), String(r.invoiceCount), String(r.unpaidCount)]),
        );
        break;
      }
    }
  };

  const handlePrint = () => {
    const titles: Record<ReportType, string> = {
      'invoice-aging': 'Invoice Aging Report',
      'payment-ledger': 'Payment Ledger Report',
      'student-fee-status': 'Student Fee Status Report',
    };
    const titleEl = document.getElementById('report-print-title');
    if (titleEl) titleEl.textContent = titles[reportType];
    const metaEl = document.getElementById('report-print-meta');
    if (metaEl) metaEl.textContent = `Generated ${new Date().toLocaleDateString()} | ${REPORT_OPTIONS.find(o => o.value === reportType)?.desc ?? ''}`;
    const container = document.getElementById('report-print-content');
    if (container) {
      container.innerHTML = document.getElementById('report-preview')?.innerHTML ?? '';
      // wait for DOM update then print
      requestAnimationFrame(() => { printReport(titles[reportType]); });
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const statusFilters = reportType === 'invoice-aging'
    ? [{ value: '', label: 'All' }, { value: 'CURRENT', label: 'Current' }, { value: 'OVERDUE', label: 'Overdue' }, { value: 'PAID', label: 'Paid' }, { value: 'PARTIALLY_PAID', label: 'Partial' }]
    : reportType === 'student-fee-status'
    ? [{ value: '', label: 'All' }, { value: 'ACTIVE', label: 'Active' }, { value: 'PENDING', label: 'Pending' }, { value: 'SUSPENDED', label: 'Suspended' }]
    : [];

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="space-y-2 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      );
    }

    if (error) {
      return <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>;
    }

    if (!data) return null;

    switch (reportType) {
      case 'invoice-aging':
        return renderInvoiceAging(data);
      case 'payment-ledger':
        return renderPaymentLedger(data);
      case 'student-fee-status':
        return renderStudentFeeStatus(data);
    }
  };

  function renderInvoiceAging(d: { rows?: InvoiceAgingRow[]; totals?: { netAmount: number; paidAmount: number; outstandingAmount: number } }) {
    const rows = d.rows ?? [];
    const totals = d.totals ?? { netAmount: 0, paidAmount: 0, outstandingAmount: 0 };
    if (rows.length === 0) return <div className="p-4 text-sm text-gray-500">No invoices match the current filter.</div>;
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-600">Invoice</th>
              <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-600">Student</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-semibold text-gray-600">Net</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-semibold text-gray-600">Paid</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-semibold text-gray-600">Outstanding</th>
              <th className="whitespace-nowrap px-3 py-2 text-center font-semibold text-gray-600">Due</th>
              <th className="whitespace-nowrap px-3 py-2 text-center font-semibold text-gray-600">Days</th>
              <th className="whitespace-nowrap px-3 py-2 text-center font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r, i) => (
              <tr key={r.invoiceNo} className={`hover:bg-gray-50 ${r.temporalStatus === 'OVERDUE' ? 'bg-red-50/40' : r.paymentStatus === 'PAID' ? 'bg-emerald-50/40' : ''}`}>
                <td className="truncate max-w-[100px] px-3 py-2 font-medium text-gray-900">{r.invoiceNo}</td>
                <td className="truncate max-w-[140px] px-3 py-2 text-gray-700">{r.studentName}</td>
                <td className="px-3 py-2 text-right text-gray-900">{formatCurrency(r.netAmount)}</td>
                <td className="px-3 py-2 text-right text-gray-700">{formatCurrency(r.paidAmount)}</td>
                <td className={`px-3 py-2 text-right font-medium ${r.outstandingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatCurrency(r.outstandingAmount)}</td>
                <td className="px-3 py-2 text-center text-gray-700">{formatDate(r.dueDate)}</td>
                <td className={`px-3 py-2 text-center font-medium ${r.daysOverdue > 0 ? 'text-red-600' : 'text-gray-500'}`}>{r.daysOverdue > 0 ? `${r.daysOverdue}d` : '—'}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold
                    ${r.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : ''}
                    ${r.paymentStatus === 'PARTIALLY_PAID' ? 'bg-amber-100 text-amber-700' : ''}
                    ${r.paymentStatus === 'UNPAID' ? 'bg-red-100 text-red-700' : ''}
                    ${r.paymentStatus === 'PENDING' ? 'bg-gray-100 text-gray-600' : ''}
                  `}>{r.paymentStatus}</span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 font-medium">
            <tr>
              <td colSpan={2} className="px-3 py-2 text-gray-700">Totals</td>
              <td className="px-3 py-2 text-right text-gray-900">{formatCurrency(totals.netAmount)}</td>
              <td className="px-3 py-2 text-right text-gray-900">{formatCurrency(totals.paidAmount)}</td>
              <td className="px-3 py-2 text-right text-rose-600">{formatCurrency(totals.outstandingAmount)}</td>
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  }

  function renderPaymentLedger(d: { rows?: PaymentLedgerRow[]; totalAmount?: number }) {
    const rows = d.rows ?? [];
    if (rows.length === 0) return <div className="p-4 text-sm text-gray-500">No payments recorded yet.</div>;
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-600">Receipt</th>
              <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-600">Date</th>
              <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-600">Student</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-semibold text-gray-600">Amount</th>
              <th className="whitespace-nowrap px-3 py-2 text-center font-semibold text-gray-600">Method</th>
              <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-600">Recorded By</th>
              <th className="whitespace-nowrap px-3 py-2 text-center font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.id} className={`hover:bg-gray-50 ${r.isVoided ? 'bg-red-50/40 opacity-60' : ''}`}>
                <td className="px-3 py-2 font-medium text-gray-900">{r.receiptNo}</td>
                <td className="px-3 py-2 text-gray-700">{formatDate(r.paymentDate)}</td>
                <td className="px-3 py-2 text-gray-700">{r.student ? `${r.student.firstName} ${r.student.lastName}` : '—'}</td>
                <td className="px-3 py-2 text-right text-gray-900">{formatCurrency(r.amount)}</td>
                <td className="px-3 py-2 text-center text-gray-700">{r.paymentMethod}</td>
                <td className="px-3 py-2 text-gray-700">{r.recordedBy ? `${r.recordedBy.firstName} ${r.recordedBy.lastName}` : '—'}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.isVoided ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {r.isVoided ? 'VOIDED' : 'CONFIRMED'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderStudentFeeStatus(d: { rows?: StudentFeeRow[] }) {
    const rows = d.rows ?? [];
    if (rows.length === 0) return <div className="p-4 text-sm text-gray-500">No students match the current filter.</div>;
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-600">Student ID</th>
              <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-600">Name</th>
              <th className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-600">Class</th>
              <th className="whitespace-nowrap px-3 py-2 text-center font-semibold text-gray-600">Status</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-semibold text-gray-600">Invoiced</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-semibold text-gray-600">Paid</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-semibold text-gray-600">Outstanding</th>
              <th className="whitespace-nowrap px-3 py-2 text-center font-semibold text-gray-600">Invoices</th>
              <th className="whitespace-nowrap px-3 py-2 text-center font-semibold text-gray-600">Unpaid</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.studentId} className={`hover:bg-gray-50 ${r.totalOutstanding > 0 ? 'bg-amber-50/30' : 'bg-emerald-50/30'}`}>
                <td className="px-3 py-2 font-mono text-xs text-gray-700">{r.studentId}</td>
                <td className="px-3 py-2 font-medium text-gray-900">{r.studentName}</td>
                <td className="px-3 py-2 text-gray-700">{r.className || '—'}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold
                    ${r.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : ''}
                    ${r.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : ''}
                    ${r.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' : ''}
                  `}>{r.status}</span>
                </td>
                <td className="px-3 py-2 text-right text-gray-900">{formatCurrency(r.totalInvoiced)}</td>
                <td className="px-3 py-2 text-right text-emerald-600">{formatCurrency(r.totalPaid)}</td>
                <td className={`px-3 py-2 text-right font-medium ${r.totalOutstanding > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatCurrency(r.totalOutstanding)}</td>
                <td className="px-3 py-2 text-center text-gray-700">{r.invoiceCount}</td>
                <td className="px-3 py-2 text-center">{r.unpaidCount > 0 ? <span className="font-medium text-rose-600">{r.unpaidCount}</span> : <span className="text-gray-400">0</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      {/* Hidden print surface */}
      <div className="hidden">
        <div id="report-print-content">
          <h1 id="report-print-title" className="text-lg font-bold">Report</h1>
          <p id="report-print-meta" className="report-meta"></p>
        </div>
      </div>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-xl bg-white shadow-xl" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Generate Report</h2>
            <button aria-label="Close" onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 border-b border-gray-100 px-6 py-4">
            <div className="flex flex-wrap gap-2">
              {REPORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setReportType(opt.value)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                    reportType === opt.value
                      ? 'border-violet-500 bg-violet-50 text-violet-700 ring-1 ring-violet-500/20'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {statusFilters.length > 0 && (
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
              >
                {statusFilters.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            )}
          </div>

          {/* Preview */}
          <div id="report-preview" className="flex-1 overflow-auto px-6 py-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400">
              {REPORT_OPTIONS.find(o => o.value === reportType)?.desc}
            </p>
            {renderPreview()}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={handleDownloadCsv}
              disabled={loading || !data}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Download CSV
            </button>
            <button
              onClick={handlePrint}
              disabled={loading || !data}
              className="rounded-lg bg-violet-600 px-6 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-violet-700 disabled:opacity-50"
            >
              Print / PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
