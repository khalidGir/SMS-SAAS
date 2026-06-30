'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  tKey: string;
  href: string;
  roles: string[];
  icon: React.ReactNode;
}

/* ── Inline SVG icons ─────────────────── */
const Icons = {
  dashboard: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  school: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  calendar: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  users: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  userPlus: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  ),
  clipboard: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  dollarSign: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  fileText: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  barChart: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  academicCap: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  ),
  user: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

const ALL_ROLES = ['SUPER_ADMIN', 'ADMIN', 'REGISTRAR', 'ACCOUNTANT', 'CASHIER', 'PARENT'] as const;

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    tKey: 'nav.dashboard',
    href: '/dashboard',
    roles: [...ALL_ROLES],
    icon: Icons.dashboard,
  },
  {
    label: 'Schools',
    tKey: 'nav.schools',
    href: '/dashboard/super-admin/schools',
    roles: ['SUPER_ADMIN'],
    icon: Icons.school,
  },
  {
    label: 'Users',
    tKey: 'nav.users',
    href: '/dashboard/super-admin/users',
    roles: ['SUPER_ADMIN'],
    icon: Icons.users,
  },
  {
    label: 'Sessions',
    tKey: 'nav.sessions',
    href: '/dashboard/admin/sessions',
    roles: ['ADMIN'],
    icon: Icons.calendar,
  },
  {
    label: 'Classes',
    tKey: 'nav.classes',
    href: '/dashboard/admin/classes',
    roles: ['ADMIN'],
    icon: Icons.academicCap,
  },
  {
    label: 'Students',
    tKey: 'nav.students',
    href: '/dashboard/admin/students',
    roles: ['ADMIN'],
    icon: Icons.users,
  },
  {
    label: 'Register Student',
    tKey: 'nav.registerStudent',
    href: '/dashboard/registrar/register',
    roles: ['REGISTRAR'],
    icon: Icons.userPlus,
  },
  {
    label: 'Students',
    tKey: 'nav.students',
    href: '/dashboard/registrar/students',
    roles: ['REGISTRAR'],
    icon: Icons.users,
  },
  {
    label: 'Enrollment',
    tKey: 'nav.enrollment',
    href: '/dashboard/registrar/enrollment',
    roles: ['REGISTRAR'],
    icon: Icons.clipboard,
  },
  {
    label: 'Fees',
    tKey: 'nav.fees',
    href: '/dashboard/accountant/fees',
    roles: ['ACCOUNTANT'],
    icon: Icons.dollarSign,
  },
  {
    label: 'Invoices',
    tKey: 'nav.invoices',
    href: '/dashboard/accountant/invoices',
    roles: ['ACCOUNTANT'],
    icon: Icons.fileText,
  },
  {
    label: 'Reports',
    tKey: 'nav.reports',
    href: '/dashboard/accountant/reports',
    roles: ['ACCOUNTANT'],
    icon: Icons.barChart,
  },
  {
    label: 'Record Payment',
    tKey: 'nav.recordPayment',
    href: '/dashboard/cashier',
    roles: ['CASHIER'],
    icon: Icons.dollarSign,
  },
  {
    label: 'Invoices',
    tKey: 'nav.invoices',
    href: '/dashboard/parent/invoices',
    roles: ['PARENT'],
    icon: Icons.fileText,
  },
  {
    label: 'Profile',
    tKey: 'nav.profile',
    href: '/dashboard/parent/profile',
    roles: ['PARENT'],
    icon: Icons.user,
  },
];

const ROLE_BADGE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-500/20 text-purple-300 ring-purple-500/30',
  ADMIN: 'bg-blue-500/20 text-blue-300 ring-blue-500/30',
  REGISTRAR: 'bg-green-500/20 text-green-300 ring-green-500/30',
  ACCOUNTANT: 'bg-amber-500/20 text-amber-300 ring-amber-500/30',
  CASHIER: 'bg-pink-500/20 text-pink-300 ring-pink-500/30',
  PARENT: 'bg-teal-500/20 text-teal-300 ring-teal-500/30',
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  REGISTRAR: 'Registrar',
  ACCOUNTANT: 'Accountant',
  CASHIER: 'Cashier',
  PARENT: 'Parent',
};

export default function SidebarNavigation() {
  const { locale, setLocale, t } = useTranslation();
  const { user } = useAuth();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!user) return null;

  const filteredItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role));
  const roleBadgeColor = ROLE_BADGE_COLORS[user.role] ?? 'bg-gray-500/20 text-gray-300 ring-gray-500/30';
  const roleLabel = ROLE_LABELS[user.role] ?? user.role;

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-gray-800 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950',
        mounted && 'transition-all duration-200',
        expanded ? 'w-64' : 'w-16',
        'lg:w-64',
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-2 border-b border-gray-800 px-4 py-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500 text-sm font-bold text-white shadow-sm shadow-violet-500/30">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <span className={cn('text-lg font-semibold text-white', expanded ? 'block' : 'hidden', 'lg:block')}>
          SMS Portal
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-violet-500/10 text-violet-300 ring-1 ring-inset ring-violet-500/20'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200',
                  )}
                  title={expanded ? undefined : t(item.tKey)}
                >
                  {item.icon}
                  <span className={cn(expanded ? 'block' : 'hidden', 'lg:block')}>{t(item.tKey)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Language toggle + User footer */}
      <div className="border-t border-gray-800">
        <div className={cn('flex items-center gap-1 border-b border-gray-700/50 px-4 py-2', expanded ? 'justify-end' : 'justify-center', 'lg:justify-end')}>
          <button
            type="button"
            onClick={() => setLocale('en')}
            className={cn(
              'rounded px-1.5 py-0.5 text-xs font-medium transition-colors',
              locale === 'en' ? 'bg-violet-600/30 text-violet-200' : 'text-gray-500 hover:text-gray-300',
            )}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLocale('am')}
            className={cn(
              'rounded px-1.5 py-0.5 text-xs font-medium transition-colors',
              locale === 'am' ? 'bg-violet-600/30 text-violet-200' : 'text-gray-500 hover:text-gray-300',
            )}
          >
            አማ
          </button>
        </div>
        <div className="px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-300">
            {user.firstName?.charAt(0) ?? 'U'}
            {user.lastName?.charAt(0) ?? ''}
          </div>
          <div className={cn('min-w-0 flex-1', expanded ? 'block' : 'hidden', 'lg:block')}>
            <p className="truncate text-sm font-medium text-gray-200">{user.name}</p>
            <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset', roleBadgeColor)}>
              {roleLabel}
            </span>
          </div>
          {/* Mobile toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-gray-800 hover:text-gray-200 lg:hidden"
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg
              className={cn('h-3 w-3 transition-transform', expanded ? 'rotate-180' : '')}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
