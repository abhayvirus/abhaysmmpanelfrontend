import React, { useState, useEffect } from 'react';
import { getAnnouncements } from '../api';

const AnnouncementPopup = () => {
  const [ann, setAnn] = useState(null);
  const dismissed = sessionStorage.getItem('ann_dismissed');

  useEffect(() => {
    if (dismissed) return;
    getAnnouncements().then((res) => {
      const active = res.data.find((a) => a.show_on_login);
      if (active) setAnn(active);
    }).catch(() => {});
  }, [dismissed]);

  if (!ann) return null;

  return (
    <div className="modal-overlay" role="presentation">
      <div className="card modal-panel fade-in" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h3 style={{ marginBottom: 12 }}>{ann.title}</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20, whiteSpace: 'pre-wrap' }}>{ann.content}</p>
        <button className="btn btn-primary" onClick={() => {
          sessionStorage.setItem('ann_dismissed', '1');
          setAnn(null);
        }}>Got it</button>
      </div>
    </div>
  );
};

export default AnnouncementPopup;
