import React, { useState, useEffect, useCallback } from 'react';
import UserLayout from '../components/UserLayout';
import { getNotifications, markRead, markAllRead } from '../api';
import '../styles/notificationsPage.css';

const POLL_MS = 15000;
const PAGE_SIZE = 20;

const TYPE_ICONS = {
  order: '📦',
  payment: '💳',
  security: '🔒',
  support: '🎫',
  announcement: '📢',
  success: '✅',
  warning: '⚠️',
  info: 'ℹ️',
};

function formatDateTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return String(iso);
  }
}

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadPage = useCallback(async (pageNum, append = false, silent = false) => {
    if (!silent && !append) setLoading(true);
    if (append) setLoadingMore(true);
    try {
      const { data } = await getNotifications({ page: pageNum, limit: PAGE_SIZE });
      const next = data.items || [];
      setItems((prev) => (append ? [...prev, ...next] : next));
      setHasMore(Boolean(data.hasMore));
      setPage(pageNum);
    } catch {
      if (!append) setItems([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadPage(1, false, false);
    const id = setInterval(() => loadPage(1, false, true), POLL_MS);
    return () => clearInterval(id);
  }, [loadPage]);

  const handleMarkRead = async (id) => {
    try {
      await markRead(id);
      setItems((list) =>
        list.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    } catch (_) { /* ignore */ }
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      setItems((list) => list.map((n) => ({ ...n, is_read: true })));
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    } catch (_) { /* ignore */ }
  };

  const loadMore = () => {
    if (!hasMore || loadingMore) return;
    loadPage(page + 1, true, true);
  };

  const hasUnread = items.some((n) => !n.is_read);
  const unreadCount = items.filter((n) => !n.is_read).length;

  return (
    <UserLayout title="Notifications">
      <div className="notifications-page">
        <header className="notifications-page__header">
          <h1 className="notifications-page__title">
            Notifications
            {unreadCount > 0 ? ` (${unreadCount})` : ''}
          </h1>
          <div className="notifications-page__actions">
            {hasUnread && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleMarkAll}>
                Mark all read
              </button>
            )}
          </div>
        </header>

        {loading && items.length === 0 ? (
          <p className="notifications-loading">Loading notifications…</p>
        ) : items.length === 0 ? (
          <div className="card notifications-empty">
            <div className="notifications-empty__icon" aria-hidden="true">
              🔔
            </div>
            <p className="notifications-empty__title">No notifications yet</p>
            <p className="notifications-empty__desc">
              Order updates, wallet activity, support replies, and security alerts will show up here.
              You will also receive email for important events.
            </p>
          </div>
        ) : (
          <>
            <div className="notifications-list">
              {items.map((n) => (
                <article
                  key={n.id}
                  className={`notification-item${n.is_read ? '' : ' notification-item--unread'}`}
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !n.is_read) handleMarkRead(n.id);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${n.title}. ${n.is_read ? 'Read' : 'Unread'}`}
                >
                  <span className="notification-item__icon" aria-hidden="true">
                    {TYPE_ICONS[n.type] || TYPE_ICONS.info}
                  </span>
                  <div className="notification-item__body">
                    <div className="notification-item__row">
                      <h2 className="notification-item__title">{n.title}</h2>
                      <span
                        className={`notification-item__badge ${
                          n.is_read
                            ? 'notification-item__badge--read'
                            : 'notification-item__badge--unread'
                        }`}
                      >
                        {n.is_read ? 'Read' : 'Unread'}
                      </span>
                    </div>
                    <p className="notification-item__message">{n.message}</p>
                    <time className="notification-item__time" dateTime={n.created_at}>
                      {formatDateTime(n.created_at)}
                    </time>
                  </div>
                </article>
              ))}
            </div>
            {hasMore && (
              <div className="notifications-load-more">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </UserLayout>
  );
};

export default Notifications;
