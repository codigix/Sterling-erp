import { useState } from 'react';
import { CheckSquare, Clock, AlertCircle, Edit2, Save, X, MessageSquare } from 'lucide-react';

const MonthlyTasksPage = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Monthly Production Report',
      description: 'Compile comprehensive monthly production report with metrics and analysis',
      status: 'in-progress',
      priority: 'high',
      assignedDate: '2025-12-01',
      dueDate: '2025-12-31',
      progress: 65,
      assignedBy: 'Production Manager',
      month: 'December 2025',
    },
    {
      id: 2,
      title: 'Machine Calibration',
      description: 'Perform detailed calibration of all production machinery',
      status: 'pending',
      priority: 'high',
      assignedDate: '2025-12-01',
      dueDate: '2025-12-25',
      progress: 0,
      assignedBy: 'Technical Lead',
      month: 'December 2025',
    },
    {
      id: 3,
      title: 'Staff Training Session',
      description: 'Conduct monthly training session for workers on new procedures',
      status: 'pending',
      priority: 'medium',
      assignedDate: '2025-12-01',
      dueDate: '2025-12-20',
      progress: 0,
      assignedBy: 'HR Department',
      month: 'December 2025',
    },
    {
      id: 4,
      title: 'Inventory Audit',
      description: 'Complete monthly inventory audit and reconciliation',
      status: 'completed',
      priority: 'high',
      assignedDate: '2025-11-01',
      dueDate: '2025-11-30',
      progress: 100,
      assignedBy: 'Inventory Manager',
      month: 'November 2025',
    },
    {
      id: 5,
      title: 'Safety Inspection',
      description: 'Conduct comprehensive safety inspection of all work areas',
      status: 'in-progress',
      priority: 'high',
      assignedDate: '2025-12-01',
      dueDate: '2025-12-30',
      progress: 45,
      assignedBy: 'Safety Officer',
      month: 'December 2025',
    },
    {
      id: 6,
      title: 'Budget Planning for Next Month',
      description: 'Prepare and submit budget requirements for next production cycle',
      status: 'pending',
      priority: 'medium',
      assignedDate: '2025-12-10',
      dueDate: '2025-12-25',
      progress: 0,
      assignedBy: 'Finance Department',
      month: 'December 2025',
    },
  ]);

  const [editingId, setEditingId] = useState(null);
  const [editProgress, setEditProgress] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationTask, setNotificationTask] = useState(null);

  const filteredTasks = filterStatus === 'all' ? tasks : tasks.filter(task => task.status === filterStatus);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, status: newStatus, progress: newStatus === 'completed' ? 100 : task.progress } : task
    ));
    setEditingId(null);
  };

  const handleProgressUpdate = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, progress: editProgress, status: editProgress === 100 ? 'completed' : task.status } : task
    ));
    setEditingId(null);
    setEditProgress(0);
  };

  const handleNotificationClick = (task) => {
    setNotificationTask(task);
    setShowNotification(true);
  };

  const handleSendNotification = () => {
    alert(`Notification sent about: ${notificationTask.title}`);
    setShowNotification(false);
    setNotificationTask(null);
  };

  const taskStats = [
    { label: 'Monthly Tasks', value: filteredTasks.length, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900' },
    { label: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900' },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900' },
    { label: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-900' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Monthly Tasks</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track your monthly long-term assignments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {taskStats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bgColor} rounded-lg p-6 border border-slate-200 dark:border-slate-700`}
          >
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Task List</h2>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-medium"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center text-xs gap-2 mb-2">
                    <h3 className="font-bold text-slate-900 dark:text-white">{task.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(task.status)}`}>
                      {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{task.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                    <div>
                      <span className="font-semibold">Month:</span> {task.month}
                    </div>
                    <div>
                      <span className="font-semibold">Assigned:</span> {task.assignedDate}
                    </div>
                    <div>
                      <span className="font-semibold">Due:</span> {task.dueDate}
                    </div>
                    <div>
                      <span className="font-semibold">Priority:</span>
                      <span className={`ml-1 ${getPriorityColor(task.priority)}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Assigned by: {task.assignedBy}</p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Progress</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{task.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {editingId === task.id ? (
                  <div className="w-full flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editProgress}
                      onChange={(e) => setEditProgress(parseInt(e.target.value))}
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="Enter progress %"
                    />
                    <button
                      onClick={() => handleProgressUpdate(task.id)}
                      className="flex items-center text-xs gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex items-center text-xs gap-1 px-3 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition-colors"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-medium"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      onClick={() => {
                        setEditingId(task.id);
                        setEditProgress(task.progress);
                      }}
                      className="flex items-center text-xs gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                      Update Progress
                    </button>
                    <button
                      onClick={() => handleNotificationClick(task)}
                      className="flex items-center text-xs gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      <MessageSquare size={16} />
                      Notify
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showNotification && notificationTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center text-xs justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white text-left mb-4">Send Notification</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Send notification about: <span className="font-semibold">{notificationTask.title}</span>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Send to:
              </label>
              <div className="space-y-2">
                <label className="flex items-center text-xs gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-slate-700 dark:text-slate-300">Other Workers</span>
                </label>
                <label className="flex items-center text-xs gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-slate-700 dark:text-slate-300">Production Manager</span>
                </label>
                <label className="flex items-center text-xs gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-slate-700 dark:text-slate-300">Quality Control</span>
                </label>
              </div>
            </div>
            <textarea
              placeholder="Add a message (optional)..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white mb-4 resize-none"
              rows="3"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowNotification(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-slate-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendNotification}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Send Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyTasksPage;
