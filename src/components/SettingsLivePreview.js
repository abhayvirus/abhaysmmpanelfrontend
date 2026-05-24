import React from 'react';
import { API_BASE } from '../api';
import { applyThemeToDocument } from '../contexts/SettingsContext';

/**
 * Live preview of user panel branding while admin edits settings
 */
const SettingsLivePreview = ({ draft }) => {
  React.useEffect(() => {
    applyThemeToDocument(draft);
    return () => {
      /* parent SettingsProvider will re-apply on unmount via refresh */
    };
  }, [draft]);

  const logoUrl = draft.site_logo ? `${API_BASE}${draft.site_logo}` : null;

  return (
    <div style={{
      position: 'sticky', top: 24, borderRadius: 16, overflow: 'hidden',
      border: '1px solid var(--border)', background: 'var(--bg-card)',
    }}>
      <div style={{
        padding: '10px 16px', background: 'var(--gradient)', fontSize: 11,
        fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#fff',
      }}>
        Live Preview
      </div>

      {/* Mini sidebar */}
      <div style={{ display: 'flex', minHeight: 280 }}>
        <div style={{
          width: 200, background: 'var(--bg-card)', borderRight: '1px solid var(--border)', padding: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            {logoUrl ? (
              <img src={logoUrl} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 24 }}>⚡</span>
            )}
            <span style={{ fontWeight: 800, fontSize: 14 }}>{draft.site_name || 'SMM Panel'}</span>
          </div>
          <div style={{
            fontSize: 12, color: 'var(--primary)', fontWeight: 700, marginBottom: 12,
            padding: '6px 10px', background: 'var(--bg)', borderRadius: 8,
          }}>
            {draft.currency_symbol || '₹'}1,250.00
          </div>
          {['New Order', 'Services', 'Add Funds'].map((l) => (
            <div key={l} style={{
              padding: '8px 10px', fontSize: 12, color: 'var(--text-muted)', borderRadius: 8,
              marginBottom: 4,
            }}>{l}</div>
          ))}
        </div>

        {/* Mini content */}
        <div style={{ flex: 1, padding: 16, background: 'var(--bg)' }}>
          <h3 style={{ fontSize: 16, marginBottom: 8 }}>{draft.site_tagline || 'Your tagline here'}</h3>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
            Currency: {draft.currency_code || 'INR'} ({draft.currency_symbol || '₹'})
          </p>
          <div style={{
            padding: 12, borderRadius: 10, background: 'var(--bg-card)',
            border: '1px solid var(--border)', fontSize: 12,
          }}>
            <div style={{ color: 'var(--text-muted)' }}>Sample service</div>
            <div style={{ color: 'var(--primary)', fontWeight: 700, marginTop: 4 }}>
              {draft.currency_symbol || '₹'}2.50 / 1k
            </div>
          </div>
          {draft.maintenance_mode === true || draft.maintenance_mode === 'true' ? (
            <div className="badge badge-warning" style={{ marginTop: 12 }}>Maintenance ON</div>
          ) : null}
        </div>
      </div>

      <div style={{ padding: 12, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>
        Theme: {draft.theme_mode || 'dark'} · Primary {draft.theme_primary || '#6366f1'}
      </div>
    </div>
  );
};

export default SettingsLivePreview;
