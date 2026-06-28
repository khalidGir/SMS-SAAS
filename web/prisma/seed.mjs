import { PrismaClient, UserRole, Gender, StudentStatus, LateFeeType, PaymentStatus, TemporalStatus, PaymentMethod } from '../generated/prisma/client.ts';
import bcrypt from 'bcrypt';

const isSqlite = (process.env.DATABASE_URL || '').startsWith('file:');

let prisma;
if (isSqlite) {
  const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3');
  const path = await import('path');
  const url = await import('url');
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  const dbPath = path.resolve(__dirname, '..', 'dev.db');
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  prisma = new PrismaClient({ adapter });
} else {
  prisma = new PrismaClient();
}

async function main() {
  console.log('🌱 Starting database seeding pool...');

  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.feeStructure.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.student.deleteMany();
  await prisma.term.deleteMany();
  await prisma.academicSession.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();

  console.log('🧹 Cleaned up old database tables.');

  const SALT_ROUNDS = 10;
  const defaultPasswordHash = await bcrypt.hash('Password123!', SALT_ROUNDS);

  // ── Super Admin (global, no school) ──────────────────────
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@nexasoft.sms',
      passwordHash: defaultPasswordHash,
      firstName: 'Khalid',
      lastName: 'Girma',
      role: UserRole.SUPER_ADMIN,
    },
  });
  console.log(`🚀 Super Admin: ${superAdmin.email}`);

  // ── Tenant School ────────────────────────────────────────
  const school = await prisma.school.create({
    data: {
      name: 'NexaSoft Academy (Addis Ababa)',
      address: 'Bole Road, Addis Ababa, Ethiopia',
      minPartialPaymentAllowed: 500.00,
    },
  });
  console.log(`🏢 School: ${school.name} (${school.id})`);

  // ── Staff Users ──────────────────────────────────────────
  await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'admin@nexasoft.sms',
      passwordHash: defaultPasswordHash,
      firstName: 'Abebe',
      lastName: 'Kebede',
      role: UserRole.ADMIN,
    },
  });

  const registrar = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'registrar@nexasoft.sms',
      passwordHash: defaultPasswordHash,
      firstName: 'Chaltu',
      lastName: 'Yosef',
      role: UserRole.REGISTRAR,
    },
  });

  const accountant = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'accountant@nexasoft.sms',
      passwordHash: defaultPasswordHash,
      firstName: 'Tariku',
      lastName: 'Shiferaw',
      role: UserRole.ACCOUNTANT,
    },
  });

  console.log('👥 Staff: Admin, Registrar, Accountant, Parent');

  // ── Parent User ──────────────────────────────────────────
  const parent = await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'parent@nexasoft.sms',
      passwordHash: defaultPasswordHash,
      firstName: 'Tesfaye',
      lastName: 'Alemu',
      role: UserRole.PARENT,
    },
  });

  // ── Academic Session & Terms ─────────────────────────────
  const session = await prisma.academicSession.create({
    data: {
      schoolId: school.id,
      name: '2026/2027 Academic Year',
      startDate: new Date('2026-09-01T00:00:00Z'),
      endDate: new Date('2027-06-30T00:00:00Z'),
      status: 'Active',
    },
  });

  const term1 = await prisma.term.create({
    data: {
      academicSessionId: session.id,
      name: 'Term 1',
      startDate: new Date('2026-09-01T00:00:00Z'),
      endDate: new Date('2026-12-25T00:00:00Z'),
    },
  });

  const term2 = await prisma.term.create({
    data: {
      academicSessionId: session.id,
      name: 'Term 2',
      startDate: new Date('2027-01-05T00:00:00Z'),
      endDate: new Date('2027-06-30T00:00:00Z'),
    },
  });

  console.log('📅 Session: 2026/2027, 2 Terms');

  // ── Classes ──────────────────────────────────────────────
  const grade10 = await prisma.class.create({
    data: { schoolId: school.id, name: 'Grade 10', capacity: 40 },
  });
  const grade3 = await prisma.class.create({
    data: { schoolId: school.id, name: 'Grade 3', capacity: 35 },
  });

  // ── Fee Structures ──────────────────────────────────────
  const highSchoolFee = await prisma.feeStructure.create({
    data: {
      schoolId: school.id,
      termId: term1.id,
      name: 'Grade 10 Tuition Fee',
      baseAmount: 12000.00,
      dueDate: new Date('2026-09-15T00:00:00Z'),
      lateFeeRate: 50.00,
      lateFeeType: LateFeeType.DAILY,
    },
  });

  const elementaryFee = await prisma.feeStructure.create({
    data: {
      schoolId: school.id,
      termId: term1.id,
      name: 'Grade 3 Tuition Fee',
      baseAmount: 8500.00,
      dueDate: new Date('2026-09-10T00:00:00Z'),
      lateFeeRate: 200.00,
      lateFeeType: LateFeeType.FLAT,
    },
  });

  console.log('💰 Fee Structures: DAILY (Grade 10) + FLAT (Grade 3)');

  // ── Students ─────────────────────────────────────────────
  const student1 = await prisma.student.create({
    data: {
      studentId: 'SCH-2026-0001',
      schoolId: school.id,
      firstName: 'Almaz',
      lastName: 'Tesfaye',
      dateOfBirth: new Date('2011-04-12T00:00:00Z'),
      gender: Gender.FEMALE,
      guardianName: 'Tesfaye Alemu',
      guardianPhone: '+251911223344',
      guardianEmail: 'tesfaye@example.com',
      address: 'Kirkos Subcity, Kebele 02',
      status: StudentStatus.ACTIVE,
      parentUserId: parent.id,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      studentId: 'SCH-2026-0002',
      schoolId: school.id,
      firstName: 'Yonas',
      lastName: 'Bekele',
      dateOfBirth: new Date('2017-08-23T00:00:00Z'),
      gender: Gender.MALE,
      guardianName: 'Bekele Zewdu',
      guardianPhone: '+251912556677',
      guardianEmail: 'bekele@example.com',
      address: 'Yeka Subcity, House 901',
      status: StudentStatus.ACTIVE,
    },
  });

  // ── Enrollments ──────────────────────────────────────────
  await prisma.enrollment.create({
    data: {
      studentId: student1.id,
      classId: grade10.id,
      sessionId: session.id,
      enrollmentDate: new Date('2026-09-01T00:00:00Z'),
    },
  });

  await prisma.enrollment.create({
    data: {
      studentId: student2.id,
      classId: grade3.id,
      sessionId: session.id,
      enrollmentDate: new Date('2026-09-01T00:00:00Z'),
    },
  });

  console.log('🎓 Students: Almaz (Grade 10), Yonas (Grade 3)');

  // ── Invoices & Payments ──────────────────────────────────

  // Invoice A: Partially Paid, Current
  const invoiceA = await prisma.invoice.create({
    data: {
      invoiceNo: 'INV-2026-0001',
      schoolId: school.id,
      studentId: student1.id,
      feeStructureId: highSchoolFee.id,
      termId: term1.id,
      totalAmount: 12000.00,
      discountAmount: 1000.00,
      lateFeeAmount: 0.00,
      netAmount: 11000.00,
      paidAmount: 4000.00,
      outstandingAmount: 7000.00,
      dueDate: new Date('2026-09-15T00:00:00Z'),
      issuedDate: new Date('2026-09-01T00:00:00Z'),
      paymentStatus: PaymentStatus.PARTIALLY_PAID,
      temporalStatus: TemporalStatus.CURRENT,
    },
  });

  await prisma.payment.create({
    data: {
      receiptNo: 'REC-2026-0001',
      invoiceId: invoiceA.id,
      recordedById: accountant.id,
      amount: 4000.00,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      referenceId: 'CBE-TXN-98213A',
      notes: 'Initial partial payment.',
    },
  });

  // Invoice B: Unpaid, Overdue (target for late-fee cron)
  await prisma.invoice.create({
    data: {
      invoiceNo: 'INV-2026-0002',
      schoolId: school.id,
      studentId: student2.id,
      feeStructureId: elementaryFee.id,
      termId: term1.id,
      totalAmount: 8500.00,
      discountAmount: 0.00,
      lateFeeAmount: 200.00,
      netAmount: 8700.00,
      paidAmount: 0.00,
      outstandingAmount: 8700.00,
      dueDate: new Date('2026-09-10T00:00:00Z'),
      issuedDate: new Date('2026-09-01T00:00:00Z'),
      paymentStatus: PaymentStatus.UNPAID,
      temporalStatus: TemporalStatus.OVERDUE,
    },
  });

  console.log('💳 Invoices: Partially Paid (Almaz) + Overdue (Yonas)');
  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
