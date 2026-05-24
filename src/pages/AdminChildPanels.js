import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { adminGetChildPanels, adminUpdateChildPanel } from '../api';

const AdminChildPanels = () => {
  const [panels, setPanels] = useState([]);
  const load = () => adminGetChildPanels().then((r) => setPanels(r.data));
  useEffect(() => { load(); }, []);

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 24 }}>Child Panel Requests</h1>
      <div className="table-wrap">
        <table>
          <thead><tr><th>User</th><th>Domain</th><th>Panel</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {panels.map((p) => (
              <tr key={p.id}>
                <td>{p.name}<br /><small>{p.email}</small></td>
                <td>{p.domain}</td><td>{p.panel_name}</td>
                <td><span className="badge badge-info">{p.status}</span></td>
                <td>
                  <button className="btn btn-primary btn-sm" onClick={() => adminUpdateChildPanel(p.id, { status: 'active' }).then(load)}>Approve</button>
                  <button className="btn btn-danger btn-sm" style={{ marginLeft: 8 }} onClick={() => adminUpdateChildPanel(p.id, { status: 'rejected' }).then(load)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminChildPanels;
