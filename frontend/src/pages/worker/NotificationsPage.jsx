import { useState } from 'react';
import { Bell, AlertCircle, CheckCircle, MessageCircle, Trash2 } from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'alert',
      title: 'Task Deadline Alert',
      message: 'Your "Quality Check Station 2" task is due in 2 hours. Please complete it ASAP.',
      sender: 'Production Manager',
      senderRole: 'Manager',
      timestamp: '2025-12-16T04:30:00',
      read: false,
      priority: 'high',
    },
    {
      id: 2,
      type: 'notification',
      title: 'Task Assigned',
      message: 'New task assigned: "Equipment Cleaning" - Due today at 6:00 PM',
      sender: 'John Manager',
      senderRole: 'Manager',
      timestamp: '2025-12-16T03:45:00',
      read: false,
      priority: 'medium',
    },
    {
      id: 3,
      type: 'request',
      title: 'Worker Request',
      message: 'Sarah has requested your help with the "Assembly Component B" task. Can you assist?',
      sender: 'Sarah Johnson',
      senderRole: 'Worker',
      timestamp: '2025-12-16T02:15:00',
      read: false,
      priority: 'medium',
    },
    {
      id: 4,
      type: 'approval',
      title: 'Request Approved',
      message: 'Your extension request for "Monthly Production Report" has been approved. New deadline: 2025-12-27',
      sender: 'Production Manager',
      senderRole: 'Manager',
      timestamp: '2025-12-15T10:00:00',
      read: true,
      priority: 'low',
    },
    {
      id: 5,
      type: 'alert',
      title: 'Quality Issue Detected',
      message: 'A quality issue has been flagged in your completed batch. Please review the details.',
      sender: 'Quality Control Department',
      senderRole: 'Department',
      timestamp: '2025-12-15T08:30:00',
      read: true,
      priority: 'high',
    },
    {
      id: 6,
      type: 'notification',
      title: 'Task Completed Acknowledged',
      message: 'Your completion of "Material Preparation" task has been verified and acknowledged.',
      sender: 'Production Manager',
      senderRole: 'Manager',
      timestamp: '2025-12-14T16:45:00',
      read: true,
      priority: 'low',
    },
    {
      id: 7,
      type: 'request',
      title: 'Department Request',
      message: 'Inventory Department needs your help with count verification. Can you assist this week?',
      sender: 'Inventory Manager',
      senderRole: 'Manager',
      timestamp: '2025-12-14T11:20:00',
      read: true,
      priority: 'medium',
    },
  ]);

  const [filterType, setFilterType] = useState('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  const filteredNotifications = notifications.filter(notif => {
    const typeMatch = filterType === 'all' || notif.type === filterType;
    const readMatch = !showOnlyUnread || !notif.read;
    return typeMatch && readMatch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeColor = (type) => {
    switch (type) {
      case 'alert':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'notification':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'request':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'approval':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'alert':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'notification':
        return <Bell size={20} className="text-blue-600" />;
      case 'request':
        return <MessageCircle size={20} className="text-purple-600" />;
      case 'approval':
        return <CheckCircle size={20} className="text-green-600" />;
      default:
        return <Bell size={20} />;
    }
  };

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Mark All as Read
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
            >
              <option value="all">All Notifications</option>
              <option value="alert">Alerts</option>
              <option value="notification">Notifications</option>
              <option value="request">Requests</option>
              <option value="approval">Approvals</option>
            </select>
          </div>
          <label className="flex items-center text-xs gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyUnread}
              onChange={(e) => setShowOnlyUnread(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Unread Only</span>
          </label>
        </div>
      </div>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={40} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 dark:text-slate-400 text-lg">No notifications</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-lg border p-4 transition-all ${
                notif.read
                  ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  : 'bg-blue-50 dark:bg-slate-700 border-blue-300 dark:border-blue-600'
              }`}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h3 className={`font-semibold ${notif.read ? 'text-slate-900 dark:text-white' : 'text-blue-900 dark:text-blue-100'}`}>
                        {notif.title}
                      </h3>
                      <p className={`text-xs ${notif.read ? 'text-slate-500 dark:text-slate-400' : 'text-blue-700 dark:text-blue-300'}`}>
                        {notif.sender} • {notif.senderRole}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${getTypeColor(notif.type)}`}>
                      {notif.type.charAt(0).toUpperCase() + notif.type.slice(1)}
                    </span>
                  </div>
                  <p className={`text-sm mb-2 ${notif.read ? 'text-slate-600 dark:text-slate-300' : 'text-blue-900 dark:text-blue-100'}`}>
                    {notif.message}
                  </p>
                  <div className="flex items-center text-xs justify-between">
                    <span className={`text-xs ${notif.read ? 'text-slate-500 dark:text-slate-400' : 'text-blue-600 dark:text-blue-300'}`}>
                      {formatTime(notif.timestamp)}
                    </span>
                    <div className="flex gap-2">
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Mark as Read
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
