import React, { useEffect, useState } from 'react';

/**
 * Shows "Install web app" when browser supports beforeinstallprompt and PWA is enabled.
 */
const PwaInstallButton = ({ enabled = true, className = 'btn btn-primary' }) => {
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;
    const onInstall = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }
    window.addEventListener('beforeinstallprompt', onInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [enabled]);

  if (!enabled || installed) return null;

  const handleInstall = async () => {
    if (!deferred) {
      alert('To install: use your browser menu → "Add to Home Screen" or "Install app".');
      return;
    }
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') setDeferred(null);
  };

  return (
    <button type="button" className={className} onClick={handleInstall}>
      📲 Install Web App (PWA)
    </button>
  );
};

export default PwaInstallButton;
