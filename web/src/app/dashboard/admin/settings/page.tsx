'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Toast from '@/components/shared/Toast';

interface SchoolSettings {
  schoolName: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  timezone: string;
  receiptPrefix: string;
  receiptFooter: string;
  minPartialPaymentAllowed: number;
  logoDataUrl: string | null;
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/v1/settings/school');
        const json = await res.json();
        if (json.status === 'success') setSettings(json.data);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, []);

  const update = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch('/api/v1/settings/school', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.status === 'success') {
        setToast({ message: 'Settings saved.', type: 'success' });
      } else {
        setToast({ message: json?.error?.message || 'Failed to save', type: 'error' });
      }
    } catch {
      setToast({ message: 'Network error', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSettings(prev => prev ? { ...prev, logoDataUrl: reader.result as string } : prev);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return <div className="p-6"><div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" /></div>;
  }

  if (!settings) {
    return <div className="p-6 text-gray-500">Unable to load settings.</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">School Settings</h1>
          <p className="mt-1 text-gray-500">Manage your school configuration.</p>
        </div>
        <button
          onClick={update}
          disabled={saving}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* School Information */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">School Information</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600">School Name</label>
              <input type="text" value={settings.schoolName} onChange={e => setSettings({ ...settings, schoolName: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Address</label>
              <input type="text" value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">Phone</label>
                <input type="text" value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Email</label>
                <input type="email" value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
            </div>
          </div>
        </section>

        {/* Branding */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Branding</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600">School Logo</label>
              {settings.logoDataUrl && (
                <img src={settings.logoDataUrl} alt="Logo" className="mt-1 h-16 w-16 rounded-lg border object-contain" />
              )}
              <input type="file" accept="image/png,image/jpeg" onChange={handleLogo}
                className="mt-2 block w-full text-sm text-gray-500 file:mr-3 file:rounded file:border-0 file:bg-violet-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-violet-700" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Receipt Prefix</label>
              <input type="text" value={settings.receiptPrefix} onChange={e => setSettings({ ...settings, receiptPrefix: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Receipt Footer</label>
              <textarea value={settings.receiptFooter} onChange={e => setSettings({ ...settings, receiptFooter: e.target.value })} rows={2}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
            </div>
          </div>
        </section>

        {/* Payment Configuration */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Payment Configuration</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600">Currency</label>
              <select value={settings.currency} onChange={e => setSettings({ ...settings, currency: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500">
                <option value="ETB">ETB (Birr)</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Minimum Partial Payment (ETB)</label>
              <input type="number" value={settings.minPartialPaymentAllowed} onChange={e => setSettings({ ...settings, minPartialPaymentAllowed: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
            </div>
          </div>
        </section>

        {/* Locale */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Locale</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600">Timezone</label>
              <select value={settings.timezone} onChange={e => setSettings({ ...settings, timezone: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500">
                <option value="Africa/Addis_Ababa">Africa/Addis Ababa (UTC+3)</option>
                <option value="Africa/Nairobi">Africa/Nairobi (UTC+3)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </section>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
