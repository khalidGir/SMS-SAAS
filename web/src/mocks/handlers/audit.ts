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

export const auditHandlers = [
  http.get('/api/v1/audit-logs', ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const schoolId = url.searchParams.get('schoolId') || user.schoolId;

    // SUPER_ADMIN sees all logs; school roles see only their school's logs
    const allowedSchoolId = user.role === 'SUPER_ADMIN'
      ? (schoolId || undefined)
      : user.schoolId;

    const logs = allowedSchoolId
      ? store.getAuditLogs(allowedSchoolId, limit)
      : store.auditLogs.slice(-limit).reverse();

    // Enrich logs with user name
    const enriched = logs.map(log => {
      const logUser = log.userId ? store.findUserById(log.userId) : null;
      return {
        ...log,
        userName: logUser ? `${logUser.firstName} ${logUser.lastName}` : 'System',
        userRole: logUser?.role ?? null,
      };
    });

    return HttpResponse.json({ status: 'success', data: enriched });
  }),
];
