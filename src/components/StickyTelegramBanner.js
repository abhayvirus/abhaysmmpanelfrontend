import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import TelegramIcon from './TelegramIcon';
import { resolveTelegramChannelUrl, shouldShowPublicTelegramBanner } from '../constants/telegramChannel';
import '../styles/stickyTelegramBanner.css';

const StickyTelegramBanner = () => {
  const location = useLocation();
  const { settings } = useSettings();
  const bannerRef = useRef(null);
  const channelUrl = resolveTelegramChannelUrl(settings);
  const visible = shouldShowPublicTelegramBanner(location.pathname);

  useEffect(() => {
    if (!visible) {
      document.body.classList.remove('has-public-telegram-banner');
      document.documentElement.style.removeProperty('--telegram-banner-h');
      return undefined;
    }

    document.body.classList.add('has-public-telegram-banner');

    const el = bannerRef.current;
    if (!el) return () => document.body.classList.remove('has-public-telegram-banner');

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
      document.body.classList.remove('has-public-telegram-banner');
      document.documentElement.style.removeProperty('--telegram-banner-h');
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <aside
      ref={bannerRef}
      className="sticky-telegram-banner"
      role="region"
      aria-label="Join our Telegram channel"
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
