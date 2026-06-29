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

export const parentHandlers = [
  http.get('/api/v1/parent/students', ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const household = store.findHouseholdByUserId(user.id);
    if (!household) return HttpResponse.json({ status: 'success', data: [] });

    const linked = store.findStudentsByHousehold(household.id);
    const result = linked.map(s => {
      const enrollments = store.findEnrollmentsByStudent(s.id);
      return {
        id: s.id,
        studentId: s.studentId,
        firstName: s.firstName,
        lastName: s.lastName,
        status: s.status,
        guardianName: s.guardianName,
        guardianPhone: s.guardianPhone,
        guardianEmail: s.guardianEmail,
        enrollments: enrollments.map(e => ({
          class: store.findClassById(e.classId) ? { name: store.findClassById(e.classId)!.name } : null,
          session: store.findSessionById(e.sessionId) ? { name: store.findSessionById(e.sessionId)!.name, status: store.findSessionById(e.sessionId)!.status } : null,
        })),
      };
    });

    return HttpResponse.json({ status: 'success', data: result });
  }),

  http.get('/api/v1/parent/invoices', ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const household = store.findHouseholdByUserId(user.id);
    if (!household) return HttpResponse.json({ status: 'success', data: [] });

    const invoices = store.findInvoicesByHousehold(household.id)
      .filter(i => i.paymentStatus !== 'VOIDED');

    return HttpResponse.json({ status: 'success', data: invoices.map(enrichInvoice).filter(Boolean) });
  }),

  http.post('/api/v1/parent/payments', async ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const body = (await request.json()) as { invoiceId?: string; amount?: number; paymentMethod?: string };
    const { invoiceId, amount, paymentMethod } = body || {};
    if (!invoiceId || !amount || !paymentMethod) {
      return HttpResponse.json({ status: 'error', error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } }, { status: 422 });
    }

    const invoice = store.findInvoiceById(invoiceId);
    if (!invoice) {
      return HttpResponse.json({ status: 'error', error: { code: 'NOT_FOUND', message: 'Invoice not found' } }, { status: 404 });
    }

    const convenienceFee = Math.min(amount * 0.025, 500);
    const totalCharged = amount + convenienceFee;
    const txRef = `TXR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const payment = store.createPayment({
      invoiceId,
      amount,
      paymentMethod,
      status: 'PENDING',
      referenceId: txRef,
      recordedById: null,
    });

    const method = paymentMethod.toLowerCase();
    const checkoutUrl = `/mock-gateway/${method}?payment_id=${payment.id}&tx_ref=${txRef}&amount=${totalCharged}`;

    return HttpResponse.json({
      status: 'success',
      data: {
        payment: {
          id: payment.id,
          receiptNo: payment.receiptNo,
          amount: payment.amount,
          convenienceFee,
          totalCharged,
          paymentDate: payment.paymentDate,
          status: payment.status,
        },
        gateway: {
          type: paymentMethod as 'CHAPA' | 'TELEBIRR',
          checkoutUrl,
          transactionRef: txRef,
        },
      },
    });
  }),

  http.post('/api/v1/parent/payments/:id/confirm', ({ request, params }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const paymentId = params.id as string;
    const result = store.confirmPayment(paymentId);
    if (!result) {
      return HttpResponse.json({ status: 'error', error: { code: 'NOT_FOUND', message: 'Payment not found' } }, { status: 404 });
    }

    store.appendAuditLog('PAYMENT_CONFIRMED', 'Payment', paymentId, { status: 'PENDING' }, { status: 'Confirmed' }, user.id, user.schoolId);

    return HttpResponse.json({
      status: 'success',
      data: {
        payment: {
          id: result.payment.id,
          receiptNo: result.payment.receiptNo,
          amount: result.payment.amount,
          paymentDate: result.payment.paymentDate,
          status: result.payment.status,
        },
        invoice: {
          id: result.invoice!.id,
          invoiceNo: result.invoice!.invoiceNo,
          paidAmount: result.invoice!.paidAmount,
          outstandingAmount: result.invoice!.outstandingAmount,
          paymentStatus: result.invoice!.paymentStatus,
        },
      },
    });
  }),
];
