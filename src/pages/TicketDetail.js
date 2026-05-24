import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import UserLayout from '../components/UserLayout';
import { getTicket, replyTicket } from '../api';

const TicketDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState({ ticket: {}, messages: [] });
  const [reply, setReply] = useState('');

  const load = () => getTicket(id).then((r) => setData(r.data));
  useEffect(() => { load(); }, [id]);

  const send = async () => {
    await replyTicket(id, reply);
    setReply('');
    load();
  };

  return (
    <UserLayout>
      <Link to="/tickets">← Back</Link>
      <h1 style={{ margin: '16px 0' }}>{data.ticket.subject}</h1>
      <span className="badge badge-info">{data.ticket.status}</span>
      <div style={{ marginTop: 24 }}>
        {data.messages.map((m) => (
          <div key={m.id} className="card" style={{ marginBottom: 12, marginLeft: m.is_admin ? 40 : 0 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.sender_name} {m.is_admin ? '(Admin)' : ''}</div>
            <p>{m.message}</p>
          </div>
        ))}
      </div>
      {data.ticket.status !== 'closed' && (
        <div className="card" style={{ marginTop: 16 }}>
          <textarea className="textarea" rows={3} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply..." />
          <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={send}>Send Reply</button>
        </div>
      )}
    </UserLayout>
  );
};

export default TicketDetail;
