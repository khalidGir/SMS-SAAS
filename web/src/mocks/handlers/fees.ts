import { http, HttpResponse } from 'msw';
import { store } from '../store';

function parseToken(request: Request) {
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;
  try {
    return JSON.parse(atob(auth.slice(7).split('.')[1])) as {
      sub: string; schoolId: string; role: string; email: string;
    };
  } catch { return null; }
}

export const feeHandlers = [
  http.get('/api/v1/fees', ({ request }) => {
    const token = parseToken(request);
    if (!token) {
      return HttpResponse.json(
        { status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 },
      );
    }

    const fees = store.findFeeStructuresBySchool(token.schoolId).map(f => {
      const term = store.findTermById(f.termId);
      return { ...f, term: term ? { id: term.id, name: term.name } : undefined };
    });

    return HttpResponse.json({ status: 'success', data: fees });
  }),

  http.post('/api/v1/fees', async ({ request }) => {
    const token = parseToken(request);
    if (!token) {
      return HttpResponse.json(
        { status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const { name, termId, baseAmount, dueDate, lateFeeRate, lateFeeType, frequency, status } = body || {};

    if (!name || !termId || baseAmount == null) {
      return HttpResponse.json(
        { status: 'error', error: { code: 'VALIDATION_ERROR', message: 'Name, term, and base amount are required' } },
        { status: 422 },
      );
    }

    const fee = store.createFeeStructure({
      schoolId: token.schoolId,
      name: name as string,
      termId: termId as string,
      baseAmount: baseAmount as number,
      dueDate: dueDate as string || '',
      lateFeeRate: (lateFeeRate as number) || 0,
      lateFeeType: (lateFeeType as string) || 'FLAT',
      frequency: (frequency as string) || 'Termly',
      status: (status as string) || 'Active',
    });

    const term = store.findTermById(fee.termId);
    const result = { ...fee, term: term ? { id: term.id, name: term.name } : undefined };

    store.appendAuditLog('FEE_CREATED', 'FeeStructure', fee.id, null, { name: fee.name }, token.sub, token.schoolId);

    return HttpResponse.json({ status: 'success', data: result }, { status: 201 });
  }),

  http.put('/api/v1/fees/:id', async ({ params, request }) => {
    const token = parseToken(request);
    if (!token) {
      return HttpResponse.json(
        { status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const id = params.id as string;

    const updated = store.updateFeeStructure(id, body as any);
    if (!updated) {
      return HttpResponse.json(
        { status: 'error', error: { code: 'NOT_FOUND', message: 'Fee structure not found' } },
        { status: 404 },
      );
    }

    const term = store.findTermById(updated.termId);
    const result = { ...updated, term: term ? { id: term.id, name: term.name } : undefined };

    store.appendAuditLog('FEE_UPDATED', 'FeeStructure', id, null, { name: updated.name }, token.sub, token.schoolId);

    return HttpResponse.json({ status: 'success', data: result });
  }),

  http.delete('/api/v1/fees/:id', ({ params, request }) => {
    const token = parseToken(request);
    if (!token) {
      return HttpResponse.json(
        { status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 },
      );
    }

    const id = params.id as string;
    const deleted = store.deleteFeeStructure(id);
    if (!deleted) {
      return HttpResponse.json(
        { status: 'error', error: { code: 'NOT_FOUND', message: 'Fee structure not found' } },
        { status: 404 },
      );
    }

    store.appendAuditLog('FEE_DELETED', 'FeeStructure', id, null, { name: deleted.name }, token.sub, token.schoolId);

    return HttpResponse.json({ status: 'success', message: 'Fee structure deactivated' });
  }),
];
