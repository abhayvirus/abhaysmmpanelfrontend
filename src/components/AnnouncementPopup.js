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
    <div style={overlay}>
      <div className="card" style={{ maxWidth: 480, margin: 'auto' }}>
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

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
};

export default AnnouncementPopup;
