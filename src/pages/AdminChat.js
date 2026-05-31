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
  adminUpdateChatMeta,
  adminSendSupportEmail,
  adminBroadcastMessage,
  adminUpdateUser,
} from '../api';

const POLL_CONVOS_MS = 4000;
const POLL_MSGS_MS = 3000;
const ONLINE_MS = 5 * 60 * 1000;

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'important', label: 'Important' },
  { key: 'archived', label: 'Archived' },
];

const EMAIL_TEMPLATES = {
  payment_approved: {
    label: 'Payment Approved',
    subject: 'Payment Approved — ABHAYSMM Panel',
    message: 'Hello {{name}},\n\nYour payment has been approved and credited to your wallet.\n\nThank you,\nABHAYSMM Panel Support',
  },
  order_completed: {
    label: 'Order Completed',
    subject: 'Order Completed — ABHAYSMM Panel',
    message: 'Hello {{name}},\n\nYour order has been completed successfully.\n\nThank you,\nABHAYSMM Panel Support',
  },
  order_delayed: {
    label: 'Order Delayed',
    subject: 'Order Update — ABHAYSMM Panel',
    message: 'Hello {{name}},\n\nYour order is taking longer than expected. Our team is working on it.\n\nThank you,\nABHAYSMM Panel Support',
  },
  custom: { label: 'Custom Message', subject: '', message: '' },
};

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
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatMsgTime = (dateStr) =>
  new Date(dateStr).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const isOnline = (lastAt) => lastAt && Date.now() - new Date(lastAt).getTime() < ONLINE_MS;

const applyName = (text, name) => String(text || '').replace(/\{\{name\}\}/g, name || 'Customer');

