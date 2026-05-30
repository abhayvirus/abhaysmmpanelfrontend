import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { useMedia } from '../hooks/useMedia';
import {
  adminGetChatConversations,
  adminGetChatThread,
  adminReplyChat,
  adminDeleteChatMessage,
  adminResolveChat,
  adminClearChatConversation,
  adminUpdateUser,
} from '../api';

const POLL_CONVOS_MS = 4000;
const POLL_MSGS_MS = 3000;
const ONLINE_MS = 5 * 60 * 1000;

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hr ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatMsgTime = (dateStr) =>
  new Date(dateStr).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

const isOnline = (lastAt) => {
  if (!lastAt) return false;
  return Date.now() - new Date(lastAt).getTime() < ONLINE_MS;
};

const AdminChat = () => {
  const { isMobile } = useMedia();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [threadUser, setThreadUser] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [mobileScreen, setMobileScreen] = useState('list');
  const [showDetails, setShowDetails] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [toast, setToast] = useState(null);
  const messagesEndRef = useRef(null);

  const selectedConvo = conversations.find((c) => c.user_id === selectedId);

  const showToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(null), 2800);
  };

  const loadConvos = useCallback(() => {
    adminGetChatConversations()
      .then((r) => setConversations(r.data || []))
      .catch(() => {});
  }, []);

  const loadThread = useCallback((userId) => {
    if (!userId) return;
    adminGetChatThread(userId)
      .then((r) => {
        const { user, messages } = r.data;
        setThreadUser(user);
        setMsgs(messages || []);
        loadConvos();
      })
      .catch(() => showToast('Failed to load chat'));
  }, [loadConvos]);

  useEffect(() => {
    loadConvos();
    const id = setInterval(loadConvos, POLL_CONVOS_MS);
    return () => clearInterval(id);
  }, [loadConvos]);

  useEffect(() => {
    if (!selectedId) return undefined;
    loadThread(selectedId);
    const id = setInterval(() => loadThread(selectedId), POLL_MSGS_MS);
    return () => clearInterval(id);
  }, [selectedId, loadThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const openChat = (userId) => {
    setSelectedId(userId);
    if (isMobile) setMobileScreen('chat');
  };

  const closeMobileChat = () => {
    setMobileScreen('list');
    setShowDetails(false);
    setSelectedId(null);
  };

  const send = async () => {
    if (!reply.trim() || !selectedId || sending) return;
    setSending(true);
    const text = reply.trim();
    setReply('');
    try {
      const { data } = await adminReplyChat(selectedId, text);
      if (data?.id) {
        setMsgs((prev) => [...prev, data]);
      } else {
        loadThread(selectedId);
      }
      loadConvos();
    } catch {
      setReply(text);
      showToast('Failed to send message');
    }
    setSending(false);
  };

  const deleteMsg = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await adminDeleteChatMessage(messageId);
      setMsgs((prev) => prev.filter((m) => m.id !== messageId));
      showToast('Message deleted');
    } catch {
      showToast('Delete failed');
    }
  };

  const markResolved = async () => {
    if (!selectedId) return;
    try {
      await adminResolveChat(selectedId);
      loadThread(selectedId);
      loadConvos();
      showToast('Marked as resolved');
    } catch {
      showToast('Could not mark resolved');
    }
  };

  const clearConversation = async () => {
    if (!selectedId) return;
    setClearing(true);
    try {
      const { data } = await adminClearChatConversation(selectedId);
      setMsgs([]);
      setClearOpen(false);
      loadConvos();
      showToast(`Conversation cleared (${data.deleted || 0} messages)`);
    } catch (e) {
      showToast(e.response?.data?.message || 'Clear failed');
    }
    setClearing(false);
  };

  const blockUser = async () => {
    if (!threadUser) return;
    if (!window.confirm(`Block ${threadUser.name}? They will not be able to use the panel.`)) return;
    try {
      await adminUpdateUser(threadUser.id, {
        balance: threadUser.balance,
        status: 'BANNED',
        role: 'user',
      });
      setThreadUser((u) => ({ ...u, status: 'BANNED', blocked: 1 }));
      showToast('User blocked');
    } catch (e) {
      showToast(e.response?.data?.message || 'Block failed');
    }
  };

  const online = isOnline(selectedConvo?.last_at || threadUser?.last_message_at);
  const displayName = threadUser?.name || selectedConvo?.name || 'User';
  const displayEmail = threadUser?.email || selectedConvo?.email || '—';

  const pageClass = [
    'admin-chat-page',
    isMobile && mobileScreen === 'chat' ? 'admin-chat-page--mobile-chat' : '',
    isMobile && mobileScreen === 'list' ? 'admin-chat-page--mobile-list' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const UserDetailsCard = ({ className = '' }) => {
    if (!threadUser) return null;
    return (
      <div className={`admin-chat-user-card ${className}`.trim()}>
        <div className="admin-chat-user-card-row">
          <span>Name</span>
          <span>{threadUser.name}</span>
        </div>
        <div className="admin-chat-user-card-row">
          <span>Email</span>
          <span className="admin-chat-user-email">{threadUser.email || '—'}</span>
        </div>
        <div className="admin-chat-user-card-row">
          <span>User ID</span>
          <span>#{threadUser.id}</span>
        </div>
        <div className="admin-chat-user-card-row">
          <span>Wallet</span>
          <span>₹{parseFloat(threadUser.balance || 0).toFixed(2)}</span>
        </div>
        <div className="admin-chat-user-card-row">
          <span>Total Orders</span>
          <span>{threadUser.total_orders ?? 0}</span>
        </div>
        <div className="admin-chat-user-card-row">
          <span>Join Date</span>
          <span>{formatDate(threadUser.created_at)}</span>
        </div>
      </div>
    );
  };

  const ActionToolbar = ({ layout = 'row' }) => (
    <div className={`admin-chat-toolbar admin-chat-toolbar--${layout}`}>
      <button type="button" className="btn btn-ghost btn-sm" onClick={markResolved}>
        ✓ Resolved
      </button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setClearOpen(true)}>
        🗑 Clear conversation
      </button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={blockUser}>
        Block user
      </button>
      <Link to="/admin/users" className="btn btn-ghost btn-sm">
        Open users
      </Link>
    </div>
  );

  return (
    <AdminLayout>
      <div className={pageClass}>
        <h1 className="admin-page-title">Live Chat</h1>

        <div className="admin-chat-shell">
          <aside className="admin-chat-list">
            <div className="admin-chat-list-header">Conversations</div>
            <div className="admin-chat-list-scroll">
              {conversations.map((c) => (
                <button
                  key={c.user_id}
                  type="button"
                  className={`admin-chat-convo-btn${selectedId === c.user_id ? ' is-active' : ''}`}
                  onClick={() => openChat(c.user_id)}
                >
                  <div className="admin-chat-convo-top">
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span className="admin-chat-convo-name">{c.name || 'User'}</span>
                      <span className="admin-chat-convo-email">{c.email || 'No email'}</span>
                    </div>
                    {c.unread > 0 && (
                      <span className="admin-chat-unread" aria-label={`${c.unread} unread`}>
                        {c.unread}
                      </span>
                    )}
                  </div>
                  <p className="admin-chat-convo-preview">
                    <strong style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Last: </strong>
                    {c.last_message?.slice(0, 80) || '—'}
                  </p>
                  <div className="admin-chat-convo-meta">
                    <span>
                      {isOnline(c.last_at) && <span className="admin-chat-online-dot" aria-hidden="true" />}
                      {isOnline(c.last_at) ? 'Online' : `Last seen ${timeAgo(c.last_at)}`}
                    </span>
                    <span>{timeAgo(c.last_at)}</span>
                  </div>
                </button>
              ))}
              {!conversations.length && (
                <p style={{ padding: '1.5rem', color: 'var(--text-muted)', textAlign: 'center' }}>No chats yet</p>
              )}
            </div>
          </aside>

          <section className="admin-chat-thread">
            {!selectedId ? (
              <div className="admin-chat-thread-empty">
                Select a conversation to start chatting
              </div>
            ) : (
              <>
                <header className="admin-chat-thread-header">
                  {isMobile && (
                    <button type="button" className="admin-chat-back-btn" onClick={closeMobileChat}>
                      ← Back
                    </button>
                  )}
                  <div className="admin-chat-thread-header__main">
                    <h2 className="admin-chat-thread-title">{displayName}</h2>
                    <p className="admin-chat-thread-email">{displayEmail}</p>
                    <p className={`admin-chat-thread-status${online ? ' is-online' : ''}`}>
                      {online ? (
                        <>
                          <span className="admin-chat-online-dot" aria-hidden="true" />
                          Online
                        </>
                      ) : (
                        <>Last seen {timeAgo(selectedConvo?.last_at)}</>
                      )}
                    </p>
                  </div>
                  {isMobile && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm admin-chat-details-toggle"
                      onClick={() => setShowDetails((v) => !v)}
                    >
                      {showDetails ? 'Hide' : 'Details'}
                    </button>
                  )}
                </header>

                {isMobile && showDetails && <UserDetailsCard className="admin-chat-user-card--mobile" />}

                <div className="admin-chat-thread-body">
                  <div className="admin-chat-messages-area">
                    {isMobile && <ActionToolbar layout="row" />}
                    <div className="admin-chat-messages">
                      {msgs.length === 0 ? (
                        <p className="admin-chat-messages-empty">No messages yet. Start the conversation below.</p>
                      ) : (
                        msgs.map((m) => {
                          const role =
                            m.sender_role === 'user' ? 'user' : m.sender_role === 'system' ? 'system' : 'admin';
                          return (
                            <div
                              key={m.id}
                              className={`admin-chat-msg-wrap admin-chat-msg-wrap--${role}`}
                            >
                              <div className={`chat-bubble chat-${role}`}>
                                {role === 'user' && (
                                  <small style={{ display: 'block', opacity: 0.85, marginBottom: 4, fontSize: 10 }}>
                                    {displayName}
                                  </small>
                                )}
                                {role === 'admin' && (
                                  <small style={{ display: 'block', opacity: 0.85, marginBottom: 4, fontSize: 10 }}>
                                    Admin
                                  </small>
                                )}
                                {m.message}
                                <span className="chat-time">{formatMsgTime(m.created_at)}</span>
                              </div>
                              {role !== 'system' && (
                                <div className="admin-chat-msg-actions">
                                  <button
                                    type="button"
                                    className="admin-chat-delete-msg"
                                    onClick={() => deleteMsg(m.id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="admin-chat-compose">
                      <input
                        className="input"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Type message..."
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                        disabled={sending}
                        aria-label="Message"
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={send}
                        disabled={sending || !reply.trim()}
                      >
                        Send
                      </button>
                    </div>
                  </div>

                  {!isMobile && (
                    <aside className="admin-chat-side-panel">
                      <UserDetailsCard />
                      <ActionToolbar layout="column" />
                    </aside>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      {clearOpen && (
        <div
          className="admin-chat-modal-overlay"
          role="presentation"
          onClick={() => !clearing && setClearOpen(false)}
        >
          <div
            className="admin-chat-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Clear conversation?</h3>
            <p>This permanently deletes all messages with {displayName}. This cannot be undone.</p>
            <div className="admin-chat-modal__actions">
              <button type="button" className="btn btn-ghost" disabled={clearing} onClick={() => setClearOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" disabled={clearing} onClick={clearConversation}>
                {clearing ? 'Clearing…' : 'Clear conversation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="admin-chat-toast" role="status">{toast}</div>}
    </AdminLayout>
  );
};

export default AdminChat;
