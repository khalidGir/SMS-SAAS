'use client';

import { useEffect, type ReactNode } from 'react';

const IS_DEMO = true;

export function MswProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!IS_DEMO || typeof window === 'undefined') return;

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
