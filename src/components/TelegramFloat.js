import React from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import TelegramIcon from './TelegramIcon';
import { useAuthSession } from '../hooks/useAuthSession';
import { resolveTelegramChannelUrl, shouldShowLandingTelegramWidgets } from '../constants/telegramChannel';
import '../styles/floatingWidgets.css';

/** Fixed bottom-left Telegram FAB on guest landing (no drag — avoids overlap with activity popup). */
const TelegramFloat = () => {
  const { settings } = useSettings();
  const location = useLocation();
  const isLoggedIn = useAuthSession();
  const visible = shouldShowLandingTelegramWidgets(location.pathname, isLoggedIn);
  const url = resolveTelegramChannelUrl(settings);

  if (!visible) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="telegram-float telegram-float--landing-fixed"
      aria-label="Join Telegram channel"
      title="Join Telegram"
    >
      <TelegramIcon size={22} />
    </a>
  );
};

export default TelegramFloat;
