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

/** True center-screen WhatsApp join modal (portaled to body). */
const WhatsAppGroupPopup = () => {
  const location = useLocation();
  const { settings } = useSettings();
  const groupUrl = resolveGroupUrl(settings);
  const qrSrc = `${process.env.PUBLIC_URL || ''}${BRAND.whatsappQr}`;

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

        <div className="wa-join-popup__badge" aria-hidden="true">
          WhatsApp
        </div>
        <h2 id={`${POPUP_ID}-title`} className="wa-join-popup__title">
          Join our WhatsApp Group
        </h2>
        <p className="wa-join-popup__text">
          Get offers, payment updates, new services, and quick support from the {BRAND.shortName} team.
        </p>

        <img
          src={qrSrc}
          alt="WhatsApp group QR code"
          className="wa-join-popup__qr"
          loading="eager"
          decoding="async"
        />
        <p className="wa-join-popup__hint">Scan with WhatsApp camera, or tap Join Now</p>

        <a
          href={groupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="wa-join-popup__cta"
          onClick={() => closePopup(true)}
        >
          🚀 Join Now
        </a>
      </div>
    </div>,
    document.body
  );
};

export default WhatsAppGroupPopup;
