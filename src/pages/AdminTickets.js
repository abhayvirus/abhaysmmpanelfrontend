import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { adminGetTickets } from '../api';

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  useEffect(() => { adminGetTickets().then((r) => setTickets(r.data)); }, []);

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 24 }}>Support Tickets</h1>
      <div className="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>User</th><th>Subject</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td>#{t.id}</td><td>{t.user_name}</td><td>{t.subject}</td>
                <td><span className="badge badge-info">{t.status}</span></td>
                <td><Link to={`/tickets/${t.id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminTickets;
