import React, { useState, useEffect, useRef } from 'react';
import { Bell, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/api';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  const getNotificationColor = (alertType) => {
    switch (alertType) {
      case 'stage_ready':
        return 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border-l-4 border-green-500';
      case 'stage_completed':
        return 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border-l-4 border-blue-500';
      case 'task_assigned':
        return 'bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 border-l-4 border-purple-500';
      default:
        return 'bg-slate-50 dark:bg-slate-800 border-l-4 border-slate-500';
    }
  };

  const getNotificationIcon = (alertType) => {
    switch (alertType) {
      case 'stage_ready':
        return '🟢';
      case 'stage_completed':
        return '🔵';
      case 'task_assigned':
        return '🟣';
      default:
        return '⚪';
    }
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'just now';
    
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-IN');
  };

  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/alerts/user/${user.id}`);
      const notifs = response.data || [];
      console.log(`[NotificationBell] Fetched ${notifs.length} notifications for user ${user.id}`);
      setNotifications(notifs);
      
      const unread = notifs.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (notificationId, isCurrentlyRead) => {
    if (isCurrentlyRead) return;

    try {
      await axios.patch(`/alerts/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/alerts/${notificationId}`);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      setUnreadCount(Math.max(0, unreadCount - (notifications.find(n => n.id === notificationId)?.is_read ? 0 : 1)));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <div className="relative">
      <button
        ref={bellRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-slate-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50 max-h-96 overflow-y-auto"
        >
          <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
            <a
              href="/notifications"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all
            </a>
          </div>

          {loading && !notifications.length && (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400">
              <p>Loading...</p>
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400">
              <p>No notifications</p>
            </div>
          )}

          {(() => {
            const unreadNotifs = notifications.filter(n => !n.is_read);
            const readNotifs = notifications.filter(n => n.is_read);
            const displayNotifs = [...unreadNotifs, ...readNotifs].slice(0, 10);
            
            return displayNotifs.map(notif => (
              <div
                key={notif.id}
                className={`border-b border-slate-100 dark:border-slate-700 last:border-b-0 p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer ${
                  !notif.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                } ${getNotificationColor(notif.alert_type)}`}
                onClick={() => markAsRead(notif.id, notif.is_read)}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 text-lg">
                    {getNotificationIcon(notif.alert_type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.is_read ? 'font-semibold' : 'font-medium'} text-slate-900 dark:text-white line-clamp-2`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {getRelativeTime(notif.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notif.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif.id, notif.is_read);
                        }}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                        title="Mark as read"
                      >
                        <Eye size={14} className="text-slate-600 dark:text-slate-400" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900 dark:hover:bg-opacity-30 rounded transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 size={14} className="text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
