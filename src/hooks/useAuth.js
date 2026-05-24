import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { firebaseLogin } from '../api';

/**
 * Auth hook: Firebase Google popup → backend JWT → localStorage → dashboard redirect
 */
export function useAuth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const persistSession = useCallback(
    (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      const path = data.user.role === 'admin' ? '/admin' : '/dashboard';
      navigate(path, { replace: true });
    },
    [navigate]
  );

  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken(true);
      const { data } = await firebaseLogin(idToken);
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
    try {
      await signOut(auth);
    } catch (_) {
      /* ignore */
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
  };
}

export default useAuth;
