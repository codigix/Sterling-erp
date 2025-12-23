import React from 'react';
import { BarChart3, TrendingUp, FileText, Users } from 'lucide-react';

const DesignEngineerReportsPage = () => {
  const reports = [
    {
      title: 'Design Productivity',
      icon: TrendingUp,
      description: 'Track designs completed vs. pending',
      action: 'View Report'
    },
    {
      title: 'BOM Analysis',
      icon: BarChart3,
      description: 'Analyze materials and component usage',
      action: 'View Report'
    },
    {
      title: 'Design Reviews',
      icon: FileText,
      description: 'Review cycle times and approval rates',
      action: 'View Report'
    },
    {
      title: 'Team Performance',
      icon: Users,
      description: 'Individual engineer metrics and workload',
      action: 'View Report'
    },
  ];

  const stats = [
    { label: 'Total Designs', value: '127', change: '+12%' },
    { label: 'Avg Review Time', value: '3.2 days', change: '-0.5 days' },
    { label: 'Approval Rate', value: '94%', change: '+2%' },
    { label: 'Active Projects', value: '8', change: '+1' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Design Engineer Reports</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Analytics and performance metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.title} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <Icon size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{report.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{report.description}</p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                {report.action}
              </button>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { time: '2 hours ago', action: 'Approved design "Assembly v2.0"' },
            { time: '5 hours ago', action: 'Submitted BOM for "Project Alpha"' },
            { time: '1 day ago', action: 'Reviewed drawing "Mechanical Layout"' },
            { time: '2 days ago', action: 'Created new design "Electrical Module"' },
          ].map((activity, idx) => (
            <div key={idx} className="flex items-center text-xs justify-between py-2 border-b border-slate-200 dark:border-slate-700 last:border-0">
              <span className="text-sm text-slate-600 dark:text-slate-400">{activity.action}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DesignEngineerReportsPage;
