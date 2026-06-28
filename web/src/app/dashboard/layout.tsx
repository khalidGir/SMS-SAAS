'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import SidebarNavigation from '@/components/shared/SidebarNavigation';
import TopHeader from '@/components/shared/TopHeader';
import { useEffect } from 'react';

const ROLE_SEGMENT_MAP: Record<string, string> = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  REGISTRAR: 'registrar',
  ACCOUNTANT: 'accountant',
  PARENT: 'parent',
};

/**
 * Centralized route guard for dashboard routes.
 *
 * Extracts the first path segment after /dashboard/ and compares it
 * against the user's role-based permitted segment. Redirects to the
 * correct dashboard if the user attempts to access another role's space.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    // Extract segment: /dashboard/<segment>/...
    const segments = pathname.split('/');
    const currentSegment = segments[2];
    const permittedSegment = ROLE_SEGMENT_MAP[user.role];

    if (!permittedSegment) {
      router.replace('/login');
      return;
    }

    // Allow access to /dashboard itself (the base Dashboard page) for all roles
    if (!currentSegment) return;

    // Guard: redirect if accessing another role's segment
    if (currentSegment !== permittedSegment) {
      router.replace(`/dashboard/${permittedSegment}`);
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <SidebarNavigation />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
