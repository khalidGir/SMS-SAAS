'use client';

import { useAuth } from '@/hooks/useAuth';

export default function EnrollmentPage() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Student Enrollment</h1>
      <p className="mt-1 text-gray-500">Welcome, {user?.name ?? 'Registrar'}.</p>
      <p className="mt-2 text-gray-600">Enroll registered students into classes.</p>
    </div>
  );
}
