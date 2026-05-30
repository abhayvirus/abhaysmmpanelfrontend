import React, { useState, useEffect, useCallback } from 'react';
import UserLayout from '../components/UserLayout';
import { getAppSettings, downloadApkFile, trackApkDownload, API_BASE } from '../api';
import { useSettings } from '../contexts/SettingsContext';
import '../styles/downloadApp.css';

const DownloadApp = () => {
  const { settings: globalSettings } = useSettings();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [shotIndex, setShotIndex] = useState(0);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAppSettings();
      setApp(res.data);
    } catch {
      setApp(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const showToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(null), 3500);
  };

  const handleAndroidDownload = async () => {
    if (!app?.android_available) return;
    setDownloading(true);
    try {
      const isHosted = Boolean(
        app.app_apk_path?.startsWith('/uploads/')
        || (app.android_apk_url && app.android_apk_url.startsWith(API_BASE) && app.android_apk_url.includes('/uploads/'))
      );
      if (isHosted) {
        const blob = await downloadApkFile();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `abhaysmm-v${app.app_version || '1'}.apk`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        showToast('Download started');
      } else {
        await trackApkDownload();
        window.location.href = app.android_apk_url;
        showToast('Opening download…');
      }
      await load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Download failed');
    }
    setDownloading(false);
  };

  const handleIosOpen = () => {
    if (!app?.ios_available) return;
    window.open(app.app_ios_url, '_blank', 'noopener,noreferrer');
  };

  const screenshots = app?.app_screenshots || [];
  const mainShot = screenshots[shotIndex];
  const siteName = app?.site_name || globalSettings.site_name || 'ABHAYSMM';
  const steps = (app?.app_install_instructions || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <UserLayout title="Download App">
      <div className="download-app-page">
        {toast && <div className="download-toast" role="status">{toast}</div>}

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 48 }}>Loading app info…</p>
        ) : (
          <>
            <section className="download-hero">
              <div className="download-hero-text">
                <span className="download-badge">Mobile App</span>
                <h1>{siteName} App</h1>
                <p className="download-version">
                  {app?.android_available && (
                    <>Android v{app.app_version || '1.0.0'}
                      {app.app_apk_size_label && <> · {app.app_apk_size_label}</>}
                    </>
                  )}
                  {!app?.android_available && app?.ios_available && 'iOS available'}
                  {!app?.android_available && !app?.ios_available && 'Get the app on your device'}
                </p>
                {app?.app_description && (
                  <p style={{ color: 'var(--text-muted)', marginBottom: 20, maxWidth: 420 }}>
                    {app.app_description}
                  </p>
                )}

                <div className="download-store-grid">
                  {app?.android_available ? (
                    <button
                      type="button"
                      className="download-store-btn download-store-btn--active"
                      onClick={handleAndroidDownload}
                      disabled={downloading}
                    >
                      <span className="download-store-icon" aria-hidden="true">🤖</span>
                      <span className="download-store-text">
                        <strong>{downloading ? 'Downloading…' : 'Download APK'}</strong>
                        <small>v{app.app_version}{app.app_apk_size_label ? ` · ${app.app_apk_size_label}` : ''}</small>
                      </span>
                    </button>
                  ) : (
                    <div className="download-store-btn download-store-btn--unavailable" aria-disabled="true">
                      <span className="download-store-icon" aria-hidden="true">🤖</span>
                      <span className="download-store-text">
                        <strong>APK not available</strong>
                        <small>Admin has not published an Android build yet</small>
                      </span>
                    </div>
                  )}

                  {app?.ios_available ? (
                    <button
                      type="button"
                      className="download-store-btn download-store-btn--active"
                      onClick={handleIosOpen}
                    >
                      <span className="download-store-icon" aria-hidden="true">🍎</span>
                      <span className="download-store-text">
                        <strong>Open App Store</strong>
                        <small>Install from Apple App Store</small>
                      </span>
                    </button>
                  ) : (
                    <div className="download-store-btn download-store-btn--unavailable" aria-disabled="true">
                      <span className="download-store-icon" aria-hidden="true">🍎</span>
                      <span className="download-store-text">
                        <strong>iOS app not available</strong>
                        <small>No App Store link configured</small>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="download-phone-mock">
                {mainShot ? (
                  <img src={`${API_BASE}${mainShot}`} alt="App screenshot" className="download-shot-main" />
                ) : (
                  <div className="download-shot-placeholder">
                    <span style={{ fontSize: 48 }}>📱</span>
                    <span>App preview</span>
                  </div>
                )}
              </div>
            </section>

            {screenshots.length > 1 && (
              <div className="download-screens-row">
                {screenshots.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    className={`download-thumb${shotIndex === i ? ' active' : ''}`}
                    onClick={() => setShotIndex(i)}
                  >
                    <img src={`${API_BASE}${src}`} alt="" />
                  </button>
                ))}
              </div>
            )}

            {app?.app_update_notes && (
              <section className="download-section card">
                <h2>What&apos;s new</h2>
                <p style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap', margin: 0 }}>
                  {app.app_update_notes}
                </p>
              </section>
            )}

            {steps.length > 0 && (
              <section className="download-section card">
                <h2>How to install (Android)</h2>
                <ol className="download-steps">
                  {steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </section>
            )}

            <footer className="download-footer">
              © {new Date().getFullYear()} {siteName}
            </footer>
          </>
        )}
      </div>
    </UserLayout>
  );
};

export default DownloadApp;
