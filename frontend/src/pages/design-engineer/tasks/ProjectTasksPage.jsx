import React, { useState, useEffect } from 'react';
import axios from '@/utils/api';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, Plus, Loader2, AlertCircle, X, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';
import ProjectCard from '@/components/design-engineer/ProjectCard';

const ProjectTasksPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    linkToRootCard: true
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
      const response = await axios.get('/api/department/portal/role/design_engineer');
      setRoleId(response.data.roleId);
    } catch (err) {
      console.warn('Design Engineer role not found, using default role ID');
      setRoleId(1);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/sales/orders', {
        params: { includeSteps: true }
      });
      const data = response.data.orders || [];
      const filteredData = data.filter(order => order.status !== 'draft' && order.status !== 'cancelled');
      setProjects(filteredData);
      if (filteredData && filteredData.length > 0) {
        setSelectedProject(filteredData[0]);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Error loading projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksForProject = async (salesOrder) => {
    try {
      if (!roleId) return;
      const response = await axios.get(`/api/department/portal/tasks/${roleId}`);
      const filtered = response.data.filter(t => t.salesOrder?.id === salesOrder.id);
      console.log('Fetched tasks:', response.data.length, 'Filtered for sales order:', salesOrder.id, 'Result:', filtered.length);
      setTasks(filtered);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setTasks([]);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Task title is required');
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
        salesOrderId: selectedProject?.id,
        rootCardId: null // Let backend resolve root card from sales order
      };

      const response = await axios.post('/api/department/portal/tasks', payload);

      if (response.status === 201) {
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          status: 'pending',
          linkToRootCard: true
        });
        await fetchTasksForProject(selectedProject);
      }
    } catch (err) {
      console.error('Error creating task:', err);
      alert('Failed to create task: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsCreating(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDeleteAllTasks = async () => {
    if (tasks.length === 0) {
      alert('No tasks to delete');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete all ${tasks.length} tasks? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      const deletePromises = tasks.map(task =>
        axios.delete(`/api/department/portal/tasks/${task.id}`)
      );
      await Promise.all(deletePromises);
      alert(`Successfully deleted all ${tasks.length} tasks`);
      setTasks([]);
    } catch (err) {
      console.error('Error deleting tasks:', err);
      alert('Failed to delete tasks: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateWorkflowTasks = async () => {
    if (!selectedProject) {
      alert('Please select a sales order');
      return;
    }

    setIsCreatingWorkflow(true);
    try {
      const response = await axios.post(`/api/production/root-cards/${selectedProject.id}/workflow-tasks`);
      if (response.status === 201) {
        alert(`Successfully created ${response.data.totalCreated} workflow-based design tasks across ${response.data.workflowSteps} process steps!`);
        await fetchTasksForProject(selectedProject);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      alert('Workflow task creation failed: ' + errorMsg);
    } finally {
      setIsCreatingWorkflow(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: <CheckCircle size={20} className="text-green-600 dark:text-green-400" />,
      in_progress: <Clock size={20} className="text-blue-600 dark:text-blue-400" />,
      pending: <Clock size={20} className="text-yellow-600 dark:text-yellow-400" />,
      on_hold: <AlertCircle size={20} className="text-red-600 dark:text-red-400" />,
    };
    return icons[status] || <Clock size={20} />;
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      on_hold: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getDesignStatus = (project) => {
    const hasDesign = project.steps?.step3_design;
    return hasDesign ? 'Design Started' : 'Pending Design';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Design Engineering Projects</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">View sales orders and create design tasks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Sales Orders</h3>
          <div className="space-y-2">
            {projects.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No sales orders available</p>
            ) : (
              projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`w-full text-left p-3 rounded-lg transition-colors text-sm ${
                    selectedProject?.id === project.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <p className="font-medium">{project.project_name || project.customer}</p>
                  <p className="text-xs text-slate-500 mt-1">{project.po_number}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      project.steps?.step3_design 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {getDesignStatus(project)}
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
              <ProjectCard
                project={selectedProject}
                tasks={tasks}
                onStartDesigning={handleCreateWorkflowTasks}
                isCreatingWorkflow={isCreatingWorkflow}
                onTaskStatusChange={(taskId, newStatus) => {
                  setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
                }}
              />

              {tasks.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleDeleteAllTasks}
                  >
                    Delete All
                  </Button>
                </div>
              )}

              
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-400">
                Select a sales order to view tasks
              </p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Create New Task</h2>
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
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="linkToRootCard"
                  name="linkToRootCard"
                  checked={formData.linkToRootCard}
                  onChange={handleFormChange}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="linkToRootCard" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Link to {selectedProject?.project_name || selectedProject?.customer || 'selected order'}
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isCreating}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isCreating}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create Task
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTasksPage;
