import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, Save, Upload, X, File, Loader2 } from 'lucide-react';
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

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [taskId] = useState(searchParams.get('taskId'));
  const [taskTitle] = useState(searchParams.get('taskTitle'));

  const [projectData, setProjectData] = useState({
    rootCardId: "",
    projectName: "",
    projectCode: "",
    poNumber: "",
    clientName: "",
    priority: "",
    status: "",
    startDate: "",
    deliveryDate: "",
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

  const [loadingProject, setLoadingProject] = useState(false);

  useEffect(() => {
    const salesOrderId = searchParams.get('salesOrderId');
    if (salesOrderId) {
      fetchProjectInfoBySalesOrder(salesOrderId);
    }
  }, [searchParams]);

  const fetchProjectInfoBySalesOrder = async (salesOrderId) => {
    setLoadingProject(true);
    try {
      if (!salesOrderId) {
        console.warn('No salesOrderId provided');
        setLoadingProject(false);
        return;
      }

      let rootCard = null;
      
      try {
        const response = await axios.get(`/api/production/root-cards?salesOrderId=${salesOrderId}`);
        if (Array.isArray(response.data)) {
          rootCard = response.data[0];
        } else {
          rootCard = response.data;
        }
      } catch (err) {
        console.log('Could not fetch root card by sales order:', err.message);
      }
      
      if (rootCard) {
        setProjectData(prev => ({
          ...prev,
          rootCardId: String(rootCard.id),
          projectName: rootCard.project_name || rootCard.title || searchParams.get('projectName') || '',
          projectCode: rootCard.code || rootCard.project_code || '',
          poNumber: rootCard.po_number || searchParams.get('poNumber') || '',
          clientName: rootCard.customer_name || rootCard.client_name || searchParams.get('customer') || '',
          priority: rootCard.priority || '',
          status: rootCard.status || '',
          startDate: rootCard.planned_start || rootCard.start_date || '',
          deliveryDate: rootCard.planned_end || rootCard.delivery_date || rootCard.end_date || '',
        }));
      } else {
        setProjectData(prev => ({
          ...prev,
          rootCardId: String(salesOrderId),
          projectName: searchParams.get('projectName') || '',
          poNumber: searchParams.get('poNumber') || '',
          clientName: searchParams.get('customer') || '',
        }));
      }
    } catch (err) {
      console.error('Error fetching project info:', err);
      setProjectData(prev => ({
        ...prev,
        projectName: searchParams.get('projectName') || '',
        poNumber: searchParams.get('poNumber') || '',
        clientName: searchParams.get('customer') || '',
      }));
    } finally {
      setLoadingProject(false);
    }
  };

  const fetchProjectInfo = async (orderId) => {
    setLoadingProject(true);
    try {
      if (!orderId) {
        console.warn('No orderId provided');
        setLoadingProject(false);
        return;
      }

      let rootCard = null;
      
      try {
        const response = await axios.get(`/api/production/root-cards/${orderId}`);
        rootCard = response.data;
      } catch (err) {
        console.log('Root card not found by orderId');
      }
      
      if (rootCard) {
        setProjectData(prev => ({
          ...prev,
          rootCardId: String(rootCard.id),
          projectName: rootCard.project_name || rootCard.title || '',
          projectCode: rootCard.code || rootCard.project_code || '',
          poNumber: rootCard.po_number || '',
          clientName: rootCard.customer_name || rootCard.client_name || '',
          priority: rootCard.priority || '',
          status: rootCard.status || '',
          startDate: rootCard.planned_start || rootCard.start_date || '',
          deliveryDate: rootCard.planned_end || rootCard.delivery_date || rootCard.end_date || '',
        }));
      } else {
        setProjectData(prev => ({
          ...prev,
          rootCardId: String(orderId),
          projectName: searchParams.get('projectName') || '',
          poNumber: searchParams.get('poNumber') || '',
          clientName: searchParams.get('customer') || '',
        }));
      }
    } catch (err) {
      console.error('Error fetching project info:', err);
    } finally {
      setLoadingProject(false);
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
      if (!projectData.projectName) {
        alert('Project Name is required');
        return;
      }
      if (!projectData.productName) {
        alert('Product Name is required');
        return;
      }

      setSaving(true);

      const response = await axios.post(`/api/design/projects`, {
        projectName: projectData.projectName,
        projectCode: projectData.projectCode || "",
        designId: projectData.designId || "",
        productName: projectData.productName,
        clientName: projectData.clientName || "",
        priority: projectData.priority || "medium",
        status: projectData.status || "draft",
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
      });

      alert('Project created successfully!');
      
      if (taskId) {
        try {
          await axios.patch(`/api/department/portal/tasks/${taskId}`, { status: 'completed' });
        } catch (err) {
          console.error('Error completing task:', err);
        }
      }
      
      navigate(`/design-engineer/project-details`);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

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
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create Project Details</h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">New Project</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6 pb-32">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingProject ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Project Name</label>
                    <div className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm">
                      {projectData.projectName || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Project Code</label>
                    <div className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-mono">
                      {projectData.projectCode || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">PO Number</label>
                    <div className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-mono">
                      {projectData.poNumber || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Client Name</label>
                    <div className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm">
                      {projectData.clientName || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Priority</label>
                    <div className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm capitalize">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        projectData.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        projectData.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                        projectData.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {projectData.priority || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Status</label>
                    <div className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm capitalize">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        projectData.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        projectData.status === 'active' || projectData.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        projectData.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        projectData.status === 'planning' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        projectData.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                      }`}>
                        {projectData.status || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
                    <div className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm">
                      {projectData.startDate ? new Date(projectData.startDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Delivery Date</label>
                    <div className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm">
                      {projectData.deliveryDate ? new Date(projectData.deliveryDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Product Name"
                  value={projectData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  placeholder="e.g., Heavy Duty Conveyor"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Design Status"
                  value={projectData.designStatus}
                  onChange={(e) => handleInputChange('designStatus', e.target.value)}
                  placeholder="e.g., Draft, In Progress"
                />
                <Input
                  label="Design Engineer"
                  value={projectData.designEngineerName}
                  onChange={(e) => handleInputChange('designEngineerName', e.target.value)}
                  placeholder="e.g., John Smith"
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
                />
                <Input
                  label="Width (mm)"
                  value={projectData.systemWidth}
                  onChange={(e) => handleInputChange('systemWidth', e.target.value)}
                  placeholder="e.g., 2000"
                />
                <Input
                  label="Height (mm)"
                  value={projectData.systemHeight}
                  onChange={(e) => handleInputChange('systemHeight', e.target.value)}
                  placeholder="e.g., 1500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Load Capacity (kg)"
                  value={projectData.loadCapacity}
                  onChange={(e) => handleInputChange('loadCapacity', e.target.value)}
                  placeholder="e.g., 6000"
                />
                <Input
                  label="Operating Environment"
                  value={projectData.operatingEnvironment}
                  onChange={(e) => handleInputChange('operatingEnvironment', e.target.value)}
                  placeholder="e.g., Indoor, Outdoor, Humid"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Material Grade"
                  value={projectData.materialGrade}
                  onChange={(e) => handleInputChange('materialGrade', e.target.value)}
                  placeholder="e.g., EN8, ASTM A36"
                />
                <Input
                  label="Surface Finish"
                  value={projectData.surfaceFinish}
                  onChange={(e) => handleInputChange('surfaceFinish', e.target.value)}
                  placeholder="e.g., Painted, Powder coated"
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
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition cursor-pointer">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="refUpload"
                  accept=".pdf,.doc,.docx,.xlsx,.txt,.jpg,.png"
                />
                <label htmlFor="refUpload" className="cursor-pointer block">
                  <Upload className="mx-auto mb-3 text-blue-500" size={32} />
                  <p className="text-slate-900 dark:text-white font-medium">
                    Click to upload reference materials
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
                          className="flex-shrink-0 ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 cursor-pointer"
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
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-white text-sm"
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
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-white text-sm"
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
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-white text-sm"
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
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-white text-sm"
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
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={20} />}
              {saving ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage;
