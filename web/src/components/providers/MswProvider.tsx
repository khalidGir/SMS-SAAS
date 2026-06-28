'use client';

import { useEffect, type ReactNode } from 'react';

export function MswProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const enable = process.env.NEXT_PUBLIC_MSW_ENABLED === 'true';
    if (!enable || typeof window === 'undefined') return;

    const start = async () => {
      try {
        const { worker } = await import('../../mocks/browser');
        await worker.start({ onUnhandledRequest: 'bypass' });
        console.log('[MSW] Mock Service Worker started');
      } catch (err) {
        console.error('[MSW] Failed to start:', err);
      }
    };
    start();
  }, []);

  return <>{children}</>;
}
