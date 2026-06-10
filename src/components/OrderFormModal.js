import React, { useState, useEffect, useMemo } from 'react';
import { placeOrder, getMe } from '../api';
import { useSettings } from '../contexts/SettingsContext';
import InsufficientBalanceAlert from './InsufficientBalanceAlert';
import '../styles/balanceWarning.css';
import { getLinkPlaceholder } from '../utils/linkPlaceholder';

const OrderFormModal = ({ service, open, onClose, onSuccess }) => {
  const { settings } = useSettings();
  const sym = settings.currency_symbol || '₹';
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(parseFloat(JSON.parse(localStorage.getItem('user') || '{}').balance || 0));
  const [balanceWarningDismissed, setBalanceWarningDismissed] = useState(false);

  useEffect(() => {
    if (open && service) {
      setLink('');
      setQuantity(String(service.min_quantity || ''));
      setError('');
      setBalanceWarningDismissed(false);
      getMe().then((r) => setBalance(parseFloat(r.data.balance || 0))).catch(() => {});
    }
  }, [open, service]);

  const orderCost = useMemo(() => {
    if (!open || !service || !quantity || Number.isNaN(Number(quantity))) return null;
    const qty = parseInt(quantity, 10);
    if (qty < 1) return null;
    return (parseFloat(service.price) / 1000) * qty;
  }, [open, service, quantity]);

  const total = orderCost != null ? orderCost.toFixed(2) : null;

  const insufficientBalance = useMemo(() => {
    if (orderCost == null) return null;
    if (balance >= orderCost) return null;
    return { need: orderCost.toFixed(2), have: balance.toFixed(2) };
  }, [orderCost, balance]);

  useEffect(() => {
    setBalanceWarningDismissed(false);
  }, [quantity, insufficientBalance?.need, insufficientBalance?.have]);

  const showBalanceWarning = Boolean(insufficientBalance) && !balanceWarningDismissed;

  const linkPlaceholder = getLinkPlaceholder(service?.platform, service?.name);

  if (!open || !service) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (insufficientBalance) {
      setError(`Insufficient balance. Need ${sym}${insufficientBalance.need}, have ${sym}${insufficientBalance.have}`);
      return;
    }
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
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="card fade-in modal-panel" onClick={(e) => e.stopPropagation()} role="dialog">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, margin: 0 }}>Place Order</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{service.name}</p>
        {error && !showBalanceWarning && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          {showBalanceWarning && insufficientBalance && (
            <InsufficientBalanceAlert
              need={insufficientBalance.need}
              have={insufficientBalance.have}
              currencySymbol={sym}
              onDismiss={() => setBalanceWarningDismissed(true)}
            />
          )}
          <div className="form-group">
            <label className="label">Link / Username</label>
            <input className="input" required value={link} onChange={(e) => setLink(e.target.value)}
              placeholder={linkPlaceholder} />
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
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading || Boolean(insufficientBalance)}>
            {loading ? 'Placing order...' : 'Confirm & Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderFormModal;
