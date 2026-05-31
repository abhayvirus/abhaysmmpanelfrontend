import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import TelegramIcon from './TelegramIcon';
import { resolveTelegramChannelUrl, shouldShowLandingTelegramWidgets } from '../constants/telegramChannel';
import { useAuthSession } from '../hooks/useAuthSession';
import '../styles/stickyTelegramBanner.css';

const AUTO_HIDE_MS = 5000;
const EXIT_MS = 300;

const StickyTelegramBanner = () => {
  const location = useLocation();
  const { settings } = useSettings();
  const bannerRef = useRef(null);
  const channelUrl = resolveTelegramChannelUrl(settings);
  const isLoggedIn = useAuthSession();
  const eligible = shouldShowLandingTelegramWidgets(location.pathname, isLoggedIn);
  const [showBanner, setShowBanner] = useState(eligible);
  const [isExiting, setIsExiting] = useState(false);

  const finishExit = useCallback(() => {
    setShowBanner(false);
    setIsExiting(false);
  }, []);

  useEffect(() => {
    if (!eligible) {
      setShowBanner(false);
      setIsExiting(false);
      return undefined;
    }

    setShowBanner(true);
    setIsExiting(false);

    const hideTimer = setTimeout(() => setIsExiting(true), AUTO_HIDE_MS);
    return () => clearTimeout(hideTimer);
  }, [eligible, location.pathname]);

  useEffect(() => {
    if (!isExiting) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      finishExit();
      return undefined;
    }

    const fallbackTimer = setTimeout(finishExit, EXIT_MS);
    return () => clearTimeout(fallbackTimer);
  }, [isExiting, finishExit]);

  useEffect(() => {
    if (!showBanner) {
      document.body.classList.remove('has-public-telegram-banner', 'telegram-banner-exiting');
      document.documentElement.style.removeProperty('--telegram-banner-h');
      return undefined;
    }

    document.body.classList.add('has-public-telegram-banner');

    if (isExiting) {
      document.body.classList.add('telegram-banner-exiting');
      document.documentElement.style.setProperty('--telegram-banner-h', '0px');
      return () => {
        document.body.classList.remove('has-public-telegram-banner', 'telegram-banner-exiting');
        document.documentElement.style.removeProperty('--telegram-banner-h');
      };
    }

    document.body.classList.remove('telegram-banner-exiting');

    const el = bannerRef.current;
    if (!el) {
      return () => {
        document.body.classList.remove('has-public-telegram-banner', 'telegram-banner-exiting');
        document.documentElement.style.removeProperty('--telegram-banner-h');
      };
    }

    const syncHeight = () => {
      document.documentElement.style.setProperty('--telegram-banner-h', `${el.offsetHeight}px`);
    };

    syncHeight();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncHeight) : null;
    ro?.observe(el);
    window.addEventListener('resize', syncHeight);

    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', syncHeight);
      document.body.classList.remove('has-public-telegram-banner', 'telegram-banner-exiting');
      document.documentElement.style.removeProperty('--telegram-banner-h');
    };
  }, [showBanner, isExiting]);

  const handleTransitionEnd = (e) => {
    if (!isExiting || e.target !== bannerRef.current || e.propertyName !== 'opacity') return;
    finishExit();
  };

  if (!eligible || !showBanner) return null;

  return (
    <aside
      ref={bannerRef}
      className={`sticky-telegram-banner${isExiting ? ' sticky-telegram-banner--exiting' : ''}`}
      role="region"
      aria-label="Join our Telegram channel"
      aria-hidden={isExiting ? 'true' : undefined}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="sticky-telegram-banner__glass">
        <p className="sticky-telegram-banner__text">
          <span className="sticky-telegram-banner__emoji" aria-hidden="true">🚀</span>
          <span>Join Our Official Telegram Channel for Updates &amp; Offers</span>
        </p>
        <a
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="sticky-telegram-banner__btn"
        >
          <TelegramIcon size={17} className="sticky-telegram-banner__btn-icon" />
          Join Telegram
        </a>
      </div>
    </aside>
  );
};

export default StickyTelegramBanner;
