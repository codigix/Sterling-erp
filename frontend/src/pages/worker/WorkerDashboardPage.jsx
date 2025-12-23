import { useState } from 'react';
import { CheckSquare, Clock, AlertCircle, TrendingUp } from 'lucide-react';

const WorkerDashboardPage = () => {
  const [dateRange, setDateRange] = useState('week');

  const taskStats = [
    { label: 'Total Tasks', value: 23, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900' },
    { label: 'Completed', value: 15, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900' },
    { label: 'In Progress', value: 6, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900' },
    { label: 'Pending', value: 2, color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-900' },
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: 'Assemble Component A',
      period: 'Daily',
      dueDate: '2025-12-16',
      priority: 'high',
      status: 'in-progress',
      assignedBy: 'John Manager',
    },
    {
      id: 2,
      title: 'Quality Check Station 2',
      period: 'Daily',
      dueDate: '2025-12-16',
      priority: 'medium',
      status: 'pending',
      assignedBy: 'John Manager',
    },
    {
      id: 3,
      title: 'Weekly Report Submission',
      period: 'Weekly',
      dueDate: '2025-12-19',
      priority: 'medium',
      status: 'pending',
      assignedBy: 'Production Manager',
    },
    {
      id: 4,
      title: 'Machine Maintenance',
      period: 'Monthly',
      dueDate: '2025-12-31',
      priority: 'low',
      status: 'pending',
      assignedBy: 'Maintenance Dept',
    },
    {
      id: 5,
      title: 'Inventory Count',
      period: 'Weekly',
      dueDate: '2025-12-19',
      priority: 'medium',
      status: 'completed',
      assignedBy: 'Inventory Manager',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'delayed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPeriodColor = (period) => {
    switch (period) {
      case 'Daily':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Weekly':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Monthly':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const completionPercentage = (15 / 23) * 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Task Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor your assigned tasks and progress</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-medium"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {taskStats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bgColor} rounded-lg p-6 border border-slate-200 dark:border-slate-700`}
          >
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Task Completion Progress</h2>
        <div className="space-y-4">
          <div className="flex items-center text-xs justify-between">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Overall Completion</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{Math.round(completionPercentage)}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">15</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">6</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">2</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Pending</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Upcoming Tasks</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Task</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Period</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Due Date</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Priority</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Assigned By</th>
              </tr>
            </thead>
            <tbody>
              {upcomingTasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{task.title}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPeriodColor(task.period)}`}>
                      {task.period}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{task.dueDate}</td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-semibold ${getPriorityColor(task.priority)}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                      {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-sm">{task.assignedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboardPage;
