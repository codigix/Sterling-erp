import React, { useState } from 'react';
import {
  Factory,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  Clock,
} from 'lucide-react';

const ActiveStagesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const activeStages = [
    { id: 1, stageNo: 'STG-001-2025', planNo: 'PP-001-2025', stageName: 'Cutting & Preparation', assignedWorkers: 8, startDate: '2025-12-16', progress: 60, completedUnits: 300, totalUnits: 500, quality: 98, efficiency: 94 },
    { id: 2, stageNo: 'STG-002-2025', planNo: 'PP-002-2025', stageName: 'Welding & Assembly', assignedWorkers: 6, startDate: '2025-12-15', progress: 40, completedUnits: 120, totalUnits: 300, quality: 96, efficiency: 89 },
    { id: 3, stageNo: 'STG-003-2025', planNo: 'PP-004-2025', stageName: 'Finishing', assignedWorkers: 5, startDate: '2025-12-18', progress: 25, completedUnits: 100, totalUnits: 400, quality: 99, efficiency: 91 },
    { id: 4, stageNo: 'STG-004-2025', planNo: 'PP-002-2025', stageName: 'Final Inspection', assignedWorkers: 3, startDate: '2025-12-19', progress: 45, completedUnits: 135, totalUnits: 300, quality: 97, efficiency: 96 },
  ];

  const filteredStages = activeStages.filter(stage =>
    stage.stageNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stage.planNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stage.stageName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Active Stages', value: activeStages.length, color: 'text-blue-600' },
    { label: 'Total Workers', value: activeStages.reduce((sum, s) => sum + s.assignedWorkers, 0), color: 'text-green-600' },
    { label: 'Avg Quality', value: Math.round(activeStages.reduce((sum, s) => sum + s.quality, 0) / activeStages.length) + '%', color: 'text-emerald-600' },
    { label: 'Avg Progress', value: Math.round(activeStages.reduce((sum, s) => sum + s.progress, 0) / activeStages.length) + '%', color: 'text-yellow-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Active Stages</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor currently active manufacturing stages</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <Plus size={18} />
            New Stage
          </button>
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors font-medium">
            <Download size={18} />
            Export
          </button>
        </div>
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
          placeholder="Search stage, plan or stage name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredStages.map((stage) => (
          <div key={stage.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center text-xs gap-3 mb-2">
                  <Factory size={20} className="text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{stage.stageName}</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {stage.stageNo} • Plan: {stage.planNo}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors">
                  <Eye size={18} className="text-blue-600 dark:text-blue-400" />
                </button>
                <button className="p-2 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-lg transition-colors">
                  <Edit size={18} className="text-yellow-600 dark:text-yellow-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Workers Assigned</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{stage.assignedWorkers}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Started</p>
                <p className="text-sm font-medium text-slate-900 text-left dark:text-white">{stage.startDate}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Quality Score</p>
                <p className="text-2xl font-bold text-emerald-600">{stage.quality}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Efficiency</p>
                <p className="text-2xl font-bold text-blue-600">{stage.efficiency}%</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center text-xs justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Overall Progress</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{stage.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${stage.progress}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center text-xs justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Units Completed</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {stage.completedUnits} / {stage.totalUnits}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div className="bg-green-600 h-3 rounded-full" style={{ width: `${(stage.completedUnits / stage.totalUnits) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveStagesPage;
