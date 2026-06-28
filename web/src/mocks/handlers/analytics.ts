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

export const analyticsHandlers = [
  http.get('/api/v1/analytics/summary', ({ request }) => {
    const user = resolveUser(request);
    if (!user) return HttpResponse.json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });

    const schoolId = user.schoolId;
    const invoices = schoolId ? store.findInvoicesBySchool(schoolId) : store.invoices;
    const students = schoolId ? store.findStudentsBySchool(schoolId) : store.students;
    const allPayments = store.findAllPayments();
    const schoolPayments = schoolId
      ? allPayments.filter(p => {
          const inv = store.findInvoiceById(p.invoiceId);
          return inv?.schoolId === schoolId;
        })
      : allPayments;

    const totalOutstandingFees = invoices.reduce((sum, inv) => sum + inv.outstandingAmount, 0);
    const totalCollected = schoolPayments
      .filter(p => p.status === 'Confirmed' && !p.isVoided)
      .reduce((sum, p) => sum + p.amount, 0);
    const activeStudentCount = students.filter(s => s.status === 'ACTIVE').length;
    const pendingEnrollmentCount = students.filter(s => s.status === 'PENDING').length;
    const activeInvoiceCount = invoices.filter(i => i.paymentStatus !== 'PAID' && i.paymentStatus !== 'VOIDED').length;

    return HttpResponse.json({
      status: 'success',
      data: {
        totalOutstandingFees,
        totalCollected,
        activeInvoiceCount,
        activeStudentCount,
        pendingEnrollmentCount,
        role: user.role,
      },
    });
  }),
];
