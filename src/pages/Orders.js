import React, { useState, useEffect } from 'react';
import UserLayout from '../components/UserLayout';
import { getMyOrders, refreshOrderStatus, refillOrder, cancelOrder } from '../api';
import { useSettings } from '../contexts/SettingsContext';
import { exportOrdersPdf } from '../utils/exportOrdersPdf';

const statusClass = {
  pending: 'badge-warning',
  processing: 'badge-info',
  active: 'badge-info',
  completed: 'badge-success',
  partial: 'badge-warning',
  cancelled: 'badge-danger',
  failed: 'badge-danger',
};

const Orders = () => {
  const { settings } = useSettings();
  const sym = settings.currency_symbol || '₹';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = () => {
    setLoading(true);
    getMyOrders().then((r) => setOrders(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refresh = async (id) => {
    setActionId(id);
    try {
      const res = await refreshOrderStatus(id);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...res.data } : o)));
    } catch (_) {}
    setActionId(null);
  };

  const refill = async (id) => {
    setActionId(id);
    try {
      const res = await refillOrder(id);
      setMsg(res.data.message || 'Refill requested');
      load();
    } catch (e) {
      setMsg(e.response?.data?.message || 'Refill failed');
    }
    setActionId(null);
  };

  const cancel = async (id) => {
    if (!window.confirm('Cancel this order on provider?')) return;
    setActionId(id);
    try {
      const res = await cancelOrder(id);
      setMsg(res.data.message || 'Cancelled');
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'cancelled' } : o)));
    } catch (e) {
      setMsg(e.response?.data?.message || 'Cancel failed');
    }
    setActionId(null);
  };

  const canRefill = (o) => ['completed', 'partial'].includes(o.status);
  const canCancel = (o) => ['pending', 'processing', 'active'].includes(o.status);

  return (
    <UserLayout title="Orders">
      <div className="orders-page">
      <div className="page-header orders-page-header">
        <div>
          <h1 style={{ marginBottom: 8 }}>My Orders</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Status syncs automatically every 2 minutes</p>
        </div>
        {orders.length > 0 && (
          <button type="button" className="btn btn-ghost" onClick={() => exportOrdersPdf(orders, settings.site_name)}>
            📄 Export PDF
          </button>
        )}
      </div>
      {msg && <div className="alert alert-success" style={{ marginBottom: 16 }}>{msg}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 48 }}>Loading...</p>
      ) : orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
          No orders yet. Browse Services to place your first order.
        </div>
      ) : (
        <>
        <div className="table-wrap orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th><th>Service</th><th>Link</th><th>Qty</th><th>Price</th>
                <th>Status</th><th>Remains</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td style={{ maxWidth: 160 }}>{o.service_name}</td>
                  <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <a href={o.link} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontSize: 12 }}>
                      {o.link}
                    </a>
                  </td>
                  <td>{o.quantity?.toLocaleString()}</td>
                  <td>{sym}{parseFloat(o.price).toFixed(2)}</td>
                  <td><span className={`badge ${statusClass[o.status] || 'badge-info'}`}>{o.status}</span></td>
                  <td>{o.remains ?? '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-ghost btn-sm" disabled={actionId === o.id}
                        onClick={() => refresh(o.id)} title="Refresh status">↻</button>
                      {canRefill(o) && (
                        <button type="button" className="btn btn-ghost btn-sm" disabled={actionId === o.id}
                          onClick={() => refill(o.id)}>Refill</button>
                      )}
                      {canCancel(o) && (
                        <button type="button" className="btn btn-danger btn-sm" disabled={actionId === o.id}
                          onClick={() => cancel(o.id)}>Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="orders-mobile-list">
          {orders.map((o) => (
            <div className="card orders-mobile-card" key={`mobile-${o.id}`}>
              <div className="orders-mobile-top">
                <strong>#{o.id}</strong>
                <span className={`badge ${statusClass[o.status] || 'badge-info'}`}>{o.status}</span>
              </div>
              <div className="orders-mobile-row"><span>Service</span><span>{o.service_name}</span></div>
              <div className="orders-mobile-row">
                <span>Link</span>
                <a href={o.link} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>
                  Open
                </a>
              </div>
              <div className="orders-mobile-row"><span>Qty</span><span>{o.quantity?.toLocaleString()}</span></div>
              <div className="orders-mobile-row"><span>Price</span><span>{sym}{parseFloat(o.price).toFixed(2)}</span></div>
              <div className="orders-mobile-row"><span>Remains</span><span>{o.remains ?? '—'}</span></div>
              <div className="orders-mobile-row"><span>Date</span><span>{new Date(o.created_at).toLocaleDateString()}</span></div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                <button type="button" className="btn btn-ghost btn-sm" disabled={actionId === o.id} onClick={() => refresh(o.id)}>↻</button>
                {canRefill(o) && (
                  <button type="button" className="btn btn-ghost btn-sm" disabled={actionId === o.id} onClick={() => refill(o.id)}>Refill</button>
                )}
                {canCancel(o) && (
                  <button type="button" className="btn btn-danger btn-sm" disabled={actionId === o.id} onClick={() => cancel(o.id)}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
        </>
      )}
      </div>
    </UserLayout>
  );
};

export default Orders;
