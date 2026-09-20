import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import PublicNav from './PublicNav';
import LandingFooter from './landing/LandingFooter';

/** Shared chrome for public marketing / docs / legal pages */
const PublicPageShell = ({ children, className = '' }) => {
  const { settings } = useSettings();

  return (
    <div className={`public-page-shell ${className}`.trim()}>
      <PublicNav />
      <main className="public-page-shell__main">{children}</main>
      <LandingFooter settings={settings} />
    </div>
  );
};

export default PublicPageShell;
