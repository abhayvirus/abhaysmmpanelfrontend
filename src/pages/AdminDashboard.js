import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import AdminResponsiveTable from '../components/AdminResponsiveTable';
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

  const recentColumns = [
    { key: 'id', label: 'Order ID', render: (o) => `#${o.id}` },
    { key: 'user_name', label: 'User' },
    { key: 'service_name', label: 'Service' },
    { key: 'price', label: 'Amount', render: (o) => `₹${parseFloat(o.price).toFixed(2)}` },
    {
      key: 'status',
      label: 'Status',
      highlight: true,
      render: (o) => <span className="badge badge-info">{o.status}</span>,
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (o) => (o.created_at ? new Date(o.created_at).toLocaleString() : '—'),
    },
  ];

  return (
    <AdminLayout>
      <div className="admin-dashboard-page">
        <h1 className="admin-page-title">👑 {BRAND.name} — Admin</h1>
        <p className="admin-page-sub">{BRAND.domain}</p>

        <div className="stats-grid admin-stats-grid">
          {cards.map((c) => (
            <div key={c.label} className="stat-card admin-stat-card">
              <div className="admin-stat-icon" aria-hidden="true">{c.icon}</div>
              <div className="stat-value">{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="responsive-grid-2">
          <div className="card admin-recent-orders-card">
            <h3 style={{ marginBottom: 16 }}>Recent orders</h3>
            <AdminResponsiveTable
              columns={recentColumns}
              rows={stats.recentOrders || []}
              emptyMessage="No orders yet"
            />
          </div>

          <div className="card admin-quick-actions-card">
            <h3 style={{ marginBottom: 16 }}>Quick actions</h3>
            <div className="admin-quick-actions">
              {[
                { to: '/admin/services', label: 'Sync services & pricing', icon: '🔄' },
                { to: '/admin/funds', label: `Approve payments (${stats.pendingFunds} pending)`, icon: '💰' },
                { to: '/admin/users', label: 'Manage users', icon: '👥' },
                { to: '/admin/settings', label: 'Website & API settings', icon: '⚙️' },
                { to: '/admin/chat', label: 'Live chat inbox', icon: '💬' },
              ].map((a) => (
                <Link key={a.to} to={a.to} className="btn btn-ghost">
                  <span>{a.icon} {a.label}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
