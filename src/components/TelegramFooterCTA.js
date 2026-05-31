import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import TelegramIcon from './TelegramIcon';
import { resolveTelegramChannelUrl } from '../constants/telegramChannel';
import '../styles/telegramFooterCta.css';

const TelegramFooterCTA = () => {
  const { settings } = useSettings();
  const channelUrl = resolveTelegramChannelUrl(settings);

  return (
    <div className="telegram-footer-cta">
      <a
        href={channelUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="telegram-footer-cta__btn"
      >
        <TelegramIcon size={20} className="telegram-footer-cta__btn-icon" />
        Join Telegram
      </a>
      <p className="telegram-footer-cta__hint">
        Get instant updates, offers, new services, and support directly on Telegram.
      </p>
    </div>
  );
};

export default TelegramFooterCTA;
