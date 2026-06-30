import { Router } from 'express';
import crypto from 'node:crypto';
import prisma from '../utils/prisma.js';

const router = Router();

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || '';
const DEBO_WEBHOOK_SECRET = process.env.DEBO_WEBHOOK_SECRET || process.env.DEBO_SECRET_KEY || '';

function verifyChapaSignature(req) {
  if (!CHAPA_SECRET_KEY) return true;
  const signature = req.headers['x-chapa-signature'];
  if (!signature) return false;
  const hash = crypto.createHmac('sha256', CHAPA_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

function verifyDeboPaySignature(req) {
  if (!DEBO_WEBHOOK_SECRET) return true;
  const header = req.headers['x-debopay-signature'];
  if (!header) return false;
  const parts = Object.fromEntries(header.split(',').map(p => p.split('=')));
  const rawBody = JSON.stringify(req.body);
  const sig = crypto.createHmac('sha256', DEBO_WEBHOOK_SECRET)
    .update(`${parts.t}.${rawBody}`).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(parts.v1));
}

/**
 * POST /api/v1/payments/webhook/chapa
 *
 * Called by Chapa when a transaction status changes.
 * Updates payment + invoice records accordingly.
 */
router.post('/chapa', async (req, res) => {
  try {
    if (!verifyChapaSignature(req)) {
      return res.status(401).json({ status: 'error', message: 'Invalid signature' });
    }

    const { event, data } = req.body;

    if (!data?.tx_ref) {
      return res.status(422).json({ status: 'error', message: 'Missing tx_ref' });
    }

    const isSuccess = event === 'charge.success' && data.status === 'success';

    const payment = await prisma.payment.findFirst({
      where: { referenceId: data.tx_ref },
      include: { invoice: true },
    });

    if (!payment) {
      console.warn(`[Webhook:Chapa] No payment found for tx_ref: ${data.tx_ref}`);
      return res.status(404).json({ status: 'error', message: 'Payment not found' });
    }

    if (payment.status !== 'PENDING') {
      return res.json({ status: 'ignored', message: `Payment already ${payment.status}` });
    }

    const invoice = payment.invoice;
    const amount = Number(payment.amount);
    const newPaid = Number(invoice.paidAmount) + amount;
    const newPaymentStatus = newPaid >= Number(invoice.netAmount) ? 'PAID' : 'PARTIALLY_PAID';
    const newOutstanding = Math.max(0, Number(invoice.netAmount) - newPaid);

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: isSuccess ? 'Confirmed' : 'FAILED',
          gatewayResponse: JSON.stringify(data),
        },
      });

      if (isSuccess) {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            paidAmount: newPaid,
            outstandingAmount: newOutstanding,
            paymentStatus: newPaymentStatus,
            temporalStatus: 'CURRENT',
          },
        });
      }
    });

    console.log(`[Webhook:Chapa] Payment ${payment.id} → ${isSuccess ? 'Confirmed' : 'FAILED'}`);
    return res.json({ status: 'success' });
  } catch (err) {
    console.error('[Webhook:Chapa] Error:', err);
    return res.status(500).json({ status: 'error', message: 'Internal error' });
  }
});

/**
 * POST /api/v1/payments/webhook/debopay
 *
 * Called by DeboPay when a transaction status changes.
 * Uses X-DeboPay-Signature header (HMAC-SHA256 of timestamp.body).
 */
router.post('/debopay', async (req, res) => {
  try {
    if (!verifyDeboPaySignature(req)) {
      return res.status(401).json({ status: 'error', message: 'Invalid signature' });
    }

    const { event, data } = req.body;
    const reference = data?.reference;

    if (!reference) {
      return res.status(422).json({ status: 'error', message: 'Missing reference' });
    }

    const isSuccess = event === 'payment.success' && data.status === 'success';

    const payment = await prisma.payment.findFirst({
      where: { referenceId: reference },
      include: { invoice: true },
    });

    if (!payment) {
      console.warn(`[Webhook:DeboPay] No payment found for reference: ${reference}`);
      return res.status(404).json({ status: 'error', message: 'Payment not found' });
    }

    if (payment.status !== 'PENDING') {
      return res.json({ status: 'ignored', message: `Payment already ${payment.status}` });
    }

    const invoice = payment.invoice;
    const amount = Number(payment.amount);
    const newPaid = Number(invoice.paidAmount) + amount;
    const newPaymentStatus = newPaid >= Number(invoice.netAmount) ? 'PAID' : 'PARTIALLY_PAID';
    const newOutstanding = Math.max(0, Number(invoice.netAmount) - newPaid);

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: isSuccess ? 'Confirmed' : 'FAILED',
          gatewayResponse: JSON.stringify(data),
        },
      });

      if (isSuccess) {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            paidAmount: newPaid,
            outstandingAmount: newOutstanding,
            paymentStatus: newPaymentStatus,
            temporalStatus: 'CURRENT',
          },
        });
      }
    });

    console.log(`[Webhook:DeboPay] Payment ${payment.id} → ${isSuccess ? 'Confirmed' : 'FAILED'}`);
    return res.json({ status: 'success' });
  } catch (err) {
    console.error('[Webhook:DeboPay] Error:', err);
    return res.status(500).json({ status: 'error', message: 'Internal error' });
  }
});

export default router;
