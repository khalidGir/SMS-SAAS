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

  http.post('/api/v1/students', async ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const body = (await request.json()) as Record<string, any>;
    if (!body.firstName || !body.lastName || !body.dateOfBirth || !body.gender || !body.guardianName) {
      return HttpResponse.json({ status: 'error', error: { code: 'VALIDATION_ERROR', message: 'firstName, lastName, dateOfBirth, gender, and guardianName are required' } }, { status: 422 });
    }

    const student = store.createStudent({
      firstName: body.firstName,
      lastName: body.lastName,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      guardianName: body.guardianName,
      guardianPhone: body.guardianPhone || null,
      guardianEmail: body.guardianEmail || null,
      address: body.address || null,
      previousSchool: body.previousSchool || null,
      schoolId: user.schoolId || 'school-1',
    });

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

  http.get('/api/v1/classes', ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const schoolId = user.schoolId;
    const classes = schoolId ? store.findClassesBySchool(schoolId) : store.classes;
    const enriched = classes.map(c => ({
      ...c,
      enrolledCount: store.enrollments.filter(e => e.classId === c.id && e.status === 'Active').length,
    }));
    return HttpResponse.json({ status: 'success', data: enriched });
  }),

  http.post('/api/v1/classes', async ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const body = (await request.json()) as { name?: string; capacity?: number };
    if (!body.name || body.capacity == null) {
      return HttpResponse.json({ status: 'error', error: { code: 'VALIDATION_ERROR', message: 'Name and capacity are required' } }, { status: 422 });
    }

    const cls = store.createClass({
      schoolId: user.schoolId,
      name: body.name,
      capacity: body.capacity,
    });

    store.appendAuditLog('CLASS_CREATED', 'Class', cls.id, null, { name: cls.name }, user.id, user.schoolId);
    return HttpResponse.json({ status: 'success', data: cls }, { status: 201 });
  }),

  http.put('/api/v1/classes/:id', async ({ params, request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const body = (await request.json()) as { name?: string; capacity?: number };
    const cls = store.updateClass(params.id as string, body);
    if (!cls) {
      return HttpResponse.json({ status: 'error', error: { code: 'NOT_FOUND', message: 'Class not found' } }, { status: 404 });
    }

    store.appendAuditLog('CLASS_UPDATED', 'Class', cls.id, null, { name: cls.name }, user.id, user.schoolId);
    return HttpResponse.json({ status: 'success', data: cls });
  }),

  http.delete('/api/v1/classes/:id', ({ params, request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const id = params.id as string;

    const activeEnrollments = store.enrollments.filter(e => e.classId === id && e.status === 'Active');
    if (activeEnrollments.length > 0) {
      return HttpResponse.json({ status: 'error', error: { code: 'HAS_ENROLLMENTS', message: `Cannot delete class with ${activeEnrollments.length} active enrollment(s). Reassign or withdraw students first.` } }, { status: 409 });
    }

    const removed = store.deleteClass(id);
    if (!removed) {
      return HttpResponse.json({ status: 'error', error: { code: 'NOT_FOUND', message: 'Class not found' } }, { status: 404 });
    }

    store.appendAuditLog('CLASS_DELETED', 'Class', id, null, { name: removed.name }, user.id, user.schoolId);
    return HttpResponse.json({ status: 'success', message: 'Class deleted' });
  }),

  http.get('/api/v1/enrollments', ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const schoolId = user.schoolId;
    const schoolStudents = schoolId ? store.findStudentsBySchool(schoolId) : store.students;
    const studentIds = new Set(schoolStudents.map(s => s.id));
    const enrollments = store.enrollments.filter(e => studentIds.has(e.studentId));

    const result = enrollments.map(e => ({
      id: e.id,
      studentId: e.studentId,
      classId: e.classId,
      sessionId: e.sessionId,
      enrollmentDate: e.enrollmentDate,
      status: e.status,
      student: store.findStudentById(e.studentId)
        ? { firstName: store.findStudentById(e.studentId)!.firstName, lastName: store.findStudentById(e.studentId)!.lastName }
        : null,
      class: store.findClassById(e.classId) ? { name: store.findClassById(e.classId)!.name } : null,
      session: store.findSessionById(e.sessionId) ? { name: store.findSessionById(e.sessionId)!.name } : null,
    }));

    return HttpResponse.json({ status: 'success', data: result });
  }),

  http.post('/api/v1/enrollments', async ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const body = (await request.json()) as { studentId?: string; classId?: string; sessionId?: string };
    if (!body.studentId || !body.classId || !body.sessionId) {
      return HttpResponse.json({ status: 'error', error: { code: 'VALIDATION_ERROR', message: 'studentId, classId, and sessionId are required' } }, { status: 422 });
    }

    const enrollment = store.createEnrollment({
      studentId: body.studentId,
      classId: body.classId,
      sessionId: body.sessionId,
    });

    return HttpResponse.json({
      status: 'success',
      data: {
        ...enrollment,
        student: store.findStudentById(enrollment.studentId)
          ? { firstName: store.findStudentById(enrollment.studentId)!.firstName, lastName: store.findStudentById(enrollment.studentId)!.lastName }
          : null,
        class: store.findClassById(enrollment.classId) ? { name: store.findClassById(enrollment.classId)!.name } : null,
        session: store.findSessionById(enrollment.sessionId) ? { name: store.findSessionById(enrollment.sessionId)!.name } : null,
      },
    });
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
