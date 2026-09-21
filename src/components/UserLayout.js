import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import AnnouncementPopup from './AnnouncementPopup';
import { getMe } from '../api';
import { useMedia } from '../hooks/useMedia';
import { useSettings } from '../contexts/SettingsContext';
import { normalizeUser } from '../utils/roles';

const UserLayout = ({ children, title }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [menuOpen, setMenuOpen] = useState(false);
  const { isMobile } = useMedia();
  const { settings } = useSettings();
  const sym = settings.currency_symbol || '₹';

  useEffect(() => {
    getMe().then((res) => {
      const next = normalizeUser(res.data);
      localStorage.setItem('user', JSON.stringify(next));
      setUser(next);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const syncUser = () => {
      try {
        setUser(normalizeUser(JSON.parse(localStorage.getItem('user') || '{}')));
      } catch (_) { /* ignore */ }
      getMe().then((res) => {
        const next = normalizeUser(res.data);
        localStorage.setItem('user', JSON.stringify(next));
        setUser(next);
      }).catch(() => {});
    };
    window.addEventListener('auth-user-updated', syncUser);
    window.addEventListener('focus', syncUser);
    return () => {
      window.removeEventListener('auth-user-updated', syncUser);
      window.removeEventListener('focus', syncUser);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('mobile-menu-open', menuOpen && isMobile);
    return () => document.body.classList.remove('mobile-menu-open');
  }, [menuOpen, isMobile]);

  return (
    <div className="layout fade-in">
      {isMobile && (
        <MobileHeader
          title={title}
          balance={user.balance}
          sym={sym}
          onMenuClick={() => setMenuOpen(true)}
        />
      )}
      <Sidebar user={user} mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className={`main page-main${isMobile ? ' has-mobile-chrome' : ''}`}>
        <div className="user-panel-scroll">{children}</div>
      </main>
      {isMobile && <MobileBottomNav />}
      <AnnouncementPopup />
    </div>
  );
};

export default UserLayout;
