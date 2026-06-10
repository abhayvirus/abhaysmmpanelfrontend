import { useState, useEffect, useRef, useCallback } from 'react';
import { pollNotifications } from '../api';

export function useNotificationPoll(enabled = true) {
  const [toasts, setToasts] = useState([]);
  const sinceRef = useRef(new Date().toISOString());

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  useEffect(() => {
    if (!enabled || !localStorage.getItem('token')) return undefined;
    const tick = async () => {
      try {
        const { data } = await pollNotifications(sinceRef.current);
        if (data.notifications?.length) {
          setToasts((prev) => {
            const ids = new Set(prev.map((p) => p.id));
            const fresh = data.notifications.filter((n) => !ids.has(n.id));
            fresh.forEach((n) => {
              setTimeout(() => {
                setToasts((t) => t.filter((x) => x.id !== n.id));
              }, 1000);
            });
            return [...fresh.map((n) => ({ ...n, ts: Date.now() })), ...prev].slice(0, 5);
          });
          sinceRef.current = data.notifications[0].created_at;
          window.dispatchEvent(new CustomEvent('notifications-updated'));
        }
      } catch (_) { /* ignore */ }
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, [enabled]);

  return { toasts, dismiss };
}
