import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from '@/utils/api';
import {
  Wrench,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Users,
  Zap,
  Target,
  Award,
  Loader2,
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DesignEngineerDashboard = () => {
  const [stats, setStats] = useState([]);
  const [departmentTasks, setDepartmentTasks] = useState([]);
  const [taskStats, setTaskStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const roleId = await getRoleId('design_engineer');
      if (!roleId) {
        console.warn('Design Engineer role not found, using default role ID');
      }

      await Promise.all([
        fetchTasksForDesignEngineer(roleId || 1),
        fetchTaskStats(roleId || 1),
      ]);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getRoleId = async (roleName) => {
    try {
      const response = await axios.get(`/api/department/portal/role/${roleName}`);
      return response.data.roleId;
    } catch {
      console.warn(`Role '${roleName}' not found, will use default role ID`);
      return null;
    }
  };

  const fetchTasksForDesignEngineer = async (roleId) => {
    try {
      const response = await axios.get(`/api/department/portal/tasks/${roleId}`);
      setDepartmentTasks(response.data);

      generateStatisticsFromTasks(response.data);
    } catch (err) {
      console.error('Error fetching design engineer tasks:', err);
      throw err;
    }
  };

  const fetchTaskStats = async (roleId) => {
    try {
      const response = await axios.get(`/api/department/portal/stats/${roleId}`);
      setTaskStats(response.data);
    } catch (err) {
      console.error('Error fetching task stats:', err);
      throw err;
    }
  };

  const generateStatisticsFromTasks = (tasks) => {
    const pendingCount = tasks.filter(t => t.status === 'pending').length;
    const _inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const criticalCount = tasks.filter(t => t.priority === 'critical').length;

    const generatedStats = [
      {
        title: 'Assigned Projects',
        value: tasks.length.toString(),
        change: '+' + (tasks.filter(t => t.status === 'pending').length),
        positive: true,
        icon: Wrench,
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
        borderColor: 'border-blue-200 dark:border-blue-700',
      },
      {
        title: 'Pending Tasks',
        value: pendingCount.toString(),
        change: pendingCount > 0 ? '+' + pendingCount : '0',
        positive: pendingCount <= 2,
        icon: Clock,
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        iconColor: 'text-amber-600 dark:text-amber-400',
        borderColor: 'border-amber-200 dark:border-amber-700',
      },
      {
        title: 'Completed',
        value: completedCount.toString(),
        change: completedCount > 0 ? '+' + completedCount : '0',
        positive: true,
        icon: CheckCircle,
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        iconColor: 'text-green-600 dark:text-green-400',
        borderColor: 'border-green-200 dark:border-green-700',
      },
      {
        title: 'Critical Priority',
        value: criticalCount.toString(),
        change: criticalCount > 0 ? criticalCount + ' tasks' : 'None',
        positive: criticalCount === 0,
        icon: AlertCircle,
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        iconColor: 'text-red-600 dark:text-red-400',
        borderColor: 'border-red-200 dark:border-red-700',
      },
    ];

    setStats(generatedStats);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          font: { size: 12, weight: '500' },
          boxWidth: 14,
          padding: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 11 },
        padding: 10,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 10 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } },
      },
    },
  };

  const taskStatusData = {
    labels: ['Pending', 'In Progress', 'Completed', 'On Hold'],
    datasets: [
      {
        data: [
          departmentTasks.filter(t => t.status === 'pending').length,
          departmentTasks.filter(t => t.status === 'in_progress').length,
          departmentTasks.filter(t => t.status === 'completed').length,
          departmentTasks.filter(t => t.status === 'on_hold').length,
        ],
        backgroundColor: [
          'rgba(251, 191, 36, 0.85)',
          'rgba(59, 130, 246, 0.85)',
          'rgba(34, 197, 94, 0.85)',
          'rgba(156, 163, 175, 0.85)',
        ],
        borderColor: [
          'rgb(251, 191, 36)',
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(156, 163, 175)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const priorityDistributionData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Task Count',
        data: [
          departmentTasks.filter(t => t.priority === 'critical').length,
          departmentTasks.filter(t => t.priority === 'high').length,
          departmentTasks.filter(t => t.priority === 'medium').length,
          departmentTasks.filter(t => t.priority === 'low').length,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1.5,
        borderRadius: 4,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
          <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">Error Loading Dashboard</h3>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="bg-blue-600 dark:bg-blue-700 rounded-xl p-3 text-white shadow-lg">
        <div className="max-w-2xl">
          <h1 className="text-xl font-bold mb-1">Design Engineering Hub</h1>
          <p className="text-blue-100 text-xs">Real-time project and task monitoring</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className={`group relative overflow-hidden rounded-xl border ${stat.borderColor} bg-white dark:bg-slate-800 shadow-sm hover:shadow-lg transition-all duration-300`}
            >
              <div className="relative p-3">
                <div className="flex items-center text-xs justify-between mb-3">
                  <div className={`${stat.bgColor} p-2.5 rounded-lg`}>
                    <Icon size={15} className={stat.iconColor} />
                  </div>
                  <div className={`flex items-center text-xs gap-1 px-2 py-1 rounded-full ${stat.positive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    <TrendingUp size={14} className={stat.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} />
                    <span className={`text-xs font-semibold ${stat.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{stat.title}</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Target size={15} className="text-blue-600 dark:text-blue-400" />
              Task Status Overview
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Current distribution of design tasks</p>
          </div>
          <div className="h-72">
            {departmentTasks.length > 0 ? (
              <Bar data={priorityDistributionData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                No tasks available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Award size={15} className="text-amber-600 dark:text-amber-400" />
              Task Distribution
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">By status</p>
          </div>
          <div className="h-72 flex justify-center">
            <div className="w-full">
              {departmentTasks.length > 0 ? (
                <Doughnut
                  data={taskStatusData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        ...chartOptions.plugins.legend,
                        position: 'bottom',
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                  No tasks
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assigned Root Cards</h3>
            <Link to="/design-engineer/department-tasks" className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700">
              View All →
            </Link>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {departmentTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="group border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{task.rootCard?.title || 'N/A'}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{task.salesOrder?.customer || 'No Customer'}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    : task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : task.status === 'on_hold' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {task.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Priority: <span className="font-semibold capitalize">{task.priority}</span>
                  </span>
                  {task.salesOrder?.poNumber && (
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">PO: {task.salesOrder.poNumber}</span>
                  )}
                </div>
              </div>
            ))}
            {departmentTasks.length === 0 && (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">No tasks assigned yet</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Task Statistics</h3>
          <div className="space-y-4">
            {taskStats && [
              { label: 'Total Tasks', value: taskStats.total, color: 'bg-blue-500', icon: '📋' },
              { label: 'In Progress', value: taskStats.in_progress, color: 'bg-indigo-500', icon: '⚙️' },
              { label: 'Completed', value: taskStats.completed, color: 'bg-green-500', icon: '✓' },
              { label: 'On Hold', value: taskStats.on_hold, color: 'bg-red-500', icon: '⏸' },
            ].map((metric, idx) => (
              <div key={idx} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`text-lg font-bold ${metric.color} text-white w-8 h-8 rounded-full flex items-center justify-center text-sm`}>
                      {metric.icon}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{metric.label}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{metric.value}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`${metric.color} h-2.5 rounded-full transition-all duration-500`}
                    style={{ width: `${(metric.value / Math.max(taskStats.total, 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-2.5">
            <Link
              to="/design-engineer/documents/designs"
              className="flex items-center gap-3 p-3.5 rounded-lg border-2 border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 hover:border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all group"
            >
              <Wrench size={18} className="text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">My Designs</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Browse & manage</p>
              </div>
            </Link>
            <Link
              to="/design-engineer/bom/create"
              className="flex items-center gap-3 p-3.5 rounded-lg border-2 border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 hover:border-green-500 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all group"
            >
              <BarChart3 size={18} className="text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Create BOM</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Bill of materials</p>
              </div>
            </Link>
            <Link
              to="/design-engineer/department-tasks"
              className="flex items-center gap-3 p-3.5 rounded-lg border-2 border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-900/20 hover:border-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all group"
            >
              <CheckCircle size={18} className="text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Department Tasks</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{departmentTasks.length} assigned</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Tasks</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {departmentTasks.slice(0, 4).map((task) => (
              <div key={task.id} className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-700 last:border-0">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                  task.status === 'completed' ? 'bg-green-500' 
                  : task.status === 'in_progress' ? 'bg-blue-500' 
                  : task.status === 'on_hold' ? 'bg-red-500'
                  : 'bg-amber-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-600 dark:text-slate-400">{task.rootCard?.title || 'N/A'}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {new Date(task.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {departmentTasks.length === 0 && (
              <p className="text-center text-slate-500 dark:text-slate-400 py-4">No recent tasks</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignEngineerDashboard;
