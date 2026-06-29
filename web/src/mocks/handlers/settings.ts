import { http, HttpResponse } from 'msw';
import { store } from '../store';

function resolveUser(request: Request) {
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;
  try {
    const payload = JSON.parse(atob(auth.slice(7).split('.')[1]));
    return store.findUserById(payload.sub);
  } catch {
    return null;
  }
}

export const settingsHandlers = [
  http.get('/api/v1/settings/school', ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    const settings = store.getSchoolSettings(user.schoolId || '');
    return HttpResponse.json({ status: 'success', data: settings });
  }),

  http.put('/api/v1/settings/school', async ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const body = (await request.json()) as Record<string, unknown>;
    const old = store.getSchoolSettings(user.schoolId || '');
    const updated = store.updateSchoolSettings(user.schoolId || '', body);

    store.appendAuditLog('SETTINGS_UPDATED', 'SchoolSettings', user.schoolId || '', old, body, user.id, user.schoolId);

    return HttpResponse.json({ status: 'success', data: updated });
  }),
];
