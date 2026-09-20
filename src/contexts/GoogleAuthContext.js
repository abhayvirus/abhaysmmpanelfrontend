import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
 * Keeps a stable clientId so GSI initialize() is not called repeatedly.
 */
export function GoogleAuthProvider({ children }) {
  const stableClientIdRef = useRef(
    isBuildGoogleConfigured() ? GOOGLE_CLIENT_ID : ''
  );
  const [state, setState] = useState(() => ({
    enabled: false,
    clientId: stableClientIdRef.current,
    oauthStartUrl: `${API_BASE}/api/auth/google`,
    loading: !stableClientIdRef.current,
  }));

  useEffect(() => {
    let cancelled = false;
    getAuthConfig()
      .then(({ data }) => {
        if (cancelled) return;
        const fromApi = data?.googleClientId || '';
        const nextId =
          (fromApi.includes('.apps.googleusercontent.com') && fromApi) ||
          stableClientIdRef.current ||
          GOOGLE_CLIENT_ID ||
          '';
        if (nextId && !stableClientIdRef.current) {
          stableClientIdRef.current = nextId;
        }
        const clientId = stableClientIdRef.current || nextId;
        const enabled = Boolean(
          data?.googleEnabled !== false && clientId?.includes('.apps.googleusercontent.com')
        );
        setState({
          enabled: enabled && Boolean(clientId),
          clientId: enabled ? clientId : '',
          oauthStartUrl: data?.googleAuthUrl || `${API_BASE}/api/auth/google`,
          loading: false,
        });
      })
      .catch(() => {
        if (!cancelled) {
          const clientId =
            stableClientIdRef.current || (isBuildGoogleConfigured() ? GOOGLE_CLIENT_ID : '');
          setState((prev) => ({
            ...prev,
            enabled: Boolean(clientId),
            clientId,
            loading: false,
          }));
        }
      });
    return () => {
      cancelled = true;
    };
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
    <GoogleAuthContext.Provider value={value}>{children}</GoogleAuthContext.Provider>
  );

  // Freeze provider clientId after first valid id so GSI initialize() runs once
  const providerId = stableClientIdRef.current;
  if (!providerId || !providerId.includes('.apps.googleusercontent.com')) {
    return inner;
  }

  return <GoogleOAuthProvider clientId={providerId}>{inner}</GoogleOAuthProvider>;
}

export default GoogleAuthContext;
