import React from 'react';
import BrandLogo from './BrandLogo';
import { useSettings } from '../contexts/SettingsContext';

const MobileHeader = ({ title, onMenuClick, balance, sym = '₹' }) => {
  const { settings } = useSettings();

  return (
    <header className="mobile-header">
      <button type="button" className="mobile-header-btn" onClick={onMenuClick} aria-label="Open menu">
        <span className="hamburger" aria-hidden="true">
          <span /><span /><span />
        </span>
      </button>
      <div className="mobile-header-brand">
        {title ? (
          <span className="mobile-header-title">{title}</span>
        ) : (
          <BrandLogo size="xs" showText={false} siteLogo={settings.site_logo} />
        )}
      </div>
      {balance != null && (
        <div className="mobile-header-balance">
          {sym}{parseFloat(balance).toFixed(2)}
        </div>
      )}
    </header>
  );
};

export default MobileHeader;
