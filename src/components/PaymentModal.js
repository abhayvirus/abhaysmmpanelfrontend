import React, { useState } from 'react';

/**
 * Modal for UTR / QR payment submission
 */
const PaymentModal = ({ open, onClose, onSubmit, loading, paymentType = 'qr' }) => {
  const [amount, setAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState(null);

  if (!open) return null;

  const handleFile = (e) => {
    const file = e.target.files[0];
    setScreenshot(file);
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ amount, utr, screenshot, gateway: paymentType });
  };

  const reset = () => {
    setAmount('');
    setUtr('');
    setScreenshot(null);
    setPreview(null);
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div className="card fade-in" style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>
            {paymentType === 'qr' ? 'Submit QR Payment' : 'Submit UTR'}
          </h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { reset(); onClose(); }}>✕</button>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="label">Amount (₹)</label>
            <input className="input" type="number" min="1" step="0.01" required value={amount}
              onChange={(e) => setAmount(e.target.value)} placeholder="500" />
          </div>
          <div className="form-group">
            <label className="label">UTR / Transaction ID</label>
            <input className="input" required value={utr} onChange={(e) => setUtr(e.target.value)}
              placeholder="12-digit UTR number" />
          </div>
          <div className="form-group">
            <label className="label">Payment screenshot</label>
            <input type="file" accept="image/*" onChange={handleFile} />
            {preview && (
              <img src={preview} alt="Preview" style={{ marginTop: 12, maxHeight: 160, borderRadius: 8, border: '1px solid var(--border)' }} />
            )}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            Status will show as <span className="badge badge-warning">pending</span> until admin verifies your payment.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Payment'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
};
const modal = { width: '100%', maxWidth: 440, maxHeight: '90vh', overflow: 'auto' };

export default PaymentModal;
