import { useState, useEffect } from "react";
import { FiBell, FiCheckCircle, FiCalendar, FiUserCheck, FiInfo, FiCheck } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../api/axios";
import Navbar from "../../components/common/Navbar";
import StickyHeader from "../../components/common/StickyHeader";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get("/notifications");
      if (data.success) setNotifications(data.data);
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Mark read error:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const getIcon = (type) => {
    const icons = {
      event_new: <FiCalendar className="text-blue-500" />,
      event_update: <FiInfo className="text-yellow-500" />,
      event_reminder: <FiBell className="text-purple-500" />,
      registration: <FiUserCheck className="text-green-500" />,
      approval: <FiCheckCircle className="text-green-500" />,
      system: <FiInfo className="text-gray-500" />,
    };
    return icons[type] || icons.system;
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="sidebar-layout">
      <Navbar />
      <div className="main-content">
        <StickyHeader breadcrumbs={["Home", "Notifications"]} />
        <div className="px-6 pb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--nm-text)" }}>🔔 Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm" style={{ color: "var(--nm-text-secondary)" }}>{unreadCount} unread notification{unreadCount > 1 ? "s" : ""}</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium">
                <FiCheck /> Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="nm-flat text-center py-20">
              <p className="text-6xl mb-4">🔕</p>
              <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--nm-text)" }}>No notifications yet</h3>
              <p style={{ color: "var(--nm-text-secondary)" }}>You'll be notified about events and updates here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                  className={`nm-flat-hover p-4 flex items-start gap-4 cursor-pointer ${
                    !notification.isRead ? "ring-1 ring-primary-200" : ""
                  }`}
                >
                  <div className="text-xl mt-0.5">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-semibold" style={{ color: notification.isRead ? "var(--nm-text-secondary)" : "var(--nm-text)" }}>
                        {notification.title}
                      </h3>
                      <span className="text-xs whitespace-nowrap" style={{ color: "var(--nm-text-secondary)" }}>{timeAgo(notification.createdAt)}</span>
                    </div>
                    <p className="text-sm mt-0.5" style={{ color: "var(--nm-text-secondary)" }}>
                      {notification.message}
                    </p>
                    {notification.relatedEvent && (
                      <p className="text-xs text-primary-500 mt-1">📅 {notification.relatedEvent.title}</p>
                    )}
                  </div>
                  {!notification.isRead && (
                    <div className="w-2.5 h-2.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
