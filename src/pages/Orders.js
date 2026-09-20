import React, { useState, useEffect, useCallback, useRef } from 'react';
import UserLayout from '../components/UserLayout';
import { getMyOrders, refreshOrderStatus, refillOrder, cancelOrder } from '../api';
import { useSettings } from '../contexts/SettingsContext';
import { exportOrdersPdf } from '../utils/exportOrdersPdf';
import { formatMoney } from '../utils/formatMoney';

const statusClass = {
  pending: 'badge-warning',
  processing: 'badge-info',
  active: 'badge-info',
  'in progress': 'badge-info',
  in_progress: 'badge-info',
  completed: 'badge-success',
  partial: 'badge-warning',
  cancelled: 'badge-danger',
  failed: 'badge-danger',
};

const POLL_MS = 30000;

/** Cancel only during pending window (before processing_at). */
function canCancelOrder(order) {
  if (!order || order.status !== 'pending') return false;
  if (order.processing_at && new Date(order.processing_at) <= new Date()) return false;
  return true;
}

/** Apply local pending → processing when 60s window ends (before server poll). */
function applyLocalLifecycle(orders) {
  const now = Date.now();
  return orders.map((o) => {
    if (o.status !== 'pending' || !o.processing_at) return o;
    if (new Date(o.processing_at).getTime() <= now) {
      return { ...o, status: 'processing' };
    }
    return o;
  });
}

const Orders = () => {
  const { settings } = useSettings();
  const sym = settings.currency_symbol || '₹';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionId, setActionId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [msgType, setMsgType] = useState('success');
  const timersRef = useRef([]);

  const load = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    return getMyOrders()
      .then((r) => {
        setOrders(applyLocalLifecycle(Array.isArray(r.data) ? r.data : []));
        setLoadError('');
      })
      .catch((e) => {
        if (!silent) {
          setOrders([]);
          setLoadError(e.response?.data?.message || 'Failed to load orders');
        }
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
    const poll = setInterval(() => load(true), POLL_MS);
    return () => clearInterval(poll);
  }, [load]);

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    orders.forEach((o) => {
      if (o.status !== 'pending' || !o.processing_at) return;
      const ms = new Date(o.processing_at).getTime() - Date.now();
      if (ms <= 0) return;
      const t = setTimeout(() => {
        setOrders((prev) => applyLocalLifecycle(prev));
      }, ms + 50);
      timersRef.current.push(t);
    });
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [orders]);

  const refresh = async (id) => {
    setActionId(id);
    try {
      const res = await refreshOrderStatus(id);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...applyLocalLifecycle([res.data])[0] } : o)));
    } catch (_) {}
    setActionId(null);
  };

  const refill = async (id) => {
    setActionId(id);
    try {
      const res = await refillOrder(id);
      setMsgType('success');
      setMsg(res.data.message || 'Refill requested');
      load(true);
    } catch (e) {
      setMsgType('error');
      setMsg(e.response?.data?.message || 'Refill failed');
    }
    setActionId(null);
  };

  const cancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    setActionId(id);
    try {
      const res = await cancelOrder(id);
      setMsgType('success');
      setMsg(res.data.message || 'Cancelled');
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'cancelled' } : o)));
      if (res.data.balance != null) {
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...user, balance: res.data.balance }));
        } catch (_) { /* ignore */ }
      }
    } catch (e) {
      setMsgType('error');
      setMsg(e.response?.data?.message || 'Cancel failed');
    }
    setActionId(null);
  };

  const canRefill = (o) => ['completed', 'partial'].includes(o.status);

  const displayStatus = (o) => {
    if (o.status === 'pending' && o.processing_at && new Date(o.processing_at) <= new Date()) {
      return 'processing';
    }
    return o.status;
  };

  const orderAmount = (o) => formatMoney(o.price ?? o.charge ?? o.amount ?? o.total_price);

  return (
    <UserLayout title="Orders">
      <div className="orders-page">
        <div className="page-header orders-page-header">
          <div>
            <h1 style={{ marginBottom: 8 }}>My Orders</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Status updates every 30 seconds · Cancel available for 60s after placing
            </p>
          </div>
          {orders.length > 0 && (
            <button type="button" className="btn btn-ghost" onClick={() => exportOrdersPdf(orders, settings.site_name)}>
              Export PDF
            </button>
          )}
        </div>
        {msg && (
          <div className={`alert ${msgType === 'error' ? 'alert-danger' : 'alert-success'} orders-page-msg`}>
            {msg}
          </div>
        )}
        {loadError && <div className="alert alert-danger orders-page-msg">{loadError}</div>}

        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 48 }}>Loading...</p>
        ) : loadError ? null : orders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
            No orders yet. Browse Services to place your first order.
          </div>
        ) : (
          <>
            <div className="table-wrap orders-table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Service</th>
                    <th>Link</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Remains</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const st = displayStatus(o);
                    return (
                      <tr key={o.id}>
                        <td>#{o.id}</td>
                        <td style={{ maxWidth: 160 }}>{o.service_name}</td>
                        <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <a href={o.link} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontSize: 12 }}>
                            {o.link}
                          </a>
                        </td>
                        <td>{o.quantity?.toLocaleString()}</td>
                        <td>{sym}{orderAmount(o)}</td>
                        <td>
                          <span className={`badge ${statusClass[st] || 'badge-info'}`}>{st}</span>
                        </td>
                        <td>{o.remains ?? '—'}</td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="orders-actions-cell">
                            <button type="button" className="btn btn-ghost btn-sm" disabled={actionId === o.id}
                              onClick={() => refresh(o.id)} title="Refresh status">↻</button>
                            {canRefill(o) && (
                              <button type="button" className="btn btn-ghost btn-sm" disabled={actionId === o.id}
                                onClick={() => refill(o.id)}>Refill</button>
                            )}
                            {canCancelOrder(o) && (
                              <button type="button" className="btn btn-danger btn-sm" disabled={actionId === o.id}
                                onClick={() => cancel(o.id)}>Cancel</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="orders-mobile-list">
              {orders.map((o) => {
                const st = displayStatus(o);
                return (
                  <div key={`m-${o.id}`} className="orders-mobile-card">
                    <div className="orders-mobile-top">
                      <strong>#{o.id}</strong>
                      <span className={`badge ${statusClass[st] || 'badge-info'}`}>{st}</span>
                    </div>
                    <div className="orders-mobile-row"><span>Service</span><span>{o.service_name}</span></div>
                    <div className="orders-mobile-row">
                      <span>Link</span>
                      <a href={o.link} target="_blank" rel="noreferrer">{o.link}</a>
                    </div>
                    <div className="orders-mobile-row"><span>Qty</span><span>{o.quantity?.toLocaleString()}</span></div>
                    <div className="orders-mobile-row"><span>Price</span><span>{sym}{orderAmount(o)}</span></div>
                    <div className="orders-actions-cell" style={{ marginTop: 10 }}>
                      <button type="button" className="btn btn-ghost btn-sm" disabled={actionId === o.id}
                        onClick={() => refresh(o.id)}>↻</button>
                      {canRefill(o) && (
                        <button type="button" className="btn btn-ghost btn-sm" disabled={actionId === o.id}
                          onClick={() => refill(o.id)}>Refill</button>
                      )}
                      {canCancelOrder(o) && (
                        <button type="button" className="btn btn-danger btn-sm" disabled={actionId === o.id}
                          onClick={() => cancel(o.id)}>Cancel</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </UserLayout>
  );
};

export default Orders;
