import prisma from '../utils/prisma.js';

/**
 * GET /api/v1/analytics/summary
 *
 * Returns aggregate statistics scoped to the authenticated user's school.
 * The tenant-isolation extension auto-injects schoolId and deletedAt filtering.
 *
 * Accountant/Admin fields:
 *   - totalOutstandingFees  (sum of outstandingAmount on non-PAID/REFUNDED invoices)
 *   - totalCollected        (sum of paidAmount on all invoices)
 *   - activeInvoiceCount    (count of non-PAID/REFUNDED invoices)
 *
 * Registrar fields:
 *   - activeStudentCount    (count of ACTIVE students)
 *   - pendingEnrollmentCount (count of PENDING students)
 */
export async function getAnalyticsSummary(req, res) {
  try {
    const role = req.user.role;

    // -- Invoice aggregations (scoped by schoolId via tenant middleware) --
    const outstandingAgg = await prisma.invoice.aggregate({
      where: { paymentStatus: { notIn: ['PAID', 'REFUNDED'] } },
      _sum: { outstandingAmount: true },
    });

    const paidAgg = await prisma.invoice.aggregate({
      _sum: { paidAmount: true },
    });

    const activeInvoiceCount = await prisma.invoice.count({
      where: { paymentStatus: { notIn: ['PAID', 'REFUNDED'] } },
    });

    // -- Student aggregations --
    const activeStudentCount = await prisma.student.count({
      where: { status: 'ACTIVE' },
    });

    const pendingEnrollmentCount = await prisma.student.count({
      where: { status: 'PENDING' },
    });

    const data = {
      totalOutstandingFees: outstandingAgg._sum.outstandingAmount ?? 0,
      totalCollected: paidAgg._sum.paidAmount ?? 0,
      activeInvoiceCount,
      activeStudentCount,
      pendingEnrollmentCount,
      role,
    };

    return res.json({ status: 'success', data });
  } catch (err) {
    console.error('getAnalyticsSummary error:', err);
    return res.status(500).json({
      status: 'error',
      error: { code: 'INTERNAL_ERROR', message: 'Failed to compute analytics' },
    });
  }
}
