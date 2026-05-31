import React, { useEffect, useState } from 'react';
import { BRAND } from '../config/brand';
import { resolveSiteLogoUrl } from '../utils/resolveSiteLogoUrl';

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
 * Brand logo — uses public/logo.png by default (premium circular badge).
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

  const [imgSrc, setImgSrc] = useState(() => resolveSiteLogoUrl(siteLogo));

  useEffect(() => {
    setImgSrc(resolveSiteLogoUrl(siteLogo));
  }, [siteLogo]);

  const handleError = (e) => {
    const target = e.currentTarget;
    if (target.src.endsWith(LOGO_PNG) || target.src.includes('logo.png')) {
      if (!target.src.endsWith(LOGO_SVG)) setImgSrc(LOGO_SVG);
      return;
    }
    if (!target.src.endsWith(LOGO_PNG)) setImgSrc(LOGO_PNG);
  };

  return (
    <span className={`brand-logo-wrap${showText ? '' : ' brand-logo-wrap--icon-only'} ${className}`}>
      <img
        src={imgSrc}
        alt={alt}
        className="brand-logo-circle"
        width={px}
        height={px}
        loading={size === 'hero' ? 'eager' : 'lazy'}
        decoding="async"
        onError={handleError}
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
export { LOGO_PNG, LOGO_SVG, SIZES };
