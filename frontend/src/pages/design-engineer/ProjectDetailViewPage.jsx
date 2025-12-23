import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FileText, Save, Upload, X, File, Plus, Edit2, Loader2, Clock, CheckCircle, User, ArrowRight, Search } from 'lucide-react';
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

const ProjectDetailViewPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');

  const [editMode, setEditMode] = useState(mode === 'edit');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedRootCard, setSelectedRootCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    const initialize = async () => {
      await fetchRoleId();
      
      const projectId = searchParams.get('projectId');
      if (projectId) {
        await loadProjectDetails(projectId);
      }
      
      setInitialLoading(false);
    };
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRoleId = async () => {
    try {
      const response = await axios.get('/api/department/portal/role/design_engineer');
      setRoleId(response.data.roleId);
    } catch (err) {
      console.error('Error fetching role ID:', err);
    }
  };



  const loadProjectDetails = async (projectId) => {
    try {
      setLoading(true);

      let rootCard = null;
      let order = null;

      try {
        const rootCardResponse = await axios.get(`/api/production/root-cards/${projectId}`);
        rootCard = rootCardResponse.data;
        console.log('Loaded root card:', rootCard);
        setSelectedRootCard(rootCard);
      } catch (err) {
        console.log('Root card not found, trying as sales order:', err.message);
        try {
          const orderResponse = await axios.get(`/api/sales/orders/${projectId}`);
          order = orderResponse.data.order || orderResponse.data;
          console.log('Loaded sales order:', order);
          setSelectedProject(order);
          
          if (order?.id) {
            const rootCardsResponse = await axios.get(`/api/production/root-cards?salesOrderId=${order.id}`);
            const rootCards = Array.isArray(rootCardsResponse.data) ? rootCardsResponse.data : (rootCardsResponse.data.rootCards || rootCardsResponse.data);
            rootCard = Array.isArray(rootCards) && rootCards.length > 0 ? rootCards[0] : null;
            if (rootCard) {
              setSelectedRootCard(rootCard);
            }
          }
        } catch (orderErr) {
          console.error('Could not fetch as root card or sales order:', orderErr);
          alert('Project not found');
          return;
        }
      }

      if (!rootCard && !order) {
        alert('Project not found');
        return;
      }

      if (!selectedProject && rootCard) {
        setSelectedProject(rootCard);
      }

      let designDetails = null;
      if (order?.id) {
        try {
          const designResponse = await axios.get(`/api/sales/${order.id}/client-po/project-details`);
          designDetails = designResponse.data;
        } catch {
          console.log('No design details found');
        }
      }

      let savedProjectDetails = null;
      if (rootCard?.id) {
        try {
          console.log('Fetching design details for root card:', rootCard.id);
          const savedResponse = await axios.get(`/api/production/root-cards/${rootCard.id}/design-details`);
          console.log('Design details response:', savedResponse.data);
          savedProjectDetails = savedResponse.data?.data;
          console.log('Extracted saved project details:', savedProjectDetails);
        } catch (err) {
          console.error('Error fetching saved project details:', err);
        }
      } else {
        console.warn('No root card found, cannot fetch design details');
      }

      const dataToSet = {
        designId: savedProjectDetails?.designId || rootCard?.code || order?.po_number || "",
        projectName: savedProjectDetails?.projectName || rootCard?.project_name || order?.project_name || "",
        productName: savedProjectDetails?.productName || designDetails?.productName || rootCard?.title || "",
        designStatus: savedProjectDetails?.designStatus || rootCard?.status || order?.status || "draft",
        designEngineerName: savedProjectDetails?.designEngineerName || designDetails?.designEngineerName || rootCard?.assigned_supervisor || "",
        systemLength: savedProjectDetails?.systemLength || designDetails?.systemLength || "",
        systemWidth: savedProjectDetails?.systemWidth || designDetails?.systemWidth || "",
        systemHeight: savedProjectDetails?.systemHeight || designDetails?.systemHeight || "",
        loadCapacity: savedProjectDetails?.loadCapacity || designDetails?.loadCapacity || "",
        operatingEnvironment: savedProjectDetails?.operatingEnvironment || designDetails?.operatingEnvironment || "",
        materialGrade: savedProjectDetails?.materialGrade || designDetails?.materialGrade || "",
        surfaceFinish: savedProjectDetails?.surfaceFinish || designDetails?.surfaceFinish || "",
        steelSections: savedProjectDetails?.steelSections || designDetails?.steelSections || [],
        plates: savedProjectDetails?.plates || designDetails?.plates || [],
        fasteners: savedProjectDetails?.fasteners || designDetails?.fasteners || [],
        components: savedProjectDetails?.components || designDetails?.components || [],
        electrical: savedProjectDetails?.electrical || designDetails?.electrical || [],
        consumables: savedProjectDetails?.consumables || designDetails?.consumables || [],
        designSpecifications: savedProjectDetails?.designSpecifications || designDetails?.designSpecifications || "",
        manufacturingInstructions: savedProjectDetails?.manufacturingInstructions || designDetails?.manufacturingInstructions || "",
        qualitySafety: savedProjectDetails?.qualitySafety || designDetails?.qualitySafety || "",
        additionalNotes: savedProjectDetails?.additionalNotes || designDetails?.additionalNotes || "",
      };
      console.log('Data to set:', dataToSet);
      console.log('Saved details:', savedProjectDetails);
      console.log('Root card:', rootCard);
      console.log('Design details from order:', designDetails);
      console.log('Sales order:', order);
      const safeData = ensureMaterialsAreArrays(dataToSet);
      console.log('Safe data after ensureMaterialsAreArrays:', safeData);
      setProjectData(safeData);

      if (savedProjectDetails?.referenceDocuments) {
        setUploadedFiles({
          references: savedProjectDetails.referenceDocuments
        });
      } else if (designDetails?.documents) {
        setUploadedFiles({
          references: designDetails.documents
        });
      }

      if (roleId && (rootCard?.id || order?.id)) {
        try {
          const response = await axios.get(`/api/department/portal/tasks/${roleId}`);
          setTasks(response.data.filter(t => t.salesOrder?.id === order?.id || t.rootCard?.id === rootCard?.id));
        } catch (err) {
          console.error('Error fetching tasks:', err);
        }
      }
    } catch (error) {
      console.error('Error loading project details:', error);
      alert('Failed to load project details: ' + (error.response?.data?.message || error.message));
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
      
      const rootCardId = selectedRootCard?.id;
      if (!rootCardId) {
        alert('No project root card found');
        return;
      }

      await axios.post(`/api/production/root-cards/${rootCardId}/design-details`, {
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
        uploadedFiles: uploadedFiles
      });

      alert('Project details saved successfully!');
      navigate('/design-engineer/project-details');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project details: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {editMode ? 'Edit Project Details' : 'Project Details'}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{projectData.productName || 'Select a project to view'}</p>
            </div>
          </div>
        </div>



        {loading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {!selectedProject ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No project details available</p>
          </div>
        ) : (
          <>
        {/* Tasks Overview */}
        {tasks.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Related Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900">
                        <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white text-sm">{task.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{task.description}</p>
                      </div>
                    </div>
                    <select
                      value={task.status}
                      onChange={(e) => handleTaskStatusUpdate(task.id, e.target.value)}
                      className="px-3 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="planning">Planning</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <div className="space-y-6 pb-32">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Design ID"
                  value={projectData.designId}
                  onChange={(e) => handleInputChange('designId', e.target.value)}
                  placeholder="e.g., DES-2024-001"
                  readOnly={!editMode}
                />
                <Input
                  label="Project Name"
                  value={projectData.projectName}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                  placeholder="e.g., Manufacturing Setup"
                  readOnly={!editMode}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Product Name"
                  value={projectData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  placeholder="e.g., Heavy Duty Conveyor"
                  readOnly={!editMode}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Design Status"
                  value={projectData.designStatus}
                  onChange={(e) => handleInputChange('designStatus', e.target.value)}
                  placeholder="e.g., Draft, In Progress"
                  readOnly={!editMode}
                />
                <Input
                  label="Design Engineer"
                  value={projectData.designEngineerName}
                  onChange={(e) => handleInputChange('designEngineerName', e.target.value)}
                  placeholder="e.g., John Smith"
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
                  readOnly={!editMode}
                />
                <Input
                  label="Width (mm)"
                  value={projectData.systemWidth}
                  onChange={(e) => handleInputChange('systemWidth', e.target.value)}
                  placeholder="e.g., 2000"
                  readOnly={!editMode}
                />
                <Input
                  label="Height (mm)"
                  value={projectData.systemHeight}
                  onChange={(e) => handleInputChange('systemHeight', e.target.value)}
                  placeholder="e.g., 1500"
                  readOnly={!editMode}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Load Capacity (kg)"
                  value={projectData.loadCapacity}
                  onChange={(e) => handleInputChange('loadCapacity', e.target.value)}
                  placeholder="e.g., 6000"
                  readOnly={!editMode}
                />
                <Input
                  label="Operating Environment"
                  value={projectData.operatingEnvironment}
                  onChange={(e) => handleInputChange('operatingEnvironment', e.target.value)}
                  placeholder="e.g., Indoor, Outdoor, Humid"
                  readOnly={!editMode}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Material Grade"
                  value={projectData.materialGrade}
                  onChange={(e) => handleInputChange('materialGrade', e.target.value)}
                  placeholder="e.g., EN8, ASTM A36"
                  readOnly={!editMode}
                />
                <Input
                  label="Surface Finish"
                  value={projectData.surfaceFinish}
                  onChange={(e) => handleInputChange('surfaceFinish', e.target.value)}
                  placeholder="e.g., Painted, Powder coated"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {uploadedFiles.references.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-3 rounded-lg hover:shadow-sm transition"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <File size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <span className="text-xs text-slate-900 dark:text-white truncate">{file.name}</span>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          disabled={!editMode}
                          className={`flex-shrink-0 ml-2 ${editMode ? 'text-red-500 hover:text-red-700 dark:hover:text-red-400 cursor-pointer' : 'text-slate-400 cursor-not-allowed opacity-50'}`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
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
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2"
              >
                <Edit2 size={20} />
                Edit Project
              </Button>
            )}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailViewPage;
