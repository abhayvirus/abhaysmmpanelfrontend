import React, { useState, useEffect } from 'react';
import UserLayout from '../components/UserLayout';
import { requestChildPanel, getMyChildPanels } from '../api';

const statusBadge = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'approved' || s === 'active') return 'badge-success';
  if (s === 'rejected') return 'badge-danger';
  return 'badge-warning';
};

const ChildPanel = () => {
  const [panels, setPanels] = useState([]);
  const [form, setForm] = useState({ domain: '', panel_name: '', notes: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => { getMyChildPanels().then((r) => setPanels(r.data)).catch(() => setPanels([])); }, []);

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
    <UserLayout title="Child Panel">
      <div className="child-panel-page">
        <h1 style={{ marginBottom: 8 }}>Child Panel (Reseller)</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Get your own branded SMM panel on your domain.</p>
        {msg && <div className="alert alert-success">{msg}</div>}
        <div className="card child-panel-form-card" style={{ marginBottom: 24 }}>
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="label">Domain</label>
              <input className="input" required placeholder="panel.yourdomain.com" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="label">Panel Name</label>
              <input className="input" required value={form.panel_name} onChange={(e) => setForm({ ...form, panel_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="label">Notes</label>
              <textarea className="textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary">Request Child Panel</button>
          </form>
        </div>

        <h3 style={{ marginBottom: 12 }}>Your requests</h3>
        {panels.length === 0 ? (
          <div className="card user-panel-empty">
            <p className="user-panel-empty-title">No child panel requests</p>
            <span>Submit the form above to request your reseller panel.</span>
          </div>
        ) : (
          <>
            <div className="table-wrap user-panel-table-wrap">
              <table>
                <thead><tr><th>Domain</th><th>Name</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {panels.map((p) => (
                    <tr key={p.id}>
                      <td>{p.domain}</td>
                      <td>{p.panel_name}</td>
                      <td><span className={`badge ${statusBadge(p.status)}`}>{p.status}</span></td>
                      <td>{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="user-panel-mobile-list">
              {panels.map((p) => (
                <article className="card user-panel-mobile-card" key={`cp-m-${p.id}`}>
                  <div className="user-panel-mobile-top">
                    <strong>{p.panel_name}</strong>
                    <span className={`badge ${statusBadge(p.status)}`}>{p.status}</span>
                  </div>
                  <div className="user-panel-mobile-row user-panel-mobile-row--stack">
                    <span>Domain</span>
                    <span>{p.domain}</span>
                  </div>
                  <div className="user-panel-mobile-row">
                    <span>Date</span>
                    <span>{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </UserLayout>
  );
};

export default ChildPanel;
