import React, { useState, useEffect } from 'react';
import UserLayout from '../components/UserLayout';
import PaymentModal from '../components/PaymentModal';
import SuccessModal from '../components/SuccessModal';
import {
  submitUtrPayment,
  getPaymentInfo,
  getPaymentHistory,
  getTransactions,
  createRazorpayOrder,
  verifyRazorpay,
  validateCoupon,
  API_BASE,
} from '../api';
import { useSettings } from '../contexts/SettingsContext';

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
  const [balance, setBalance] = useState(0);
  const [paymentInfo, setPaymentInfo] = useState({});
  const { settings } = useSettings();
  const sym = settings.currency_symbol || '₹';
  const [history, setHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [razorpayAmount, setRazorpayAmount] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('qr');
  const [successModal, setSuccessModal] = useState({ open: false, title: '', message: '', type: 'success' });
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponInfo, setCouponInfo] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = () => {
    getPaymentHistory().then((r) => setHistory(r.data)).catch(() => {});
    getTransactions().then((r) => setTransactions(r.data)).catch(() => {});
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    setBalance(parseFloat(u.balance || 0));
  };

  useEffect(() => {
    getPaymentInfo().then((r) => setPaymentInfo(r.data)).catch(() => {});
    load();
  }, []);

  const openPaymentModal = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleUtrSubmit = async ({ amount, utr, screenshot, gateway }) => {
    setLoading(true);
    const fd = new FormData();
    fd.append('amount', amount);
    fd.append('utr_number', utr);
    fd.append('payment_method', 'UPI');
    fd.append('gateway', gateway);
    if (screenshot) fd.append('screenshot', screenshot);
    try {
      await submitUtrPayment(fd);
      setModalOpen(false);
      setSuccessModal({
        open: true,
        type: 'pending',
        title: 'Payment Submitted',
        message: 'Your UTR and screenshot are under review. Wallet will update after admin approval.',
      });
      load();
    } catch (e) {
      setSuccessModal({
        open: true,
        type: 'failed',
        title: 'Submission Failed',
        message: e.response?.data?.message || 'Could not submit payment',
      });
    }
    setLoading(false);
  };

  const payRazorpay = async () => {
    const amt = couponInfo?.final_amount ? parseFloat(couponInfo.final_amount) : parseFloat(razorpayAmount);
    if (!amt || amt < 10) {
      setSuccessModal({ open: true, title: 'Invalid amount', message: 'Minimum ₹10', type: 'failed' });
      return;
    }
    setLoading(true);
    try {
      const { data } = await createRazorpayOrder(amt);
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: settings.site_name || 'SMM Panel',
        description: 'Add funds to wallet',
        handler: async (response) => {
          try {
            const v = await verifyRazorpay({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            const me = { ...user, balance: v.data.balance };
            localStorage.setItem('user', JSON.stringify(me));
            setBalance(v.data.balance);
            setRazorpayAmount('');
            setSuccessModal({
              open: true,
              type: 'success',
              title: 'Payment Successful',
              message: `₹${v.data.balance_added} added! New balance: ₹${parseFloat(v.data.balance).toFixed(2)}`,
            });
            load();
          } catch (err) {
            setSuccessModal({
              open: true,
              type: 'failed',
              title: 'Verification Failed',
              message: err.response?.data?.message || 'Contact support',
            });
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        setSuccessModal({ open: true, title: 'Payment Failed', message: 'Razorpay payment was not completed', type: 'failed' });
      });
      rzp.open();
    } catch (e) {
      setSuccessModal({
        open: true,
        type: 'failed',
        title: 'Razorpay Error',
        message: e.response?.data?.message || 'Razorpay not configured',
      });
    }
    setLoading(false);
  };

  const qrUrl = paymentInfo.qr_image ? `${API_BASE}${paymentInfo.qr_image}` : null;

  return (
    <UserLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>Add Funds</h1>
          <p style={{ color: 'var(--text-muted)' }}>Razorpay instant pay or QR + UTR verification</p>
        </div>
        <div className="stat-card" style={{ minWidth: 180 }}>
          <div className="stat-label">Wallet Balance</div>
          <div className="stat-value">{sym}{balance.toFixed(2)}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24, padding: 20 }}>
        <h3 className="card-title">🏷️ Coupon code</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input className="input" placeholder="SAVE10" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} style={{ maxWidth: 200 }} />
          <button
            type="button"
            className="btn btn-ghost"
            onClick={async () => {
              const amt = parseFloat(razorpayAmount) || 100;
              try {
                const { data } = await validateCoupon(couponCode, amt);
                setCouponInfo(data);
              } catch (e) {
                setCouponInfo(null);
                alert(e.response?.data?.message || 'Invalid coupon');
              }
            }}
          >
            Apply
          </button>
        </div>
        {couponInfo && (
          <p style={{ marginTop: 12, color: 'var(--success)', fontSize: 14 }}>
            Discount ₹{couponInfo.discount} — pay ₹{couponInfo.final_amount} (use this amount for Razorpay)
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
        {/* Razorpay */}
        <div className="card">
          <h3 className="card-title">💳 Razorpay (Instant)</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>Auto-credit wallet after successful payment</p>
          <div className="form-group">
            <label className="label">Amount (₹)</label>
            <input className="input" type="number" min="10" value={razorpayAmount}
              onChange={(e) => setRazorpayAmount(e.target.value)} placeholder="100" />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading} onClick={payRazorpay}>
            Pay with Razorpay
          </button>
        </div>

        {/* QR */}
        <div className="card">
          <h3 className="card-title">📱 QR Payment</h3>
          {qrUrl ? (
            <img src={qrUrl} alt="QR" style={{ width: '100%', maxWidth: 200, borderRadius: 12, marginBottom: 12 }} />
          ) : (
            <div style={{ padding: 32, background: 'var(--bg)', borderRadius: 12, textAlign: 'center', marginBottom: 12, color: 'var(--text-muted)' }}>
              QR not configured
            </div>
          )}
          <p style={{ marginBottom: 12 }}><strong>UPI:</strong> {paymentInfo.upi_id || settings.upi_id || '—'}</p>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => openPaymentModal('qr')}>
            Submit UTR & Screenshot
          </button>
        </div>

        {/* Manual UTR */}
        <div className="card">
          <h3 className="card-title">🏦 Bank / UPI Transfer</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
            Paid manually? Submit your UTR for admin verification.
          </p>
          <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => openPaymentModal('manual')}>
            Open Payment Form
          </button>
        </div>
      </div>

      {/* Payment history */}
      <h2 style={{ marginBottom: 16 }}>Payment History</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Amount</th><th>Method</th><th>UTR</th><th>Gateway</th><th>Status</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No payments yet</td></tr>
            ) : history.map((p) => (
              <tr key={p.id}>
                <td>#{p.id}</td>
                <td>₹{parseFloat(p.amount).toFixed(2)}</td>
                <td>{p.payment_method || '—'}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.utr_number || p.razorpay_payment_id || '—'}</td>
                <td>{p.gateway}</td>
                <td><span className={`badge ${statusBadge(p.status)}`}>{p.status}</span></td>
                <td>{new Date(p.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transactions.length > 0 && (
        <>
          <h2 style={{ margin: '32px 0 16px' }}>Wallet Transactions</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Type</th><th>Amount</th><th>Description</th><th>Date</th></tr></thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td><span className={`badge ${t.type === 'credit' ? 'badge-success' : 'badge-danger'}`}>{t.type}</span></td>
                    <td>₹{t.amount}</td>
                    <td>{t.description}</td>
                    <td>{new Date(t.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <PaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleUtrSubmit}
        loading={loading}
        paymentType={modalType}
      />

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
