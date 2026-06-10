import React from 'react';
import { useNotificationPoll } from '../hooks/useNotificationPoll';

const ORDER_TOAST_RE =
  /order|wallet|refund|cancelled|canceled|completed|placed|debited|credited/i;

function isOrderSuccessToast(n) {
  const title = String(n.title || '');
  const message = String(n.message || '');
  if (!['order', 'payment'].includes(n.type)) return false;
  return ORDER_TOAST_RE.test(title) || ORDER_TOAST_RE.test(message);
}

const NotificationToasts = () => {
  const { toasts, dismiss } = useNotificationPoll(!!localStorage.getItem('token'));

  if (!toasts.length) return null;

  return (
    <div className="toast-stack">
      {toasts.map((n) => (
        <div
          key={n.id}
          className={`toast-item card${isOrderSuccessToast(n) ? ' toast-item--success' : ''}`}
          onClick={() => dismiss(n.id)}
        >
          <strong>{n.title}</strong>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{n.message}</p>
        </div>
      ))}
    </div>
  );
};

export default NotificationToasts;
