import React, { useState } from 'react';
import {
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

const TaskTrackingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const taskTracking = [
    { id: 1, taskNo: 'TSK-001-2025', workerName: 'John Smith', task: 'Material cutting', stage: 'Cutting & Preparation', startTime: '09:00', currentTime: '14:30', completionTime: '16:00', progress: 75, status: 'in-progress' },
    { id: 2, taskNo: 'TSK-001-2025', workerName: 'Sarah Johnson', task: 'Material cutting', stage: 'Cutting & Preparation', startTime: '09:00', currentTime: '14:30', completionTime: '16:00', progress: 75, status: 'in-progress' },
    { id: 3, taskNo: 'TSK-002-2025', workerName: 'Mike Chen', task: 'Welding operations', stage: 'Welding & Assembly', startTime: '08:00', currentTime: '14:30', completionTime: '17:00', progress: 60, status: 'in-progress' },
    { id: 4, taskNo: 'TSK-003-2025', workerName: 'Emma Davis', task: 'Surface finishing', stage: 'Finishing', startTime: '10:00', currentTime: '14:30', completionTime: '18:00', progress: 50, status: 'in-progress' },
    { id: 5, taskNo: 'TSK-004-2025', workerName: 'Alex Brown', task: 'Quality inspection', stage: 'Final Inspection', startTime: '08:30', currentTime: '14:30', completionTime: '17:30', progress: 100, status: 'completed' },
  ];

  const filteredTasks = taskTracking.filter(task =>
    (task.taskNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
     task.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     task.task.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'all' || task.status === statusFilter)
  );

  const getStatusColor = (status) => {
    switch (status) {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Task Tracking</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor real-time progress of worker tasks</p>
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
            placeholder="Search task or worker..."
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
          <option value="all">All Tasks</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="delayed">Delayed</option>
        </select>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
              <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Task ID</th>
              <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Worker</th>
              <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Task Description</th>
              <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Stage</th>
              <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Timeline</th>
              <th className="p-2 text-center text-sm font-semibold text-slate-900 dark:text-white">Progress</th>
              <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="p-2 text-sm font-medium text-slate-900 text-left dark:text-white">{task.taskNo}</td>
                <td className="p-2 text-sm text-slate-600 dark:text-slate-400">{task.workerName}</td>
                <td className="p-2 text-sm text-slate-600 dark:text-slate-400">{task.task}</td>
                <td className="p-2 text-sm text-slate-600 dark:text-slate-400">{task.stage}</td>
                <td className="p-2 text-sm text-slate-600 dark:text-slate-400">
                  {task.startTime} - {task.completionTime}
                </td>
                <td className="p-2 text-sm">
                  <div className="flex items-center text-xs gap-2">
                    <div className="w-16 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${task.progress}%` }}></div>
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{task.progress}%</span>
                  </div>
                </td>
                <td className="p-2 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskTrackingPage;
