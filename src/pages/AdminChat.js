import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { adminGetChatConversations, adminGetChatMessages, adminReplyChat } from '../api';

const AdminChat = () => {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [reply, setReply] = useState('');

  const loadConvos = () => adminGetChatConversations().then((r) => setConversations(r.data));
  useEffect(() => { loadConvos(); const id = setInterval(loadConvos, 10000); return () => clearInterval(id); }, []);

  useEffect(() => {
    if (!selected) return undefined;
    const load = () => adminGetChatMessages(selected).then((r) => setMsgs(r.data));
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [selected]);

  const send = async () => {
    if (!reply.trim() || !selected) return;
    await adminReplyChat(selected, reply.trim());
    setReply('');
    adminGetChatMessages(selected).then((r) => setMsgs(r.data));
  };

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 24 }}>Live Chat</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, minHeight: 480 }}>
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          {conversations.map((c) => (
            <button
              key={c.user_id}
              type="button"
              onClick={() => setSelected(c.user_id)}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: 14, border: 'none',
                borderBottom: '1px solid var(--border)', background: selected === c.user_id ? 'var(--bg-hover)' : 'transparent',
                color: 'inherit', cursor: 'pointer',
              }}
            >
              <strong>{c.name}</strong>
              {c.unread > 0 && <span className="badge badge-danger" style={{ marginLeft: 8 }}>{c.unread}</span>}
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>{c.last_message?.slice(0, 40)}</p>
            </button>
          ))}
          {!conversations.length && <p style={{ padding: 16, color: 'var(--text-muted)' }}>No chats yet</p>}
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 16 }}>
          {selected ? (
            <>
              <div style={{ flex: 1, overflowY: 'auto', marginBottom: 12 }}>
                {msgs.map((m) => (
                  <div key={m.id} className={`chat-bubble chat-${m.sender_role}`} style={{ marginBottom: 8 }}>{m.message}</div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply..." onKeyDown={(e) => e.key === 'Enter' && send()} />
                <button type="button" className="btn btn-primary" onClick={send}>Send</button>
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Select a conversation</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminChat;
