'use client';

import { useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import Skeleton from '@/components/shared/Skeleton';
import type { ParentStudentData } from '@/lib/validations/schemas';
import { ANIMATIONS } from '@/lib/animations';

export default function ParentProfilePage() {
  const { user } = useAuth();
  const { data: students, loading, request: fetchStudents } = useApi<ParentStudentData[]>();

  const loadStudents = useCallback(() => {
    fetchStudents('GET', '/api/v1/parent/students');
  }, [fetchStudents]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      <p className="mt-1 text-sm text-gray-500">Your account and linked student information.</p>

      <div className={`mt-6 grid gap-6 md:grid-cols-2 ${ANIMATIONS.fadeIn}`}>
        <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Account</h2>
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
    </div>
  );
}
