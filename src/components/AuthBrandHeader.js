import React from 'react';
import BrandLogo from './BrandLogo';
import { useSettings } from '../contexts/SettingsContext';
import { BRAND } from '../config/brand';

/** Centered circular logo + title for login / signup */
const AuthBrandHeader = () => {
  const { settings } = useSettings();

  return (
    <div className="auth-brand-header">
      <BrandLogo size={88} showText={false} siteLogo={settings.site_logo} className="auth-brand-logo" />
      <h1 className="auth-brand-title">{settings.site_name || BRAND.name}</h1>
      <p className="auth-brand-tagline">{BRAND.shortName} · Premium SMM Panel</p>
    </div>
  );
};

export default AuthBrandHeader;
