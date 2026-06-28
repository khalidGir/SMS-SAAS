import { z } from 'zod';

const MAX_FILE_SIZE = 5242880; // 5MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;

/**
 * FR-007: Student Registration Schema
 * Multi-step form validation with guardian contact refinement.
 */
export const studentRegistrationSchema = z.object({
  // Step 1: Personal Info
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid date of birth is required',
  }),
  gender: z.enum(['Male', 'Female', 'Other'], {
    message: 'Please select a valid gender option',
  }),

  // Step 2: Guardian Info
  guardianName: z.string().min(1, 'Guardian name is required').max(200),
  guardianPhone: z.string().max(20).optional().or(z.literal('')),
  guardianEmail: z.string().email('Invalid email address').optional().or(z.literal('')),

  // Step 3: Address & Previous School
  address: z.string().min(1, 'Address is required'),
  previousSchool: z.string().max(255).optional(),

  // FR-009: Document upload validation
  document: z
    .any()
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
      message: 'File size exceeds 5MB limit',
    })
    .refine((file) => !file || ACCEPTED_FILE_TYPES.includes(file.type), {
      message: 'Only PDF, JPG, and PNG files are allowed',
    }),
}).refine((data) => data.guardianPhone || data.guardianEmail, {
  message: 'Either Guardian Phone or Guardian Email must be provided',
  path: ['guardianPhone'],
});

/**
 * FR-013 & FR-014: Record Payment Schema
 * Validates financial inputs taken by the Accountant.
 */
export const recordPaymentSchema = z.object({
  amount: z
    .number({ message: 'Amount must be a numeric value' })
    .positive('Payment amount must be greater than zero'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CARD', 'CHEQUE'], {
    message: 'Please select a valid payment method',
  }),
  paymentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid payment date is required',
  }),
  referenceId: z.string().max(255).optional().or(z.literal('')),
  notes: z.string().max(500).optional(),
});

/**
 * Login form schema (client-side mirror of API validation).
 * Accepts email or phone in the `email` field.
 */
export const loginSchema = z.object({
  email: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
});

// ---------------------------------------------------------------------------
// Multi-step form sub-schemas (Zod v4 forbids .pick() on refined objects)
// ---------------------------------------------------------------------------

const step1Fields = {
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid date of birth is required',
  }),
  gender: z.enum(['Male', 'Female', 'Other'], {
    message: 'Please select a valid gender option',
  }),
} as const;

const step2Fields = {
  guardianName: z.string().min(1, 'Guardian name is required').max(200),
  guardianPhone: z.string().max(20).optional().or(z.literal('')),
  guardianEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
} as const;

const step3Fields = {
  address: z.string().min(1, 'Address is required'),
  previousSchool: z.string().max(255).optional(),
  document: z
    .any()
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
      message: 'File size exceeds 5MB limit',
    })
    .refine((file) => !file || ACCEPTED_FILE_TYPES.includes(file.type), {
      message: 'Only PDF, JPG, and PNG files are allowed',
    }),
} as const;

export const studentStep1Schema = z.object({ ...step1Fields });
export const studentStep2Schema = z.object({ ...step2Fields }).refine(
  (data) => data.guardianPhone || data.guardianEmail,
  { message: 'Either Guardian Phone or Guardian Email must be provided', path: ['guardianPhone'] },
);
export const studentStep3Schema = z.object({ ...step3Fields });

/**
 * Utility types for multi-step form extraction.
 */
export type StudentRegistrationInput = z.infer<typeof studentRegistrationSchema>;
export type StudentStep1Input = z.infer<typeof studentStep1Schema>;
export type StudentStep2Input = z.infer<typeof studentStep2Schema>;
export type StudentStep3Input = z.infer<typeof studentStep3Schema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface AcademicSessionData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  terms: { id: string; name: string; startDate: string; endDate: string }[];
}

export interface StudentData {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  guardianName: string;
  guardianPhone: string | null;
  guardianEmail: string | null;
  address: string | null;
  previousSchool: string | null;
  status: string;
  statusChangeReason: string | null;
}

export interface PaymentData {
  id: string;
  receiptNo: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  status: string;
  isVoided: boolean;
  voidedAt: string | null;
  voidReason: string | null;
  invoice: {
    invoiceNo: string;
    netAmount: number;
    outstandingAmount: number;
    totalAmount: number;
    student: { firstName: string; lastName: string; studentId: string };
  };
  recordedBy: { firstName: string; lastName: string };
}

export interface InvoiceData {
  id: string;
  invoiceNo: string;
  schoolId: string;
  studentId: string;
  feeStructureId: string;
  termId: string;
  totalAmount: number;
  discountAmount: number;
  lateFeeAmount: number;
  netAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  dueDate: string;
  issuedDate: string;
  paymentStatus: string;
  temporalStatus: string;
  notes: string | null;
  school: { minPartialPaymentAllowed: number };
  student: { firstName: string; lastName: string; studentId: string };
  feeStructure: { name: string };
  term: { name: string };
  payments: { amount: number; paymentMethod: string; paymentDate: string; status: string; isVoided?: boolean }[];
}

export interface ParentStudentData {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  status: string;
  guardianName: string;
  guardianPhone: string | null;
  guardianEmail: string | null;
  enrollments: {
    class: { name: string } | null;
    session: { name: string; status: string } | null;
  }[];
}

export interface ParentPaymentInitResult {
  payment: {
    id: string;
    receiptNo: string;
    amount: number;
    convenienceFee: number;
    totalCharged: number;
    paymentDate: string;
    status: string;
  };
  gateway: {
    type: 'CHAPA' | 'TELEBIRR';
    checkoutUrl: string;
    transactionRef: string;
  };
}

export interface ParentPaymentConfirmResult {
  payment: {
    id: string;
    receiptNo: string;
    amount: number;
    paymentDate: string;
    status: string;
  };
  invoice: {
    id: string;
    invoiceNo: string;
    paidAmount: number;
    outstandingAmount: number;
    paymentStatus: string;
  };
}

export interface ParentPaymentResult {
  payment: {
    id: string;
    receiptNo: string;
    amount: number;
    convenienceFee: number;
    totalCharged: number;
    paymentDate: string;
  };
  invoice: {
    id: string;
    invoiceNo: string;
    paidAmount: number;
    outstandingAmount: number;
    paymentStatus: string;
  };
}

export interface InvoiceWithPayments extends InvoiceData {
  payments: {
    amount: number;
    paymentMethod: string;
    paymentDate: string;
    status: string;
    isVoided: boolean;
  }[];
}

// ── Super Admin: School Management (FR-005) ─────────────────
export const createSchoolSchema = z.object({
  name: z.string().min(1, 'School name is required').max(255),
  domain: z.string().min(1, 'Domain is required').max(255),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required').max(20),
  email: z.string().email('Invalid email address'),
  planType: z.enum(['BASIC', 'STANDARD', 'PREMIUM'], {
    message: 'Please select a plan type',
  }),
  adminName: z.string().min(1, 'Admin name is required').max(200),
  adminEmail: z.string().email('Invalid admin email address'),
  adminPhone: z.string().min(1, 'Admin phone is required').max(20),
});
export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;

// ── Super Admin: User Management (FR-001) ───────────────────
export const createPlatformUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required').max(20),
  role: z.enum(['ADMIN', 'REGISTRAR', 'ACCOUNTANT'], {
    message: 'Please select a role',
  }),
  schoolId: z.string().min(1, 'School assignment is required'),
});
export type CreatePlatformUserInput = z.infer<typeof createPlatformUserSchema>;
