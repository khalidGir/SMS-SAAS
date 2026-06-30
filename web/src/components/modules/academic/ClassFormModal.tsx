'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { classSchema, type ClassInput, type ClassData } from '@/lib/validations/schemas';

interface ClassFormModalProps {
  mode: 'create' | 'edit';
  classData?: ClassData | null;
  saving: boolean;
  onSubmit: (data: ClassInput) => Promise<void>;
  onClose: () => void;
}

const defaults: ClassInput = {
  name: '',
  capacity: 0,
};

export default function ClassFormModal({ mode, classData, saving, onSubmit, onClose }: ClassFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassInput>({
    resolver: zodResolver(classSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (mode === 'edit' && classData) {
      reset({ name: classData.name, capacity: classData.capacity });
    } else {
      reset(defaults);
    }
  }, [mode, classData, reset]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-20">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? 'Add Class' : 'Edit Class'}
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Class Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              placeholder="e.g. Grade 4"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            {errors.name && <p className="mt-0.5 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Capacity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="1"
              {...register('capacity', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            {errors.capacity && <p className="mt-0.5 text-xs text-red-600">{errors.capacity.message}</p>}
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
              disabled={saving}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : mode === 'create' ? 'Create Class' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
