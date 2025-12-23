import React from 'react';
import { Link, Routes, Route, Navigate } from 'react-router-dom';
import RoleDashboardLayout from '../../components/layout/RoleDashboardLayout';
import ProductionPlansPage from '../production/ProductionPlansPage';
import SchedulingPage from '../production/SchedulingPage';
import ResourceAllocationPage from '../production/ResourceAllocationPage';
import ProductionSpecificationsPage from '../production/ProductionSpecificationsPage';
import ActiveStagesPage from '../production/ActiveStagesPage';
import StageProgressPage from '../production/StageProgressPage';
import StageDetailsPage from '../production/StageDetailsPage';
import AssignTasksPage from '../production/AssignTasksPage';
import TaskTrackingPage from '../production/TaskTrackingPage';
import PerformancePage from '../production/PerformancePage';
import GenerateChallanPage from '../production/GenerateChallanPage';
import ChallanListPage from '../production/ChallanListPage';
import TrackChallanPage from '../production/TrackChallanPage';
import PerformanceMetricsPage from '../production/PerformanceMetricsPage';
import ProductionTasksPage from '../department/ProductionTasksPage';
import {
  Factory,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  FileText,
} from 'lucide-react';

const ProductionManagerDashboard = () => {
  const navigationItems = [
    {
      title: 'Dashboard',
      path: '/production-manager/dashboard',
      icon: Factory,
    },
    {
      title: 'Production Planning',
      icon: Clock,
      submenu: [
        { title: 'Production Plans', path: '/production-manager/planning/plans', icon: Clock },
        { title: 'Production Specifications', path: '/production-manager/planning/specifications', icon: FileText },
        { title: 'Scheduling', path: '/production-manager/planning/schedule', icon: Clock },
        { title: 'Resource Allocation', path: '/production-manager/planning/resources', icon: Users },
      ]
    },
    {
      title: 'Manufacturing Stages',
      icon: Factory,
      submenu: [
        { title: 'Active Stages', path: '/production-manager/stages/active', icon: Factory },
        { title: 'Stage Progress', path: '/production-manager/stages/progress', icon: TrendingUp },
        { title: 'Stage Details', path: '/production-manager/stages/details', icon: Clock },
      ]
    },
    {
      title: 'Worker Management',
      icon: Users,
      submenu: [
        { title: 'Assign Tasks', path: '/production-manager/workers/assign', icon: Users },
        { title: 'Task Tracking', path: '/production-manager/workers/tracking', icon: Clock },
        { title: 'Performance', path: '/production-manager/workers/performance', icon: TrendingUp },
      ]
    },
    {
      title: 'Challan Management',
      icon: CheckCircle,
      submenu: [
        { title: 'Generate Challan', path: '/production-manager/challan/generate', icon: CheckCircle },
        { title: 'Challan List', path: '/production-manager/challan/list', icon: Clock },
        { title: 'Track Challan', path: '/production-manager/challan/track', icon: TrendingUp },
      ]
    },
    {
      title: 'Performance Metrics',
      path: '/production-manager/metrics',
      icon: TrendingUp,
    },
    {
      title: 'Department Tasks',
      path: '/production-manager/department-tasks',
      icon: CheckCircle,
    },
  ];

  const stats = [
    {
      title: 'Active Production',
      value: '8',
      change: '+2',
      positive: true,
      icon: Factory,
    },
    {
      title: 'On-Time Delivery',
      value: '96%',
      change: '+3%',
      positive: true,
      icon: CheckCircle,
    },
    {
      title: 'In-Progress Tasks',
      value: '24',
      change: '+5',
      positive: false,
      icon: Clock,
    },
    {
      title: 'Production Delays',
      value: '2',
      change: '-1',
      positive: true,
      icon: AlertTriangle,
    },
  ];

  const DashboardContent = () => (
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

      {/* Active Production Orders */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white text-left mb-4">
          Active Production Orders
        </h2>
        <div className="space-y-4">
          {[
            { po: 'PO-2025-001', project: 'Project Alpha', progress: 75, status: 'On Track', dueDate: '2025-12-20' },
            { po: 'PO-2025-002', project: 'Project Beta', progress: 45, status: 'In Progress', dueDate: '2025-12-25' },
            { po: 'PO-2025-003', project: 'Project Gamma', progress: 20, status: 'Delayed', dueDate: '2025-12-18' },
          ].map((order, idx) => (
            <div key={idx} className="border-l-4 border-blue-500 bg-slate-50 dark:bg-slate-700 p-4 rounded">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{order.po} - {order.project}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Due: {order.dueDate}</p>
                </div>
                <span
                  className={`px-3 py-1 text-xs rounded font-medium ${
                    order.status === 'On Track'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : order.status === 'Delayed'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <div className="w-full bg-slate-300 dark:bg-slate-600 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${order.progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 text-xs ">{order.progress}% Complete</p>
            </div>
          ))}
        </div>
      </div>

      {/* Manufacturing Stages Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stages Status */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-left mb-4">
            Stage Status
          </h2>
          <div className="space-y-3">
            {[
              { name: 'Cutting & Preparation', status: 'Active', count: 3 },
              { name: 'Welding & Assembly', status: 'Active', count: 2 },
              { name: 'Finishing', status: 'Pending', count: 1 },
              { name: 'Final Inspection', status: 'Completed', count: 2 },
            ].map((stage, idx) => (
              <div key={idx} className="flex items-center text-xs justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">{stage.name}</p>
                </div>
                <div className="flex items-center text-xs gap-3">
                  <span
                    className={`px-2 py-1 text-xs rounded font-medium ${
                      stage.status === 'Active'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : stage.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}
                  >
                    {stage.status}
                  </span>
                  <span className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 px-2 py-1 text-xs rounded">
                    {stage.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Allocation */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-left mb-4">
            Team Allocation
          </h2>
          <div className="space-y-3">
            {[
              { department: 'Cutting & Prep', allocated: 8, utilization: 85 },
              { department: 'Welding', allocated: 6, utilization: 92 },
              { department: 'Assembly', allocated: 5, utilization: 78 },
              { department: 'Finishing', allocated: 4, utilization: 65 },
            ].map((dept, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-700 rounded">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium text-slate-900 dark:text-white text-sm">{dept.department}</p>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{dept.allocated} workers</span>
                </div>
                <div className="w-full bg-slate-300 dark:bg-slate-600 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${dept.utilization}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{dept.utilization}% Utilized</p>
              </div>
            ))}
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
            to="/production-manager/planning/plans"
            className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
          >
            <Clock size={24} className="text-blue-600 dark:text-blue-300 mb-2" />
            <p className="font-medium text-blue-900 dark:text-blue-100">Plans</p>
          </Link>
          <Link
            to="/production-manager/stages/active"
            className="p-4 bg-green-50 dark:bg-green-900 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
          >
            <Factory size={24} className="text-green-600 dark:text-green-300 mb-2" />
            <p className="font-medium text-green-900 dark:text-green-100">Stages</p>
          </Link>
          <Link
            to="/production-manager/workers/assign"
            className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
          >
            <Users size={24} className="text-purple-600 dark:text-purple-300 mb-2" />
            <p className="font-medium text-purple-900 dark:text-purple-100">Assign Tasks</p>
          </Link>
          <Link
            to="/production-manager/challan/generate"
            className="p-4 bg-orange-50 dark:bg-orange-900 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors"
          >
            <CheckCircle size={24} className="text-orange-600 dark:text-orange-300 mb-2" />
            <p className="font-medium text-orange-900 dark:text-orange-100">Challan</p>
          </Link>
          <Link
            to="/production-manager/department-tasks"
            className="p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors"
          >
            <FileText size={24} className="text-indigo-600 dark:text-indigo-300 mb-2" />
            <p className="font-medium text-indigo-900 dark:text-indigo-100">Dept. Tasks</p>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <RoleDashboardLayout
      roleNavigation={navigationItems}
      roleName="Production Manager"
      roleIcon={Factory}
    >
      <Routes>
        <Route path="/" element={<DashboardContent />} />
        <Route path="/dashboard" element={<DashboardContent />} />
        <Route path="/planning/plans" element={<ProductionPlansPage />} />
        <Route path="/planning/specifications" element={<ProductionSpecificationsPage />} />
        <Route path="/planning/schedule" element={<SchedulingPage />} />
        <Route path="/planning/resources" element={<ResourceAllocationPage />} />
        <Route path="/stages/active" element={<ActiveStagesPage />} />
        <Route path="/stages/progress" element={<StageProgressPage />} />
        <Route path="/stages/details" element={<StageDetailsPage />} />
        <Route path="/workers/assign" element={<AssignTasksPage />} />
        <Route path="/workers/tracking" element={<TaskTrackingPage />} />
        <Route path="/workers/performance" element={<PerformancePage />} />
        <Route path="/challan/generate" element={<GenerateChallanPage />} />
        <Route path="/challan/list" element={<ChallanListPage />} />
        <Route path="/challan/track" element={<TrackChallanPage />} />
        <Route path="/metrics" element={<PerformanceMetricsPage />} />
        <Route path="/department-tasks" element={<ProductionTasksPage />} />
        <Route path="*" element={<Navigate to="/production-manager/dashboard" replace />} />
      </Routes>
    </RoleDashboardLayout>
  );
};

export default ProductionManagerDashboard;
