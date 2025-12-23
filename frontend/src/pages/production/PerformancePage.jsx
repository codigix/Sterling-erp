import React, { useState } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  Download,
  Award,
  BarChart3,
} from 'lucide-react';

const PerformancePage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const workerPerformance = [
    { id: 1, name: 'John Smith', tasksCompleted: 45, onTimeCompletion: 95, qualityScore: 98, efficiency: 92, absenceRate: 2, rank: 1 },
    { id: 2, name: 'Sarah Johnson', tasksCompleted: 42, onTimeCompletion: 92, qualityScore: 96, efficiency: 89, absenceRate: 3, rank: 2 },
    { id: 3, name: 'Mike Chen', tasksCompleted: 40, onTimeCompletion: 90, qualityScore: 94, efficiency: 88, absenceRate: 4, rank: 3 },
    { id: 4, name: 'Emma Davis', tasksCompleted: 38, onTimeCompletion: 88, qualityScore: 92, efficiency: 85, absenceRate: 5, rank: 4 },
    { id: 5, name: 'Alex Brown', tasksCompleted: 35, onTimeCompletion: 85, qualityScore: 90, efficiency: 82, absenceRate: 6, rank: 5 },
  ];

  const filteredWorkers = workerPerformance.filter(worker =>
    worker.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 2:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
      case 3:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const stats = [
    { label: 'Total Workers', value: workerPerformance.length, color: 'text-blue-600' },
    { label: 'Avg Quality', value: Math.round(workerPerformance.reduce((sum, w) => sum + w.qualityScore, 0) / workerPerformance.length) + '%', color: 'text-green-600' },
    { label: 'Avg Efficiency', value: Math.round(workerPerformance.reduce((sum, w) => sum + w.efficiency, 0) / workerPerformance.length) + '%', color: 'text-blue-600' },
    { label: 'Avg On-Time', value: Math.round(workerPerformance.reduce((sum, w) => sum + w.onTimeCompletion, 0) / workerPerformance.length) + '%', color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Worker Performance</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track individual worker performance metrics</p>
        </div>
        <button className="flex items-center text-xs gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors font-medium">
          <Download size={18} />
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search worker..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
        />
      </div>

      <div className="space-y-4">
        {filteredWorkers.map((worker) => (
          <div key={worker.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center text-xs gap-4">
                <div className={`p-3 rounded-lg ${getRankBadge(worker.rank)}`}>
                  <Award size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{worker.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {worker.tasksCompleted} tasks completed
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-900 dark:text-white">#{worker.rank}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Rank</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">On-Time Completion</p>
                <p className="text-xl font-bold text-blue-600">{worker.onTimeCompletion}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Quality Score</p>
                <p className="text-xl font-bold text-green-600">{worker.qualityScore}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Efficiency</p>
                <p className="text-xl font-bold text-purple-600">{worker.efficiency}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Absence Rate</p>
                <p className="text-xl font-bold text-orange-600">{worker.absenceRate}%</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Quality</span>
                  <span className="text-slate-900 dark:text-white font-medium">{worker.qualityScore}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${worker.qualityScore}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Efficiency</span>
                  <span className="text-slate-900 dark:text-white font-medium">{worker.efficiency}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${worker.efficiency}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformancePage;
