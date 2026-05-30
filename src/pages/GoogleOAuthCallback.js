import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthBrandHeader from '../components/AuthBrandHeader';
import { getPostLoginPath, saveAuthSession } from '../utils/authRedirect';

/**
 * Handles redirect after server OAuth callback:
 * /auth/google/callback?token=...&user=...  or  ?error=...&code=...
 */
const GoogleOAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Completing Google sign-in...');

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const error = searchParams.get('error') || hashParams.get('error');
    const code = searchParams.get('code') || hashParams.get('code');
    const token = searchParams.get('token') || hashParams.get('token');
    const userB64 = searchParams.get('user') || hashParams.get('user');

    if (error) {
      setMessage(error);
      const timer = setTimeout(() => {
        navigate(`/login?google_error=${encodeURIComponent(error)}&google_code=${encodeURIComponent(code || '')}`, { replace: true });
      }, 2200);
      return () => clearTimeout(timer);
    }

    if (!token) {
      setMessage('Missing sign-in token. Try again.');
      const timer = setTimeout(() => navigate('/login', { replace: true }), 2200);
      return () => clearTimeout(timer);
    }

    try {
      let user = null;
      if (userB64) {
        const json = atob(userB64.replace(/-/g, '+').replace(/_/g, '/'));
        user = JSON.parse(json);
      }
      saveAuthSession(token, user);
      window.history.replaceState(null, '', window.location.pathname);
      navigate(getPostLoginPath(user), { replace: true });
    } catch {
      saveAuthSession(token, null);
      navigate('/dashboard', { replace: true });
    }
    return undefined;
  }, [searchParams, navigate]);

  const isError = Boolean(searchParams.get('error'));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card auth-card" style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <AuthBrandHeader />
        <p className={isError ? 'alert alert-error' : ''} style={{ marginTop: 16 }}>{message}</p>
      </div>
    </div>
  );
};

export default GoogleOAuthCallback;
