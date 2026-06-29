import { SEED } from './data';

function deepClone<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (Array.isArray(obj)) return obj.map(deepClone) as any;
  if (typeof obj === 'object') {
    const clone: Record<string, any> = {};
    for (const k of Object.keys(obj as Record<string, any>))
      clone[k] = deepClone((obj as Record<string, any>)[k]);
    return clone as T;
  }
  return obj;
}

let payCounter = Date.now();

function freshId(prefix: string) {
  return `${prefix}-${++payCounter}`;
}

function generateReceiptNo() {
  const y = new Date().getFullYear();
  const n = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
  return `REC-${y}-${n}`;
}

type StorePayment = {
  id: string; receiptNo: string; invoiceId: string; amount: number;
  paymentMethod: string; paymentDate: string; status: string;
  isVoided: boolean; voidedAt: string | null; voidReason: string | null;
  referenceId: string | null; recordedById: string | null; notes: string | null;
};

type StoreInvoice = {
  id: string; invoiceNo: string; schoolId: string; studentId: string;
  feeStructureId: string; termId: string;
  totalAmount: number; discountAmount: number; lateFeeAmount: number;
  netAmount: number; paidAmount: number; outstandingAmount: number;
  dueDate: string; issuedDate: string;
  paymentStatus: string; temporalStatus: string; notes: string | null;
};

type AuditLog = {
  id: string;
  schoolId: string | null;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValues: string | null;
  newValues: string | null;
  createdAt: string;
};

type NotificationRule = {
  id: string;
  schoolId: string;
  name: string;
  trigger: string;
  delayDays: number;
  channels: string[];
  active: boolean;
};

type NotificationLog = {
  id: string;
  schoolId: string;
  ruleId: string;
  invoiceId: string;
  channels: string[];
  deliveredAt: string;
};

type SchoolSettings = {
  schoolName: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  timezone: string;
  receiptPrefix: string;
  receiptFooter: string;
  minPartialPaymentAllowed: number;
  logoDataUrl: string | null;
};

class InMemoryStore {
  schools: any[] = deepClone(SEED.schools);
  users: any[] = deepClone(SEED.users);
  households: any[] = deepClone(SEED.households);
  householdMembers: any[] = deepClone(SEED.householdMembers);
  academicSessions: any[] = deepClone(SEED.academicSessions);
  terms: any[] = deepClone(SEED.terms);
  classes: any[] = deepClone(SEED.classes);
  feeStructures: any[] = deepClone(SEED.feeStructures);
  students: any[] = deepClone(SEED.students);
  enrollments: any[] = deepClone(SEED.enrollments);
  invoices: StoreInvoice[] = deepClone(SEED.invoices);
  payments: StorePayment[] = deepClone(SEED.payments);
  auditLogs: AuditLog[] = [];
  notificationRules: NotificationRule[] = [];
  notificationLogs: NotificationLog[] = [];
  schoolSettingsMap: Record<string, SchoolSettings> = {};

  reset() {
    Object.assign(this, {
      schools: deepClone(SEED.schools),
      users: deepClone(SEED.users),
      households: deepClone(SEED.households),
      householdMembers: deepClone(SEED.householdMembers),
      academicSessions: deepClone(SEED.academicSessions),
      terms: deepClone(SEED.terms),
      classes: deepClone(SEED.classes),
      feeStructures: deepClone(SEED.feeStructures),
      students: deepClone(SEED.students),
      enrollments: deepClone(SEED.enrollments),
      invoices: deepClone(SEED.invoices),
      payments: deepClone(SEED.payments),
      auditLogs: [],
      notificationRules: [],
      notificationLogs: [],
      schoolSettingsMap: {},
    });
  }

  // ── Users ──────────────────────────────────────
  findUserByEmail(email: string) {
    return this.users.find(u => u.email === email) || null;
  }

  findUserById(id: string) {
    return this.users.find(u => u.id === id) || null;
  }

  // ── Households ──────────────────────────────────
  findHouseholdByUserId(userId: string) {
    const member = this.householdMembers.find(m => m.userId === userId);
    if (!member) return null;
    return this.households.find(h => h.id === member.householdId) || null;
  }

  findStudentsByHousehold(householdId: string) {
    const memberIds = this.householdMembers
      .filter(m => m.householdId === householdId && m.role === 'STUDENT')
      .map(m => m.studentId);
    return this.students.filter(s => memberIds.includes(s.id));
  }

