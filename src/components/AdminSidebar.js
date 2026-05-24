import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { to: '/admin', label: 'Dashboard', icon: '📊' },
    { to: '/admin/users', label: 'Users', icon: '👥' },
    { to: '/admin/services', label: 'Services', icon: '📋' },
    { to: '/admin/categories', label: 'Categories', icon: '🏷️' },
    { to: '/admin/orders', label: 'Orders', icon: '📦' },
    { to: '/admin/funds', label: 'Payments', icon: '💰' },
    { to: '/admin/tickets', label: 'Tickets', icon: '🎫' },
    { to: '/admin/announcements', label: 'Announcements', icon: '📢' },
    { to: '/admin/child-panels', label: 'Child Panels', icon: '🌐' },
    { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { to: '/admin/coupons', label: 'Coupons', icon: '🏷️' },
    { to: '/admin/chat', label: 'Live Chat', icon: '💬' },
    { to: '/admin/activity-logs', label: 'Activity Logs', icon: '📜' },
    { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside style={{ width: 'var(--sidebar-w)', minHeight: '100vh', background: 'var(--bg-card)', borderRight: '1px solid var(--border)', position: 'fixed', left: 0, top: 0, zIndex: 100, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 18, fontWeight: 800 }}>👑 Admin Panel</span>
      </div>
      <nav style={{ flex: 1, padding: 12 }}>
        {links.map((l) => (
          <Link key={l.to} to={l.to} style={{
            display: 'flex', gap: 10, padding: '11px 14px', borderRadius: 10, marginBottom: 4,
            textDecoration: 'none', fontSize: 14, fontWeight: 500,
            color: location.pathname === l.to ? '#fff' : 'var(--text-muted)',
            background: location.pathname === l.to ? 'var(--bg-hover)' : 'transparent',
          }}>
            {l.icon} {l.label}
          </Link>
        ))}
      </nav>
      <Link to="/dashboard" style={{ margin: 12, fontSize: 13, color: 'var(--primary)' }}>← User Panel</Link>
      <button className="btn btn-danger btn-sm" style={{ margin: 12 }} onClick={() => { localStorage.clear(); navigate('/login'); }}>Logout</button>
    </aside>
  );
};

export default AdminSidebar;
