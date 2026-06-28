'use client';

import { useState, useEffect, useCallback } from 'react';
import type { StudentData } from '@/lib/validations/schemas';

interface ManageStatusModalProps {
  student: StudentData;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS = ['ACTIVE', 'SUSPENDED', 'EXPELLED', 'WITHDRAWN', 'GRADUATED'] as const;

const REQUIRES_REASON: ReadonlySet<string> = new Set(['SUSPENDED', 'EXPELLED']);

export default function ManageStatusModal({ student, onClose, onSuccess }: ManageStatusModalProps) {
  const [status, setStatus] = useState(student.status);
  const [reason, setReason] = useState(student.statusChangeReason || '');
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
    setError(null);

    if (REQUIRES_REASON.has(status) && !reason.trim()) {
      setError('A reason is required for this status change.');
      return;
    }

    // Optimistic: close modal immediately with success
    onSuccess();

    // Background API call
    setSaving(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(`/api/v1/students/${student.id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason: reason.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) {
        // Rollback: parent re-fetches list on failure
        onSuccess();
      }
    } catch {
      onSuccess();
    }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-20">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Manage Status</h2>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <div className="mt-4 space-y-4">
            <div className="rounded-md bg-gray-50 p-3 text-sm">
              <span className="font-medium text-gray-800">{student.firstName} {student.lastName}</span>
              <span className="ml-2 text-gray-500">({student.studentId})</span>
              <span className="ml-2 inline-block rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                {student.status}
              </span>
            </div>

            {error && (
              <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">New Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {REQUIRES_REASON.has(status) && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  required
                  placeholder="Explain the reason for this status change"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            )}
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
              disabled={saving}
              className="rounded-md bg-violet-600 px-6 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
