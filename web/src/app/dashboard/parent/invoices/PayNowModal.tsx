'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import type { InvoiceWithPayments, ParentPaymentInitResult } from '@/lib/validations/schemas';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ANIMATIONS } from '@/lib/animations';
import Toast from '@/components/shared/Toast';

const CONVENIENCE_FEE_PERCENT = 2.5;
const CONVENIENCE_FEE_CAP = 500;

type GatewayType = 'CHAPA' | 'TELEBIRR' | null;
type PaymentStep = 'SELECT_METHOD' | 'PROCESSING' | 'ERROR';

interface PayNowModalProps {
  invoice: InvoiceWithPayments;
  onClose: () => void;
}

export default function PayNowModal({ invoice, onClose }: PayNowModalProps) {
  const { request: initPayment, loading: initiating } = useApi<ParentPaymentInitResult>();

  const [selectedMethod, setSelectedMethod] = useState<GatewayType>(null);
  const [step, setStep] = useState<PaymentStep>('SELECT_METHOD');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const amount = invoice.outstandingAmount;
  const rawFee = Math.min(amount * (CONVENIENCE_FEE_PERCENT / 100), CONVENIENCE_FEE_CAP);
  const totalCharged = amount + rawFee;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && step === 'SELECT_METHOD') onClose();
  }, [onClose, step]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleConfirmPayment = async () => {
    if (!selectedMethod) return;
    setStep('PROCESSING');

    const result = await initPayment('POST', '/api/v1/parent/payments', {
      invoiceId: invoice.id,
      amount,
      paymentMethod: selectedMethod,
    });

    if (!result) {
      setStep('ERROR');
      setToast({ message: 'Payment engine initialization failed. Please try again.', type: 'error' });
      return;
    }

    window.location.href = result.gateway.checkoutUrl;
  };

  const handleClose = () => {
    if (step === 'SELECT_METHOD') onClose();
  };

  const renderMethodSelector = () => (
    <>
      <div className="px-6 pb-2 pt-5">
        <div className="mb-5 space-y-2 rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Invoice</span>
            <span className="font-mono text-sm font-medium text-gray-900">{invoice.invoiceNo}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Student</span>
            <span className="font-medium text-gray-900">{invoice.student.firstName} {invoice.student.lastName}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Term</span>
            <span className="text-gray-900">{invoice.term.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Due Date</span>
            <span className="text-gray-900">{formatDate(invoice.dueDate)}</span>
          </div>
        </div>

        <div className="space-y-2 border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Net Amount</span>
            <span className="font-medium text-gray-900">{formatCurrency(invoice.netAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Already Paid</span>
            <span className="font-medium text-emerald-600">{formatCurrency(invoice.paidAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold">
            <span className="text-gray-900">Outstanding Balance</span>
            <span className="text-rose-600">{formatCurrency(amount)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Convenience Fee ({CONVENIENCE_FEE_PERCENT}%)</span>
            <span className="text-gray-700">{formatCurrency(rawFee)}</span>
          </div>
          {rawFee >= CONVENIENCE_FEE_CAP && (
            <p className="text-xs text-gray-400">Capped at {formatCurrency(CONVENIENCE_FEE_CAP)}</p>
          )}
          <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-base font-bold">
            <span className="text-gray-900">Total Charged</span>
            <span className="text-violet-700">{formatCurrency(totalCharged)}</span>
          </div>
        </div>

        <p className="mt-4 text-sm font-semibold text-gray-700">Select payment method</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            onClick={() => setSelectedMethod('CHAPA')}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-5 text-sm font-medium transition-all duration-150 ${
              selectedMethod === 'CHAPA'
                ? 'border-violet-500 bg-violet-50 text-violet-700 ring-1 ring-violet-500/20'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden ${
              selectedMethod === 'CHAPA' ? 'bg-white' : 'bg-gray-100'
            }`}>
              <img src="/images/chapa-logo.svg" alt="Chapa" className="h-8 w-8 object-contain" />
            </div>
            <span>Chapa</span>
            <span className="text-xs text-gray-400">Pay with card or mobile</span>
          </button>

          <button
            onClick={() => setSelectedMethod('TELEBIRR')}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-5 text-sm font-medium transition-all duration-150 ${
              selectedMethod === 'TELEBIRR'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden ${
              selectedMethod === 'TELEBIRR' ? 'bg-blue-50' : 'bg-gray-100'
            }`}>
              <img src="/images/telebirr-logo.svg" alt="Telebirr" className="h-8 w-8 object-contain" />
            </div>
            <span>Telebirr</span>
            <span className="text-xs text-gray-400">Pay with mobile money</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
        <button
          onClick={handleClose}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmPayment}
          disabled={!selectedMethod || initiating}
          className="rounded-lg bg-violet-600 px-8 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-150 hover:bg-violet-700 hover:shadow-lg disabled:opacity-50"
        >
          {initiating ? 'Initiating...' : 'Confirm Payment'}
        </button>
      </div>
    </>
  );

  const renderProcessing = () => (
    <div className="flex flex-col items-center justify-center px-6 py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
      <p className="mt-4 text-sm font-medium text-gray-700">Connecting to payment provider...</p>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <svg className="h-8 w-8 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">Initialization Failed</h3>
      <p className="mt-1 text-sm text-gray-500">Payment engine initialization failed. Please try again.</p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleClose}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => { setSelectedMethod(null); setStep('SELECT_METHOD'); }}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  const renderBody = () => {
    switch (step) {
      case 'SELECT_METHOD': return renderMethodSelector();
      case 'PROCESSING':     return renderProcessing();
      case 'ERROR':          return renderError();
      default:               return null;
    }
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pay invoice"
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 ${ANIMATIONS.fadeIn}`}
        onClick={step === 'SELECT_METHOD' ? handleClose : undefined}
      >
        <div
          className="w-full max-w-md rounded-xl bg-white shadow-xl ${ANIMATIONS.scaleIn}"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Pay Invoice</h2>
            {step === 'SELECT_METHOD' && (
              <button
                aria-label="Close"
                onClick={handleClose}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {renderBody()}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
