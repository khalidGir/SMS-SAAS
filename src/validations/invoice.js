import { z } from 'zod';

export const createInvoiceSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  feeStructureId: z.string().uuid('Invalid fee structure ID'),
  termId: z.string().uuid('Invalid term ID'),
  discountAmount: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

export const updateInvoiceSchema = z.object({
  discountAmount: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
  paymentStatus: z.enum(['UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED']).optional(),
  temporalStatus: z.enum(['CURRENT', 'OVERDUE']).optional(),
});
