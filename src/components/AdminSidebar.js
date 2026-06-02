import React, { useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearAuthSession } from '../utils/authRedirect';
import { isNavActive } from '../utils/navActive';
import { buildAdminNavLinks } from '../utils/adminNav';

const AdminSidebar = ({ mobileOpen = false, onClose, navSettings = null }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const links = useMemo(
    () => buildAdminNavLinks(navSettings || {}),
    [navSettings],
  );

  const pathRef = React.useRef(location.pathname);
  useEffect(() => {
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

  const renderLink = (l) => {
    const isExternal = l.external || /^https?:\/\//i.test(l.to);
    const className = `admin-sidebar-link${!isExternal && isNavActive(location.pathname, l.to) ? ' active' : ''}`;

    if (isExternal) {
      return (
        <a
          key={l.id || l.to}
          href={l.to}
          className={className}
          target={l.openInNewTab !== false ? '_blank' : undefined}
          rel="noopener noreferrer"
          onClick={() => onClose?.()}
        >
          <span aria-hidden="true">{l.icon}</span>
          {l.label}
          <span className="admin-sidebar-link__ext" aria-hidden="true">↗</span>
        </a>
      );
    }

    return (
      <Link key={l.id || l.to} to={l.to} className={className} onClick={onClose}>
        <span aria-hidden="true">{l.icon}</span>
        {l.label}
      </Link>
    );
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
          {links.map((l) => renderLink(l))}
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
