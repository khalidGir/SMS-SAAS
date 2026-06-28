'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import type { AcademicSessionData } from '@/lib/validations/schemas';
import { formatDate } from '@/lib/utils';
import Toast from '@/components/shared/Toast';
import AddSessionModal from './AddSessionModal';
import AddTermModal from './AddTermModal';
import EmptyState from '@/components/shared/EmptyState';

export default function SessionsPage() {
  const { user } = useAuth();
  const { data: sessions, loading, request: fetchSessions } = useApi<AcademicSessionData[]>();
  const [selectedSession, setSelectedSession] = useState<AcademicSessionData | null>(null);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddTerm, setShowAddTerm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadSessions = useCallback(() => {
    fetchSessions('GET', '/api/v1/academic/sessions');
  }, [fetchSessions]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const handleActivate = async (sessionId: string) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(`/api/v1/academic/sessions/${sessionId}/activate`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (res.ok) {
        setToast({ message: 'Session activated.', type: 'success' });
        loadSessions();
      } else {
        setToast({ message: json.error?.message || 'Failed to activate', type: 'error' });
      }
    } catch {
      setToast({ message: 'Network error', type: 'error' });
    }
  };

  useEffect(() => {
    if (sessions && sessions.length > 0 && !selectedSession) {
      setSelectedSession(sessions[0]);
    }
  }, [sessions, selectedSession]);

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Left panel — Session list */}
      <div className="w-full flex-shrink-0 border-b bg-gray-50 p-4 lg:w-80 lg:border-b-0 lg:border-r">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Sessions</h2>
          <button
            onClick={() => setShowAddSession(true)}
            className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
          >
            + New
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
          </div>
        )}

        {!loading && sessions && (
          <ul className="space-y-2">
            {sessions.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => setSelectedSession(s)}
                  className={`w-full rounded-md border px-3 py-2.5 text-left text-sm transition-colors ${
                    selectedSession?.id === s.id
                      ? 'border-violet-300 bg-violet-50 text-violet-800'
                      : 'border-transparent bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{s.name}</div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    {formatDate(s.startDate)} – {formatDate(s.endDate)}
                  </div>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    s.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {s.status}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {!loading && sessions && sessions.length === 0 && (
          <EmptyState
            title="No sessions yet"
            description="Create your first academic session."
            action={{ label: '+ New Session', onClick: () => setShowAddSession(true) }}
          />
        )}
      </div>

      {/* Right panel — Session detail + terms */}
      <div className="flex-1 p-6">
        {selectedSession ? (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedSession.name}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {formatDate(selectedSession.startDate)} – {formatDate(selectedSession.endDate)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {selectedSession.status !== 'Active' && (
                  <button
                    onClick={() => handleActivate(selectedSession.id)}
                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    Activate
                  </button>
                )}
                <button
                  onClick={() => setShowAddTerm(true)}
                  className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
                >
                  + Add Term
                </button>
              </div>
            </div>

            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Terms</h3>
            {selectedSession.terms && selectedSession.terms.length > 0 ? (
              <div className="space-y-2">
                {selectedSession.terms.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="font-medium text-gray-900">{t.name}</div>
                    <div className="mt-0.5 text-sm text-gray-500">
                      {formatDate(t.startDate)} – {formatDate(t.endDate)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No terms defined for this session.</p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400">
            Select a session to view details.
          </div>
        )}
      </div>

      {showAddSession && (
        <AddSessionModal
          onClose={() => setShowAddSession(false)}
          onSuccess={() => { setShowAddSession(false); loadSessions(); setToast({ message: 'Session created.', type: 'success' }); }}
        />
      )}

      {showAddTerm && selectedSession && (
        <AddTermModal
          sessionId={selectedSession.id}
          onClose={() => setShowAddTerm(false)}
          onSuccess={() => { setShowAddTerm(false); loadSessions(); setToast({ message: 'Term added.', type: 'success' }); }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
