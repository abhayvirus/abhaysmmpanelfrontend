import React, { useState, useEffect } from 'react';
import UserLayout from '../components/UserLayout';
import { getNotifications, markRead, markAllRead } from '../api';

const Notifications = () => {
  const [list, setList] = useState([]);

  const load = () => getNotifications().then((r) => setList(r.data || [])).catch(() => setList([]));
  useEffect(() => { load(); }, []);

  return (
    <UserLayout title="Notifications">
      <div className="notifications-page">
        <div className="page-header">
          <h1 style={{ marginBottom: 0 }}>Notifications</h1>
          <button type="button" className="btn btn-ghost" onClick={() => markAllRead().then(load)}>Mark all read</button>
        </div>
        {list.length === 0 ? (
          <div className="card user-panel-empty">
            <p className="user-panel-empty-title">No notifications yet</p>
            <span>Order and payment updates will appear here.</span>
          </div>
        ) : (
          list.map((n) => (
            <div
              key={n.id}
              className="card notification-card"
              style={{ opacity: n.is_read ? 0.75 : 1, cursor: 'pointer' }}
              onClick={() => !n.is_read && markRead(n.id).then(load)}
              onKeyDown={(e) => e.key === 'Enter' && !n.is_read && markRead(n.id).then(load)}
              role="button"
              tabIndex={0}
            >
              <div className="notification-card-title">
                <strong>{n.title}</strong>
                <span className={`badge badge-${n.type === 'payment' ? 'success' : 'info'}`}>{n.type}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', marginTop: 8, wordBreak: 'break-word' }}>{n.message}</p>
              <small style={{ color: 'var(--text-muted)' }}>{new Date(n.created_at).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>
    </UserLayout>
  );
};

export default Notifications;
