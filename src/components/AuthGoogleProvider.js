import React, { useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID, isGoogleConfigured } from '../config/google';
import { getAuthConfig } from '../api';

/**
 * Uses REACT_APP_GOOGLE_CLIENT_ID, or fetches client ID from API when build env is missing.
 */
export default function AuthGoogleProvider({ children }) {
  const [clientId, setClientId] = useState(() => (isGoogleConfigured() ? GOOGLE_CLIENT_ID : ''));

  useEffect(() => {
    if (isGoogleConfigured()) return undefined;
    let cancelled = false;
    getAuthConfig()
      .then(({ data }) => {
        if (!cancelled && data?.googleClientId) {
          setClientId(data.googleClientId);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!clientId || !clientId.includes('.apps.googleusercontent.com')) {
    return children;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
