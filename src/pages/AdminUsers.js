import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { adminGetUsers, adminUpdateUser, adminDeleteUser } from '../api';
import '../styles/adminUsers.css';

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

  const renderActions = (user, mobile = false) => {
    const busy = busyId === user.id;
    const wrapClass = mobile ? 'admin-user-actions admin-user-actions--mobile' : 'admin-user-actions';

    if (editing === user.id) {
      return (
        <div className={wrapClass}>
          <button type="button" className="btn btn-primary btn-sm admin-user-btn" disabled={busy} onClick={() => saveEdit(user.id)}>
            {busy ? '…' : 'Save'}
          </button>
          <button type="button" className="btn btn-ghost btn-sm admin-user-btn" disabled={busy} onClick={() => setEditing(null)}>
            Cancel
          </button>
        </div>
      );
    }

    return (
      <div className={wrapClass}>
        <button type="button" className="btn btn-ghost btn-sm admin-user-btn" disabled={busy} onClick={() => startEdit(user)}>
          Edit
        </button>
        {isSuspended(user) ? (
          <button
            type="button"
            className="btn btn-primary btn-sm admin-user-btn"
            disabled={busy}
            onClick={() => setStatus(user, 'ACTIVE')}
          >
            {busy ? '…' : 'Unsuspend'}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-sm admin-user-btn admin-user-btn--suspend"
            disabled={busy}
            onClick={() => setStatus(user, 'BANNED')}
          >
            {busy ? '…' : 'Suspend'}
          </button>
        )}
        <button
          type="button"
          className="btn btn-danger btn-sm admin-user-btn"
          disabled={busy}
          onClick={() => deleteUser(user)}
        >
          {busy ? '…' : 'Delete'}
        </button>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="admin-users-page">
        <h1 className="admin-page-title">User Management</h1>
        <p className="admin-users-lead">
          Edit balance · Suspend / Unsuspend · Delete — admin account is hidden
        </p>

        <div className="admin-table-wrap table-wrap card admin-users-table-card">
          <table className="table admin-users-table">
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
                    <strong className="admin-users-id">#{user.serial ?? '—'}</strong>
                  </td>
                  <td>{user.name || '—'}</td>
                  <td className="admin-users-email" title={user.email || ''}>
                    {user.email ? (
                      <a href={`mailto:${String(user.email).trim()}`}>{String(user.email).trim()}</a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {editing === user.id ? (
                      <input
                        type="number"
                        className="input admin-users-balance-input"
                        value={editData.balance}
                        onChange={(e) => setEditData((p) => ({ ...p, balance: e.target.value }))}
                      />
                    ) : (
                      <strong className="admin-users-money">₹{parseFloat(user.balance || 0).toFixed(2)}</strong>
                    )}
                  </td>
                  <td><strong className="admin-users-money admin-users-money--ok">₹{parseFloat(user.total_deposits || 0).toFixed(2)}</strong></td>
                  <td>₹{parseFloat(user.total_spent || 0).toFixed(2)}</td>
                  <td>
                    {editing === user.id ? (
                      <select
                        className="select admin-users-status-select"
                        value={editData.status}
                        onChange={(e) => setEditData((p) => ({ ...p, status: e.target.value }))}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="BANNED">BANNED</option>
                      </select>
                    ) : (
                      <span className={`badge ${isSuspended(user) ? 'badge-danger' : 'badge-success'}`}>
                        {isSuspended(user) ? 'SUSPENDED' : (user.status || 'ACTIVE')}
                      </span>
                    )}
                  </td>
                  <td className="admin-users-joined">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="admin-users-actions-cell">{renderActions(user, false)}</td>
                </tr>
              ))}
              {!users.length && (
                <tr>
                  <td colSpan={9} className="admin-users-empty">No users</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-mobile-list">
          {users.map((user) => (
            <div key={user.id} className="card admin-mobile-card admin-users-mobile-card">
              <div className="admin-mobile-card-top">
                <strong>
                  <span className="admin-users-id">#{user.serial}</span>
                  {' '}
                  {displayName(user)}
                </strong>
                <span className={`badge ${isSuspended(user) ? 'badge-danger' : 'badge-success'}`}>
                  {isSuspended(user) ? 'SUSPENDED' : (user.status || 'ACTIVE')}
                </span>
              </div>
              <div className="admin-mobile-row">
                <span>Email</span>
                <span className="admin-users-email-text" title={user.email || ''}>
                  {user.email ? String(user.email).trim() : '—'}
                </span>
              </div>
              <div className="admin-mobile-row">
                <span>Balance</span>
                <span>
                  {editing === user.id ? (
                    <input
                      type="number"
                      className="input admin-users-balance-input"
                      value={editData.balance}
                      onChange={(e) => setEditData((p) => ({ ...p, balance: e.target.value }))}
                    />
                  ) : (
                    <strong className="admin-users-money">₹{parseFloat(user.balance || 0).toFixed(2)}</strong>
                  )}
                </span>
              </div>
              <div className="admin-mobile-row"><span>Deposits</span><span>₹{parseFloat(user.total_deposits || 0).toFixed(2)}</span></div>
              <div className="admin-mobile-row"><span>Spent</span><span>₹{parseFloat(user.total_spent || 0).toFixed(2)}</span></div>
              {renderActions(user, true)}
            </div>
          ))}
          {!users.length && (
            <p className="admin-users-empty">No users</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
