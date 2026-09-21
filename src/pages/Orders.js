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
  canceled: 'badge-danger',
  failed: 'badge-danger',
};

const POLL_MS = 30000;

function canCancelOrder(order) {
  if (!order || order.status !== 'pending') return false;
  if (order.processing_at && new Date(order.processing_at) <= new Date()) return false;
  return true;
}

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

function formatStatusLabel(st) {
  if (!st) return 'Pending';
  return String(st)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function cleanServiceName(name) {
  if (!name) return 'Service';
  return String(name)
    .replace(/^[\s✦✧✨💎⭐️⭐•·─—\-]+/u, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function formatOrderDateShort(raw) {
  if (!raw) return '—';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function quantityBreakdown(o) {
  const qty = Number(o.quantity);
  const start = o.start_count != null ? Number(o.start_count) : null;
  const remains = o.remains != null ? Number(o.remains) : null;
  const delivered =
    Number.isFinite(qty) && Number.isFinite(remains) ? Math.max(0, qty - remains) : null;
  const end =
    start != null && delivered != null
      ? start + delivered
      : start != null && Number.isFinite(qty)
        ? start + qty
        : null;
  return { qty, start, remains, end };
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
    if (!window.confirm('Cancel this order? Amount will be refunded to your wallet.')) return;
    setActionId(id);
    try {
      const res = await cancelOrder(id);
      setMsgType('success');
      setMsg(res.data.message || 'Cancelled');
      setOrders((prev) => prev.map((o) => (String(o.id) === String(id) || String(o.api_order_id) === String(id)
        ? { ...o, status: 'cancelled' }
        : o)));
      if (res.data.balance != null) {
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...user, balance: res.data.balance }));
          window.dispatchEvent(new Event('auth-user-updated'));
        } catch (_) { /* ignore */ }
      }
      load(true);
    } catch (e) {
      setMsgType('error');
      setMsg(e.response?.data?.message || 'Cancel failed');
    }
    setActionId(null);
  };

  const canRefill = (o) => ['completed', 'partial'].includes(o.status);

  const displayStatus = (o) => {
    const raw = o.status ?? o.order_status ?? o.state;
    if (!raw || String(raw).trim() === '') return 'pending';
    const st = String(raw).trim().toLowerCase();
    if (st === 'pending' && o.processing_at && new Date(o.processing_at) <= new Date()) {
      return 'processing';
    }
    return st;
  };

  const orderAmount = (o) => formatMoney(o.charge ?? o.price ?? o.amount ?? o.total_price);
  const orderId = (o) => o.id ?? o.order_id ?? o.orderId ?? o.api_order_id ?? '—';

  const renderServiceCell = (o) => {
    const name = cleanServiceName(o.service_name);
    const sid = o.service_id;
    return (
      <div className="orders-service" title={o.service_name || name}>
        {sid != null && <span className="orders-service-id">#{sid}</span>}
        <span className="orders-service-name">{name}</span>
      </div>
    );
  };

  const renderQtyCell = (o) => {
    const { qty, start, remains, end } = quantityBreakdown(o);
    const fmt = (n) => (n == null || Number.isNaN(n) ? '—' : Number(n).toLocaleString());
    return (
      <div className="orders-qty-grid">
        <div className="orders-qty-item"><em>Qty</em><strong>{fmt(qty)}</strong></div>
        <div className="orders-qty-item"><em>Remains</em><strong>{fmt(remains)}</strong></div>
        <div className="orders-qty-item"><em>Start</em><strong>{fmt(start)}</strong></div>
        <div className="orders-qty-item"><em>End</em><strong>{fmt(end)}</strong></div>
      </div>
    );
  };

  const renderActions = (o, oid) => (
    <div className="orders-actions-cell">
      <button type="button" className="btn btn-ghost btn-sm" disabled={actionId === oid}
        onClick={() => refresh(oid)} title="Refresh status">↻</button>
      {canRefill(o) && (
        <button type="button" className="btn btn-ghost btn-sm" disabled={actionId === oid}
          onClick={() => refill(oid)}>Refill</button>
      )}
      {canCancelOrder(o) && (
        <button type="button" className="btn btn-danger btn-sm" disabled={actionId === oid}
          onClick={() => cancel(oid)}>Cancel</button>
      )}
    </div>
  );

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
                    <th>Date</th>
                    <th>Link</th>
                    <th>Charge</th>
                    <th>Quantity</th>
                    <th>Service</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const st = displayStatus(o);
                    const oid = orderId(o);
                    return (
                      <tr key={oid}>
                        <td><span className="orders-id">#{oid}</span></td>
                        <td className="orders-date">{formatOrderDateShort(o.created_at ?? o.createdAt ?? o.date)}</td>
                        <td>
                          <a className="orders-link" href={o.link} target="_blank" rel="noreferrer" title={o.link}>
                            {o.link}
                          </a>
                        </td>
                        <td className="orders-charge">{sym}{orderAmount(o)}</td>
                        <td>{renderQtyCell(o)}</td>
                        <td>{renderServiceCell(o)}</td>
                        <td>
                          <div className="orders-status-cell">
                            <span className={`badge ${statusClass[st] || 'badge-info'}`}>
                              {formatStatusLabel(st)}
                            </span>
                            {renderActions(o, oid)}
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
                const oid = orderId(o);
                return (
                  <div key={`m-${oid}`} className="orders-mobile-card">
                    <div className="orders-mobile-top">
                      <strong className="orders-id">#{oid}</strong>
                      <span className={`badge ${statusClass[st] || 'badge-info'}`}>
                        {formatStatusLabel(st)}
                      </span>
                    </div>
                    <div className="orders-mobile-row">
                      <span>Date</span>
                      <span className="orders-date">{formatOrderDateShort(o.created_at ?? o.createdAt ?? o.date)}</span>
                    </div>
                    <div className="orders-mobile-row">
                      <span>Link</span>
                      <a className="orders-link" href={o.link} target="_blank" rel="noreferrer">{o.link}</a>
                    </div>
                    <div className="orders-mobile-row">
                      <span>Charge</span>
                      <span className="orders-charge">{sym}{orderAmount(o)}</span>
                    </div>
                    <div className="orders-mobile-row orders-mobile-row--block">
                      <span>Quantity</span>
                      {renderQtyCell(o)}
                    </div>
                    <div className="orders-mobile-row">
                      <span>Service</span>
                      {renderServiceCell(o)}
                    </div>
                    <div style={{ marginTop: 10 }}>{renderActions(o, oid)}</div>
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
