/**
 * Production Razorpay Checkout — live keys only.
 * Script loads on demand (Add Funds pay click) — never on login/home.
 */

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
let razorpayScriptPromise = null;

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

/** Load checkout.js once — only when user starts payment. */
export function loadRazorpayScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Payment is only available in the browser.'));
  }
  if (window.Razorpay) return Promise.resolve(window.Razorpay);

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
      if (existing) {
        existing.addEventListener('load', () => {
          if (window.Razorpay) resolve(window.Razorpay);
          else reject(new Error('Payment script failed to load. Refresh and try again.'));
        });
        existing.addEventListener('error', () => {
          razorpayScriptPromise = null;
          reject(new Error('Payment script failed to load. Check your connection.'));
        });
        return;
      }

      const script = document.createElement('script');
      script.src = RAZORPAY_SCRIPT_SRC;
      script.async = true;
      script.onload = () => {
        if (window.Razorpay) resolve(window.Razorpay);
        else {
          razorpayScriptPromise = null;
          reject(new Error('Payment script failed to load. Refresh and try again.'));
        }
      };
      script.onerror = () => {
        razorpayScriptPromise = null;
        reject(new Error('Payment script failed to load. Check your connection.'));
      };
      document.body.appendChild(script);
    });
  }
  return razorpayScriptPromise;
}

/** @deprecated use loadRazorpayScript — kept for sync callers that already awaited load */
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
 * Loads checkout.js on demand (not on login page).
 */
export async function openRazorpayModal(options, { onFailed, onDismiss } = {}) {
  await loadRazorpayScript();
  const rzp = new window.Razorpay(options);
  if (onFailed) {
    rzp.on('payment.failed', onFailed);
  }
  rzp.open();
  return rzp;
}
