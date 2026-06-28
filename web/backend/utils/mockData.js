export const PASSWORD_HASH = '$2b$10$E7sqdyYBdVs9wF0NG82Dd.GATOBwNMqmHXpoeetgDEA.8zSDpq2pq';

export const schools = [
  {
    id: 'school-1',
    name: 'NexaSoft Academy (Addis Ababa)',
    address: 'Bole Road, Addis Ababa, Ethiopia',
    minPartialPaymentAllowed: 500.00,
    createdAt: new Date('2026-06-01'),
    updatedAt: new Date('2026-06-01'),
    deletedAt: null,
  },
];

export const users = [
  {
    id: 'user-super', schoolId: null, email: 'superadmin@nexasoft.sms', phone: '+251911000001',
    passwordHash: PASSWORD_HASH, firstName: 'Khalid', lastName: 'Girma', role: 'SUPER_ADMIN',
    status: 'Active', failedAttempts: 0, lockedUntil: null, lastLogin: null,
    resetToken: null, resetTokenExpires: null, createdAt: new Date('2026-06-01'), updatedAt: new Date('2026-06-01'), deletedAt: null,
  },
  {
    id: 'user-admin', schoolId: 'school-1', email: 'admin@nexasoft.sms', phone: '+251911000002',
    passwordHash: PASSWORD_HASH, firstName: 'Abebe', lastName: 'Kebede', role: 'ADMIN',
    status: 'Active', failedAttempts: 0, lockedUntil: null, lastLogin: null,
    resetToken: null, resetTokenExpires: null, createdAt: new Date('2026-06-01'), updatedAt: new Date('2026-06-01'), deletedAt: null,
  },
  {
    id: 'user-registrar', schoolId: 'school-1', email: 'registrar@nexasoft.sms', phone: '+251911000003',
    passwordHash: PASSWORD_HASH, firstName: 'Chaltu', lastName: 'Yosef', role: 'REGISTRAR',
    status: 'Active', failedAttempts: 0, lockedUntil: null, lastLogin: null,
    resetToken: null, resetTokenExpires: null, createdAt: new Date('2026-06-01'), updatedAt: new Date('2026-06-01'), deletedAt: null,
  },
  {
    id: 'user-accountant', schoolId: 'school-1', email: 'accountant@nexasoft.sms', phone: '+251911000004',
    passwordHash: PASSWORD_HASH, firstName: 'Tariku', lastName: 'Shiferaw', role: 'ACCOUNTANT',
    status: 'Active', failedAttempts: 0, lockedUntil: null, lastLogin: null,
    resetToken: null, resetTokenExpires: null, createdAt: new Date('2026-06-01'), updatedAt: new Date('2026-06-01'), deletedAt: null,
  },
  {
    id: 'user-parent', schoolId: 'school-1', email: 'parent@nexasoft.sms', phone: '+251911000005',
    passwordHash: PASSWORD_HASH, firstName: 'Tesfaye', lastName: 'Alemu', role: 'PARENT',
    status: 'Active', failedAttempts: 0, lockedUntil: null, lastLogin: null,
    resetToken: null, resetTokenExpires: null, createdAt: new Date('2026-06-01'), updatedAt: new Date('2026-06-01'), deletedAt: null,
  },
];

export const academicSessions = [
  {
    id: 'session-1', schoolId: 'school-1', name: '2026/2027 Academic Year',
    startDate: new Date('2026-09-01'), endDate: new Date('2027-06-30'), status: 'Active',
    createdAt: new Date('2026-06-01'), updatedAt: new Date('2026-06-01'), deletedAt: null,
  },
];

export const terms = [
  {
    id: 'term-1', academicSessionId: 'session-1', name: 'Term 1',
    startDate: new Date('2026-09-01'), endDate: new Date('2026-12-25'),
    createdAt: new Date('2026-06-01'), updatedAt: new Date('2026-06-01'), deletedAt: null,
  },
  {
    id: 'term-2', academicSessionId: 'session-1', name: 'Term 2',
    startDate: new Date('2027-01-05'), endDate: new Date('2027-06-30'),
    createdAt: new Date('2026-06-01'), updatedAt: new Date('2026-06-01'), deletedAt: null,
  },
];

