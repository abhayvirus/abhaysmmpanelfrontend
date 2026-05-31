import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import { adminGetAllOrders, adminUpdateOrderStatus, adminDeleteOrder } from '../api';

const STATUS_FILTERS = ['All', 'pending', 'processing', 'completed', 'cancelled', 'failed'];

const STATUS_ACTIONS = [
  { status: 'completed', label: '✅ Completed', className: 'btn-primary' },
  { status: 'processing', label: '⏳ Processing', className: 'btn-ghost' },
  { status: 'cancelled', label: '❌ Cancelled', className: 'btn-danger' },
];

/** Terminal statuses — show only the current state, no other action buttons. */
const TERMINAL_STATUS = {
  completed: { label: '✅ Completed', className: 'btn-primary' },
  cancelled: { label: '❌ Cancelled', className: 'btn-danger' },
  failed: { label: '❌ Failed', className: 'btn-danger' },
};

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

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
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

  const renderLinkCell = (link) => {
    if (!link) return '—';
    return (
      <div className="admin-order-link-actions">
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="admin-order-link-btn admin-order-link-btn--view"
        >
          View ↗
        </a>
        <button
          type="button"
          className="admin-order-link-btn admin-order-link-btn--copy"
          onClick={() => copyLink(link)}
        >
          Copy
        </button>
      </div>
    );
  };

  const renderUserCell = (order) => (
    <div className="admin-order-user-cell">
      <span className="admin-order-user-name">{order.user_name || '—'}</span>
      {order.user_email && (
        <span className="admin-order-user-email">{order.user_email}</span>
      )}
    </div>
  );

  const renderStatusButtons = (order, compact = false) => {
    const current = (order.status || '').toLowerCase();
    const terminal = TERMINAL_STATUS[current];

    if (terminal) {
      return (
        <div
          className={`${compact ? 'admin-order-status-btns' : 'admin-order-status-actions'} admin-order-status-actions--terminal`}
        >
          <span className={`btn btn-sm ${terminal.className} is-current is-terminal`} aria-current="true">
            {terminal.label}
          </span>
        </div>
      );
    }

    return (
      <div className={compact ? 'admin-order-status-btns' : 'admin-order-status-actions'}>
        {STATUS_ACTIONS.map((action) => (
          <button
            key={action.status}
            type="button"
            className={`btn btn-sm ${action.className}${current === action.status ? ' is-current' : ''}`}
            disabled={updatingId === order.id}
            onClick={() => changeStatus(order.id, action.status)}
          >
            {action.label}
          </button>
        ))}
      </div>
    );
  };

  const renderOrderDetails = (order) => (
    <div className="admin-order-details">
      <h4 className="admin-order-details__title">Order details</h4>
      <div className="admin-order-row">
        <span>User Name</span>
        <span>{order.user_name || '—'}</span>
      </div>
      <div className="admin-order-row">
        <span>User Email</span>
        <span className="admin-order-user-email">{order.user_email || '—'}</span>
      </div>
      <div className="admin-order-row">
        <span>Order ID</span>
        <span>#{order.id}</span>
      </div>
      <div className="admin-order-row">
        <span>Service Name</span>
        <span>{order.service_name || '—'}</span>
      </div>
      <div className="admin-order-row">
        <span>Quantity</span>
        <span>{order.quantity ?? '—'}</span>
      </div>
      <div className="admin-order-row">
        <span>Price</span>
        <span>₹{parseFloat(order.price || 0).toFixed(2)}</span>
      </div>
      <div className="admin-order-row">
        <span>Current Status</span>
        <span className={statusBadgeClass(order.status)}>{order.status}</span>
      </div>
      <div className="admin-order-row">
        <span>Created Date</span>
        <span>{formatDate(order.created_at)}</span>
      </div>
      <div className="admin-order-row">
        <span>Updated Date</span>
        <span>{formatDate(order.updated_at)}</span>
      </div>
      {order.api_order_id && (
        <div className="admin-order-row">
          <span>API ID</span>
          <span style={{ wordBreak: 'break-all' }}>{order.api_order_id}</span>
        </div>
      )}
      {order.user_wallet_balance != null && (
        <div className="admin-order-row">
          <span>Wallet</span>
          <span>₹{parseFloat(order.user_wallet_balance || 0).toFixed(2)}</span>
        </div>
      )}
      {order.platform && (
        <div className="admin-order-row">
          <span>Platform</span>
          <span>{order.platform}</span>
        </div>
      )}
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
                        <td>{renderUserCell(o)}</td>
                        <td style={{ maxWidth: 160 }}>{o.service_name}</td>
                        <td>{renderLinkCell(o.link)}</td>
                        <td>{o.quantity}</td>
                        <td>₹{parseFloat(o.price || 0).toFixed(2)}</td>
                        <td>
                          <span className={statusBadgeClass(o.status)}>{o.status}</span>
                        </td>
                        <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(o.created_at)}</td>
                        <td className="admin-order-actions-cell">
                          {renderStatusButtons(o, true)}
                          <button
                            type="button"
                            className="btn btn-danger btn-sm admin-order-delete-btn"
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
                    <div className="admin-order-card-header__main">
                      <h3>Order #{o.id}</h3>
                      <div className="admin-order-user-cell">
                        <span className="admin-order-user-name">{o.user_name || '—'}</span>
                        {o.user_email && (
                          <span className="admin-order-user-email">{o.user_email}</span>
                        )}
                      </div>
                    </div>
                    <span className={statusBadgeClass(o.status)}>{o.status}</span>
                  </div>

                  {renderOrderDetails(o)}

                  {o.link && (
                    <div className="admin-order-row admin-order-link-row">
                      <span>Link</span>
                      {renderLinkCell(o.link)}
                    </div>
                  )}

                  <div className="admin-order-status-section">
                    <h4>Current status: {(o.status || '').toUpperCase()}</h4>
                    {renderStatusButtons(o)}
                  </div>

                  {renderTimeline(o)}

                  <div className="admin-order-actions">
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      disabled={updatingId === o.id}
                      onClick={() => deleteOrder(o.id)}
                    >
                      Delete order
                    </button>
                  </div>

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
