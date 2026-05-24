import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getChatMessages, sendChatMessage } from '../api';
import { useSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';

const LiveChatWidget = () => {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottom = useRef(null);
  const token = localStorage.getItem('token');

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

  return (
    <>
      <button type="button" className="live-chat-fab" onClick={() => setOpen(!open)} aria-label="Live chat">
        💬
      </button>
      {open && (
        <div className="live-chat-panel card">
          <div className="live-chat-header">
            <strong>{t('chat.title')}</strong>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>×</button>
          </div>
          <div className="live-chat-messages">
            {msgs.map((m) => (
              <div key={m.id} className={`chat-bubble chat-${m.sender_role}`}>
                {m.message}
                <span className="chat-time">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
            <button type="button" className="btn btn-primary btn-sm" onClick={send} disabled={sending}>{t('chat.send')}</button>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveChatWidget;
