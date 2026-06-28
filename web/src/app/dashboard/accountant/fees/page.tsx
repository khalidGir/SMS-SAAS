'use client';

import { useAuth } from '@/hooks/useAuth';

export default function FeeStructurePage() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Fee Structure</h1>
      <p className="mt-1 text-gray-500">Welcome, {user?.name ?? 'Accountant'}.</p>
      <p className="mt-2 text-gray-600">Configure fee structures for classes and terms.</p>
    </div>
  );
}
