'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '@/hooks/useApi';
import { feeStructureSchema, type FeeStructureInput, type FeeStructureData } from '@/lib/validations/schemas';

interface SessionOption {
  id: string;
  name: string;
  terms: { id: string; name: string }[];
}

interface FeeStructureFormModalProps {
  mode: 'create' | 'edit';
  fee?: FeeStructureData | null;
  saving: boolean;
  onSubmit: (data: FeeStructureInput) => Promise<void>;
  onClose: () => void;
}

const defaults: FeeStructureInput = {
  name: '',
  termId: '',
  baseAmount: 0,
  dueDate: '',
  lateFeeRate: 0,
  lateFeeType: 'FLAT',
  frequency: 'Termly',
  status: 'Active',
};

export default function FeeStructureFormModal({
  mode, fee, saving, onSubmit, onClose,
}: FeeStructureFormModalProps) {
  const { data: sessions, request: fetchSessions } = useApi<SessionOption[]>();
  const [termOptions, setTermOptions] = useState<{ id: string; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FeeStructureInput>({
    resolver: zodResolver(feeStructureSchema),
    defaultValues: defaults,
  });

  const selectedTermId = watch('termId');

  useEffect(() => {
    fetchSessions('GET', '/api/v1/academic/sessions');
  }, [fetchSessions]);

  useEffect(() => {
    const allTerms = (sessions ?? []).flatMap(s => s.terms);
    setTermOptions(allTerms);
  }, [sessions]);

  useEffect(() => {
    if (mode === 'edit' && fee) {
      reset({
        name: fee.name,
        termId: fee.termId,
        baseAmount: fee.baseAmount,
        dueDate: fee.dueDate,
        lateFeeRate: fee.lateFeeRate,
        lateFeeType: fee.lateFeeType as 'FLAT' | 'DAILY',
        frequency: fee.frequency as FeeStructureInput['frequency'],
        status: fee.status as 'Active' | 'Inactive',
      });
    } else {
      reset(defaults);
    }
  }, [mode, fee, reset]);

  const selectedTermName = termOptions.find(t => t.id === selectedTermId)?.name || '';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-12">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? 'Add Fee Structure' : 'Edit Fee Structure'}
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
              Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              placeholder="e.g. Grade 3 Tuition Fee"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            {errors.name && <p className="mt-0.5 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Term <span className="text-red-500">*</span>
              </label>
              <select
                {...register('termId')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="">Select term</option>
                {termOptions.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {errors.termId && <p className="mt-0.5 text-xs text-red-600">{errors.termId.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Frequency <span className="text-red-500">*</span>
              </label>
              <select
                {...register('frequency')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="Termly">Termly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
                <option value="One-Time">One-Time</option>
              </select>
              {errors.frequency && <p className="mt-0.5 text-xs text-red-600">{errors.frequency.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Base Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('baseAmount', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              {errors.baseAmount && <p className="mt-0.5 text-xs text-red-600">{errors.baseAmount.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('dueDate')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              {errors.dueDate && <p className="mt-0.5 text-xs text-red-600">{errors.dueDate.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Late Fee Rate
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('lateFeeRate', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              {errors.lateFeeRate && <p className="mt-0.5 text-xs text-red-600">{errors.lateFeeRate.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Late Fee Type
              </label>
              <select
                {...register('lateFeeType')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="FLAT">Flat</option>
                <option value="DAILY">Daily</option>
              </select>
              {errors.lateFeeType && <p className="mt-0.5 text-xs text-red-600">{errors.lateFeeType.message}</p>}
            </div>
          </div>

          {mode === 'edit' && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                {...register('status')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          )}

          {selectedTermId && selectedTermName && (
            <p className="text-xs text-gray-400">
              Linked to term: <span className="font-medium text-gray-600">{selectedTermName}</span>
            </p>
          )}

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
              {saving ? 'Saving...' : mode === 'create' ? 'Create Fee Structure' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
