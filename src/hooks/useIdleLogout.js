import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { clearAuthSession } from '../utils/authRedirect';

/**
 * Auto-logout after idle. Never treat 0/NaN as "0 minutes" (that logged users out instantly).
 */
export function useIdleLogout(enabled = true) {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const timer = useRef(null);
  const parsed = parseInt(settings.session_timeout_minutes, 10);
  // Valid window: 5–1440 minutes. Invalid/0 → disabled (do not logout).
  const minutes = Number.isFinite(parsed) && parsed >= 5 ? Math.min(parsed, 1440) : 0;
  const active = Boolean(enabled && minutes > 0);

  const logout = useCallback(() => {
    clearAuthSession();
    navigate('/login?reason=idle');
  }, [navigate]);

  const reset = useCallback(() => {
    if (!active || !localStorage.getItem('token')) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(logout, minutes * 60 * 1000);
  }, [active, minutes, logout]);

  useEffect(() => {
    if (!active) {
      clearTimeout(timer.current);
      return undefined;
    }
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      clearTimeout(timer.current);
    };
  }, [active, reset]);

  return { reset };
}
