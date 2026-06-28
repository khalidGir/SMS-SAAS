'use client';

import { useAuth } from '@/hooks/useAuth';
import StudentRegistrationForm from '@/components/modules/students/StudentRegistrationForm';

export default function RegisterStudentPage() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Register Student</h1>
      <p className="mt-1 text-gray-500">Welcome, {user?.name ?? 'Registrar'}.</p>
      <div className="mt-6">
        <StudentRegistrationForm />
      </div>
    </div>
  );
}
