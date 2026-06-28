import prisma from '../utils/prisma.js';
import { createInvoiceSchema, updateInvoiceSchema } from '../validations/invoice.js';

/**
 * GET /api/v1/invoices
 *
 * Returns invoices scoped to the current school.
 * Accessible by: Accountant, Registrar, Admin
 */
export async function listInvoices(req, res) {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        student: { select: { firstName: true, lastName: true, studentId: true } },
        feeStructure: { select: { name: true } },
        term: { select: { name: true } },
        school: { select: { minPartialPaymentAllowed: true } },
        payments: { select: { amount: true, paymentMethod: true, paymentDate: true, status: true } },
      },
    });
    return res.json({ status: 'success', data: invoices });
  } catch (err) {
    console.error('listInvoices error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch invoices' },
    });
  }
}

/**
 * GET /api/v1/invoices/:id
 *
 * Returns a single invoice with full details.
 */
export async function getInvoice(req, res) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        student: true,
        feeStructure: true,
        term: true,
        school: { select: { minPartialPaymentAllowed: true } },
        payments: { include: { recordedBy: { select: { firstName: true, lastName: true } } } },
      },
    });
    if (!invoice) {
      return res.status(404).json({
        status: 'error',
        error: { code: 'NOT_FOUND', message: 'Invoice not found' },
      });
    }
    return res.json({ status: 'success', data: invoice });
  } catch (err) {
    console.error('getInvoice error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch invoice' },
    });
  }
}

/**
 * POST /api/v1/invoices
 *
 * Creates a new invoice for a student. The fee structure's base amount
 * and due date drive the invoice totals.
 */
export async function createInvoice(req, res) {
  const parsed = createInvoiceSchema.safeParse(req.body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return res.status(422).json({
      status: 'error',
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', fields: fieldErrors },
    });
  }

  try {
    const { studentId, feeStructureId, termId, discountAmount, notes } = parsed.data;
    const schoolId = req.user.schoolId;

    // Resolve fee structure to get base amount and due date
    const feeStructure = await prisma.feeStructure.findUnique({
      where: { id: feeStructureId },
    });
    if (!feeStructure) {
      return res.status(404).json({
        status: 'error',
        error: { code: 'NOT_FOUND', message: 'Fee structure not found' },
      });
    }

    const discount = discountAmount ?? 0;
    const netAmount = feeStructure.baseAmount - discount;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo: `INV-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        schoolId,
        studentId,
        feeStructureId,
        termId,
        totalAmount: feeStructure.baseAmount,
        discountAmount: discount,
        lateFeeAmount: 0,
        netAmount,
        paidAmount: 0,
        outstandingAmount: netAmount,
        dueDate: feeStructure.dueDate,
        notes: notes ?? null,
      },
    });

    return res.status(201).json({ status: 'success', data: invoice });
  } catch (err) {
    console.error('createInvoice error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create invoice' },
    });
  }
}

/**
 * PATCH /api/v1/invoices/:id
 *
 * Updates invoice metadata (e.g. discount, notes, status).
 * Amount mutations go through payments, not direct PATCH.
 */
export async function updateInvoice(req, res) {
  const parsed = updateInvoiceSchema.safeParse(req.body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return res.status(422).json({
      status: 'error',
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', fields: fieldErrors },
    });
  }

  try {
    const data = parsed.data;

    // If discount is being changed, recalculate net/outstanding
    if (data.discountAmount !== undefined) {
      const current = await prisma.invoice.findUnique({ where: { id: req.params.id } });
      if (!current) {
        return res.status(404).json({
          status: 'error',
          error: { code: 'NOT_FOUND', message: 'Invoice not found' },
        });
      }
      data.netAmount = current.totalAmount + current.lateFeeAmount - data.discountAmount;
      data.outstandingAmount = Math.max(0, data.netAmount - current.paidAmount);
    }

    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data,
    });

    return res.json({ status: 'success', data: invoice });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        error: { code: 'NOT_FOUND', message: 'Invoice not found' },
      });
    }
    console.error('updateInvoice error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update invoice' },
    });
  }
}
