import React, { useState, useEffect } from 'react';
import { Calendar, User, Zap, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '@/components/ui/Button';
import axios from '@/utils/api';
import { useNavigate } from 'react-router-dom';

const ProjectCard = ({ project, tasks, onStartDesigning, onTaskStatusChange, isCreatingWorkflow = false }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [workflowTasks, setWorkflowTasks] = useState([]);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  useEffect(() => {
    extractWorkflowTasks();
  }, [tasks]);

  const extractWorkflowTasks = () => {
    const workflow = tasks.filter(task => {
      if (task.notes) {
        try {
          const notes = JSON.parse(task.notes);
          return notes.workflow_step;
        } catch (e) {
          return false;
        }
      }
      return false;
    });
    setWorkflowTasks(workflow);
  };

  const getTaskNavigationUrl = (task) => {
    const baseParams = `taskId=${task.id}&taskTitle=${encodeURIComponent(task.title)}&salesOrderId=${project.id}&projectName=${encodeURIComponent(project.project_name || '')}&poNumber=${encodeURIComponent(project.po_number || '')}&customer=${encodeURIComponent(project.customer || project.customer_name || project.client_name || '')}`;

    const taskTitle = (task.title || '').toLowerCase();

    // Map specific task titles to their respective pages
    // Step 1: Enter Project Details
    if (taskTitle.includes('project details') || taskTitle.includes('enter project')) {
      return `/design-engineer/project-details?salesOrderId=${project.id}`;
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
      return `/design-engineer/project-details?salesOrderId=${project.id}`;
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: <AlertCircle size={16} className="text-gray-600" />,
      completed: <CheckCircle size={16} className="text-green-600" />,
      in_progress: <Clock size={16} className="text-blue-600" />,
      pending: <Clock size={16} className="text-yellow-600" />,
      on_hold: <AlertCircle size={16} className="text-red-600" />,
    };
    return icons[status] || <Clock size={16} />;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      on_hold: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    setUpdatingTaskId(taskId);
    try {
      await axios.patch(`/api/department/portal/tasks/${taskId}`, { status: newStatus });
      if (onTaskStatusChange) {
        onTaskStatusChange(taskId, newStatus);
      }
    } catch (err) {
      console.error('Error updating task status:', err);
      alert('Failed to update task status');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const progress = calculateProgress();

  return (
    <div className="bg-white dark:bg-slate-800  border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header Section */}
      <div className='flex justify-between bg-gradient-to-r from-blue-50 dark:from-blue-900/20 to-slate-50 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 p-4'>
        <div className="">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              {project.project_name && (
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400  tracking-wide">
                    Project Name
                  </p>
                  <div className='flex gap-2'>
                    <p className="font-semibold text-lg text-slate-900 dark:text-white">
                      {project.project_name}
                    </p>
                    {project.priority && (
                      <div>

                        <span className={`inline-block mt-1 text-xs font-medium rounded-full capitalize ${project.priority === 'critical' ? 'text-red-800 dark:bg-red-900 dark:text-red-200' :
                          project.priority === 'high' ? ' text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                            project.priority === 'medium' ? ' text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              ' text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                          ({project.priority})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <p className="text-xs font-mono text-blue-600 dark:text-blue-400">
                {project.project_code && (
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide">
                    {project.project_code}              
                    </p>)}
              </p>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
            >
              {isExpanded ? (
                <ChevronUp size={20} className="text-slate-600 dark:text-slate-400" />
              ) : (
                <ChevronDown size={20} className="text-slate-600 dark:text-slate-400" />
              )}
            </button>
          </div>

          {/* Client Details */}
          {(project.customer || project.customer_name || project.client_name) && (
            <div className="flex items-center gap-2 text-sm mb-3">
              <User size={14} className="text-slate-500" />
              <span className="text-slate-700 dark:text-slate-300 text-xs">
                <span className="font-medium">Client:</span> {project.customer || project.customer_name || project.client_name}
              </span>
            </div>
          )}

          {/* Timeline */}
          <div className="flex items-center gap-4 text-sm flex-wrap">
            {(project.order_date || project.planned_start || project.start_date) && (
              <div className="flex items-center text-xs gap-2 text-slate-600 dark:text-slate-400">
                <Calendar size={16} />
                <span>Start: <span className="font-medium text-slate-900 dark:text-white">{formatDate(project.order_date || project.planned_start || project.start_date)}</span></span>
              </div>
            )}
            {(project.due_date || project.planned_end || project.end_date) && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Calendar size={16} />
                <span>End: <span className="font-medium text-slate-900 dark:text-white">{formatDate(project.due_date || project.planned_end || project.end_date)}</span></span>
              </div>
            )}
          </div>
        </div>
        <div className="">
          {/* Project Details Grid */}
          <div className=" text-right gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">

            {project.status && (
              <div>
                <p className="text-xs text-slate-700 dark:text-slate-200">
                  Status
                </p>
                <span className={`inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full capitalize ${project.status === 'active' || project.status === 'in_progress' ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100' :
                    project.status === 'completed' ? 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100' :
                      project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100' :
                        project.status === 'planning' ? 'bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100' :
                          project.status === 'cancelled' ? 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100' :
                            'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100'
                  }`}>
                  {project.status}
                </span>
              </div>
            )}

          </div>

          {/* Start Designing Button */}
          <Button
            variant={tasks.length > 0 ? "success" : "primary"}
            className="w-full flex items-center justify-center gap-2"
            onClick={tasks.length > 0 ? () => setIsExpanded(!isExpanded) : onStartDesigning}
            disabled={isCreatingWorkflow}
          >
            {isCreatingWorkflow ? (
              <>
                <Clock size={18} className="animate-spin" />
                Creating Tasks...
              </>
            ) : tasks.length > 0 ? (
              <>
                <CheckCircle size={18} />
                Task Initiated ({tasks.length})
              </>
            ) : (
              <>
                <Zap size={18} />
                Start Designing
              </>
            )}
          </Button>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Progress
          </span>
          <span className="text-xs font-medium text-slate-900 dark:text-white">
            {progress}% ({tasks.filter(t => t.status === 'completed').length}/{tasks.length})
          </span>
        </div>
        <div className="w-full h-2 bg-slate-300 dark:bg-slate-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Content */}


      {/* Expandable Workflow Tasks Section */}
      {isExpanded && (
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-700/30">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span>Workflow Tasks</span>
            <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
              ({workflowTasks.length})
            </span>
          </h3>

          {workflowTasks.length > 0 ? (
            <div className="space-y-3">
              {workflowTasks.map((task) => (
                <div
                  key={task.id}
                  className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 ${task.status === 'completed' ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => navigate(getTaskNavigationUrl(task))}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-xs hover:text-blue-600 dark:hover:text-blue-400">
                        {task.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {task.description}
                      </p>
                    </div>
                    <select
                      value={task.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleTaskStatusUpdate(task.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      disabled={updatingTaskId === task.id || task.status === 'completed'}
                      className={`px-2 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer whitespace-nowrap flex-shrink-0 ${getStatusColor(task.status)
                        } ${task.status === 'completed' ? 'opacity-60 cursor-not-allowed' : ''} appearance-none`}
                      title={task.status === 'completed' ? 'This task is completed and cannot be modified' : ''}
                    >
                      <option value="draft">Draft</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {task.priority && (
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize ${task.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                            task.priority === 'medium' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                        {task.priority}
                      </span>
                    )}
                    {project?.code && (
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                        {project.code}
                      </span>
                    )}
                    {task.notes && (
                      (() => {
                        try {
                          const notes = JSON.parse(task.notes);
                          if (notes.workflow_step) {
                            return (
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                                Step {notes.step_order}: {notes.workflow_step}
                              </span>
                            );
                          }
                        } catch (e) { }
                        return null;
                      })()
                    )}
                  </div>

                  {project && (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Customer</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {project.customer || project.customer_name || project.client_name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">PO Number</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {project.po_number || project.poNumber || 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-600 dark:text-slate-400">
              <p className="text-sm">No workflow tasks yet. Create tasks to get started.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
