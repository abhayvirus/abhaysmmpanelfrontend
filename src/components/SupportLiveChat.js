import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getChatMessages, getChatUnreadCount, sendChatMessage } from '../api';
import { useSettings } from '../contexts/SettingsContext';
import { AUTH_SESSION_EVENT } from '../utils/authEvents';
import '../styles/supportLiveChat.css';

const POLL_MS = 3000;
const SESSION_DURATION_MS = 60 * 60 * 1000;
const SESSION_EXPIRED_MSG = 'Your session expired — live chat is limited to 1 hour per session. Send a new message to start again.';

const formatTime = (iso) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });

function readStoredUserId() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return u?.id != null ? String(u.id) : '';
  } catch {
    return '';
  }
}

function parseChatResponse(data) {
  if (Array.isArray(data)) {
    return { messages: data, session: null, identity: null };
  }
  return {
    messages: Array.isArray(data?.messages) ? data.messages : [],
    session: data?.session || null,
    identity: data?.identity || null,
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

const SupportLiveChat = () => {
  const { settings } = useSettings();
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [remainingMs, setRemainingMs] = useState(SESSION_DURATION_MS);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [authTick, setAuthTick] = useState(0);
  const endRef = useRef(null);
  const expiredNotified = useRef(false);
  const boundUserId = useRef(null);

  const enabled = settings.live_chat_enabled !== false && settings.live_chat_enabled !== 'false';
  const userId = useMemo(() => readStoredUserId(), [authTick]);

  useEffect(() => {
    const sync = () => setAuthTick((n) => n + 1);
    window.addEventListener(AUTH_SESSION_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    if (boundUserId.current === userId) return;
    boundUserId.current = userId;
    setMsgs([]);
    setUnread(0);
    setText('');
    setError('');
    setSessionExpired(false);
    setRemainingMs(SESSION_DURATION_MS);
    setHasActiveSession(false);
    expiredNotified.current = false;
  }, [userId]);

  const load = useCallback((silent = false) => {
    if (!userId) {
      setMsgs([]);
      setLoading(false);
      return Promise.resolve();
    }
    if (!silent) setLoading(true);
    return getChatMessages()
      .then((r) => {
        const { messages, session, identity } = parseChatResponse(r.data);
        if (boundUserId.current !== userId) return null;
        if (identity?.id != null && String(identity.id) !== String(userId)) {
          setMsgs([]);
          return null;
        }
        setMsgs(messages);
        if (session) {
          const expired = Boolean(session.session_expired);
          const rem = Number(session.remaining_ms);
          if (expired) {
            if (hasActiveSession && !expiredNotified.current) {
              expiredNotified.current = true;
              setSessionExpired(true);
              setRemainingMs(0);
              setError(SESSION_EXPIRED_MSG);
              setHasActiveSession(false);
            } else {
              setSessionExpired(false);
              setRemainingMs(SESSION_DURATION_MS);
              setError('');
            }
          } else {
            expiredNotified.current = false;
            setSessionExpired(false);
            setRemainingMs(Number.isFinite(rem) ? rem : SESSION_DURATION_MS);
            if (session.session_started_at) setHasActiveSession(true);
          }
        }
        return getChatUnreadCount();
      })
      .then((r) => {
        if (r && boundUserId.current === userId) setUnread(r.data?.count || 0);
      })
      .catch(() => {
        if (boundUserId.current === userId) setMsgs([]);
      })
      .finally(() => { if (!silent) setLoading(false); });
  }, [hasActiveSession, userId]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }
    load();
    const id = setInterval(() => load(true), POLL_MS);
    const onUpdate = () => load(true);
    window.addEventListener('notifications-updated', onUpdate);
    return () => {
      clearInterval(id);
      window.removeEventListener('notifications-updated', onUpdate);
    };
  }, [enabled, load]);

  useEffect(() => {
    if (sessionExpired || !hasActiveSession) return undefined;
    const id = setInterval(() => {
      setRemainingMs((prev) => {
        const next = Math.max(0, prev - 1000);
        if (next <= 0 && !expiredNotified.current) {
          expiredNotified.current = true;
          setSessionExpired(true);
          setError(SESSION_EXPIRED_MSG);
          setHasActiveSession(false);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [sessionExpired, hasActiveSession]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = async () => {
    if (!text.trim() || sending || !userId) return;
    setSending(true);
    setError('');
    const body = text.trim();
    setText('');
    try {
      const { data } = await sendChatMessage(body);
      setHasActiveSession(true);
      setSessionExpired(false);
      expiredNotified.current = false;
      if (typeof data?.remaining_ms === 'number') {
        setRemainingMs(data.remaining_ms);
      }
      if (data?.session_expired || data?.code === 'SESSION_EXPIRED') {
        setSessionExpired(true);
        setError(data.message || SESSION_EXPIRED_MSG);
        setHasActiveSession(false);
      }
      await load(true);
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    } catch (e) {
      setText(body);
      const data = e.response?.data || {};
      if (data.code === 'SESSION_EXPIRED' || e.response?.status === 403) {
        setSessionExpired(true);
        setError(data.message || SESSION_EXPIRED_MSG);
        setHasActiveSession(false);
      } else {
        setError(data.message || 'Failed to send message');
      }
    }
    setSending(false);
  };

  if (!enabled) {
    return (
      <div className="card support-live-chat support-live-chat--disabled">
        <p>Live chat is currently unavailable. Please open a support ticket.</p>
      </div>
    );
  }

  const statusLabel = sessionExpired
    ? 'Session expired — send a message to start a new 1-hour session'
    : hasActiveSession
      ? formatRemaining(remainingMs)
      : '1 hour session';

  return (
    <div className="support-live-chat">
      <div className="support-live-chat__head">
        <h2>Live Chat with Support</h2>
        {unread > 0 && <span className="support-live-chat__badge">{unread} new</span>}
        <span className="support-live-chat__meta" style={{ marginLeft: 'auto', opacity: 0.75, fontSize: '0.85rem' }}>
          {statusLabel}
        </span>
      </div>
      {error && <div className="alert alert-danger" style={{ margin: '0 0 0.75rem' }}>{error}</div>}
      {sessionExpired && (
        <div className="alert alert-warning" style={{ margin: '0 0 0.75rem' }}>
          {SESSION_EXPIRED_MSG}
        </div>
      )}
      <div className="support-live-chat__messages">
        {loading && msgs.length === 0 ? (
          <p className="support-live-chat__empty">Loading messages…</p>
        ) : msgs.length === 0 ? (
          <p className="support-live-chat__empty">
            No messages yet. Say hello — live chat sessions last 1 hour.
          </p>
        ) : (
          msgs.map((m) => {
            const role = m.sender_role === 'admin' ? 'admin' : m.sender_role === 'system' ? 'system' : 'user';
            return (
              <div key={m.id} className={`support-live-chat__bubble support-live-chat__bubble--${role}`}>
                {role === 'admin' && <small>ABHAYSMM Support</small>}
                <p>{m.message}</p>
                <time>{formatTime(m.created_at)}</time>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>
      <div className="support-live-chat__compose">
        <input
          className="input"
          placeholder={sessionExpired ? 'Send a message to start a new session…' : 'Type your message…'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          disabled={sending}
          aria-label="Message"
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={send}
          disabled={sending || !text.trim()}
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default SupportLiveChat;
