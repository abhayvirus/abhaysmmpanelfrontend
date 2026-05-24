import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import { useSettings } from './SettingsContext';

const packs = { en, hi };
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const { settings } = useSettings();
  const [lang, setLang] = useState(() => localStorage.getItem('language') || settings.default_language || 'en');

  useEffect(() => {
    if (settings.default_language && !localStorage.getItem('language')) {
      setLang(settings.default_language);
    }
  }, [settings.default_language]);

  const setLanguage = useCallback((code) => {
    setLang(code);
    localStorage.setItem('language', code);
  }, []);

  const t = useCallback((key) => packs[lang]?.[key] || packs.en[key] || key, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage requires LanguageProvider');
  return ctx;
}
