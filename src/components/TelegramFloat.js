import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import TelegramIcon from './TelegramIcon';
import { useAuthSession } from '../hooks/useAuthSession';
import { resolveTelegramChannelUrl, shouldShowLandingTelegramWidgets } from '../constants/telegramChannel';
import { useDraggableFloat } from '../hooks/useDraggableFloat';
import '../styles/floatingWidgets.css';

const TelegramFloat = () => {
  const { settings } = useSettings();
  const location = useLocation();
  const [dragging, setDragging] = useState(false);
  const isLoggedIn = useAuthSession();
  const visible = shouldShowLandingTelegramWidgets(location.pathname, isLoggedIn);
  const url = resolveTelegramChannelUrl(settings);

  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
  const fabSize = isMobile ? 44 : 52;

  const { style, handlers, wasDragged } = useDraggableFloat({
    storageKey: 'abhaysmm_telegram_fab_pos',
    size: fabSize,
    margin: 12,
    extraBottomReserve: 0,
    enabled: visible,
  });

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

  if (!visible) return null;

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
