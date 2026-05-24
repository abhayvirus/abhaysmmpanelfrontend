import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { adminGetActivityLogs } from '../api';

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    adminGetActivityLogs().then((r) => setLogs(r.data));
  }, []);

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 24 }}>Admin activity logs</h1>
      <div className="table-wrap card">
        <table className="table">
          <thead>
            <tr><th>Time</th><th>Admin</th><th>Action</th><th>Entity</th><th>IP</th></tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td>{new Date(l.created_at).toLocaleString()}</td>
                <td>{l.admin_name}</td>
                <td><code>{l.action}</code></td>
                <td>{l.entity_type ? `${l.entity_type} #${l.entity_id}` : '—'}</td>
                <td>{l.ip || '—'}</td>
              </tr>
            ))}
            {!logs.length && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No logs yet</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminActivityLogs;
