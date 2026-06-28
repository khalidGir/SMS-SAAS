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

    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.netAmount, 0);
    const totalCollected = schoolPayments
      .filter(p => p.status === 'Confirmed' && !p.isVoided)
      .reduce((sum, p) => sum + p.amount, 0);
    const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.outstandingAmount, 0);
    const activeStudents = students.filter(s => s.status === 'ACTIVE').length;
    const overdueInvoices = invoices.filter(inv => inv.temporalStatus === 'OVERDUE').length;

    const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

    return HttpResponse.json({
      status: 'success',
      data: {
        totalInvoiced,
        totalCollected,
        totalOutstanding,
        collectionRate,
        activeStudents,
        overdueInvoices,
        totalInvoices: invoices.length,
        totalStudents: students.length,
        totalPayments: schoolPayments.length,
      },
    });
  }),
];
