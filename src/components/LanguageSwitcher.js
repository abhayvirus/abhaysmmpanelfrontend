import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { updatePreferences } from '../api';

const LanguageSwitcher = () => {
  const { lang, setLanguage } = useLanguage();

  const change = async (code) => {
    setLanguage(code);
    if (localStorage.getItem('token')) {
      try {
        await updatePreferences({ language: code });
      } catch (_) { /* ok */ }
    }
  };

  return (
    <select className="select lang-select" value={lang} onChange={(e) => change(e.target.value)} aria-label="Language">
      <option value="en">EN</option>
      <option value="hi">हिं</option>
    </select>
  );
};

export default LanguageSwitcher;
