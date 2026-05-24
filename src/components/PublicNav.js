import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import BrandLogo from './BrandLogo';

const PublicNav = () => {
  const [open, setOpen] = useState(false);
  const { settings } = useSettings();
  const close = () => setOpen(false);

  return (
    <>
      <nav className="nav-public">
        <Link to="/" className="nav-public-brand" onClick={close}>
          <BrandLogo size="sm" showSubtitle siteLogo={settings.site_logo} className="nav-brand-logo" />
        </Link>
        <div className="nav-public-actions-desktop">
          <Link to="/login" className="btn btn-ghost">Login</Link>
          <Link to="/signup" className="btn btn-primary">Get Started</Link>
        </div>
        <button
          type="button"
          className="nav-public-menu-btn"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <span className={`hamburger${open ? ' open' : ''}`}>
            <span /><span /><span />
          </span>
        </button>
      </nav>

      <div className={`nav-public-drawer${open ? ' open' : ''}`}>
        <Link to="/login" className="btn btn-ghost" style={{ width: '100%' }} onClick={close}>Login</Link>
        <Link to="/signup" className="btn btn-primary" style={{ width: '100%' }} onClick={close}>Get Started</Link>
        <Link to="/download-app" className="btn btn-ghost" style={{ width: '100%' }} onClick={close}>📱 Download App</Link>
      </div>
      {open && <button type="button" className="sidebar-overlay visible" onClick={close} aria-label="Close menu" />}
    </>
  );
};

export default PublicNav;
