import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import TelegramIcon from './TelegramIcon';
import { useAuthSession } from '../hooks/useAuthSession';
import { useDraggableFloat } from '../hooks/useDraggableFloat';
import { resolveTelegramChannelUrl, shouldShowLandingTelegramWidgets } from '../constants/telegramChannel';
import '../styles/floatingWidgets.css';

const FAB_SIZE = 52;

const TelegramFloat = () => {
  const { settings } = useSettings();
  const location = useLocation();
  const isLoggedIn = useAuthSession();
  const visible = shouldShowLandingTelegramWidgets(location.pathname, isLoggedIn);
  const url = resolveTelegramChannelUrl(settings);
  const [dragging, setDragging] = useState(false);

  const { style, handlers, wasDragged } = useDraggableFloat({
    storageKey: 'abhaysmm_telegram_fab_pos',
    size: FAB_SIZE,
    margin: 12,
    anchor: 'bottom-left',
    landingMode: true,
    enabled: visible,
  });

  if (!visible) return null;

  const handleClick = (e) => {
    if (wasDragged()) {
      e.preventDefault();
    }
  };

  const onPointerDown = (e) => {
    setDragging(true);
    handlers.onPointerDown(e);
  };

  const endPointer = (e) => {
    handlers.onPointerUp(e);
    setTimeout(() => setDragging(false), 0);
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`telegram-float telegram-float--draggable${dragging ? ' telegram-float--dragging' : ''}`}
      style={style}
      onClick={handleClick}
      onPointerDown={onPointerDown}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      aria-label="Join Telegram channel — drag to move"
      title="Drag to move · Tap to open Telegram"
    >
      <TelegramIcon size={22} />
    </a>
  );
};

export default TelegramFloat;
