import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
} from 'lucide-react';

const AssignTasksPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const taskAssignments = [
    { id: 1, taskNo: 'TSK-001-2025', stageName: 'Cutting & Preparation', assignedWorkers: 8, taskDescription: 'Material cutting and preparation', dueDate: '2025-12-20', priority: 'high', status: 'in-progress' },
    { id: 2, taskNo: 'TSK-002-2025', stageName: 'Welding & Assembly', assignedWorkers: 6, taskDescription: 'Main welding operations', dueDate: '2025-12-18', priority: 'high', status: 'in-progress' },
    { id: 3, taskNo: 'TSK-003-2025', stageName: 'Finishing', assignedWorkers: 5, taskDescription: 'Surface finishing and polishing', dueDate: '2025-12-24', priority: 'medium', status: 'scheduled' },
    { id: 4, taskNo: 'TSK-004-2025', stageName: 'Final Inspection', assignedWorkers: 3, taskDescription: 'Quality inspection', dueDate: '2025-12-22', priority: 'medium', status: 'in-progress' },
  ];

  const filteredTasks = taskAssignments.filter(task =>
    task.taskNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.stageName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Assign Tasks</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Assign and manage worker tasks across production stages</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <Plus size={18} />
            Assign Task
          </button>
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors font-medium">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search task or stage..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
        />
      </div>

      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center text-xs gap-3 mb-2">
                  <CheckCircle size={20} className="text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{task.taskNo}</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{task.stageName}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{task.taskDescription}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-lg transition-colors">
                  <Edit size={18} className="text-yellow-600 dark:text-yellow-400" />
                </button>
                <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors">
                  <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Assigned Workers</p>
                <div className="flex items-center text-xs gap-2">
                  <Users size={16} className="text-slate-400" />
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{task.assignedWorkers}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Due Date</p>
                <div className="flex items-center text-xs gap-2">
                  <Clock size={16} className="text-slate-400" />
                  <p className="text-sm font-medium text-slate-900 text-left dark:text-white">{task.dueDate}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Priority</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Status</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignTasksPage;
