import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import AdminResponsiveTable from '../components/AdminResponsiveTable';
import { adminGetTickets, adminUpdateTicketStatus } from '../api';
import { ticketStatusClass } from '../utils/ticketStatus';
import '../styles/ticketsPage.css';

const STATUSES = ['open', 'answered', 'closed'];

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    adminGetTickets()
      .then((r) => setTickets(Array.isArray(r.data) ? r.data : []))
      .catch((e) => {
        setTickets([]);
        setError(e.response?.data?.message || 'Failed to load tickets');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    setBusyId(id);
    setError('');
    try {
      await adminUpdateTicketStatus(id, status);
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update status');
    }
    setBusyId(null);
  };

  const columns = [
    { key: 'id', label: 'ID', render: (t) => `#${t.id}` },
    { key: 'user_name', label: 'User' },
    { key: 'subject', label: 'Subject' },
    {
      key: 'status',
      label: 'Status',
      highlight: true,
      render: (t) => (
        <span className={`ticket-badge ${ticketStatusClass(t.status)}`}>{t.status}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (t) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          {STATUSES.filter((s) => s !== t.status).map((s) => (
            <button
              key={s}
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={busyId === t.id}
              onClick={() => setStatus(t.id, s)}
            >
              {s}
            </button>
          ))}
          <Link to={`/admin/tickets/${t.id}`} className="btn btn-primary btn-sm">Reply</Link>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <h1 className="admin-page-title">Support Tickets</h1>
      {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : (
        <AdminResponsiveTable columns={columns} rows={tickets} emptyMessage="No tickets" />
      )}
    </AdminLayout>
  );
};

export default AdminTickets;
