import type { ReactNode } from 'react';
import { ANIMATIONS } from '@/lib/animations';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

function DefaultIcon() {
  return (
    <svg className="h-10 w-10 text-violet-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center ${ANIMATIONS.fadeIn}`}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-50">
        {icon || <DefaultIcon />}
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-gray-500">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
