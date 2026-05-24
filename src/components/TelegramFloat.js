import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

const TelegramFloat = () => {
  const { settings } = useSettings();
  const url = settings.telegram_link;
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="telegram-float"
      aria-label="Telegram support"
      title="Telegram Support"
    >
      ✈️
    </a>
  );
};

export default TelegramFloat;
