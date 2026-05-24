import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

const WhatsAppFloat = () => {
  const { settings } = useSettings();
  const url = settings.whatsapp_link;
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="whatsapp-float"
      aria-label="WhatsApp"
      title="Chat on WhatsApp"
    >
      <span style={{ fontSize: 28 }}>💬</span>
    </a>
  );
};

export default WhatsAppFloat;
