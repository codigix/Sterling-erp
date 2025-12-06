import React, { useState } from 'react';
import { Bell, Trash2, Eye, EyeOff, Filter, Check } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import '../../styles/TaskPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'task-assigned',
      title: 'New Task Assigned',
      message: 'You have been assigned a new task: Quality Check in Assembly Stage 1',
      timestamp: '2025-01-29 10:30',
      read: false,
      category: 'Task',
      priority: 'high'
    },
    {
      id: 2,
      type: 'material-issued',
      title: 'Material Issued',
      message: 'Material SKU-001 (Steel Shaft, 10 units) has been issued to production line',
      timestamp: '2025-01-29 09:15',
      read: false,
      category: 'Inventory',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'qc-required',
      title: 'QC Required',
      message: 'GRN-001 is pending quality check inspection',
      timestamp: '2025-01-28 16:45',
      read: false,
      category: 'QC',
      priority: 'high'
    },
    {
      id: 4,
      type: 'po-received',
      title: 'Purchase Order Received',
      message: 'PO-2025-002 has been received from Electrical Components Co',
      timestamp: '2025-01-28 14:20',
      read: true,
      category: 'Procurement',
      priority: 'medium'
    },
    {
      id: 5,
      type: 'challan-inward',
      title: 'Challan Received',
      message: 'Inward challan CH-IN-001 for Painting has been received and verified',
      timestamp: '2025-01-28 11:00',
      read: true,
      category: 'Challan',
      priority: 'low'
    },
    {
      id: 6,
      type: 'stage-completed',
      title: 'Manufacturing Stage Completed',
      message: 'Assembly Stage 1 for PROJ-001 has been marked as completed',
      timestamp: '2025-01-27 17:30',
      read: true,
      category: 'Production',
      priority: 'medium'
    }
  ]);

  const [filterCategory, setFilterCategory] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const getNotificationColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900 dark:bg-opacity-20';
      case 'medium': return 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20';
      case 'low': return 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900 dark:bg-opacity-20';
      default: return 'border-l-4 border-slate-500';
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case 'Task': return 'bg-blue-100 text-blue-800';
      case 'Inventory': return 'bg-purple-100 text-purple-800';
      case 'QC': return 'bg-green-100 text-green-800';
      case 'Procurement': return 'bg-orange-100 text-orange-800';
      case 'Challan': return 'bg-cyan-100 text-cyan-800';
      case 'Production': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (showUnreadOnly && notif.read) return false;
    if (filterCategory !== 'all' && notif.category !== filterCategory) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const categories = ['all', ...new Set(notifications.map(n => n.category))];

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="task-page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Bell size={32} />
          Notifications
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showUnreadOnly
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300'
            }`}
          >
            {showUnreadOnly ? <Eye size={18} /> : <EyeOff size={18} />}
            Unread Only
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <Check size={18} />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notif => (
            <Card
              key={notif.id}
              className={`p-0 ${getNotificationColor(notif.priority)} ${!notif.read ? 'ring-2 ring-blue-400' : ''}`}
            >
              <div className="p-6 flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    notif.priority === 'high'
                      ? 'bg-red-100 dark:bg-red-900'
                      : notif.priority === 'medium'
                        ? 'bg-yellow-100 dark:bg-yellow-900'
                        : 'bg-green-100 dark:bg-green-900'
                  }`}>
                    <Bell size={20} className={
                      notif.priority === 'high'
                        ? 'text-red-600 dark:text-red-300'
                        : notif.priority === 'medium'
                          ? 'text-yellow-600 dark:text-yellow-300'
                          : 'text-green-600 dark:text-green-300'
                    } />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className={`text-base font-bold ${
                        notif.read
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {notif.title}
                      </h3>
                      <p className={`text-sm mt-1 ${
                        notif.read
                          ? 'text-slate-600 dark:text-slate-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {notif.message}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Badge className={getPriorityBadgeColor(notif.priority)}>
                        {notif.priority.charAt(0).toUpperCase() + notif.priority.slice(1)}
                      </Badge>
                      <Badge className={getCategoryBadgeColor(notif.category)}>
                        {notif.category}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-3">
                    {notif.timestamp}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {!notif.read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <Bell size={48} className="mx-auto text-slate-400 mb-4 opacity-50" />
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {showUnreadOnly ? 'No unread notifications' : 'No notifications'}
            </p>
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">
              {filterCategory !== 'all' ? `Try selecting a different category` : `You're all caught up!`}
            </p>
          </Card>
        )}
      </div>

      {/* Summary */}
      {filteredNotifications.length > 0 && (
        <Card className="mt-8 p-4 bg-slate-50 dark:bg-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Showing <span className="font-bold text-slate-900 dark:text-slate-100">{filteredNotifications.length}</span> of <span className="font-bold text-slate-900 dark:text-slate-100">{notifications.length}</span> notifications
          </p>
        </Card>
      )}
    </div>
  );
};

export default NotificationsPage;