  findInvoicesByHousehold(householdId: string) {
    const studentIds = new Set(this.findStudentsByHousehold(householdId).map(s => s.id));
    return this.invoices.filter(i => studentIds.has(i.studentId));
  }

  // ── Legacy parent bridge ───────────────────────
  findStudentsByParent(parentUserId: string) {
    const household = this.findHouseholdByUserId(parentUserId);
    if (!household) return [];
    return this.findStudentsByHousehold(household.id);
  }

  // ── School ──────────────────────────────────────
  findClassById(id: string) {
    return this.classes.find(c => c.id === id) || null;
  }

  findSessionById(id: string) {
    return this.academicSessions.find(s => s.id === id) || null;
  }

  findSchoolById(id: string) {
    return this.schools.find(s => s.id === id) || null;
  }

  findFeeStructureById(id: string) {
    return this.feeStructures.find(f => f.id === id) || null;
  }

  findTermById(id: string) {
    return this.terms.find(t => t.id === id) || null;
  }

  findInvoiceById(id: string) {
    return this.invoices.find(i => i.id === id) || null;
  }

  findEnrollmentsByStudent(studentId: string) {
    return this.enrollments.filter(e => e.studentId === studentId);
  }

  findStudentsBySchool(schoolId: string) {
    return this.students.filter(s => s.schoolId === schoolId);
  }

  findInvoicesByStudent(studentId: string) {
    return this.invoices.filter(i => i.studentId === studentId);
  }

  findInvoicesBySchool(schoolId: string) {
    return this.invoices.filter(i => i.schoolId === schoolId);
  }

  findPaymentsByInvoice(invoiceId: string) {
    return this.payments.filter(p => p.invoiceId === invoiceId);
  }

  findAllPayments() {
    return this.payments;
  }

  // ── Payments ────────────────────────────────────
  createPayment(data: {
    invoiceId: string;
    amount: number;
    paymentMethod: string;
    status: string;
    referenceId: string | null;
    recordedById: string | null;
  }) {
    const now = new Date().toISOString();
    const payment = {
      id: freshId('pay'),
      receiptNo: generateReceiptNo(),
      invoiceId: data.invoiceId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      paymentDate: now,
      status: data.status,
      isVoided: false,
      voidedAt: null as string | null,
      voidReason: null as string | null,
      referenceId: data.referenceId,
      recordedById: data.recordedById,
      notes: null as string | null,
    };
    this.payments.push(payment);
    return payment;
  }

