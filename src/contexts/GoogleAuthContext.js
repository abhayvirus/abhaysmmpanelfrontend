import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID, isGoogleConfigured as isBuildGoogleConfigured } from '../config/google';
import { API_BASE, getAuthConfig } from '../api';

const GoogleAuthContext = createContext({
  enabled: false,
  clientId: '',
  oauthStartUrl: '',
  loading: true,
});

export function useGoogleAuth() {
  return useContext(GoogleAuthContext);
}

/**
 * Loads Google OAuth config from build env or API (/auth/config).
 * Wraps children in GoogleOAuthProvider when client ID is available.
 */
export function GoogleAuthProvider({ children }) {
  const [state, setState] = useState(() => ({
    enabled: false,
    clientId: isBuildGoogleConfigured() ? GOOGLE_CLIENT_ID : '',
    oauthStartUrl: `${API_BASE}/api/auth/google`,
    loading: !isBuildGoogleConfigured(),
  }));

  useEffect(() => {
    let cancelled = false;
    getAuthConfig()
      .then(({ data }) => {
        if (cancelled) return;
        const clientId = data?.googleClientId || state.clientId || GOOGLE_CLIENT_ID;
        const enabled = Boolean(data?.googleEnabled && clientId?.includes('.apps.googleusercontent.com'));
        setState({
          enabled,
          clientId: enabled ? clientId : '',
          oauthStartUrl: data?.googleAuthUrl || `${API_BASE}/api/auth/google`,
          loading: false,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            enabled: isBuildGoogleConfigured(),
            clientId: isBuildGoogleConfigured() ? GOOGLE_CLIENT_ID : '',
            loading: false,
          }));
        }
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      enabled: state.enabled,
      clientId: state.clientId,
      oauthStartUrl: state.oauthStartUrl,
      loading: state.loading,
    }),
    [state]
  );

  const inner = (
    <GoogleAuthContext.Provider value={value}>
      {children}
    </GoogleAuthContext.Provider>
  );

  if (!state.clientId || !state.clientId.includes('.apps.googleusercontent.com')) {
    return inner;
  }

  return (
    <GoogleOAuthProvider clientId={state.clientId}>
      {inner}
    </GoogleOAuthProvider>
  );
}

export default GoogleAuthContext;