const AdminChat = () => {
  const { isMobile } = useMedia();
  const [conversations, setConversations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [threadUser, setThreadUser] = useState(null);
  const [emailHistory, setEmailHistory] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [mobileScreen, setMobileScreen] = useState('list');
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({ template: 'custom', to: '', subject: '', message: '' });
  const [emailSending, setEmailSending] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    audience: 'all', channels: 'notification', message: '',
  });
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [toast, setToast] = useState(null);
  const messagesEndRef = useRef(null);

  const selectedConvo = conversations.find((c) => c.user_id === selectedId);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadConvos = useCallback(() => {
    adminGetChatConversations({ filter, search: search.trim() })
      .then((r) => setConversations(r.data || []))
      .catch(() => {});
  }, [filter, search]);

  const loadThread = useCallback((userId) => {
    if (!userId) return;
    adminGetChatThread(userId)
      .then((r) => {
        const { user, messages, email_history: history } = r.data;
        setThreadUser(user);
        setMsgs(messages || []);
        setEmailHistory(history || []);
        loadConvos();
      })
      .catch(() => showToast('Failed to load chat', 'error'));
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
    setSelectedId(null);
  };

  const send = async () => {
    if (!reply.trim() || !selectedId || sending) return;
    setSending(true);
    const text = reply.trim();
    setReply('');
    try {
      const { data } = await adminReplyChat(selectedId, text);
      if (data?.id) setMsgs((prev) => [...prev, data]);
      else loadThread(selectedId);
      loadConvos();
    } catch {
      setReply(text);
      showToast('Failed to send message', 'error');
    }
    setSending(false);
  };

  const updateMeta = async (patch) => {
    if (!selectedId) return;
    try {
      await adminUpdateChatMeta(selectedId, patch);
      setThreadUser((u) => (u ? { ...u, ...patch } : u));
      loadConvos();
      if (patch.is_resolved) loadThread(selectedId);
    } catch {
      showToast('Update failed', 'error');
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
      showToast('Could not mark resolved', 'error');
    }
  };

  const toggleImportant = () => {
    updateMeta({ is_important: !threadUser?.is_important });
    showToast(threadUser?.is_important ? 'Removed important flag' : 'Marked important');
  };

  const archiveChat = async () => {
    await updateMeta({ is_archived: true });
    showToast('Chat archived');
    if (filter !== 'archived') setSelectedId(null);
  };

  const clearConversation = async () => {
    if (!selectedId) return;
    setClearing(true);
    try {
      await adminClearChatConversation(selectedId);
      setMsgs([]);
      setClearOpen(false);
      setSelectedId(null);
      loadConvos();
      showToast('Chat deleted');
    } catch (e) {
      showToast(e.response?.data?.message || 'Delete failed', 'error');
    }
    setClearing(false);
  };

  const openEmailModal = () => {
    setEmailForm({
      template: 'custom',
      to: threadUser?.email || '',
      subject: '',
      message: '',
    });
    setEmailOpen(true);
  };

  const applyEmailTemplate = (key) => {
    const t = EMAIL_TEMPLATES[key] || EMAIL_TEMPLATES.custom;
    setEmailForm((f) => ({
      ...f,
      template: key,
      subject: applyName(t.subject, threadUser?.name),
      message: applyName(t.message, threadUser?.name),
    }));
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    if (!selectedId || emailSending) return;
    setEmailSending(true);
    try {
      await adminSendSupportEmail(selectedId, {
        subject: emailForm.subject,
        message: emailForm.message,
        template_key: emailForm.template,
      });
      setEmailOpen(false);
      showToast('✅ Email sent successfully');
      loadThread(selectedId);
    } catch (err) {
      showToast(err.response?.data?.message || 'Email failed', 'error');
    }
    setEmailSending(false);
  };

  const sendBroadcast = async (e) => {
    e.preventDefault();
    if (broadcastSending) return;
    setBroadcastSending(true);
    try {
      const payload = {
        audience: broadcastForm.audience,
        channels: broadcastForm.channels,
        message: broadcastForm.message,
      };
      if (broadcastForm.audience === 'selected' && selectedId) {
        payload.user_ids = [selectedId];
      }
      const { data } = await adminBroadcastMessage(payload);
      setBroadcastOpen(false);
      showToast(`Broadcast sent to ${data.recipient_count || 0} users`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Broadcast failed', 'error');
    }
    setBroadcastSending(false);
  };

  const addBalance = async () => {
    if (!threadUser) return;
    const raw = window.prompt('Amount to add (₹):', '100');
    if (raw == null) return;
    const add = parseFloat(raw);
    if (!Number.isFinite(add) || add <= 0) return;
    try {
      const newBal = parseFloat(threadUser.balance || 0) + add;
      await adminUpdateUser(threadUser.id, {
        balance: newBal,
        status: threadUser.status || 'ACTIVE',
        role: 'user',
      });
      setThreadUser((u) => ({ ...u, balance: newBal }));
      showToast(`Balance updated: ₹${newBal.toFixed(2)}`);
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed', 'error');
    }
  };

  const suspendUser = async () => {
    if (!threadUser) return;
    if (!window.confirm(`Suspend ${threadUser.name}?`)) return;
    try {
      await adminUpdateUser(threadUser.id, {
        balance: threadUser.balance,
        status: 'BANNED',
        role: 'user',
      });
      setThreadUser((u) => ({ ...u, status: 'BANNED' }));
      showToast('User suspended');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed', 'error');
    }
  };

  const deleteMsg = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await adminDeleteChatMessage(messageId);
      setMsgs((prev) => prev.filter((m) => m.id !== messageId));
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const online = isOnline(selectedConvo?.last_at || threadUser?.last_activity);
  const displayName = threadUser?.name || selectedConvo?.name || 'User';

  const pageClass = [
    'admin-chat-page',
    isMobile && mobileScreen === 'chat' ? 'admin-chat-page--mobile-chat' : '',
    isMobile && mobileScreen === 'list' ? 'admin-chat-page--mobile-list' : '',
  ].filter(Boolean).join(' ');

  const ProfilePanel = ({ className = '' }) => {
    if (!threadUser) return null;
    return (
      <aside className={`admin-chat-side-panel ${className}`.trim()}>
        <h3 className="admin-chat-side-title">User Profile</h3>
        <dl className="admin-chat-profile-dl">
          <div><dt>Name</dt><dd>{threadUser.name}</dd></div>
          <div><dt>Email</dt><dd>{threadUser.email || '—'}</dd></div>
          <div><dt>Phone</dt><dd>{threadUser.phone || '—'}</dd></div>
          <div><dt>Balance</dt><dd>₹{parseFloat(threadUser.balance || 0).toFixed(2)}</dd></div>
          <div><dt>Orders</dt><dd>{threadUser.total_orders ?? 0}</dd></div>
          <div><dt>Joined</dt><dd>{formatDate(threadUser.created_at)}</dd></div>
          <div><dt>Last Login</dt><dd>{threadUser.last_login ? timeAgo(threadUser.last_login) : '—'}</dd></div>
        </dl>
        <div className="admin-chat-side-actions">
          <Link to="/admin/orders" className="btn btn-ghost btn-sm">View Orders</Link>
          <button type="button" className="btn btn-ghost btn-sm" onClick={addBalance}>Add Balance</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={suspendUser}>Suspend User</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={openEmailModal}>Send Email</button>
        </div>
        {emailHistory.length > 0 && (
          <div className="admin-chat-email-history">
            <h4>Email history</h4>
            <ul>
              {emailHistory.slice(0, 5).map((em) => (
                <li key={em.id}>
                  <strong>{em.subject}</strong>
                  <span>{formatDate(em.created_at)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    );
  };

  return (
    <AdminLayout>
      <div className={pageClass}>
        <header className="admin-chat-page-header">
          <h1 className="admin-page-title">Support Inbox</h1>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setBroadcastOpen(true)}>
            📢 Broadcast
          </button>
        </header>

        <div className="admin-chat-shell">
          <aside className="admin-chat-list">
            <div className="admin-chat-list-header">Conversations</div>
            <input
              className="input admin-chat-search"
              placeholder="Search user…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search users"
            />
            <div className="admin-chat-filters" role="group" aria-label="Filter conversations">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className={`admin-chat-filter-chip${filter === f.key ? ' is-active' : ''}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
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
                      <span className="admin-chat-convo-name">
                        {c.is_important ? '⭐ ' : ''}{c.name || 'User'}
                      </span>
                      <span className="admin-chat-convo-email">{c.email || 'No email'}</span>
                    </div>
                    {c.unread > 0 && <span className="admin-chat-unread">{c.unread}</span>}
                  </div>
                  <p className="admin-chat-convo-preview">{c.last_message?.slice(0, 80) || '—'}</p>
                  <div className="admin-chat-convo-meta">
                    <span>{c.is_resolved ? '✓ Resolved' : 'Open'}</span>
                    <span>{timeAgo(c.last_at)}</span>
                  </div>
                </button>
              ))}
              {!conversations.length && (
                <p className="admin-chat-list-empty">No conversations</p>
              )}
            </div>
          </aside>

          <section className="admin-chat-thread">
            {!selectedId ? (
              <div className="admin-chat-thread-empty">Select a conversation</div>
            ) : (
              <>
                <header className="admin-chat-thread-header">
                  {isMobile && (
                    <button type="button" className="admin-chat-back-btn" onClick={closeMobileChat}>←</button>
                  )}
                  <div className="admin-chat-thread-header__main">
                    <h2 className="admin-chat-thread-title">{displayName}</h2>
                    <div className="admin-chat-user-badges">
                      <span>👤 {displayName}</span>
                      <span>📧 {threadUser?.email || selectedConvo?.email}</span>
                      <span>🆔 #{threadUser?.id || selectedId}</span>
                      <span>📅 {formatDate(threadUser?.created_at)}</span>
                      <span>💰 ₹{parseFloat(threadUser?.balance || 0).toFixed(0)}</span>
                      <span>📦 {threadUser?.total_orders ?? 0} orders</span>
                    </div>
                    <p className={`admin-chat-thread-status${online ? ' is-online' : ''}`}>
                      {online ? '● Online' : `Last active ${timeAgo(threadUser?.last_activity || selectedConvo?.last_at)}`}
                    </p>
                  </div>
                </header>

                <div className="admin-chat-thread-body">
                  <div className="admin-chat-messages-area">
                    <div className="admin-chat-toolbar admin-chat-toolbar--row">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={markResolved}>✓ Resolved</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={toggleImportant}>⭐ Important</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={archiveChat}>📁 Archive</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setClearOpen(true)}>🗑 Delete</button>
                    </div>
                    <div className="admin-chat-messages">
                      {msgs.length === 0 ? (
                        <p className="admin-chat-messages-empty">No messages yet.</p>
                      ) : (
                        msgs.map((m) => {
                          const role = m.sender_role === 'user' ? 'user' : m.sender_role === 'system' ? 'system' : 'admin';
                          return (
                            <div key={m.id} className={`admin-chat-msg-wrap admin-chat-msg-wrap--${role}`}>
                              <div className={`chat-bubble chat-${role}`}>
                                {m.message}
                                <span className="chat-time">{formatMsgTime(m.created_at)}</span>
                              </div>
                              {role !== 'system' && (
                                <button type="button" className="admin-chat-delete-msg" onClick={() => deleteMsg(m.id)}>Delete</button>
                              )}
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="admin-chat-compose">
                      <textarea
                        className="textarea admin-chat-compose-input"
                        rows={2}
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Type message..."
                        disabled={sending}
                        aria-label="Message"
                      />
                      <div className="admin-chat-compose-actions">
                        <button type="button" className="btn btn-primary btn-sm" onClick={send} disabled={sending || !reply.trim()}>
                          {sending ? 'Sending…' : '📨 Send Message'}
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={openEmailModal}>📧 Send Email</button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setBroadcastForm((f) => ({ ...f, audience: 'selected' })); setBroadcastOpen(true); }}>📢 Broadcast</button>
                      </div>
                    </div>
                  </div>
                  {!isMobile && <ProfilePanel />}
                </div>
                {isMobile && <ProfilePanel className="admin-chat-side-panel--mobile" />}
              </>
            )}
          </section>
        </div>
      </div>

      {clearOpen && (
        <div className="admin-chat-modal-overlay" role="presentation" onClick={() => !clearing && setClearOpen(false)}>
          <div className="admin-chat-modal" role="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete chat?</h3>
            <p>All messages with {displayName} will be permanently deleted.</p>
            <div className="admin-chat-modal__actions">
              <button type="button" className="btn btn-ghost" disabled={clearing} onClick={() => setClearOpen(false)}>Cancel</button>
              <button type="button" className="btn btn-danger" disabled={clearing} onClick={clearConversation}>
                {clearing ? 'Deleting…' : 'Delete Chat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {emailOpen && (
        <div className="admin-chat-modal-overlay" role="presentation" onClick={() => !emailSending && setEmailOpen(false)}>
          <div className="admin-chat-modal admin-chat-modal--wide" role="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Send Email</h3>
            <form onSubmit={sendEmail}>
              <div className="form-group">
                <label className="label">Template</label>
                <select className="select" value={emailForm.template} onChange={(e) => applyEmailTemplate(e.target.value)}>
                  {Object.entries(EMAIL_TEMPLATES).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">To</label>
                <input className="input" value={emailForm.to} readOnly />
              </div>
              <div className="form-group">
                <label className="label">Subject</label>
                <input className="input" value={emailForm.subject} onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="label">Message</label>
                <textarea className="textarea" rows={5} value={emailForm.message} onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })} required />
              </div>
              <div className="admin-chat-modal__actions">
                <button type="button" className="btn btn-ghost" disabled={emailSending} onClick={() => setEmailOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={emailSending}>
                  {emailSending ? 'Sending…' : 'Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {broadcastOpen && (
        <div className="admin-chat-modal-overlay" role="presentation" onClick={() => !broadcastSending && setBroadcastOpen(false)}>
          <div className="admin-chat-modal admin-chat-modal--wide" role="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Broadcast Announcement</h3>
            <form onSubmit={sendBroadcast}>
              <div className="form-group">
                <label className="label">Audience</label>
                <select className="select" value={broadcastForm.audience} onChange={(e) => setBroadcastForm({ ...broadcastForm, audience: e.target.value })}>
                  <option value="all">All Users</option>
                  <option value="selected">Selected User (current chat)</option>
                  <option value="active">Active Users (30 days)</option>
                  <option value="premium">Premium Users (5+ orders)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Message Type</label>
                <select className="select" value={broadcastForm.channels} onChange={(e) => setBroadcastForm({ ...broadcastForm, channels: e.target.value })}>
                  <option value="notification">In-App Notification</option>
                  <option value="email">Email</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Message</label>
                <textarea className="textarea" rows={4} value={broadcastForm.message} onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })} required />
              </div>
              <div className="admin-chat-modal__actions">
                <button type="button" className="btn btn-ghost" disabled={broadcastSending} onClick={() => setBroadcastOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={broadcastSending}>
                  {broadcastSending ? 'Sending…' : 'Send Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`admin-chat-toast admin-chat-toast--${toast.type}`} role="status">{toast.text}</div>
      )}
    </AdminLayout>
  );
};

export default AdminChat;