  confirmPayment(paymentId: string) {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment) return null;
    payment.status = 'Confirmed';
    const invoice = this.invoices.find(i => i.id === payment.invoiceId);
    if (invoice) {
      invoice.paidAmount += payment.amount;
      invoice.outstandingAmount = Math.max(0, invoice.netAmount - invoice.paidAmount);
      invoice.paymentStatus = invoice.outstandingAmount <= 0 ? 'PAID' : 'PARTIALLY_PAID';
    }
    return { payment, invoice };
  }

  voidPayment(paymentId: string, reason: string) {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment || payment.isVoided) return null;
    payment.isVoided = true;
    payment.voidedAt = new Date().toISOString();
    payment.voidReason = reason;
    payment.status = 'Voided';
    const invoice = this.invoices.find(i => i.id === payment.invoiceId);
    if (invoice) {
      invoice.paidAmount -= payment.amount;
      invoice.outstandingAmount = Math.min(invoice.netAmount, invoice.outstandingAmount + payment.amount);
      invoice.paymentStatus = invoice.outstandingAmount >= invoice.netAmount ? 'UNPAID' : 'PARTIALLY_PAID';
    }
    return payment;
  }

  // ── Academic Sessions ───────────────────────────
  createSession(data: { schoolId: string; name: string; startDate: string; endDate: string }) {
    const session = { id: freshId('session'), schoolId: data.schoolId, name: data.name, startDate: data.startDate, endDate: data.endDate, status: 'Active' };
    this.academicSessions.push(session);
    return session;
  }

  activateSession(sessionId: string) {
    for (const s of this.academicSessions) s.status = s.id === sessionId ? 'Active' : 'Inactive';
    return this.academicSessions.find(s => s.id === sessionId);
  }

  createTerm(data: { academicSessionId: string; name: string; startDate: string; endDate: string }) {
    const term = { id: freshId('term'), academicSessionId: data.academicSessionId, name: data.name, startDate: data.startDate, endDate: data.endDate };
    this.terms.push(term);
    return term;
  }

  updateStudentStatus(studentId: string, status: string, reason?: string) {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return null;
    student.status = status;
    if (reason !== undefined) student.statusChangeReason = reason;
    return student;
  }

  createSchoolWithAdmin(data: {
    schoolName: string;
    address: string;
    phone: string;
    schoolEmail: string;
    planType: string;
    firstName: string;
    lastName: string;
    email: string;
  }) {
    const school = {
      id: freshId('school'),
      name: data.schoolName,
      address: data.address,
      phone: data.phone,
      email: data.schoolEmail,
      planType: data.planType,
      minPartialPaymentAllowed: 500,
    };
    const user = {
      id: freshId('user'),
      schoolId: school.id,
      email: data.email,
      passwordHash: '',
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'ADMIN',
      status: 'Active',
      failedAttempts: 0,
      lockedUntil: null,
    };
    this.schools.push(school);
    this.users.push(user);
    return { school, user };
  }

  // ── Audit Trail ─────────────────────────────────
  appendAuditLog(action: string, entityType: string, entityId: string, oldValues: Record<string, unknown> | null, newValues: Record<string, unknown> | null, userId: string | null, schoolId: string | null) {
    const log: AuditLog = {
      id: freshId('audit'),
      schoolId,
      userId,
      action,
      entityType,
      entityId,
      oldValues: oldValues ? JSON.stringify(oldValues) : null,
      newValues: newValues ? JSON.stringify(newValues) : null,
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.push(log);
    return log;
  }

  getAuditLogs(schoolId: string, limit = 50) {
    return this.auditLogs.filter(l => l.schoolId === schoolId).slice(-limit).reverse();
  }

  // ── School Settings ─────────────────────────────
  getSchoolSettings(schoolId: string): SchoolSettings {
    if (!this.schoolSettingsMap[schoolId]) {
      const s = this.findSchoolById(schoolId);
      this.schoolSettingsMap[schoolId] = {
        schoolName: s?.name ?? '',
        address: s?.address ?? '',
        phone: '',
        email: '',
        currency: 'ETB',
        timezone: 'Africa/Addis_Ababa',
        receiptPrefix: 'REC',
        receiptFooter: 'Thank you for your payment.',
        minPartialPaymentAllowed: s?.minPartialPaymentAllowed ?? 500,
        logoDataUrl: null,
      };
    }
    return { ...this.schoolSettingsMap[schoolId] };
  }

  updateSchoolSettings(schoolId: string, data: Partial<SchoolSettings>) {
    const current = this.getSchoolSettings(schoolId);
    this.schoolSettingsMap[schoolId] = { ...current, ...data };
    return this.schoolSettingsMap[schoolId];
  }

  // ── Notification Rules ──────────────────────────
  getNotificationRules(schoolId: string) {
    return this.notificationRules.filter(r => r.schoolId === schoolId);
  }

  createNotificationRule(data: { schoolId: string; name: string; trigger: string; delayDays: number; channels: string[] }) {
    const rule: NotificationRule = {
      id: freshId('rule'),
      schoolId: data.schoolId,
      name: data.name,
      trigger: data.trigger,
      delayDays: data.delayDays,
      channels: data.channels,
      active: true,
    };
    this.notificationRules.push(rule);
    return rule;
  }

  evaluateNotificationRules(schoolId: string) {
    const rules = this.notificationRules.filter(r => r.schoolId === schoolId && r.active);
    const logs: NotificationLog[] = [];
    for (const rule of rules) {
      const overdueInvoices = this.invoices.filter(i =>
        i.schoolId === schoolId &&
        i.paymentStatus === 'UNPAID' &&
        i.temporalStatus === 'OVERDUE'
      );
      for (const inv of overdueInvoices) {
        const log: NotificationLog = {
          id: freshId('nlog'),
          schoolId,
          ruleId: rule.id,
          invoiceId: inv.id,
          channels: rule.channels,
          deliveredAt: new Date().toISOString(),
        };
        this.notificationLogs.push(log);
        logs.push(log);
      }
    }
    return logs;
  }
}

export const store = new InMemoryStore();
