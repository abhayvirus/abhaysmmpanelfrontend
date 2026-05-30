import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import UserLayout from '../components/UserLayout';
import { getTicket, replyTicket } from '../api';

const TicketDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState({ ticket: {}, messages: [] });
  const [reply, setReply] = useState('');

  const load = useCallback(() => {
    getTicket(id).then((r) => setData(r.data));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const send = async () => {
    await replyTicket(id, reply);
    setReply('');
    load();
  };

  return (
    <UserLayout title="Ticket">
      <div className="ticket-detail-page">
        <Link to="/tickets" className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }}>← Back to tickets</Link>
        <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(1.125rem, 4vw, 1.5rem)', wordBreak: 'break-word' }}>
          {data.ticket.subject}
        </h1>
        <span className="badge badge-info">{data.ticket.status}</span>
        <div style={{ marginTop: 24 }}>
          {data.messages.map((m) => (
            <div
              key={m.id}
              className={`card ticket-msg-${m.is_admin ? 'admin' : 'user'}`}
              style={{ marginBottom: 12 }}
            >
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                {m.sender_name} {m.is_admin ? '(Admin)' : ''}
              </div>
              <p style={{ margin: 0, wordBreak: 'break-word' }}>{m.message}</p>
            </div>
          ))}
        </div>
        {data.ticket.status !== 'closed' && (
          <div className="card" style={{ marginTop: 16 }}>
            <textarea className="textarea" rows={3} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply..." />
            <button type="button" className="btn btn-primary" style={{ marginTop: 12, width: '100%' }} onClick={send}>
              Send Reply
            </button>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default TicketDetail;
