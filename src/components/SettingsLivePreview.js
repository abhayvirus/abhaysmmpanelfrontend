import React, { useState } from 'react';
import { API_BASE } from '../api';

const PREVIEW_MODES = [
  { id: 'mobile', label: 'Mobile' },
  { id: 'tablet', label: 'Tablet' },
  { id: 'desktop', label: 'Desktop' },
];

const SettingsLivePreview = ({ draft }) => {
  const [mode, setMode] = useState('mobile');

  const logoUrl = draft.site_logo ? `${API_BASE}${draft.site_logo}` : null;
  const isLight = draft.theme_mode === 'light';
  const primary = draft.theme_primary || '#2563eb';
  const accent = draft.theme_accent || '#0ea5e9';
  const bg = draft.theme_bg || (isLight ? '#f8fafc' : '#070b12');
  const card = draft.theme_card || (isLight ? '#ffffff' : '#0f1623');
  const text = draft.theme_text || (isLight ? '#0f172a' : '#e8edf5');
  const muted = isLight ? '#64748b' : '#8b9cb3';

  const frameClass = `settings-preview-device settings-preview-device--${mode}`;

  return (
    <div className="settings-live-preview">
      <div className="settings-preview-header">
        <span>Live preview</span>
        <div className="settings-preview-mode-tabs" role="tablist">
          {PREVIEW_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              className={`settings-preview-mode-btn${mode === m.id ? ' is-active' : ''}`}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className={frameClass}>
        {mode === 'mobile' && <div className="settings-preview-notch" aria-hidden="true" />}
        <div
          className="settings-preview-screen"
          style={{
            '--preview-primary': primary,
            '--preview-accent': accent,
            '--preview-bg': bg,
            '--preview-card': card,
            '--preview-text': text,
            '--preview-muted': muted,
            '--preview-gradient': `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`,
          }}
        >
          <div className="settings-preview-mobile-chrome">
            <span>☰</span>
            <span className="settings-preview-brand">{draft.site_name || 'ABHAYSMM'}</span>
            <span style={{ color: primary, fontWeight: 700, fontSize: 10 }}>
              {draft.currency_symbol || '₹'}0
            </span>
          </div>
          <div className="settings-preview-body">
            <aside className="settings-preview-sidebar">
              <div className="settings-preview-sidebar-brand">
                {logoUrl ? (
                  <img src={logoUrl} alt="" />
                ) : (
                  <span>⚡</span>
                )}
                <strong>{draft.site_name || 'Panel'}</strong>
              </div>
              <div className="settings-preview-balance">{draft.currency_symbol || '₹'}1,250</div>
              {['Dashboard', 'Services', 'Add Funds'].map((l) => (
                <div key={l} className="settings-preview-nav-item">{l}</div>
              ))}
            </aside>
            <main className="settings-preview-main">
              <h4>{draft.site_tagline || 'Premium SMM services'}</h4>
              <div className="settings-preview-stat">
                <span>Orders</span>
                <strong style={{ color: primary }}>24</strong>
              </div>
              <div className="settings-preview-service-card">
                <span style={{ color: muted, fontSize: 10 }}>Instagram Views</span>
                <strong style={{ color: primary }}>{draft.currency_symbol || '₹'}2.50</strong>
              </div>
              <button type="button" className="settings-preview-cta">Place order</button>
              {(draft.maintenance_mode === true || draft.maintenance_mode === 'true') && (
                <span className="settings-preview-badge-warn">Maintenance</span>
              )}
            </main>
          </div>
        </div>
      </div>

      <p className="settings-preview-footer">
        {isLight ? 'Light' : 'Dark'} · {primary} · {draft.currency_code || 'INR'}
      </p>
    </div>
  );
};

export default SettingsLivePreview;
