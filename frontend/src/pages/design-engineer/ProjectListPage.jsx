import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Edit2, Eye, Loader2, Search, Calendar as CalendarIcon, Trash2, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import axios from '../../utils/api';

const ProjectListPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/design/projects');
      const projectsData = Array.isArray(response.data) ? response.data : (response.data?.projects || []);
      const mapped = projectsData.map(project => ({
        id: project.id,
        title: project.projectName,
        code: project.projectCode,
        status: project.status || 'draft',
        priority: project.priority || 'medium',
        planned_start: project.createdAt,
        planned_end: null,
        project_name: project.projectName,
        customer: project.clientName
      }));
      setProjects(mapped);
    } catch (error) {
      console.error('Error fetching design projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         project.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      critical: { bg: 'bg-red-100', text: 'text-red-800' },
      high: { bg: 'bg-orange-100', text: 'text-orange-800' },
      medium: { bg: 'bg-blue-100', text: 'text-blue-800' },
      low: { bg: 'bg-green-100', text: 'text-green-800' },
    };
    const config = priorityConfig[priority] || priorityConfig.medium;
    return <span className={`inline-flex items-center px-3 py-1 rounded-full capitalize text-xs ${config.bg} ${config.text}`}>{priority?.toLowerCase()}</span>;
  };

  const handleDeleteProject = async (projectId) => {
    try {
      setDeleting(true);
      await axios.delete(`/api/design/projects/${projectId}`);
      setProjects(projects.filter(p => p.id !== projectId));
      setDeleteConfirm(null);
      alert('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Project Details</h1>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Manage all project specifications and materials</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate('/admin/sales-orders/new-order')}
                variant="secondary"
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={20} />
                New Order
              </Button>
              <Button
                onClick={() => navigate('/design-engineer/project-details/new')}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={20} />
                New Project
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterPriority('all');
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700c">
                  <th className="p-2 text-left text-xs  text-slate-700 dark:text-slate-300  tracking-wider">Project Name</th>
                  <th className="p-2 text-left text-xs  text-slate-700 dark:text-slate-300  tracking-wider">Priority</th>
                  <th className="p-2 text-left text-xs  text-slate-700 dark:text-slate-300  tracking-wider">Uploads</th>
                  <th className="p-2 text-left text-xs  text-slate-700 dark:text-slate-300  tracking-wider">Timeline</th>
                  <th className="p-2 text-center text-xs  text-slate-700 dark:text-slate-300  tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                    </td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-12 h-12 text-slate-300" />
                        <span className="text-sm">No projects found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                      <td className="p-2">
                        <div className="flex items-center gap-3">
                          <div className=" bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0 p-2">
                            <FileText className="text-blue-600 dark:text-blue-400" size={10} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white text-xs">{project.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <code className="text-xs font-mono bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                                {project.code || 'N/A'}
                              </code>
                              <span className="text-xs text-slate-500 dark:text-slate-400">• {project.project_name}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        {getPriorityBadge(project.priority)}
                      </td>
                      <td className="p-2">
                        <span className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-xs block" title={project.uploads}>
                          {project.uploads}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <CalendarIcon size={10} />
                          {project.planned_start ? (
                            <span>
                              {new Date(project.planned_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          ) : (
                            <span className="text-slate-400">Not set</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/design-engineer/project-details/view?projectId=${project.id}`)}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400 transition"
                            title="View Details"
                          >
                            <Eye size={10} />
                          </button>
                          <button
                            onClick={() => navigate(`/design-engineer/project-details/view?projectId=${project.id}&mode=edit`)}
                            className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-lg text-amber-600 dark:text-amber-400 transition"
                            title="Edit"
                          >
                            <Edit2 size={10} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(project)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg text-red-600 dark:text-red-400 transition"
                            title="Delete"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer */}
          {filteredProjects.length > 0 && (
            <div className="p-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Showing {filteredProjects.length} of {projects.length} projects
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 max-w-sm w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Project</h3>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 dark:text-slate-300">
                Are you sure you want to delete the project <span className="font-semibold">{deleteConfirm.title}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProject(deleteConfirm.id)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectListPage;
