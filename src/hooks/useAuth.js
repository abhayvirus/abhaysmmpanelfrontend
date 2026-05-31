import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signOut } from 'firebase/auth';
import { isFirebaseConfigured, getFirebaseAuth, getGoogleProvider } from '../firebase';
import { firebaseLogin } from '../api';
import { saveAuthSession, clearAuthSession } from '../utils/authRedirect';

/**
 * Auth hook: Firebase Google popup → backend JWT → localStorage → dashboard redirect
 */
export function useAuth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const persistSession = useCallback(
    (data) => {
      saveAuthSession(data.token, data.user);
      const path = data.user.role === 'admin' ? '/admin' : '/dashboard';
      navigate(path, { replace: true });
    },
    [navigate]
  );

  const loginWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      const message = 'Google sign-in is not configured. Use email and password, or add Firebase keys to Frontend/.env';
      setError(message);
      throw new Error(message);
    }
    const auth = getFirebaseAuth();
    const googleProvider = getGoogleProvider();
    if (!auth || !googleProvider) {
      const message = 'Google sign-in is unavailable';
      setError(message);
      throw new Error(message);
    }

    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken(true);
      const ref = (() => {
        try {
          return sessionStorage.getItem('signup_ref') || '';
        } catch {
          return '';
        }
      })();
      const { data } = await firebaseLogin(idToken, ref || undefined);
      persistSession(data);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Google sign-in failed';
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [persistSession]);

  const logout = useCallback(async () => {
    if (isFirebaseConfigured()) {
      try {
        const auth = getFirebaseAuth();
        if (auth) await signOut(auth);
      } catch (_) {
        /* ignore */
      }
    }
    clearAuthSession();
    navigate('/login', { replace: true });
  }, [navigate]);

  const isAuthenticated = useCallback(() => !!localStorage.getItem('token'), []);

  return {
    loginWithGoogle,
    logout,
    loading,
    error,
    setError,
    isAuthenticated,
    persistSession,
    googleEnabled: isFirebaseConfigured(),
  };
}

export default useAuth;
