import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../components/UserLayout';
import { getTickets, createTicket } from '../api';
import { ticketStatusClass, formatTicketTime } from '../utils/ticketStatus';
import '../styles/ticketsPage.css';

const POLL_MS = 15000;

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '', priority: 'medium' });
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    return getTickets()
      .then((r) => setTickets(r.data))
      .catch(() => setTickets([]))
      .finally(() => { if (!silent) setLoading(false); });
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => load(true), POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  const openNewTicket = () => {
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async () => {
    if (!form.subject.trim() || !form.message.trim()) {
      setMsg('Subject and message are required');
      return;
    }
    setSubmitting(true);
    setMsg('');
    try {
      await createTicket(form);
      setMsg('Ticket created successfully');
      setShowForm(false);
      setForm({ subject: '', message: '', priority: 'medium' });
      load(true);
    } catch (e) {
      setMsg(e.response?.data?.message || 'Could not create ticket');
    }
    setSubmitting(false);
  };

  return (
    <UserLayout title="Support">
      <div className="tickets-page">
        <div className="tickets-sticky-header">
          <h1 className="tickets-page__title">Support</h1>
          <button
            type="button"
            className="btn btn-primary btn-new-ticket"
            onClick={() => (showForm ? setShowForm(false) : openNewTicket())}
          >
            {showForm ? 'Close form' : '+ New Ticket'}
          </button>
        </div>

        {msg && (
          <div className={`alert ${msg.includes('success') ? 'alert-success' : 'alert-error'} tickets-page__toast`}>
            {msg}
          </div>
        )}

        {showForm && (
          <div className="card tickets-form-card">
            <div className="form-group">
              <label className="label">Subject</label>
              <input
                className="input"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Brief summary of your issue"
              />
            </div>
            <div className="form-group">
              <label className="label">Message</label>
              <textarea
                className="textarea"
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Describe your issue in detail…"
              />
            </div>
            <div className="form-group">
              <label className="label">Priority</label>
              <select
                className="select"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <button type="button" className="btn btn-primary" onClick={submit} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit ticket'}
            </button>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 1rem' }}>Loading tickets…</p>
        ) : tickets.length === 0 ? (
          <div className="card tickets-empty">
            <div className="tickets-empty__icon" aria-hidden="true">🎫</div>
            <p className="tickets-empty__title">No tickets yet</p>
            <p className="tickets-empty__text">
              Need help with orders, payments, or your account? Create a support ticket and our team will reply soon.
            </p>
            <button type="button" className="btn btn-primary" onClick={openNewTicket}>
              Create Ticket
            </button>
          </div>
        ) : (
          <>
            <div className="tickets-list">
              {tickets.map((t) => (
                <Link
                  key={t.id}
                  to={`/tickets/${t.id}`}
                  className={`card ticket-card${t.unread ? ' ticket-card--unread' : ''}`}
                >
                  <div className="ticket-card__top">
                    <span className="ticket-card__id">#{t.id}</span>
                    <span className={`ticket-badge ${ticketStatusClass(t.status)}`}>{t.status}</span>
                  </div>
                  <h2 className="ticket-card__subject">{t.subject}</h2>
                  {t.last_message_preview && (
                    <p className="ticket-card__preview">{t.last_message_preview}</p>
                  )}
                  <div className="ticket-card__meta">
                    <span>Created {formatTicketTime(t.created_at)}</span>
                    {t.last_reply_at && (
                      <span>Last reply {formatTicketTime(t.last_reply_at)}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <div className="table-wrap user-panel-table-wrap" style={{ marginTop: '1rem' }}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Last reply</th>
                    <th>Created</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id}>
                      <td>#{t.id}</td>
                      <td>{t.subject}</td>
                      <td>
                        <span className={`ticket-badge ${ticketStatusClass(t.status)}`}>{t.status}</span>
                      </td>
                      <td>{formatTicketTime(t.last_reply_at)}</td>
                      <td>{formatTicketTime(t.created_at)}</td>
                      <td><Link to={`/tickets/${t.id}`}>View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </UserLayout>
  );
};

export default Tickets;
