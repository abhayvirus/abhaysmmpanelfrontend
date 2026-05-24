import React from 'react';
import { API_BASE } from '../api';

const DEFAULT_LOGO = `${process.env.PUBLIC_URL}/logo.png`;

const SIZES = {
  xs: 32,
  sm: 40,
  md: 56,
  lg: 80,
  xl: 120,
  hero: 140,
};

/**
 * Circular brand logo — uses /logo.png or admin-uploaded site_logo
 */
const BrandLogo = ({
  size = 'md',
  showText = true,
  showSubtitle = false,
  siteLogo = '',
  className = '',
  alt = 'ABHAYSMM PANEL',
}) => {
  const px = typeof size === 'number' ? size : (SIZES[size] || SIZES.md);
  const src = siteLogo ? `${API_BASE}${siteLogo}` : DEFAULT_LOGO;

  return (
    <span className={`brand-logo-wrap${showText ? '' : ' brand-logo-wrap--icon-only'} ${className}`}>
      <img
        src={src}
        alt={alt}
        className="brand-logo-circle"
        width={px}
        height={px}
        loading="lazy"
        onError={(e) => {
          if (e.target.src !== DEFAULT_LOGO) e.target.src = DEFAULT_LOGO;
        }}
      />
      {showText && (
        <span className="brand-logo-text">
          <span className="brand-logo-title">ABHAYSMM</span>
          {showSubtitle && <span className="brand-logo-sub">PANEL</span>}
        </span>
      )}
    </span>
  );
};

export default BrandLogo;
export { DEFAULT_LOGO, SIZES };
