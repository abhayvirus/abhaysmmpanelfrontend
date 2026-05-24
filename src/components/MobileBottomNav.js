import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const MobileBottomNav = ({ onMoreClick }) => {
  const location = useLocation();
  const { t } = useLanguage();

  const items = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: '⚡' },
    { to: '/services', label: t('nav.services'), icon: '📋' },
    { to: '/add-funds', label: t('nav.funds'), icon: '💳' },
    { to: '/orders', label: t('nav.orders'), icon: '📦' },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Main navigation">
      {items.map((item) => {
        const active = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`mobile-bottom-nav-item${active ? ' active' : ''}`}
          >
            <span className="mobile-bottom-nav-icon" aria-hidden="true">{item.icon}</span>
            <span className="mobile-bottom-nav-label">{item.label}</span>
          </Link>
        );
      })}
      <button type="button" className="mobile-bottom-nav-item" onClick={onMoreClick} aria-label="More menu">
        <span className="mobile-bottom-nav-icon" aria-hidden="true">☰</span>
        <span className="mobile-bottom-nav-label">More</span>
      </button>
    </nav>
  );
};

export default MobileBottomNav;