export const classes = [
  { id: 'class-1', schoolId: 'school-1', name: 'Grade 3', capacity: 35, createdAt: new Date('2026-06-01'), updatedAt: new Date('2026-06-01') },
  { id: 'class-2', schoolId: 'school-1', name: 'Grade 5', capacity: 40, createdAt: new Date('2026-06-01'), updatedAt: new Date('2026-06-01') },
  { id: 'class-3', schoolId: 'school-1', name: 'Grade 8', capacity: 40, createdAt: new Date('2026-06-01'), updatedAt: new Date('2026-06-01') },
  { id: 'class-4', schoolId: 'school-1', name: 'Grade 10', capacity: 35, createdAt: new Date('2026-06-01'), updatedAt: new Date('2026-06-01') },
];

export const feeStructures = [
  { id: 'fee-1', schoolId: 'school-1', termId: 'term-1', name: 'Grade 3 Tuition Fee', baseAmount: 8500.00, dueDate: new Date('2026-09-10'), lateFeeRate: 200.00, lateFeeType: 'FLAT', frequency: 'Termly', status: 'Active', createdAt: new Date('2026-06-01'), updatedAt: new Date('2026-06-01'), deletedAt: null },
  { id: 'fee-2', schoolId: 'school-1', termId: 'term-1', name: 'Grade 5 Tuition Fee', baseAmount: 9500.00, dueDate: new Date('2026-09-12'), lateFeeRate: 50.00, lateFeeType: 'DAILY', frequency: 'Termly', status: 'Active', createdAt: new Date('2026-06-01'), updatedAt: new Date('2026-06-01'), deletedAt: null },
  { id: 'fee-3', schoolId: 'school-1', termId: 'term-1', name: 'Grade 8 Tuition Fee', baseAmount: 10500.00, dueDate: new Date('2026-09-14'), lateFeeRate: 50.00, lateFeeType: 'DAILY', frequency: 'Termly', status: 'Active', createdAt: new Date('2026-06-01'), updatedAt: new Date('2026-06-01'), deletedAt: null },
  { id: 'fee-4', schoolId: 'school-1', termId: 'term-1', name: 'Grade 10 Tuition Fee', baseAmount: 12000.00, dueDate: new Date('2026-09-15'), lateFeeRate: 50.00, lateFeeType: 'DAILY', frequency: 'Termly', status: 'Active', createdAt: new Date('2026-06-01'), updatedAt: new Date('2026-06-01'), deletedAt: null },
];

