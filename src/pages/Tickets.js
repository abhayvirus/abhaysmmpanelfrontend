import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../components/UserLayout';
import { getTickets, createTicket } from '../api';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '', priority: 'medium' });
  const [msg, setMsg] = useState('');

  const load = () => getTickets().then((r) => setTickets(r.data)).catch(() => {});
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
    <UserLayout>
      <div className="page-header">
        <h1 style={{ marginBottom: 8 }}>Support Tickets</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Ticket</button>
      </div>
      {msg && <div className="alert alert-success">{msg}</div>}
      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="form-group"><label className="label">Subject</label>
            <input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
          <div className="form-group"><label className="label">Message</label>
            <textarea className="textarea" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
          <select className="select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
          </select>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={submit}>Submit</button>
        </div>
      )}
      <div className="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Subject</th><th>Status</th><th>Date</th><th></th></tr></thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td>#{t.id}</td><td>{t.subject}</td>
                <td><span className={`badge badge-${t.status === 'closed' ? 'danger' : 'info'}`}>{t.status}</span></td>
                <td>{new Date(t.created_at).toLocaleDateString()}</td>
                <td><Link to={`/tickets/${t.id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </UserLayout>
  );
};

export default Tickets;
