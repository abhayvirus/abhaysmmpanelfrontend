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

const SESSION_DURATION_MS = 60 * 60 * 1000;
const SESSION_EXPIRED_MSG = 'Your session expired';

function parseChatResponse(data) {
  if (Array.isArray(data)) {
    return { messages: data, session: null };
  }
  return {
    messages: Array.isArray(data?.messages) ? data.messages : [],
    session: data?.session || null,
  };
}

function formatRemaining(ms) {
  const total = Math.max(0, Math.floor(Number(ms) / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return `${h}h ${rm}m left`;
  }
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s left`;
  return `${s}s left`;
}

const LiveChatWidget = () => {
  const location = useLocation();
  const { settings } = useSettings();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionNotice, setSessionNotice] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [remainingMs, setRemainingMs] = useState(SESSION_DURATION_MS);
  const bottom = useRef(null);
  const expiredNotified = useRef(false);
  const hadActiveSession = useRef(false);
  const token = localStorage.getItem('token');
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, [token]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 767;
  const isServicesPage = location.pathname.startsWith('/services');
  const isTicketsPage = location.pathname.startsWith('/tickets');
  const isNotificationsPage = location.pathname.startsWith('/notifications');
  const isProfilePage = location.pathname.startsWith('/profile');
  let extraBottomReserve = 0;
  if (isMobile) {
    if (isTicketsPage && location.pathname !== '/tickets') extraBottomReserve = 120;
    else if (isTicketsPage) extraBottomReserve = 72;
    else if (isNotificationsPage) extraBottomReserve = 96;
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
    enabled:
      settings.live_chat_enabled !== false &&
      settings.live_chat_enabled !== 'false' &&
      Boolean(token) &&
      !open,
  });

  const expireSession = useCallback((notice = SESSION_EXPIRED_MSG) => {
    setSessionExpired(true);
    setRemainingMs(0);
    setSessionNotice(notice);
    setOpen(false);
    setText('');
    hadActiveSession.current = false;
    window.setTimeout(() => setSessionNotice(''), 4500);
  }, []);

  const applySession = useCallback((session) => {
    if (!session) return;
    const expired = Boolean(session.session_expired);
    const rem = Number(session.remaining_ms);
    const safeRem = Number.isFinite(rem) ? rem : SESSION_DURATION_MS;

    if (expired) {
      // Active chat just timed out → toast + close. Otherwise ready for a new 1-hour session.
      if (hadActiveSession.current && !expiredNotified.current) {
        expiredNotified.current = true;
        expireSession(SESSION_EXPIRED_MSG);
        return;
      }
      setSessionExpired(false);
      setRemainingMs(SESSION_DURATION_MS);
      return;
    }

    expiredNotified.current = false;
    setSessionExpired(false);
    setRemainingMs(safeRem);
    if (session.session_started_at) {
      hadActiveSession.current = true;
    }
  }, [expireSession]);

  const load = useCallback(() => {
    if (!token) return;
    getChatMessages()
      .then((r) => {
        const { messages, session } = parseChatResponse(r.data);
        setMsgs(messages);
        applySession(session);
      })
      .catch(() => {});
  }, [token, applySession]);

  useEffect(() => {
    if (!open || !token) return undefined;
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [open, token, load]);

  useEffect(() => {
    if (!open || sessionExpired) return undefined;
    const id = setInterval(() => {
      setRemainingMs((prev) => {
        const next = Math.max(0, prev - 1000);
        if (next <= 0 && hadActiveSession.current && !expiredNotified.current) {
          expiredNotified.current = true;
          // Defer expire to avoid setState during setState
          window.setTimeout(() => expireSession(SESSION_EXPIRED_MSG), 0);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [open, sessionExpired, expireSession]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, open]);

  useEffect(() => {
    if (!position || open) return;
    const isCritical = CRITICAL_PATHS.some((p) => location.pathname.startsWith(p));
    if (!isCritical) return;
    const bottomPad = getBottomReserve();
    const maxY = window.innerHeight - fabSize - bottomPad;
    if (position.y > maxY) {
      setPositionSafe(position.x, maxY);
    }
  }, [location.pathname, position, fabSize, setPositionSafe, getBottomReserve, open]);

  useEffect(() => {
    if (!isProfilePage || !position || open || typeof window === 'undefined') return;
    const margin = 12;
    const bottomR = getBottomReserve();
    setPositionSafe(
      window.innerWidth - fabSize - margin,
      window.innerHeight - fabSize - bottomR - 20
    );
  }, [isProfilePage, fabSize, getBottomReserve, setPositionSafe, open]);

  const [isMobileViewport, setIsMobileViewport] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= 767
  );

  useEffect(() => {
    const onResize = () => setIsMobileViewport(window.innerWidth <= 767);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const panelStyle = useMemo(() => {
    if (typeof window === 'undefined') return {};
    if (isMobileViewport) {
      return {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        width: '100%',
        maxWidth: 'none',
        maxHeight: 'none',
        height: '100%',
        borderRadius: 0,
      };
    }
    return {
      right: '1.25rem',
      bottom: '5.5rem',
      left: 'auto',
      top: 'auto',
      width: 'min(380px, calc(100vw - 1.5rem))',
      height: 'min(520px, calc(100dvh - 7rem))',
    };
  }, [isMobileViewport]);

  useEffect(() => {
    if (!open || !isMobileViewport) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isMobileViewport]);

  const chatOn =
    settings.live_chat_enabled !== false && settings.live_chat_enabled !== 'false';
  if (!chatOn || !token) return null;

  const send = async () => {
    if (!text.trim() || sending || sessionExpired) return;
    setSending(true);
    try {
      const res = await sendChatMessage(text.trim());
      setText('');
      const data = res.data || {};
      hadActiveSession.current = true;
      await new Promise((resolve) => {
        getChatMessages()
          .then((r) => {
            const { messages, session } = parseChatResponse(r.data);
            setMsgs(messages);
            applySession(session);
          })
          .finally(resolve);
      });
      if (data.session_expired || data.code === 'SESSION_EXPIRED') {
        expireSession(data.message || SESSION_EXPIRED_MSG);
      } else if (typeof data.remaining_ms === 'number') {
        setRemainingMs(data.remaining_ms);
        setSessionExpired(false);
      }
    } catch (e) {
      const data = e.response?.data || {};
      if (data.code === 'SESSION_EXPIRED' || e.response?.status === 403) {
        expireSession(data.message || SESSION_EXPIRED_MSG);
      } else {
        alert(data.message || 'Failed to send');
      }
    }
    setSending(false);
  };

  const handleFabClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wasDragged()) return;
    expiredNotified.current = false;
    setSessionExpired(false);
    setOpen(true);
    getChatMessages()
      .then((r) => {
        const { messages, session } = parseChatResponse(r.data);
        setMsgs(messages);
        applySession(session);
      })
      .catch(() => {});
  };

  const onPointerDown = (e) => {
    setDragging(true);
    handlers.onPointerDown(e);
  };

  const endPointer = (e) => {
    handlers.onPointerUp(e);
    setTimeout(() => setDragging(false), 0);
  };

  const displayName = user.name || 'You';
  const displayEmail = user.email || '';
  const statusLabel = sessionExpired
    ? 'Session limit reached'
    : hadActiveSession.current || remainingMs < SESSION_DURATION_MS
      ? formatRemaining(remainingMs)
      : '1 hour session';

  return (
    <>
      {sessionNotice ? (
        <div className="live-chat-session-toast" role="status">
          {sessionNotice}
        </div>
      ) : null}

      {!open && (
        <button
          type="button"
          className={`live-chat-fab live-chat-fab--draggable${dragging ? ' live-chat-fab--dragging' : ''}`}
          style={fabStyle}
          onClick={handleFabClick}
          onPointerDown={onPointerDown}
          onPointerMove={handlers.onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          aria-label="Open live chat"
          title="Open chat"
        >
          💬
        </button>
      )}

      {open && (
        <div
          className={`live-chat-panel live-chat-panel--floating live-chat-panel--wa card${
            isMobileViewport ? ' live-chat-panel--mobile-full' : ''
          }`}
          style={panelStyle}
          role="dialog"
          aria-modal="true"
          aria-label="Live support chat"
        >
          <div className="live-chat-wa-header">
            <div className="live-chat-wa-avatar" aria-hidden="true">💬</div>
            <div className="live-chat-wa-title">
              <strong>{t('chat.title') || 'Live Support'}</strong>
              <span>{statusLabel}</span>
            </div>
            <button
              type="button"
              className="live-chat-wa-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className="live-chat-wa-identity">
            Messaging as <b>{displayName}</b>
            {displayEmail ? <> · {displayEmail}</> : null}
          </div>

          <div className="live-chat-messages live-chat-wa-messages">
            {msgs.length === 0 && (
              <div className="live-chat-wa-empty">
                Say hello — live chat sessions last 1 hour.
              </div>
            )}
            {msgs.map((m) => (
              <div
                key={m.id}
                className={`chat-bubble chat-${m.sender_role || 'user'} chat-bubble--wa`}
              >
                <div className="chat-bubble-text">{m.message}</div>
                <span className="chat-time">
                  {m.created_at
                    ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : ''}
                </span>
              </div>
            ))}
            <div ref={bottom} />
          </div>

          <div className="live-chat-input live-chat-wa-input">
            <input
              className="input"
              placeholder={
                sessionExpired
                  ? SESSION_EXPIRED_MSG
                  : (t('chat.placeholder') || 'Type a message…')
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !sessionExpired && send()}
              disabled={sending || sessionExpired}
              autoFocus={!sessionExpired}
            />
            <button
              type="button"
              className="btn btn-primary btn-sm live-chat-wa-send"
              onClick={send}
              disabled={sending || sessionExpired || !text.trim()}
            >
              {sending ? '…' : (t('chat.send') || 'Send')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveChatWidget;
