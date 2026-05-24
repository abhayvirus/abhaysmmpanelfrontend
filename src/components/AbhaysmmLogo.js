import React from 'react';
import BrandLogo from './BrandLogo';
import { useSettings } from '../contexts/SettingsContext';

/** ABHAYSMM logo — circular logo.png + optional text */
const AbhaysmmLogo = ({ size = 'md', showSubtitle = false, showText = true }) => {
  const { settings } = useSettings();
  return (
    <BrandLogo
      size={size}
      showText={showText}
      showSubtitle={showSubtitle}
      siteLogo={settings.site_logo}
    />
  );
};

export default AbhaysmmLogo;
