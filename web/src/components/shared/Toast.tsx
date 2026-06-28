'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'success', onClose, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setExiting(true);
      setVisible(false);
      setTimeout(onClose, 250);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div role="status" aria-live="polite"
      className={cn(
        'fixed bottom-6 right-6 z-[60] rounded-lg px-5 py-3 text-sm font-medium text-white shadow-lg transition-all duration-250 ease-out',
        type === 'success' && 'bg-emerald-600',
        type === 'error' && 'bg-red-600',
        exiting && 'opacity-0 translate-y-2 scale-95',
        visible && !exiting ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
      )}
    >
      <div className="flex items-center gap-2">
        {type === 'success' ? (
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {message}
      </div>
    </div>
  );
}
