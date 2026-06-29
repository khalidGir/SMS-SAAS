'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import type { InvoiceData } from '@/lib/validations/schemas';

interface StudentLookup {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
}

export default function CashierPage() {
  const { user } = useAuth();
  const { data: invoices, loading, request: fetchInvoices } = useApi<InvoiceData[]>();
  const [search, setSearch] = useState('');
  const [foundStudents, setFoundStudents] = useState<StudentLookup[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [recording, setRecording] = useState(false);
  const [receipt, setReceipt] = useState<{ receiptNo: string; amount: number; student: string; invoiceNo: string } | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadStudents = useCallback(async () => {
    if (!search.trim()) { setFoundStudents([]); return; }
    try {
      const res = await fetch('/api/v1/students');
      const json = await res.json();
      if (json.status === 'success') {
        const all: StudentLookup[] = json.data;
        const q = search.toLowerCase();
        setFoundStudents(all.filter(s => s.studentId.toLowerCase().includes(q) || `${s.firstName} ${s.lastName}`.toLowerCase().includes(q)));
      }
    } catch { /* ignore */ }
  }, [search]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  useEffect(() => {
    if (selectedStudentId) {
      fetchInvoices('GET', `/api/v1/invoices?studentId=${selectedStudentId}`);
    } else {
      fetchInvoices('GET', '/api/v1/invoices');
    }
  }, [selectedStudentId, fetchInvoices]);

  const recordPayment = async (invoiceId: string) => {
    if (!paymentAmount || !paymentMethod) return;
    setRecording(true);
    setMessage(null);
    try {
      const res = await fetch('/api/v1/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, amount: parseFloat(paymentAmount), paymentMethod }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        const inv = invoices?.find(i => i.id === invoiceId);
        setReceipt({
          receiptNo: json.data.receiptNo,
          amount: json.data.amount,
          student: inv ? `${inv.student?.firstName} ${inv.student?.lastName}` : '',
          invoiceNo: inv?.invoiceNo ?? '',
        });
        setPaymentAmount('');
        fetchInvoices('GET', `/api/v1/invoices?studentId=${selectedStudentId}`);
      } else {
        setMessage({ text: json?.error?.message || 'Payment failed', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network error', type: 'error' });
    } finally {
      setRecording(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">Record Payment</h1>
      <p className="mt-1 text-gray-500">Welcome, {user?.name ?? 'Cashier'}.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Student search */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Find Student</h2>
          <input
            type="text"
            placeholder="Search by ID or name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <ul className="mt-2 max-h-60 overflow-y-auto space-y-1">
            {foundStudents.map(s => (
              <li key={s.id}>
                <button
                  onClick={() => { setSelectedStudentId(s.id); setSearch(`${s.firstName} ${s.lastName}`); setFoundStudents([]); }}
                  className={`w-full rounded px-2 py-1.5 text-left text-sm hover:bg-violet-50 ${selectedStudentId === s.id ? 'bg-violet-100 font-medium' : ''}`}
                >
                  {s.studentId} — {s.firstName} {s.lastName}
                </button>
              </li>
            ))}
            {search && !foundStudents.length && <li className="px-2 py-1.5 text-sm text-gray-400">No results</li>}
          </ul>
        </div>

        {/* Center: Invoices */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900">Outstanding Invoices</h2>

          {message && (
            <div className={`mt-3 rounded px-3 py-2 text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {message.text}
            </div>
          )}

          {receipt && (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm">
              <p className="font-semibold text-emerald-800">Receipt: {receipt.receiptNo}</p>
              <p className="text-emerald-700">{receipt.student} — {receipt.invoiceNo}</p>
              <p className="text-lg font-bold text-emerald-800">ETB {receipt.amount.toLocaleString()}</p>
              <button onClick={() => setReceipt(null)} className="mt-2 text-xs text-emerald-600 underline">Close</button>
            </div>
          )}

          {loading ? (
            <div className="mt-3 space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />)}
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {(invoices ?? []).filter(i => i.outstandingAmount > 0).map(inv => (
                <div key={inv.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{inv.invoiceNo} — {inv.student?.firstName} {inv.student?.lastName}</p>
                    <p className="text-xs text-gray-500">Due: {inv.dueDate} | Outstanding: ETB {inv.outstandingAmount.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={paymentAmount}
                      onChange={e => setPaymentAmount(e.target.value)}
                      className="w-28 rounded border border-gray-300 px-2 py-1 text-sm focus:border-violet-500 focus:outline-none"
                    />
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="rounded border border-gray-300 px-2 py-1 text-sm"
                    >
                      <option value="CASH">Cash</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="CARD">Card</option>
                    </select>
                    <button
                      onClick={() => recordPayment(inv.id)}
                      disabled={recording || !paymentAmount}
                      className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                    >
                      {recording ? '...' : 'Pay'}
                    </button>
                  </div>
                </div>
              ))}
              {(!invoices || invoices.filter(i => i.outstandingAmount > 0).length === 0) && (
                <p className="py-4 text-center text-sm text-gray-400">No outstanding invoices</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
