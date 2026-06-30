const CHAPA_API_BASE = 'https://api.chapa.co/v1';
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || '';
const USE_CHAPA_MOCK = !CHAPA_SECRET_KEY;

const DEBO_API_BASE = 'https://api.debopay.com/v1';
const DEBO_SECRET_KEY = process.env.DEBO_SECRET_KEY || '';
const USE_DEBO_MOCK = !DEBO_SECRET_KEY;

function generateTransactionRef(prefix = 'TXR') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

class PaymentGatewayService {
  /**
   * Dispatch payment to the chosen gateway.
   * Falls back to mock mode when the respective secret key is not set.
   *
   * @param {'CHAPA'|'TELEBIRR'|'DEBOPAY'} method
   * @param {number} amount          payment principal (excl. fee)
   * @param {number} platformTake    our 2.5 % convenience fee
   * @param {string} paymentId       internal payment UUID
   * @param {string} [merchantAccount] school's registered merchant bank account
   */
  static async dispatch({ method, amount, platformTake, paymentId, merchantAccount = 'MERCH-SCH-001' }) {
    if (method === 'CHAPA') {
      const transactionRef = generateTransactionRef('TXR');
      if (USE_CHAPA_MOCK) {
        return this._chapaMock({ amount, platformTake, transactionRef, paymentId, merchantAccount });
      }
      return this._chapaInitialize({ amount, platformTake, transactionRef, paymentId });
    }

    if (method === 'DEBOPAY') {
      const transactionRef = generateTransactionRef('DBO');
      if (USE_DEBO_MOCK) {
        return this._debopayMock({ amount, platformTake, transactionRef, paymentId });
      }
      return this._debopayInitialize({ amount, platformTake, transactionRef, paymentId });
    }

    if (method === 'TELEBIRR') {
      const transactionRef = generateTransactionRef('TLE');
      return this._telebirrSdk({ amount, platformTake, transactionRef, paymentId });
    }

    throw new Error(`Unsupported payment method: ${method}`);
  }

