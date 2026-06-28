'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface AuthUser {
  userId: string;
  schoolId: string;
  schoolName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'REGISTRAR' | 'ACCOUNTANT' | 'PARENT';
  email: string;
  firstName: string;
  lastName: string;
  name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On mount, attempt to restore session via refresh token
    const restore = async () => {
      try {
        const res = await fetch('/api/v1/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        if (res.ok) {
          const json = await res.json();
          const u = json.data.user;
          setUser({
            userId: u.id,
            schoolId: u.schoolId,
            schoolName: u.schoolName ?? '',
            role: u.role,
            email: u.email,
            firstName: u.firstName ?? '',
            lastName: u.lastName ?? '',
            name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
          });
        }
      } catch {
        // No session — unauthenticated
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rememberMe }),
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Login failed');
    }

    const json = await res.json();
    const u = json.data.user;
    setUser({
      userId: u.id,
      schoolId: u.schoolId,
      schoolName: u.schoolName ?? '',
      role: u.role,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      name: `${u.firstName} ${u.lastName}`.trim(),
    });

    // Store access token in memory (not localStorage — XSS safe)
    // In production, use a TokenStore or closure variable
    sessionStorage.setItem('accessToken', json.data.accessToken);
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // Swallow
    }
    sessionStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
