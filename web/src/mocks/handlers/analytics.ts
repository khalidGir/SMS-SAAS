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

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

function isThisMonth(dateStr: string) {
  const d = new Date(dateStr);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth();
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

    // ── Core metrics (all school roles) ────────────
    const totalOutstandingFees = invoices.reduce((sum, inv) => sum + inv.outstandingAmount, 0);
    const totalCollected = schoolPayments
      .filter(p => p.status === 'Confirmed' && !p.isVoided)
      .reduce((sum, p) => sum + p.amount, 0);
    const activeStudentCount = students.filter(s => s.status === 'ACTIVE').length;
    const pendingEnrollmentCount = students.filter(s => s.status === 'PENDING').length;
    const activeInvoiceCount = invoices.filter(i => i.paymentStatus !== 'PAID' && i.paymentStatus !== 'VOIDED').length;

    const data: Record<string, any> = {
      totalOutstandingFees,
      totalCollected,
      activeInvoiceCount,
      activeStudentCount,
      pendingEnrollmentCount,
      role: user.role,
    };

    // ── SUPER_ADMIN ────────────────────────────────
    if (user.role === 'SUPER_ADMIN') {
      const allSchools = store.schools;
      data.totalSchools = allSchools.length;
      data.activeSchools = allSchools.filter((s: any) => s.status === 'ACTIVE').length;
      data.suspendedSchools = allSchools.filter((s: any) => s.status === 'SUSPENDED').length;
      data.platformUsers = store.users.length;
    }

    // ── REGISTRAR ──────────────────────────────────
    if (user.role === 'REGISTRAR' && schoolId) {
      const schoolClasses = store.classes.filter(c => c.schoolId === schoolId);
      const schoolEnrollments = store.enrollments.filter(e => {
        const student = store.findStudentById(e.studentId);
        return student?.schoolId === schoolId;
      });
      const totalCapacity = schoolClasses.reduce((sum: number, c: any) => sum + (c.capacity || 0), 0);
      const activeEnrollments = schoolEnrollments.filter((e: any) => e.status === 'Active').length;
      const maleCount = students.filter((s: any) => s.gender === 'MALE').length;
      const femaleCount = students.filter((s: any) => s.gender === 'FEMALE').length;

      data.totalClasses = schoolClasses.length;
      data.totalCapacity = totalCapacity;
      data.enrollmentRate = totalCapacity > 0 ? Math.round((activeEnrollments / totalCapacity) * 100) / 100 : 0;
      data.suspendedStudentCount = students.filter((s: any) => s.status === 'SUSPENDED').length;
      data.maleFemaleRatio = femaleCount > 0 ? Math.round((maleCount / femaleCount) * 10) / 10 : maleCount;
    }

    // ── ACCOUNTANT ─────────────────────────────────
    if (user.role === 'ACCOUNTANT') {
      const totalBilled = invoices.reduce((sum, inv) => sum + inv.netAmount, 0);
      data.collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 10000) / 100 : 0;
      data.overdueCount = invoices.filter(i => i.temporalStatus === 'OVERDUE').length;
      data.overdueTotal = invoices.filter(i => i.temporalStatus === 'OVERDUE').reduce((sum, i) => sum + i.outstandingAmount, 0);
      data.paymentsThisMonth = schoolPayments.filter(p => isThisMonth(p.paymentDate)).length;

      const methodBreakdown: Record<string, number> = { CASH: 0, BANK_TRANSFER: 0, TELEBIRR: 0, CHEQUE: 0, CARD: 0 };
      for (const p of schoolPayments.filter(p => p.status === 'Confirmed' && !p.isVoided)) {
        const method = p.paymentMethod;
        if (method in methodBreakdown) methodBreakdown[method]++;
        else methodBreakdown[method] = 1;
      }
      data.paymentMethodBreakdown = methodBreakdown;

      // A/R aging buckets
      const now = new Date();
      const agingBuckets = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
      for (const inv of invoices.filter(i => i.paymentStatus !== 'PAID' && i.paymentStatus !== 'VOIDED')) {
        const due = new Date(inv.dueDate);
        const daysOverdue = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
        if (daysOverdue <= 30) agingBuckets['0-30'] += inv.outstandingAmount;
        else if (daysOverdue <= 60) agingBuckets['31-60'] += inv.outstandingAmount;
        else if (daysOverdue <= 90) agingBuckets['61-90'] += inv.outstandingAmount;
        else agingBuckets['90+'] += inv.outstandingAmount;
      }
      data.agingBuckets = agingBuckets;
    }

    // ── CASHIER ────────────────────────────────────
    if (user.role === 'CASHIER') {
      const todayPayments = schoolPayments.filter(p => isToday(p.paymentDate));
      data.todayCollectionCount = todayPayments.length;
      data.todayCollectionAmount = todayPayments
        .filter(p => p.status === 'Confirmed' && !p.isVoided)
        .reduce((sum, p) => sum + p.amount, 0);

      const recent = [...schoolPayments]
        .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
        .slice(0, 5)
        .map(p => {
          const inv = store.findInvoiceById(p.invoiceId);
          const student = inv ? store.findStudentById(inv.studentId) : null;
          return {
            receiptNo: p.receiptNo,
            amount: p.amount,
            paymentMethod: p.paymentMethod,
            paymentDate: p.paymentDate,
            studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
          };
        });
      data.recentPayments = recent;
    }

    // ── PARENT (household-scoped) ──────────────────
    if (user.role === 'PARENT') {
      const household = store.findHouseholdByUserId(user.id);
      if (household) {
        const householdInvoices = store.findInvoicesByHousehold(household.id);
        const unpaid = householdInvoices.filter(i => i.paymentStatus !== 'PAID' && i.paymentStatus !== 'VOIDED');
        data.upcomingDueCount = unpaid.length;
        if (unpaid.length > 0) {
          const sorted = [...unpaid].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
          data.nextDueDate = sorted[0].dueDate;
          data.nextDueAmount = sorted[0].outstandingAmount;
        } else {
          data.nextDueDate = null;
          data.nextDueAmount = 0;
        }
      } else {
        data.upcomingDueCount = 0;
        data.nextDueDate = null;
        data.nextDueAmount = 0;
      }
    }

    return HttpResponse.json({
      status: 'success',
      data,
    });
  }),
];
