import React, { useState, useEffect } from "react";
import axios from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import Card, { CardContent, CardTitle, CardHeader } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { CheckSquare, Clock, AlertCircle, Trash2, Edit2, Filter, Plus } from "lucide-react";

const EmployeeTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        if (user?.id) {
          const response = await axios.get(`/api/employee/portal/tasks/${user.id}`);
          setTasks(response.data || []);
        }
      } catch (err) {
        setError('Failed to load tasks');
        console.error('Fetch tasks error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user?.id]);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
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
    <div className="space-y-6">
      <div className="flex items-center text-xs justify-between">
        <div>
          <h1 className="text-3xl font-bold  dark: mb-2">
            My Tasks
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage and track your assigned tasks
          </p>
        </div>
        <Button className="flex items-center text-xs gap-2">
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </div>

      {error && <div className="bg-red-100 text-red-800 p-4 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-purple-500">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Total Tasks</p>
            <p className="text-3xl font-bold  dark:">{stats.total}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">All assignments</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Completed</p>
            <p className="text-3xl font-bold  dark:">{stats.completed}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">{Math.round((stats.completed/stats.total)*100)}% done</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-500">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">In Progress</p>
            <p className="text-3xl font-bold  dark:">{stats.inProgress}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Active work</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-yellow-500">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Pending</p>
            <p className="text-3xl font-bold  dark:">{stats.pending}</p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">Not started</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center text-xs justify-between">
            <CardTitle className="flex items-center text-xs space-x-2">
              <CheckSquare className="w-5 h-5" />
              <span>Task List</span>
            </CardTitle>
            <div className="flex items-center text-xs gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm  dark:"
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                <p>No tasks found</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div key={task.id} className="flex items-start justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center text-xs gap-2 mb-2">
                      <h4 className="font-semibold  dark:">{task.title}</h4>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace("_", " ")}
                      </Badge>
                      <Badge className={getPriorityColor(task.priority)} title={task.priority}>
                        {getPriorityIcon(task.priority)} {task.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{task.description}</p>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded mb-3 border border-slate-200 dark:border-slate-700">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {task.rootCard?.id && (
                          <>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">Root Card:</span>
                              <p className="font-medium  dark:">{task.rootCard.title}</p>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">Stage:</span>
                              <p className="font-medium  dark:">{task.stageName || 'N/A'}</p>
                            </div>
                          </>
                        )}
                        {task.project?.id && (
                          <>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">Project:</span>
                              <p className="font-medium  dark:">{task.project.name} ({task.project.code})</p>
                            </div>
                          </>
                        )}
                        {task.salesOrder?.id && (
                          <>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">PO Number:</span>
                              <p className="font-medium  dark:">{task.salesOrder.poNumber}</p>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">Customer:</span>
                              <p className="font-medium  dark:">{task.salesOrder.customer}</p>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">Order Amount:</span>
                              <p className="font-medium  dark:">₹{parseInt(task.salesOrder.total).toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">Due Date:</span>
                              <p className="font-medium  dark:">{new Date(task.salesOrder.dueDate).toLocaleDateString('en-IN')}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>📋 {task.stageName || 'Project'}</span>
                      <span>👤 {task.assignedBy}</span>
                      <span>📅 Created: {new Date(task.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeTasks;
