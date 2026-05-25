import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { googleLogin } from '../api';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

function finishSession(navigate, data) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  navigate(data.user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
}

/**
 * Google sign-in: popup (ID token) + server redirect fallback.
 */
const GoogleLoginButton = ({ className = '', style = {} }) => {
  const navigate = useNavigate();
  const { enabled, clientId, oauthStartUrl, loading: configLoading } = useGoogleAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);
  const [btnWidth, setBtnWidth] = useState(320);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => {
      setBtnWidth(Math.floor(el.offsetWidth) || 320);
    });
    ro.observe(el);
    setBtnWidth(Math.floor(el.offsetWidth) || 320);
    return () => ro.disconnect();
  }, []);

  if (configLoading || !enabled) return null;

  const handleRedirectLogin = () => {
    setError('');
    window.location.href = oauthStartUrl;
  };

  const handleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) {
      setError('No token received from Google');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await googleLogin(idToken);
      finishSession(navigate, data);
    } catch (err) {
      const code = err.response?.data?.code;
      const msg = err.response?.data?.message || err.message || 'Google sign-in failed';
      if (code === 'GOOGLE_NOT_CONFIGURED') {
        setError('Google login is not configured on the server. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET on Render.');
      } else if (code === 'DB_UNAVAILABLE' || err.response?.status === 503) {
        setError('Server or database unavailable. Try again or use redirect sign-in below.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const usePopup = Boolean(clientId);

  return (
    <div ref={wrapRef} className={`google-signin-root ${className}`} style={style}>
      {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}

      <div className="google-signin-custom">
        <button
          type="button"
          className="btn-google"
          disabled={loading}
          onClick={usePopup ? undefined : handleRedirectLogin}
          tabIndex={usePopup ? -1 : 0}
          aria-hidden={usePopup ? 'true' : undefined}
        >
          <span className="btn-google-icon"><GoogleIcon /></span>
          <span>{loading ? 'Signing in with Google...' : 'Continue with Google'}</span>
        </button>

        {usePopup && !loading && (
          <div className="google-signin-overlay" aria-label="Continue with Google">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => setError('Google sign-in was cancelled or failed')}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              width={btnWidth}
            />
          </div>
        )}
      </div>

      <button
        type="button"
        className="btn btn-ghost"
        style={{ width: '100%', marginTop: 8, fontSize: 13 }}
        onClick={handleRedirectLogin}
        disabled={loading}
      >
        Sign in with Google (redirect)
      </button>
    </div>
  );
};

export default GoogleLoginButton;
