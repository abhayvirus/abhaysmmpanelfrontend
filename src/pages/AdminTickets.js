import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import AdminResponsiveTable from '../components/AdminResponsiveTable';
import { adminGetTickets } from '../api';
import { ticketStatusClass } from '../utils/ticketStatus';
import '../styles/ticketsPage.css';

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  useEffect(() => { adminGetTickets().then((r) => setTickets(r.data)); }, []);

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
      key: 'view',
      label: '',
      render: (t) => <Link to={`/tickets/${t.id}`}>View</Link>,
    },
  ];

  return (
    <AdminLayout>
      <h1 className="admin-page-title">Support Tickets</h1>
      <AdminResponsiveTable columns={columns} rows={tickets} emptyMessage="No tickets" />
    </AdminLayout>
  );
};

export default AdminTickets;
