import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getPublicSettings } from '../api';
import { registerServiceWorker, updateManifestMeta } from '../utils/pwa';
import { BRAND } from '../config/brand';

const SettingsContext = createContext(null);

const DEFAULTS = {
  site_name: BRAND.name,
  site_tagline: BRAND.tagline,
  site_logo: '',
  currency_symbol: '₹',
  currency_code: 'INR',
  theme_primary: BRAND.theme.primary,
  theme_accent: BRAND.theme.accent,
  theme_mode: BRAND.theme.mode,
  maintenance_mode: false,
  settings_version: '0',
};

/** User panel theme: localStorage wins over server default. */
export function getResolvedThemeMode(settings = {}) {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('user_theme');
    if (stored === 'light' || stored === 'dark') return stored;
  }
  return settings.theme_mode === 'light' ? 'light' : 'dark';
}

export function applyThemeToDocument(settings = {}) {
  const root = document.documentElement;
  const mode = getResolvedThemeMode(settings);
  const primary = settings.theme_primary || DEFAULTS.theme_primary;
  const accent = settings.theme_accent || DEFAULTS.theme_accent;

  root.setAttribute('data-theme', mode);
  root.style.setProperty('--primary', primary);
  root.style.setProperty('--accent', accent);
  const btnColor = settings.theme_button || primary;
  root.style.setProperty('--gradient', `linear-gradient(135deg, ${btnColor} 0%, ${accent} 100%)`);

  if (mode === 'light') {
    root.style.setProperty('--bg', settings.theme_bg || '#f8fafc');
    root.style.setProperty('--bg-card', settings.theme_card || '#ffffff');
    root.style.setProperty('--text', settings.theme_text || '#0f172a');
    root.style.setProperty('--text-muted', '#64748b');
    root.style.setProperty('--border', '#e2e8f0');
  } else {
    root.style.setProperty('--bg', settings.theme_bg || '#070b12');
    root.style.setProperty('--bg-card', settings.theme_card || '#0f1623');
    root.style.setProperty('--text', settings.theme_text || '#e8edf5');
    root.style.setProperty('--text-muted', '#8b9cb3');
    root.style.setProperty('--border', '#1e2d42');
  }

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', settings.theme_bg || (mode === 'light' ? '#f8fafc' : '#070b12'));
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [lastVersion, setLastVersion] = useState('0');

  const refresh = useCallback(async () => {
    try {
      const { data } = await getPublicSettings();
      const merged = { ...DEFAULTS, ...data };
      setSettings((prev) => {
        if (prev.settings_version !== data.settings_version && prev.settings_version !== '0') {
          window.dispatchEvent(new CustomEvent('settings-updated', { detail: data }));
        }
        return merged;
      });
      setLastVersion(data.settings_version || '1');
      applyThemeToDocument(merged);
      updateManifestMeta(data);
      registerServiceWorker(data.pwa_enabled !== false);
    } catch (_) {
      applyThemeToDocument(DEFAULTS);
    }
  }, []);

  useEffect(() => {
    applyThemeToDocument(DEFAULTS);
    refresh();
    const interval = setInterval(refresh, 20000);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  return (
    <SettingsContext.Provider value={{ settings, loading: false, refresh, lastVersion }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export default SettingsContext;
