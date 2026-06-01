import { useCallback, useEffect, useRef, useState } from 'react';

function isStandaloneDisplay() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
  );
}

/**
 * Captures beforeinstallprompt for one-click native PWA install.
 * Returns null when install is unavailable (no custom fallbacks).
 */
export function usePwaInstall(enabled = true) {
  const deferredRef = useRef(null);
  const [installed, setInstalled] = useState(() => isStandaloneDisplay());
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    if (!enabled) {
      deferredRef.current = null;
      setCanInstall(false);
      return undefined;
    }

    if (isStandaloneDisplay()) {
      setInstalled(true);
      setCanInstall(false);
      return undefined;
    }

    const onBeforeInstall = (event) => {
      event.preventDefault();
      deferredRef.current = event;
      setCanInstall(true);
    };

    const onInstalled = () => {
      deferredRef.current = null;
      setInstalled(true);
      setCanInstall(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [enabled]);

  const promptInstall = useCallback(async () => {
    const deferred = deferredRef.current;
    if (!deferred) return { outcome: 'unavailable' };

    await deferred.prompt();
    const choice = await deferred.userChoice;

    if (choice.outcome === 'accepted') {
      deferredRef.current = null;
      setCanInstall(false);
      setInstalled(true);
    }

    return choice;
  }, []);

  const visible = enabled && (installed || canInstall);

  return {
    installed,
    canInstall,
    visible,
    promptInstall,
  };
}

export default usePwaInstall;
