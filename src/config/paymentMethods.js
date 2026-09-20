/** User-selectable Razorpay checkout methods.
 * UPI apps (GPay / PhonePe / Paytm / BHIM / QR) appear inside Razorpay —
 * do NOT list them separately here (that causes double selection).
 */
export const PAYMENT_METHODS = [
  {
    id: 'upi',
    label: 'UPI',
    payLabel: 'UPI',
    gateway: 'upi',
    logo: 'upi',
    hint: 'Google Pay, PhonePe, Paytm, BHIM & Scan QR',
  },
  { id: 'card', label: 'Cards', payLabel: 'Card', gateway: 'card', logo: 'card', hint: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Netbanking', payLabel: 'Netbanking', gateway: 'netbanking', logo: 'netbanking', hint: 'All major banks' },
  { id: 'wallet', label: 'Wallets', payLabel: 'Wallet', gateway: 'wallet', logo: 'wallet', hint: 'Paytm, Amazon Pay & more' },
];

/** Old chip ids that all map to Razorpay UPI (kept for settings migration) */
export const LEGACY_UPI_METHOD_IDS = ['gpay', 'phonepe', 'paytm', 'bhim', 'scanqr', 'upi'];

export const CARD_BRANDS = [
  { id: 'visa', label: 'Visa', logo: 'visa' },
  { id: 'mc', label: 'Mastercard', logo: 'mastercard' },
  { id: 'rupay', label: 'RuPay', logo: 'rupay' },
  { id: 'amex', label: 'Amex', logo: 'amex' },
];

export function getPaymentMethod(id) {
  const key = String(id || '').toLowerCase();
  if (LEGACY_UPI_METHOD_IDS.includes(key)) {
    return PAYMENT_METHODS.find((m) => m.id === 'upi') || PAYMENT_METHODS[0];
  }
  return PAYMENT_METHODS.find((m) => m.id === key) || PAYMENT_METHODS[0];
}

/** Normalize admin/settings list → unique current method ids */
export function normalizeEnabledPaymentIds(enabled) {
  const raw = Array.isArray(enabled) && enabled.length
    ? enabled.map((id) => String(id).toLowerCase())
    : PAYMENT_METHODS.map((m) => m.id);

  const out = [];
  let upiAdded = false;
  for (const id of raw) {
    if (LEGACY_UPI_METHOD_IDS.includes(id)) {
      if (!upiAdded) {
        out.push('upi');
        upiAdded = true;
      }
      continue;
    }
    if (PAYMENT_METHODS.some((m) => m.id === id) && !out.includes(id)) {
      out.push(id);
    }
  }
  return out.length ? out : ['upi', 'card', 'netbanking', 'wallet'];
}
