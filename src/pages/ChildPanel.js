import React, { useState, useEffect } from 'react';
import UserLayout from '../components/UserLayout';
import { requestChildPanel, getMyChildPanels } from '../api';

const ChildPanel = () => {
  const [panels, setPanels] = useState([]);
  const [form, setForm] = useState({ domain: '', panel_name: '', notes: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => { getMyChildPanels().then((r) => setPanels(r.data)).catch(() => {}); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await requestChildPanel(form);
      setMsg('Request submitted! Admin will review.');
      const r = await getMyChildPanels();
      setPanels(r.data);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error');
    }
  };

  return (
    <UserLayout>
      <h1>Child Panel (Reseller)</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Get your own branded SMM panel on your domain.</p>
      {msg && <div className="alert alert-success">{msg}</div>}
      <div className="card" style={{ maxWidth: 480, marginBottom: 24 }}>
        <form onSubmit={submit}>
          <div className="form-group"><label className="label">Domain</label>
            <input className="input" required placeholder="panel.yourdomain.com" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} /></div>
          <div className="form-group"><label className="label">Panel Name</label>
            <input className="input" required value={form.panel_name} onChange={(e) => setForm({ ...form, panel_name: e.target.value })} /></div>
          <div className="form-group"><label className="label">Notes</label>
            <textarea className="textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <button type="submit" className="btn btn-primary">Request Child Panel</button>
        </form>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Domain</th><th>Name</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {panels.map((p) => (
              <tr key={p.id}><td>{p.domain}</td><td>{p.panel_name}</td>
                <td><span className="badge badge-info">{p.status}</span></td>
                <td>{new Date(p.created_at).toLocaleDateString()}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </UserLayout>
  );
};

export default ChildPanel;
