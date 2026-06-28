const FEE_PERCENT = 0.025;
const FEE_CAP = 500;

export function calculateConvenienceFee(amount) {
  const raw = amount * FEE_PERCENT;
  const fee = Math.min(raw, FEE_CAP);
  return {
    percent: FEE_PERCENT,
    cap: FEE_CAP,
    fee,
    total: amount + fee,
  };
}
