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

function enrichPayment(payment: ReturnType<typeof store.createPayment>) {
  if (!payment) return null;
  const invoice = store.findInvoiceById(payment.invoiceId);
  const recorder = payment.recordedById ? store.findUserById(payment.recordedById) : null;
  return {
    id: payment.id,
    receiptNo: payment.receiptNo,
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    paymentDate: payment.paymentDate,
    status: payment.status,
    isVoided: payment.isVoided,
    voidedAt: payment.voidedAt,
    voidReason: payment.voidReason,
    invoice: invoice ? {
      invoiceNo: invoice.invoiceNo,
      netAmount: invoice.netAmount,
      outstandingAmount: invoice.outstandingAmount,
      totalAmount: invoice.totalAmount,
      student: (() => {
        const s = store.students.find(st => st.id === invoice.studentId);
        return s ? { firstName: s.firstName, lastName: s.lastName, studentId: s.studentId } : null;
      })(),
    } : null,
    recordedBy: recorder ? { firstName: recorder.firstName, lastName: recorder.lastName } : null,
  };
}

export const paymentHandlers = [
  http.get('/api/v1/payments', ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    const allPayments = store.findAllPayments();
    return HttpResponse.json({ status: 'success', data: allPayments.map(enrichPayment).filter(Boolean) });
  }),

  http.post('/api/v1/payments', async ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const body = (await request.json()) as { invoiceId?: string; amount?: number; paymentMethod?: string; referenceId?: string; notes?: string };
    if (!body.invoiceId || !body.amount || !body.paymentMethod) {
      return HttpResponse.json({ status: 'error', error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } }, { status: 422 });
    }

    const oldInvoice = store.findInvoiceById(body.invoiceId);
    const oldState = oldInvoice ? { paidAmount: oldInvoice.paidAmount, outstandingAmount: oldInvoice.outstandingAmount, paymentStatus: oldInvoice.paymentStatus } : null;

    const payment = store.createPayment({
      invoiceId: body.invoiceId,
      amount: body.amount,
      paymentMethod: body.paymentMethod,
      status: 'Confirmed',
      referenceId: body.referenceId || null,
      recordedById: user.id,
    });

    const invoice = store.findInvoiceById(body.invoiceId);
    if (invoice) {
      invoice.paidAmount += body.amount;
      invoice.outstandingAmount = Math.max(0, invoice.netAmount - invoice.paidAmount);
      const newStatus = invoice.outstandingAmount <= 0 ? 'PAID' : 'PARTIALLY_PAID';
      invoice.paymentStatus = newStatus;
    }

    store.appendAuditLog('PAYMENT_RECORDED', 'Payment', payment.id, oldState, invoice ? { paidAmount: invoice.paidAmount, outstandingAmount: invoice.outstandingAmount, paymentStatus: invoice.paymentStatus } : null, user.id, user.schoolId);

    return HttpResponse.json({ status: 'success', data: enrichPayment(payment) });
  }),

  http.patch('/api/v1/payments/:id/void', async ({ request, params }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const paymentId = params.id as string;
    const body = (await request.json()) as { reason?: string };
    const reason = body?.reason || 'Manually voided';

    const payment = store.voidPayment(paymentId, reason);
    if (!payment) {
      return HttpResponse.json({ status: 'error', error: { code: 'NOT_FOUND', message: 'Payment not found or already voided' } }, { status: 404 });
    }

    store.appendAuditLog('PAYMENT_VOIDED', 'Payment', paymentId, { status: 'Confirmed' }, { status: 'Voided', reason }, user.id, user.schoolId);

    return HttpResponse.json({ status: 'success', data: enrichPayment(payment) });
  }),
];
