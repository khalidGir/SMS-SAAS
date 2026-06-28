import cron from 'node-cron';
import prisma from '../utils/prisma.js';

// ────────────────────────────────────────────────────────────
// Section 24 — Late Fee Accrual Specification
// ────────────────────────────────────────────────────────────
//
// Trigger:   Daily at 00:05 UTC
// Target:    temporalStatus = OVERDUE, paymentStatus NOT IN (PAID, REFUNDED), deletedAt IS NULL
// FLAT:      Apply once when late_fee_amount == 0
// DAILY:     Increment by late_fee_rate each run
// Rounding:  round(current + rate, 2)
// Recalc:    net_amount = (total_amount + late_fee_amount) - discount_amount
//            outstanding_amount = net_amount - paid_amount

function round2(value) {
  return Math.round(value * 100) / 100;
}

export async function executeLateFeeRun() {
  const startTime = Date.now();
  console.log(`[LateFeeCron] ⏰ Run started at ${new Date().toISOString()}`);

  let processed = 0;
  let skipped = 0;
  let errors = [];

  try {
    // Fetch target invoices with their fee structures
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        temporalStatus: 'OVERDUE',
        paymentStatus: { notIn: ['PAID', 'REFUNDED'] },
        deletedAt: null,
      },
      include: {
        feeStructure: {
          select: { lateFeeType: true, lateFeeRate: true },
        },
      },
    });

    console.log(`[LateFeeCron] 📋 Found ${overdueInvoices.length} overdue invoice(s)`);

    // Process each invoice in an isolated transaction
    for (const invoice of overdueInvoices) {
      try {
        await prisma.$transaction(async (tx) => {
          const { lateFeeType, lateFeeRate } = invoice.feeStructure;
          const oldLateFee = invoice.lateFeeAmount;

          let newLateFee;

          if (lateFeeType === 'FLAT') {
            // Apply flat fee only once — skip if already charged
            if (oldLateFee > 0) {
              skipped++;
              console.log(`  [SKIP] ${invoice.invoiceNo}: FLAT already applied ($${oldLateFee})`);
              return;
            }
            newLateFee = round2(lateFeeRate);
          } else {
            // DAILY — increment by rate each run
            newLateFee = round2(oldLateFee + lateFeeRate);
          }

          // Recalculate totals per Section 24.3
          const netAmount = round2(
            (invoice.totalAmount + newLateFee) - invoice.discountAmount
          );
          const outstandingAmount = round2(netAmount - invoice.paidAmount);

          // Persist the update
          await tx.invoice.update({
            where: { id: invoice.id },
            data: {
              lateFeeAmount: newLateFee,
              netAmount,
              outstandingAmount,
            },
          });

          // Log audit trail
          await tx.auditLog.create({
            data: {
              schoolId: invoice.schoolId,
              action: 'LATE_FEE_APPLIED',
              entityType: 'Invoice',
              entityId: invoice.id,
              oldValues: JSON.stringify({
                lateFeeAmount: oldLateFee,
                netAmount: invoice.netAmount,
                outstandingAmount: invoice.outstandingAmount,
              }),
              newValues: JSON.stringify({
                lateFeeAmount: newLateFee,
                netAmount,
                outstandingAmount,
              }),
            },
          });

          processed++;
          const type = lateFeeType === 'FLAT' ? 'FLAT' : 'DAILY';
          console.log(
            `  [${type}]  ${invoice.invoiceNo}: $${oldLateFee} → $${newLateFee} (outstanding: $${outstandingAmount})`
          );
        });
      } catch (err) {
        errors.push({ invoice: invoice.invoiceNo, error: err.message });
        console.error(`  [ERR]  ${invoice.invoiceNo}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`[LateFeeCron] ❌ Query failed:`, err);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`[LateFeeCron] ✅ Run complete`);
  console.log(`[LateFeeCron]    Processed: ${processed}`);
  console.log(`[LateFeeCron]    Skipped:   ${skipped}`);
  console.log(`[LateFeeCron]    Errors:    ${errors.length}`);
  console.log(`[LateFeeCron]    Duration:  ${duration}s`);

  return { processed, skipped, errors, duration: `${duration}s` };
}

/**
 * Schedule the cron job to run daily at 00:05 UTC.
 * Uses node-cron syntax: '5 0 * * *' = minute 5, hour 0, every day.
 */
export function scheduleLateFeeCron() {
  const schedule = '5 0 * * *';

  console.log(`[LateFeeCron] 🕐 Scheduled for ${schedule} UTC`);

  cron.schedule(
    schedule,
    async () => {
      console.log(`[LateFeeCron] 🔔 Cron fired at ${new Date().toISOString()}`);
      await executeLateFeeRun();
    },
    {
      timezone: 'UTC',
    }
  );
}
