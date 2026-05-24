import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { API_BASE } from '../api';
import PublicNav from '../components/PublicNav';
import PwaInstallButton from '../components/PwaInstallButton';
import { BRAND } from '../config/brand';

const WHATSAPP_URL = BRAND.whatsappGroupUrl;
const DEFAULT_SCREENSHOT = `${process.env.PUBLIC_URL}${BRAND.appScreenshot}`;
const WHATSAPP_QR = `${process.env.PUBLIC_URL}${BRAND.whatsappQr}`;

function StoreButton({ icon, title, subtitle, available, href, download, onUnavailable }) {
  if (available && href) {
    return (
      <a
        href={href}
        className="download-store-btn download-store-btn--active"
        download={download || undefined}
        target={download ? undefined : '_blank'}
        rel={download ? undefined : 'noreferrer'}
      >
        <span className="download-store-icon">{icon}</span>
        <span className="download-store-text">
          <strong>{title}</strong>
          <small>{subtitle}</small>
        </span>
      </a>
    );
  }
  return (
    <button type="button" className="download-store-btn download-store-btn--soon" onClick={onUnavailable}>
      <span className="download-store-icon">{icon}</span>
      <span className="download-store-text">
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </span>
    </button>
  );
}

const DownloadApp = () => {
  const { settings } = useSettings();
  const [activeShot, setActiveShot] = useState(0);
  const [toast, setToast] = useState('');
  const sym = settings.site_name || BRAND.name;
  const apkUrl = settings.app_apk_path ? `${API_BASE}${settings.app_apk_path}` : null;
  const iosUrl = settings.app_ios_url || '';
  const version = settings.app_version || '1.0.0';
  const adminShots = Array.isArray(settings.app_screenshots) ? settings.app_screenshots : [];
  const mainShot = adminShots.length > 0
    ? `${API_BASE}${adminShots[activeShot]}`
    : DEFAULT_SCREENSHOT;
  const pwaOn = settings.pwa_enabled !== false;
  const steps = (settings.app_install_instructions || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  return (
    <div className="download-app-page">
      <PublicNav />

      {toast && <div className="download-toast">{toast}</div>}

      <section className="download-hero fade-in">
        <div className="download-hero-text">
          <span className="download-badge">Mobile App</span>
          <h1>Download {sym}</h1>
          <p>{settings.app_description || 'Order faster, track deliveries, and manage your wallet from your phone.'}</p>
          <div className="download-version">Version <strong>{version}</strong></div>

          <div className="download-store-grid">
            <StoreButton
              icon="🤖"
              title="Android APK"
              subtitle={apkUrl ? 'Tap to download' : 'Coming soon'}
              available={!!apkUrl}
              href={apkUrl}
              download
              onUnavailable={() => showToast('Android APK will be available soon. Use PWA or web panel for now.')}
            />
            <StoreButton
              icon="🍎"
              title="iOS App"
              subtitle={iosUrl ? 'Open App Store' : 'Link not set'}
              available={!!iosUrl}
              href={iosUrl}
              onUnavailable={() => showToast('iOS App Store link is not set yet. Use PWA on iPhone (Safari → Add to Home Screen).')}
            />
          </div>

          <div className="download-actions-secondary">
            <PwaInstallButton enabled={pwaOn} className="btn btn-ghost btn-lg download-pwa-btn" />
          </div>
        </div>

        <div className="download-phone-mock">
          <img src={mainShot} alt={`${sym} app screenshot`} className="download-shot-main" />
        </div>
      </section>

      {adminShots.length > 1 && (
        <section className="download-screens-row">
          {adminShots.map((src, i) => (
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

      <section className="download-whatsapp-section card">
        <div className="download-whatsapp-grid">
          <div className="download-whatsapp-text">
            <span className="download-badge" style={{ marginBottom: 12 }}>Community</span>
            <h2>Join our WhatsApp Group</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
              Get updates, offers, and support directly from the ABHAYSMM team.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary btn-lg"
              style={{ background: '#25d366', border: 'none' }}
            >
              Join Group on WhatsApp
            </a>
          </div>
          <div className="download-whatsapp-qr-wrap">
            <img src={WHATSAPP_QR} alt="Scan to join ABHAYSMM WhatsApp group" className="download-whatsapp-qr" />
            <p className="download-whatsapp-qr-hint">Scan with WhatsApp camera</p>
          </div>
        </div>
      </section>

      {pwaOn && (
        <section className="download-section card">
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
        <section className="download-section card">
          <h2>📲 Android install instructions</h2>
          <ol className="download-steps">
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>
      )}

      <footer className="download-footer">
        © {new Date().getFullYear()} {sym} · <Link to="/">Home</Link>
      </footer>
    </div>
  );
};

export default DownloadApp;
