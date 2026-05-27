/**
 * Production Razorpay Checkout — live keys only, all payment methods enabled.
 */

export function assertLiveRazorpayKey(key) {
  if (!key || typeof key !== 'string') {
    throw new Error('Razorpay key not configured on server');
  }
  const k = key.trim();
  if (k.startsWith('rzp_test_')) {
    throw new Error('Test mode is disabled. Configure live Razorpay keys (rzp_live_…).');
  }
  if (!k.startsWith('rzp_live_')) {
    throw new Error('Invalid Razorpay live key');
  }
  return k;
}

export function ensureRazorpayScript() {
  if (typeof window === 'undefined' || !window.Razorpay) {
    throw new Error('Payment script failed to load. Refresh the page and try again.');
  }
}

/**
 * Build Razorpay Checkout options (modal shows UPI, cards, netbanking, wallets, EMI, Scan & Pay).
 */
export function buildRazorpayCheckoutOptions({
  key,
  orderData,
  user,
  settings,
  onSuccess,
  onDismiss,
}) {
  const primary = settings.theme_primary || '#2563eb';
  const logo = settings.site_logo
    ? `${window.location.origin}${settings.site_logo}`
    : undefined;

  return {
    key,
    amount: orderData.amount,
    currency: orderData.currency || 'INR',
    order_id: orderData.orderId,
    name: settings.site_name || 'ABHAYSMM PANEL',
    description: `Wallet recharge — ₹${Number(orderData.payableAmount || 0).toFixed(2)}`,
    image: logo,
    prefill: {
      name: user.name || '',
      email: user.email || '',
      contact: user.phone || user.mobile || '',
    },
    notes: {
      purpose: 'wallet_recharge',
      user_id: String(user.id || ''),
    },
    theme: { color: primary, backdrop_color: 'rgba(7, 11, 18, 0.85)' },
    method: {
      upi: true,
      card: true,
      netbanking: true,
      wallet: true,
      emi: true,
    },
    config: {
      display: {
        language: 'en',
        preferences: {
          show_default_blocks: true,
        },
      },
    },
    retry: { enabled: true, max_count: 3 },
    handler: onSuccess,
    modal: {
      ondismiss: onDismiss,
      escape: true,
      confirm_close: true,
      animation: true,
    },
  };
}

/**
 * Open Razorpay modal and wire failure / dismiss handlers.
 */
export function openRazorpayModal(options, { onFailed, onDismiss } = {}) {
  ensureRazorpayScript();
  const rzp = new window.Razorpay(options);
  if (onFailed) {
    rzp.on('payment.failed', onFailed);
  }
  rzp.open();
  return rzp;
}
