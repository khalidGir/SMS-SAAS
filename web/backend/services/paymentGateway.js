function generateTransactionRef() {
  return `TXR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

const DELAY_MS = 800;

class PaymentGatewayService {
  /**
   * Mock dispatch to the chosen gateway.
   *
   * @param {'CHAPA'|'TELEBIRR'} method
   * @param {number} amount          payment principal (excl. fee)
   * @param {number} platformTake    our 2.5 % convenience fee
   * @param {string} paymentId       internal payment UUID (embedded in checkoutUrl)
   * @param {string} [merchantAccount] school's registered merchant bank account
   */
  static async dispatch({ method, amount, platformTake, paymentId, merchantAccount = 'MERCH-SCH-001' }) {
    await new Promise((r) => setTimeout(r, DELAY_MS));

    const transactionRef = generateTransactionRef();

    if (method === 'CHAPA') {
      return this._chapaInitialize({ amount, platformTake, transactionRef, paymentId, merchantAccount });
    }

    if (method === 'TELEBIRR') {
      return this._telebirrSdk({ amount, platformTake, transactionRef, paymentId });
    }

    throw new Error(`Unsupported payment method: ${method}`);
  }

  /* ------------------------------------------------------------------ */
  /*  Chapa — mock POST https://api.chapa.co/v1/transaction/initialize   */
  /* ------------------------------------------------------------------ */
  static _chapaInitialize({ amount, platformTake, transactionRef, paymentId, merchantAccount }) {
    const schoolSettlement = amount - platformTake;

    console.log('[PaymentGateway:Chapa] Split-payment initialized');
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
   * Simulate confirming a payment with the gateway after the user
   * has completed the frontend flow.
   */
  static async confirm(transactionRef) {
    await new Promise((r) => setTimeout(r, 600));
    return { confirmed: true, transactionRef, settledAmount: 0 };
  }
}

export { PaymentGatewayService };
export const dispatchPayment = PaymentGatewayService.dispatch.bind(PaymentGatewayService);
export const confirmPayment = PaymentGatewayService.confirm.bind(PaymentGatewayService);
