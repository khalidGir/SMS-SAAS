import { z } from 'zod';

export const createPaymentSchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice ID'),
  amount: z.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CARD', 'CHEQUE', 'CHAPA', 'TELEBIRR'], {
    message: 'Please select a valid payment method',
  }),
  paymentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid payment date is required',
  }),
  referenceId: z.string().max(255).optional().or(z.literal('')),
  notes: z.string().max(500).optional(),
});
