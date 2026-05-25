/** Razorpay Live key — must match backend RAZORPAY_KEY_ID */
export const RAZORPAY_KEY_ID = (process.env.REACT_APP_RAZORPAY_KEY_ID || '').trim();

export function resolveRazorpayKeyId(apiKeyId, settingsKeyId) {
  if (RAZORPAY_KEY_ID && RAZORPAY_KEY_ID.startsWith('rzp_')) return RAZORPAY_KEY_ID;
  if (apiKeyId && apiKeyId.startsWith('rzp_')) return apiKeyId;
  if (settingsKeyId && settingsKeyId.startsWith('rzp_')) return settingsKeyId;
  return '';
}
