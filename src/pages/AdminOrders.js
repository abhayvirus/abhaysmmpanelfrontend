import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { adminGetAllOrders } from '../api';

const statusColors = { pending: '#f39c12', processing: '#3498db', active: '#9b59b6', completed: '#2ecc71', cancelled: '#e74c3c', failed: '#e74c3c' };

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  useEffect(() => { adminGetAllOrders().then(r => setOrders(r.data)).catch(console.error); }, []);

  const filtered = orders.filter(o =>
    (status === 'All' || o.status === status) &&
    (o.user_name?.toLowerCase().includes(search.toLowerCase()) || o.service_name?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex' }}>
      <AdminSidebar />
      <div style={{ marginLeft: 220, minHeight: '100vh', background: '#0d1520', color: '#fff', padding: '32px 40px', width: '100%' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 28 }}>All Orders</h1>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: 10, background: '#1a2535', border: '1px solid #2d3a50', color: '#fff', fontSize: 14, width: 280, outline: 'none' }} />
          {['All', 'pending', 'processing', 'completed', 'cancelled', 'failed'].map(s => (
            <button key={s} onClick={() => setStatus(s)}
              style={{ padding: '8px 16px', borderRadius: 50, border: 'none', cursor: 'pointer', fontSize: 12, background: status === s ? '#6c63ff' : '#1a2535', color: '#fff' }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e2a3a' }}>
                {['ID', 'User', 'Service', 'Link', 'Qty', 'Price', 'Status', 'API ID', 'Date'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#8ca0b8', fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid #1e2a3a' }}>
                  <td style={td}>#{o.id}</td>
                  <td style={td}><div>{o.user_name}</div><div style={{ fontSize: 11, color: '#8ca0b8' }}>{o.user_email}</div></td>
                  <td style={{ ...td, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>{o.service_name}</td>
                  <td style={{ ...td, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <a href={o.link} target="_blank" rel="noreferrer" style={{ color: '#6c63ff', fontSize: 12, textDecoration: 'none' }}>{o.link}</a>
                  </td>
                  <td style={td}>{o.quantity?.toLocaleString()}</td>
                  <td style={{ ...td, color: '#6c63ff', fontWeight: 700 }}>₹{parseFloat(o.price).toFixed(2)}</td>
                  <td style={td}>
                    <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${statusColors[o.status]}22`, color: statusColors[o.status] }}>
                      {o.status?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ ...td, fontSize: 11, color: '#8ca0b8' }}>{o.api_order_id || '-'}</td>
                  <td style={{ ...td, fontSize: 11, color: '#8ca0b8' }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const td = { padding: '12px 12px', fontSize: 13, color: '#d0d8e8' };

export default AdminOrders;