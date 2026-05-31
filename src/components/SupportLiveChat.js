import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getChatMessages, getChatUnreadCount, sendChatMessage } from '../api';
import { useSettings } from '../contexts/SettingsContext';
import '../styles/supportLiveChat.css';

const POLL_MS = 3000;

const formatTime = (iso) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });

const SupportLiveChat = () => {
  const { settings } = useSettings();
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);
  const endRef = useRef(null);

  const enabled = settings.live_chat_enabled !== false && settings.live_chat_enabled !== 'false';

  const load = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    return getChatMessages()
      .then((r) => {
        setMsgs(r.data || []);
        return getChatUnreadCount();
      })
      .then((r) => setUnread(r.data?.count || 0))
      .catch(() => setMsgs([]))
      .finally(() => { if (!silent) setLoading(false); });
  }, []);

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
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const body = text.trim();
    setText('');
    try {
      await sendChatMessage(body);
      await load(true);
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    } catch {
      setText(body);
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

  return (
    <div className="support-live-chat">
      <div className="support-live-chat__head">
        <h2>Live Chat with Support</h2>
        {unread > 0 && <span className="support-live-chat__badge">{unread} new</span>}
      </div>
      <div className="support-live-chat__messages">
        {loading && msgs.length === 0 ? (
          <p className="support-live-chat__empty">Loading messages…</p>
        ) : msgs.length === 0 ? (
          <p className="support-live-chat__empty">No messages yet. Say hello to our support team.</p>
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
          placeholder="Type your message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          disabled={sending}
          aria-label="Message"
        />
        <button type="button" className="btn btn-primary" onClick={send} disabled={sending || !text.trim()}>
          {sending ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default SupportLiveChat;
