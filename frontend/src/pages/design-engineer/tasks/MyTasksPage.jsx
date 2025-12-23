import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertCircle, Calendar, Loader2, RefreshCw } from 'lucide-react';
import axios from '../../../utils/api';
import { useNavigate } from 'react-router-dom';

const MyTasksPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const roleResponse = await axios.get('/api/department/portal/role/design_engineer');
      const roleId = roleResponse.data.roleId;
      
      const tasksResponse = await axios.get(`/api/department/portal/tasks/${roleId}`);
      const fetchedTasks = tasksResponse.data || [];
      
      const formattedTasks = fetchedTasks.map(task => ({
        id: task.id,
        title: task.title,
        project: task.project?.name || task.rootCard?.title || 'No Project',
        status: task.status === 'pending' ? 'Pending' : task.status === 'in_progress' ? 'In Progress' : task.status === 'completed' ? 'Completed' : task.status,
        priority: task.priority?.charAt(0).toUpperCase() + (task.priority?.slice(1) || 'medium'),
        dueDate: task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'Not set',
        progress: task.status === 'completed' ? 100 : task.status === 'in_progress' ? 50 : 0,
        description: task.description,
        rootCard: task.rootCard,
        salesOrder: task.salesOrder,
        notes: task.notes
      }));
      
      setTasks(formattedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status.toLowerCase() === filter.toLowerCase();
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'text-red-600 dark:text-red-400';
      case 'Medium': return 'text-orange-600 dark:text-orange-400';
      case 'Low': return 'text-green-600 dark:text-green-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getTaskNavigationUrl = (task) => {
    const salesOrderId = task.salesOrder?.id || task.rootCard?.id || '';
    const baseParams = `taskId=${task.id}&taskTitle=${encodeURIComponent(task.title)}&salesOrderId=${salesOrderId}`;

    const taskTitle = (task.title || '').toLowerCase();

    // Map specific task titles to their respective pages
    // Step 1: Enter Project Details
    if (taskTitle.includes('project details') || taskTitle.includes('enter project')) {
      return `/design-engineer/project-details?salesOrderId=${salesOrderId}`;
    }
    // Step 2: Prepare Design Documents
    else if (taskTitle.includes('prepare design') || taskTitle.includes('design document')) {
      return `/design-engineer/documents/designs?${baseParams}`;
    }
    // Step 3: Create and Validate BOM
    else if (taskTitle.includes('bom') || taskTitle.includes('bill of materials')) {
      return `/design-engineer/bom/create?${baseParams}`;
    }
    // Step 4: Submit Design for Review
    else if (taskTitle.includes('submit design') || taskTitle.includes('design for review')) {
      return `/design-engineer/reviews/pending?${baseParams}`;
    }
    // Step 5: Follow up on Pending Reviews
    else if (taskTitle.includes('follow up') || taskTitle.includes('pending review')) {
      return `/design-engineer/reviews/pending?${baseParams}`;
    }
    // Step 6: Document Approved Designs
    else if (taskTitle.includes('document') && taskTitle.includes('approved')) {
      return `/design-engineer/reviews/approved?${baseParams}`;
    }
    // Step 7: Manage Technical Files
    else if (taskTitle.includes('technical') || taskTitle.includes('file management')) {
      return `/design-engineer/documents/technical?${baseParams}`;
    }
    // Fallback: Default to project details
    else {
      return `/design-engineer/project-details?salesOrderId=${salesOrderId}`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Tasks</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Track your engineering tasks and assignments</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Tasks</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Track your engineering tasks and assignments</p>
        </div>
        <button
          onClick={fetchTasks}
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition"
          title="Refresh tasks"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'in progress', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg transition-colors capitalize ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <Clock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">No tasks found for this filter</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(getTaskNavigationUrl(task))}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{task.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{task.project}</p>
                  {task.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{task.description}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center text-xs justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Progress</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{task.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center text-xs gap-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center text-xs gap-1">
                  <Calendar size={16} />
                  Updated: {task.dueDate}
                </div>
                {task.status === 'Completed' && (
                  <div className="flex items-center text-xs gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle2 size={16} />
                    Completed
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyTasksPage;
