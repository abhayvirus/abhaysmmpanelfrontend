import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearAuthSession } from '../utils/authRedirect';
import { isNavActive } from '../utils/navActive';

const AdminSidebar = ({ mobileOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { to: '/admin', label: 'Dashboard', icon: '📊' },
    { to: '/admin/users', label: 'Users', icon: '👥' },
    { to: '/admin/services', label: 'Services', icon: '📋' },
    { to: '/admin/categories', label: 'Categories', icon: '🏷️' },
    { to: '/admin/orders', label: 'Orders', icon: '📦' },
    { to: '/admin/website-dev', label: 'Website Orders', icon: '🌐' },
    { to: '/admin/funds', label: 'Payments', icon: '💰' },
    { to: '/admin/tickets', label: 'Tickets', icon: '🎫' },
    { to: '/admin/announcements', label: 'Announcements', icon: '📢' },
    { to: '/admin/child-panels', label: 'Child Panels', icon: '🌐' },
    { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { to: '/admin/coupons', label: 'Coupons', icon: '🏷️' },
    { to: '/admin/chat', label: 'Support Inbox', icon: '💬' },
    { to: '/admin/activity-logs', label: 'Activity Logs', icon: '📜' },
    { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
    { to: '/admin/help', label: 'Help Guide', icon: '📖' },
  ];

  const pathRef = React.useRef(location.pathname);
  React.useEffect(() => {
    if (pathRef.current !== location.pathname) {
      pathRef.current = location.pathname;
      onClose?.();
    }
  }, [location.pathname, onClose]);

  const logout = async () => {
    try {
      const { isFirebaseConfigured, getFirebaseAuth } = await import('../firebase');
      if (isFirebaseConfigured()) {
        const { signOut } = await import('firebase/auth');
        const auth = getFirebaseAuth();
        if (auth) await signOut(auth);
      }
    } catch (_) { /* optional */ }
    clearAuthSession();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <button
        type="button"
        className={`sidebar-overlay${mobileOpen ? ' visible' : ''}`}
        onClick={onClose}
        aria-label="Close menu"
      />
      <aside className={`admin-sidebar${mobileOpen ? ' open' : ''}`}>
        <div className="admin-sidebar-brand">
          <span style={{ fontSize: 18, fontWeight: 800 }}>👑 ABHAYSMM Admin</span>
          <button type="button" className="sidebar-close-mobile" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <nav className="admin-sidebar-nav">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`admin-sidebar-link${isNavActive(location.pathname, l.to) ? ' active' : ''}`}
            >
              <span aria-hidden="true">{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/dashboard" className="sidebar-footer-profile admin-sidebar-user-link" onClick={onClose}>
            <span aria-hidden="true">←</span>
            User Panel
          </Link>
          <button type="button" className="logout-btn admin-sidebar-logout" onClick={logout}>
            <span aria-hidden="true">🚪</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
