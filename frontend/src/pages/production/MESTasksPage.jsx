import React, { useState } from 'react';
import { Play, Pause, CheckCircle, Eye, Clock, AlertCircle, Filter } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import '../../styles/TaskPage.css';

const MESTasksPage = () => {
  const [workerTasks] = useState([
    {
      id: 'TASK-001',
      stage: 'Assembly Stage 1',
      operation: 'Component Assembly',
      status: 'in-progress',
      startTime: '2025-01-29 09:00',
      pauseTime: null,
      totalPauseDuration: '15 mins',
      logs: [
        { time: '09:00', action: 'STARTED', notes: 'Task started' },
        { time: '10:15', action: 'PAUSED', notes: 'Operator break' },
        { time: '10:30', action: 'RESUMED', notes: 'Break over' }
      ]
    },
    {
      id: 'TASK-002',
      stage: 'Assembly Stage 1',
      operation: 'Quality Check',
      status: 'pending',
      startTime: null,
      pauseTime: null,
      totalPauseDuration: '0 mins',
      logs: []
    },
    {
      id: 'TASK-003',
      stage: 'Assembly Stage 1',
      operation: 'Component Assembly',
      status: 'completed',
      startTime: '2025-01-28 08:00',
      pauseTime: null,
      totalPauseDuration: '10 mins',
      completionTime: '2025-01-28 16:30',
      logs: [
        { time: '08:00', action: 'STARTED', notes: 'Task started' },
        { time: '09:15', action: 'PAUSED', notes: 'Lunch break' },
        { time: '10:00', action: 'RESUMED', notes: 'Resumed after lunch' },
        { time: '16:30', action: 'COMPLETED', notes: 'Task completed successfully' }
      ]
    }
  ]);

  const [activeTab, setActiveTab] = useState('assigned');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskLogs, setShowTaskLogs] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTasks = activeTab === 'assigned'
    ? workerTasks
    : workerTasks.filter(t => t.status === activeTab);

  const stats = {
    assigned: workerTasks.length,
    inProgress: workerTasks.filter(t => t.status === 'in-progress').length,
    completed: workerTasks.filter(t => t.status === 'completed').length,
    pending: workerTasks.filter(t => t.status === 'pending').length
  };

  return (
    <div className="task-page-container">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Assigned Tasks</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.assigned}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">In Progress</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.inProgress}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
          </div>
        </Card>
      </div>

      {/* Tab and Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['assigned', 'in-progress', 'completed', 'pending'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300'
              }`}
            >
              {tab === 'in-progress' ? 'In Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 transition-colors">
          <Filter size={18} />
          Filter
        </button>
      </div>

      {/* Worker Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {filteredTasks.map(task => (
          <Card key={task.id} className="card-hover">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">{task.id}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{task.operation}</p>
                </div>
                <Badge className={getStatusColor(task.status)}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Badge>
              </div>

              <div className="space-y-2 mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Stage:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{task.stage}</span>
                </div>
                {task.startTime && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Started:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{task.startTime}</span>
                  </div>
                )}
                {task.completionTime && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Completed:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{task.completionTime}</span>
                  </div>
                )}
                {task.totalPauseDuration && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Total Pause:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{task.totalPauseDuration}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                {task.status === 'pending' && (
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium">
                    <Play size={16} />
                    Start
                  </button>
                )}
                {task.status === 'in-progress' && (
                  <>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors text-sm font-medium">
                      <Pause size={16} />
                      Pause
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium">
                      <CheckCircle size={16} />
                      Complete
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setShowTaskLogs(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 transition-colors text-sm font-medium"
                >
                  <Eye size={16} />
                  View Logs
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Task Logs Modal */}
      {showTaskLogs && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Task Logs</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedTask.id} - {selectedTask.operation}</p>
                </div>
                <button onClick={() => setShowTaskLogs(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                  <span className="text-2xl">×</span>
                </button>
              </div>

              {selectedTask.logs.length > 0 ? (
                <div className="space-y-3">
                  {selectedTask.logs.map((log, idx) => (
                    <div key={idx} className="flex gap-4 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900">
                          <Clock size={14} className="text-blue-600 dark:text-blue-300" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {log.action}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {log.time} • {log.notes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-slate-600 dark:text-slate-400">No logs available for this task</p>
                </div>
              )}

              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Task Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Status:</p>
                    <Badge className={getStatusColor(selectedTask.status)}>
                      {selectedTask.status.charAt(0).toUpperCase() + selectedTask.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Total Logs:</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{selectedTask.logs.length}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowTaskLogs(false)}
                className="w-full mt-6 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MESTasksPage;
