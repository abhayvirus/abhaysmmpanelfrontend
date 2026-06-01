import React from 'react';
import { usePwaInstall } from '../hooks/usePwaInstall';

/**
 * One-click PWA install — native browser prompt only.
 * Hidden when install unavailable; shows "Installed" when already in standalone mode.
 */
const PwaInstallButton = ({ enabled = true, className = 'btn btn-primary pwa-install-btn' }) => {
  const { installed, canInstall, visible, promptInstall } = usePwaInstall(enabled);

  if (!visible) return null;

  if (installed) {
    return (
      <span className={`pwa-install-btn pwa-install-btn--installed${className ? ` ${className}` : ''}`} role="status">
        ✅ Installed
      </span>
    );
  }

  const handleClick = () => {
    if (!canInstall) return;
    promptInstall();
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      disabled={!canInstall}
      aria-label="Install App"
    >
      Install App
    </button>
  );
};

export default PwaInstallButton;
