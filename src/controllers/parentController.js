import { randomUUID } from 'node:crypto';
import prisma from '../utils/prisma.js';
import { z } from 'zod';
import { PaymentGatewayService, confirmPayment } from '../services/paymentGateway.js';
import { calculateConvenienceFee } from '../utils/feeCalculator.js';

const parentPaymentSchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice ID'),
  amount: z.coerce.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.enum(['CHAPA', 'TELEBIRR', 'DEBOPAY'], {
    message: 'Please select Chapa or Telebirr',
  }),
});

/**
 * Resolve student IDs linked to the authenticated parent.
 * Shared helper for all parent endpoints.
 */
async function resolveLinkedStudentIds(userId, email) {
  const records = await prisma.student.findMany({
    where: {
      OR: [
        { parentUserId: userId },
        { guardianEmail: email },
      ],
    },
    select: { id: true },
  });
  return records.map((s) => s.id);
}

/**
 * GET /api/v1/parent/students
 */
export async function getParentStudents(req, res) {
  try {
    const userId = req.user.userId;
    const email = req.user.email;

    const students = await prisma.student.findMany({
      where: {
        OR: [
          { parentUserId: userId },
          { guardianEmail: email },
        ],
      },
      include: {
        enrollments: {
          include: {
            class: { select: { name: true } },
            session: { select: { name: true, status: true } },
          },
          orderBy: { enrollmentDate: 'desc' },
          take: 1,
        },
      },
      orderBy: { firstName: 'asc' },
    });

    return res.json({ status: 'success', data: students });
  } catch (err) {
    console.error('getParentStudents error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch students' },
    });
  }
}

/**
 * GET /api/v1/parent/invoices
 */
export async function getParentInvoices(req, res) {
  try {
    const userId = req.user.userId;
    const email = req.user.email;

    const studentIds = await resolveLinkedStudentIds(userId, email);

    if (studentIds.length === 0) {
      return res.json({ status: 'success', data: [] });
    }

    const invoices = await prisma.invoice.findMany({
      where: { studentId: { in: studentIds } },
      include: {
        student: { select: { firstName: true, lastName: true, studentId: true } },
        term: { select: { name: true } },
        feeStructure: { select: { name: true } },
        payments: {
          select: { amount: true, paymentMethod: true, paymentDate: true, status: true, isVoided: true },
          orderBy: { paymentDate: 'desc' },
        },
      },
      orderBy: [{ issuedDate: 'desc' }, { createdAt: 'desc' }],
    });

    return res.json({ status: 'success', data: invoices });
  } catch (err) {
    console.error('getParentInvoices error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch invoices' },
    });
  }
}

/**
 * POST /api/v1/parent/payments
 *
 * Initiates a parent payment via Chapa or Telebirr.
 *
 * Transaction lifecycle:
 *   1. Validate the parent owns the invoice.
 *   2. Create a Payment record with status = 'PENDING'.
 *   3. Call the mock gateway dispatch to obtain gateway-specific data.
 *   4. Do NOT update the invoice yet — that happens on confirmation.
 *   5. Return the payment record + gateway data to the frontend.
 */
