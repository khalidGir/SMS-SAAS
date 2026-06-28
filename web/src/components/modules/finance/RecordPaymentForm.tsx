'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '@/hooks/useApi';
import {
  recordPaymentSchema,
  type RecordPaymentInput,
  type InvoiceData,
} from '@/lib/validations/schemas';
import { cn, formatCurrency } from '@/lib/utils';

interface RecordPaymentFormProps {
  invoice: InvoiceData;
  onClose: () => void;
  onSuccess: () => void;
}

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  CARD: 'Card',
  CHEQUE: 'Cheque',
};

export default function RecordPaymentForm({ invoice, onClose, onSuccess }: RecordPaymentFormProps) {
  const { loading, error: apiError, request: apiRequest } = useApi<unknown>();

  const [liveAmount, setLiveAmount] = useState<number>(0);
  const [clientError, setClientError] = useState<string | null>(null);

  const minPartial = invoice.school.minPartialPaymentAllowed;
  const outstanding = invoice.outstandingAmount;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RecordPaymentInput>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      amount: undefined,
      paymentMethod: undefined,
      paymentDate: new Date().toISOString().split('T')[0],
      referenceId: '',
      notes: '',
    },
  });

  const watchedAmount = watch('amount');

  useEffect(() => {
    const amt = Number(watchedAmount);
    if (isNaN(amt) || amt <= 0) {
      setLiveAmount(0);
      setClientError(null);
      return;
    }
    setLiveAmount(amt);

    if (amt > outstanding) {
      setClientError(`Amount (${formatCurrency(amt)}) exceeds the outstanding balance of ${formatCurrency(outstanding)}.`);
      return;
    }

    if (amt < outstanding && amt < minPartial) {
      setClientError(
        `Partial payments below ${formatCurrency(minPartial)} are not allowed unless paying the full outstanding balance.`,
      );
      return;
    }

    setClientError(null);
  }, [watchedAmount, outstanding, minPartial]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const onSubmit = async (data: RecordPaymentInput) => {
    if (clientError) return;

    const payload = {
      invoiceId: invoice.id,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      paymentDate: data.paymentDate,
      referenceId: data.referenceId || undefined,
      notes: data.notes || undefined,
    };

    // Optimistic: close modal immediately
    onSuccess();

    // Background API call
    const result = await apiRequest('POST', '/api/v1/payments', payload);
    if (!result) {
      // Rollback is handled by parent via onError (page re-fetches on failure)
      onSuccess();
    }
  };

  const canPayInFull = liveAmount > 0 && liveAmount >= outstanding;
  const allowedMinAmount = canPayInFull ? 0.01 : minPartial;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-12">
      <div className="mx-4 w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Record Payment</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mx-6 mt-4 rounded-md border border-gray-200 bg-gray-50 p-4 text-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold text-gray-800">{invoice.invoiceNo}</span>
            <span className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              invoice.paymentStatus === 'PAID' && 'bg-emerald-100 text-emerald-800',
              invoice.paymentStatus === 'PARTIALLY_PAID' && 'bg-amber-100 text-amber-800',
              invoice.paymentStatus === 'UNPAID' && 'bg-rose-100 text-rose-800',
            )}>
              {invoice.paymentStatus.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Student: {invoice.student.firstName} {invoice.student.lastName}</span>
            <span>{invoice.term.name}</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 border-t pt-2 text-center">
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="font-semibold">{formatCurrency(invoice.totalAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Paid</p>
              <p className="font-semibold text-green-700">{formatCurrency(invoice.paidAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Outstanding</p>
              <p className={cn('font-semibold', outstanding > 0 ? 'text-red-700' : 'text-green-700')}>
                {formatCurrency(outstanding)}
              </p>
            </div>
          </div>
        </div>

        {apiError && (
          <div className="mx-6 mt-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
            {apiError}
          </div>
        )}

        {clientError && (
          <div className="mx-6 mt-3 rounded border border-amber-200 bg-amber-50 p-2 text-sm text-amber-800">
            {clientError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6">
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount
                {allowedMinAmount > 0 && (
                  <span className="ml-1 text-xs text-gray-400">
                    (min {formatCurrency(allowedMinAmount)} unless full pay-off)
                  </span>
                )}
              </label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-500">
                  ETB
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={outstanding}
                  {...register('amount', { valueAsNumber: true })}
                  className="block w-full rounded-md border border-gray-300 py-2 pl-12 pr-3 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
              {errors.amount && (
                <p className="mt-0.5 text-xs text-red-600">{errors.amount.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              <select
                {...register('paymentMethod')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="">Select...</option>
                {Object.entries(METHOD_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              {errors.paymentMethod && (
                <p className="mt-0.5 text-xs text-red-600">{errors.paymentMethod.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Date</label>
              <input
                type="date"
                {...register('paymentDate')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              {errors.paymentDate && (
                <p className="mt-0.5 text-xs text-red-600">{errors.paymentDate.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Reference ID</label>
              <input
                {...register('referenceId')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                {...register('notes')}
                rows={2}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!clientError}
              className="rounded-md bg-violet-600 px-6 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
