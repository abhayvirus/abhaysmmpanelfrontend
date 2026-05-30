import React, { useState, useEffect, useCallback, useMemo } from 'react';
import UserLayout from '../components/UserLayout';
import SuccessModal from '../components/SuccessModal';
import {
  getPaymentHistory,
  getTransactions,
  getWalletBalance,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentConfig,
  getPublicRazorpayConfig,
  validateCoupon,
} from '../api';
import { useSettings } from '../contexts/SettingsContext';
import { resolveRazorpayKeyId } from '../config/razorpay';
import {
  assertLiveRazorpayKey,
  buildRazorpayCheckoutOptions,
  openRazorpayModal,
} from '../utils/razorpayCheckout';
import PaymentMethodLogo from '../components/PaymentMethodLogo';
import { PAYMENT_METHODS, CARD_BRANDS, getPaymentMethod } from '../config/paymentMethods';

const ALL_PAYMENT_IDS = PAYMENT_METHODS.map((m) => m.id);

function getEnabledPaymentMethods(settings) {
  const enabled = settings?.payment_methods_enabled;
  const ids = Array.isArray(enabled) && enabled.length ? enabled : ALL_PAYMENT_IDS;
  return PAYMENT_METHODS.filter((m) => ids.includes(m.id));
}

const QUICK_AMOUNTS = [100, 250, 500, 1000, 2000];

const statusBadge = (status) => {
  const map = {
    pending: 'badge-warning',
    completed: 'badge-success',
    rejected: 'badge-danger',
    failed: 'badge-danger',
    refunded: 'badge-info',
  };
  return map[status] || 'badge-info';
};

const statusLabel = (status) => {
  const map = {
    pending: 'Pending',
    completed: 'Success',
    rejected: 'Failed',
    failed: 'Failed',
    refunded: 'Refunded',
  };
  return map[status] || status;
};

