import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import AnnouncementPopup from './AnnouncementPopup';
import { getMe } from '../api';
import { useMedia } from '../hooks/useMedia';
import { useSettings } from '../contexts/SettingsContext';

const UserLayout = ({ children, title }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [menuOpen, setMenuOpen] = useState(false);
  const { isMobile } = useMedia();
  const { settings } = useSettings();
  const sym = settings.currency_symbol || '₹';

  useEffect(() => {
    getMe().then((res) => {
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
    }).catch(() => {});
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
      <main className={`main page-main${isMobile ? ' has-mobile-chrome' : ''}`}>{children}</main>
      {isMobile && <MobileBottomNav onMoreClick={() => setMenuOpen(true)} />}
      <AnnouncementPopup />
    </div>
  );
};

export default UserLayout;