export const students = [
  { id: 'student-1', schoolId: 'school-1', studentId: 'SCH-2026-0001', firstName: 'Almaz', lastName: 'Tesfaye', dateOfBirth: new Date('2011-04-12'), gender: 'FEMALE', guardianName: 'Tesfaye Alemu', guardianPhone: '+251911223344', guardianEmail: 'parent@nexasoft.sms', address: 'Kirkos Subcity, Kebele 02', previousSchool: null, status: 'ACTIVE', statusChangeReason: null, parentUserId: 'user-parent', deletedAt: null },
  { id: 'student-2', schoolId: 'school-1', studentId: 'SCH-2026-0002', firstName: 'Yonas', lastName: 'Bekele', dateOfBirth: new Date('2017-08-23'), gender: 'MALE', guardianName: 'Bekele Zewdu', guardianPhone: '+251912556677', guardianEmail: 'bekele@example.com', address: 'Yeka Subcity, House 901', previousSchool: null, status: 'ACTIVE', statusChangeReason: null, parentUserId: null, deletedAt: null },
  { id: 'student-3', schoolId: 'school-1', studentId: 'SCH-2026-0003', firstName: 'Hiwot', lastName: 'Desta', dateOfBirth: new Date('2015-11-05'), gender: 'FEMALE', guardianName: 'Desta Lemma', guardianPhone: '+251913334455', guardianEmail: 'desta@example.com', address: 'Bole Subcity, Woreda 03', previousSchool: 'Sunshine Elementary', status: 'ACTIVE', statusChangeReason: null, parentUserId: null, deletedAt: null },
  { id: 'student-4', schoolId: 'school-1', studentId: 'SCH-2026-0004', firstName: 'Abdi', lastName: 'Hussein', dateOfBirth: new Date('2012-02-18'), gender: 'MALE', guardianName: 'Hussein Ali', guardianPhone: '+251914445566', guardianEmail: 'hussein@example.com', address: 'Kazanches, House 45', previousSchool: null, status: 'ACTIVE', statusChangeReason: null, parentUserId: null, deletedAt: null },
  { id: 'student-5', schoolId: 'school-1', studentId: 'SCH-2026-0005', firstName: 'Mekdes', lastName: 'Worku', dateOfBirth: new Date('2016-07-30'), gender: 'FEMALE', guardianName: 'Worku Tadesse', guardianPhone: '+251915556677', guardianEmail: 'worku@example.com', address: 'CMC Area, House 12', previousSchool: 'Little Stars Academy', status: 'PENDING', statusChangeReason: 'Awaiting document verification', parentUserId: null, deletedAt: null },
  { id: 'student-6', schoolId: 'school-1', studentId: 'SCH-2026-0006', firstName: 'Ephrem', lastName: 'Gebre', dateOfBirth: new Date('2010-10-15'), gender: 'MALE', guardianName: 'Gebre Selassie', guardianPhone: '+251916667788', guardianEmail: 'gebre@example.com', address: 'Piassa, Kebele 08', previousSchool: 'Addis Ababa High School', status: 'ACTIVE', statusChangeReason: null, parentUserId: null, deletedAt: null },
  { id: 'student-7', schoolId: 'school-1', studentId: 'SCH-2026-0007', firstName: 'Sara', lastName: 'Mohammed', dateOfBirth: new Date('2013-01-25'), gender: 'FEMALE', guardianName: 'Mohammed Ahmed', guardianPhone: '+251917778899', guardianEmail: 'mohammed@example.com', address: 'Mexico Square, House 33', previousSchool: null, status: 'ACTIVE', statusChangeReason: null, parentUserId: null, deletedAt: null },
  { id: 'student-8', schoolId: 'school-1', studentId: 'SCH-2026-0008', firstName: 'Dawit', lastName: 'Lemma', dateOfBirth: new Date('2014-06-08'), gender: 'MALE', guardianName: 'Lemma Birhanu', guardianPhone: '+251918889900', guardianEmail: 'lemma@example.com', address: 'Summit Area, House 67', previousSchool: 'Rising Sun Academy', status: 'SUSPENDED', statusChangeReason: 'Behavioral issues - pending review', parentUserId: null, deletedAt: null },
];

export const enrollments = [
  { id: 'enroll-1', studentId: 'student-1', classId: 'class-4', sessionId: 'session-1', enrollmentDate: new Date('2026-09-01'), status: 'Active', createdAt: new Date('2026-09-01'), updatedAt: new Date('2026-09-01') },
  { id: 'enroll-2', studentId: 'student-2', classId: 'class-1', sessionId: 'session-1', enrollmentDate: new Date('2026-09-01'), status: 'Active', createdAt: new Date('2026-09-01'), updatedAt: new Date('2026-09-01') },
  { id: 'enroll-3', studentId: 'student-3', classId: 'class-2', sessionId: 'session-1', enrollmentDate: new Date('2026-09-01'), status: 'Active', createdAt: new Date('2026-09-01'), updatedAt: new Date('2026-09-01') },
  { id: 'enroll-4', studentId: 'student-4', classId: 'class-4', sessionId: 'session-1', enrollmentDate: new Date('2026-09-01'), status: 'Active', createdAt: new Date('2026-09-01'), updatedAt: new Date('2026-09-01') },
  { id: 'enroll-5', studentId: 'student-5', classId: 'class-2', sessionId: 'session-1', enrollmentDate: new Date('2026-09-05'), status: 'Pending', createdAt: new Date('2026-09-05'), updatedAt: new Date('2026-09-05') },
  { id: 'enroll-6', studentId: 'student-6', classId: 'class-3', sessionId: 'session-1', enrollmentDate: new Date('2026-09-01'), status: 'Active', createdAt: new Date('2026-09-01'), updatedAt: new Date('2026-09-01') },
  { id: 'enroll-7', studentId: 'student-7', classId: 'class-3', sessionId: 'session-1', enrollmentDate: new Date('2026-09-01'), status: 'Active', createdAt: new Date('2026-09-01'), updatedAt: new Date('2026-09-01') },
  { id: 'enroll-8', studentId: 'student-8', classId: 'class-2', sessionId: 'session-1', enrollmentDate: new Date('2026-09-01'), status: 'Active', createdAt: new Date('2026-09-01'), updatedAt: new Date('2026-09-01') },
];

