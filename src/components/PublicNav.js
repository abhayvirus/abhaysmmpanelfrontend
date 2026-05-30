import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import BrandLogo from './BrandLogo';

const PublicNav = () => {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('token')));
  const { settings } = useSettings();
  const close = () => setOpen(false);

  useEffect(() => {
    document.body.classList.toggle('public-nav-open', open);
    return () => document.body.classList.remove('public-nav-open');
  }, [open]);

  useEffect(() => {
    const syncAuth = () => setIsLoggedIn(Boolean(localStorage.getItem('token')));
    syncAuth();
    window.addEventListener('storage', syncAuth);
    window.addEventListener('focus', syncAuth);
    window.addEventListener('pageshow', syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('focus', syncAuth);
      window.removeEventListener('pageshow', syncAuth);
    };
  }, []);

  return (
    <>
      <header className="nav-public">
        <Link to="/" className="nav-public-brand" onClick={close}>
          <BrandLogo size="sm" showSubtitle siteLogo={settings.site_logo} className="nav-brand-logo" />
        </Link>
        <div className="nav-public-actions-desktop">
          {isLoggedIn ? (
            <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/signup" className="btn btn-primary">Get Started</Link>
            </>
          )}
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
      </header>

      {open && (
        <div className="nav-mobile-screen" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="nav-mobile-screen-inner">
            <div className="nav-mobile-top">
              <BrandLogo size="sm" showSubtitle siteLogo={settings.site_logo} className="nav-brand-logo" />
              <button type="button" className="nav-drawer-close" onClick={close} aria-label="Close menu">
                ✕
              </button>
            </div>
            <nav className="nav-mobile-links">
              {isLoggedIn ? (
                <Link to="/dashboard" className="btn btn-primary nav-drawer-btn" onClick={close}>Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="btn btn-ghost nav-drawer-btn" onClick={close}>Login</Link>
                  <Link to="/signup" className="btn btn-primary nav-drawer-btn" onClick={close}>Get Started</Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default PublicNav;
