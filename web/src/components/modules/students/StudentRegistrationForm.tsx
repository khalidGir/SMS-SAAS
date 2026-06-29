'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '@/hooks/useApi';
import {
  studentRegistrationSchema,
  studentStep1Schema,
  studentStep2Schema,
  studentStep3Schema,
  type StudentRegistrationInput,
} from '@/lib/validations/schemas';
import { cn } from '@/lib/utils';

type StepKeys = 1 | 2 | 3 | 4;

const STEP_LABELS: Record<StepKeys, string> = {
  1: 'Personal Details',
  2: 'Guardian Details',
  3: 'Address & Enrollment',
  4: 'Review & Submit',
};

const STEP_FIELDS: Record<StepKeys, (keyof StudentRegistrationInput)[]> = {
  1: ['firstName', 'lastName', 'dateOfBirth', 'gender'],
  2: ['guardianName', 'guardianPhone', 'guardianEmail'],
  3: ['address', 'previousSchool', 'classId', 'sessionId'],
  4: [],
};

const GENDER_OPTIONS = ['Male', 'Female', 'Other'] as const;

interface ClassOption {
  id: string;
  name: string;
  capacity: number;
}

interface TermOption {
  id: string;
  name: string;
}

interface SessionOption {
  id: string;
  name: string;
  terms: TermOption[];
}

