import React, { useState, useEffect } from "react";
import axios from "@/utils/api";
import {
  Clock,
  CheckCircle,
  Plus,
  Loader2,
  AlertCircle,
  X,
  Zap,
} from "lucide-react";
import Button from "@/components/ui/Button";
import ProductionProjectCard from "@/components/production/ProductionProjectCard";

const ProductionWorkflowTasksPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
  });

  useEffect(() => {
    fetchRoleId();
  }, []);

  useEffect(() => {
    if (roleId) {
      fetchProjects();
    }
  }, [roleId]);

  useEffect(() => {
    if (selectedProject && roleId) {
      fetchTasksForProject(selectedProject);
    }
  }, [selectedProject, roleId]);

  const fetchRoleId = async () => {
    try {
      const response = await axios.get(
        "/department/portal/role/production"
      );
      setRoleId(response.data.roleId);
    } catch {
      console.warn("Production role not found, using default role ID");
      setRoleId(5);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/production/portal/root-cards", {
        params: { all: 'true' },
      });
      const data = response.data.rootCards || [];
      setProjects(data);
      if (data && data.length > 0) {
        setSelectedProject(data[0]);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Error loading projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksForProject = async (project) => {
    try {
      if (!roleId) return;
      const response = await axios.get(`/department/portal/tasks/${roleId}`);
      const filtered = response.data.filter(
        (t) => 
          (t.root_card_id && Number(t.root_card_id) === Number(project.id)) || 
          (t.sales_order_id && Number(t.sales_order_id) === Number(project.id))
      );
      setTasks(filtered);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setTasks([]);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Task title is required");
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        roleId: roleId,
        rootCardId: selectedProject?.id,
        isWorkflowCustomTask: true,
      };

      const response = await axios.post("/department/portal/tasks", payload);

      if (response.status === 201) {
        setShowCreateModal(false);
        setFormData({
          title: "",
          description: "",
          priority: "medium",
          status: "pending",
        });
        await fetchTasksForProject(selectedProject);
      }
    } catch (err) {
      console.error("Error creating task:", err);
      alert(
        "Failed to create task: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateTasks = async () => {
    if (!selectedProject) {
      alert("Please select a project first");
      return;
    }

    if (tasks.length > 0) {
      const confirm = window.confirm(
        "Workflow tasks already exist for this project. Generating new tasks will delete existing ones. Do you want to continue?"
      );
      if (!confirm) return;
    }

    setIsGenerating(true);
    try {
      const response = await axios.post(
        `/root-cards/${selectedProject.id}/workflow-tasks?type=production`
      );

      if (response.status === 201 || response.status === 200) {
        alert("Workflow tasks generated successfully");
        await fetchTasksForProject(selectedProject);
      }
    } catch (err) {
      console.error("Error generating tasks:", err);
      alert(
        "Failed to generate tasks: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteAllTasks = async () => {
    if (tasks.length === 0) {
      alert("No tasks to delete");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete all ${tasks.length} tasks? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const deletePromises = tasks.map((task) =>
        axios.delete(`/department/portal/tasks/${task.id}`)
      );
      await Promise.all(deletePromises);
      alert(`Successfully deleted all ${tasks.length} tasks`);
      setTasks([]);
    } catch (err) {
      console.error("Error deleting tasks:", err);
      alert(
        "Failed to delete tasks: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const getProductionStatus = (project) => {
    const hasPlan = project.status === "planning" || project.status === "active" || project.status === "in_progress";
    return hasPlan ? "Production Started" : "Pending Planning";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center p-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Production Workflow Projects
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            View root cards and manage production workflow tasks
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateTasks}
            variant="outline"
            className="border-purple-600 text-purple-600 hover:bg-purple-50"
            disabled={isGenerating || !selectedProject}
          >
            <Zap size={18} className="mr-2" />
            {isGenerating ? "Generating..." : "Generate Workflow Tasks"}
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus size={18} className="mr-2" />
            New Custom Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
            Root Cards
          </h3>
          <div className="space-y-2">
            {projects.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No root cards available
              </p>
            ) : (
              projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`w-full text-left p-3 rounded-lg transition-colors text-sm ${
                    selectedProject?.id === project.id
                      ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                      : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <p className="font-medium">
                    {project.project_name || project.customer}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {project.po_number}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        project.status === "active" || project.status === "in_progress"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {getProductionStatus(project)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {selectedProject ? (
            <div className="space-y-4">
              <ProductionProjectCard
                project={selectedProject}
                tasks={tasks}
                onTaskStatusChange={(taskId, newStatus) => {
                  setTasks(
                    tasks.map((t) =>
                      t.id === taskId ? { ...t, status: newStatus } : t
                    )
                  );
                }}
              />

              {tasks.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAllTasks}
                  >
                    Delete All Tasks
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-400">
                Select a root card to view workflow
              </p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Create New Task
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="Enter task title"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Enter task description"
                  rows="3"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionWorkflowTasksPage;
