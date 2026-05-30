import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getChatMessages, sendChatMessage } from '../api';
import { useSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useDraggableFloat } from '../hooks/useDraggableFloat';

const CRITICAL_PATHS = [
  '/dashboard',
  '/add-funds',
  '/services',
  '/orders',
  '/tickets',
  '/notifications',
  '/profile',
];

const LiveChatWidget = () => {
  const location = useLocation();
  const { settings } = useSettings();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottom = useRef(null);
  const token = localStorage.getItem('token');

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 767;
  const isServicesPage = location.pathname.startsWith('/services');
  const isTicketsPage = location.pathname.startsWith('/tickets');
  const isNotificationsPage = location.pathname.startsWith('/notifications');
  const isProfilePage = location.pathname.startsWith('/profile');
  let extraBottomReserve = 0;
  if (isMobile) {
    if (isTicketsPage && location.pathname !== '/tickets') extraBottomReserve = 120;
    else if (isTicketsPage) extraBottomReserve = 72;
    else if (isNotificationsPage) extraBottomReserve = 72;
    else if (isProfilePage) extraBottomReserve = 140;
    else if (isServicesPage) extraBottomReserve = 56;
  }

  const {
    position,
    style: fabStyle,
    handlers,
    wasDragged,
    setPositionSafe,
    size: fabSize,
    getBottomReserve,
  } = useDraggableFloat({
    storageKey: 'abhaysmm_live_chat_fab_pos',
    size: 52,
    extraBottomReserve,
    enabled: Boolean(settings.live_chat_enabled && token),
  });

  const load = useCallback(() => {
    if (!token) return;
    getChatMessages().then((r) => setMsgs(r.data)).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!open || !token) return undefined;
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [open, token, load]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, open]);

  useEffect(() => {
    if (!position) return;
    const isCritical = CRITICAL_PATHS.some((p) => location.pathname.startsWith(p));
    if (!isCritical) return;
    const bottomPad = getBottomReserve();
    const maxY = window.innerHeight - fabSize - bottomPad;
    if (position.y > maxY) {
      setPositionSafe(position.x, maxY);
    }
  }, [location.pathname, position, fabSize, setPositionSafe, getBottomReserve]);

  useEffect(() => {
    if (!isProfilePage || !position || typeof window === 'undefined') return;
    const margin = 12;
    const bottomR = getBottomReserve();
    setPositionSafe(
      window.innerWidth - fabSize - margin,
      window.innerHeight - fabSize - bottomR - 20
    );
  }, [isProfilePage, fabSize, getBottomReserve, setPositionSafe]);

  const panelStyle = useMemo(() => {
    if (!position || typeof window === 'undefined') return {};
    const panelW = Math.min(340, window.innerWidth - 24);
    let left = position.x;
    if (left + panelW > window.innerWidth - 12) {
      left = window.innerWidth - panelW - 12;
    }
    left = Math.max(12, left);

    const openAbove = position.y > window.innerHeight * 0.5;
    if (openAbove) {
      return {
        left: `${left}px`,
        bottom: `${window.innerHeight - position.y + 12}px`,
        top: 'auto',
      };
    }
    return {
      left: `${left}px`,
      top: `${position.y + fabSize + 12}px`,
      bottom: 'auto',
    };
  }, [position, fabSize, open]);

  if (!settings.live_chat_enabled || !token) return null;

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await sendChatMessage(text.trim());
      setText('');
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to send');
    }
    setSending(false);
  };

  const handleFabClick = () => {
    if (wasDragged()) return;
    setOpen((o) => !o);
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
    <>
      <button
        type="button"
        className={`live-chat-fab live-chat-fab--draggable${dragging ? ' live-chat-fab--dragging' : ''}`}
        style={fabStyle}
        onClick={handleFabClick}
        onPointerDown={onPointerDown}
        onPointerMove={handlers.onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        aria-label="Live chat — drag to move"
        title="Drag to move · Tap to open chat"
      >
        💬
      </button>
      {open && (
        <div className="live-chat-panel live-chat-panel--floating card" style={panelStyle}>
          <div className="live-chat-header">
            <strong>{t('chat.title')}</strong>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>×</button>
          </div>
          <div className="live-chat-messages">
            {msgs.map((m) => (
              <div key={m.id} className={`chat-bubble chat-${m.sender_role}`}>
                {m.message}
                <span className="chat-time">
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            <div ref={bottom} />
          </div>
          <div className="live-chat-input">
            <input
              className="input"
              placeholder={t('chat.placeholder')}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button type="button" className="btn btn-primary btn-sm" onClick={send} disabled={sending}>
              {t('chat.send')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveChatWidget;
