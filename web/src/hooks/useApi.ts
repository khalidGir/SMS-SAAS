'use client';

import { useState, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends ApiState<T> {
  request: (method: string, path: string, body?: unknown) => Promise<T | null>;
  reset: () => void;
}

/**
 * Authorized API hook.
 *
 * Reads the access token from sessionStorage (set by AuthProvider on login)
 * and attaches it as `Authorization: Bearer <token>` on every request.
 *
 * Usage:
 *   const { data, loading, error, request } = useApi<StudentType>();
 *   await request('POST', '/api/v1/students', formData);
 */
export function useApi<T = unknown>(): UseApiReturn<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const request = useCallback(async (method: string, path: string, body?: unknown): Promise<T | null> => {
    setState({ data: null, loading: true, error: null });

    try {
      const token = sessionStorage.getItem('accessToken');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const json = await res.json();

      if (!res.ok) {
        const msg = json.error?.message || json.error?.fields
          ? Object.values(json.error.fields).flat().join(', ')
          : `Request failed (${res.status})`;
        setState({ data: null, loading: false, error: msg });
        return null;
      }

      setState({ data: json.data, loading: false, error: null });
      return json.data as T;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setState({ data: null, loading: false, error: msg });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, request, reset };
}
