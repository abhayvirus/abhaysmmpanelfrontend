import React from 'react';
import { useLocation } from 'react-router-dom';
import { useIdleLogout } from '../hooks/useIdleLogout';
import { useAuthSession } from '../hooks/useAuthSession';
import { shouldShowLandingTelegramWidgets } from '../constants/telegramChannel';
import WhatsAppFloat from './WhatsAppFloat';
import TelegramFloat from './TelegramFloat';
import TelegramChannelPopup from './TelegramChannelPopup';
import LiveChatWidget from './LiveChatWidget';
import NotificationToasts from './NotificationToasts';

/** Global premium widgets for authenticated user routes */
const PremiumFeatures = () => {
  const location = useLocation();
  const isLoggedIn = useAuthSession();
  const showLandingTelegram = shouldShowLandingTelegramWidgets(location.pathname, isLoggedIn);
  const showUserWidgets = isLoggedIn && !location.pathname.startsWith('/admin');

  useIdleLogout(showUserWidgets);

  return (
    <>
      <TelegramChannelPopup />
      {showUserWidgets ? (
        <>
          <WhatsAppFloat />
          <LiveChatWidget />
          <NotificationToasts />
        </>
      ) : (
        <WhatsAppFloat />
      )}
      {showLandingTelegram && <TelegramFloat />}
    </>
  );
};

export default PremiumFeatures;
