import React, { useState, useEffect, useCallback } from 'react';
import UserLayout from '../components/UserLayout';
import SuccessModal from '../components/SuccessModal';
import {
  getPaymentHistory,
  getTransactions,
  getWalletBalance,
  createRazorpayOrder,
  verifyRazorpayPayment,
  submitUpiUtr,
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
import QRCode from 'qrcode';

const QUICK_AMOUNTS = [100, 250, 500, 1000, 2000];

const PAYMENT_METHODS = [
  { icon: '⚡', label: 'UPI' },
  { icon: 'G', label: 'Google Pay' },
  { icon: 'Pe', label: 'PhonePe' },
  { icon: 'Pt', label: 'Paytm' },
  { icon: 'B', label: 'BHIM' },
  { icon: '▣', label: 'Scan QR' },
  { icon: '💳', label: 'Cards' },
  { icon: '🏦', label: 'Netbanking' },
  { icon: '👛', label: 'Wallets' },
];

const CARD_BRANDS = [
  { id: 'visa', label: 'VISA' },
  { id: 'mc', label: 'Mastercard' },
  { id: 'rupay', label: 'RuPay' },
  { id: 'amex', label: 'Amex' },
];

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

const AddFunds = () => {
  const { settings } = useSettings();
  const sym = settings.currency_symbol || '₹';
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('100');
  const [utr, setUtr] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponInfo, setCouponInfo] = useState(null);
  const [razorpayConfig, setRazorpayConfig] = useState({
    razorpayConfigured: false,
    razorpayEnabled: false,
    keyId: '',
    configError: '',
  });
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payPhase, setPayPhase] = useState('idle'); // idle | creating | verifying
  const [submittingUtr, setSubmittingUtr] = useState(false);
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
    getPaymentHistory().then((r) => setHistory(r.data)).catch(() => {});
    getTransactions().then((r) => setTransactions(r.data)).catch(() => {});
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

  const upiId = (settings.upi_id || '').trim();
  const upiPayAmount = parseFloat(amount) || 0;
  const upiUri = useCallback(() => {
    if (!upiId || !upiPayAmount) return '';
    const params = new URLSearchParams({
      pa: upiId,
      pn: settings.site_name || 'ABHAYSMM PANEL',
      am: String(upiPayAmount.toFixed(2)),
      cu: settings.currency_code || 'INR',
      tn: `Wallet recharge ${upiPayAmount.toFixed(2)}`,
    });
    return `upi://pay?${params.toString()}`;
  }, [upiId, upiPayAmount, settings.site_name, settings.currency_code]);

  useEffect(() => {
    let cancelled = false;
    const uri = upiUri();
    if (!uri) {
      setQrDataUrl('');
      return () => {};
    }
    QRCode.toDataURL(uri, { margin: 1, width: 240, errorCorrectionLevel: 'M' })
      .then((url) => { if (!cancelled) setQrDataUrl(url); })
      .catch(() => { if (!cancelled) setQrDataUrl(''); });
    return () => { cancelled = true; };
  }, [upiUri]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 5500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (type, message) => setToast({ type, message });

  const payButtonLabel = () => {
    if (payPhase === 'creating') return 'Creating secure payment...';
    if (payPhase === 'verifying') return 'Verifying payment...';
    return `Pay ${sym}${payableAmount.toFixed(2)} with Razorpay`;
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

  const submitUtr = async () => {
    const amt = parseFloat(amount) || 0;
    if (!upiId) {
      setSuccessModal({ open: true, type: 'failed', title: 'UPI not configured', message: 'Admin must set UPI ID in Settings.' });
      return;
    }
    if (!amt || amt < 1) {
      setSuccessModal({ open: true, type: 'failed', title: 'Invalid amount', message: 'Minimum amount ₹1' });
      return;
    }
    const code = utr.trim();
    if (code.length < 6) {
      setSuccessModal({ open: true, type: 'failed', title: 'UTR required', message: 'Enter your UTR / Transaction ID' });
      return;
    }
    setSubmittingUtr(true);
    try {
      await submitUpiUtr({ amount: amt, utr_number: code });
      setUtr('');
      setSuccessModal({
        open: true,
        type: 'pending',
        title: 'Submitted',
        message: 'Payment submitted. Admin will verify and credit your wallet.',
      });
      load();
    } catch (e) {
      setSuccessModal({
        open: true,
        type: 'failed',
        title: 'Submission failed',
        message: e.response?.data?.message || 'Could not submit UTR',
      });
    }
    setSubmittingUtr(false);
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
          {PAYMENT_METHODS.map((m) => (
            <div key={m.label} className="add-funds-method-chip">
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </div>
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

        <div className="add-funds-summary">
          <span>Total to pay</span>
          <strong>{sym}{payableAmount.toFixed(2)}</strong>
        </div>

        <button
          type="button"
          className="add-funds-pay-btn-glow"
          disabled={paying || !razorpayReady}
          onClick={openRazorpayCheckout}
        >
          {paying ? (
            <span className="auth-loading-row" style={{ justifyContent: 'center' }}>
              <span className="auth-spinner" aria-hidden="true" />
              {payButtonLabel()}
            </span>
          ) : (
            payButtonLabel()
          )}
        </button>

        <div className="add-funds-card-brands" aria-label="Accepted cards">
          {CARD_BRANDS.map((b) => (
            <span key={b.id} className={`add-funds-card-brand add-funds-card-brand--${b.id}`}>
              {b.label}
            </span>
          ))}
        </div>

        <p className="add-funds-footer-secure">
          <strong>100% Secure Payments</strong> powered by Razorpay
        </p>
      </div>

      {/* UPI QR (manual verification) */}
      <div className="card add-funds-manual-card" style={{ padding: 24 }}>
        <div className="add-funds-pay-header">
          <h3 className="card-title" style={{ margin: 0 }}>Pay with UPI QR</h3>
          <span className="badge badge-warning">Manual verification</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '12px 0 16px' }}>
          Scan the QR to pay using any UPI app, then enter the UTR/Transaction ID below.
        </p>

        {!upiId ? (
          <div className="alert alert-error">UPI ID is not configured. Admin → Settings → Payments → set UPI ID.</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, alignItems: 'start' }}>
              <div style={{ textAlign: 'center', padding: 12, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12 }}>
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="UPI QR" style={{ width: 240, maxWidth: '100%' }} />
                ) : (
                  <div style={{ color: 'var(--text-muted)', padding: 24 }}>Generating QR…</div>
                )}
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                  Amount: <strong style={{ color: 'var(--text)' }}>{sym}{(parseFloat(amount) || 0).toFixed(2)}</strong>
                </div>
              </div>
              <div>
                <div className="form-group">
                  <label className="label">UPI ID</label>
                  <input className="input" value={upiId} readOnly />
                </div>
                <div className="form-group">
                  <label className="label">Amount</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setCouponInfo(null); }}
                    placeholder="100"
                    disabled={submittingUtr || paying}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                  <a className="btn btn-ghost" href={upiUri()} style={{ flex: 1, minWidth: 180, textAlign: 'center' }}>
                    Open UPI app
                  </a>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ flex: 1, minWidth: 180 }}
                    onClick={() => navigator.clipboard?.writeText(upiUri()).catch(() => {})}
                  >
                    Copy UPI link
                  </button>
                </div>
                <div className="form-group">
                  <label className="label">UTR / Transaction ID</label>
                  <input
                    className="input"
                    placeholder="e.g. 324512345678"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    disabled={submittingUtr}
                  />
                </div>
                <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={submitUtr} disabled={submittingUtr}>
                  {submittingUtr ? 'Submitting…' : 'Submit UTR'}
                </button>
                <p style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                  After admin approval, your wallet balance will update automatically.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <h2 style={{ marginBottom: 16 }}>Payment history</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Amount</th><th>Gateway</th><th>Payment ID</th><th>Status</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No payments yet
                </td>
              </tr>
            ) : (
              history.map((p) => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td>{sym}{parseFloat(p.amount).toFixed(2)}</td>
                  <td>{p.gateway}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 11 }}>
                    {p.razorpay_payment_id || '—'}
                  </td>
                  <td><span className={`badge ${statusBadge(p.status)}`}>{p.status}</span></td>
                  <td>{new Date(p.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {transactions.length > 0 && (
        <>
          <h2 style={{ margin: '32px 0 16px' }}>Wallet transactions</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Type</th><th>Amount</th><th>Description</th><th>Date</th></tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <span className={`badge ${t.type === 'credit' ? 'badge-success' : 'badge-danger'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td>{sym}{t.amount}</td>
                    <td>{t.description}</td>
                    <td>{new Date(t.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
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
