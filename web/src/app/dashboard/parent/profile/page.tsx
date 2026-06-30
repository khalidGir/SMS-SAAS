'use client';

import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import Skeleton from '@/components/shared/Skeleton';
import Toast from '@/components/shared/Toast';
import type { ParentStudentData } from '@/lib/validations/schemas';
import { ANIMATIONS } from '@/lib/animations';

export default function ParentProfilePage() {
  const { user } = useAuth();
  const { data: students, loading, request: fetchStudents } = useApi<ParentStudentData[]>();
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadStudents = useCallback(() => {
    fetchStudents('GET', '/api/v1/parent/students');
  }, [fetchStudents]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        const res = await fetch('/api/v1/parent/profile', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = await res.json();
        if (json.status === 'success') {
          setPhone(json.data.phone ?? '');
          setAddress(json.data.address ?? '');
        }
      } catch { /* ignore */ }
      setProfileLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch('/api/v1/parent/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ phone, address }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        setToast({ message: 'Profile updated.', type: 'success' });
        setEditing(false);
      } else {
        setToast({ message: json?.error?.message || 'Failed to save', type: 'error' });
      }
    } catch { setToast({ message: 'Network error', type: 'error' }); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      <p className="mt-1 text-sm text-gray-500">Your account and linked student information.</p>

      <div className={`mt-6 grid gap-6 md:grid-cols-2 ${ANIMATIONS.fadeIn}`}>
        <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Account</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-xs font-medium text-violet-600 hover:text-violet-500"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditing(false); setToast(null); }}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-xs font-medium text-violet-600 hover:text-violet-500 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <span className="text-xs text-gray-400">Name</span>
              <p className="text-sm font-medium text-gray-900">{user?.name ?? '—'}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Email</span>
              <p className="text-sm font-medium text-gray-900">{user?.email ?? '—'}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Phone</span>
              {editing ? (
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900">{phone || '—'}</p>
              )}
            </div>
            <div>
              <span className="text-xs text-gray-400">Address</span>
              {editing ? (
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900">{address || '—'}</p>
              )}
            </div>
            <div>
              <span className="text-xs text-gray-400">Role</span>
              <p className="text-sm font-medium text-gray-900">Parent</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Linked Students</h2>
          <div className="mt-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : students && students.length > 0 ? (
              <ul className="space-y-3">
                {students.map((s) => (
                  <li key={s.id} className="rounded-lg bg-gray-50 px-3 py-2.5">
                    <p className="text-sm font-medium text-gray-900">{s.firstName} {s.lastName}</p>
                    <p className="text-xs text-gray-500">ID: {s.studentId}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No linked students.</p>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