export const invoices = [
  {
    id: 'inv-1', invoiceNo: 'INV-2026-0001', schoolId: 'school-1', studentId: 'student-1', feeStructureId: 'fee-4', termId: 'term-1',
    totalAmount: 12000.00, discountAmount: 1000.00, lateFeeAmount: 0.00, netAmount: 11000.00, paidAmount: 4000.00, outstandingAmount: 7000.00,
    dueDate: new Date('2026-09-15'), issuedDate: new Date('2026-09-01'), paymentStatus: 'PARTIALLY_PAID', temporalStatus: 'CURRENT',
    notes: 'Initial payment received via bank transfer', createdAt: new Date('2026-09-01'), updatedAt: new Date('2026-09-15'), deletedAt: null,
  },
  {
    id: 'inv-2', invoiceNo: 'INV-2026-0002', schoolId: 'school-1', studentId: 'student-2', feeStructureId: 'fee-1', termId: 'term-1',
    totalAmount: 8500.00, discountAmount: 0.00, lateFeeAmount: 200.00, netAmount: 8700.00, paidAmount: 0.00, outstandingAmount: 8700.00,
    dueDate: new Date('2026-09-10'), issuedDate: new Date('2026-09-01'), paymentStatus: 'UNPAID', temporalStatus: 'OVERDUE',
    notes: null, createdAt: new Date('2026-09-01'), updatedAt: new Date('2026-09-10'), deletedAt: null,
  },
  {
    id: 'inv-3', invoiceNo: 'INV-2026-0003', schoolId: 'school-1', studentId: 'student-3', feeStructureId: 'fee-2', termId: 'term-1',
    totalAmount: 9500.00, discountAmount: 500.00, lateFeeAmount: 0.00, netAmount: 9000.00, paidAmount: 9000.00, outstandingAmount: 0.00,
    dueDate: new Date('2026-09-12'), issuedDate: new Date('2026-09-01'), paymentStatus: 'PAID', temporalStatus: 'CURRENT',
    notes: 'Full payment via CBE', createdAt: new Date('2026-09-01'), updatedAt: new Date('2026-09-11'), deletedAt: null,
  },
  {
    id: 'inv-4', invoiceNo: 'INV-2026-0004', schoolId: 'school-1', studentId: 'student-4', feeStructureId: 'fee-4', termId: 'term-1',
    totalAmount: 12000.00, discountAmount: 0.00, lateFeeAmount: 0.00, netAmount: 12000.00, paidAmount: 6000.00, outstandingAmount: 6000.00,
    dueDate: new Date('2026-09-15'), issuedDate: new Date('2026-09-01'), paymentStatus: 'PARTIALLY_PAID', temporalStatus: 'CURRENT',
    notes: 'Partial payment made', createdAt: new Date('2026-09-01'), updatedAt: new Date('2026-09-10'), deletedAt: null,
  },
  {
    id: 'inv-5', invoiceNo: 'INV-2026-0005', schoolId: 'school-1', studentId: 'student-5', feeStructureId: 'fee-2', termId: 'term-1',
    totalAmount: 9500.00, discountAmount: 0.00, lateFeeAmount: 0.00, netAmount: 9500.00, paidAmount: 0.00, outstandingAmount: 9500.00,
    dueDate: new Date('2026-09-12'), issuedDate: new Date('2026-09-05'), paymentStatus: 'PENDING', temporalStatus: 'CURRENT',
    notes: 'Awaiting enrollment confirmation', createdAt: new Date('2026-09-05'), updatedAt: new Date('2026-09-05'), deletedAt: null,
  },
  {
    id: 'inv-6', invoiceNo: 'INV-2026-0006', schoolId: 'school-1', studentId: 'student-6', feeStructureId: 'fee-3', termId: 'term-1',
    totalAmount: 10500.00, discountAmount: 0.00, lateFeeAmount: 250.00, netAmount: 10750.00, paidAmount: 0.00, outstandingAmount: 10750.00,
    dueDate: new Date('2026-09-14'), issuedDate: new Date('2026-09-01'), paymentStatus: 'UNPAID', temporalStatus: 'OVERDUE',
    notes: 'Overdue - late fees applied', createdAt: new Date('2026-09-01'), updatedAt: new Date('2026-09-14'), deletedAt: null,
  },
  {
    id: 'inv-7', invoiceNo: 'INV-2026-0007', schoolId: 'school-1', studentId: 'student-7', feeStructureId: 'fee-3', termId: 'term-1',
    totalAmount: 10500.00, discountAmount: 0.00, lateFeeAmount: 0.00, netAmount: 10500.00, paidAmount: 10500.00, outstandingAmount: 0.00,
    dueDate: new Date('2026-09-14'), issuedDate: new Date('2026-09-01'), paymentStatus: 'PAID', temporalStatus: 'CURRENT',
    notes: 'Paid in full on time', createdAt: new Date('2026-09-01'), updatedAt: new Date('2026-09-13'), deletedAt: null,
  },
  {
    id: 'inv-8', invoiceNo: 'INV-2026-0008', schoolId: 'school-1', studentId: 'student-8', feeStructureId: 'fee-2', termId: 'term-1',
    totalAmount: 9500.00, discountAmount: 2000.00, lateFeeAmount: 0.00, netAmount: 7500.00, paidAmount: 0.00, outstandingAmount: 7500.00,
    dueDate: new Date('2026-09-12'), issuedDate: new Date('2026-09-01'), paymentStatus: 'VOIDED', temporalStatus: 'CURRENT',
    notes: 'Invoice voided - student suspended', createdAt: new Date('2026-09-01'), updatedAt: new Date('2026-09-15'), deletedAt: null,
  },
];

