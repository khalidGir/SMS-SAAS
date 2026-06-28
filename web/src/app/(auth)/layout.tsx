/**
 * Shared auth layout — branded centered card shell.
 * Used by /login, /forgot-password, /reset-password.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-500/30">
            <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h1 className="mt-4 text-xl font-bold text-gray-900">SMS Portal</h1>
          <p className="mt-1 text-sm text-gray-500">School Management System</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-gray-200/80 bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
