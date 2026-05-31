import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import TelegramIcon from './TelegramIcon';
import { resolveTelegramChannelUrl } from '../constants/telegramChannel';

const TelegramFloat = () => {
  const { settings } = useSettings();
  const url = resolveTelegramChannelUrl(settings);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="telegram-float"
      aria-label="Join Telegram channel"
      title="Join Telegram"
    >
      <TelegramIcon size={22} />
    </a>
  );
};

export default TelegramFloat;
