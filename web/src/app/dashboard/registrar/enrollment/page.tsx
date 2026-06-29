'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import DataTable, { type Column } from '@/components/shared/DataTable';
import Toast from '@/components/shared/Toast';

interface StudentRecord {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
}

interface ClassRecord {
  id: string;
  name: string;
  capacity: number;
}

interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface SessionRecord {
  id: string;
  name: string;
  status: string;
  terms: Term[];
}

interface EnrollmentRecord {
  id: string;
  studentId: string;
  classId: string;
  sessionId: string;
  enrollmentDate: string;
  status: string;
  student: { firstName: string; lastName: string } | null;
  class: { name: string } | null;
  session: { name: string } | null;
}

export default function EnrollmentPage() {
  const { user } = useAuth();

  const { data: students, request: fetchStudents } = useApi<StudentRecord[]>();
  const { data: classes, request: fetchClasses } = useApi<ClassRecord[]>();
  const { data: sessions, request: fetchSessions } = useApi<SessionRecord[]>();
  const { data: enrollments, loading: enrollmentsLoading, request: fetchEnrollments } = useApi<EnrollmentRecord[]>();

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadAll = useCallback(() => {
    fetchStudents('GET', '/api/v1/students');
    fetchClasses('GET', '/api/v1/classes');
    fetchSessions('GET', '/api/v1/academic/sessions');
    fetchEnrollments('GET', '/api/v1/enrollments');
  }, [fetchStudents, fetchClasses, fetchSessions, fetchEnrollments]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleEnroll = async () => {
    if (!selectedStudentId || !selectedClassId || !selectedSessionId) {
      setToast({ message: 'Please select student, class, and session.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch('/api/v1/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ studentId: selectedStudentId, classId: selectedClassId, sessionId: selectedSessionId }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        setToast({ message: 'Student enrolled successfully.', type: 'success' });
        setSelectedStudentId('');
        setSelectedClassId('');
        setSelectedSessionId('');
        fetchEnrollments('GET', '/api/v1/enrollments');
      } else {
        setToast({ message: json.error?.message || 'Enrollment failed', type: 'error' });
      }
    } catch {
      setToast({ message: 'Network error', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStudent = students?.find(s => s.id === selectedStudentId);
  const selectedClass = classes?.find(c => c.id === selectedClassId);

  const columns: Column<EnrollmentRecord>[] = [
    { key: 'enrollmentDate', label: 'Date', render: (r) => <span className="text-sm text-gray-600">{r.enrollmentDate}</span> },
    { key: 'student', label: 'Student', render: (r) => <span className="font-medium text-gray-900">{r.student ? `${r.student.firstName} ${r.student.lastName}` : '—'}</span> },
    { key: 'class', label: 'Class', render: (r) => <span className="text-gray-700">{r.class?.name ?? '—'}</span> },
    { key: 'session', label: 'Session', render: (r) => <span className="text-gray-700">{r.session?.name ?? '—'}</span> },
    { key: 'status', label: 'Status', align: 'center', render: (r) => <span className="text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">{r.status}</span> },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Enrollment</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome, {user?.name ?? 'Registrar'}.</p>
      </div>

      {/* Enrollment Form */}
      <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">New Enrollment</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Student</label>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="">Select student...</option>
              {(students ?? []).map(s => (
                <option key={s.id} value={s.id}>{s.studentId} — {s.firstName} {s.lastName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="">Select class...</option>
              {(classes ?? []).map(c => (
                <option key={c.id} value={c.id}>{c.name} (cap. {c.capacity})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Academic Session</label>
            <select
              value={selectedSessionId}
              onChange={e => setSelectedSessionId(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="">Select session...</option>
              {(sessions ?? []).flatMap(s =>
                (s.terms ?? []).map(t => (
                  <option key={t.id} value={t.id}>{s.name} — {t.name}</option>
                ))
              )}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleEnroll}
              disabled={submitting || !selectedStudentId || !selectedClassId || !selectedSessionId}
              className="w-full rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {submitting ? 'Enrolling...' : 'Enroll Student'}
            </button>
          </div>
        </div>

        {(selectedStudent && selectedClass) && (
          <p className="mt-3 text-xs text-gray-500">
            Enrolling <strong>{selectedStudent.firstName} {selectedStudent.lastName}</strong> into <strong>{selectedClass.name}</strong>
          </p>
        )}
      </div>

      {/* Existing Enrollments */}
      <section className="mt-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Enrolled Students</h2>
        <DataTable
          columns={columns}
          rows={enrollments ?? []}
          loading={enrollmentsLoading}
          emptyMessage="No students enrolled yet."
        />
      </section>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
