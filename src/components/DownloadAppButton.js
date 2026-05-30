import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { API_BASE } from '../config/env';

function resolveApkUrl(settings = {}) {
  const direct = String(settings.android_apk_url || '').trim();
  if (direct && direct !== '#') return direct;

  const path = String(settings.app_apk_path || '').trim();
  if (path.startsWith('/uploads/')) {
    return `${String(API_BASE).replace(/\/$/, '')}${path}`;
  }

  const legacy = String(settings.app_download_url || '').trim();
  if (legacy && legacy !== '#' && /^https?:\/\//i.test(legacy)) return legacy;

  return '';
}

/**
 * Public landing-page Download App CTA — guests only (parent controls visibility).
 */
const DownloadAppButton = ({ className = '' }) => {
  const { settings } = useSettings();
  const apkUrl = resolveApkUrl(settings);
  const hasApk = Boolean(apkUrl);

  if (hasApk) {
    return (
      <a
        href={apkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn btn-primary btn-lg hero-download-btn${className ? ` ${className}` : ''}`}
      >
        <span className="hero-download-btn__icon" aria-hidden="true">📱</span>
        <span>Download App</span>
      </a>
    );
  }

  return (
    <span
      className={`btn btn-primary btn-lg hero-download-btn hero-download-btn--soon${className ? ` ${className}` : ''}`}
      role="status"
      aria-label="App coming soon"
    >
      <span className="hero-download-btn__icon" aria-hidden="true">📱</span>
      <span>App coming soon</span>
    </span>
  );
};

export default DownloadAppButton;
