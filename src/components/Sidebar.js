import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUnreadCount, API_BASE } from '../api';
import { useSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';

const Sidebar = ({ user: propUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { t } = useLanguage();
  const user = propUser || JSON.parse(localStorage.getItem('user') || '{}');
  const [unread, setUnread] = useState(0);
  const sym = settings.currency_symbol || '₹';
  const logoUrl = settings.site_logo ? `${API_BASE}${settings.site_logo}` : null;

  React.useEffect(() => {
    getUnreadCount().then((r) => setUnread(r.data.count)).catch(() => {});
  }, [location.pathname]);

  const logout = async () => {
    try {
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('../firebase');
      await signOut(auth);
    } catch (_) { /* optional */ }
    localStorage.clear();
    navigate('/login');
  };

  const links = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: '⚡' },
    { to: '/services', label: t('nav.services'), icon: '📋' },
    { to: '/orders', label: t('nav.orders'), icon: '📦' },
    { to: '/add-funds', label: t('nav.funds'), icon: '💳' },
    { to: '/tickets', label: t('nav.support'), icon: '🎫' },
    { to: '/notifications', label: t('nav.notifications'), icon: '🔔', badge: unread },
    { to: '/referrals', label: t('nav.referrals'), icon: '🎁' },
    { to: '/api-docs', label: 'API Docs', icon: '🔌' },
    { to: '/child-panel', label: 'Child Panel', icon: '🌐' },
    { to: '/download-app', label: t('nav.download'), icon: '📱' },
  ];

  return (
    <aside className="sidebar" style={styles.sidebar}>
      <div style={styles.brand}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          {logoUrl ? (
            <img src={logoUrl} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 28 }}>⚡</span>
          )}
          <span style={styles.logo}>{settings.site_name || 'SMM Panel'}</span>
        </div>
        <div style={styles.balance}>{sym}{parseFloat(user.balance || 0).toFixed(2)}</div>
      </div>
      <nav style={styles.nav}>
        {links.map((l) => (
          <Link key={l.to} to={l.to} style={{
            ...styles.link,
            ...(location.pathname === l.to ? styles.active : {}),
          }}>
            <span>{l.icon}</span> {l.label}
            {l.badge > 0 && <span style={styles.badge}>{l.badge}</span>}
          </Link>
        ))}
      </nav>
      {(settings.telegram_link || settings.whatsapp_link) && (
        <div style={{ padding: '0 12px', display: 'flex', gap: 8, marginBottom: 8 }}>
          {settings.telegram_link && <a href={settings.telegram_link} target="_blank" rel="noreferrer" style={social}>TG</a>}
          {settings.whatsapp_link && <a href={settings.whatsapp_link} target="_blank" rel="noreferrer" style={social}>WA</a>}
        </div>
      )}
      <div style={{ padding: '8px 12px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
      {user.role === 'admin' && (
        <Link to="/admin" style={{ ...styles.link, margin: '8px 12px', color: 'var(--accent)' }}>👑 Admin</Link>
      )}
      <button onClick={logout} className="btn btn-danger btn-sm" style={{ margin: 12 }}>Logout</button>
    </aside>
  );
};

const social = {
  flex: 1, textAlign: 'center', padding: '8px', borderRadius: 8,
  background: 'var(--bg-hover)', color: 'var(--primary)', fontSize: 12, fontWeight: 700, textDecoration: 'none',
};

const styles = {
  sidebar: {
    width: 'var(--sidebar-w)', minHeight: '100vh', background: 'var(--bg-card)',
    borderRight: '1px solid var(--border)', position: 'fixed', left: 0, top: 0,
    display: 'flex', flexDirection: 'column', zIndex: 100,
  },
  brand: { padding: '24px 20px', borderBottom: '1px solid var(--border)' },
  logo: { fontSize: 17, fontWeight: 800 },
  balance: { fontSize: 14, color: 'var(--primary)', fontWeight: 700 },
  nav: { flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4 },
  link: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 10,
    color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14, fontWeight: 500,
  },
  active: { background: 'var(--bg-hover)', color: 'var(--text)' },
  badge: {
    marginLeft: 'auto', background: 'var(--danger)', color: '#fff', fontSize: 11,
    padding: '2px 7px', borderRadius: 10,
  },
};

export default Sidebar;
