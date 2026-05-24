import React from 'react';
import { useNotificationPoll } from '../hooks/useNotificationPoll';

const NotificationToasts = () => {
  const { toasts, dismiss } = useNotificationPoll(!!localStorage.getItem('token'));

  if (!toasts.length) return null;

  return (
    <div className="toast-stack">
      {toasts.map((n) => (
        <div key={n.id} className="toast-item card" onClick={() => dismiss(n.id)}>
          <strong>{n.title}</strong>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{n.message}</p>
        </div>
      ))}
    </div>
  );
};

export default NotificationToasts;
