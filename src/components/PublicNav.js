import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import BrandLogo from './BrandLogo';

const PublicNav = () => {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('token')));
  const [scrolled, setScrolled] = useState(false);
  const [compact, setCompact] = useState(false);
  const navRef = useRef(null);
  const lastScrollY = useRef(0);
  const { settings } = useSettings();
  const close = () => setOpen(false);

  useEffect(() => {
    document.body.classList.toggle('public-nav-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.classList.remove('public-nav-open');
      document.body.style.overflow = '';
    };
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
    const el = navRef.current;
    if (!el) return undefined;
    const syncHeight = () => {
      document.documentElement.style.setProperty('--public-nav-h', `${el.offsetHeight}px`);
    };
    syncHeight();
    const t = setTimeout(syncHeight, 320);
    return () => clearTimeout(t);
  }, [compact, scrolled]);

  useEffect(() => {
    const SCROLL_THRESHOLD = 8;
    const COMPACT_AFTER = 48;

    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > SCROLL_THRESHOLD);

      if (y <= SCROLL_THRESHOLD) {
        setCompact(false);
      } else if (y > lastScrollY.current && y > COMPACT_AFTER) {
        setCompact(true);
      } else if (y < lastScrollY.current) {
        setCompact(false);
      }

      lastScrollY.current = y;
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && open) close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <>
      <header
        ref={navRef}
        className={`nav-public${scrolled ? ' navbar-scrolled nav-public--scrolled' : ''}${compact ? ' nav-public--compact' : ''}${open ? ' nav-public--menu-open' : ''}`}
      >
        <Link to="/" className="nav-public-brand" onClick={close}>
          <BrandLogo size="sm" showSubtitle siteLogo={settings.site_logo} className="nav-brand-logo" />
        </Link>
        <div className="nav-public-actions-desktop">
          <Link to="/how-to-use" className="btn btn-ghost nav-public-guide-link">
            How to Use Guide
          </Link>
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
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="public-mobile-menu"
        >
          <span className="hamburger">
            <span /><span /><span />
          </span>
        </button>
      </header>

      {open
        && createPortal(
          <div
            id="public-mobile-menu"
            className="nav-mobile-screen nav-mobile-screen--open"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="nav-mobile-screen-inner">
              <div className="nav-mobile-top">
                <Link to="/" className="nav-mobile-brand" onClick={close}>
                  <BrandLogo size="sm" showSubtitle siteLogo={settings.site_logo} className="nav-brand-logo" />
                </Link>
                <button
                  type="button"
                  className="nav-mobile-close"
                  onClick={close}
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>
              <nav className="nav-mobile-links" aria-label="Mobile navigation">
                <Link to="/how-to-use" className="btn btn-ghost nav-drawer-btn" onClick={close}>
                  How to Use Guide
                </Link>
                {isLoggedIn ? (
                  <Link to="/dashboard" className="btn btn-primary nav-drawer-btn" onClick={close}>
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="btn btn-ghost nav-drawer-btn" onClick={close}>
                      Login
                    </Link>
                    <Link to="/signup" className="btn btn-primary nav-drawer-btn" onClick={close}>
                      Get Started
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default PublicNav;
