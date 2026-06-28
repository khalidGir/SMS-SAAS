'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PaymentData } from '@/lib/validations/schemas';
import { formatCurrency } from '@/lib/utils';

interface VoidPaymentModalProps {
  payment: PaymentData;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VoidPaymentModal({ payment, onClose, onSuccess }: VoidPaymentModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText !== payment.receiptNo) return;
    setError(null);
    setSaving(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(`/api/v1/payments/${payment.id}/void`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (res.ok) { onSuccess(); } else { setError(json.error?.message || 'Failed to void payment'); }
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-20">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-red-700">Void Payment</h2>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <div className="mt-4 space-y-4">
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <p className="font-medium">This action is irreversible.</p>
              <p className="mt-1 text-xs">
                Payment <strong>{payment.receiptNo}</strong> of {formatCurrency(payment.amount)} will be voided and the
                invoice balance will be recalculated.
              </p>
            </div>

            {error && (
              <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>
            )}

            <div className="rounded-md bg-gray-50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Receipt</span>
                <span className="font-medium text-gray-900">{payment.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-medium text-gray-900">{formatCurrency(payment.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-900">{payment.paymentMethod}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type <strong>{payment.receiptNo}</strong> to confirm
              </label>
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={payment.receiptNo}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || confirmText !== payment.receiptNo}
              className="rounded-md bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? 'Voiding...' : 'Void Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
