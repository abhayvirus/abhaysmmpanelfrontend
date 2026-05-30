import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import AdminResponsiveTable from '../components/AdminResponsiveTable';
import { adminGetActivityLogs } from '../api';

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    adminGetActivityLogs().then((r) => setLogs(r.data));
  }, []);

  const columns = [
    {
      key: 'created_at',
      label: 'Time',
      render: (l) => new Date(l.created_at).toLocaleString(),
    },
    { key: 'admin_name', label: 'Admin' },
    { key: 'action', label: 'Action', render: (l) => <code>{l.action}</code> },
    {
      key: 'entity',
      label: 'Entity',
      render: (l) => (l.entity_type ? `${l.entity_type} #${l.entity_id}` : '—'),
    },
    { key: 'ip', label: 'IP', render: (l) => l.ip || '—' },
  ];

  return (
    <AdminLayout>
      <h1 className="admin-page-title">Admin activity logs</h1>
      <div className="card" style={{ padding: 0 }}>
        <AdminResponsiveTable columns={columns} rows={logs} emptyMessage="No logs yet" />
      </div>
    </AdminLayout>
  );
};

export default AdminActivityLogs;
