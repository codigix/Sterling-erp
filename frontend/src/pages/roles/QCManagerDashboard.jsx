import React from 'react';
import { Link } from 'react-router-dom';
import RoleDashboardLayout from '../../components/layout/RoleDashboardLayout';
import {
  CheckCircle,
  AlertCircle,
  FileText,
  TrendingUp,
  Clock,
  BarChart3,
} from 'lucide-react';

const QCManagerDashboard = () => {
  const navigationItems = [
    {
      title: 'Dashboard',
      path: '/qc-manager/dashboard',
      icon: CheckCircle,
    },
    {
      title: 'Quality Checks',
      icon: CheckCircle,
      submenu: [
        { title: 'Pending QC', path: '/qc-manager/qc/pending', icon: Clock },
        { title: 'In Progress', path: '/qc-manager/qc/progress', icon: TrendingUp },
        { title: 'Completed', path: '/qc-manager/qc/completed', icon: CheckCircle },
      ]
    },
    {
      title: 'GRN Processing',
      icon: FileText,
      submenu: [
        { title: 'GRN List', path: '/qc-manager/grn/list', icon: FileText },
        { title: 'Material Testing', path: '/qc-manager/grn/testing', icon: CheckCircle },
        { title: 'GRN Reports', path: '/qc-manager/grn/reports', icon: BarChart3 },
      ]
    },
    {
      title: 'Material Testing',
      icon: TrendingUp,
      submenu: [
        { title: 'Test Plans', path: '/qc-manager/testing/plans', icon: FileText },
        { title: 'Test Results', path: '/qc-manager/testing/results', icon: CheckCircle },
        { title: 'Certifications', path: '/qc-manager/testing/certs', icon: FileText },
      ]
    },
    {
      title: 'Non-Conformance',
      icon: AlertCircle,
      submenu: [
        { title: 'NCR List', path: '/qc-manager/ncr/list', icon: AlertCircle },
        { title: 'Corrective Actions', path: '/qc-manager/ncr/actions', icon: TrendingUp },
        { title: 'Closed NCRs', path: '/qc-manager/ncr/closed', icon: CheckCircle },
      ]
    },
    {
      title: 'Reports & Analytics',
      path: '/qc-manager/reports',
      icon: BarChart3,
    },
  ];

  const stats = [
    {
      title: 'Total Inspections',
      value: '156',
      change: '+12%',
      positive: true,
      icon: CheckCircle,
    },
    {
      title: 'Pass Rate',
      value: '94.2%',
      change: '+2.1%',
      positive: true,
      icon: TrendingUp,
    },
    {
      title: 'Pending Inspections',
      value: '12',
      change: '-3',
      positive: true,
      icon: Clock,
    },
    {
      title: 'Active NCRs',
      value: '5',
      change: '+1',
      positive: false,
      icon: AlertCircle,
    },
  ];

  return (
    <RoleDashboardLayout
      roleNavigation={navigationItems}
      roleName="QC Manager"
      roleIcon={CheckCircle}
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center text-xs justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {stat.title}
                    </p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                      {stat.value}
                    </p>
                    <p
                      className={`text-sm mt-2 ${
                        stat.positive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stat.positive ? '↑' : '↓'} {stat.change}
                    </p>
                  </div>
                  <Icon size={32} className="text-blue-500" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Pending QC Tasks */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-left mb-4">
            Pending QC Tasks
          </h2>
          <div className="space-y-4">
            {[
              { item: 'Steel Batch #S123', type: 'Material Testing', priority: 'High', dueDate: '2025-12-15' },
              { item: 'GRN #GRN-2025-045', type: 'Incoming Inspection', priority: 'Medium', dueDate: '2025-12-16' },
              { item: 'Project Alpha - Stage 2', type: 'Process Inspection', priority: 'High', dueDate: '2025-12-14' },
              { item: 'Bearing Set #B456', type: 'Final Inspection', priority: 'Medium', dueDate: '2025-12-17' },
            ].map((task, idx) => (
              <div key={idx} className="flex items-center text-xs justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded border-l-4 border-blue-500">
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">{task.item}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{task.type}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      task.priority === 'High'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {task.priority}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Due: {task.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QC Metrics */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-left mb-4">
            Quality Metrics (This Month)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">94.2%</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-xs ">Pass Rate</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">1,234</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-xs ">Items Inspected</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">74</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-xs ">Defects Found</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-left mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/qc-manager/qc/pending"
              className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
            >
              <Clock size={24} className="text-blue-600 dark:text-blue-300 mb-2" />
              <p className="font-medium text-blue-900 dark:text-blue-100">Pending QC</p>
            </Link>
            <Link
              to="/qc-manager/grn/list"
              className="p-4 bg-green-50 dark:bg-green-900 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
            >
              <CheckCircle size={24} className="text-green-600 dark:text-green-300 mb-2" />
              <p className="font-medium text-green-900 dark:text-green-100">GRN List</p>
            </Link>
            <Link
              to="/qc-manager/testing/results"
              className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
            >
              <TrendingUp size={24} className="text-purple-600 dark:text-purple-300 mb-2" />
              <p className="font-medium text-purple-900 dark:text-purple-100">Test Results</p>
            </Link>
            <Link
              to="/qc-manager/ncr/list"
              className="p-4 bg-red-50 dark:bg-red-900 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
            >
              <AlertCircle size={24} className="text-red-600 dark:text-red-300 mb-2" />
              <p className="font-medium text-red-900 dark:text-red-100">NCRs</p>
            </Link>
          </div>
        </div>
      </div>
    </RoleDashboardLayout>
  );
};

export default QCManagerDashboard;
