'use client';

import { use, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const BRAND: Record<string, { name: string; accent: string; bg: string; border: string; button: string; hover: string }> = {
  chapa: {
    name: 'Chapa',
    accent: 'violet',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    button: 'bg-violet-600',
    hover: 'hover:bg-violet-700',
  },
  telebirr: {
    name: 'Telebirr',
    accent: 'emerald',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    button: 'bg-emerald-600',
    hover: 'hover:bg-emerald-700',
  },
  debopay: {
    name: 'DeboPay',
    accent: 'blue',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    button: 'bg-blue-700',
    hover: 'hover:bg-blue-800',
  },
};

export default function MockGatewayPage({ params }: { params: Promise<{ method: string }> }) {
  const { method } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const paymentId = searchParams.get('payment_id');
  const txRef = searchParams.get('tx_ref');
  const amount = searchParams.get('amount');

  const [status, setStatus] = useState<'pending' | 'confirming' | 'success' | 'error'>('pending');
  const brand = BRAND[method] ?? BRAND.chapa;

  const handleComplete = useCallback(async () => {
    if (!paymentId) return;
    setStatus('confirming');

    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(`/api/v1/parent/payments/${paymentId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message ?? 'Confirmation failed');
      }

      setStatus('success');
      setTimeout(() => router.push('/dashboard/parent/invoices'), 1500);
    } catch {
      setStatus('error');
    }
  }, [paymentId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className={`w-full max-w-sm rounded-xl bg-white shadow-xl ${status === 'success' ? 'animate-bounce' : ''}`}>
        {/* Header */}
        <div className={`rounded-t-xl ${brand.bg} border-b ${brand.border} px-6 py-5 text-center`}>
          <div className="mx-auto flex h-14 items-center justify-center">
            <img
              src={method === 'telebirr' ? '/images/telebirr-logo.svg' : method === 'debopay' ? '/images/debopay-logo.svg' : '/images/chapa-logo.svg'}
              alt={brand.name}
              className="h-12 object-contain"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">Secure payment gateway</p>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {status === 'success' ? (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-7 w-7 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-3 text-base font-semibold text-gray-900">Payment Successful!</h3>
              <p className="mt-1 text-sm text-gray-500">Redirecting to your invoices...</p>
            </div>
          ) : (
            <>
              {/* Transaction details */}
              <div className="space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Transaction Ref</span>
                  <span className="font-mono font-medium text-gray-900">{txRef ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Payment ID</span>
                  <span className="font-mono text-xs text-gray-700">{paymentId ? `${paymentId.slice(0, 8)}...` : '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold text-gray-900">ETB {amount ?? '—'}</span>
                </div>
              </div>

              {/* Simulated payment form */}
              <div className={`mt-4 rounded-lg ${brand.bg} ${brand.border} border p-4 text-sm`}>
                <p className="font-medium text-gray-800">Demo Payment Simulation</p>
                <p className="mt-1 text-xs text-gray-500">
                  This is a simulated {brand.name} checkout page. In production, you would be redirected to the real gateway.
                </p>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={handleComplete}
                  disabled={status === 'confirming'}
                  className={`w-full rounded-lg ${brand.button} px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-150 ${brand.hover} hover:shadow-lg disabled:opacity-50`}
                >
                  {status === 'confirming' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing...
                    </span>
                  ) : (
                    `Complete Payment`
                  )}
                </button>

                {status === 'error' && (
                  <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
                    Confirmation failed. Please try again or contact support.
                  </div>
                )}

                {status === 'pending' && (
                  <button
                    onClick={() => router.push('/dashboard/parent/invoices')}
                    className="text-sm text-gray-500 underline hover:text-gray-700"
                  >
                    Cancel and return to invoices
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
