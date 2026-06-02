import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from './AdminSidebar';
import { useMedia } from '../hooks/useMedia';
import { adminGetSettings } from '../api';
import { parseAdminNavJson } from '../utils/adminNav';

const AdminLayout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navSettings, setNavSettings] = useState(null);
  const { isMobile } = useMedia();

  const loadNavSettings = useCallback(() => {
    adminGetSettings()
      .then((r) => {
        const data = r.data || {};
        setNavSettings({
          admin_sidebar_hidden: parseAdminNavJson(data.admin_sidebar_hidden),
          admin_sidebar_custom: parseAdminNavJson(data.admin_sidebar_custom),
        });
      })
      .catch(() => setNavSettings({ admin_sidebar_hidden: [], admin_sidebar_custom: [] }));
  }, []);

  useEffect(() => {
    loadNavSettings();
    const onNavUpdated = () => loadNavSettings();
    window.addEventListener('admin-nav-updated', onNavUpdated);
    return () => window.removeEventListener('admin-nav-updated', onNavUpdated);
  }, [loadNavSettings]);

  useEffect(() => {
    document.body.classList.toggle('mobile-menu-open', menuOpen && isMobile);
    return () => document.body.classList.remove('mobile-menu-open');
  }, [menuOpen, isMobile]);

  return (
    <div className="layout admin-layout">
      {isMobile && (
        <header className="mobile-header admin-mobile-header">
          <button
            type="button"
            className="mobile-header-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open admin menu"
          >
            <span className="hamburger"><span /><span /><span /></span>
          </button>
          <div className="admin-mobile-header-brand">
            <span className="admin-mobile-header-eyebrow">ABHAYSMM</span>
            <span className="admin-mobile-header-title">👑 Admin Panel</span>
          </div>
        </header>
      )}
      <AdminSidebar
        mobileOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        navSettings={navSettings}
      />
      <div className={`main admin-main fade-in${isMobile ? ' has-mobile-chrome' : ''}`}>
        <div className="admin-panel-scroll">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
