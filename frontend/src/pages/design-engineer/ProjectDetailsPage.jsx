import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FileText, Save, Upload, X, File, Plus, Edit2, Eye, Trash2, Loader2, Search, Filter, ChevronDown, Calendar as CalendarIcon, Play, CheckCircle, Clock, User, Building2, ArrowRight } from 'lucide-react';
import Input from '../../components/ui/Input';
import MultiSelect from '../../components/ui/MultiSelect';
import Card, { CardContent, CardTitle, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import axios from '../../utils/api';

const STEEL_SECTIONS_OPTIONS = [
  "ISMB 100-500mm", "ISA angles", "Channels", "Tubular sections", "Flat bars", "Round bars", "Square sections",
];

const PLATES_OPTIONS = [
  "MS plates 10mm", "MS plates 12mm", "Stainless steel plates", "Aluminium plates", "Alloy plates", "Galvanized plates",
];

const FASTENERS_OPTIONS = [
  "M16 bolts", "M10 screws", "Lock nuts", "Washers", "Rivets", "Studs", "Anchors",
];

const COMPONENTS_OPTIONS = [
  "Roller wheels", "Bearings", "Gear boxes", "Motors", "Cables", "Pulleys", "Shafts", "Chains",
];

const ELECTRICAL_OPTIONS = [
  "Control panels", "Sensors", "PLC", "Limit switches", "VFD", "Relays", "Contactors", "Transformers",
];

const CONSUMABLES_OPTIONS = [
  "Welding consumables", "Primer", "Paint", "Grease", "Oil", "Lubricants", "Solvents",
];

const ensureMaterialsAreArrays = (data) => {
  return {
    ...data,
    steelSections: Array.isArray(data.steelSections) ? data.steelSections : [],
    plates: Array.isArray(data.plates) ? data.plates : [],
    fasteners: Array.isArray(data.fasteners) ? data.fasteners : [],
    components: Array.isArray(data.components) ? data.components : [],
    electrical: Array.isArray(data.electrical) ? data.electrical : [],
    consumables: Array.isArray(data.consumables) ? data.consumables : [],
  };
};

const ProjectDetailsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || searchParams.get('salesOrderId');
  const viewMode = searchParams.get('mode');

  const [view, setView] = useState('list');
  const [editMode, setEditMode] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [roleId, setRoleId] = useState(null);

  const [projectData, setProjectData] = useState({
    designId: "",
    projectName: "",
    productName: "",
    designStatus: "draft",
    designEngineerName: "",
    systemLength: "",
    systemWidth: "",
    systemHeight: "",
    loadCapacity: "",
    operatingEnvironment: "",
    materialGrade: "",
    surfaceFinish: "",
    steelSections: [],
    plates: [],
    fasteners: [],
    components: [],
    electrical: [],
    consumables: [],
    designSpecifications: "",
    manufacturingInstructions: "",
    qualitySafety: "",
    additionalNotes: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    references: [],
  });

  useEffect(() => {
    fetchRoleId();
  }, []);

  useEffect(() => {
    if (projectId) {
      setView('overview');
    } else {
      setView('list');
      fetchProjects();
    }
  }, [projectId]);

  useEffect(() => {
    if (view === 'list') {
      fetchProjects();
    }
  }, [view]);

  useEffect(() => {
    if (projectId) {
      if (viewMode === 'view') {
        setEditMode(false);
      } else {
        setEditMode(true);
      }
      loadProjectFromUrl();
    }
  }, [projectId, viewMode]);

  const fetchRoleId = async () => {
    try {
      const response = await axios.get('/api/department/portal/role/design_engineer');
      setRoleId(response.data.roleId);
    } catch (err) {
      console.error('Error fetching role ID:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/sales/orders');
      console.log('Sales orders response:', response.data);
      const orders = Array.isArray(response.data) ? response.data : (response.data.orders || []);
      setProjects(orders);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = (project.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.po_number?.toLowerCase().includes(searchTerm.toLowerCase())) || searchTerm === '';
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const fetchTasksForProject = async (project) => {
    try {
      if (!roleId) return;
      const response = await axios.get(`/api/department/portal/tasks/${roleId}`);
      setTasks(response.data.filter(t => t.rootCard?.id === project.id || t.salesOrder?.id === project.id));
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setTasks([]);
    }
  };

  const ensureArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') return [value];
    if (value) return [value];
    return [];
  };

  const handleSelectProject = (project) => {
    navigate(`/design-engineer/project-details?projectId=${project.id}&mode=edit`);
  };

  const handleViewProject = (project) => {
    navigate(`/design-engineer/project-details?projectId=${project.id}&mode=view`);
  };

  const loadProjectFromUrl = async () => {
    try {
      setLoading(true);

      let salesOrder = null;
      try {
        const response = await axios.get(`/api/sales/orders/${projectId}`);
        salesOrder = response.data.order || response.data;
      } catch (err) {
        console.error('Sales order not found:', err);
        alert('Project not found');
        setView('list');
        return;
      }

      if (!salesOrder) {
        alert('Project not found');
        setView('list');
        return;
      }

      setSelectedProject(salesOrder);

      let designDetails = null;
      try {
        const savedResponse = await axios.get(`/api/sales/orders/${salesOrder.id}/design-details`);
        designDetails = savedResponse.data?.data;
        console.log('Saved design details:', designDetails);
      } catch (err) {
        console.log('No saved design details found', err);
      }

      const dataToSet = {
        designId: designDetails?.designId || salesOrder.po_number || "",
        projectName: designDetails?.projectName || salesOrder.project_name || "",
        productName: designDetails?.productName || salesOrder.project_name || "",
        designStatus: designDetails?.designStatus || salesOrder.status || "draft",
        designEngineerName: designDetails?.designEngineerName || "",
        systemLength: designDetails?.systemLength || "",
        systemWidth: designDetails?.systemWidth || "",
        systemHeight: designDetails?.systemHeight || "",
        loadCapacity: designDetails?.loadCapacity || "",
        operatingEnvironment: designDetails?.operatingEnvironment || "",
        materialGrade: designDetails?.materialGrade || "",
        surfaceFinish: designDetails?.surfaceFinish || "",
        steelSections: ensureArray(designDetails?.steelSections),
        plates: ensureArray(designDetails?.plates),
        fasteners: ensureArray(designDetails?.fasteners),
        components: ensureArray(designDetails?.components),
        electrical: ensureArray(designDetails?.electrical),
        consumables: ensureArray(designDetails?.consumables),
        designSpecifications: designDetails?.designSpecifications || "",
        manufacturingInstructions: designDetails?.manufacturingInstructions || "",
        qualitySafety: designDetails?.qualitySafety || "",
        additionalNotes: designDetails?.additionalNotes || "",
      };
      const safeData = ensureMaterialsAreArrays(dataToSet);
      setProjectData(safeData);

      if (designDetails?.referenceDocuments) {
        setUploadedFiles({
          references: Array.isArray(designDetails.referenceDocuments) ? designDetails.referenceDocuments : []
        });
      } else if (salesOrder.documents) {
        setUploadedFiles({
          references: Array.isArray(salesOrder.documents) ? salesOrder.documents : []
        });
      }

      await fetchTasksForProject(salesOrder);
      setEditMode(viewMode === 'edit');
      setView('overview');
    } catch (error) {
      console.error('Error loading project from URL:', error);
      alert('Failed to load project details');
      setView('list');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/department/portal/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status');
    }
  };

  const handleInputChange = (field, value) => {
    setProjectData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSelectChange = (field, value) => {
    setProjectData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(prev => ({
      ...prev,
      references: [
        ...prev.references,
        ...files.map(f => ({ name: f.name, size: f.size, type: f.type }))
      ]
    }));
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      if (!projectData.productName) {
        alert('Product Name is required');
        return;
      }

      setSaving(true);

      const salesOrderId = selectedProject?.id;
      if (!salesOrderId) {
        alert('No sales order selected. Please ensure the task is properly linked to a sales order. If the issue persists, please contact your administrator.');
        console.error('Selected project has no ID:', selectedProject);
        return;
      }

      console.log('Saving materials:', {
        steelSections: projectData.steelSections,
        plates: projectData.plates,
        fasteners: projectData.fasteners,
        components: projectData.components,
        electrical: projectData.electrical,
        consumables: projectData.consumables
      });

      const payload = {
        designId: projectData.designId,
        projectName: projectData.projectName,
        productName: projectData.productName,
        designStatus: projectData.designStatus,
        designEngineerName: projectData.designEngineerName,
        systemLength: projectData.systemLength,
        systemWidth: projectData.systemWidth,
        systemHeight: projectData.systemHeight,
        loadCapacity: projectData.loadCapacity,
        operatingEnvironment: projectData.operatingEnvironment,
        materialGrade: projectData.materialGrade,
        surfaceFinish: projectData.surfaceFinish,
        steelSections: projectData.steelSections,
        plates: projectData.plates,
        fasteners: projectData.fasteners,
        components: projectData.components,
        electrical: projectData.electrical,
        consumables: projectData.consumables,
        designSpecifications: projectData.designSpecifications,
        manufacturingInstructions: projectData.manufacturingInstructions,
        qualitySafety: projectData.qualitySafety,
        additionalNotes: projectData.additionalNotes,
        referenceDocuments: uploadedFiles.references || []
      };

      if (salesOrderId && !isNaN(salesOrderId)) {
        await axios.post(`/api/sales/orders/${salesOrderId}/design-details`, payload);
      } else {
        alert('No sales order linked to this task. Cannot save details.');
        return;
      }


      alert('Project details saved successfully!');
      setView('list');
      await fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project details: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      setSaving(true);
      await axios.delete(`/api/sales/orders/${projectId}`);
      alert('Project deleted successfully!');
      fetchProjects();
      setView('list');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
      on_hold: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'On Hold' },
      planning: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Planning' },
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>{config.label}</span>;
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      critical: { bg: 'bg-red-100', text: 'text-red-800' },
      high: { bg: 'bg-orange-100', text: 'text-orange-800' },
      medium: { bg: 'bg-blue-100', text: 'text-blue-800' },
      low: { bg: 'bg-green-100', text: 'text-green-800' },
    };
    const config = priorityConfig[priority] || priorityConfig.medium;
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>{priority?.toUpperCase()}</span>;
  };

  if (loading && view !== 'list') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (view === 'list') {
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
              <Button
                onClick={() => {
                  alert('Please create a Sales Order first. Go to Sales module to create a new order, then come back here to add design details.');
                }}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={20} />
                New Project
              </Button>
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
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-2">
                    <th className="p-1 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Project Name</th>
                    <th className="p-1 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Code</th>
                    <th className="p-1 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Start Date</th>
                    <th className="p-1 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">End Date</th>
                    <th className="p-1 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Materials</th>
                    <th className="p-1 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Documents</th>
                    <th className="p-1 text-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                      </td>
                    </tr>
                  ) : filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="w-12 h-12 text-slate-300" />
                          <span className="text-sm">No projects found</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((project) => {
                      const projectDocuments = Array.isArray(project.documents) ? project.documents : [];
                      const materialsCount = (project.design_details?.steelSections?.length || 0) + 
                                           (project.design_details?.plates?.length || 0) + 
                                           (project.design_details?.fasteners?.length || 0) + 
                                           (project.design_details?.components?.length || 0) + 
                                           (project.design_details?.electrical?.length || 0) + 
                                           (project.design_details?.consumables?.length || 0);
                      
                      return (
                        <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0 p-2">
                                <FileText className="text-blue-600 dark:text-blue-400" size={15} />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white text-xs">{project.project_name || project.customer}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <code className="text-xs font-mono bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">
                              {project.po_number || 'N/A'}
                            </code>
                          </td>
                          <td className="p-3">
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              {project.order_date ? new Date(project.order_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : 'N/A'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              {project.due_date ? new Date(project.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : 'N/A'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              {materialsCount} items
                            </span>
                          </td>
                          <td className="p-3">
                            {projectDocuments.length > 0 ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-600 dark:text-slate-400">{projectDocuments.length} file(s)</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">No docs</span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleSelectProject(project)}
                                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400 transition"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleViewProject(project)}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this project?')) {
                                    handleDeleteProject(project.id);
                                  }
                                }}
                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg text-red-600 dark:text-red-400 transition"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            {filteredProjects.length > 0 && (
              <div className="p-1 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Showing <span className="font-semibold">{filteredProjects.length}</span> of <span className="font-semibold">{projects.length}</span> projects
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white dark:bg-slate-800 shadow-sm rounded border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center  justify-between p-3">
            <div className="flex items-center gap-3">
              <div className="w-fit  h-fit p-2 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="text-white" size={15} />
              </div>
              <div>
                <h1 className="text-md font-bold text-slate-900 dark:text-white">
                  {selectedProject ? (editMode ? 'Edit' : 'View') : 'Create'} Project Details
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {selectedProject?.title || 'New Project'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Design ID"
                  value={projectData.designId}
                  onChange={(e) => handleInputChange('designId', e.target.value)}
                  placeholder="e.g., DES-2024-001"
                  disabled={!editMode}
                  readOnly={!editMode}
                />
                <Input
                  label="Project Name"
                  value={projectData.projectName}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                  placeholder="e.g., Manufacturing Setup"
                  disabled={!editMode}
                  readOnly={!editMode}
                />
                <Input
                  label="Product Name"
                  value={projectData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  placeholder="e.g., Heavy Duty Conveyor"
                  disabled={!editMode}
                  readOnly={!editMode}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Design Status"
                  value={projectData.designStatus}
                  onChange={(e) => handleInputChange('designStatus', e.target.value)}
                  placeholder="e.g., Draft, In Progress"
                  disabled={!editMode}
                  readOnly={!editMode}
                />
                <Input
                  label="Design Engineer"
                  value={projectData.designEngineerName}
                  onChange={(e) => handleInputChange('designEngineerName', e.target.value)}
                  placeholder="e.g., John Smith"
                  disabled={!editMode}
                  readOnly={!editMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dimensions & Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Product Dimensions & Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Length (mm)"
                  value={projectData.systemLength}
                  onChange={(e) => handleInputChange('systemLength', e.target.value)}
                  placeholder="e.g., 3000"
                  disabled={!editMode}
                  readOnly={!editMode}
                />
                <Input
                  label="Width (mm)"
                  value={projectData.systemWidth}
                  onChange={(e) => handleInputChange('systemWidth', e.target.value)}
                  placeholder="e.g., 2000"
                  disabled={!editMode}
                  readOnly={!editMode}
                />
                <Input
                  label="Height (mm)"
                  value={projectData.systemHeight}
                  onChange={(e) => handleInputChange('systemHeight', e.target.value)}
                  placeholder="e.g., 1500"
                  disabled={!editMode}
                  readOnly={!editMode}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Load Capacity (kg)"
                  value={projectData.loadCapacity}
                  onChange={(e) => handleInputChange('loadCapacity', e.target.value)}
                  placeholder="e.g., 6000"
                  disabled={!editMode}
                  readOnly={!editMode}
                />
                <Input
                  label="Operating Environment"
                  value={projectData.operatingEnvironment}
                  onChange={(e) => handleInputChange('operatingEnvironment', e.target.value)}
                  placeholder="e.g., Indoor, Outdoor, Humid"
                  disabled={!editMode}
                  readOnly={!editMode}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Material Grade"
                  value={projectData.materialGrade}
                  onChange={(e) => handleInputChange('materialGrade', e.target.value)}
                  placeholder="e.g., EN8, ASTM A36"
                  disabled={!editMode}
                  readOnly={!editMode}
                />
                <Input
                  label="Surface Finish"
                  value={projectData.surfaceFinish}
                  onChange={(e) => handleInputChange('surfaceFinish', e.target.value)}
                  placeholder="e.g., Painted, Powder coated"
                  disabled={!editMode}
                  readOnly={!editMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Materials Required */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Materials Required for Production</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <MultiSelect
                    label="Steel Sections"
                    options={STEEL_SECTIONS_OPTIONS}
                    value={projectData.steelSections}
                    onChange={(value) => handleMultiSelectChange('steelSections', value)}
                    placeholder="Select steel sections..."
                    disabled={!editMode}
                  />
                  {projectData.steelSections && projectData.steelSections.length > 0 && (
                    <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-400 mb-2">Selected:</p>
                      <div className="flex flex-wrap gap-2">
                        {projectData.steelSections.map((item) => (
                          <span key={item} className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <MultiSelect
                    label="Plates"
                    options={PLATES_OPTIONS}
                    value={projectData.plates}
                    onChange={(value) => handleMultiSelectChange('plates', value)}
                    placeholder="Select plates..."
                    disabled={!editMode}
                  />
                  {projectData.plates && projectData.plates.length > 0 && (
                    <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-400 mb-2">Selected:</p>
                      <div className="flex flex-wrap gap-2">
                        {projectData.plates.map((item) => (
                          <span key={item} className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <MultiSelect
                    label="Fasteners & Hardware"
                    options={FASTENERS_OPTIONS}
                    value={projectData.fasteners}
                    onChange={(value) => handleMultiSelectChange('fasteners', value)}
                    placeholder="Select fasteners..."
                    disabled={!editMode}
                  />
                  {projectData.fasteners && projectData.fasteners.length > 0 && (
                    <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-400 mb-2">Selected:</p>
                      <div className="flex flex-wrap gap-2">
                        {projectData.fasteners.map((item) => (
                          <span key={item} className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <MultiSelect
                    label="Mechanical Components"
                    options={COMPONENTS_OPTIONS}
                    value={projectData.components}
                    onChange={(value) => handleMultiSelectChange('components', value)}
                    placeholder="Select components..."
                    disabled={!editMode}
                  />
                  {projectData.components && projectData.components.length > 0 && (
                    <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-400 mb-2">Selected:</p>
                      <div className="flex flex-wrap gap-2">
                        {projectData.components.map((item) => (
                          <span key={item} className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <MultiSelect
                    label="Electrical & Automation"
                    options={ELECTRICAL_OPTIONS}
                    value={projectData.electrical}
                    onChange={(value) => handleMultiSelectChange('electrical', value)}
                    placeholder="Select electrical items..."
                    disabled={!editMode}
                  />
                  {projectData.electrical && projectData.electrical.length > 0 && (
                    <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-400 mb-2">Selected:</p>
                      <div className="flex flex-wrap gap-2">
                        {projectData.electrical.map((item) => (
                          <span key={item} className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <MultiSelect
                    label="Consumables & Paint"
                    options={CONSUMABLES_OPTIONS}
                    value={projectData.consumables}
                    onChange={(value) => handleMultiSelectChange('consumables', value)}
                    placeholder="Select consumables..."
                    disabled={!editMode}
                  />
                  {projectData.consumables && projectData.consumables.length > 0 && (
                    <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-400 mb-2">Selected:</p>
                      <div className="flex flex-wrap gap-2">
                        {projectData.consumables.map((item) => (
                          <span key={item} className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reference Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reference Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition ${editMode ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  disabled={!editMode}
                  className="hidden"
                  id="refUpload"
                  accept=".pdf,.doc,.docx,.xlsx,.txt,.jpg,.png"
                />
                <label htmlFor="refUpload" className={`${editMode ? 'cursor-pointer' : 'cursor-not-allowed'} block`}>
                  <Upload className="mx-auto mb-3 text-blue-500" size={32} />
                  <p className="text-slate-900 dark:text-white font-medium">
                    {editMode ? 'Click to upload reference materials' : 'View mode - cannot upload'}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                    PDF, DOC, DOCX, XLSX, TXT, JPG, PNG
                  </p>
                </label>
              </div>
              {uploadedFiles.references.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Uploaded Files ({uploadedFiles.references.length})</h4>
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                    <table className="w-full">
                      <thead className="bg-slate-100 dark:bg-slate-800">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-slate-900 dark:text-white">Document Name</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-slate-900 dark:text-white">File Type</th>
                          <th className="px-4 py-2 text-center text-xs font-semibold text-slate-900 dark:text-white">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadedFiles.references.map((file, idx) => {
                          const fileName = file.name || '';
                          const fileExtension = fileName.split('.').pop()?.toUpperCase() || 'File';
                          return (
                            <tr key={idx} className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                                <div className="flex items-center gap-2">
                                  <File size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                  <span className="truncate">{fileName}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                {fileExtension}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => removeFile(idx)}
                                  disabled={!editMode}
                                  className={`${editMode ? 'text-red-500 hover:text-red-700 dark:hover:text-red-400 cursor-pointer' : 'text-slate-400 cursor-not-allowed opacity-50'}`}
                                >
                                  <X size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Design Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Design Notes & Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Design Specifications Summary
                </label>
                <textarea
                  value={projectData.designSpecifications}
                  onChange={(e) => handleInputChange('designSpecifications', e.target.value)}
                  placeholder="Detailed technical specifications and design features"
                  rows="3"
                  disabled={!editMode}
                  readOnly={!editMode}
                  className={`w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-white text-sm ${!editMode ? 'bg-slate-100 opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Manufacturing Instructions
                </label>
                <textarea
                  value={projectData.manufacturingInstructions}
                  onChange={(e) => handleInputChange('manufacturingInstructions', e.target.value)}
                  placeholder="Special instructions for fabrication, assembly, and testing"
                  rows="3"
                  disabled={!editMode}
                  readOnly={!editMode}
                  className={`w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-white text-sm ${!editMode ? 'bg-slate-100 opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Quality & Safety Requirements
                </label>
                <textarea
                  value={projectData.qualitySafety}
                  onChange={(e) => handleInputChange('qualitySafety', e.target.value)}
                  placeholder="QC checkpoints, safety standards, and testing requirements"
                  rows="3"
                  disabled={!editMode}
                  readOnly={!editMode}
                  className={`w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-white text-sm ${!editMode ? 'bg-slate-100 opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={projectData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  placeholder="Any additional information or special requirements"
                  rows="3"
                  disabled={!editMode}
                  readOnly={!editMode}
                  className={`w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-white text-sm ${!editMode ? 'bg-slate-100 opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg">
            <Button
              onClick={() => navigate('/design-engineer/project-details')}
              variant="secondary"
            >
              Back to List
            </Button>
            {editMode && (
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={20} />}
                {saving ? 'Saving...' : 'Save Project Details'}
              </Button>
            )}
            {!editMode && selectedProject && (
              <Button
                onClick={() => navigate(`/design-engineer/project-details?projectId=${selectedProject.id}&mode=edit`)}
                className="flex items-center gap-2"
              >
                <Edit2 size={20} />
                Edit Project
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
