import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { adminGetAnnouncements, adminCreateAnnouncement, adminDeleteAnnouncement } from '../api';

const AdminAnnouncements = () => {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', is_active: true, show_on_login: true });

  const load = () => adminGetAnnouncements().then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  return (
    <AdminLayout>
      <h1 className="admin-page-title">Popup Announcements</h1>
      <div className="card" style={{ marginBottom: 24 }}>
        <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ marginBottom: 8 }} />
        <textarea className="textarea" placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} style={{ marginBottom: 8 }} />
        <button className="btn btn-primary" onClick={() => adminCreateAnnouncement(form).then(load)}>Create Announcement</button>
      </div>
      {list.map((a) => (
        <div key={a.id} className="card" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
          <div><strong>{a.title}</strong><p style={{ color: 'var(--text-muted)' }}>{a.content}</p></div>
          <button className="btn btn-danger btn-sm" onClick={() => adminDeleteAnnouncement(a.id).then(load)}>Delete</button>
        </div>
      ))}
    </AdminLayout>
  );
};

export default AdminAnnouncements;
