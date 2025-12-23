import React, { useState } from 'react';
import {
  Clock,
  Search,
  Download,
  Eye,
  BarChart3,
  Users,
} from 'lucide-react';

const StageDetailsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const stageDetails = [
    { 
      id: 1, 
      stageNo: 'STG-001-2025', 
      stageName: 'Cutting & Preparation',
      planNo: 'PP-001-2025',
      startDate: '2025-12-16',
      endDate: '2025-12-20',
      totalWorkers: 8,
      completedUnits: 300,
      totalUnits: 500,
      wastageRate: 2.5,
      qualityScore: 98,
      efficiency: 94,
      estimatedCompletion: '2025-12-20',
      tasks: [
        { task: 'Material setup', status: 'completed', workers: 2 },
        { task: 'Cutting process', status: 'in-progress', workers: 4 },
        { task: 'Preparation', status: 'scheduled', workers: 2 },
      ]
    },
    { 
      id: 2, 
      stageNo: 'STG-002-2025', 
      stageName: 'Welding & Assembly',
      planNo: 'PP-002-2025',
      startDate: '2025-12-15',
      endDate: '2025-12-18',
      totalWorkers: 6,
      completedUnits: 120,
      totalUnits: 300,
      wastageRate: 1.2,
      qualityScore: 96,
      efficiency: 89,
      estimatedCompletion: '2025-12-22',
      tasks: [
        { task: 'Welding setup', status: 'completed', workers: 1 },
        { task: 'Main welding', status: 'in-progress', workers: 3 },
        { task: 'Assembly', status: 'in-progress', workers: 2 },
      ]
    },
  ];

  const filteredDetails = stageDetails.filter(stage =>
    stage.stageNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stage.stageName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Stage Details</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Detailed information and tasks for each manufacturing stage</p>
        </div>
        <button className="flex items-center text-xs gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors font-medium">
          <Download size={18} />
          Export
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search stage..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
        />
      </div>

      <div className="space-y-6">
        {filteredDetails.map((stage) => (
          <div key={stage.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{stage.stageName}</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {stage.stageNo} • {stage.planNo} • {stage.startDate} to {stage.endDate}
                  </p>
                </div>
                <button className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors">
                  <Eye size={20} className="text-blue-600 dark:text-blue-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Workers</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{stage.totalWorkers}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Quality Score</p>
                  <p className="text-2xl font-bold text-emerald-600">{stage.qualityScore}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Efficiency</p>
                  <p className="text-2xl font-bold text-blue-600">{stage.efficiency}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Wastage Rate</p>
                  <p className="text-2xl font-bold text-orange-600">{stage.wastageRate}%</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center text-xs gap-2">
                    <BarChart3 size={20} />
                    Production Metrics
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center text-xs justify-between mb-2">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Units Progress</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {stage.completedUnits} / {stage.totalUnits}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(stage.completedUnits / stage.totalUnits) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Estimated Completion</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{stage.estimatedCompletion}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center text-xs gap-2">
                    <Users size={20} />
                    Worker Summary
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Assigned</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{stage.totalWorkers}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Utilization</p>
                        <p className="text-2xl font-bold text-green-600">100%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center text-xs gap-2">
                  <Clock size={20} />
                  Stage Tasks
                </h3>
                <div className="space-y-3">
                  {stage.tasks.map((task, idx) => (
                    <div key={idx} className="flex items-center text-xs justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{task.task}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{task.workers} worker(s) assigned</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTaskStatusColor(task.status)}`}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StageDetailsPage;
