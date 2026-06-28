import { NextRequest, NextResponse } from 'next/server';

/**
 * This project runs in demo/MSW mode.
 * All API requests should be intercepted by the MSW service worker in the browser.
 * If a request reaches this handler, MSW is not running.
 */
function mswNotRunningResponse() {
  return NextResponse.json(
    {
      status: 'error',
      error: {
        code: 'MSW_NOT_RUNNING',
        message:
          'The MSW mock service worker is not active. ' +
          'In production (Vercel), ensure the MswProvider initializes. ' +
          'In development, ensure NEXT_PUBLIC_MSW_ENABLED=true is set.',
      },
    },
    { status: 503 },
  );
}

export const GET = mswNotRunningResponse;
export const POST = mswNotRunningResponse;
export const PUT = mswNotRunningResponse;
export const PATCH = mswNotRunningResponse;
export const DELETE = mswNotRunningResponse;
export const HEAD = mswNotRunningResponse;
export const OPTIONS = mswNotRunningResponse;
