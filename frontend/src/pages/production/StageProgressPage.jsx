import React, { useState } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
} from 'lucide-react';

const StageProgressPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const progressData = [
    { id: 1, stageNo: 'STG-001-2025', stageName: 'Cutting & Preparation', planNo: 'PP-001-2025', startDate: '2025-12-16', endDate: '2025-12-20', currentProgress: 60, targetProgress: 100, status: 'on-track', daysRemaining: 3, bottlenecks: 0 },
    { id: 2, stageNo: 'STG-002-2025', stageName: 'Welding & Assembly', planNo: 'PP-002-2025', startDate: '2025-12-15', endDate: '2025-12-18', currentProgress: 40, targetProgress: 100, status: 'delayed', daysRemaining: -2, bottlenecks: 2 },
    { id: 3, stageNo: 'STG-003-2025', stageName: 'Finishing', planNo: 'PP-004-2025', startDate: '2025-12-18', endDate: '2025-12-24', currentProgress: 25, targetProgress: 60, status: 'on-track', daysRemaining: 4, bottlenecks: 1 },
    { id: 4, stageNo: 'STG-004-2025', stageName: 'Final Inspection', planNo: 'PP-002-2025', startDate: '2025-12-19', endDate: '2025-12-22', currentProgress: 45, targetProgress: 70, status: 'on-track', daysRemaining: 2, bottlenecks: 0 },
    { id: 5, stageNo: 'STG-005-2025', stageName: 'Painting & Coating', planNo: 'PP-003-2025', startDate: '2025-12-20', endDate: '2025-12-26', currentProgress: 10, targetProgress: 50, status: 'early', daysRemaining: 5, bottlenecks: 0 },
  ];

  const filteredData = progressData.filter(data =>
    (data.stageNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
     data.stageName.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'all' || data.status === statusFilter)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'delayed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'early':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Stage Progress</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track progress and identify bottlenecks</p>
        </div>
        <button className="flex items-center text-xs gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors font-medium">
          <Download size={18} />
          Export Report
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search stage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
        >
          <option value="all">All Status</option>
          <option value="on-track">On Track</option>
          <option value="delayed">Delayed</option>
          <option value="early">Early</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredData.map((stage) => (
          <div key={stage.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{stage.stageName}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {stage.stageNo} • {stage.planNo} • {stage.startDate} to {stage.endDate}
                </p>
              </div>
              <div className="flex items-center text-xs gap-3">
                {stage.bottlenecks > 0 && (
                  <div className="flex items-center text-xs gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <AlertTriangle size={16} className="text-orange-600 dark:text-orange-400" />
                    <span className="text-xs font-medium text-orange-700 dark:text-orange-300">{stage.bottlenecks} bottleneck(s)</span>
                  </div>
                )}
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(stage.status)}`}>
                  {stage.status.charAt(0).toUpperCase() + stage.status.slice(1).replace('-', ' ')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Current Progress</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{stage.currentProgress}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Target Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stage.targetProgress}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Days Remaining</p>
                <p className={`text-2xl font-bold ${stage.daysRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stage.daysRemaining < 0 ? stage.daysRemaining : '+' + stage.daysRemaining}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center text-xs justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Actual Progress</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{stage.currentProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stage.currentProgress}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center text-xs justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Target Progress</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{stage.targetProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${stage.targetProgress}%` }}></div>
                </div>
              </div>

              {stage.status === 'delayed' && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    <strong>Warning:</strong> This stage is behind schedule by {Math.abs(stage.daysRemaining)} day(s). Immediate action required.
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StageProgressPage;
