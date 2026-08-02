import { useState } from "react";
import "./notification.css";

const NOTIFICATIONS = [
  {
    id: 1,
    icon: "📦",
    iconBg: "#FFFFFF",
    iconColor: "#DEF4FF",
    title: "Order Delivered",
    desc: "Your order #M1240 has been delivered successfully",
    time: "5 minutes ago",
    unread: true,
  },
  {
    id: 2,
    icon: "⭐",
    iconBg: "#FFFFFF",
    iconColor: "#DEF4FF",
    title: "Rate Your Experience",
    desc: "How was your delivery with Mohammed A.?",
    time: "10 minutes ago",
    unread: true,
    action: { label: "Rate Now", href: "#" },
  },
  {
    id: 3,
    icon: "🎁",
    iconBg: "#FFFFFF",
    iconColor: "#DEF4FF",
    title: "Special Offer!",
    desc: "Get 20% off on your next orders",
    time: "1 hour ago",
    unread: true,
    action: { label: "View Offer", href: "#" },
  },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const markAllRead = () => {
    const updated = notifications.map((item) => {
      return { ...item, unread: false };
    });
    setNotifications(updated);
  };

  const markRead = (id) => {
    const updated = notifications.map((item) => {
      if (item.id === id) {
        return { ...item, unread: false };
      }
      return item;
    });
    setNotifications(updated);
  };

  const unreadCount = notifications.filter((item) => item.unread).length;

  return (
    <div className="notif-page">
      <div className="notif-header">
        <div>
          <h1>Notifications</h1>
          <p>You have {unreadCount} unread notifications</p>
        </div>

        <button onClick={markAllRead}>
          Mark all as read
        </button>
      </div>

      <div className="notif-list">
        {notifications.map((item) => (
          <div
            key={item.id}
            className={`notif-item ${item.unread ? "unread" : ""}`}
            onClick={() => markRead(item.id)}
          >
            <div
              className="notif-icon"
              style={{
                backgroundColor: item.iconBg,
                color: item.iconColor,
              }}
            >
              {item.icon}
            </div>

            <div className="notif-content">
              <p className="title">{item.title}</p>
              <p className="desc">{item.desc}</p>

              <div className="footer">
                <span>{item.time}</span>

                {item.action && (
                  <a
                    href={item.action.href}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.action.label}
                  </a>
                )}
              </div>
            </div>

            {item.unread && <span className="dot" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;