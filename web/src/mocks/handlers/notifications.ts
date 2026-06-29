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

export const notificationHandlers = [
  http.get('/api/v1/notifications/rules', ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    const rules = store.getNotificationRules(user.schoolId || '');
    return HttpResponse.json({ status: 'success', data: rules });
  }),

  http.post('/api/v1/notifications/rules', async ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const body = (await request.json()) as { name?: string; trigger?: string; delayDays?: number; channels?: string[] };
    if (!body.name || !body.trigger) {
      return HttpResponse.json({ status: 'error', error: { code: 'VALIDATION_ERROR', message: 'Name and trigger are required' } }, { status: 422 });
    }

    const rule = store.createNotificationRule({
      schoolId: user.schoolId || '',
      name: body.name,
      trigger: body.trigger,
      delayDays: body.delayDays ?? 0,
      channels: body.channels ?? [],
    });

    return HttpResponse.json({ status: 'success', data: rule }, { status: 201 });
  }),

  http.post('/api/v1/notifications/evaluate', ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const logs = store.evaluateNotificationRules(user.schoolId || '');
    return HttpResponse.json({ status: 'success', data: { triggered: logs.length, logs } });
  }),
];
