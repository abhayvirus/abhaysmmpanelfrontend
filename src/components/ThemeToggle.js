import React, { useEffect, useState } from 'react';
import { applyThemeToDocument } from '../contexts/SettingsContext';
import { useSettings } from '../contexts/SettingsContext';
import { updatePreferences } from '../api';
import { useLanguage } from '../contexts/LanguageContext';

const ThemeToggle = () => {
  const { settings, refresh } = useSettings();
  const { t } = useLanguage();
  const [mode, setMode] = useState(() => localStorage.getItem('user_theme') || settings.theme_mode || 'dark');

  useEffect(() => {
    applyThemeToDocument({ ...settings, theme_mode: mode });
  }, [mode, settings]);

  const toggle = async () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    localStorage.setItem('user_theme', next);
    applyThemeToDocument({ ...settings, theme_mode: next });
    if (localStorage.getItem('token')) {
      try {
        await updatePreferences({ theme_preference: next });
        refresh();
      } catch (_) { /* ok */ }
    }
  };

  return (
    <button type="button" className="btn btn-ghost btn-sm theme-toggle" onClick={toggle} title="Toggle theme">
      {mode === 'dark' ? '☀️' : '🌙'} {mode === 'dark' ? t('theme.light') : t('theme.dark')}
    </button>
  );
};

export default ThemeToggle;
