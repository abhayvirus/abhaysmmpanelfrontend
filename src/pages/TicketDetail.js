import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import UserLayout from '../components/UserLayout';
import AdminLayout from '../components/AdminLayout';
import TicketMessageBubble from '../components/TicketMessageBubble';
import TicketReplyBar from '../components/TicketReplyBar';
import { getTicket, replyTicket } from '../api';
import { ticketStatusClass } from '../utils/ticketStatus';
import { getStoredUser } from '../utils/authRedirect';
import { isAdminRole } from '../utils/roles';
import '../styles/ticketsPage.css';

const POLL_MS = 15000;

const TicketDetail = () => {
  const { id } = useParams();
  const adminView = isAdminRole(getStoredUser());
  const backTo = adminView ? '/admin/tickets' : '/tickets';
  const backLabel = adminView ? '← Back to Admin Tickets' : '← Back to Support';

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const messagesEndRef = useRef(null);
  const wrapRef = useRef(null);

  const load = useCallback((silent = false, beforeId = null) => {
    if (!silent && !beforeId) setLoading(true);
    const params = beforeId ? { before: beforeId, limit: 25 } : { limit: 30 };
    return getTicket(id, params)
      .then((r) => {
        const { ticket: t, messages: msgs, hasMore: more } = r.data;
        setTicket(t);
        setLoadError('');
        if (beforeId) {
          setMessages((prev) => [...msgs, ...prev]);
        } else {
          setMessages(msgs);
        }
        setHasMore(Boolean(more));
      })
      .catch((e) => {
        if (!beforeId) {
          setLoadError(e.response?.data?.message || 'Ticket not found or failed to load');
          setTicket(null);
          setMessages([]);
        }
      })
      .finally(() => {
        if (!silent && !beforeId) setLoading(false);
        setLoadingMore(false);
      });
  }, [id]);

  useEffect(() => {
    load();
    const poll = setInterval(() => load(true), POLL_MS);
    return () => clearInterval(poll);
  }, [load]);

  useEffect(() => {
    if (!loading && messages.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, loading]);

  const loadOlder = async () => {
    if (!hasMore || loadingMore || !messages.length) return;
    setLoadingMore(true);
    const oldestId = messages[0]?.id;
    const prevHeight = wrapRef.current?.scrollHeight || 0;
    await load(true, oldestId);
    requestAnimationFrame(() => {
      if (wrapRef.current) {
        wrapRef.current.scrollTop = wrapRef.current.scrollHeight - prevHeight;
      }
    });
  };

  const send = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await replyTicket(id, reply.trim());
      setReply('');
      await load(true);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to send reply');
    }
    setSending(false);
  };

  const closed = ticket?.status === 'closed';

  const body = (
    <div className="ticket-detail-page">
      <header className="ticket-detail-header">
        <Link to={backTo} className="btn btn-ghost btn-sm">{backLabel}</Link>
        {loadError ? (
          <div className="alert alert-danger" style={{ marginTop: 12 }}>
            {loadError}
            <div style={{ marginTop: 8 }}>
              <Link to={backTo} className="btn btn-ghost btn-sm">Back</Link>
            </div>
          </div>
        ) : loading && !ticket ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
        ) : (
          <>
            <h1>{ticket?.subject}</h1>
            {ticket && (
              <span className={`ticket-badge ${ticketStatusClass(ticket.status)}`}>
                {ticket.status}
              </span>
            )}
          </>
        )}
      </header>

      <div className="ticket-messages-wrap" ref={wrapRef}>
        {hasMore && (
          <button
            type="button"
            className="btn btn-ghost btn-sm ticket-load-more"
            onClick={loadOlder}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading…' : 'Load older messages'}
          </button>
        )}
        {messages.map((m) => (
          <TicketMessageBubble key={m.id} message={m} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {!closed && ticket && (
        <TicketReplyBar
          value={reply}
          onChange={setReply}
          onSend={send}
          sending={sending}
        />
      )}
      {closed && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
          This ticket is closed. Open a new ticket if you need more help.
        </p>
      )}
    </div>
  );

  if (adminView) {
    return (
      <AdminLayout>
        <h1 className="admin-page-title" style={{ marginBottom: 12 }}>Ticket #{id}</h1>
        {body}
      </AdminLayout>
    );
  }

  return <UserLayout title="Ticket">{body}</UserLayout>;
};

export default TicketDetail;