  /* ------------------------------------------------------------------ */
  /*  Chapa — real POST /v1/transaction/initialize                       */
  /* ------------------------------------------------------------------ */
  static async _chapaInitialize({ amount, platformTake, transactionRef, paymentId }) {
    const total = amount + platformTake;

    const body = {
      amount: total,
      currency: 'ETB',
      tx_ref: transactionRef,
      callback_url: `${process.env.APP_URL || 'http://localhost:4000'}/api/v1/payments/webhook/chapa`,
      return_url: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard/parent/invoices`,
      customization: {
        title: 'School Fees Payment',
        description: `Invoice payment ${paymentId.slice(0, 8)}`,
      },
    };

    const res = await fetch(`${CHAPA_API_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (!res.ok || json.status !== 'success') {
      throw new Error(`Chapa init failed: ${json.message || res.statusText}`);
    }

    console.log('[PaymentGateway:Chapa] Transaction initialized');
    console.log(`  → Checkout URL : ${json.data.checkout_url}`);
    console.log(`  → Tx ref       : ${transactionRef}`);

    return {
      type: 'CHAPA',
      transactionRef,
      checkoutUrl: json.data.checkout_url,
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Chapa — mock fallback for local dev                                */
  /* ------------------------------------------------------------------ */
  static _chapaMock({ amount, platformTake, transactionRef, paymentId, merchantAccount }) {
    const schoolSettlement = amount - platformTake;

    console.log('[PaymentGateway:Chapa:MOCK] Dev mode — no CHAPA_SECRET_KEY set');
    console.log(`  → Merchant account   : ${merchantAccount}`);
    console.log(`  → School settlement   : ${schoolSettlement.toFixed(2)} ETB`);
    console.log(`  → Platform take (2.5%): ${platformTake.toFixed(2)} ETB (capped at 500)`);
    console.log(`  → Transaction ref     : ${transactionRef}`);

    return {
      type: 'CHAPA',
      transactionRef,
      checkoutUrl: `/mock-gateway/chapa?payment_id=${paymentId}&tx_ref=${transactionRef}&amount=${amount + platformTake}`,
    };
  }

  /* ------------------------------------------------------------------ */
  /*  DeboPay — real POST /v1/payments/initialize                        */
  /* ------------------------------------------------------------------ */
  static async _debopayInitialize({ amount, platformTake, transactionRef, paymentId }) {
    const total = amount + platformTake;

    const body = {
      amount: total,
      currency: 'ETB',
      reference: transactionRef,
      callback_url: `${process.env.APP_URL || 'http://localhost:4000'}/api/v1/payments/webhook/debopay`,
      customer: {
        email: `payment-${paymentId.slice(0, 8)}@sms.app`,
      },
    };

    const res = await fetch(`${DEBO_API_BASE}/payments/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEBO_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (!res.ok || json.status !== 'success') {
      throw new Error(`DeboPay init failed: ${json.error?.message || res.statusText}`);
    }

    console.log('[PaymentGateway:DeboPay] Transaction initialized');
    console.log(`  → Checkout URL : ${json.data.checkout_url}`);
    console.log(`  → Ref          : ${transactionRef}`);
    console.log(`  → Debo ref     : ${json.data.debo_reference}`);

    return {
      type: 'DEBOPAY',
      transactionRef,
      checkoutUrl: json.data.checkout_url,
      deboReference: json.data.debo_reference,
    };
  }

  /* ------------------------------------------------------------------ */
  /*  DeboPay — mock fallback for local dev                              */
  /* ------------------------------------------------------------------ */
  static _debopayMock({ amount, platformTake, transactionRef, paymentId }) {
    const total = amount + platformTake;

    console.log('[PaymentGateway:DeboPay:MOCK] Dev mode — no DEBO_SECRET_KEY set');
    console.log(`  → Total amount  : ${total.toFixed(2)} ETB`);
    console.log(`  → Transaction ref: ${transactionRef}`);

    return {
      type: 'DEBOPAY',
      transactionRef,
      checkoutUrl: `/mock-gateway/debopay?payment_id=${paymentId}&tx_ref=${transactionRef}&amount=${total}`,
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Telebirr — mock Partner SDK → secure signed web-pay link          */
  /* ------------------------------------------------------------------ */
  static _telebirrSdk({ amount, platformTake, transactionRef, paymentId }) {
    const total = amount + platformTake;
    const signedPayload = Buffer.from(
      JSON.stringify({ amount: total, ts: Date.now(), nonce: Math.random().toString(36).slice(2) }),
    ).toString('base64');

    console.log('[PaymentGateway:Telebirr] Web-pay link generated');
    console.log(`  → Signed payload      : ${signedPayload.slice(0, 40)}...`);
    console.log(`  → Transaction ref     : ${transactionRef}`);

    return {
      type: 'TELEBIRR',
      transactionRef,
      checkoutUrl: `/mock-gateway/telebirr?payment_id=${paymentId}&tx_ref=${transactionRef}&amount=${total}&signed=${signedPayload}`,
    };
  }

  /**
   * Confirm/verify a payment with the gateway.
   * Routes to the correct gateway based on the transaction ref prefix.
   * Falls back to mock when the respective secret key is not set.
   */
  static async confirm(transactionRef) {
    if (!transactionRef) {
      return { confirmed: false, transactionRef, settledAmount: 0 };
    }

    if (transactionRef.startsWith('TXR-') && !USE_CHAPA_MOCK) {
      return this._chapaVerify(transactionRef);
    }

    if (transactionRef.startsWith('DBO-') && !USE_DEBO_MOCK) {
      return this._debopayVerify(transactionRef);
    }

    return { confirmed: true, transactionRef, settledAmount: 0 };
  }

  static async _chapaVerify(transactionRef) {
    const res = await fetch(`${CHAPA_API_BASE}/transaction/verify/${transactionRef}`, {
      headers: { 'Authorization': `Bearer ${CHAPA_SECRET_KEY}` },
    });

    const json = await res.json();

    if (!res.ok || json.status !== 'success') {
      console.error(`[PaymentGateway:Chapa] Verify failed for ${transactionRef}:`, json.message);
      return { confirmed: false, transactionRef, settledAmount: 0 };
    }

    const isSuccess = json.data.status === 'success';
    return {
      confirmed: isSuccess,
      transactionRef,
      settledAmount: isSuccess ? Number(json.data.amount) : 0,
      gatewayResponse: json.data,
    };
  }

  static async _debopayVerify(transactionRef) {
    const res = await fetch(`${DEBO_API_BASE}/transactions/${transactionRef}`, {
      headers: { 'Authorization': `Bearer ${DEBO_SECRET_KEY}` },
    });

    const json = await res.json();

    if (!res.ok || json.status !== 'success') {
      console.error(`[PaymentGateway:DeboPay] Verify failed for ${transactionRef}:`, json.error?.message);
      return { confirmed: false, transactionRef, settledAmount: 0 };
    }

    const isSuccess = json.data.status === 'success';
    return {
      confirmed: isSuccess,
      transactionRef,
      settledAmount: isSuccess ? Number(json.data.amount) : 0,
      gatewayResponse: json.data,
    };
  }
}

export { PaymentGatewayService };
export const dispatchPayment = PaymentGatewayService.dispatch.bind(PaymentGatewayService);
export const confirmPayment = PaymentGatewayService.confirm.bind(PaymentGatewayService);
