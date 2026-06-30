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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadStudents = useCallback(() => {
    fetchStudents('GET', '/api/v1/students');
  }, [fetchStudents]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const filtered = (students ?? []).filter(s => {
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!`${s.firstName} ${s.lastName} ${s.studentId}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

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

      <div className="mb-4 flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="WITHDRAWN">Withdrawn</option>
          <option value="EXPELLED">Expelled</option>
          <option value="GRADUATED">Graduated</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
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
