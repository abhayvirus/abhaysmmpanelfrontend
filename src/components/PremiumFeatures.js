import React from 'react';
import { useLocation } from 'react-router-dom';
import { useIdleLogout } from '../hooks/useIdleLogout';
import WhatsAppFloat from './WhatsAppFloat';
import LiveChatWidget from './LiveChatWidget';
import NotificationToasts from './NotificationToasts';

/** Global premium widgets for authenticated user routes */
const PremiumFeatures = () => {
  const location = useLocation();
  const isAuth = !!localStorage.getItem('token');
  const isPublicAuth = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'].includes(location.pathname);
  const show = isAuth && !location.pathname.startsWith('/admin');

  useIdleLogout(show);

  if (!show && !isPublicAuth) {
    return <WhatsAppFloat />;
  }

  return (
    <>
      {show && (
        <>
          <WhatsAppFloat />
          <LiveChatWidget />
          <NotificationToasts />
        </>
      )}
      {!show && <WhatsAppFloat />}
    </>
  );
};

export default PremiumFeatures;
