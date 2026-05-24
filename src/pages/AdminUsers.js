import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { adminGetUsers, adminUpdateUser, adminDeleteUser } from '../api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => { adminGetUsers().then(r => setUsers(r.data)).catch(console.error); }, []);

  const startEdit = (user) => { setEditing(user.id); setEditData({ balance: user.balance, status: user.status, role: user.role }); };
  const saveEdit = async (id) => {
    try {
      await adminUpdateUser(id, editData);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...editData } : u));
      setEditing(null);
    } catch (err) { alert('Failed'); }
  };

  return (
    <div style={{ display: 'flex' }}>
      <AdminSidebar />
      <div style={{ marginLeft: 220, minHeight: '100vh', background: '#0d1520', color: '#fff', padding: '32px 40px', width: '100%' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 28 }}>Users</h1>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e2a3a' }}>
                {['ID', 'Name', 'Email', 'Balance', 'Status', 'Role', 'Joined', 'Action'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: '#8ca0b8', fontSize: 13 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #1e2a3a' }}>
                  <td style={td}>{user.id}</td>
                  <td style={td}>{user.name}</td>
                  <td style={td}>{user.email}</td>
                  <td style={td}>
                    {editing === user.id
                      ? <input type="number" value={editData.balance} onChange={e => setEditData(p => ({ ...p, balance: e.target.value }))} style={{ width: 80, padding: '4px 8px', borderRadius: 6, background: '#0d1520', border: '1px solid #6c63ff', color: '#fff', outline: 'none' }} />
                      : <span style={{ color: '#6c63ff', fontWeight: 700 }}>₹{parseFloat(user.balance).toFixed(2)}</span>}
                  </td>
                  <td style={td}>
                    {editing === user.id
                      ? <select value={editData.status} onChange={e => setEditData(p => ({ ...p, status: e.target.value }))} style={{ padding: '4px 8px', borderRadius: 6, background: '#0d1520', border: '1px solid #2d3a50', color: '#fff', outline: 'none' }}>
                          <option>ACTIVE</option><option>BANNED</option>
                        </select>
                      : <span style={{ color: user.status === 'ACTIVE' ? '#2ecc71' : '#e74c3c', fontWeight: 600 }}>{user.status}</span>}
                  </td>
                  <td style={td}>
                    {editing === user.id
                      ? <select value={editData.role} onChange={e => setEditData(p => ({ ...p, role: e.target.value }))} style={{ padding: '4px 8px', borderRadius: 6, background: '#0d1520', border: '1px solid #2d3a50', color: '#fff', outline: 'none' }}>
                          <option>user</option><option>admin</option>
                        </select>
                      : <span style={{ color: user.role === 'admin' ? '#f39c12' : '#8ca0b8' }}>{user.role}</span>}
                  </td>
                  <td style={{ ...td, fontSize: 12, color: '#8ca0b8' }}>{new Date(user.created_at).toLocaleDateString('en-IN')}</td>
                  <td style={td}>
                    {editing === user.id
                      ? <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => saveEdit(user.id)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: '#2ecc71', color: '#fff', cursor: 'pointer', fontSize: 12 }}>Save</button>
                          <button onClick={() => setEditing(null)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: '#e74c3c', color: '#fff', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
                        </div>
                      : <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => startEdit(user)} style={{ padding: '5px 14px', borderRadius: 6, border: 'none', background: '#1e2a3a', color: '#fff', cursor: 'pointer', fontSize: 12 }}>Edit</button>
                          {user.role !== 'admin' && (
                            <button onClick={() => window.confirm('Delete user?') && adminDeleteUser(user.id).then(() => adminGetUsers().then(r => setUsers(r.data)))} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: '#3a1a1a', color: '#f87171', cursor: 'pointer', fontSize: 12 }}>Delete</button>
                          )}
                        </div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const td = { padding: '13px 14px', fontSize: 13, color: '#d0d8e8' };

export default AdminUsers;