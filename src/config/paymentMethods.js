/** User-selectable Razorpay checkout methods (UI labels + gateway mapping) */
export const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', payLabel: 'UPI', gateway: 'upi', logo: 'upi' },
  { id: 'gpay', label: 'Google Pay', payLabel: 'Google Pay', gateway: 'upi', logo: 'gpay' },
  { id: 'phonepe', label: 'PhonePe', payLabel: 'PhonePe', gateway: 'upi', logo: 'phonepe' },
  { id: 'paytm', label: 'Paytm', payLabel: 'Paytm', gateway: 'upi', logo: 'paytm' },
  { id: 'bhim', label: 'BHIM', payLabel: 'BHIM UPI', gateway: 'upi', logo: 'bhim' },
  { id: 'scanqr', label: 'Scan QR', payLabel: 'Scan & Pay', gateway: 'upi', logo: 'scanqr' },
  { id: 'card', label: 'Cards', payLabel: 'Card', gateway: 'card', logo: 'card' },
  { id: 'netbanking', label: 'Netbanking', payLabel: 'Netbanking', gateway: 'netbanking', logo: 'netbanking' },
  { id: 'wallet', label: 'Wallets', payLabel: 'Wallet', gateway: 'wallet', logo: 'wallet' },
];

export const CARD_BRANDS = [
  { id: 'visa', label: 'Visa', logo: 'visa' },
  { id: 'mc', label: 'Mastercard', logo: 'mastercard' },
  { id: 'rupay', label: 'RuPay', logo: 'rupay' },
  { id: 'amex', label: 'Amex', logo: 'amex' },
];

export function getPaymentMethod(id) {
  return PAYMENT_METHODS.find((m) => m.id === id) || PAYMENT_METHODS[0];
}
