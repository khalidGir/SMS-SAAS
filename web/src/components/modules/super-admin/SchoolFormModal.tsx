'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { createSchoolSchema, type CreateSchoolInput } from '@/lib/validations/schemas';
import type { School } from '@/lib/api/schools';

interface SchoolFormModalProps {
  mode: 'create' | 'edit';
  school?: School | null;
  loading: boolean;
  onSubmit: (data: CreateSchoolInput) => Promise<void>;
  onClose: () => void;
}

export default function SchoolFormModal({ mode, school, loading, onSubmit, onClose }: SchoolFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSchoolInput>({
    resolver: zodResolver(createSchoolSchema),
    defaultValues: {
      name: '',
      domain: '',
      address: '',
      phone: '',
      email: '',
      planType: 'BASIC',
      adminName: '',
      adminEmail: '',
      adminPhone: '',
    },
  });

  useEffect(() => {
    if (mode === 'edit' && school) {
      reset({
        name: school.name,
        domain: school.domain,
        address: school.address,
        phone: school.phone,
        email: school.email,
        planType: school.planType,
        adminName: school.adminName,
        adminEmail: school.adminEmail,
        adminPhone: school.adminPhone,
      });
    } else {
      reset({
        name: '',
        domain: '',
        address: '',
        phone: '',
        email: '',
        planType: 'BASIC',
        adminName: '',
        adminEmail: '',
        adminPhone: '',
      });
    }
  }, [mode, school, reset]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-12">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? 'Add School' : 'Edit School'}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              School Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            {errors.name && <p className="mt-0.5 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Domain <span className="text-red-500">*</span>
              </label>
              <input
                {...register('domain')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              {errors.domain && <p className="mt-0.5 text-xs text-red-600">{errors.domain.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Plan Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register('planType')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="BASIC">Basic</option>
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM">Premium</option>
              </select>
              {errors.planType && <p className="mt-0.5 text-xs text-red-600">{errors.planType.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              {...register('address')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            {errors.address && <p className="mt-0.5 text-xs text-red-600">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                {...register('phone')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              {errors.phone && <p className="mt-0.5 text-xs text-red-600">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              {errors.email && <p className="mt-0.5 text-xs text-red-600">{errors.email.message}</p>}
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">School Administrator</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Admin Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('adminName')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                {errors.adminName && <p className="mt-0.5 text-xs text-red-600">{errors.adminName.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Admin Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('adminEmail')}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  {errors.adminEmail && <p className="mt-0.5 text-xs text-red-600">{errors.adminEmail.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Admin Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('adminPhone')}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  {errors.adminPhone && <p className="mt-0.5 text-xs text-red-600">{errors.adminPhone.message}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create School' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
