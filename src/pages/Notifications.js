import React, { useState, useEffect } from 'react';
import UserLayout from '../components/UserLayout';
import { getNotifications, markRead, markAllRead } from '../api';

const Notifications = () => {
  const [list, setList] = useState([]);

  const load = () => getNotifications().then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  return (
    <UserLayout>
      <div className="page-header">
        <h1 style={{ marginBottom: 8 }}>Notifications</h1>
        <button className="btn btn-ghost" onClick={() => markAllRead().then(load)}>Mark all read</button>
      </div>
      {list.map((n) => (
        <div key={n.id} className="card" style={{ marginBottom: 12, opacity: n.is_read ? 0.7 : 1, cursor: 'pointer' }}
          onClick={() => !n.is_read && markRead(n.id).then(load)}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{n.title}</strong>
            <span className={`badge badge-${n.type === 'payment' ? 'success' : 'info'}`}>{n.type}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>{n.message}</p>
          <small style={{ color: 'var(--text-muted)' }}>{new Date(n.created_at).toLocaleString()}</small>
        </div>
      ))}
      {!list.length && <p style={{ color: 'var(--text-muted)' }}>No notifications yet.</p>}
    </UserLayout>
  );
};

export default Notifications;
