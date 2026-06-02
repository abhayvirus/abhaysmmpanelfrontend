import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  adminGetUsers,
  adminUpdateUser,
  adminSendPersonalMessage,
  adminSendPersonalPopup,
  adminBroadcastMessage,
} from '../../api';

const CHANNELS = [
  { value: 'inbox', label: 'Support inbox only' },
  { value: 'notification', label: 'In-app notification' },
  { value: 'email', label: 'Email' },
  { value: 'both', label: 'Notification + Email' },
  { value: 'all', label: 'Inbox + Notification + Email' },
];

const fmt = (n) => `₹${parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const AdminUserControlPanel = ({ onToast }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msgForm, setMsgForm] = useState({ message: '', channels: 'all' });
  const [popupForm, setPopupForm] = useState({
    title: '',
    content: '',
    send_notification: true,
    send_email: false,
  });
  const [walletForm, setWalletForm] = useState({ balance: '', status: 'ACTIVE' });

  const loadUsers = useCallback(() => {
    setLoading(true);
    adminGetUsers()
      .then((r) => setUsers(Array.isArray(r.data) ? r.data : []))
      .catch(() => {
        onToast?.('Failed to load users', 'error');
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }, [onToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = users.filter((u) => u.role !== 'admin');
    if (!q) return list;
    return list.filter(
      (u) =>
        String(u.id).includes(q)
        || (u.name || '').toLowerCase().includes(q)
        || (u.email || '').toLowerCase().includes(q),
    );
  }, [users, search]);

  const selected = useMemo(
    () => filtered.find((u) => String(u.id) === String(selectedId)) || null,
    [filtered, selectedId],
  );

  useEffect(() => {
    if (selected) {
      setWalletForm({
        balance: String(selected.balance ?? ''),
        status: selected.status || 'ACTIVE',
      });
    }
  }, [selected]);

  const sendPersonalMessage = async (e) => {
    e.preventDefault();
    if (!selected?.id || !msgForm.message.trim()) return;
    setSaving(true);
    try {
      await adminSendPersonalMessage(selected.id, {
        message: msgForm.message.trim(),
        channels: msgForm.channels,
      });
      onToast?.(`Message sent to ${selected.name}`);
      setMsgForm((f) => ({ ...f, message: '' }));
    } catch (err) {
      onToast?.(err.response?.data?.message || 'Failed to send message', 'error');
    }
    setSaving(false);
  };

  const sendPersonalPopup = async (e) => {
    e.preventDefault();
    if (!selected?.id) return;
    setSaving(true);
    try {
      await adminSendPersonalPopup(selected.id, popupForm);
      onToast?.(`Personal popup sent to ${selected.name}`);
      setPopupForm({ title: '', content: '', send_notification: true, send_email: false });
    } catch (err) {
      onToast?.(err.response?.data?.message || 'Failed to send popup', 'error');
    }
    setSaving(false);
  };

  const saveWallet = async () => {
    if (!selected?.id) return;
    setSaving(true);
    try {
      await adminUpdateUser(selected.id, {
        balance: parseFloat(walletForm.balance) || 0,
        status: walletForm.status,
        role: 'user',
      });
      onToast?.('User wallet updated');
      loadUsers();
    } catch (err) {
      onToast?.(err.response?.data?.message || 'Update failed', 'error');
    }
    setSaving(false);
  };

  const quickBroadcast = async () => {
    if (!selected?.id || !msgForm.message.trim()) return;
    setSaving(true);
    try {
      await adminBroadcastMessage({
        audience: 'selected',
        user_ids: [selected.id],
        channels: msgForm.channels,
        message: msgForm.message.trim(),
      });
      onToast?.('Broadcast sent to selected user');
    } catch (err) {
      onToast?.(err.response?.data?.message || 'Broadcast failed', 'error');
    }
    setSaving(false);
  };

  return (
    <div className="admin-user-control">
      <p className="admin-user-control__intro">
        Search a user, then send a personal inbox message, personal popup, or update wallet and status.
        Global popups are still under the Popups tab.
      </p>

      <div className="admin-user-control__search-row">
        <div className="form-group admin-user-control__search">
          <label className="label" htmlFor="admin-user-search">Search user</label>
          <input
            id="admin-user-search"
            className="input"
            placeholder="Name, email or user ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="form-group admin-user-control__pick">
          <label className="label" htmlFor="admin-user-select">Select user</label>
          <select
            id="admin-user-select"
            className="select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={loading || !filtered.length}
          >
            <option value="">{loading ? 'Loading…' : 'Choose a user'}</option>
            {filtered.map((u) => (
              <option key={u.id} value={u.id}>
                #{u.id} — {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {!loading && !filtered.length && (
        <p className="admin-user-control__empty">No users found.</p>
      )}

      {selected ? (
        <>
          <div className="admin-user-control__profile card">
            <div className="admin-user-control__profile-head">
              <div>
                <h3 className="admin-user-control__name">{selected.name}</h3>
                <p className="admin-user-control__email">{selected.email}</p>
              </div>
              <span className={`badge ${selected.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                {selected.status}
              </span>
            </div>
            <dl className="admin-user-control__stats">
              <div><dt>User ID</dt><dd>#{selected.id}</dd></div>
              <div><dt>Wallet</dt><dd>{fmt(selected.balance)}</dd></div>
              <div><dt>Total deposits</dt><dd>{fmt(selected.total_deposits)}</dd></div>
              <div><dt>Total spent</dt><dd>{fmt(selected.total_spent)}</dd></div>
            </dl>
            <div className="admin-user-control__quick-links">
              <Link to="/admin/chat" className="btn btn-ghost btn-sm">💬 Open Support Inbox</Link>
              <Link to="/admin/users" className="btn btn-ghost btn-sm">👥 All users</Link>
              <Link to="/admin/funds" className="btn btn-ghost btn-sm">💰 Payments</Link>
            </div>
          </div>

          <div className="admin-user-control__grid">
            <form className="card admin-user-control__panel" onSubmit={sendPersonalMessage}>
              <h3 className="admin-settings-section-title">Personal message</h3>
              <p className="admin-user-control__hint">
                Sends only to <strong>{selected.name}</strong> — choose delivery channel below.
              </p>
              <div className="form-group">
                <label className="label">Delivery</label>
                <select
                  className="select"
                  value={msgForm.channels}
                  onChange={(e) => setMsgForm((f) => ({ ...f, channels: e.target.value }))}
                >
                  {CHANNELS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Message</label>
                <textarea
                  className="textarea"
                  rows={4}
                  value={msgForm.message}
                  onChange={(e) => setMsgForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Type your personal message…"
                  required
                />
              </div>
              <div className="admin-user-control__actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Sending…' : '📨 Send personal message'}
                </button>
                <button type="button" className="btn btn-ghost" disabled={saving} onClick={quickBroadcast}>
                  📢 Send via broadcast API
                </button>
              </div>
            </form>

            <form className="card admin-user-control__panel" onSubmit={sendPersonalPopup}>
              <h3 className="admin-settings-section-title">Personal popup</h3>
              <p className="admin-user-control__hint">
                Shows a popup modal when <strong>{selected.name}</strong> opens the user panel.
              </p>
              <div className="form-group">
                <label className="label">Popup title</label>
                <input
                  className="input"
                  value={popupForm.title}
                  onChange={(e) => setPopupForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Important update"
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Popup message</label>
                <textarea
                  className="textarea"
                  rows={4}
                  value={popupForm.content}
                  onChange={(e) => setPopupForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Your personal announcement…"
                  required
                />
              </div>
              <label className="admin-user-control__check">
                <input
                  type="checkbox"
                  checked={popupForm.send_notification}
                  onChange={(e) => setPopupForm((f) => ({ ...f, send_notification: e.target.checked }))}
                />
                Also send in-app notification
              </label>
              <label className="admin-user-control__check">
                <input
                  type="checkbox"
                  checked={popupForm.send_email}
                  onChange={(e) => setPopupForm((f) => ({ ...f, send_email: e.target.checked }))}
                />
                Also send email
              </label>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Sending…' : '📢 Send personal popup'}
              </button>
            </form>

            <div className="card admin-user-control__panel admin-user-control__panel--wallet">
              <h3 className="admin-settings-section-title">Wallet &amp; status</h3>
              <div className="form-group">
                <label className="label">Wallet balance (₹)</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={walletForm.balance}
                  onChange={(e) => setWalletForm((f) => ({ ...f, balance: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="label">Account status</label>
                <select
                  className="select"
                  value={walletForm.status}
                  onChange={(e) => setWalletForm((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="BANNED">BANNED (Suspended)</option>
                </select>
              </div>
              <button type="button" className="btn btn-primary" disabled={saving} onClick={saveWallet}>
                {saving ? 'Saving…' : '💾 Save user changes'}
              </button>
            </div>
          </div>
        </>
      ) : (
        <p className="admin-user-control__empty">Select a user above to manage messaging and wallet.</p>
      )}
    </div>
  );
};

export default AdminUserControlPanel;
