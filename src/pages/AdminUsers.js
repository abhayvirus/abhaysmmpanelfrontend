import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { adminGetUsers, adminUpdateUser, adminDeleteUser } from '../api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({});
  const [busyId, setBusyId] = useState(null);

  const load = () => adminGetUsers().then((r) => setUsers(r.data || [])).catch(console.error);
  useEffect(() => { load(); }, []);

  const displayName = (user) => user.name || user.email || `User #${user.serial || user.id}`;

  const startEdit = (user) => {
    setEditing(user.id);
    setEditData({ balance: user.balance, status: user.status || 'ACTIVE' });
  };

  const saveEdit = async (id) => {
    setBusyId(id);
    try {
      await adminUpdateUser(id, { ...editData, role: 'user' });
      setEditing(null);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
    setBusyId(null);
  };

  const setStatus = async (user, status) => {
    const label = status === 'BANNED' ? 'suspend' : 'activate';
    if (!window.confirm(`${label === 'suspend' ? 'Suspend' : 'Activate'} ${displayName(user)}?`)) return;
    setBusyId(user.id);
    try {
      await adminUpdateUser(user.id, {
        balance: user.balance,
        status,
        role: 'user',
      });
      await load();
    } catch (err) {
      alert(err.response?.data?.message || `Could not ${label} user`);
    }
    setBusyId(null);
  };

  const deleteUser = async (user) => {
    const label = displayName(user);
    if (!window.confirm(`Delete user "${label}"?\n\nThis removes their orders, payments and tickets. Cannot be undone.`)) {
      return;
    }
    setBusyId(user.id);
    try {
      await adminDeleteUser(user.id);
      await load();
      alert('User deleted successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
    setBusyId(null);
  };

  const isSuspended = (user) => {
    const s = String(user.status || '').toUpperCase();
    return s === 'BANNED' || s === 'SUSPENDED' || user.blocked === 1 || user.blocked === true;
  };

  const renderActions = (user) => {
    const busy = busyId === user.id;
    if (editing === user.id) {
      return (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => saveEdit(user.id)}>
            {busy ? '…' : 'Save'}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => setEditing(null)}>
            Cancel
          </button>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => startEdit(user)}>
          Edit
        </button>
        {isSuspended(user) ? (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={busy}
            onClick={() => setStatus(user, 'ACTIVE')}
          >
            {busy ? '…' : 'Unsuspend'}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ borderColor: 'var(--warning, #f59e0b)', color: 'var(--warning, #f59e0b)' }}
            disabled={busy}
            onClick={() => setStatus(user, 'BANNED')}
          >
            {busy ? '…' : 'Suspend'}
          </button>
        )}
        <button type="button" className="btn btn-danger btn-sm" disabled={busy} onClick={() => deleteUser(user)}>
          {busy ? '…' : 'Delete'}
        </button>
      </div>
    );
  };

  return (
    <AdminLayout>
      <h1 className="admin-page-title">User Management</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: -8, marginBottom: 16, fontSize: 14 }}>
        Edit balance · Suspend / Unsuspend · Delete — admin account is hidden
      </p>
      <div className="admin-table-wrap table-wrap card">
        <table className="table">
          <thead>
            <tr>
              {['ID', 'Name', 'Email', 'Balance', 'Deposits', 'Spent', 'Status', 'Joined', 'Actions'].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <strong style={{ color: 'var(--primary)' }}>#{user.serial ?? '—'}</strong>
                </td>
                <td>{user.name || '—'}</td>
                <td>{user.email}</td>
                <td>
                  {editing === user.id ? (
                    <input
                      type="number"
                      className="input"
                      style={{ width: 90 }}
                      value={editData.balance}
                      onChange={(e) => setEditData((p) => ({ ...p, balance: e.target.value }))}
                    />
                  ) : (
                    <strong style={{ color: 'var(--primary)' }}>₹{parseFloat(user.balance || 0).toFixed(2)}</strong>
                  )}
                </td>
                <td><strong style={{ color: 'var(--success)' }}>₹{parseFloat(user.total_deposits || 0).toFixed(2)}</strong></td>
                <td>₹{parseFloat(user.total_spent || 0).toFixed(2)}</td>
                <td>
                  {editing === user.id ? (
                    <select className="select" value={editData.status} onChange={(e) => setEditData((p) => ({ ...p, status: e.target.value }))}>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="BANNED">BANNED (Suspended)</option>
                    </select>
                  ) : (
                    <span className={`badge ${isSuspended(user) ? 'badge-danger' : 'badge-success'}`}>
                      {isSuspended(user) ? 'SUSPENDED' : (user.status || 'ACTIVE')}
                    </span>
                  )}
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                </td>
                <td>{renderActions(user)}</td>
              </tr>
            ))}
            {!users.length && (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No users</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-mobile-list">
        {users.map((user) => (
          <div key={user.id} className="card admin-mobile-card">
            <div className="admin-mobile-card-top">
              <strong>
                <span style={{ color: 'var(--primary)', marginRight: 8 }}>#{user.serial}</span>
                {displayName(user)}
              </strong>
              <span className={`badge ${isSuspended(user) ? 'badge-danger' : 'badge-success'}`}>
                {isSuspended(user) ? 'SUSPENDED' : (user.status || 'ACTIVE')}
              </span>
            </div>
            <div className="admin-mobile-row"><span>Email</span><span>{user.email}</span></div>
            <div className="admin-mobile-row">
              <span>Balance</span>
              <span>
                {editing === user.id ? (
                  <input
                    type="number"
                    className="input"
                    style={{ width: '100%', maxWidth: 120 }}
                    value={editData.balance}
                    onChange={(e) => setEditData((p) => ({ ...p, balance: e.target.value }))}
                  />
                ) : (
                  <strong style={{ color: 'var(--primary)' }}>₹{parseFloat(user.balance || 0).toFixed(2)}</strong>
                )}
              </span>
            </div>
            <div className="admin-mobile-row"><span>Deposits</span><span>₹{parseFloat(user.total_deposits || 0).toFixed(2)}</span></div>
            <div className="admin-mobile-row"><span>Spent</span><span>₹{parseFloat(user.total_spent || 0).toFixed(2)}</span></div>
            <div style={{ marginTop: 12 }}>{renderActions(user)}</div>
          </div>
        ))}
        {!users.length && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>No users</p>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
