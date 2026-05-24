import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getPublicSettings } from '../api';
import { registerServiceWorker, updateManifestMeta } from '../utils/pwa';

const SettingsContext = createContext(null);

const DEFAULTS = {
  site_name: 'SMM Panel',
  site_tagline: '',
  site_logo: '',
  currency_symbol: '₹',
  currency_code: 'INR',
  theme_primary: '#6366f1',
  theme_accent: '#a855f7',
  theme_mode: 'dark',
  maintenance_mode: false,
  settings_version: '0',
};

export function applyThemeToDocument(settings) {
  const root = document.documentElement;
  const primary = settings.theme_primary || DEFAULTS.theme_primary;
  const accent = settings.theme_accent || DEFAULTS.theme_accent;
  root.style.setProperty('--primary', primary);
  root.style.setProperty('--accent', accent);
  root.style.setProperty('--gradient', `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`);
  if (settings.theme_mode === 'light') {
    root.style.setProperty('--bg', '#f4f6fa');
    root.style.setProperty('--bg-card', '#ffffff');
    root.style.setProperty('--text', '#0f172a');
    root.style.setProperty('--text-muted', '#64748b');
    root.style.setProperty('--border', '#e2e8f0');
  } else {
    root.style.setProperty('--bg', '#070b12');
    root.style.setProperty('--bg-card', '#0f1623');
    root.style.setProperty('--text', '#e8edf5');
    root.style.setProperty('--text-muted', '#8b9cb3');
    root.style.setProperty('--border', '#1e2d42');
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [lastVersion, setLastVersion] = useState('0');

  const refresh = useCallback(async () => {
    try {
      const { data } = await getPublicSettings();
      setSettings((prev) => {
        if (prev.settings_version !== data.settings_version && prev.settings_version !== '0') {
          window.dispatchEvent(new CustomEvent('settings-updated', { detail: data }));
        }
        return { ...DEFAULTS, ...data };
      });
      setLastVersion(data.settings_version || '1');
      applyThemeToDocument(data);
      updateManifestMeta(data);
      registerServiceWorker(data.pwa_enabled !== false);
    } catch (_) {
      applyThemeToDocument(DEFAULTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
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
    <SettingsContext.Provider value={{ settings, loading, refresh, lastVersion }}>
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
