import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { adminGetStats } from '../api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0, totalOrders: 0, totalRevenue: 0, pendingFunds: 0
  });

  useEffect(() => {
    adminGetStats().then(r => setStats(r.data)).catch(console.error);
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#6c63ff' },
    { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: '#3498db' },
    { label: 'Total Revenue', value: `₹${parseFloat(stats.totalRevenue || 0).toFixed(2)}`, icon: '💰', color: '#2ecc71' },
    { label: 'Pending Funds', value: stats.pendingFunds, icon: '⏳', color: '#f39c12' },
  ];

  return (
    <div style={{ display: 'flex' }}>
      <AdminSidebar />
      <div style={styles.main}>
        <h1 style={styles.title}>Admin Dashboard</h1>

        <div style={styles.grid}>
          {cards.map((c, i) => (
            <div key={i} style={{ ...styles.card, borderColor: c.color + '40' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{c.icon}</div>
              <p style={styles.cardLabel}>{c.label}</p>
              <p style={{ ...styles.cardValue, color: c.color }}>{c.value}</p>
            </div>
          ))}
        </div>

        <div style={styles.actionsBox}>
          <h3 style={{ marginBottom: 16, fontSize: 18 }}>⚡ Quick Actions</h3>
          {[
            { href: '/admin/services', label: '🔄 Services Sync karo & Price set karo', desc: 'TheWorldSMM se services fetch karo' },
            { href: '/admin/funds', label: '💰 Fund Requests approve karo', desc: `${stats.pendingFunds} pending requests` },
            { href: '/admin/users', label: '👥 Users manage karo', desc: 'Balance add karo, ban karo' },
            { href: '/admin/orders', label: '📦 Sab orders dekho', desc: 'Order status check karo' },
          ].map(a => (
            <a key={a.href} href={a.href} style={styles.actionLink}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{a.label}</div>
                <div style={{ fontSize: 12, color: '#8ca0b8' }}>{a.desc}</div>
              </div>
              <span style={{ color: '#6c63ff' }}>→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  main: { marginLeft: 240, minHeight: '100vh', background: '#0d1520', color: '#fff', padding: '32px 40px', width: 'calc(100% - 240px)' },
  title: { fontSize: 28, fontWeight: 800, marginBottom: 32 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 40 },
  card: { background: '#1a2535', borderRadius: 16, padding: 24, border: '1px solid' },
  cardLabel: { color: '#8ca0b8', fontSize: 13, marginBottom: 6 },
  cardValue: { fontSize: 30, fontWeight: 800 },
  actionsBox: { background: '#1a2535', borderRadius: 16, padding: 24, border: '1px solid #1e2a3a', maxWidth: 560 },
  actionLink: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: 10, background: '#0d1520', color: '#fff', textDecoration: 'none', border: '1px solid #1e2a3a', marginBottom: 10, fontSize: 14 },
};

export default AdminDashboard;