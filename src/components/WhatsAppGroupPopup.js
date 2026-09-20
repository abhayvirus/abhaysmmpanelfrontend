import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { isAuthenticated } from '../utils/authRedirect';
import { BRAND } from '../config/brand';
import '../styles/whatsappGroupPopup.css';

const STORAGE_KEY = 'abhaysmm_wa_join_popup_dismissed_at';
const DISMISS_MS = 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 900;
const POPUP_ID = 'whatsapp-group-join-popup';
/** Bump when QR asset changes so browsers skip stale cache. */
const QR_CACHE_BUST = 'v4';

function wasDismissedRecently() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const dismissedAt = parseInt(raw, 10);
    if (Number.isNaN(dismissedAt)) return false;
    return Date.now() - dismissedAt < DISMISS_MS;
  } catch {
    return false;
  }
}

function resolveGroupUrl(settings) {
  return String(
    settings?.whatsapp_community_link
    || settings?.whatsapp_link
    || BRAND.whatsappGroupUrl
    || ''
  ).trim();
}

const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/signup',
  '/services',
  '/how-to-use',
  '/pricing',
  '/blog',
  '/support',
  '/contact',
]);

const WhatsAppIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
    />
  </svg>
);

/** True center-screen WhatsApp join modal (portaled to body). */
const WhatsAppGroupPopup = () => {
  const location = useLocation();
  const { settings } = useSettings();
  const groupUrl = resolveGroupUrl(settings);
  const qrSrc = `${process.env.PUBLIC_URL || ''}${BRAND.whatsappQr}?${QR_CACHE_BUST}`;

  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closePopup = useCallback((persistDismiss = true) => {
    setVisible(false);
    window.setTimeout(() => setOpen(false), 200);
    if (persistDismiss) {
      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated()) {
      setOpen(false);
      setVisible(false);
      return undefined;
    }

    const path = location.pathname || '/';
    const allowed =
      PUBLIC_PATHS.has(path)
      || path.startsWith('/blog/')
      || path.startsWith('/how-to-use');

    if (!allowed || !groupUrl || wasDismissedRecently()) {
      setOpen(false);
      setVisible(false);
      return undefined;
    }

    const t = window.setTimeout(() => {
      setOpen(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    }, SHOW_DELAY_MS);

    return () => window.clearTimeout(t);
  }, [location.pathname, groupUrl]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closePopup(true);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, closePopup]);

  if (!mounted || !open || !groupUrl) return null;

  return createPortal(
    <div
      id={POPUP_ID}
      className={`wa-join-popup${visible ? ' wa-join-popup--visible' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${POPUP_ID}-title`}
    >
      <button
        type="button"
        className="wa-join-popup__backdrop"
        aria-label="Close WhatsApp join popup"
        onClick={() => closePopup(true)}
      />
      <div className="wa-join-popup__card">
        <button
          type="button"
          className="wa-join-popup__close"
          onClick={() => closePopup(true)}
          aria-label="Dismiss"
        >
          ×
        </button>

        <div className="wa-join-popup__badge">
          <WhatsAppIcon size={14} />
          <span>WhatsApp</span>
        </div>
        <h2 id={`${POPUP_ID}-title`} className="wa-join-popup__title">
          Join our WhatsApp Group
        </h2>
        <p className="wa-join-popup__text">
          Offers, payment updates, new services, and quick support from the {BRAND.shortName} team.
        </p>

        <div className="wa-join-popup__qr-wrap">
          <img
            src={qrSrc}
            alt="WhatsApp group QR code"
            className="wa-join-popup__qr"
            width={792}
            height={911}
            loading="eager"
            decoding="async"
          />
        </div>
        <p className="wa-join-popup__hint">Scan with WhatsApp camera, or tap Join Now</p>

        <a
          href={groupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="wa-join-popup__cta"
          onClick={() => closePopup(true)}
        >
          <WhatsAppIcon size={18} />
          <span>Join Now</span>
        </a>
      </div>
    </div>,
    document.body
  );
};

export default WhatsAppGroupPopup;
