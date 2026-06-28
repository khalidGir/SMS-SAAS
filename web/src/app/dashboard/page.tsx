'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ROLE_HOME: Record<string, string> = {
  SUPER_ADMIN: '/dashboard/super-admin',
  ADMIN: '/dashboard/admin',
  REGISTRAR: '/dashboard/registrar',
  ACCOUNTANT: '/dashboard/accountant',
  PARENT: '/dashboard/parent',
};

export default function DashboardIndex() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const target = ROLE_HOME[user.role];
      if (target) router.replace(target);
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
    </div>
  );
}
