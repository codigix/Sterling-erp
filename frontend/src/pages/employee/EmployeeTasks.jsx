import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import Badge from "../../components/ui/Badge";
import TaskDetailModal from "../../components/modals/TaskDetailModal";
import { CheckSquare, Clock, AlertCircle, Filter, RotateCw, CheckCircle2, Play, Zap } from "lucide-react";

const EmployeeTasks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const fetchTasks = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      if (user?.id) {
        const tasksResponse = await axios.get(`/employee/portal/tasks/${user.id}`);
        setTasks(tasksResponse.data || []);
      }
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Fetch tasks error:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTasks(true);

    const interval = setInterval(() => {
      fetchTasks(false);
    }, 5000); // Auto-refresh every 5 seconds

    return () => clearInterval(interval);
  }, [fetchTasks]);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100";
      case "in_progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200";
    }
  };

  const getPriorityIcon = (priority) => {
    if (priority === "critical" || priority === "high") return <AlertCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const filteredTasks = filterStatus === "all" ? tasks : tasks.filter(t => t.status === filterStatus);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === "completed").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    pending: tasks.filter(t => t.status === "pending").length
  };

  const handleUpdateTaskStatus = async (taskId, newStatus, extraDetails = null) => {
    if (updatingTaskId === taskId) return;
    try {
      setUpdatingTaskId(taskId);
      
      const payload = {
        status: newStatus
      };

      if (extraDetails) {
        payload.notes = JSON.stringify(extraDetails);
      }

      await axios.put(`/employee/portal/tasks/${taskId}/status`, payload);
      
      const updatedTasks = tasks.map(t => 
        t.id === taskId ? { 
          ...t, 
          status: newStatus,
          notes: payload.notes || t.notes 
        } : t
      );
      setTasks(updatedTasks);

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }

      setSuccessMessage(`Task marked as ${newStatus.replace('_', ' ')}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Update task error:', err);
      setError('Failed to update task status');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleOpenTaskDetail = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };



  if (loading) {
    return (
      <div className="flex items-center text-xs justify-center py-12">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-left dark:text-white mb-2">
            My Tasks
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage and track your project and assigned tasks
          </p>
        </div>
      </div>

      {error && <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-xl border border-red-200 dark:border-red-900/50">{error}</div>}
      {successMessage && <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-xl border border-green-200 dark:border-green-900/50 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" />{successMessage}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-purple-100 dark:border-purple-900/30 rounded-xl p-4 hover:shadow-lg transition-all hover:border-purple-300 dark:hover:border-purple-700">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Total Tasks</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">All assignments</p>
        </div>

        <div className="bg-white border-2 border-green-100 dark:border-green-900/30 rounded-xl p-4 hover:shadow-lg transition-all hover:border-green-300 dark:hover:border-green-700">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Completed</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.completed}</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">{stats.total > 0 ? Math.round((stats.completed/stats.total)*100) : 0}% done</p>
        </div>

        <div className="bg-white border-2 border-blue-100 dark:border-blue-900/30 rounded-xl p-4 hover:shadow-lg transition-all hover:border-blue-300 dark:hover:border-blue-700">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">In Progress</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.inProgress}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Active work</p>
        </div>

        <div className="bg-white border-2 border-yellow-100 dark:border-yellow-900/30 rounded-xl p-4 hover:shadow-lg transition-all hover:border-yellow-300 dark:hover:border-yellow-700">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Pending</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.pending}</p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">Not started</p>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-100 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Task List</h2>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400">
              <p>No tasks found</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start p-4 border border-slate-200 dark:border-slate-700 rounded-lg transition hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
              >
                <div
                  onClick={() => handleOpenTaskDetail(task)}
                  className="flex-1 min-w-0"
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h4 className="font-semibold text-slate-900 dark:text-white">{task.title}</h4>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status === 'completed' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> COMPLETED
                        </>
                      ) : (
                        task.status.replace("_", " ")
                      )}
                    </Badge>
                    <Badge className={getPriorityColor(task.priority)} title={task.priority}>
                      {getPriorityIcon(task.priority)} {task.priority?.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{task.description}</p>
                  
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>📅 Created: {new Date(task.created_at).toLocaleDateString('en-IN')}</span>
                    {task.job_card_no && (
                      <span className="text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-900/30 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20 uppercase tracking-tight">
                        📋 JC: {task.job_card_no}
                      </span>
                    )}
                    {(task.root_card_code || task.root_card_name) && (
                      <span className="text-violet-600 dark:text-violet-400 font-bold border border-violet-100 dark:border-violet-900/30 px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-900/20 uppercase tracking-tight">
                        📋 RC: {task.root_card_code}{task.root_card_name ? ` - ${task.root_card_name}` : ''}
                      </span>
                    )}
                    {task.work_order_no && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-900/30 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 uppercase">
                        🔢 WO: {task.work_order_no}
                      </span>
                    )}
                    {task.item_name && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-100 dark:border-emerald-900/30 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 uppercase">
                        🛠️ Item: {task.item_name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {task.status === 'pending' && (
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-100 dark:border-amber-900/30">
                      <Clock className="w-3 h-3" />
                      Awaiting Production Start
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onTaskComplete={handleUpdateTaskStatus}
        isUpdating={updatingTaskId === selectedTask?.id}
      />
    </div>
  );
};

export default EmployeeTasks;
