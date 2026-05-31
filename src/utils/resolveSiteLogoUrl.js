import { API_BASE } from '../config/env';
import { BRAND } from '../config/brand';

/** Resolve site_logo setting to a full image URL (public logo.png or uploaded file). */
export function resolveSiteLogoUrl(siteLogo = '') {
  const s = String(siteLogo || '').trim();
  const publicUrl = process.env.PUBLIC_URL || '';

  if (!s) return `${publicUrl}${BRAND.logo}`;

  if (s.startsWith('http') || s.startsWith('data:')) return s;

  if (s === '/logo.png' || s === BRAND.logo || s === '/logo.svg') {
    return `${publicUrl}${s.startsWith('/') ? s : `/${s}`}`;
  }

  if (s.startsWith('/uploads/')) {
    return `${String(API_BASE).replace(/\/$/, '')}${s}`;
  }

  if (s.startsWith('/')) {
    return `${publicUrl}${s}`;
  }

  return `${API_BASE}${s}`;
}

export default resolveSiteLogoUrl;
