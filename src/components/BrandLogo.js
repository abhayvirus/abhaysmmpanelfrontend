import React, { useState } from 'react';
import { API_BASE } from '../api';
import { BRAND } from '../config/brand';

const LOGO_PNG = `${process.env.PUBLIC_URL}${BRAND.logo}`;
const LOGO_SVG = `${process.env.PUBLIC_URL}${BRAND.logoSvg}`;

const SIZES = {
  xs: 32,
  sm: 40,
  md: 56,
  lg: 80,
  xl: 120,
  hero: 140,
};

/**
 * Circular brand logo — logo.png (photo) + logo.svg (vector icon fallback)
 */
const BrandLogo = ({
  size = 'md',
  showText = true,
  showSubtitle = false,
  siteLogo = '',
  className = '',
  alt = 'ABHAYSMM PANEL',
  preferSvg = false,
}) => {
  const px = typeof size === 'number' ? size : (SIZES[size] || SIZES.md);
  const [imgSrc, setImgSrc] = useState(() => {
    if (siteLogo) return `${API_BASE}${siteLogo}`;
    return preferSvg ? LOGO_SVG : LOGO_PNG;
  });

  const handleError = (e) => {
    const target = e.currentTarget;
    if (siteLogo) {
      if (target.src.includes(LOGO_PNG) || target.src.includes(siteLogo)) {
        setImgSrc(LOGO_SVG);
      } else if (!target.src.endsWith(LOGO_PNG)) {
        setImgSrc(LOGO_PNG);
      }
      return;
    }
    if (!target.src.endsWith(LOGO_SVG)) {
      setImgSrc(LOGO_SVG);
    } else if (!target.src.endsWith(LOGO_PNG)) {
      setImgSrc(LOGO_PNG);
    }
  };

  return (
    <span className={`brand-logo-wrap${showText ? '' : ' brand-logo-wrap--icon-only'} ${className}`}>
      <picture>
        {!siteLogo && (
          <source srcSet={LOGO_SVG} type="image/svg+xml" />
        )}
        <img
          src={imgSrc}
          alt={alt}
          className="brand-logo-circle"
          width={px}
          height={px}
          loading="lazy"
          decoding="async"
          onError={handleError}
        />
      </picture>
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
export { LOGO_PNG, LOGO_SVG, SIZES };
