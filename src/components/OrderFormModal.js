import React, { useState, useEffect } from 'react';
import { placeOrder, getMe } from '../api';
import { useSettings } from '../contexts/SettingsContext';

const OrderFormModal = ({ service, open, onClose, onSuccess }) => {
  const { settings } = useSettings();
  const sym = settings.currency_symbol || '₹';
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && service) {
      setLink('');
      setQuantity(String(service.min_quantity || ''));
      setError('');
    }
  }, [open, service]);

  if (!open || !service) return null;

  const total = quantity && !isNaN(quantity)
    ? ((parseFloat(service.price) / 1000) * parseInt(quantity, 10)).toFixed(2)
    : null;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await placeOrder({
        service_id: service.id,
        link,
        quantity: parseInt(quantity, 10),
      });
      const me = await getMe();
      localStorage.setItem('user', JSON.stringify(me.data));
      onSuccess?.(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Order failed');
    }
    setLoading(false);
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div className="card fade-in" style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, margin: 0 }}>Place Order</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{service.name}</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="label">Link / Username</label>
            <input className="input" required value={link} onChange={(e) => setLink(e.target.value)}
              placeholder="https://instagram.com/p/..." />
          </div>
          <div className="form-group">
            <label className="label">Quantity ({service.min_quantity} – {service.max_quantity?.toLocaleString()})</label>
            <input className="input" type="number" required min={service.min_quantity} max={service.max_quantity}
              value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          {total && (
            <div style={{
              padding: 14, borderRadius: 10, background: 'var(--bg)', marginBottom: 16,
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total charge</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{sym}{total}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sym}{service.price} per 1000</div>
            </div>
          )}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Placing order...' : 'Confirm & Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
};

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
};
const modal = { width: '100%', maxWidth: 440 };

export default OrderFormModal;
