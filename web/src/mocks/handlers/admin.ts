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

export const adminHandlers = [
  http.get('/api/v1/students', ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status');

    const schoolId = user.schoolId;
    let students = schoolId ? store.findStudentsBySchool(schoolId) : store.students;
    if (statusFilter) {
      students = students.filter(s => s.status === statusFilter);
    }
    const result = students.map(s => {
      const enrollments = store.findEnrollmentsByStudent(s.id);
      return {
        ...s,
        enrollments: enrollments.map(e => ({
          id: e.id,
          class: store.findClassById(e.classId) ? { id: e.classId, name: store.findClassById(e.classId)!.name } : null,
          session: store.findSessionById(e.sessionId) ? { id: e.sessionId, name: store.findSessionById(e.sessionId)!.name } : null,
          enrollmentDate: e.enrollmentDate,
          status: e.status,
        })),
      };
    });
    return HttpResponse.json({ status: 'success', data: result });
  }),

  http.patch('/api/v1/students/:id/status', async ({ request, params }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const studentId = params.id as string;
    const body = (await request.json()) as { status?: string; reason?: string };
    if (!body.status) {
      return HttpResponse.json({ status: 'error', error: { code: 'VALIDATION_ERROR', message: 'Status is required' } }, { status: 422 });
    }

    const student = store.updateStudentStatus(studentId, body.status, body.reason);
    if (!student) {
      return HttpResponse.json({ status: 'error', error: { code: 'NOT_FOUND', message: 'Student not found' } }, { status: 404 });
    }
    return HttpResponse.json({ status: 'success', data: student });
  }),

  http.get('/api/v1/academic/sessions', () => {
    const sessions = store.academicSessions.map(s => ({
      ...s,
      terms: store.terms.filter(t => t.academicSessionId === s.id).map(t => ({ id: t.id, name: t.name, startDate: t.startDate, endDate: t.endDate })),
    }));
    return HttpResponse.json({ status: 'success', data: sessions });
  }),

  http.post('/api/v1/academic/sessions', async ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const body = (await request.json()) as { name?: string; startDate?: string; endDate?: string };
    if (!body.name || !body.startDate || !body.endDate) {
      return HttpResponse.json({ status: 'error', error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } }, { status: 422 });
    }

    const session = store.createSession({
      schoolId: user.schoolId || 'school-1',
      name: body.name,
      startDate: body.startDate,
      endDate: body.endDate,
    });
    return HttpResponse.json({ status: 'success', data: session });
  }),

  http.patch('/api/v1/academic/sessions/:id/activate', ({ params }) => {
    const sessionId = params.id as string;
    const session = store.activateSession(sessionId);
    if (!session) {
      return HttpResponse.json({ status: 'error', error: { code: 'NOT_FOUND', message: 'Session not found' } }, { status: 404 });
    }
    return HttpResponse.json({ status: 'success', data: session });
  }),

  http.post('/api/v1/academic/terms', async ({ request }) => {
    const body = (await request.json()) as { academicSessionId?: string; name?: string; startDate?: string; endDate?: string };
    if (!body.academicSessionId || !body.name || !body.startDate || !body.endDate) {
      return HttpResponse.json({ status: 'error', error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } }, { status: 422 });
    }
    const term = store.createTerm({
      academicSessionId: body.academicSessionId,
      name: body.name,
      startDate: body.startDate,
      endDate: body.endDate,
    });
    return HttpResponse.json({ status: 'success', data: term });
  }),
];
