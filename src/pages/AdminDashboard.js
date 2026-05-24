import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { adminGetStats } from '../api';
import { BRAND } from '../config/brand';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0, totalOrders: 0, totalRevenue: 0, pendingFunds: 0, todayOrders: 0, recentOrders: [],
  });

  useEffect(() => {
    adminGetStats().then((r) => setStats(r.data)).catch(console.error);
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
    { label: 'Total Orders', value: stats.totalOrders, icon: '📦' },
    { label: 'Revenue', value: `₹${parseFloat(stats.totalRevenue || 0).toFixed(2)}`, icon: '💰' },
    { label: 'Pending Payments', value: stats.pendingFunds, icon: '⏳' },
    { label: 'Today Orders', value: stats.todayOrders || 0, icon: '📈' },
  ];

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 4 }}>👑 {BRAND.name} — Admin</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>{BRAND.domain}</p>

      <div className="stats-grid" style={{ marginBottom: 32 }}>
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
            <div className="stat-value" style={{ fontSize: 22 }}>{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="responsive-grid-2">
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Recent orders</h3>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>ID</th><th>User</th><th>Service</th><th>₹</th><th>Status</th></tr>
              </thead>
              <tbody>
                {(stats.recentOrders || []).map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.user_name}</td>
                    <td style={{ maxWidth: 120 }}>{o.service_name}</td>
                    <td>{parseFloat(o.price).toFixed(2)}</td>
                    <td><span className={`badge badge-info`}>{o.status}</span></td>
                  </tr>
                ))}
                {!stats.recentOrders?.length && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Quick actions</h3>
          {[
            { to: '/admin/services', label: 'Sync services & pricing', icon: '🔄' },
            { to: '/admin/funds', label: `Approve payments (${stats.pendingFunds} pending)`, icon: '💰' },
            { to: '/admin/users', label: 'Manage users', icon: '👥' },
            { to: '/admin/settings', label: 'Website & API settings', icon: '⚙️' },
            { to: '/admin/chat', label: 'Live chat inbox', icon: '💬' },
          ].map((a) => (
            <Link key={a.to} to={a.to} className="btn btn-ghost" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
              <span>{a.icon} {a.label}</span>
              <span>→</span>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
