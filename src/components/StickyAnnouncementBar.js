import React, { useState } from 'react';
import { isAuthenticated } from '../utils/authRedirect';
import '../styles/stickyAnnouncementBar.css';

const WHATSAPP_URL = 'https://chat.whatsapp.com/LqjQV2tmqlt2PUoTxDMho2?s=cl&p=a&mlu=4';
const STORAGE_KEY = 'abhaysmm_wa_announcement_dismissed_at';
const DISMISS_MS = 24 * 60 * 60 * 1000;

function isBannerDismissed() {
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

const StickyAnnouncementBar = () => {
  const [visible, setVisible] = useState(() => !isBannerDismissed());

  if (isAuthenticated() || !visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <aside
      className="sticky-announcement"
      role="region"
      aria-label="WhatsApp community updates"
    >
      <div className="sticky-announcement__inner">
        <p className="sticky-announcement__text">
          <span className="sticky-announcement__icon" aria-hidden="true">📢</span>
          <span>
            <strong className="sticky-announcement__label">Updates:</strong>
            {' '}
            Join Our Official WhatsApp Community for Latest Offers, Updates &amp; Announcements
          </span>
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="sticky-announcement__cta"
        >
          🚀 Join Now
        </a>
        <button
          type="button"
          className="sticky-announcement__close"
          onClick={dismiss}
          aria-label="Dismiss announcement for 24 hours"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>
    </aside>
  );
};

export default StickyAnnouncementBar;
