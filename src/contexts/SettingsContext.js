import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getPublicSettings } from '../api';
import { registerServiceWorker, updateManifestMeta } from '../utils/pwa';
import { BRAND } from '../config/brand';
import { DEFAULT_THEME, mergeTheme, applyThemeVars, getResolvedThemeMode } from '../theme/themeConfig';

const SettingsContext = createContext(null);

const DEFAULTS = {
  site_name: BRAND.name,
  site_tagline: BRAND.tagline,
  site_logo: '',
  currency_symbol: '₹',
  currency_code: 'INR',
  ...DEFAULT_THEME,
  maintenance_mode: false,
  settings_version: '0',
};

export { getResolvedThemeMode };

export function applyThemeToDocument(settings = {}) {
  applyThemeVars(document.documentElement, settings);
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [lastVersion, setLastVersion] = useState('0');

  const refresh = useCallback(async () => {
    try {
      const { data } = await getPublicSettings();
      const merged = { ...DEFAULTS, ...data, ...mergeTheme(data) };
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
    const interval = setInterval(refresh, 15000);
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
