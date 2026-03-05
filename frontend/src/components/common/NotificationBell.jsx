import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Bell, Trash2, Eye, CheckCheck, Inbox, 
  Settings, User, Info, AlertTriangle, 
  CheckCircle2, Clock, ArrowRight, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/api';

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  const getNotificationStyles = (alertType) => {
    switch (alertType) {
      case 'stage_ready':
      case 'success':
        return {
          bg: 'bg-emerald-50/50 dark:bg-emerald-900/10',
          icon: <CheckCircle2 size={16} className="text-emerald-500" />,
          border: 'border-emerald-100'
        };
      case 'critical':
      case 'error':
        return {
          bg: 'bg-red-50/50 dark:bg-red-900/10',
          icon: <AlertTriangle size={16} className="text-red-500" />,
          border: 'border-red-100'
        };
      case 'warning':
      case 'on_hold':
        return {
          bg: 'bg-amber-50/50 dark:bg-amber-900/10',
          icon: <AlertTriangle size={16} className="text-amber-500" />,
          border: 'border-amber-100'
        };
      case 'task_assigned':
      case 'info':
        return {
          bg: 'bg-blue-50/50 dark:bg-blue-900/10',
          icon: <Info size={16} className="text-blue-500" />,
          border: 'border-blue-100'
        };
      default:
        return {
          bg: 'bg-slate-50/50 dark:bg-slate-800/50',
          icon: <Bell size={16} className="text-slate-500" />,
          border: 'border-slate-100'
        };
    }
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'just now';
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 172800) return 'Yesterday';
    
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const groupNotifications = (notifs) => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    return notifs.reduce((groups, notif) => {
      const date = new Date(notif.created_at).toDateString();
      let groupName = 'Earlier';
      
      if (date === today) groupName = 'Today';
      else if (date === yesterday) groupName = 'Yesterday';
      
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(notif);
      return groups;
    }, {});
  };

  const fetchNotifications = async () => {
    console.log('[NotificationBell] fetchNotifications called, user:', user);
    if (!user?.id) {
      console.warn('[NotificationBell] No user.id found!');
      return;
    }
    try {
      console.log(`[NotificationBell] Fetching from /alerts/user/${user.id}`);
      const response = await axios.get(`/alerts/user/${user.id}`);
      const notifs = response.data || [];
      console.log('[NotificationBell] API Response status:', response.status);
      console.log('[NotificationBell] Fetched notifications:', notifs);
      console.log('[NotificationBell] Response data type:', typeof response.data);
      setNotifications(notifs);
      const unread = notifs.filter(n => !n.is_read);
      console.log('[NotificationBell] Unread count:', unread.length, 'Total:', notifs.length);
      setUnreadCount(unread.length);
    } catch (error) {
      console.error('[NotificationBell] Error fetching notifications:', error);
      console.error('[NotificationBell] Error response:', error.response?.data);
      console.error('[NotificationBell] Error status:', error.response?.status);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          bellRef.current && !bellRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await axios.patch(`/alerts/${notif.id}/read`);
        setNotifications(notifications.map(n => 
          n.id === notif.id ? { ...n, is_read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    }
    
    setShowDropdown(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await axios.patch(`/alerts/user/${user.id}/read-all`);
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete(`/alerts/${id}`);
      const deletedNotif = notifications.find(n => n.id === id);
      setNotifications(notifications.filter(n => n.id !== id));
      if (deletedNotif && !deletedNotif.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const groupedNotifs = useMemo(() => groupNotifications(notifications), [notifications]);

  return (
    <div className="relative">
      <button
        ref={bellRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className={`p-2 rounded-xl transition-all relative ${
          showDropdown 
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
        }`}
      >
        <Bell size={22} strokeWidth={unreadCount > 0 ? 2.5 : 2} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-slate-800">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-3 w-80 md:w-[400px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/30">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Notifications</h3>
              <p className="text-xs text-slate-500 mt-0.5">{unreadCount} unread messages</p>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-1.5"
                  title="Mark all as read"
                >
                  <CheckCheck size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Mark all</span>
                </button>
              )}
              <button 
                onClick={() => setShowDropdown(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Inbox className="text-slate-300 dark:text-slate-600" size={32} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">All caught up!</h4>
                <p className="text-xs text-slate-500">You don't have any notifications right now.</p>
              </div>
            ) : (
              Object.entries(groupedNotifs).map(([group, notifs]) => (
                <div key={group}>
                  <div className="px-5 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{group}</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {notifs.map(notif => {
                      const styles = getNotificationStyles(notif.alert_type);
                      return (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`group px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer relative ${
                            !notif.is_read ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''
                          }`}
                        >
                          {!notif.is_read && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />
                          )}
                          <div className="flex gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${styles.bg}`}>
                              {styles.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm ${!notif.is_read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-400'}`}>
                                  {notif.message}
                                </p>
                                <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap mt-1">
                                  {getRelativeTime(notif.created_at)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span>VIEW DETAILS</span>
                                  <ArrowRight size={10} />
                                </div>
                                <button
                                  onClick={(e) => deleteNotification(e, notif.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
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
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
            <button
              onClick={() => {
                setShowDropdown(false);
                navigate('/notifications');
              }}
              className="w-full py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
