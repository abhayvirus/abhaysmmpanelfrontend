import React, { useState, useEffect, useCallback } from 'react';
import { getAnnouncements } from '../api';
import { getAnnouncementTemplate } from '../content/announcementTemplates';
import '../styles/announcementPopup.css';

const dismissKey = (id) => `ann_dismissed_${id}`;

function resolveStyle(ann) {
  const key = String(ann.template_key || '').trim();
  const tpl = key ? getAnnouncementTemplate(key) : null;
  if (tpl?.style) return tpl.style;
  const t = String(ann.title || '');
  if (/referral/i.test(t)) return 'referral';
  if (/offer|deal|festival|discount/i.test(t)) return 'offer';
  if (/balance|fund/i.test(t)) return 'warning';
  if (/maintain/i.test(t)) return 'maintenance';
  if (/security|password/i.test(t)) return 'security';
  if (/welcome/i.test(t)) return 'welcome';
  if (/support/i.test(t)) return 'support';
  if (/fast|speed|live/i.test(t)) return 'success';
  return 'info';
}

function resolveEmoji(ann) {
  const key = String(ann.template_key || '').trim();
  const tpl = key ? getAnnouncementTemplate(key) : null;
  if (tpl?.emoji) return tpl.emoji;
  const style = resolveStyle(ann);
  const map = {
    welcome: '👋',
    offer: '🔥',
    warning: '💰',
    info: '✨',
    maintenance: '🛠️',
    referral: '🎁',
    festival: '🎉',
    success: '⚡',
    security: '🔐',
    support: '🎧',
  };
  return map[style] || '📢';
}

function resolveCta(ann) {
  const key = String(ann.template_key || '').trim();
  const tpl = key ? getAnnouncementTemplate(key) : null;
  return tpl?.cta || 'Got it';
}

function resolveBadge(ann) {
  if (ann.target_user_id) {
    return /referral/i.test(String(ann.title || '')) ? 'Referral reward' : 'Personal message';
  }
  const key = String(ann.template_key || '').trim();
  const tpl = key ? getAnnouncementTemplate(key) : null;
  return tpl?.label || 'Announcement';
}

const AnnouncementPopup = () => {
  const [ann, setAnn] = useState(null);

  const dismiss = useCallback((id) => {
    if (id != null) sessionStorage.setItem(dismissKey(id), '1');
    setAnn(null);
  }, []);

  const load = useCallback(() => {
    getAnnouncements()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        const personal = list.find((a) => a.target_user_id);
        const global = list.find((a) => !a.target_user_id && (a.show_on_login === 1 || a.show_on_login === true || a.show_on_login == null));
        const pick = personal || global;
        if (pick && !sessionStorage.getItem(dismissKey(pick.id))) {
          setAnn(pick);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const onFocus = () => load();
    const onNotif = () => load();
    window.addEventListener('focus', onFocus);
    window.addEventListener('notifications-updated', onNotif);
    const poll = setInterval(load, 45000);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('notifications-updated', onNotif);
      clearInterval(poll);
    };
  }, [load]);

  useEffect(() => {
    if (!ann) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') dismiss(ann.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ann, dismiss]);

  if (!ann) return null;

  const style = resolveStyle(ann);
  const emoji = resolveEmoji(ann);
  const cta = resolveCta(ann);
  const badge = resolveBadge(ann);

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={() => dismiss(ann.id)}
    >
      <div
        className={`card modal-panel fade-in announcement-popup announcement-popup--${style}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-popup-title"
      >
        <button
          type="button"
          className="announcement-popup__close"
          aria-label="Close"
          title="Close"
          onClick={() => dismiss(ann.id)}
        >
          ×
        </button>
        <div className="announcement-popup__hero">
          <span className="announcement-popup__emoji" aria-hidden="true">{emoji}</span>
          <div>
            <p className="announcement-popup__badge">{badge}</p>
            <h3 id="announcement-popup-title" className="announcement-popup__title">{ann.title}</h3>
          </div>
        </div>
        <p className="announcement-popup__body">{ann.content}</p>
        <div className="announcement-popup__actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => dismiss(ann.id)}
          >
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementPopup;
