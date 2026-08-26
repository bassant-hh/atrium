import { useEffect, useState, useCallback } from 'react';
import {
  getCustomerNotifications,
  markNotificationAsRead,
} from '../../services/notification.service';
import './notification.css';

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getNotificationIconConfig = (type) => {
  switch (type) {
    case 'ORDER_ACCEPTED':
      return { icon: '🛵', bg: '#E8EFFD', color: '#5B8DEF' };
    case 'ORDER_PICKED_UP':
      return { icon: '📦', bg: '#BAEAFF', color: '#0C6780' };
    case 'ORDER_DELIVERED':
      return { icon: '🎉', bg: '#E6F7F0', color: '#2E9E6B' };
    default:
      return { icon: '🔔', bg: '#F4FBFD', color: '#156B82' };
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomerNotifications();
      setNotifications(data?.notifications || []);
      setUnreadCount(data?.unreadCount || 0);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCustomerNotifications();
        if (isMounted) {
          setNotifications(data?.notifications || []);
          setUnreadCount(data?.unreadCount || 0);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load notifications');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const markRead = async (id) => {
    const target = notifications.find((n) => n.id === id);
    if (!target || target.isRead) return;

    try {
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await markNotificationAsRead(id);
    } catch (err) {
      console.warn('Failed to mark notification as read:', err.message);
    }
  };

  const markAllRead = async () => {
    const unreadItems = notifications.filter((n) => !n.isRead);
    if (unreadItems.length === 0) return;

    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);

    try {
      await Promise.all(unreadItems.map((item) => markNotificationAsRead(item.id)));
    } catch (err) {
      console.warn('Failed to mark all notifications as read:', err.message);
    }
  };

  return (
    <div className="notif-page">
      <div className="notif-header">
        <div>
          <h1>Notifications</h1>
          <p>
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>

        {unreadCount > 0 && <button onClick={markAllRead}>Mark all as read</button>}
      </div>

      {loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Loading notifications...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '16px',
            color: '#ba1a1a',
            backgroundColor: '#ffdad6',
            borderRadius: '8px',
            margin: '16px 0',
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          You have no notifications yet.
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="notif-list">
          {notifications.map((item) => {
            const iconConfig = getNotificationIconConfig(item.type);
            const isUnread = !item.isRead;

            return (
              <div
                key={item.id}
                className={`notif-item ${isUnread ? 'unread' : ''}`}
                onClick={() => markRead(item.id)}
              >
                <div
                  className="notif-icon"
                  style={{
                    backgroundColor: iconConfig.bg,
                    color: iconConfig.color,
                  }}
                >
                  {iconConfig.icon}
                </div>

                <div className="notif-content">
                  <p className="title">{item.title}</p>
                  <p className="desc">{item.message}</p>

                  <div className="footer">
                    <span>{formatTimeAgo(item.createdAt)}</span>
                  </div>
                </div>

                {isUnread && <span className="dot" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
