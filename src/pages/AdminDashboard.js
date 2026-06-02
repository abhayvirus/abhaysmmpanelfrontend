import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import AdminResponsiveTable from '../components/AdminResponsiveTable';
import { adminGetStats } from '../api';
import { BRAND } from '../config/brand';

const EMPTY_STATS = {
  totalUsers: 0,
  totalOrders: 0,
  totalWalletBalance: 0,
  totalFundsReceived: 0,
  totalDeposits: 0,
  websiteDevRevenue: 0,
  totalOrderRevenue: 0,
  totalRevenue: 0,
  pendingFunds: 0,
  pendingDepositsAmount: 0,
  todayOrders: 0,
  todayDeposits: 0,
  todayOrderRevenue: 0,
  todayWebsiteRevenue: 0,
  weekDeposits: 0,
  websiteOrders: 0,
  recentOrders: [],
  recentPayments: [],
};

const fmt = (n) => `₹${parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const AdminDashboard = () => {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = useCallback(() => {
    setLoading(true);
    setError('');
    adminGetStats()
      .then((r) => {
        setStats({ ...EMPTY_STATS, ...(r.data || {}) });
      })
      .catch((e) => {
        setError(e.response?.data?.message || 'Failed to load dashboard stats');
        setStats(EMPTY_STATS);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const primaryCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', hint: 'Registered accounts' },
    {
      label: 'Funds Received',
      value: fmt(stats.totalFundsReceived),
      icon: '💵',
      hint: `Deposits ${fmt(stats.totalDeposits)} + Website fees ${fmt(stats.websiteDevRevenue)}`,
    },
    {
      label: 'Order Revenue',
      value: fmt(stats.totalOrderRevenue),
      icon: '💰',
      hint: 'Total spent on SMM orders',
    },
    {
      label: 'Total Earnings',
      value: fmt(stats.totalRevenue),
      icon: '📊',
      hint: 'Orders + website development fees',
    },
    {
      label: 'Pending Payments',
      value: stats.pendingFunds,
      icon: '⏳',
      hint: stats.pendingDepositsAmount > 0 ? `${fmt(stats.pendingDepositsAmount)} awaiting approval` : 'No amount pending',
    },
  ];

  const todayCards = [
    { label: 'Today Deposits', value: fmt(stats.todayDeposits), icon: '📥' },
    { label: 'Today Orders', value: stats.todayOrders, icon: '📦' },
    { label: 'Today Order ₹', value: fmt(stats.todayOrderRevenue), icon: '🛒' },
    { label: '7-Day Deposits', value: fmt(stats.weekDeposits), icon: '📅' },
    { label: 'User Wallet Total', value: fmt(stats.totalWalletBalance), icon: '👛' },
  ];

  const recentOrderColumns = [
    { key: 'id', label: 'Order ID', render: (o) => `#${o.id}` },
    { key: 'user_name', label: 'User' },
    { key: 'service_name', label: 'Service', render: (o) => o.service_name || '—' },
    { key: 'price', label: 'Amount', render: (o) => fmt(o.price) },
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

  const recentPaymentColumns = [
    { key: 'id', label: 'ID', render: (p) => `#${p.id}` },
    { key: 'user_name', label: 'User' },
    { key: 'amount', label: 'Amount', render: (p) => fmt(p.amount) },
    {
      key: 'status',
      label: 'Status',
      highlight: true,
      render: (p) => (
        <span className={`badge ${p.status === 'completed' ? 'badge-success' : p.status === 'pending' ? 'badge-warning' : 'badge-info'}`}>
          {p.status}
        </span>
      ),
    },
    {
      key: 'payment_method',
      label: 'Method',
      render: (p) => p.payment_method || p.gateway || '—',
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (p) => (p.created_at ? new Date(p.created_at).toLocaleString() : '—'),
    },
  ];

  return (
    <AdminLayout>
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-page__head">
          <div>
            <h1 className="admin-page-title">👑 {BRAND.name} — Admin</h1>
            <p className="admin-page-sub">{BRAND.domain}</p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={loadStats} disabled={loading}>
            {loading ? 'Refreshing…' : '🔄 Refresh'}
          </button>
        </div>

        {error ? (
          <p className="admin-dashboard-error" role="alert">{error}</p>
        ) : null}

        <section className="admin-dashboard-section" aria-label="Overview">
          <h2 className="admin-dashboard-section__title">Overview</h2>
          <div className="stats-grid admin-stats-grid admin-stats-grid--primary">
            {primaryCards.map((c) => (
              <div key={c.label} className="stat-card admin-stat-card" title={c.hint}>
                <div className="admin-stat-icon" aria-hidden="true">{c.icon}</div>
                <div className="stat-value">{loading ? '…' : c.value}</div>
                <div className="stat-label">{c.label}</div>
                {c.hint ? <p className="admin-stat-hint">{c.hint}</p> : null}
              </div>
            ))}
          </div>
        </section>

        <section className="admin-dashboard-section" aria-label="Today and period">
          <h2 className="admin-dashboard-section__title">Today &amp; wallets</h2>
          <div className="stats-grid admin-stats-grid admin-stats-grid--compact">
            {todayCards.map((c) => (
              <div key={c.label} className="stat-card admin-stat-card admin-stat-card--compact">
                <div className="admin-stat-icon" aria-hidden="true">{c.icon}</div>
                <div className="stat-value">{loading ? '…' : c.value}</div>
                <div className="stat-label">{c.label}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="responsive-grid-2 admin-dashboard-grid">
          <div className="card admin-recent-orders-card">
            <div className="admin-dashboard-card-head">
              <h3>Recent orders</h3>
              <Link to="/admin/orders" className="btn btn-ghost btn-sm">View all →</Link>
            </div>
            <AdminResponsiveTable
              columns={recentOrderColumns}
              rows={stats.recentOrders || []}
              emptyMessage="No orders yet"
            />
          </div>

          <div className="card admin-recent-payments-card">
            <div className="admin-dashboard-card-head">
              <h3>Recent payments</h3>
              <Link to="/admin/funds" className="btn btn-ghost btn-sm">View all →</Link>
            </div>
            <AdminResponsiveTable
              columns={recentPaymentColumns}
              rows={stats.recentPayments || []}
              emptyMessage="No payments yet"
            />
          </div>
        </div>

        <div className="card admin-quick-actions-card admin-dashboard-quick">
          <h3 style={{ marginBottom: 16 }}>Quick actions</h3>
          <div className="admin-quick-actions">
            {[
              { to: '/admin/services', label: 'Sync services & pricing', icon: '🔄' },
              {
                to: '/admin/funds',
                label: `Approve payments (${stats.pendingFunds} pending · ${fmt(stats.pendingDepositsAmount)})`,
                icon: '💰',
              },
              { to: '/admin/users', label: 'Manage users', icon: '👥' },
              { to: '/admin/orders', label: `All orders (${stats.totalOrders})`, icon: '📦' },
              { to: '/admin/website-dev', label: `Website orders (${stats.websiteOrders || 0})`, icon: '🌐' },
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
    </AdminLayout>
  );
};

export default AdminDashboard;
