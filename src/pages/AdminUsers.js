import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { adminGetUsers, adminUpdateUser, adminDeleteUser } from '../api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({});

  const load = () => adminGetUsers().then((r) => setUsers(r.data)).catch(console.error);
  useEffect(() => { load(); }, []);

  const startEdit = (user) => {
    setEditing(user.id);
    setEditData({ balance: user.balance, status: user.status || 'ACTIVE', role: user.role || 'user' });
  };

  const saveEdit = async (id) => {
    try {
      await adminUpdateUser(id, editData);
      setEditing(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 24 }}>User Management</h1>
      <div className="table-wrap card">
        <table className="table">
          <thead>
            <tr>
              {['ID', 'Name', 'Email', 'Balance', 'Status', 'Role', 'Joined', 'Actions'].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
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
                <td>
                  {editing === user.id ? (
                    <select className="select" value={editData.status} onChange={(e) => setEditData((p) => ({ ...p, status: e.target.value }))}>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="BANNED">BANNED</option>
                    </select>
                  ) : (
                    <span className={`badge ${user.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>{user.status}</span>
                  )}
                </td>
                <td>
                  {editing === user.id ? (
                    <select className="select" value={editData.role} onChange={(e) => setEditData((p) => ({ ...p, role: e.target.value }))}>
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                </td>
                <td>
                  {editing === user.id ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => saveEdit(user.id)}>Save</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => startEdit(user)}>Edit</button>
                      {user.role !== 'admin' && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => window.confirm('Delete user?') && adminDeleteUser(user.id).then(load)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!users.length && (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No users</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
