import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import TelegramIcon from './TelegramIcon';
import { resolveTelegramChannelUrl, PUBLIC_TELEGRAM_POPUP_ID } from '../constants/telegramChannel';
import { useAuthSession } from '../hooks/useAuthSession';
import { AUTH_SESSION_EVENT } from '../utils/authEvents';
import '../styles/telegramChannelPopup.css';

export { PUBLIC_TELEGRAM_POPUP_ID };

const LOGIN_DELAY_MS = 5000;
const AUTO_DISMISS_MS = 12000;

/** Telegram promo popup — logged-in user panel only (not shown on public landing). */
const TelegramChannelPopup = () => {
  const location = useLocation();
  const { settings } = useSettings();
  const channelUrl = resolveTelegramChannelUrl(settings);
  const isLoggedIn = useAuthSession();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isUserPanel = isLoggedIn && !isAdminRoute;

  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const dismissTimerRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    timerRef.current = null;
    dismissTimerRef.current = null;
  }, []);

  const closePopup = useCallback(() => {
    setVisible(false);
    setTimeout(() => setOpen(false), 280);
  }, []);

  const showPopup = useCallback(() => {
    setOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(closePopup, AUTO_DISMISS_MS);
  }, [closePopup]);

  useEffect(() => {
    clearTimers();
    setOpen(false);
    setVisible(false);

    if (!isUserPanel) return undefined;

    const sessionKey = 'abhaysmm_telegram_popup_user';
    if (sessionStorage.getItem(sessionKey) === '1') return clearTimers;

    timerRef.current = setTimeout(() => {
      sessionStorage.setItem(sessionKey, '1');
      showPopup();
    }, LOGIN_DELAY_MS);

    return clearTimers;
  }, [isUserPanel, location.pathname, clearTimers, showPopup]);

  useEffect(() => {
    const onLogin = () => {
      const path = window.location.pathname || '';
      if (path.startsWith('/admin')) return;
      clearTimers();
      sessionStorage.removeItem('abhaysmm_telegram_popup_user');
      setOpen(false);
      setVisible(false);
      timerRef.current = setTimeout(() => {
        sessionStorage.setItem('abhaysmm_telegram_popup_user', '1');
        showPopup();
      }, LOGIN_DELAY_MS);
    };

    window.addEventListener(AUTH_SESSION_EVENT, onLogin);
    return () => window.removeEventListener(AUTH_SESSION_EVENT, onLogin);
  }, [clearTimers, showPopup]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  if (!isUserPanel || !open) return null;

  return (
    <div
      id={PUBLIC_TELEGRAM_POPUP_ID}
      className={`telegram-channel-popup${visible ? ' telegram-channel-popup--visible' : ''}`}
      role="dialog"
      aria-labelledby={`${PUBLIC_TELEGRAM_POPUP_ID}-title`}
      aria-modal="false"
    >
      <div className="telegram-channel-popup__card">
        <button
          type="button"
          className="telegram-channel-popup__close"
          onClick={closePopup}
          aria-label="Close Telegram popup"
        >
          ×
        </button>
        <p id={`${PUBLIC_TELEGRAM_POPUP_ID}-title`} className="telegram-channel-popup__text">
          <span className="telegram-channel-popup__emoji" aria-hidden="true">🚀</span>
          Join Our Official Telegram Channel for Updates &amp; Offers
        </p>
        <a
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="telegram-channel-popup__btn"
          onClick={closePopup}
        >
          <TelegramIcon size={18} className="telegram-channel-popup__btn-icon" />
          Join Telegram
        </a>
      </div>
    </div>
  );
};

export default TelegramChannelPopup;
