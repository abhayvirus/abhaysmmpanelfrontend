import { useEffect, useState } from 'react';
import { isAuthenticated } from '../utils/authRedirect';
import { AUTH_SESSION_EVENT } from '../utils/authEvents';

/** Reactive login state — updates on login, logout, idle timeout, and cross-tab storage changes */
export function useAuthSession() {
  const [loggedIn, setLoggedIn] = useState(() => isAuthenticated());

  useEffect(() => {
    const sync = () => setLoggedIn(isAuthenticated());
    window.addEventListener(AUTH_SESSION_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return loggedIn;
}

export default useAuthSession;
