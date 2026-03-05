import React, { useState, useEffect } from "react";
import {
  Calendar,
  User,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Button from "@/components/ui/Button";
import axios from "@/utils/api";
import { useNavigate } from "react-router-dom";

const ProductionProjectCard = ({
  project,
  tasks,
  onStartWorkflow,
  onTaskStatusChange,
  isCreatingWorkflow = false,
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [workflowTasks, setWorkflowTasks] = useState([]);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  useEffect(() => {
    extractWorkflowTasks();
  }, [tasks]);

  const extractWorkflowTasks = () => {
    // 1. Identify tasks that have explicit workflow metadata
    const explicitWorkflowTasks = tasks.filter((task) => {
      if (task.notes) {
        try {
          const notes = typeof task.notes === 'string' ? JSON.parse(task.notes) : task.notes;
          if (notes && notes.workflow_step) return true;
        } catch (e) {
          // Fallback check if string parsing fails
          const notesText = String(task.notes).toLowerCase();
          if (notesText.includes("\"workflow_step\":true")) return true;
        }
      }
      return false;
    });

    // 2. If we found explicit workflow tasks, use only those (avoids pattern-matching duplicates)
    if (explicitWorkflowTasks.length > 0) {
      // Sort by step_order if available in notes
      const sorted = [...explicitWorkflowTasks].sort((a, b) => {
        try {
          const notesA = typeof a.notes === 'string' ? JSON.parse(a.notes) : a.notes;
          const notesB = typeof b.notes === 'string' ? JSON.parse(b.notes) : b.notes;
          return (notesA.step_order || 0) - (notesB.step_order || 0);
        } catch (e) {
          return 0;
        }
      });
      setWorkflowTasks(sorted);
      return;
    }

    // 3. Fallback to pattern matching only if no explicit workflow tasks exist
    const patternMatchedTasks = tasks.filter((task) => {
      const taskTitle = (task.task_title || task.title || "").toLowerCase();
      return (
        taskTitle.startsWith("step ") || 
        taskTitle.includes("production plan") || 
        taskTitle.includes("material request") ||
        taskTitle.includes("work order") ||
        taskTitle.includes("job card") ||
        taskTitle.includes("quality check") ||
        taskTitle.includes("shipment") ||
        taskTitle.includes("delivery")
      );
    });
    setWorkflowTasks(patternMatchedTasks);
  };

  const getTaskNavigationUrl = (task) => {
    const baseParams = `taskId=${task.id}&rootCardId=${project.id}&salesOrderId=${project.sales_management_id || project.sales_order_id || project.id}`;
    const taskTitle = (task.task_title || task.title || "").toLowerCase();

    if (taskTitle.includes("production plan") || taskTitle.includes("planning")) {
      return `/department/production/plans/new?${baseParams}`;
    }
    else if (taskTitle.includes("material request") || taskTitle.includes("procurement")) {
      return `/department/production/plans?${baseParams}&openMaterialRequest=true`;
    }
    else if (taskTitle.includes("work order")) {
      return `/department/production/plans?${baseParams}&openWorkOrder=true`;
    }
    else if (taskTitle.includes("job card") || taskTitle.includes("manufacturing")) {
      return `/department/production/job-cards?${baseParams}`;
    }
    else if (taskTitle.includes("quality check") || taskTitle.includes("qc")) {
      return `/department/qc?${baseParams}`;
    }
    else if (taskTitle.includes("shipment") || taskTitle.includes("packaging")) {
      return `/department/production/challans/new?${baseParams}`;
    }
    else if (taskTitle.includes("delivery")) {
      return `/department/production/challans/track?${baseParams}`;
    }
    else {
      return `/department/production?rootCardId=${project.id}`;
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: <CheckCircle size={16} className="text-green-600" />,
      in_progress: <Clock size={16} className="text-blue-600" />,
      pending: <Clock size={16} className="text-yellow-600" />,
      on_hold: <AlertCircle size={16} className="text-red-600" />,
    };
    return icons[status] || <Clock size={16} />;
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      on_hold: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    setUpdatingTaskId(taskId);
    try {
      await axios.patch(`/department/portal/tasks/${taskId}`, {
        status: newStatus,
      });
      if (onTaskStatusChange) {
        onTaskStatusChange(taskId, newStatus);
      }
    } catch (err) {
      console.error("Error updating task status:", err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.status === "completed").length;
    return Math.round((completed / tasks.length) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="flex justify-between bg-gradient-to-r from-purple-50 dark:from-purple-900/20 to-slate-50 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Root Card / Project
              </p>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {project.project_name || project.customer}
              </h3>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-mono mt-1">
                {project.po_number || "NO PO"}
              </p>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
          
          <div className="mt-4 flex items-center gap-6">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Overall Progress</span>
                <span className="font-bold text-slate-900 dark:text-white">{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                <div 
                  className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3">
          {workflowTasks.length > 0 ? (
            workflowTasks.map((task, idx) => {
              const isPreviousCompleted = idx === 0 || workflowTasks.slice(0, idx).every(t => t.status === 'completed');
              const isTaskEnabled = isPreviousCompleted;
              
              return (
                <div 
                  key={task.id}
                  className={`flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 ${!isTaskEnabled ? 'opacity-50 grayscale' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(task.status)}`}>
                      {getStatusIcon(task.status)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {task.task_title || task.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={task.status}
                      onChange={(e) => handleTaskStatusUpdate(task.id, e.target.value)}
                      disabled={updatingTaskId === task.id || !isTaskEnabled}
                      className="text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded px-2 py-1 outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-600 hover:text-purple-700 text-xs font-bold"
                      onClick={() => navigate(getTaskNavigationUrl(task))}
                      disabled={!isTaskEnabled}
                    >
                      GO TO MODULE →
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6">
              <Zap size={24} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">No workflow tasks generated yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductionProjectCard;
