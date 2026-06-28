'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  REGISTRAR: 'Registrar',
  ACCOUNTANT: 'Accountant',
  PARENT: 'Parent',
};

export default function TopHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="hidden lg:block">
        <h2 className="text-lg font-semibold text-gray-900">{user.schoolName || 'School Dashboard'}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right max-lg:hidden">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">{ROLE_LABELS[user.role] ?? user.role}</p>
        </div>
        <span className="text-sm font-medium text-gray-900 lg:hidden">{user.name}</span>

        <button
          onClick={handleLogout}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
