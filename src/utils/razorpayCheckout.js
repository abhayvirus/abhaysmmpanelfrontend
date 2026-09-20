/**
 * Production Razorpay Checkout — live keys only.
 * Opens only the gateway the user picked on Add Funds (no duplicate method picker).
 */

export function assertLiveRazorpayKey(key) {
  if (!key || typeof key !== 'string') {
    throw new Error('Payment could not be started. Please try again.');
  }
  const k = key.trim();
  if (k.startsWith('rzp_test_')) {
    throw new Error('Payment could not be started. Please try again.');
  }
  if (!k.startsWith('rzp_live_') && !k.startsWith('rzp_')) {
    throw new Error('Payment could not be started. Please try again.');
  }
  return k;
}

export function ensureRazorpayScript() {
  if (typeof window === 'undefined' || !window.Razorpay) {
    throw new Error('Payment script failed to load. Refresh the page and try again.');
  }
}

function methodFlagsForGateway(gateway) {
  const g = String(gateway || 'upi').toLowerCase();
  return {
    upi: g === 'upi',
    card: g === 'card',
    netbanking: g === 'netbanking',
    wallet: g === 'wallet',
    emi: false,
  };
}

/**
 * Build Razorpay Checkout options locked to one gateway family.
 */
export function buildRazorpayCheckoutOptions({
  key,
  orderData,
  user,
  settings,
  gateway = 'upi',
  methodLabel = 'UPI',
  onSuccess,
  onDismiss,
}) {
  const primary = settings.theme_primary || '#2563eb';
  const logo = settings.site_logo
    ? `${window.location.origin}${settings.site_logo}`
    : undefined;
  const methods = methodFlagsForGateway(gateway);
  const razorpayMethod = methods.upi
    ? 'upi'
    : methods.card
      ? 'card'
      : methods.netbanking
        ? 'netbanking'
        : methods.wallet
          ? 'wallet'
          : 'upi';

  return {
    key,
    amount: orderData.amount,
    currency: orderData.currency || 'INR',
    order_id: orderData.orderId,
    name: settings.site_name || 'ABHAYSMM PANEL',
    description: `Wallet recharge via ${methodLabel}`,
    image: logo,
    prefill: {
      name: user.name || '',
      email: user.email || '',
      contact: user.phone || user.mobile || '',
      method: razorpayMethod,
    },
    notes: {
      purpose: 'wallet_recharge',
      user_id: String(user.id || ''),
      payment_method: methodLabel,
    },
    theme: {
      color: primary,
      backdrop_color:
        typeof document !== 'undefined' &&
        document.documentElement.getAttribute('data-theme') === 'light'
          ? 'rgba(15, 23, 42, 0.45)'
          : 'rgba(7, 11, 18, 0.85)',
    },
    // Only the selected gateway — Razorpay will show GPay/PhonePe/QR inside UPI once
    method: methods,
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
