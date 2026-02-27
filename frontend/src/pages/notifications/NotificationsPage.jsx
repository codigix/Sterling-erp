import React, { useState, useEffect, useMemo } from "react";
import {
  Bell,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Check,
  Inbox,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  Clock,
  CheckCheck,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import "../../styles/TaskPage.css";

const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await axios.get(`/alerts/user/${user.id}`);
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  const getNotificationStyles = (alertType) => {
    switch (alertType) {
      case "stage_ready":
      case "success":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-900/10",
          icon: <CheckCircle2 size={24} className="text-emerald-500" />,
          border: "border-l-4 border-emerald-500",
          badge:
            "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
        };
      case "critical":
      case "error":
        return {
          bg: "bg-red-50 dark:bg-red-900/10",
          icon: <AlertTriangle size={24} className="text-red-500" />,
          border: "border-l-4 border-red-500",
          badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        };
      case "warning":
      case "on_hold":
        return {
          bg: "bg-amber-50 dark:bg-amber-900/10",
          icon: <AlertTriangle size={24} className="text-amber-500" />,
          border: "border-l-4 border-amber-500",
          badge:
            "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        };
      default:
        return {
          bg: "bg-blue-50 dark:bg-blue-900/10",
          icon: <Info size={24} className="text-blue-500" />,
          border: "border-l-4 border-blue-500",
          badge:
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        };
    }
  };

  const groupNotifications = (notifs) => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    return notifs.reduce((groups, notif) => {
      const date = new Date(notif.created_at).toDateString();
      let groupName = "Earlier";

      if (date === today) groupName = "Today";
      else if (date === yesterday) groupName = "Yesterday";

      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(notif);
      return groups;
    }, {});
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await axios.patch(`/alerts/${notif.id}/read`);
        setNotifications(
          notifications.map((n) =>
            n.id === notif.id ? { ...n, is_read: true } : n,
          ),
        );
      } catch (err) {
        console.error("Error marking as read:", err);
      }
    }

    if (notif.link) {
      navigate(notif.link);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(`/alerts/user/${user.id}/read-all`);
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete(`/alerts/${id}`);
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (showUnreadOnly && notif.is_read) return false;
      if (filterType !== "all" && notif.alert_type !== filterType) return false;
      return true;
    });
  }, [notifications, showUnreadOnly, filterType]);

  const groupedNotifs = useMemo(
    () => groupNotifications(filteredNotifications),
    [filteredNotifications],
  );
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const types = ["all", ...new Set(notifications.map((n) => n.alert_type))];

  if (loading && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <Loader2 className="animate-spin mb-4 text-blue-600" size={40} />
        <p className="font-medium">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="task-page-container w-full mx-auto p-4 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none">
              <Bell size={28} />
            </div>
            Notification Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Stay updated with your latest activities and task assignments.
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-bold">
                {unreadCount} Unread
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              showUnreadOnly
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "bg-white text-slate-600 border border-slate-200 hover:border-blue-400 hover:text-blue-600"
            }`}
          >
            {showUnreadOnly ? <Eye size={18} /> : <EyeOff size={18} />}
            {showUnreadOnly ? "Showing Unread" : "Show Unread Only"}
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-none"
            >
              <CheckCheck size={18} />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 custom-scrollbar">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
              filterType === type
                ? "bg-slate-900 text-white border-slate-900 shadow-md"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700"
            }`}
          >
            {type.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-10">
        {Object.keys(groupedNotifs).length > 0 ? (
          Object.entries(groupedNotifs).map(([group, notifs]) => (
            <div key={group} className="space-y-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  {group}
                </h2>
                <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1"></div>
              </div>

              <div className="grid gap-4">
                {notifs.map((notif) => {
                  const styles = getNotificationStyles(notif.alert_type);
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`group relative bg-white dark:bg-slate-900 rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                        !notif.is_read
                          ? "border-blue-100 dark:border-blue-900/30 shadow-md"
                          : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                      }`}
                    >
                      {!notif.is_read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600" />
                      )}

                      <div className="p-5 flex items-start gap-5">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${styles.bg}`}
                        >
                          {styles.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${styles.badge}`}
                                >
                                  {notif.alert_type?.replace("_", " ")}
                                </span>
                                {notif.priority === "high" && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase">
                                    <AlertTriangle size={10} />
                                    Urgent
                                  </span>
                                )}
                              </div>
                              <h3
                                className={`text-base font-bold leading-tight ${
                                  !notif.is_read
                                    ? "text-slate-900 dark:text-white"
                                    : "text-slate-600 dark:text-slate-400"
                                }`}
                              >
                                {notif.message}
                              </h3>
                            </div>
                            <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                              <Clock size={12} />
                              {new Date(notif.created_at).toLocaleTimeString(
                                "en-IN",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                              <span>VIEW ACTION ITEM</span>
                              <ChevronRight size={14} />
                            </div>

                            <button
                              onClick={(e) => deleteNotification(e, notif.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                              title="Delete notification"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox size={40} className="text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              No notifications found
            </h3>
            <p className="text-slate-500 max-w-xs mx-auto text-sm">
              We couldn't find any notifications matching your current filters.
            </p>
            <button
              onClick={() => {
                setFilterType("all");
                setShowUnreadOnly(false);
              }}
              className="mt-6 text-sm font-bold text-blue-600 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
