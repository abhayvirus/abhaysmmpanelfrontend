import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../components/UserLayout';
import { getTickets, createTicket } from '../api';

const statusBadge = (status) => {
  if (status === 'closed') return 'badge-danger';
  if (status === 'open') return 'badge-success';
  return 'badge-warning';
};

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '', priority: 'medium' });
  const [msg, setMsg] = useState('');

  const load = () => getTickets().then((r) => setTickets(r.data)).catch(() => setTickets([]));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    try {
      await createTicket(form);
      setMsg('Ticket created');
      setShowForm(false);
      setForm({ subject: '', message: '', priority: 'medium' });
      load();
    } catch (e) {
      setMsg(e.response?.data?.message || 'Error');
    }
  };

  return (
    <UserLayout title="Support">
      <div className="tickets-page">
        <div className="page-header">
          <h1 style={{ marginBottom: 0 }}>Support Tickets</h1>
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            + New Ticket
          </button>
        </div>
        {msg && <div className="alert alert-success">{msg}</div>}
        {showForm && (
          <div className="card ticket-form-card" style={{ marginBottom: 24 }}>
            <div className="form-group">
              <label className="label">Subject</label>
              <input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="label">Message</label>
              <textarea className="textarea" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="label">Priority</label>
              <select className="select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <button type="button" className="btn btn-primary" onClick={submit}>Submit</button>
          </div>
        )}

        {tickets.length === 0 ? (
          <div className="card user-panel-empty">
            <p className="user-panel-empty-title">No tickets found</p>
            <span>Create a ticket if you need help with orders or payments.</span>
          </div>
        ) : (
          <>
            <div className="table-wrap user-panel-table-wrap">
              <table>
                <thead>
                  <tr><th>ID</th><th>Subject</th><th>Status</th><th>Date</th><th></th></tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id}>
                      <td>#{t.id}</td>
                      <td>{t.subject}</td>
                      <td><span className={`badge ${statusBadge(t.status)}`}>{t.status}</span></td>
                      <td>{new Date(t.created_at).toLocaleDateString()}</td>
                      <td><Link to={`/tickets/${t.id}`}>View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="user-panel-mobile-list">
              {tickets.map((t) => (
                <article className="card user-panel-mobile-card" key={`ticket-m-${t.id}`}>
                  <div className="user-panel-mobile-top">
                    <strong>Ticket #{t.id}</strong>
                    <span className={`badge ${statusBadge(t.status)}`}>{t.status}</span>
                  </div>
                  <div className="user-panel-mobile-row user-panel-mobile-row--stack">
                    <span>Subject</span>
                    <span>{t.subject}</span>
                  </div>
                  <div className="user-panel-mobile-row">
                    <span>Date</span>
                    <span>{new Date(t.created_at).toLocaleString()}</span>
                  </div>
                  <div className="user-panel-mobile-actions">
                    <Link to={`/tickets/${t.id}`} className="btn btn-primary btn-sm">View ticket</Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </UserLayout>
  );
};

export default Tickets;
