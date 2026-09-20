import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { isNavActive } from '../utils/navActive';

/**
 * Mobile bottom nav — 5 unique destinations (no duplicate menu opener).
 * Sidebar opens only from the top header hamburger.
 */
const MobileBottomNav = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const items = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: '⚡' },
    { to: '/services', label: t('nav.services'), icon: '📋' },
    { to: '/add-funds', label: t('nav.funds'), icon: '💳' },
    { to: '/orders', label: t('nav.orders'), icon: '📦' },
    { to: '/profile', label: t('nav.profile') || 'Profile', icon: '⚙️' },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Main navigation">
      {items.map((item) => {
        const active = isNavActive(location.pathname, item.to);
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
    </nav>
  );
};

export default MobileBottomNav;
