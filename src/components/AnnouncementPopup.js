import React, { useState, useEffect } from 'react';
import { getAnnouncements } from '../api';

const dismissKey = (id) => `ann_dismissed_${id}`;

const AnnouncementPopup = () => {
  const [ann, setAnn] = useState(null);

  useEffect(() => {
    getAnnouncements()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        const personal = list.find((a) => a.target_user_id);
        const global = list.find((a) => !a.target_user_id && a.show_on_login);
        const pick = personal || global;
        if (pick && !sessionStorage.getItem(dismissKey(pick.id))) {
          setAnn(pick);
        }
      })
      .catch(() => {});
  }, []);

  if (!ann) return null;

  const isPersonal = Boolean(ann.target_user_id);

  return (
    <div className="modal-overlay" role="presentation">
      <div
        className="card modal-panel fade-in announcement-popup"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-popup-title"
      >
        {isPersonal ? (
          <p className="announcement-popup__badge">Personal message from support</p>
        ) : null}
        <h3 id="announcement-popup-title" style={{ marginBottom: 12 }}>{ann.title}</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20, whiteSpace: 'pre-wrap' }}>{ann.content}</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            sessionStorage.setItem(dismissKey(ann.id), '1');
            setAnn(null);
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default AnnouncementPopup;
