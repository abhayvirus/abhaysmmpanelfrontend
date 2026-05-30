import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  adminGetAllPayments,
  adminApprovePayment,
  adminRejectPayment,
  adminGetPaymentStats,
  adminGetPaymentHistoryAccess,
  adminGetPaymentHistorySettings,
  adminSetPaymentHistorySettings,
  adminClearPaymentHistory,
  API_BASE,
} from '../api';
import '../styles/adminFundsPage.css';

const AUTO_DELETE_OPTIONS = [
  { value: 0, label: 'Never' },
  { value: 30, label: '30 Days' },
  { value: 60, label: '60 Days' },
  { value: 90, label: '90 Days' },
];

const CLEAR_SCOPES = [
  { value: 'completed', label: 'Clear Completed History' },
  { value: 'rejected', label: 'Clear Rejected History' },
  { value: 'all', label: 'Clear All History (completed + rejected)' },
];

const AdminFunds = () => {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [note, setNote] = useState({});
  const [viewImage, setViewImage] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [stats, setStats] = useState({ pending: 0, completed: 0, rejected: 0 });
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [autoDeleteDays, setAutoDeleteDays] = useState(0);
  const [savingAuto, setSavingAuto] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearScope, setClearScope] = useState('completed');
  const [clearing, setClearing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadStats = useCallback(() => {
    adminGetPaymentStats()
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, []);

  const load = useCallback(() => {
    adminGetAllPayments(filter === 'all' ? 'all' : filter)
      .then((r) => setPayments(r.data))
      .catch(() => setPayments([]));
    loadStats();
  }, [filter, loadStats]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    adminGetPaymentHistoryAccess()
      .then((r) => setIsSuperAdmin(Boolean(r.data.isSuperAdmin)))
      .catch(() => setIsSuperAdmin(false));
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) return;
    adminGetPaymentHistorySettings()
      .then((r) => setAutoDeleteDays(r.data.auto_delete_days ?? 0))
      .catch(() => {});
  }, [isSuperAdmin]);

  const approve = async (id) => {
    setActionLoading(id);
    try {
      await adminApprovePayment(id, { admin_note: note[id] || 'Approved' });
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed');
    }
    setActionLoading(null);
  };

  const reject = async (id) => {
    if (!window.confirm('Reject this payment?')) return;
    setActionLoading(id);
    try {
      await adminRejectPayment(id, { admin_note: note[id] || 'Rejected' });
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed');
    }
    setActionLoading(null);
  };

  const saveAutoDelete = async (days) => {
    setSavingAuto(true);
    try {
      await adminSetPaymentHistorySettings(days);
      setAutoDeleteDays(days);
      setSuccessMsg('Auto-delete setting saved');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      alert(e.response?.data?.message || 'Could not save setting');
    }
    setSavingAuto(false);
  };

  const confirmClear = async () => {
    setClearing(true);
    try {
      const { data } = await adminClearPaymentHistory(clearScope);
      setClearOpen(false);
      setSuccessMsg(`✅ History cleared successfully (${data.deleted || 0} record(s) removed)`);
      if (data.counts) setStats(data.counts);
      load();
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (e) {
      alert(e.response?.data?.message || 'Clear failed');
    }
    setClearing(false);
  };

  const filterBtn = (s) => {
    let count = '';
    if (s === 'pending' && stats.pending > 0) count = ` (${stats.pending})`;
    if (s === 'completed' && stats.completed > 0) count = ` (${stats.completed})`;
    if (s === 'rejected' && stats.rejected > 0) count = ` (${stats.rejected})`;
    return (
      <button
        key={s}
        type="button"
        className={`btn ${filter === s ? 'btn-primary' : 'btn-ghost'} btn-sm`}
        onClick={() => setFilter(s)}
      >
        {s.charAt(0).toUpperCase() + s.slice(1)}
        {count}
      </button>
    );
  };

  return (
    <AdminLayout>
      <div className="admin-funds-page">
        <h1 className="admin-page-title">Payment Approvals</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          Approve UTR/QR payments — wallet updates automatically on approval.
        </p>

        {successMsg && <div className="admin-funds-toast" role="status">{successMsg}</div>}

        <div className="admin-funds-toolbar">
          <div className="admin-funds-filters">
            {['pending', 'completed', 'rejected', 'all'].map(filterBtn)}
          </div>
          {isSuperAdmin && (
            <button
              type="button"
              className="btn btn-danger btn-sm admin-funds-clear-btn"
              onClick={() => {
                setClearScope('completed');
                setClearOpen(true);
              }}
            >
              🗑 Clear History
            </button>
          )}
        </div>

        {isSuperAdmin && (
          <div className="admin-funds-auto">
            <span className="admin-funds-auto__label">
              Auto Delete History After (approved &amp; rejected only)
            </span>
            <div className="admin-funds-auto__row">
              {AUTO_DELETE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`btn btn-sm ${autoDeleteDays === opt.value ? 'btn-primary' : 'btn-ghost'}`}
                  disabled={savingAuto}
                  onClick={() => saveAutoDelete(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {payments.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 48 }}>No payments found.</p>
        ) : (
          payments.map((p) => (
            <div key={p.id} className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>
                    {p.user_name} —{' '}
                    <span style={{ color: 'var(--primary)' }}>₹{parseFloat(p.amount).toFixed(2)}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{p.user_email}</div>
                  <div style={{ marginTop: 12, display: 'grid', gap: 6, fontSize: 14 }}>
                    <div><strong>Gateway:</strong> {p.gateway}</div>
                    <div><strong>Method:</strong> {p.payment_method || '—'}</div>
                    <div><strong>User Wallet:</strong> ₹{parseFloat(p.user_wallet_balance || 0).toFixed(2)}</div>
                    <div><strong>Total Deposits:</strong> ₹{parseFloat(p.user_total_deposits || 0).toFixed(2)}</div>
                    <div>
                      <strong>UTR:</strong>{' '}
                      <code style={{ background: 'var(--bg)', padding: '2px 8px', borderRadius: 4 }}>
                        {p.utr_number || p.razorpay_payment_id || '—'}
                      </code>
                    </div>
                    {p.razorpay_order_id && <div><strong>Razorpay Order:</strong> {p.razorpay_order_id}</div>}
                    {p.admin_note && (
                      <div style={{ color: 'var(--warning)' }}><strong>Note:</strong> {p.admin_note}</div>
                    )}
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {new Date(p.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    className={`badge ${
                      p.status === 'completed'
                        ? 'badge-success'
                        : p.status === 'pending'
                          ? 'badge-warning'
                          : 'badge-danger'
                    }`}
                  >
                    {p.status}
                  </span>
                  {p.screenshot_path && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ display: 'block', marginTop: 12, marginLeft: 'auto' }}
                      onClick={() => setViewImage(`${API_BASE}${p.screenshot_path}`)}
                    >
                      🖼 View Screenshot
                    </button>
                  )}
                </div>
              </div>

              {p.status === 'pending' && ['qr', 'manual', 'upi'].includes(p.gateway) && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <input
                    className="input"
                    placeholder="Admin note (optional)"
                    value={note[p.id] || ''}
                    onChange={(e) => setNote((n) => ({ ...n, [p.id]: e.target.value }))}
                    style={{ marginBottom: 12 }}
                  />
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={actionLoading === p.id}
                      onClick={() => approve(p.id)}
                    >
                      {actionLoading === p.id ? '...' : '✅ Approve & Credit Wallet'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      disabled={actionLoading === p.id}
                      onClick={() => reject(p.id)}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {viewImage && (
          <div style={overlay} onClick={() => setViewImage(null)} role="presentation">
            <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
              <img
                src={viewImage}
                alt="Payment proof"
                style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: 12 }}
              />
              <button
                type="button"
                className="btn btn-ghost"
                style={{ position: 'absolute', top: -40, right: 0 }}
                onClick={() => setViewImage(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {clearOpen && (
          <div
            className="admin-funds-modal-overlay"
            role="presentation"
            onClick={() => !clearing && setClearOpen(false)}
          >
            <div
              className="admin-funds-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="clear-history-title"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="clear-history-title">Clear Payment History?</h3>
              <p className="admin-funds-modal__warn">This action cannot be undone.</p>
              <p className="admin-funds-modal__pending-note">
                Pending payments are never deleted. Only completed and/or rejected records are removed.
              </p>
              <div className="admin-funds-modal__options">
                {CLEAR_SCOPES.map((opt) => (
                  <label key={opt.value} className="admin-funds-modal__option">
                    <input
                      type="radio"
                      name="clearScope"
                      value={opt.value}
                      checked={clearScope === opt.value}
                      onChange={() => setClearScope(opt.value)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
              <div className="admin-funds-modal__actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={clearing}
                  onClick={() => setClearOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={clearing}
                  onClick={confirmClear}
                >
                  {clearing ? 'Deleting…' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.9)',
  zIndex: 10000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
};

export default AdminFunds;
