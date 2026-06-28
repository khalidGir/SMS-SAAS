'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import type { StudentData } from '@/lib/validations/schemas';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import ManageStatusModal from '@/components/modules/students/ManageStatusModal';
import Toast from '@/components/shared/Toast';

export default function AdminStudentsPage() {
  const { user } = useAuth();
  const { data: students, loading, error, request: fetchStudents } = useApi<StudentData[]>();
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadStudents = useCallback(() => {
    fetchStudents('GET', '/api/v1/students');
  }, [fetchStudents]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const columns: Column<StudentData>[] = [
    { key: 'studentId', label: 'ID', render: (s) => <span className="font-medium text-gray-900">{s.studentId}</span> },
    { key: 'name', label: 'Name', render: (s) => <span className="text-gray-700">{s.firstName} {s.lastName}</span> },
    { key: 'gender', label: 'Gender', render: (s) => <span className="text-gray-700">{s.gender}</span> },
    { key: 'guardian', label: 'Guardian', render: (s) => <span className="text-gray-700">{s.guardianName}</span> },
    {
      key: 'status', label: 'Status', align: 'center',
      render: (s) => <StatusBadge status={s.status} variant="lifecycle" />,
    },
    {
      key: 'action', label: '', align: 'right',
      render: (s) => (
        <button
          onClick={() => setSelectedStudent(s)}
          className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
        >
          Manage
        </button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="mt-1 text-gray-500">Welcome, {user?.name ?? 'Admin'}.</p>
        </div>
        <button
          onClick={loadStudents}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <DataTable
        columns={columns}
        rows={students ?? []}
        loading={loading}
        emptyMessage="No students found."
      />

      {selectedStudent && (
        <ManageStatusModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onSuccess={() => {
            setSelectedStudent(null);
            loadStudents();
            setToast({ message: 'Student status updated.', type: 'success' });
          }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