export const payments = [
  { id: 'pay-1', receiptNo: 'REC-2026-0001', invoiceId: 'inv-1', amount: 4000.00, paymentMethod: 'BANK_TRANSFER', paymentDate: new Date('2026-09-10'), referenceId: 'CBE-TXN-98213A', recordedById: 'user-accountant', status: 'Confirmed', isVoided: false, voidedAt: null, voidReason: null, notes: 'Initial partial payment via CBE', createdAt: new Date('2026-09-10'), updatedAt: new Date('2026-09-10') },
  { id: 'pay-2', receiptNo: 'REC-2026-0002', invoiceId: 'inv-3', amount: 9000.00, paymentMethod: 'CASH', paymentDate: new Date('2026-09-11'), referenceId: null, recordedById: 'user-accountant', status: 'Confirmed', isVoided: false, voidedAt: null, voidReason: null, notes: 'Full payment received in cash', createdAt: new Date('2026-09-11'), updatedAt: new Date('2026-09-11') },
  { id: 'pay-3', receiptNo: 'REC-2026-0003', invoiceId: 'inv-4', amount: 6000.00, paymentMethod: 'TELEBIRR', paymentDate: new Date('2026-09-10'), referenceId: 'TBILL-55667', recordedById: 'user-accountant', status: 'Confirmed', isVoided: false, voidedAt: null, voidReason: null, notes: 'Partial payment via Telebirr', createdAt: new Date('2026-09-10'), updatedAt: new Date('2026-09-10') },
  { id: 'pay-4', receiptNo: 'REC-2026-0004', invoiceId: 'inv-7', amount: 10500.00, paymentMethod: 'BANK_TRANSFER', paymentDate: new Date('2026-09-13'), referenceId: 'AWI-TXN-77321B', recordedById: 'user-accountant', status: 'Confirmed', isVoided: false, voidedAt: null, voidReason: null, notes: 'Full payment via Awash Bank', createdAt: new Date('2026-09-13'), updatedAt: new Date('2026-09-13') },
];
