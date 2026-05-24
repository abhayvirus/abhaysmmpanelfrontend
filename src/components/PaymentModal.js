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
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="card fade-in modal-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: '1.125rem' }}>
            {paymentType === 'qr' ? 'Submit QR Payment' : 'Submit UTR'}
          </h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => { reset(); onClose(); }} aria-label="Close">✕</button>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="label">Amount (₹)</label>
            <input className="input" type="number" min="1" step="0.01" required value={amount}
              onChange={(e) => setAmount(e.target.value)} placeholder="500" inputMode="decimal" />
          </div>
          <div className="form-group">
            <label className="label">UTR / Transaction ID</label>
            <input className="input" required value={utr} onChange={(e) => setUtr(e.target.value)}
              placeholder="12-digit UTR number" inputMode="numeric" />
          </div>
          <div className="form-group">
            <label className="label">Payment screenshot</label>
            <input type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ width: '100%' }} />
            {preview && (
              <img src={preview} alt="Preview" className="qr-payment-img" style={{ marginTop: 12, maxHeight: 160 }} loading="lazy" />
            )}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            Status will show as <span className="badge badge-warning">pending</span> until admin verifies.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Payment'}
            </button>
            <button type="button" className="btn btn-ghost" style={{ width: '100%' }} onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
