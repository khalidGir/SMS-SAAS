'use client';

import { useState } from 'react';

interface NotificationRuleFormModalProps {
  saving: boolean;
  onSubmit: (data: { name: string; trigger: string; delayDays: number; channels: string[] }) => Promise<void>;
  onClose: () => void;
}

const TRIGGER_OPTIONS = ['OVERDUE_INVOICE', 'PAYMENT_RECEIVED', 'UPCOMING_DUE'] as const;

export default function NotificationRuleFormModal({ saving, onSubmit, onClose }: NotificationRuleFormModalProps) {
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('OVERDUE_INVOICE');
  const [delayDays, setDelayDays] = useState(0);
  const [channels, setChannels] = useState<string[]>(['EMAIL']);

  const toggleChannel = (ch: string) => {
    setChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await onSubmit({ name, trigger, delayDays, channels });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-20">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Add Notification Rule</h2>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Rule Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Overdue Reminder"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Trigger</label>
            <select
              value={trigger}
              onChange={e => setTrigger(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              {TRIGGER_OPTIONS.map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Delay (days)</label>
            <input
              type="number"
              min="0"
              value={delayDays}
              onChange={e => setDelayDays(parseInt(e.target.value) || 0)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Channels</label>
            <div className="mt-1 flex gap-4">
              {['EMAIL', 'SMS'].map(ch => (
                <label key={ch} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={channels.includes(ch)}
                    onChange={() => toggleChannel(ch)}
                    className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  {ch}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving || !name} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
