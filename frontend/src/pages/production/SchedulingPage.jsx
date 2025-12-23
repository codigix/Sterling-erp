import React, { useState } from 'react';
import {
  Calendar,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  AlertTriangle,
  Clock,
} from 'lucide-react';

const SchedulingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const schedules = [
    { id: 1, scheduleNo: 'SCH-001-2025', planNo: 'PP-001-2025', stage: 'Cutting & Preparation', startDate: '2025-12-16', endDate: '2025-12-20', durationDays: 4, assignedWorkers: 8, status: 'in-progress', completion: 60 },
    { id: 2, scheduleNo: 'SCH-002-2025', planNo: 'PP-001-2025', stage: 'Welding & Assembly', startDate: '2025-12-21', endDate: '2025-12-24', durationDays: 3, assignedWorkers: 6, status: 'scheduled', completion: 0 },
    { id: 3, scheduleNo: 'SCH-003-2025', planNo: 'PP-002-2025', stage: 'Finishing', startDate: '2025-12-15', endDate: '2025-12-18', durationDays: 3, assignedWorkers: 5, status: 'completed', completion: 100 },
    { id: 4, scheduleNo: 'SCH-004-2025', planNo: 'PP-002-2025', stage: 'Final Inspection', startDate: '2025-12-19', endDate: '2025-12-22', durationDays: 3, assignedWorkers: 3, status: 'in-progress', completion: 40 },
    { id: 5, scheduleNo: 'SCH-005-2025', planNo: 'PP-003-2025', stage: 'Cutting & Preparation', startDate: '2025-12-18', endDate: '2025-12-22', durationDays: 4, assignedWorkers: 7, status: 'scheduled', completion: 0 },
    { id: 6, scheduleNo: 'SCH-006-2025', planNo: 'PP-004-2025', stage: 'Welding & Assembly', startDate: '2025-12-10', endDate: '2025-12-15', durationDays: 5, assignedWorkers: 8, status: 'completed', completion: 100 },
  ];

  const filteredSchedules = schedules.filter(schedule =>
    (schedule.scheduleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
     schedule.planNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
     schedule.stage.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'all' || schedule.status === statusFilter)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'delayed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const stats = [
    { label: 'Total Schedules', value: schedules.length, color: 'text-blue-600' },
    { label: 'In Progress', value: schedules.filter(s => s.status === 'in-progress').length, color: 'text-blue-600' },
    { label: 'Scheduled', value: schedules.filter(s => s.status === 'scheduled').length, color: 'text-yellow-600' },
    { label: 'Completed', value: schedules.filter(s => s.status === 'completed').length, color: 'text-green-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Production Scheduling</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Schedule manufacturing stages and timelines</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <Plus size={18} />
            New Schedule
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

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search schedule, plan or stage..."
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
            <option value="in-progress">In Progress</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="delayed">Delayed</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Schedule</th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Plan No.</th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Stage</th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Timeline</th>
                <th className="p-2 text-center text-sm font-semibold text-slate-900 dark:text-white">Duration</th>
                <th className="p-2 text-center text-sm font-semibold text-slate-900 dark:text-white">Workers</th>
                <th className="p-2 text-center text-sm font-semibold text-slate-900 dark:text-white">Completion</th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((schedule) => (
                <tr key={schedule.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-2 text-sm font-medium text-slate-900 text-left dark:text-white">{schedule.scheduleNo}</td>
                  <td className="p-2 text-sm text-slate-600 dark:text-slate-400">{schedule.planNo}</td>
                  <td className="p-2 text-sm text-slate-600 dark:text-slate-400">{schedule.stage}</td>
                  <td className="p-2 text-sm text-slate-600 dark:text-slate-400">
                    {schedule.startDate} → {schedule.endDate}
                  </td>
                  <td className="p-2 text-sm text-center text-slate-600 dark:text-slate-400">
                    {schedule.durationDays} days
                  </td>
                  <td className="p-2 text-sm text-center text-slate-600 dark:text-slate-400">
                    {schedule.assignedWorkers}
                  </td>
                  <td className="p-2 text-sm">
                    <div className="flex items-center text-xs justify-center gap-2">
                      <div className="w-16 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${schedule.completion}%` }}></div>
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-400">{schedule.completion}%</span>
                    </div>
                  </td>
                  <td className="p-2 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(schedule.status)}`}>
                      {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1).replace('-', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SchedulingPage;
