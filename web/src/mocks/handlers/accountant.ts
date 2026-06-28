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

function enrichInvoice(invoice: ReturnType<typeof store.findInvoiceById>) {
  if (!invoice) return null;
  const student = store.students.find(s => s.id === invoice.studentId);
  const feeStructure = store.findFeeStructureById(invoice.feeStructureId);
  const term = store.findTermById(invoice.termId);
  const school = store.findSchoolById(invoice.schoolId);
  const payments = store.findPaymentsByInvoice(invoice.id);
  return {
    ...invoice,
    school: { minPartialPaymentAllowed: school?.minPartialPaymentAllowed ?? 0 },
    student: student ? { firstName: student.firstName, lastName: student.lastName, studentId: student.studentId } : null,
    feeStructure: feeStructure ? { name: feeStructure.name } : null,
    term: term ? { name: term.name } : null,
    payments: payments.map(p => ({
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      paymentDate: p.paymentDate,
      status: p.status,
      isVoided: p.isVoided,
    })),
  };
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

export const accountantHandlers = [
  http.get('/api/v1/invoices', ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    const schoolId = user.schoolId;
    const invoices = schoolId ? store.findInvoicesBySchool(schoolId) : store.invoices;
    return HttpResponse.json({ status: 'success', data: invoices.map(enrichInvoice).filter(Boolean) });
  }),

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
      invoice.paymentStatus = invoice.outstandingAmount <= 0 ? 'PAID' : 'PARTIALLY_PAID';
    }

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
    return HttpResponse.json({ status: 'success', data: enrichPayment(payment) });
  }),
];
