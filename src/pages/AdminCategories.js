import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { adminGetCategories, adminCreateCategory, adminDeleteCategory } from '../api';

const AdminCategories = () => {
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({ name: '', icon: '📱', sort_order: 0 });

  const load = () => adminGetCategories().then((r) => setCats(r.data));
  useEffect(() => { load(); }, []);

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 24 }}>Categories</h1>
      <div className="card" style={{ marginBottom: 24, maxWidth: 400 }}>
        <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ marginBottom: 8 }} />
        <input className="input" placeholder="Icon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} style={{ marginBottom: 8 }} />
        <button className="btn btn-primary" onClick={() => adminCreateCategory(form).then(() => { load(); setForm({ name: '', icon: '📱', sort_order: 0 }); })}>Add</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Icon</th><th>Name</th><th>Order</th><th>Active</th><th></th></tr></thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id}>
                <td>{c.icon}</td><td>{c.name}</td><td>{c.sort_order}</td>
                <td>{c.is_active ? 'Yes' : 'No'}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => adminDeleteCategory(c.id).then(load)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
