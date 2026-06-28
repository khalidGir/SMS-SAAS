'use client';

import { cn } from '@/lib/utils';

/* ───────────────────────────────────────────
 * Inline SVG icon components (zero dependencies)
 * ─────────────────────────────────────────── */

function CheckCircle() {
  return (
    <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XCircle() {
  return (
    <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function Clock() {
  return (
    <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function Check() {
  return (
    <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function AlertTriangle() {
  return (
    <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function Ban() {
  return (
    <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  );
}

function MinusCircle() {
  return (
    <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ArrowUp() {
  return (
    <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  );
}

/* ───────────────────────────────────────────
 * Badge presets
 * ─────────────────────────────────────────── */

interface BadgeConfig {
  label: string;
  classes: string;
  icon: React.ReactNode;
}

const FINANCIAL_BADGES: Record<string, BadgeConfig> = {
  PAID:           { label: 'Paid',          classes: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',      icon: <CheckCircle /> },
  PARTIALLY_PAID: { label: 'Partial',       classes: 'bg-amber-50 text-amber-700 ring-amber-600/20',            icon: <Clock /> },
  UNPAID:         { label: 'Unpaid',        classes: 'bg-rose-50 text-rose-700 ring-rose-600/20',               icon: <XCircle /> },
  OVERDUE:        { label: 'Overdue',       classes: 'bg-rose-50 text-rose-700 ring-rose-600/20 line-through',  icon: <XCircle /> },
  REFUNDED:       { label: 'Refunded',      classes: 'bg-slate-50 text-slate-500 ring-slate-500/20 line-through', icon: <ArrowUp /> },
  VOIDED:         { label: 'Voided',        classes: 'bg-slate-50 text-slate-400 ring-slate-400/20 line-through', icon: <MinusCircle /> },
  ACTIVE:         { label: 'Active',        classes: 'bg-green-50 text-green-700 ring-green-600/20',            icon: <Check /> },
  CONFIRMED:      { label: 'Active',        classes: 'bg-green-50 text-green-700 ring-green-600/20',            icon: <Check /> },
};

const LIFECYCLE_BADGES: Record<string, BadgeConfig> = {
  ACTIVE:     { label: 'Active',     classes: 'bg-green-50 text-green-700 ring-green-600/20',   icon: <Check /> },
  SUSPENDED:  { label: 'Suspended',  classes: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20', icon: <AlertTriangle /> },
  EXPELLED:   { label: 'Expelled',   classes: 'bg-red-50 text-red-700 ring-red-600/20',         icon: <Ban /> },
  WITHDRAWN:  { label: 'Withdrawn',  classes: 'bg-gray-50 text-gray-500 ring-gray-500/20',     icon: <MinusCircle /> },
  GRADUATED:  { label: 'Graduated',  classes: 'bg-blue-50 text-blue-700 ring-blue-600/20',     icon: <Check /> },
  PENDING:    { label: 'Pending',    classes: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20', icon: <Clock /> },
  TRANSFERRED:{ label: 'Transferred',classes: 'bg-purple-50 text-purple-700 ring-purple-600/20', icon: <ArrowUp /> },
};

/* ───────────────────────────────────────────
 * Props & component
 * ─────────────────────────────────────────── */

interface StatusBadgeProps {
  status: string;
  variant?: 'financial' | 'lifecycle';
  /** Override the default label for a given status key */
  label?: string;
}

export default function StatusBadge({ status, variant = 'financial', label }: StatusBadgeProps) {
  const map = variant === 'lifecycle' ? LIFECYCLE_BADGES : FINANCIAL_BADGES;
  const config = map[status];
  if (!config) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/20">
        {status.replace(/_/g, ' ')}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        config.classes,
      )}
    >
      {config.icon}
      {label ?? config.label}
    </span>
  );
}