export async function createParentPayment(req, res) {
  const parsed = parentPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return res.status(422).json({
      status: 'error',
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', fields: fieldErrors },
    });
  }

  try {
    const { invoiceId, amount, paymentMethod } = parsed.data;
    const userId = req.user.userId;
    const email = req.user.email;

    const studentIds = await resolveLinkedStudentIds(userId, email);
    if (studentIds.length === 0) {
      return res.status(403).json({
        status: 'error',
        error: { code: 'FORBIDDEN', message: 'No linked students found for this account' },
      });
    }

    const { fee } = calculateConvenienceFee(amount);
    const paymentId = randomUUID();
    const receiptNo = `RCT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // 1. Dispatch to gateway (paymentId embedded in checkoutUrl)
    const gateway = await PaymentGatewayService.dispatch({
      method: paymentMethod,
      amount,
      platformTake: fee,
      paymentId,
    });

    // 2. Persist payment record inside a transaction
    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
      if (!invoice) {
        throw Object.assign(new Error('Invoice not found'), { statusCode: 404, code: 'NOT_FOUND' });
      }
      if (!studentIds.includes(invoice.studentId)) {
        throw Object.assign(new Error('This invoice does not belong to your linked students'), {
          statusCode: 403, code: 'FORBIDDEN',
        });
      }
      if (invoice.paymentStatus === 'PAID' || invoice.paymentStatus === 'REFUNDED') {
        throw Object.assign(new Error(`Invoice is already ${invoice.paymentStatus.toLowerCase()}`), {
          statusCode: 422, code: 'INVOICE_CLOSED',
        });
      }
      if (amount > Number(invoice.outstandingAmount)) {
        throw Object.assign(new Error('Payment amount cannot exceed the outstanding balance'), {
          statusCode: 422, code: 'AMOUNT_EXCEEDS_OUTSTANDING',
        });
      }

      const payment = await tx.payment.create({
        data: {
          id: paymentId,
          receiptNo,
          invoiceId,
          amount,
          paymentMethod,
          paymentDate: new Date(),
          recordedById: userId,
          referenceId: gateway.transactionRef,
          status: 'PENDING',
          notes: `Online payment via ${paymentMethod}. Convenience fee: ${fee.toFixed(2)}. Gateway: ${JSON.stringify(gateway)}`,
        },
      });

      return { payment, gateway, convenienceFee: fee };
    });

    return res.status(201).json({
      status: 'success',
      data: {
        payment: {
          id: result.payment.id,
          receiptNo: result.payment.receiptNo,
          amount,
          convenienceFee: result.convenienceFee,
          totalCharged: amount + result.convenienceFee,
          paymentDate: result.payment.paymentDate,
          status: result.payment.status,
        },
        gateway: result.gateway,
      },
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        status: 'error',
        error: { code: err.code, message: err.message },
      });
    }
    console.error('createParentPayment error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'Failed to initiate payment' },
    });
  }
}

/**
 * POST /api/v1/parent/payments/:id/confirm
 *
 * Finalises a PENDING gateway payment after the parent has completed
 * the mock Chapa redirect or Telebirr USSD flow.
 *
 * Transaction lifecycle:
 *   1. Verify the payment exists, is PENDING, belongs to the parent.
 *   2. Call the mock gateway confirm (simulates webhook callback).
 *   3. In a transaction: update payment to Confirmed, update invoice
 *      (paidAmount, outstandingAmount, paymentStatus), write audit log.
 */
export async function confirmParentPayment(req, res) {
  try {
    const paymentId = req.params.id;
    const userId = req.user.userId;
    const email = req.user.email;
    const schoolId = req.user.schoolId;

    const studentIds = await resolveLinkedStudentIds(userId, email);
    if (studentIds.length === 0) {
      return res.status(403).json({
        status: 'error',
        error: { code: 'FORBIDDEN', message: 'No linked students found for this account' },
      });
    }

    const existing = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { invoice: true },
    });

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        error: { code: 'NOT_FOUND', message: 'Payment not found' },
      });
    }

    if (existing.status !== 'PENDING') {
      return res.status(422).json({
        status: 'error',
        error: { code: 'INVALID_STATE', message: `Payment is already ${existing.status.toLowerCase()}` },
      });
    }

    if (!studentIds.includes(existing.invoice.studentId)) {
      return res.status(403).json({
        status: 'error',
        error: { code: 'FORBIDDEN', message: 'This payment does not belong to your linked students' },
      });
    }

    const invoice = existing.invoice;
    const amount = Number(existing.amount);
    const newPaid = Number(invoice.paidAmount) + amount;
    const newPaymentStatus = newPaid >= Number(invoice.netAmount) ? 'PAID' : 'PARTIALLY_PAID';
    const newOutstanding = Math.max(0, Number(invoice.netAmount) - newPaid);

    if (existing.referenceId) {
      await confirmPayment(existing.referenceId);
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: { status: 'Confirmed' },
      });

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newPaid,
          outstandingAmount: newOutstanding,
          paymentStatus: newPaymentStatus,
          temporalStatus: 'CURRENT',
        },
      });

      await tx.auditLog.create({
        data: {
          schoolId,
          userId,
          action: 'PARENT_PAYMENT_CONFIRMED',
          entityType: 'Payment',
          entityId: paymentId,
          oldValues: JSON.stringify({
            paymentStatus: invoice.paymentStatus,
            paidAmount: Number(invoice.paidAmount),
            outstandingAmount: Number(invoice.outstandingAmount),
          }),
          newValues: JSON.stringify({
            paymentStatus: newPaymentStatus,
            paidAmount: newPaid,
            outstandingAmount: newOutstanding,
          }),
          ipAddress: req.ip,
        },
      });

      return { payment: updatedPayment, invoice: updatedInvoice };
    });

    return res.json({
      status: 'success',
      data: {
        payment: {
          id: result.payment.id,
          receiptNo: result.payment.receiptNo,
          amount: Number(result.payment.amount),
          paymentDate: result.payment.paymentDate,
          status: result.payment.status,
        },
        invoice: {
          id: result.invoice.id,
          invoiceNo: result.invoice.invoiceNo,
          paidAmount: Number(result.invoice.paidAmount),
          outstandingAmount: Number(result.invoice.outstandingAmount),
          paymentStatus: result.invoice.paymentStatus,
        },
      },
    });
  } catch (err) {
    console.error('confirmParentPayment error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'Failed to confirm payment' },
    });
  }
}
