'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { loginSchema, type LoginInput } from '@/lib/validations/schemas';
import { cn } from '@/lib/utils';

const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
};

export default function LoginPage() {
  const { t, locale, setLocale } = useTranslation();
  const { login } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [serverLoading, setServerLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const rememberMeRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError('');
    setServerLoading(true);
    try {
      await login(data.email, data.password, rememberMeRef.current?.checked ?? false);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      const code = msg.toUpperCase().replace(/\s+/g, '_');
      const key = ERROR_MESSAGES[code] || '';
      setServerError(key ? t(`auth.${key}`) : msg);
    } finally {
      setServerLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Server error banner */}
      {serverError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {serverError}
          </div>
        </div>
      )}

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          {t('auth.email')}
        </label>
        <input
          id="email"
          type="text"
          autoComplete="username"
          {...register('email')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
        {errors.email && (
          <p className="mt-0.5 text-xs text-red-600">{errors.email.message as string}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          {t('auth.password')}
        </label>
        <div className="relative mt-1">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            {...register('password')}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-0.5 text-xs text-red-600">{errors.password.message as string}</p>
        )}
      </div>

      {/* Remember me */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            ref={rememberMeRef}
            className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
          />
          {t('auth.rememberMe')}
        </label>
        <a
          href="/forgot-password"
          className="text-sm font-medium text-violet-600 hover:text-violet-500"
        >
          {t('auth.forgotPassword')}
        </a>
      </div>

      {/* Register link */}
      <p className="text-center text-sm text-gray-500">
        New school?{' '}
        <a href="/register" className="font-medium text-violet-600 hover:text-violet-500">Register your school</a>
      </p>

      {/* Submit */}
      <button
        type="submit"
        disabled={serverLoading}
        className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {serverLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t('auth.signingIn')}
          </span>
        ) : (
          t('auth.signIn')
        )}
      </button>

      {/* Language selector */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <span className="text-xs text-gray-400">{t('auth.selectLanguage')}</span>
        <button
          type="button"
          onClick={() => setLocale('en')}
          className={cn(
            'rounded px-2 py-1 text-xs font-medium transition-colors',
            locale === 'en' ? 'bg-violet-100 text-violet-700' : 'text-gray-400 hover:text-gray-600',
          )}
        >
          {t('auth.english')}
        </button>
        <button
          type="button"
          onClick={() => setLocale('am')}
          className={cn(
            'rounded px-2 py-1 text-xs font-medium transition-colors',
            locale === 'am' ? 'bg-violet-100 text-violet-700' : 'text-gray-400 hover:text-gray-600',
          )}
        >
          {t('auth.amharic')}
        </button>
      </div>
    </form>
  );
}
