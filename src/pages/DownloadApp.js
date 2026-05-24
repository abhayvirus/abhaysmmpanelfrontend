import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { API_BASE } from '../api';
import PwaInstallButton from '../components/PwaInstallButton';

const DownloadApp = () => {
  const { settings } = useSettings();
  const [activeShot, setActiveShot] = useState(0);
  const token = localStorage.getItem('token');
  const sym = settings.site_name || 'SMM Panel';
  const logoUrl = settings.site_logo ? `${API_BASE}${settings.site_logo}` : null;
  const apkUrl = settings.app_apk_path ? `${API_BASE}${settings.app_apk_path}` : null;
  const iosUrl = settings.app_ios_url || '';
  const version = settings.app_version || '1.0.0';
  const shots = Array.isArray(settings.app_screenshots) ? settings.app_screenshots : [];
  const steps = (settings.app_install_instructions || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  const pwaOn = settings.pwa_enabled !== false;

  return (
    <div className="download-app-page">
      <nav className="nav-public">
        <Link to="/" style={{ fontWeight: 800, fontSize: 20, display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
          {logoUrl ? <img src={logoUrl} alt="" style={{ height: 32, borderRadius: 6 }} /> : '⚡'}
          {sym}
        </Link>
        <div style={{ display: 'flex', gap: 12 }}>
          {token ? (
            <Link to="/dashboard" className="btn btn-ghost">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/signup" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </nav>

      <section className="download-hero fade-in">
        <div className="download-hero-text">
          <span className="download-badge">Mobile App</span>
          <h1>Download {sym} App</h1>
          <p>{settings.app_description || 'Order faster, track deliveries, and manage your wallet from your phone.'}</p>
          <div className="download-version">Version <strong>{version}</strong></div>
          <div className="download-actions">
            {apkUrl ? (
              <a href={apkUrl} download className="btn btn-primary btn-lg">
                🤖 Download Android APK
              </a>
            ) : (
              <span className="btn btn-primary btn-lg" style={{ opacity: 0.5, pointerEvents: 'none' }}>
                Android APK — coming soon
              </span>
            )}
            {iosUrl ? (
              <a href={iosUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-lg">
                🍎 Get on App Store
              </a>
            ) : (
              <span className="btn btn-ghost btn-lg" style={{ opacity: 0.5 }}>iOS — link not set</span>
            )}
            <PwaInstallButton enabled={pwaOn} className="btn btn-ghost btn-lg" />
          </div>
        </div>
        <div className="download-phone-mock">
          {shots.length > 0 ? (
            <img src={`${API_BASE}${shots[activeShot]}`} alt="App screenshot" className="download-shot-main" />
          ) : (
            <div className="download-shot-placeholder">
              <span style={{ fontSize: 48 }}>📱</span>
              <p>Screenshots coming soon</p>
            </div>
          )}
        </div>
      </section>

      {shots.length > 1 && (
        <section className="download-screens-row">
          {shots.map((src, i) => (
            <button
              key={src}
              type="button"
              className={`download-thumb${i === activeShot ? ' active' : ''}`}
              onClick={() => setActiveShot(i)}
            >
              <img src={`${API_BASE}${src}`} alt="" />
            </button>
          ))}
        </section>
      )}

      {pwaOn && (
        <section className="download-section card" style={{ maxWidth: 900, margin: '0 auto 24px' }}>
          <h2>🌐 Progressive Web App</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
            Install our panel as an app on your home screen — no store required. Works on Android, iOS (Safari), and desktop Chrome.
          </p>
          <ol className="download-steps">
            <li>Open this site in Chrome or Safari on your phone.</li>
            <li>Tap the install button above, or use browser menu → <strong>Add to Home Screen</strong>.</li>
            <li>Launch from your home screen like a native app.</li>
          </ol>
          <PwaInstallButton enabled={pwaOn} className="btn btn-primary" />
        </section>
      )}

      {steps.length > 0 && (
        <section className="download-section card" style={{ maxWidth: 900, margin: '0 auto 32px' }}>
          <h2>📲 Android install instructions</h2>
          <ol className="download-steps">
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>
      )}

      <footer style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: 13 }}>
        © {new Date().getFullYear()} {sym}
      </footer>
    </div>
  );
};

export default DownloadApp;
