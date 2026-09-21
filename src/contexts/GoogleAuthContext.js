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

function pickClientId(...candidates) {
  for (const c of candidates) {
    const id = String(c || '').trim();
    if (id.includes('.apps.googleusercontent.com') && !id.toLowerCase().startsWith('your_')) {
      return id;
    }
  }
  return '';
}

/**
 * Loads Google OAuth config from build env or API (/auth/config).
 * Keeps a stable clientId so GSI initialize() is not called repeatedly.
 */
export function GoogleAuthProvider({ children }) {
  const buildId = isBuildGoogleConfigured() ? GOOGLE_CLIENT_ID.trim() : '';
  const stableClientIdRef = useRef(buildId);
  const [state, setState] = useState(() => ({
    // Show Google ASAP when build env has client id (don't wait for API)
    enabled: Boolean(buildId),
    clientId: buildId,
    oauthStartUrl: `${API_BASE}/api/auth/google`,
    loading: true,
  }));

  useEffect(() => {
    let cancelled = false;
    getAuthConfig()
      .then(({ data }) => {
        if (cancelled) return;
        const fromApi = pickClientId(data?.googleClientId);
        const nextId = pickClientId(fromApi, stableClientIdRef.current, GOOGLE_CLIENT_ID);
        if (nextId && !stableClientIdRef.current) {
          stableClientIdRef.current = nextId;
        }
        const clientId = stableClientIdRef.current || nextId;
        // Admin can disable via googleEnabled:false only when no usable client id is available
        const adminOff = data?.googleEnabled === false && !fromApi && !buildId;
        const enabled = Boolean(clientId) && !adminOff;
        setState({
          enabled,
          clientId: enabled ? clientId : '',
          oauthStartUrl:
            data?.googleAuthUrl
            || `${API_BASE}/api/auth/google`,
          loading: false,
        });
      })
      .catch(() => {
        if (!cancelled) {
          const clientId = pickClientId(stableClientIdRef.current, GOOGLE_CLIENT_ID);
          setState({
            enabled: Boolean(clientId),
            clientId,
            oauthStartUrl: `${API_BASE}/api/auth/google`,
            loading: false,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [buildId]);

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

  const providerId = stableClientIdRef.current || state.clientId;
  if (!providerId || !providerId.includes('.apps.googleusercontent.com')) {
    return inner;
  }

  return <GoogleOAuthProvider clientId={providerId}>{inner}</GoogleOAuthProvider>;
}

export default GoogleAuthContext;
