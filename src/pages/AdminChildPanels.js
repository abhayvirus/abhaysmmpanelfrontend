import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import AdminResponsiveTable from '../components/AdminResponsiveTable';
import { adminGetChildPanels, adminUpdateChildPanel } from '../api';

const AdminChildPanels = () => {
  const [panels, setPanels] = useState([]);
  const load = () => adminGetChildPanels().then((r) => setPanels(r.data));
  useEffect(() => { load(); }, []);

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (p) => (
        <span>
          {p.name}
          <br />
          <small style={{ color: 'var(--text-muted)' }}>{p.email}</small>
        </span>
      ),
    },
    { key: 'domain', label: 'Domain' },
    { key: 'panel_name', label: 'Panel' },
    {
      key: 'status',
      label: 'Status',
      highlight: true,
      render: (p) => <span className="badge badge-info">{p.status}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (p) => (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => adminUpdateChildPanel(p.id, { status: 'active' }).then(load)}>
            Approve
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => adminUpdateChildPanel(p.id, { status: 'rejected' }).then(load)}>
            Reject
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <h1 className="admin-page-title">Child Panel Requests</h1>
      <AdminResponsiveTable columns={columns} rows={panels} emptyMessage="No requests" />
    </AdminLayout>
  );
};

export default AdminChildPanels;
