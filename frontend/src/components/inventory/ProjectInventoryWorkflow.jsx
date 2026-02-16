import React, { useState, useEffect } from 'react';
import axios from '../../utils/api';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  ChevronRight,
  BarChart3
} from 'lucide-react';

const WORKFLOW_STEPS = [
  { step: 1, name: 'Create RFQ', description: 'Prepare quotation requests' },
  { step: 2, name: 'Send RFQ to Vendor', description: 'Send requests to vendors' },
  { step: 3, name: 'Receive & Record Quotes', description: 'Record vendor responses' },
  { step: 4, name: 'Create PO', description: 'Create purchase orders' },
  { step: 5, name: 'Approve PO', description: 'Approve purchases' },
  { step: 6, name: 'GRN Processing & QC', description: 'Quality control inspection' },
  { step: 7, name: 'Add to Stock', description: 'Update inventory' }
];

const ProjectInventoryWorkflow = ({ projectId, rootCardId, projectTitle }) => {
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [completingTask, setCompletingTask] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');

  useEffect(() => {
    if (projectId) {
      fetchProjectTasks();
    }
  }, [projectId]);

  const fetchProjectTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `inventory/root-card-tasks/root-card/${rootCardId}/tasks`
      );
      setTasks(response.data.tasks || []);
      setProgress(response.data.progress);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch project tasks:', err);
      setError('Failed to load workflow tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      setCompletingTask(taskId);
      const response = await axios.patch(
        `inventory/root-card-tasks/root-card/${rootCardId}/task/${taskId}/complete`,
        { notes: completionNotes }
      );

      setTasks(prev =>
        prev.map(t =>
          t.id === taskId
            ? {
              ...t,
              status: 'completed',
              completed_by_name: response.data.task.completed_by_name,
              completed_at: response.data.task.completed_at
            }
            : t
        )
      );

      if (response.data.progress) {
        setProgress(response.data.progress);
      }

      setSelectedTask(null);
      setCompletionNotes('');
      setCompletingTask(null);
    } catch (err) {
      console.error('Failed to complete task:', err);
      setError('Failed to mark task as complete');
      setCompletingTask(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-6 h-6 text-blue-600" />;
      default:
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'in_progress':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <Clock className="w-12 h-12 text-blue-600 mx-auto mb-3 animate-spin" />
          <p className="text-gray-600">Loading workflow tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{projectTitle}</h2>
        <p className="text-gray-600">Inventory Workflow Progress</p>
      </div>

      {/* Progress Bar */}
      {progress && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Overall Progress</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {progress.completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress.completionPercentage}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{progress.completed}</div>
              <div className="text-green-700">Completed</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{progress.inProgress}</div>
              <div className="text-blue-700">In Progress</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-gray-600">{progress.pending}</div>
              <div className="text-gray-700">Pending</div>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Steps */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Workflow Steps</h3>
        <div className="space-y-2">
          {tasks.map((task, index) => {
            const stepInfo = WORKFLOW_STEPS.find(s => s.step === task.step_number);
            const isSelected = selectedTask?.id === task.id;

            return (
              <div key={task.id}>
                <button
                  onClick={() => setSelectedTask(isSelected ? null : task)}
                  className={`w-full text-left border-2 rounded-lg p-4 transition-all ${getStatusColor(
                    task.status
                  )} hover:shadow-md cursor-pointer`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0">
                        {getStatusIcon(task.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            Step {task.step_number}: {stepInfo?.name}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{stepInfo?.description}</p>
                        {task.reference_id && (
                          <p className="text-sm text-blue-600 mt-1">
                            Ref: {task.reference_id} ({task.reference_type?.toUpperCase()})
                          </p>
                        )}
                        {task.completed_at && (
                          <p className="text-sm text-green-600 mt-1">
                            Completed by {task.completed_by_name} on{' '}
                            {new Date(task.completed_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-gray-400 transition-transform ${isSelected ? 'rotate-90' : ''}`}
                      />
                    </div>
                  </div>
                </button>

                {/* Task Detail Panel */}
                {isSelected && task.status !== 'completed' && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-2">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Completion Notes (Optional)
                        </label>
                        <textarea
                          value={completionNotes}
                          onChange={(e) => setCompletionNotes(e.target.value)}
                          placeholder="Add any notes about completing this step..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setSelectedTask(null);
                            setCompletionNotes('');
                          }}
                          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          disabled={completingTask === task.id}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
                        >
                          {completingTask === task.id ? (
                            <>
                              <Clock className="w-4 h-4 animate-spin" />
                              Completing...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Mark as Complete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Completed Task Detail */}
                {isSelected && task.status === 'completed' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-2">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">
                        Completed by {task.completed_by_name} on{' '}
                        {new Date(task.completed_at).toLocaleString()}
                      </span>
                    </div>
                    {task.notes && (
                      <p className="text-sm text-green-600 mt-3 p-2 bg-white rounded border border-green-200">
                        {task.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Requirements Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-semibold mb-1">Project-Specific Tracking</p>
            <p>
              This workflow is tied to project <strong>{projectTitle}</strong>. Tasks can only
              be marked complete from this Department Tasks view to maintain accurate project-level tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInventoryWorkflow;
