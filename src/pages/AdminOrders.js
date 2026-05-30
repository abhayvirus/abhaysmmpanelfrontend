import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import { adminGetAllOrders, adminUpdateOrderStatus, adminDeleteOrder } from '../api';

const STATUS_FILTERS = ['All', 'pending', 'processing', 'completed', 'cancelled', 'failed'];

const STATUS_ACTIONS = [
  { status: 'completed', label: '✓ Complete', className: 'btn-primary' },
  { status: 'processing', label: '⏳ Processing', className: 'btn-ghost' },
  { status: 'cancelled', label: '❌ Cancelled', className: 'btn-danger' },
];

const statusBadgeClass = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'completed') return 'badge badge-success';
  if (s === 'cancelled' || s === 'failed') return 'badge badge-danger';
  if (s === 'processing' || s === 'pending' || s === 'active') return 'badge badge-warning';
  return 'badge badge-info';
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatShortDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB');
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
  };

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const load = useCallback(() => {
    setLoading(true);
    adminGetAllOrders()
      .then((r) => setOrders(r.data))
      .catch(() => showToast('Failed to load orders', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = orders.filter((o) => {
    const q = search.trim().toLowerCase();
    const matchesStatus = status === 'All' || o.status === status;
    if (!matchesStatus) return false;
    if (!q) return true;
    return (
      String(o.id).includes(q)
      || (o.user_name || '').toLowerCase().includes(q)
      || (o.user_email || '').toLowerCase().includes(q)
      || (o.service_name || '').toLowerCase().includes(q)
      || (o.status || '').toLowerCase().includes(q)
      || (o.link || '').toLowerCase().includes(q)
    );
  });

  const patchOrder = (updated) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
  };

  const changeStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const { data } = await adminUpdateOrderStatus(orderId, newStatus);
      if (data?.id) {
        patchOrder(data);
      } else {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, updated_at: new Date().toISOString() } : o))
        );
      }
      showToast(`Order #${orderId} marked as ${newStatus}`);
    } catch (e) {
      showToast(e.response?.data?.message || 'Status update failed', 'error');
    }
    setUpdatingId(null);
  };

  const copyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      showToast('Link copied');
    } catch {
      showToast('Could not copy link', 'error');
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm(`Delete order #${orderId}? This cannot be undone.`)) return;
    setUpdatingId(orderId);
    try {
      await adminDeleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      showToast(`Order #${orderId} deleted`);
    } catch (e) {
      showToast(e.response?.data?.message || 'Delete failed', 'error');
    }
    setUpdatingId(null);
  };

  const renderStatusButtons = (order, compact = false) => (
    <div className={compact ? 'admin-order-status-btns' : 'admin-order-status-actions'}>
      {STATUS_ACTIONS.map((action) => (
        <button
          key={action.status}
          type="button"
          className={`btn btn-sm ${action.className}${order.status === action.status ? ' is-current' : ''}`}
          disabled={updatingId === order.id}
          onClick={() => changeStatus(order.id, action.status)}
        >
          {action.label}
        </button>
      ))}
    </div>
  );

  const renderTimeline = (order) => (
    <div className="admin-order-timeline">
      <div className="admin-order-timeline-row">
        <span>Created</span>
        <strong>{formatDate(order.created_at)}</strong>
      </div>
      <div className="admin-order-timeline-row">
        <span>Updated</span>
        <strong>{formatDate(order.updated_at)}</strong>
      </div>
      <div className="admin-order-timeline-row">
        <span>Completed</span>
        <strong>
          {order.status === 'completed'
            ? formatDate(order.updated_at)
            : '—'}
        </strong>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="admin-orders-page">
        <h1 className="admin-page-title">All Orders</h1>

        <input
          className="input admin-orders-search"
          placeholder="Search order ID, user, service, status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search orders"
        />

        <div className="admin-orders-filters" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading orders...</p>
        ) : !filtered.length ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No orders found</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="admin-orders-desktop card" style={{ padding: 0 }}>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Service</th>
                      <th>Link</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((o) => (
                      <tr key={o.id}>
                        <td>#{o.id}</td>
                        <td>{o.user_name}</td>
                        <td style={{ maxWidth: 140 }}>{o.service_name}</td>
                        <td>
                          {o.link ? (
                            <a
                              href={o.link}
                              target="_blank"
                              rel="noreferrer"
                              className="order-link-cell"
                            >
                              View Link
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>{o.quantity}</td>
                        <td>₹{parseFloat(o.price || 0).toFixed(2)}</td>
                        <td>
                          <span className={statusBadgeClass(o.status)}>{o.status}</span>
                        </td>
                        <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(o.created_at)}</td>
                        <td>
                          {renderStatusButtons(o, true)}
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            style={{ marginTop: 6 }}
                            disabled={updatingId === o.id}
                            onClick={() => deleteOrder(o.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards — no table */}
            <div className="admin-orders-mobile">
              {filtered.map((o) => (
                <article key={o.id} className="admin-order-card">
                  <div className="admin-order-card-header">
                    <h3>Order #{o.id}</h3>
                    <span className={statusBadgeClass(o.status)}>{o.status}</span>
                  </div>

                  <div className="admin-order-row">
                    <span>User</span>
                    <span>{o.user_name}</span>
                  </div>
                  <div className="admin-order-row">
                    <span>Service</span>
                    <span>{o.service_name}</span>
                  </div>
                  <div className="admin-order-row">
                    <span>Quantity</span>
                    <span>{o.quantity}</span>
                  </div>
                  <div className="admin-order-row">
                    <span>Price</span>
                    <span>₹{parseFloat(o.price || 0).toFixed(2)}</span>
                  </div>
                  <div className="admin-order-row">
                    <span>Date</span>
                    <span>{formatShortDate(o.created_at)}</span>
                  </div>

                  {o.link && (
                    <div className="admin-order-row admin-order-link-row">
                      <span>Link</span>
                      <a
                        href={o.link}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-order-view-link"
                      >
                        View Link ↗
                      </a>
                    </div>
                  )}

                  <div className="admin-order-status-section">
                    <h4>Current status: {o.status}</h4>
                    {renderStatusButtons(o)}
                  </div>

                  {renderTimeline(o)}

                  <div className="admin-order-actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                    >
                      {expandedId === o.id ? 'Hide details' : 'View details'}
                    </button>
                    {o.link && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => copyLink(o.link)}
                      >
                        Copy link
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      disabled={updatingId === o.id}
                      onClick={() => deleteOrder(o.id)}
                    >
                      Delete order
                    </button>
                  </div>

                  {expandedId === o.id && (
                    <div className="admin-order-details">
                      <div className="admin-order-row">
                        <span>Email</span>
                        <span>{o.user_email || '—'}</span>
                      </div>
                      <div className="admin-order-row">
                        <span>Wallet</span>
                        <span>₹{parseFloat(o.user_wallet_balance || 0).toFixed(2)}</span>
                      </div>
                      <div className="admin-order-row">
                        <span>API ID</span>
                        <span style={{ wordBreak: 'break-all' }}>{o.api_order_id || '—'}</span>
                      </div>
                      <div className="admin-order-row">
                        <span>Platform</span>
                        <span>{o.platform || '—'}</span>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      {toast && (
        <div className={`admin-orders-toast admin-orders-toast--${toast.type}`} role="status">
          {toast.text}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
