import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

export function useIdleLogout(enabled = true) {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const timer = useRef(null);
  const minutes = parseInt(settings.session_timeout_minutes || '30', 10);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login?reason=idle');
  }, [navigate]);

  const reset = useCallback(() => {
    if (!enabled || !localStorage.getItem('token')) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(logout, minutes * 60 * 1000);
  }, [enabled, minutes, logout]);

  useEffect(() => {
    if (!enabled) return undefined;
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      clearTimeout(timer.current);
    };
  }, [enabled, reset]);

  return { reset };
}
