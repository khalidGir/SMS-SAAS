import prisma from '../utils/prisma.js';
import { createPaymentSchema } from '../validations/payment.js';
import { calculateConvenienceFee } from '../utils/feeCalculator.js';

/**
 * POST /api/v1/payments
 *
 * Records a payment against an invoice (Accountant only).
 */
export async function createPayment(req, res) {
  const parsed = createPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return res.status(422).json({
      status: 'error',
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', fields: fieldErrors },
    });
  }

  try {
    const { invoiceId, amount, paymentMethod, paymentDate, referenceId, notes } = parsed.data;
    const recordedById = req.user.userId;
    const feeInfo = ['CHAPA', 'TELEBIRR'].includes(paymentMethod)
      ? calculateConvenienceFee(amount)
      : null;

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) {
      return res.status(404).json({
        status: 'error',
        error: { code: 'NOT_FOUND', message: 'Invoice not found' },
      });
    }

    if (invoice.paymentStatus === 'PAID' || invoice.paymentStatus === 'REFUNDED') {
      return res.status(422).json({
        status: 'error',
        error: { code: 'INVOICE_CLOSED', message: `Invoice is already ${invoice.paymentStatus.toLowerCase()}` },
      });
    }

    const newPaid = invoice.paidAmount + amount;
    const newPaymentStatus = newPaid >= invoice.netAmount ? 'PAID' : 'PARTIALLY_PAID';
    const newOutstanding = Math.max(0, invoice.netAmount - newPaid);

    const result = await prisma.$transaction(async (tx) => {
      const feeNote = feeInfo ? `Convenience fee: ${feeInfo.fee.toFixed(2)} ETB (2.5% capped at 500). ` : '';
      const payment = await tx.payment.create({
        data: {
          receiptNo: `RCT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          invoiceId,
          amount,
          paymentMethod,
          paymentDate: new Date(paymentDate),
          referenceId: referenceId || null,
          recordedById,
          notes: notes ? `${feeNote}${notes}` : feeNote || null,
        },
      });

      const updated = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaid,
          outstandingAmount: newOutstanding,
          paymentStatus: newPaymentStatus,
          temporalStatus: 'CURRENT',
        },
      });

      return { payment, invoice: updated };
    });

    return res.status(201).json({ status: 'success', data: result });
  } catch (err) {
    console.error('createPayment error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'Failed to record payment' },
    });
  }
}

/**
 * GET /api/v1/payments
 *
 * Lists payments for the current school with student and invoice references.
 */
export async function listPayments(req, res) {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        invoice: {
          select: {
            invoiceNo: true,
            netAmount: true,
            outstandingAmount: true,
            totalAmount: true,
            student: { select: { firstName: true, lastName: true, studentId: true } },
          },
        },
        recordedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ status: 'success', data: payments });
  } catch (err) {
    console.error('listPayments error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch payments' },
    });
  }
}

/**
 * POST /api/v1/payments/:id/void
 *
 * Voids a payment (Admin only). Runs inside a transaction:
 *   A. Fetches payment — aborts if already voided.
 *   B. Marks isVoided + voidedAt.
 *   C. Recalculates invoice paid/outstanding amounts.
 *   D. Derives new paymentStatus based on balance.
 *   E. Logs to AuditLog.
 */
export async function voidPayment(req, res) {
  try {
    const paymentId = req.params.id;
    const userId = req.user.userId;
    const schoolId = req.user.schoolId;

    const result = await prisma.$transaction(async (tx) => {
      // Step A: Fetch payment
      const payment = await tx.payment.findUnique({ where: { id: paymentId } });
      if (!payment) {
        throw Object.assign(new Error('Payment not found'), { statusCode: 404, code: 'NOT_FOUND' });
      }
      if (payment.isVoided) {
        throw Object.assign(new Error('Payment is already voided'), { statusCode: 422, code: 'ALREADY_VOIDED' });
      }

      // Step B: Mark voided
      await tx.payment.update({
        where: { id: paymentId },
        data: { isVoided: true, voidedAt: new Date(), status: 'VOIDED' },
      });

      // Step C: Fetch invoice and recalculate
      const invoice = await tx.invoice.findUnique({ where: { id: payment.invoiceId } });
      if (!invoice) {
        throw Object.assign(new Error('Associated invoice not found'), { statusCode: 404, code: 'NOT_FOUND' });
      }

      const newPaid = Math.max(0, invoice.paidAmount - payment.amount);
      const newOutstanding = invoice.netAmount - newPaid;

      // Step D: Derive new payment status
      const newPaymentStatus = newPaid <= 0 ? 'UNPAID' : newPaid >= invoice.netAmount ? 'PAID' : 'PARTIALLY_PAID';

      const updatedInvoice = await tx.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          paidAmount: newPaid,
          outstandingAmount: newOutstanding,
          paymentStatus: newPaymentStatus,
        },
      });

      // Step E: Audit log
      await tx.auditLog.create({
        data: {
          schoolId,
          userId,
          action: 'PAYMENT_VOIDED',
          entityType: 'Payment',
          entityId: paymentId,
          oldValues: JSON.stringify({ isVoided: false, paidAmount: invoice.paidAmount, outstandingAmount: invoice.outstandingAmount }),
          newValues: JSON.stringify({ isVoided: true, paidAmount: newPaid, outstandingAmount: newOutstanding }),
          ipAddress: req.ip,
        },
      });

      return { payment: { ...payment, isVoided: true, voidedAt: new Date() }, invoice: updatedInvoice };
    });

    return res.json({ status: 'success', data: result });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        status: 'error',
        error: { code: err.code, message: err.message },
      });
    }
    console.error('voidPayment error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'Failed to void payment' },
    });
  }
}
