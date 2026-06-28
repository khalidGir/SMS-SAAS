'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { registerSchoolSchema, type RegisterSchoolInput } from '@/lib/validations/schemas';

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchoolInput>({
    resolver: zodResolver(registerSchoolSchema),
  });

  const onSubmit = async (data: RegisterSchoolInput) => {
    setServerError('');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.status !== 'success') {
        throw new Error(json?.error?.message || 'Registration failed');
      }
      await login(data.email, data.password, true);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {serverError}
        </div>
      )}

      <fieldset>
        <legend className="text-sm font-semibold text-gray-900">School Details</legend>
        <div className="mt-2 space-y-3">
          <div>
            <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700">School Name</label>
            <input id="schoolName" type="text" {...register('schoolName')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
            {errors.schoolName && <p className="mt-0.5 text-xs text-red-600">{errors.schoolName.message}</p>}
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <input id="address" type="text" {...register('address')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
            {errors.address && <p className="mt-0.5 text-xs text-red-600">{errors.address.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
              <input id="phone" type="text" {...register('phone')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
              {errors.phone && <p className="mt-0.5 text-xs text-red-600">{errors.phone.message}</p>}
            </div>
            <div>
              <label htmlFor="schoolEmail" className="block text-sm font-medium text-gray-700">School Email</label>
              <input id="schoolEmail" type="email" {...register('schoolEmail')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
              {errors.schoolEmail && <p className="mt-0.5 text-xs text-red-600">{errors.schoolEmail.message}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="planType" className="block text-sm font-medium text-gray-700">Plan</label>
            <select id="planType" {...register('planType')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500">
              <option value="">Select a plan</option>
              <option value="BASIC">Basic</option>
              <option value="STANDARD">Standard</option>
              <option value="PREMIUM">Premium</option>
            </select>
            {errors.planType && <p className="mt-0.5 text-xs text-red-600">{errors.planType.message}</p>}
          </div>
        </div>
      </fieldset>

      <hr className="border-gray-200" />

      <fieldset>
        <legend className="text-sm font-semibold text-gray-900">Admin Account</legend>
        <div className="mt-2 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
              <input id="firstName" type="text" {...register('firstName')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
              {errors.firstName && <p className="mt-0.5 text-xs text-red-600">{errors.firstName.message}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
              <input id="lastName" type="text" {...register('lastName')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
              {errors.lastName && <p className="mt-0.5 text-xs text-red-600">{errors.lastName.message}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Admin Email</label>
            <input id="email" type="email" {...register('email')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
            {errors.email && <p className="mt-0.5 text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input id="password" type="password" autoComplete="new-password" {...register('password')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
              {errors.password && <p className="mt-0.5 text-xs text-red-600">{errors.password.message}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input id="confirmPassword" type="password" autoComplete="new-password" {...register('confirmPassword')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
              {errors.confirmPassword && <p className="mt-0.5 text-xs text-red-600">{errors.confirmPassword.message}</p>}
            </div>
          </div>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Registering...' : 'Register School'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <a href="/login" className="font-medium text-violet-600 hover:text-violet-500">Sign in</a>
      </p>
    </form>
  );
}
