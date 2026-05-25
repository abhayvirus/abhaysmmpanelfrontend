import React, { useState, useEffect, useCallback } from 'react';
import UserLayout from '../components/UserLayout';
import SuccessModal from '../components/SuccessModal';
import {
  getPaymentHistory,
  getTransactions,
  getWalletBalance,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentConfig,
  validateCoupon,
} from '../api';
import { useSettings } from '../contexts/SettingsContext';
import { resolveRazorpayKeyId } from '../config/razorpay';

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

const AddFunds = () => {
  const { settings } = useSettings();
  const sym = settings.currency_symbol || '₹';
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('100');
  const [couponCode, setCouponCode] = useState('');
  const [couponInfo, setCouponInfo] = useState(null);
  const [razorpayConfig, setRazorpayConfig] = useState({ razorpayEnabled: false, keyId: '' });
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
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
    getPaymentConfig()
      .then((r) => setRazorpayConfig(r.data))
      .catch(() => setRazorpayConfig({ razorpayEnabled: false }));
    load();
  }, [load]);

  const payableAmount = couponInfo?.final_amount
    ? parseFloat(couponInfo.final_amount)
    : parseFloat(amount) || 0;

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

    if (!window.Razorpay) {
      setSuccessModal({
        open: true,
        type: 'failed',
        title: 'Razorpay unavailable',
        message: 'Payment script failed to load. Refresh the page and try again.',
      });
      return;
    }

    setPaying(true);
    try {
      const { data } = await createRazorpayOrder(amt, couponInfo?.code || couponCode || undefined);
      const key = resolveRazorpayKeyId(data.keyId, razorpayConfig.keyId || settings.razorpay_key_id);
      if (!key) {
        throw new Error('Razorpay key not configured on server');
      }

      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const options = {
        key,
        amount: data.amount,
        currency: data.currency || 'INR',
        order_id: data.orderId,
        name: settings.site_name || 'ABHAYSMM PANEL',
        description: 'Wallet recharge',
        image: settings.site_logo ? `${window.location.origin}${settings.site_logo}` : undefined,
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.phone || '',
        },
        theme: { color: settings.theme_primary || '#2563eb' },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        config: {
          display: {
            preferences: { show_default_blocks: true },
          },
        },
        retry: { enabled: true, max_count: 3 },
        handler: async (response) => {
          try {
            const v = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            const newBal = parseFloat(v.data.balance);
            setBalance(newBal);
            localStorage.setItem('user', JSON.stringify({ ...user, balance: newBal }));
            setAmount('100');
            setCouponInfo(null);
            setCouponCode('');
            setSuccessModal({
              open: true,
              type: 'success',
              title: 'Payment successful',
              message: `₹${v.data.balance_added} added! New balance: ${sym}${newBal.toFixed(2)}`,
            });
            load();
          } catch (err) {
            setSuccessModal({
              open: true,
              type: 'failed',
              title: 'Verification failed',
              message: err.response?.data?.message || 'Payment received but verification failed. Contact support with your payment ID.',
            });
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
          escape: true,
          confirm_close: true,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setPaying(false);
        setSuccessModal({
          open: true,
          type: 'failed',
          title: 'Payment failed',
          message: resp.error?.description || 'Payment was not completed',
        });
      });
      rzp.open();
    } catch (e) {
      setPaying(false);
      setSuccessModal({
        open: true,
        type: 'failed',
        title: 'Cannot start payment',
        message: e.response?.data?.message || e.message || 'Razorpay not configured',
      });
    }
  };

  return (
    <UserLayout>
      <div className="page-header">
        <div>
          <h1 style={{ marginBottom: 8 }}>Add Funds</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Instant wallet recharge via Razorpay — UPI, cards, netbanking &amp; Scan &amp; Pay QR
          </p>
        </div>
        <div className="stat-card add-funds-balance-card">
          <div className="stat-label">Wallet Balance</div>
          <div className="stat-value add-funds-balance-value">
            {sym}{balance.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="card add-funds-pay-card" style={{ marginBottom: 24, padding: 24 }}>
        <div className="add-funds-pay-header">
          <h3 className="card-title" style={{ margin: 0 }}>Instant payment</h3>
          <span className="badge badge-success">Razorpay Live</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '12px 0 20px' }}>
          Pay with Google Pay, PhonePe, Paytm, UPI QR, cards, or netbanking. Wallet credits automatically after payment.
        </p>

        {!razorpayConfig.razorpayEnabled && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            Razorpay is not configured on the server. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on Render.
          </div>
        )}

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
          className="btn btn-primary add-funds-pay-btn"
          disabled={paying || !razorpayConfig.razorpayEnabled}
          onClick={openRazorpayCheckout}
        >
          {paying ? (
            <span className="auth-loading-row">
              <span className="auth-spinner" aria-hidden="true" />
              Opening Razorpay...
            </span>
          ) : (
            <>Pay {sym}{payableAmount.toFixed(2)} with Razorpay</>
          )}
        </button>

        <p className="add-funds-methods">
          UPI · GPay · PhonePe · Paytm · QR · Cards · Netbanking
        </p>
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

      <SuccessModal
        open={successModal.open}
        onClose={() => setSuccessModal({ ...successModal, open: false })}
        title={successModal.title}
        message={successModal.message}
        type={successModal.type}
      />
    </UserLayout>
  );
};

export default AddFunds;
