'use client';

import { useState, useEffect, useCallback } from 'react';
import { ANIMATIONS, TRANSITIONS } from '@/lib/animations';

interface AddSessionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddSessionModal({ onClose, onSuccess }: AddSessionModalProps) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(false);
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
    setSaving(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch('/api/v1/academic/sessions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, startDate, endDate, isActive }),
      });
      const json = await res.json();
      if (res.ok) { onSuccess(); } else { setError(json.error?.message || 'Failed to create session'); }
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-20 ${ANIMATIONS.fadeIn}`}>
      <div className={`mx-4 w-full max-w-md rounded-lg bg-white shadow-xl ${ANIMATIONS.scaleIn}`}>
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">New Session</h2>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          {error && <div className="mb-4 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>}
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">Set as active session</label>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={onClose} disabled={saving}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:opacity-50"
            >Cancel</button>
            <button type="submit" disabled={saving}
              className="rounded-md bg-violet-600 px-6 py-2 text-sm font-medium text-white hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:opacity-50"
            >{saving ? 'Saving...' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