export default function StudentRegistrationForm() {
  const router = useRouter();
  const { loading: submitting, error: submitError, request: apiRequest } = useApi<StudentRegistrationInput>();
  const [step, setStep] = useState<StepKeys>(1);
  const [stepErrors, setStepErrors] = useState<string[]>([]);

  const { data: classes, request: fetchClasses } = useApi<ClassOption[]>();
  const { data: sessions, request: fetchSessions } = useApi<SessionOption[]>();

  useEffect(() => {
    fetchClasses('GET', '/api/v1/classes');
    fetchSessions('GET', '/api/v1/academic/sessions');
  }, [fetchClasses, fetchSessions]);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StudentRegistrationInput>({
    resolver: zodResolver(studentRegistrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: undefined,
      guardianName: '',
      guardianPhone: '',
      guardianEmail: '',
      address: '',
      previousSchool: '',
      classId: '',
      sessionId: '',
      document: undefined,
    },
  });

  const guardianPhone = watch('guardianPhone');
  const guardianEmail = watch('guardianEmail');

  async function validateStep(currentStep: StepKeys): Promise<boolean> {
    const values = watch();
    const picked: Record<string, unknown> = {};
    for (const field of STEP_FIELDS[currentStep]) {
      picked[field] = values[field];
    }

    let schema;
    if (currentStep === 1) schema = studentStep1Schema;
    else if (currentStep === 2) schema = studentStep2Schema;
    else schema = studentStep3Schema;

    const result = schema.safeParse(picked);
    if (!result.success) {
      const msgs = result.error.issues.map((i) => i.message);
      setStepErrors(msgs);
      return false;
    }
    setStepErrors([]);
    return true;
  }

  async function handleNext() {
    const valid = await validateStep(step);
    if (!valid) return;
    setStep((prev) => Math.min(prev + 1, 4) as StepKeys);
  }

  function handleBack() {
    setStepErrors([]);
    setStep((prev) => Math.max(prev - 1, 1) as StepKeys);
  }

  async function onSubmit(data: StudentRegistrationInput) {
    const token = sessionStorage.getItem('accessToken');

    // Step 1: Create the student
    const studentResult = await apiRequest('POST', '/api/v1/students', {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone || null,
      guardianEmail: data.guardianEmail || null,
      address: data.address,
      previousSchool: data.previousSchool || null,
    });

    if (!studentResult) return;

    const studentId = (studentResult as any).id;

    // Step 2: Create the enrollment
    try {
      const res = await fetch('/api/v1/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ studentId, classId: data.classId, sessionId: data.sessionId }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        router.push('/dashboard/registrar/students');
      }
    } catch {
      // enrollment failed but student was created — still redirect
      router.push('/dashboard/registrar/students');
    }
  }

  const fieldError = (field: keyof StudentRegistrationInput) => {
    const e = errors[field];
    return e ? <p className="mt-0.5 text-xs text-red-600">{e.message as string}</p> : null;
  };

  const guardianRefineError =
    step === 2 &&
    stepErrors.some((m) => m.includes('Guardian Phone') || m.includes('Guardian Email'));

  function StepIndicator() {
    return (
      <div className="mb-6 flex items-center gap-2">
        {([1, 2, 3, 4] as const).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                step === s
                  ? 'bg-violet-600 text-white'
                  : step > s
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500',
              )}
            >
              {step > s ? '✓' : s}
            </div>
            <span className={cn('text-sm max-sm:hidden', step === s ? 'font-medium text-violet-700' : 'text-gray-500')}>
              {STEP_LABELS[s]}
            </span>
            {s < 4 && <div className="h-px w-8 bg-gray-300 max-sm:hidden" />}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <StepIndicator />

      {stepErrors.length > 0 && !guardianRefineError && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {stepErrors.map((m, i) => (
            <p key={i}>{m}</p>
          ))}
        </div>
      )}

      {submitError && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* ========== STEP 1: Personal Details ========== */}
        {step === 1 && (
          <section className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  {...register('firstName')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                {fieldError('firstName')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  {...register('lastName')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                {fieldError('lastName')}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                {...register('dateOfBirth')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              {fieldError('dateOfBirth')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                {...register('gender')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="">Select...</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              {fieldError('gender')}
            </div>
          </section>
        )}

        {/* ========== STEP 2: Guardian Details ========== */}
        {step === 2 && (
          <section className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Guardian Name</label>
              <input
                {...register('guardianName')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              {fieldError('guardianName')}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Guardian Phone</label>
                <input
                  {...register('guardianPhone')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                {fieldError('guardianPhone')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Guardian Email</label>
                <input
                  type="email"
                  {...register('guardianEmail')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                {fieldError('guardianEmail')}
              </div>
            </div>

            {guardianRefineError && (
              <p className="rounded border border-amber-200 bg-amber-50 p-2 text-sm text-amber-800">
                Either Guardian Phone or Guardian Email must be provided.
              </p>
            )}

            <p className="text-xs text-gray-400">
              Provide at least one contact method (phone or email) for the guardian.
              {guardianPhone || guardianEmail ? ' ✓' : ''}
            </p>
          </section>
        )}

        {/* ========== STEP 3: Address, Class & Session ========== */}
        {step === 3 && (
          <section className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                {...register('address')}
                rows={2}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              {fieldError('address')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Previous School</label>
              <input
                {...register('previousSchool')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Class / Section</label>
                <select
                  {...register('classId')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="">Select class...</option>
                  {(classes ?? []).map(c => (
                    <option key={c.id} value={c.id}>{c.name} (cap. {c.capacity})</option>
                  ))}
                </select>
                {fieldError('classId')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Academic Session / Term</label>
                <select
                  {...register('sessionId')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="">Select session...</option>
                  {(sessions ?? []).flatMap(s =>
                    (s.terms ?? []).map(t => (
                      <option key={t.id} value={t.id}>{s.name} — {t.name}</option>
                    ))
                  )}
                </select>
                {fieldError('sessionId')}
              </div>
            </div>
          </section>
        )}

        {/* ========== STEP 4: Review & Submit ========== */}
        {step === 4 && (
          <section className="space-y-4">
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm">
              <h3 className="mb-2 font-semibold text-gray-800">Review before submitting</h3>
              <dl className="space-y-1">
                <div className="flex gap-2"><dt className="w-28 font-medium text-gray-500">Name:</dt><dd>{watch('firstName')} {watch('lastName')}</dd></div>
                <div className="flex gap-2"><dt className="w-28 font-medium text-gray-500">DOB:</dt><dd>{watch('dateOfBirth')}</dd></div>
                <div className="flex gap-2"><dt className="w-28 font-medium text-gray-500">Gender:</dt><dd>{watch('gender')}</dd></div>
                <div className="flex gap-2"><dt className="w-28 font-medium text-gray-500">Guardian:</dt><dd>{watch('guardianName')}</dd></div>
                <div className="flex gap-2"><dt className="w-28 font-medium text-gray-500">Contact:</dt><dd>{watch('guardianPhone') || watch('guardianEmail') || '—'}</dd></div>
                <div className="flex gap-2"><dt className="w-28 font-medium text-gray-500">Address:</dt><dd>{watch('address')}</dd></div>
                <div className="flex gap-2"><dt className="w-28 font-medium text-gray-500">Prev School:</dt><dd>{watch('previousSchool') || '—'}</dd></div>
                <div className="flex gap-2">
                  <dt className="w-28 font-medium text-gray-500">Class:</dt>
                  <dd>{classes?.find(c => c.id === watch('classId'))?.name ?? watch('classId')}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-28 font-medium text-gray-500">Session:</dt>
                  <dd>{sessions?.flatMap(s => s.terms).find(t => t.id === watch('sessionId'))?.name ?? watch('sessionId')}</dd>
                </div>
              </dl>
            </div>
          </section>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between border-t pt-4">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Back
              </button>
            )}
          </div>

          <div>
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-md bg-violet-600 px-6 py-2 text-sm font-medium text-white hover:bg-violet-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-violet-600 px-6 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Register & Enroll'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
