import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { adminGetAllOrders } from '../api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  useEffect(() => {
    adminGetAllOrders().then((r) => setOrders(r.data)).catch(console.error);
  }, []);

  const filtered = orders.filter((o) =>
    (status === 'All' || o.status === status)
    && (`${o.user_name} ${o.service_name} ${o.id}`.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 24 }}>All Orders</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input className="input" placeholder="Search user, service, ID..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        {['All', 'pending', 'processing', 'active', 'completed', 'cancelled', 'failed'].map((s) => (
          <button key={s} type="button" className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatus(s)}>
            {s}
          </button>
        ))}
      </div>
      <div className="table-wrap card">
        <table className="table">
          <thead>
            <tr>
              {['ID', 'User', 'Service', 'Link', 'Qty', 'Price', 'Status', 'API ID', 'Date'].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.user_name}</td>
                <td style={{ maxWidth: 140 }}>{o.service_name}</td>
                <td style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.link}</td>
                <td>{o.quantity}</td>
                <td>₹{parseFloat(o.price || 0).toFixed(2)}</td>
                <td><span className="badge badge-info">{o.status}</span></td>
                <td style={{ fontSize: 11 }}>{o.api_order_id || '—'}</td>
                <td style={{ fontSize: 12 }}>{new Date(o.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No orders</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
