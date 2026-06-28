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

function enrichStudent(studentId: string) {
  const s = store.students.find(st => st.id === studentId);
  if (!s) return null;
  return { id: s.id, studentId: s.studentId, firstName: s.firstName, lastName: s.lastName, status: s.status };
}

function enrichInvoice(invoice: ReturnType<typeof store.findInvoiceById>) {
  if (!invoice) return null;
  const student = enrichStudent(invoice.studentId);
  const feeStructure = store.findFeeStructureById(invoice.feeStructureId);
  const term = store.findTermById(invoice.termId);
  const payments = store.findPaymentsByInvoice(invoice.id);
  return {
    ...invoice,
    student,
    feeStructure: feeStructure ? { name: feeStructure.name } : null,
    term: term ? { name: term.name } : null,
    payments: payments.map(p => ({
      id: p.id, amount: p.amount, paymentMethod: p.paymentMethod,
      paymentDate: p.paymentDate, status: p.status, isVoided: p.isVoided,
    })),
  };
}

function enrichPayment(payment: ReturnType<typeof store.createPayment>) {
  if (!payment) return null;
  const invoice = store.findInvoiceById(payment.invoiceId);
  const student = invoice ? enrichStudent(invoice.studentId) : null;
  const recorder = payment.recordedById ? store.findUserById(payment.recordedById) : null;
  return {
    id: payment.id, receiptNo: payment.receiptNo, amount: payment.amount,
    paymentMethod: payment.paymentMethod, paymentDate: payment.paymentDate,
    status: payment.status, isVoided: payment.isVoided,
    voidedAt: payment.voidedAt, voidReason: payment.voidReason,
    invoice: invoice ? { invoiceNo: invoice.invoiceNo, netAmount: invoice.netAmount, outstandingAmount: invoice.outstandingAmount, totalAmount: invoice.totalAmount } : null,
    student,
    recordedBy: recorder ? { firstName: recorder.firstName, lastName: recorder.lastName } : null,
  };
}

export const reportHandlers = [
  http.get('/api/v1/reports/invoice-aging', ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status') || '';
    const schoolId = user.schoolId;
    const invoices = schoolId ? store.findInvoicesBySchool(schoolId) : store.invoices;

    let filtered = invoices.filter(i => i.paymentStatus !== 'VOIDED');
    if (statusFilter) filtered = filtered.filter(i => i.temporalStatus === statusFilter || i.paymentStatus === statusFilter);

    const now = Date.now();
    const rows = filtered.map(inv => {
      const student = enrichStudent(inv.studentId);
      const due = new Date(inv.dueDate).getTime();
      const daysOverdue = inv.temporalStatus === 'OVERDUE' ? Math.max(0, Math.floor((now - due) / 86400000)) : 0;
      return {
        invoiceNo: inv.invoiceNo,
        studentName: student ? `${student.firstName} ${student.lastName}` : '—',
        studentId: student?.studentId ?? '—',
        netAmount: inv.netAmount,
        paidAmount: inv.paidAmount,
        outstandingAmount: inv.outstandingAmount,
        dueDate: inv.dueDate,
        daysOverdue,
        paymentStatus: inv.paymentStatus,
        temporalStatus: inv.temporalStatus,
      };
    });

    const totals = rows.reduce((acc, r) => ({
      netAmount: acc.netAmount + r.netAmount,
      paidAmount: acc.paidAmount + r.paidAmount,
      outstandingAmount: acc.outstandingAmount + r.outstandingAmount,
    }), { netAmount: 0, paidAmount: 0, outstandingAmount: 0 });

    return HttpResponse.json({ status: 'success', data: { rows, totals } });
  }),

  http.get('/api/v1/reports/payment-ledger', ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const schoolId = user.schoolId;
    const allPayments = store.findAllPayments();
    const filtered = schoolId
      ? allPayments.filter(p => {
          const inv = store.findInvoiceById(p.invoiceId);
          return inv?.schoolId === schoolId;
        })
      : allPayments;

    const rows = filtered.map(enrichPayment).filter(Boolean);
    const totalAmount = rows.reduce((sum, r) => sum + (r?.amount ?? 0), 0);

    return HttpResponse.json({ status: 'success', data: { rows, totalAmount } });
  }),

  http.get('/api/v1/reports/student-fee-status', ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status') || '';
    const schoolId = user.schoolId;
    const students = schoolId ? store.findStudentsBySchool(schoolId) : store.students;

    const rows = students.map(s => {
      const invoices = store.findInvoicesByStudent(s.id);
      const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.netAmount, 0);
      const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
      const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.outstandingAmount, 0);
      const invoiceCount = invoices.length;
      const unpaidCount = invoices.filter(i => i.paymentStatus === 'UNPAID' || i.paymentStatus === 'PENDING').length;
      const enrollments = store.findEnrollmentsByStudent(s.id);
      return {
        studentId: s.studentId,
        studentName: `${s.firstName} ${s.lastName}`,
        status: s.status,
        className: enrollments.map(e => store.findClassById(e.classId)?.name).filter(Boolean).join(', '),
        totalInvoiced,
        totalPaid,
        totalOutstanding,
        invoiceCount,
        unpaidCount,
      };
    });

    let filtered = rows;
    if (statusFilter) filtered = filtered.filter(r => r.status === statusFilter);

    return HttpResponse.json({ status: 'success', data: { rows: filtered } });
  }),
];
