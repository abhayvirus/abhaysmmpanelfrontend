import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUnreadCount, getTicketUnreadCount } from '../api';
import { useSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import BrandLogo from './BrandLogo';

const Sidebar = ({ user: propUser, mobileOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { t } = useLanguage();
  const user = propUser || JSON.parse(localStorage.getItem('user') || '{}');
  const [unread, setUnread] = React.useState(0);
  const [ticketUnread, setTicketUnread] = React.useState(0);
  const sym = settings.currency_symbol || '₹';
  const refreshCounts = React.useCallback(() => {
    getUnreadCount().then((r) => setUnread(r.data.count)).catch(() => {});
    getTicketUnreadCount().then((r) => setTicketUnread(r.data.count)).catch(() => {});
  }, []);

  React.useEffect(() => {
    refreshCounts();
    const id = setInterval(refreshCounts, 15000);
    const onUpdate = () => refreshCounts();
    window.addEventListener('notifications-updated', onUpdate);
    return () => {
      clearInterval(id);
      window.removeEventListener('notifications-updated', onUpdate);
    };
  }, [location.pathname, refreshCounts]);

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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const links = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: '⚡' },
    { to: '/services', label: t('nav.services'), icon: '📋' },
    { to: '/orders', label: t('nav.orders'), icon: '📦' },
    { to: '/add-funds', label: t('nav.funds'), icon: '💳' },
    {
      to: '/tickets',
      label: ticketUnread > 0 ? `${t('nav.support')} (${ticketUnread})` : t('nav.support'),
      icon: '🎫',
    },
    { to: '/notifications', label: t('nav.notifications'), icon: '🔔', badge: unread },
    ...(settings.feature_referrals !== false ? [{ to: '/referrals', label: t('nav.referrals'), icon: '🎁' }] : []),
    { to: '/download-app', label: t('nav.downloadApp'), icon: '📱' },
    { to: '/api-docs', label: 'API Docs', icon: '🔌' },
    ...(settings.feature_child_panel !== false ? [{ to: '/child-panel', label: 'Child Panel', icon: '🌐' }] : []),
    { to: '/profile', label: 'Profile', icon: '⚙️' },
  ];

  return (
    <>
      <button
        type="button"
        className={`sidebar-overlay${mobileOpen ? ' visible' : ''}`}
        onClick={onClose}
        aria-label="Close menu"
      />
      <aside className={`sidebar user-sidebar${mobileOpen ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-row">
            <BrandLogo size="sm" showSubtitle siteLogo={settings.site_logo} />
          </div>
          <div className="sidebar-balance">{sym}{parseFloat(user.balance || 0).toFixed(2)}</div>
          <button type="button" className="sidebar-close-mobile" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <nav className="sidebar-nav">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`sidebar-link${
                location.pathname === l.to || (l.to === '/tickets' && location.pathname.startsWith('/tickets/'))
                  ? ' active'
                  : ''
              }`}
            >
              <span aria-hidden="true">{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </nav>

        {(settings.telegram_link || settings.whatsapp_link) && (
          <div className="sidebar-social">
            {settings.telegram_link && <a href={settings.telegram_link} target="_blank" rel="noreferrer">TG</a>}
            {settings.whatsapp_link && <a href={settings.whatsapp_link} target="_blank" rel="noreferrer">WA</a>}
          </div>
        )}

        <div className="sidebar-tools">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>

        {user.role === 'admin' && (
          <Link to="/admin" className="sidebar-link sidebar-admin-link">👑 Admin</Link>
        )}

        <div className="sidebar-footer">
          <button type="button" onClick={logout} className="btn btn-danger btn-sm sidebar-logout">Logout</button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
