import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import { useMedia } from '../hooks/useMedia';

const AdminLayout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isMobile } = useMedia();

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
          <span className="mobile-header-title">👑 Admin</span>
          <span className="mobile-header-balance" style={{ fontSize: 12 }}>ABHAYSMM</span>
        </header>
      )}
      <AdminSidebar mobileOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className={`main admin-main fade-in${isMobile ? ' has-mobile-chrome' : ''}`}>{children}</div>
    </div>
  );
};

export default AdminLayout;
