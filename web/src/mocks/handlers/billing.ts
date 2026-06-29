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

export const billingHandlers = [
  http.get('/api/v1/invoices', ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
    const schoolId = user.schoolId;
    const invoices = schoolId ? store.findInvoicesBySchool(schoolId) : store.invoices;
    return HttpResponse.json({ status: 'success', data: invoices.map(enrichInvoice).filter(Boolean) });
  }),
];
