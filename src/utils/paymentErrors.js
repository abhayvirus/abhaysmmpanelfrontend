/** Map server/technical payment errors to user-safe copy (no env/Render hints). */
export function friendlyPaymentError(errOrMessage) {
  const raw =
    typeof errOrMessage === 'string'
      ? errOrMessage
      : errOrMessage?.response?.data?.message || errOrMessage?.message || '';

  const text = String(raw).trim();
  if (!text) return 'Payment could not be completed. Please try again.';

  if (
    /razorpay|render|secret|env variable|key_secret|key_id|not configured|webhook|invalid.?signature/i.test(
      text
    )
  ) {
    return 'Payment could not be completed. Please try again in a moment.';
  }

  return text;
}
