import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import BrandLogo from './BrandLogo';

const PublicNav = () => {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('token')));
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
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

  useEffect(() => {
    document.body.classList.add('has-public-nav');
    const el = navRef.current;
    if (!el) {
      return () => document.body.classList.remove('has-public-nav');
    }

    const syncHeight = () => {
      document.documentElement.style.setProperty('--public-nav-h', `${el.offsetHeight}px`);
    };

    syncHeight();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncHeight) : null;
    ro?.observe(el);
    window.addEventListener('resize', syncHeight);

    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', syncHeight);
      document.body.classList.remove('has-public-nav');
      document.documentElement.style.removeProperty('--public-nav-h');
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        ref={navRef}
        className={`nav-public${scrolled ? ' nav-public--scrolled' : ''}`}
      >
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
