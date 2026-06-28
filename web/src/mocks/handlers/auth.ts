import { http, HttpResponse } from 'msw';
import { store } from '../store';

function b64json(payload: Record<string, unknown>) {
  return btoa(JSON.stringify(payload));
}

function makeTokens(userId: string, schoolId: string | null, role: string, email: string) {
  const accessPayload = { sub: userId, schoolId, role, email, iat: Date.now(), exp: Date.now() + 15 * 60 * 1000 };
  const refreshPayload = { sub: userId, iat: Date.now(), exp: Date.now() + 7 * 24 * 60 * 60 * 1000 };
  return {
    accessToken: `mock-jwt.${b64json(accessPayload)}.sig`,
    refreshToken: `mock-refresh.${b64json(refreshPayload)}.sig`,
  };
}

function userToProfile(u: NonNullable<ReturnType<typeof store.findUserByEmail>>) {
  const school = u.schoolId ? store.findSchoolById(u.schoolId) : null;
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    schoolId: u.schoolId,
    schoolName: school?.name ?? '',
  };
}

export const authHandlers = [
  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    const { email, password } = body || {};
    if (!email || !password) {
      return HttpResponse.json(
        { status: 'error', error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } },
        { status: 422 },
      );
    }

    const user = store.findUserByEmail(email);
    if (!user) {
      return HttpResponse.json(
        { status: 'error', error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
        { status: 401 },
      );
    }

    const tokens = makeTokens(user.id, user.schoolId, user.role, user.email);
    const profile = userToProfile(user);

    return HttpResponse.json({
      status: 'success',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: profile,
      },
    }, {
      status: 200,
      headers: {
        'Set-Cookie': `refreshToken=${tokens.refreshToken}; Path=/; SameSite=Strict`,
      },
    });
  }),

  http.post('/api/v1/auth/refresh', async ({ cookies }) => {
    const token = cookies?.refreshToken || '';
    if (!token) {
      return HttpResponse.json(
        { status: 'error', error: { code: 'MISSING_REFRESH_TOKEN', message: 'Not authenticated' } },
        { status: 401 },
      );
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user = store.findUserById(payload.sub);
      if (!user || user.status !== 'Active') throw new Error();
      const tokens = makeTokens(user.id, user.schoolId, user.role, user.email);
      const profile = userToProfile(user);
      return HttpResponse.json({
        status: 'success',
        data: { accessToken: tokens.accessToken, user: profile },
      });
    } catch {
      return HttpResponse.json(
        { status: 'error', error: { code: 'INVALID_REFRESH_TOKEN', message: 'Session expired' } },
        { status: 401 },
      );
    }
  }),

  http.post('/api/v1/auth/logout', () => {
    return HttpResponse.json({ status: 'success', message: 'Logged out' });
  }),
];