const formatPaymentDate = (iso) => {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

const sortPaymentsNewestFirst = (list) =>
  [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

const AddFunds = () => {
  const { settings } = useSettings();
  const paymentMethods = useMemo(() => getEnabledPaymentMethods(settings), [settings]);
  const sym = settings.currency_symbol || '₹';
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('100');
  const [couponCode, setCouponCode] = useState('');
  const [couponInfo, setCouponInfo] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('upi');

  useEffect(() => {
    if (!paymentMethods.find((m) => m.id === selectedMethod)) {
      setSelectedMethod(paymentMethods[0]?.id || 'upi');
    }
  }, [paymentMethods, selectedMethod]);
  const [razorpayConfig, setRazorpayConfig] = useState({
    razorpayConfigured: false,
    razorpayEnabled: false,
    keyId: '',
    configError: '',
  });
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payPhase, setPayPhase] = useState('idle'); // idle | creating | verifying
  const [toast, setToast] = useState(null);
  const [successModal, setSuccessModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'success',
  });

  const refreshWallet = useCallback(async () => {
    try {
      const { data } = await getWalletBalance();
      const bal = parseFloat(data.balance || 0);
      setBalance(bal);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...user, balance: bal }));
    } catch {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setBalance(parseFloat(user.balance || 0));
    }
  }, []);

  const load = useCallback(() => {
    getPaymentHistory()
      .then((r) => setHistory(sortPaymentsNewestFirst(r.data || [])))
      .catch(() => setHistory([]));
    getTransactions()
      .then((r) => {
        const rows = r.data || [];
        rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setTransactions(rows);
      })
      .catch(() => setTransactions([]));
    refreshWallet();
  }, [refreshWallet]);

  useEffect(() => {
    const applyConfig = (data, errorMsg = '') => {
      const configured = Boolean(data?.razorpayConfigured ?? data?.razorpayEnabled);
      const settingsKey = settings.razorpay_key_id?.trim?.() || '';
      const hasSettingsKey = settingsKey.startsWith('rzp_');
      const keyId = data?.keyId || (hasSettingsKey ? settingsKey : '');
      const ready = configured || (hasSettingsKey && keyId.startsWith('rzp_'));
      setRazorpayConfig({
        razorpayConfigured: ready,
        razorpayEnabled: ready,
        keyId,
        configError: ready ? '' : (errorMsg || data?.issues?.join(', ') || ''),
      });
    };

    getPaymentConfig()
      .then((r) => applyConfig(r.data))
      .catch(() =>
        getPublicRazorpayConfig()
          .then((r) => applyConfig(r.data))
          .catch((e) => {
            const settingsKey = settings.razorpay_key_id?.trim?.() || '';
            if (settingsKey.startsWith('rzp_')) {
              applyConfig({ razorpayConfigured: true, keyId: settingsKey });
            } else {
              applyConfig(
                { razorpayConfigured: false },
                e.response?.data?.message || 'Could not load payment config'
              );
            }
          })
      );
    load();
  }, [load, settings.razorpay_key_id]);

  const razorpayReady = razorpayConfig.razorpayConfigured || razorpayConfig.razorpayEnabled;

  const payableAmount = couponInfo?.final_amount
    ? parseFloat(couponInfo.final_amount)
    : parseFloat(amount) || 0;

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 5500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (type, message) => setToast({ type, message });

  const selectedMethodMeta = getPaymentMethod(selectedMethod);

  const payButtonLabel = () => {
    if (payPhase === 'creating') return 'Creating secure payment...';
    if (payPhase === 'verifying') return 'Verifying payment...';
    return `Pay ${sym}${payableAmount.toFixed(2)} with ${selectedMethodMeta.payLabel}`;
  };

  const applyCoupon = async () => {
    const amt = parseFloat(amount) || 0;
    if (!couponCode.trim() || amt < 10) return;
    setLoading(true);
    try {
      const { data } = await validateCoupon(couponCode.trim(), amt);
      setCouponInfo(data);
    } catch (e) {
      setCouponInfo(null);
      setSuccessModal({
        open: true,
        type: 'failed',
        title: 'Invalid coupon',
        message: e.response?.data?.message || 'Coupon could not be applied',
      });
    }
    setLoading(false);
  };

  const resetPayState = () => {
    setPaying(false);
    setPayPhase('idle');
  };

  const openRazorpayCheckout = async () => {
    const amt = payableAmount;
    if (!amt || amt < 10) {
      setSuccessModal({
        open: true,
        type: 'failed',
        title: 'Invalid amount',
        message: 'Minimum recharge is ₹10',
      });
      return;
    }

    if (!razorpayReady) {
      setSuccessModal({
        open: true,
        type: 'failed',
        title: 'Razorpay unavailable',
        message: razorpayConfig.configError || 'Payment gateway is not configured.',
      });
      return;
    }

    setPaying(true);
    setPayPhase('creating');

    try {
      const { data: orderData } = await createRazorpayOrder(
        amt,
        couponInfo?.code || couponCode || undefined
      );
      const rawKey = resolveRazorpayKeyId(
        orderData.keyId,
        razorpayConfig.keyId || settings.razorpay_key_id
      );
      const key = assertLiveRazorpayKey(rawKey);

      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const options = buildRazorpayCheckoutOptions({
        key,
        orderData,
        user,
        settings,
        onDismiss: () => {
          resetPayState();
          showToast('info', 'Payment cancelled');
        },
        onSuccess: async (response) => {
          setPayPhase('verifying');
          try {
            const v = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              payment_method: selectedMethodMeta.payLabel,
            });
            const newBal = parseFloat(v.data.balance);
            const added = parseFloat(v.data.balance_added);
            setBalance(newBal);
            localStorage.setItem('user', JSON.stringify({ ...user, balance: newBal }));
            setAmount('100');
            setCouponInfo(null);
            setCouponCode('');
            showToast('success', `₹${added.toFixed(2)} added! Balance: ${sym}${newBal.toFixed(2)}`);
            setSuccessModal({
              open: true,
              type: 'success',
              title: 'Payment successful',
              message: `₹${added.toFixed(2)} credited instantly. New balance: ${sym}${newBal.toFixed(2)}`,
            });
            load();
          } catch (err) {
            const code = err.response?.data?.code;
            const msg = err.response?.data?.message
              || (code === 'INVALID_SIGNATURE'
                ? 'Invalid payment signature. Contact support with your payment ID.'
                : 'Payment received but verification failed. Wallet will update via webhook if payment succeeded.');
            showToast('error', msg);
            setSuccessModal({
              open: true,
              type: 'failed',
              title: code === 'INVALID_SIGNATURE' ? 'Invalid signature' : 'Verification failed',
              message: msg,
            });
          } finally {
            resetPayState();
          }
        },
      });
      // Open checkout with only the user-selected gateway enabled.
      options.method = {
        upi: selectedMethodMeta.gateway === 'upi',
        card: selectedMethodMeta.gateway === 'card',
        netbanking: selectedMethodMeta.gateway === 'netbanking',
        wallet: selectedMethodMeta.gateway === 'wallet',
        emi: selectedMethodMeta.gateway === 'card',
      };
      options.description = `Wallet recharge via ${selectedMethodMeta.label}`;

      setPayPhase('idle');
      openRazorpayModal(options, {
        onFailed: (resp) => {
          resetPayState();
          const msg = resp.error?.description || resp.error?.reason || 'Payment was not completed';
          showToast('error', msg);
          setSuccessModal({
            open: true,
            type: 'failed',
            title: 'Payment failed',
            message: msg,
          });
        },
        onDismiss: options.modal.ondismiss,
      });
    } catch (e) {
      resetPayState();
      const isNetwork = !e.response && (
        e.code === 'ERR_NETWORK' || /network/i.test(e.message || '')
      );
      const msg = e.response?.data?.message || e.message || 'Could not start payment';
      showToast('error', msg);
      setSuccessModal({
        open: true,
        type: 'failed',
        title: isNetwork ? 'Network error' : 'Cannot start payment',
        message: isNetwork
          ? 'Check your internet connection and try again.'
          : msg,
      });
    }
  };

  return (
    <UserLayout>
      <div className="add-funds-page">
      <div className="page-header">
        <div>
          <h1 style={{ marginBottom: 8 }}>Add Funds</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Instant wallet recharge — UPI • Cards • Netbanking • Wallets • Scan &amp; Pay
          </p>
        </div>
        <div className="stat-card add-funds-balance-card">
          <div className="stat-label">Wallet Balance</div>
          <div className="stat-value add-funds-balance-value">
            {sym}{balance.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="card add-funds-hero-card add-funds-pay-card">
        {paying && payPhase !== 'idle' && (
          <div className="add-funds-processing-overlay" aria-live="polite">
            <span className="auth-spinner" aria-hidden="true" />
            <span style={{ fontWeight: 600 }}>
              {payPhase === 'creating' ? 'Creating secure payment...' : 'Verifying payment...'}
            </span>
          </div>
        )}

        <div className="add-funds-pay-header">
          <h3 className="card-title" style={{ margin: 0 }}>Instant payment</h3>
          <span className="add-funds-live-badge">Razorpay Live</span>
        </div>

        <div className="add-funds-secure-banner">
          <span className="add-funds-secure-icon" aria-hidden="true">🔒</span>
          <div>
            <p className="add-funds-secure-title">Secure payment via Razorpay</p>
            <p className="add-funds-secure-sub">UPI • Cards • Netbanking • Wallets</p>
          </div>
        </div>
        {!razorpayReady && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            Razorpay is not configured on the server. Add valid{' '}
            <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> on Render, then redeploy.
            {razorpayConfig.configError && (
              <span style={{ display: 'block', marginTop: 8, fontSize: 13 }}>
                {razorpayConfig.configError}
              </span>
            )}
          </div>
        )}

        <div className="add-funds-methods-grid" aria-label="Accepted payment methods">
          {paymentMethods.map((m) => (
            <button
              type="button"
              key={m.id}
              className={`add-funds-method-chip${selectedMethod === m.id ? ' add-funds-method-chip--active' : ''}`}
              onClick={() => setSelectedMethod(m.id)}
              disabled={paying}
              aria-pressed={selectedMethod === m.id}
            >
              <PaymentMethodLogo id={m.logo} size={32} className="add-funds-method-chip-logo" alt={m.label} />
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        <div className="add-funds-quick-row">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              type="button"
              className={`btn btn-ghost add-funds-quick-btn${String(amount) === String(q) ? ' add-funds-quick-btn--active' : ''}`}
              onClick={() => { setAmount(String(q)); setCouponInfo(null); }}
            >
              {sym}{q}
            </button>
          ))}
        </div>

        <div className="form-group">
          <label className="label">Amount ({sym})</label>
          <input
            className="input"
            type="number"
            min="10"
            step="1"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setCouponInfo(null); }}
            placeholder="100"
            disabled={paying}
          />
        </div>

        <div className="form-group">
          <label className="label">Coupon code (optional)</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              className="input"
              placeholder="SAVE10"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              style={{ flex: 1, minWidth: 140 }}
              disabled={paying}
            />
            <button type="button" className="btn btn-ghost" onClick={applyCoupon} disabled={loading || paying}>
              {loading ? 'Checking...' : 'Apply'}
            </button>
          </div>
          {couponInfo && (
            <p style={{ marginTop: 8, color: 'var(--success)', fontSize: 14 }}>
              Discount {sym}{couponInfo.discount} — you pay {sym}{couponInfo.final_amount}
            </p>
          )}
        </div>

        <div className="add-funds-payment-summary" aria-live="polite">
          <div className="add-funds-payment-summary-row">
            <span className="add-funds-payment-summary-label">Selected Method</span>
            <strong className="add-funds-payment-summary-value add-funds-payment-summary-method">
              <PaymentMethodLogo id={selectedMethodMeta.logo} size={22} alt="" />
              {selectedMethodMeta.payLabel}
            </strong>
          </div>
          <div className="add-funds-payment-summary-row">
            <span className="add-funds-payment-summary-label">Amount</span>
            <strong className="add-funds-payment-summary-value">{sym}{payableAmount.toFixed(2)}</strong>
          </div>
          <div className="add-funds-payment-summary-row">
            <span className="add-funds-payment-summary-label">Gateway</span>
            <strong className="add-funds-payment-summary-value add-funds-payment-summary-gateway">Razorpay Live</strong>
          </div>
        </div>

        <button
          type="button"
          className="add-funds-pay-btn-glow add-funds-pay-btn"
          disabled={paying || !razorpayReady}
          onClick={openRazorpayCheckout}
        >
          {paying ? (
            <span className="auth-loading-row add-funds-pay-btn-inner">
              <span className="auth-spinner" aria-hidden="true" />
              {payButtonLabel()}
            </span>
          ) : (
            <span className="add-funds-pay-btn-inner">
              <PaymentMethodLogo id={selectedMethodMeta.logo} size={26} className="add-funds-pay-btn-logo" alt="" />
              {payButtonLabel()}
            </span>
          )}
        </button>

        <div className="add-funds-card-brands" aria-label="Accepted cards">
          {CARD_BRANDS.map((b) => (
            <span key={b.id} className="add-funds-card-brand">
              <PaymentMethodLogo id={b.logo} size={36} className="add-funds-card-brand-logo" alt={b.label} />
            </span>
          ))}
        </div>

        <p className="add-funds-footer-secure">
          <strong>100% Secure Payments</strong> powered by Razorpay
        </p>
      </div>

      <section className="add-funds-history-section" aria-labelledby="payment-history-heading">
        <h2 id="payment-history-heading" className="add-funds-history-title">Payment history</h2>

        {history.length === 0 ? (
          <div className="add-funds-history-empty card">
            <p>No payment history found</p>
            <span>Your Razorpay and manual payments will appear here.</span>
          </div>
        ) : (
          <>
            <div className="table-wrap add-funds-history-table-wrap">
              <table className="add-funds-history-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Amount</th>
                    <th>Gateway</th>
                    <th>Payment ID</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((p) => (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td>{sym}{parseFloat(p.amount).toFixed(2)}</td>
                      <td>{p.gateway}</td>
                      <td className="add-funds-payment-id-cell">
                        {p.razorpay_payment_id || '—'}
                      </td>
                      <td>
                        <span className={`badge ${statusBadge(p.status)}`}>
                          {statusLabel(p.status)}
                        </span>
                      </td>
                      <td>{formatPaymentDate(p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="add-funds-history-mobile-list">
              {history.map((p) => (
                <article className="card add-funds-history-card" key={`ph-mobile-${p.id}`}>
                  <div className="add-funds-history-card-top">
                    <strong>Payment #{p.id}</strong>
                    <span className={`badge ${statusBadge(p.status)}`}>
                      {statusLabel(p.status)}
                    </span>
                  </div>
                  <div className="add-funds-history-card-row">
                    <span>Amount</span>
                    <span className="add-funds-history-card-amount">
                      {sym}{parseFloat(p.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="add-funds-history-card-row">
                    <span>Gateway</span>
                    <span>{p.gateway || '—'}</span>
                  </div>
                  <div className="add-funds-history-card-row add-funds-history-card-row--stack">
                    <span>Payment ID</span>
                    <span className="add-funds-history-payment-id">
                      {p.razorpay_payment_id || '—'}
                    </span>
                  </div>
                  <div className="add-funds-history-card-row">
                    <span>Date</span>
                    <span>{formatPaymentDate(p.created_at)}</span>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {transactions.length > 0 && (
        <section className="add-funds-history-section add-funds-wallet-section" aria-labelledby="wallet-tx-heading">
          <h2 id="wallet-tx-heading" className="add-funds-history-title">Wallet transactions</h2>

          <div className="table-wrap add-funds-history-table-wrap">
            <table className="add-funds-history-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <span className={`badge ${t.type === 'credit' ? 'badge-success' : 'badge-danger'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td>{sym}{parseFloat(t.amount).toFixed(2)}</td>
                    <td>{t.description}</td>
                    <td>{formatPaymentDate(t.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="add-funds-history-mobile-list">
            {transactions.map((t) => (
              <article className="card add-funds-history-card" key={`wt-mobile-${t.id}`}>
                <div className="add-funds-history-card-top">
                  <strong>{t.type === 'credit' ? 'Credit' : 'Debit'}</strong>
                  <span className={`badge ${t.type === 'credit' ? 'badge-success' : 'badge-danger'}`}>
                    {t.type}
                  </span>
                </div>
                <div className="add-funds-history-card-row">
                  <span>Amount</span>
                  <span className="add-funds-history-card-amount">
                    {sym}{parseFloat(t.amount).toFixed(2)}
                  </span>
                </div>
                <div className="add-funds-history-card-row add-funds-history-card-row--stack">
                  <span>Description</span>
                  <span>{t.description || '—'}</span>
                </div>
                <div className="add-funds-history-card-row">
                  <span>Date</span>
                  <span>{formatPaymentDate(t.created_at)}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {toast && (
        <div
          className={`add-funds-toast add-funds-toast--${toast.type}`}
          role="status"
          onClick={() => setToast(null)}
        >
          {toast.message}
        </div>
      )}

      <SuccessModal
        open={successModal.open}
        onClose={() => setSuccessModal({ ...successModal, open: false })}
        title={successModal.title}
        message={successModal.message}
        type={successModal.type}
      />
      </div>
    </UserLayout>
  );
};

export default AddFunds;
