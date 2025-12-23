import { useState } from 'react';
import { Link, Routes, Route, Navigate } from 'react-router-dom';
import RoleDashboardLayout from '../../components/layout/RoleDashboardLayout';
import WorkerDashboardPage from '../worker/WorkerDashboardPage';
import DailyTasksPage from '../worker/DailyTasksPage';
import WeeklyTasksPage from '../worker/WeeklyTasksPage';
import MonthlyTasksPage from '../worker/MonthlyTasksPage';
import RequestToManagerPage from '../worker/RequestToManagerPage';
import NotificationsPage from '../worker/NotificationsPage';
import RequestHistoryPage from '../worker/RequestHistoryPage';
import {
  Users,
  CheckSquare,
  Calendar,
  AlertCircle,
  MessageSquare,
  Clock,
  TrendingUp,
} from 'lucide-react';

const DashboardContent = ({ stats, handleExport }) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Worker Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your assigned tasks and track progress</p>
      </div>
      <button
        onClick={handleExport}
        className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
      >
        <TrendingUp size={18} />
        Export Report
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center text-xs justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.title}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</p>
                <p className={`text-sm mt-1 font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </p>
              </div>
              <Icon size={32} className={`${stat.positive ? 'text-green-600' : 'text-red-600'} opacity-20`} />
            </div>
          </div>
        );
      })}
    </div>

    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Link
          to="/worker/daily-tasks"
          className="p-4 bg-blue-50 dark:bg-slate-700 rounded-lg hover:bg-blue-100 dark:hover:bg-slate-600 transition-colors"
        >
          <Clock size={24} className="text-blue-600 mb-2" />
          <p className="font-medium text-slate-900 dark:text-white text-sm">Daily Tasks</p>
        </Link>
        <Link
          to="/worker/weekly-tasks"
          className="p-4 bg-purple-50 dark:bg-slate-700 rounded-lg hover:bg-purple-100 dark:hover:bg-slate-600 transition-colors"
        >
          <Calendar size={24} className="text-purple-600 mb-2" />
          <p className="font-medium text-slate-900 dark:text-white text-sm">Weekly Tasks</p>
        </Link>
        <Link
          to="/worker/monthly-tasks"
          className="p-4 bg-orange-50 dark:bg-slate-700 rounded-lg hover:bg-orange-100 dark:hover:bg-slate-600 transition-colors"
        >
          <Calendar size={24} className="text-orange-600 mb-2" />
          <p className="font-medium text-slate-900 dark:text-white text-sm">Monthly Tasks</p>
        </Link>
        <Link
          to="/worker/request-to-manager"
          className="p-4 bg-green-50 dark:bg-slate-700 rounded-lg hover:bg-green-100 dark:hover:bg-slate-600 transition-colors"
        >
          <MessageSquare size={24} className="text-green-600 mb-2" />
          <p className="font-medium text-slate-900 dark:text-white text-sm">Request Manager</p>
        </Link>
        <Link
          to="/worker/notifications"
          className="p-4 bg-red-50 dark:bg-slate-700 rounded-lg hover:bg-red-100 dark:hover:bg-slate-600 transition-colors"
        >
          <AlertCircle size={24} className="text-red-600 mb-2" />
          <p className="font-medium text-slate-900 dark:text-white text-sm">Notifications</p>
        </Link>
        <Link
          to="/worker/request-history"
          className="p-4 bg-indigo-50 dark:bg-slate-700 rounded-lg hover:bg-indigo-100 dark:hover:bg-slate-600 transition-colors"
        >
          <CheckSquare size={24} className="text-indigo-600 mb-2" />
          <p className="font-medium text-slate-900 dark:text-white text-sm">Request History</p>
        </Link>
      </div>
    </div>
  </div>
);

const WorkerDashboard = () => {
  const [dateRange, setDateRange] = useState('current-week');

  const stats = [
    { title: 'Total Tasks', value: '23', change: '+5 this week', positive: true, icon: CheckSquare },
    { title: 'Completed', value: '15', change: '+65% completion', positive: true, icon: CheckSquare },
    { title: 'In Progress', value: '6', change: '3 tasks delayed', positive: false, icon: Clock },
    { title: 'Pending', value: '2', change: 'Due tomorrow', positive: false, icon: AlertCircle },
  ];

  const handleExport = () => {
    console.log('Exporting report...');
    alert('Report exported successfully!');
  };

  const navigationItems = [
    {
      title: 'Dashboard',
      path: '/worker/dashboard',
      icon: Users,
    },
    {
      title: 'Tasks',
      icon: CheckSquare,
      submenu: [
        { title: 'Daily Tasks', path: '/worker/daily-tasks', icon: Clock },
        { title: 'Weekly Tasks', path: '/worker/weekly-tasks', icon: Calendar },
        { title: 'Monthly Tasks', path: '/worker/monthly-tasks', icon: Calendar },
      ],
    },
    {
      title: 'Requests',
      icon: MessageSquare,
      submenu: [
        { title: 'Request to Manager', path: '/worker/request-to-manager', icon: MessageSquare },
        { title: 'Request History', path: '/worker/request-history', icon: CheckSquare },
      ],
    },
    {
      title: 'Notifications',
      path: '/worker/notifications',
      icon: AlertCircle,
    },
  ];

  return (
    <RoleDashboardLayout
      roleNavigation={navigationItems}
      roleName="Worker"
      roleIcon={Users}
    >
      <Routes>
        <Route path="/" element={<DashboardContent stats={stats} handleExport={handleExport} />} />
        <Route path="/dashboard" element={<DashboardContent stats={stats} handleExport={handleExport} />} />
        <Route path="/daily-tasks" element={<DailyTasksPage />} />
        <Route path="/weekly-tasks" element={<WeeklyTasksPage />} />
        <Route path="/monthly-tasks" element={<MonthlyTasksPage />} />
        <Route path="/request-to-manager" element={<RequestToManagerPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/request-history" element={<RequestHistoryPage />} />
        <Route path="*" element={<Navigate to="/worker/dashboard" replace />} />
      </Routes>
    </RoleDashboardLayout>
  );
};

export default WorkerDashboard;
