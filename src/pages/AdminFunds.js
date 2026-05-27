import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  adminGetAllPayments,
  adminApprovePayment,
  adminRejectPayment,
  API_BASE,
} from '../api';

const AdminFunds = () => {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [note, setNote] = useState({});
  const [viewImage, setViewImage] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(() => {
    adminGetAllPayments(filter === 'all' ? 'all' : filter).then((r) => setPayments(r.data)).catch(() => {});
  }, [filter]);

  useEffect(() => { load(); }, [load]);

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

  const pendingCount = payments.filter((p) => p.status === 'pending').length;

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 8 }}>Payment Approvals</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
        Approve UTR/QR payments — wallet updates automatically on approval.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['pending', 'completed', 'rejected', 'all'].map((s) => (
          <button key={s} className={`btn ${filter === s ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s === 'pending' && pendingCount > 0 && ` (${pendingCount})`}
          </button>
        ))}
      </div>

      {payments.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 48 }}>No payments found.</p>
      ) : (
        payments.map((p) => (
          <div key={p.id} className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>
                  {p.user_name} — <span style={{ color: 'var(--primary)' }}>₹{parseFloat(p.amount).toFixed(2)}</span>
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
                  {p.admin_note && <div style={{ color: 'var(--warning)' }}><strong>Note:</strong> {p.admin_note}</div>}
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(p.created_at).toLocaleString()}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${
                  p.status === 'completed' ? 'badge-success' :
                  p.status === 'pending' ? 'badge-warning' : 'badge-danger'
                }`}>{p.status}</span>
                {p.screenshot_path && (
                  <button className="btn btn-ghost btn-sm" style={{ display: 'block', marginTop: 12, marginLeft: 'auto' }}
                    onClick={() => setViewImage(`${API_BASE}${p.screenshot_path}`)}>
                    🖼 View Screenshot
                  </button>
                )}
              </div>
            </div>

            {p.status === 'pending' && ['qr', 'manual', 'upi'].includes(p.gateway) && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <input className="input" placeholder="Admin note (optional)" value={note[p.id] || ''}
                  onChange={(e) => setNote((n) => ({ ...n, [p.id]: e.target.value }))}
                  style={{ marginBottom: 12 }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-primary" disabled={actionLoading === p.id}
                    onClick={() => approve(p.id)}>
                    {actionLoading === p.id ? '...' : '✅ Approve & Credit Wallet'}
                  </button>
                  <button className="btn btn-danger" disabled={actionLoading === p.id}
                    onClick={() => reject(p.id)}>
                    ❌ Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {viewImage && (
        <div style={overlay} onClick={() => setViewImage(null)}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img src={viewImage} alt="Payment proof" style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: 12 }} />
            <button className="btn btn-ghost" style={{ position: 'absolute', top: -40, right: 0 }} onClick={() => setViewImage(null)}>Close</button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10000,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
};

export default AdminFunds;
