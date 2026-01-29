import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Zap, Calendar, User, FileText, Plus, Trash2, Loader2, Edit2, Save, X } from 'lucide-react';
import axios from '../../utils/api';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const ProductionPlanFormPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [rootCards, setRootCards] = useState([]);
  const [formData, setFormData] = useState({
    rootCardId: '',
    planName: '',
    productionStartDate: '',
    estimatedCompletionDate: '',
    procurementStatus: '',
    supervisorId: '',
    productName: '',
    notes: '',
    stages: []
  });
  const [employees, setEmployees] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [newStage, setNewStage] = useState({
    stageName: '',
    stageType: 'in_house',
    plannedStartDate: '',
    plannedEndDate: '',
    assignedEmployeeId: '',
    facilityId: '',
    targetWarehouse: '',
    notes: ''
  });
  const [productionPhases, setProductionPhases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showStageForm, setShowStageForm] = useState(false);
  const [editingStageId, setEditingStageId] = useState(null);
  const [editedStage, setEditedStage] = useState(null);

  const fetchRootCards = async () => {
    try {
      const response = await axios.get('/production/portal/production-form/root-cards?all=true', { __sessionGuard: true });
      setRootCards(response.data.rootCards || []);
      console.log('Fetched root cards:', response.data.rootCards?.length || 0);
    } catch (err) {
      console.error('Failed to fetch root cards:', err);
      setRootCards([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/production/portal/employees', { __sessionGuard: true });
      setEmployees(response.data);
    } catch (err) {
      console.error('Failed to fetch employees - this is optional:', err);
      setEmployees([]);
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await axios.get('/inventory/facilities/available', { __sessionGuard: true });
      setFacilities(response.data);
    } catch (err) {
      console.error('Failed to fetch facilities - this is optional:', err);
      setFacilities([]);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get('/inventory/materials', { __sessionGuard: true });
      const fetchedMaterials = response.data.materials || [];
      const uniqueWarehouses = [...new Set(fetchedMaterials.map(m => m.location).filter(loc => loc && loc.trim() !== ""))];
      setWarehouses(uniqueWarehouses.length > 0 ? uniqueWarehouses : ["Main Warehouse", "Secondary Warehouse"]);
    } catch (err) {
      console.error('Failed to fetch warehouses:', err);
      setWarehouses(["Main Warehouse", "Secondary Warehouse"]);
    }
  };

  const handleRootCardSelect = useCallback(async (rootCardId) => {
    if (!rootCardId) {
      setProductionPhases([]);
      setFormData(prev => ({
        ...prev,
        rootCardId: '',
        planName: '',
        productionStartDate: '',
        estimatedCompletionDate: '',
        procurementStatus: '',
        stages: []
      }));
      return;
    }

    try {
      const response = await axios.get(`/production/portal/root-cards/${rootCardId}?all=true`, { __sessionGuard: true });
      const rootCard = response.data;

      const step4 = rootCard.stepData?.step4_productionPlan || rootCard.steps?.step4_production || {};
      const step1 = rootCard.stepData?.step1_clientPO || rootCard.steps?.step1_clientPO || {};
      
      console.log('Full response:', rootCard);
      console.log('Step 4 Data:', step4);
      console.log('Step 1 Data:', step1);
      
      const activeBOM = rootCard.stepData?.activeBOM;
      const bomOperations = activeBOM?.operations || [];
      console.log('Active BOM Operations:', bomOperations);

      let autoCreatedStages = [];
      let dataSource = '';

      if (bomOperations.length > 0) {
        dataSource = 'BOM operations';
        autoCreatedStages = bomOperations.map((op, index) => ({
          id: `bom_${op.id || index}_${Date.now()}`,
          stageName: op.operationName,
          stageType: op.type === 'outsource' ? 'outsource' : 'in_house',
          plannedStartDate: step4?.timeline?.startDate || formData.productionStartDate || '',
          plannedEndDate: step4?.timeline?.endDate || formData.estimatedCompletionDate || '',
          estimatedDurationDays: '',
          assignedEmployeeId: null,
          facilityId: null,
          targetWarehouse: op.target_warehouse || op.targetWarehouse || '',
          notes: `Auto-populated from BOM Operation: ${op.operationName}${op.workstation ? ` (${op.workstation})` : ''}`
        }));
        
        // Also update production phases for UI consistency if needed
        setProductionPhases(bomOperations.map(op => op.operationName));
      } else {
        dataSource = 'project phases';
        const phasesArray = step4?.selectedPhases 
          ? Object.keys(step4.selectedPhases)
          : [];
        setProductionPhases(phasesArray);

        autoCreatedStages = phasesArray.map((phase, index) => ({
          id: `auto_${Date.now()}_${index}`,
          stageName: phase,
          stageType: 'in_house',
          plannedStartDate: step4?.timeline?.startDate || formData.productionStartDate || '',
          plannedEndDate: step4?.timeline?.endDate || formData.estimatedCompletionDate || '',
          estimatedDurationDays: '',
          assignedEmployeeId: null,
          facilityId: null,
          targetWarehouse: '',
          notes: `Auto-created from Phase: ${phase}`
        }));
      }

      const projectName = step1.projectName || rootCard.project?.name || rootCard.project_name || '';
      const productName = step1.productDetails?.itemName || rootCard.product_name || '';
      
      const newFormData = {
        ...formData,
        rootCardId: rootCardId || rootCard.id || rootCard.root_card_id || rootCard.sales_order_id || '',
        productName: productName,
        planName: projectName ? `${projectName} - Production Plan` : '',
        productionStartDate: step4?.timeline?.startDate || formData.productionStartDate || '',
        estimatedCompletionDate: step4?.timeline?.endDate || formData.estimatedCompletionDate || '',
        procurementStatus: step4?.timeline?.procurementStatus || formData.procurementStatus || '',
        stages: autoCreatedStages
      };
      setFormData(newFormData);

      console.log(`Auto-created stages from ${dataSource}:`, autoCreatedStages);
      
      if (autoCreatedStages.length > 0) {
        setSuccess(`✓ Auto-populated ${autoCreatedStages.length} production stage(s) from ${dataSource}`);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError('⚠ No production operations or phases found. Please complete the BOM or Step 4 (Production Plan) first.');
        setTimeout(() => setError(''), 6000);
      }
    } catch (err) {
      console.error('Failed to fetch root card details:', err);
      setError('Failed to load root card details');
      setProductionPhases([]);
    }
  }, [formData]);

  useEffect(() => {
    fetchRootCards();
    fetchEmployees();
    fetchFacilities();
    fetchWarehouses();
    
    if (location.state?.rootCardId) {
      handleRootCardSelect(location.state.rootCardId.toString());
    }
  }, [location.state?.rootCardId, handleRootCardSelect]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'rootCardId') {
      handleRootCardSelect(value);
    }
  };

  const handleStageInputChange = (e) => {
    const { name, value } = e.target;
    setNewStage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addStage = () => {
    if (!newStage.stageName) {
      setError('Phase name is required');
      return;
    }

    const stage = { ...newStage, id: Date.now() };
    setFormData(prev => ({
      ...prev,
      stages: [...prev.stages, stage]
    }));

    setNewStage({
      stageName: '',
      stageType: 'in_house',
      plannedStartDate: '',
      plannedEndDate: '',
      assignedEmployeeId: '',
      facilityId: '',
      targetWarehouse: '',
      notes: ''
    });

    setError('');
    setShowStageForm(false);
  };

  const removeStage = (stageId) => {
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.filter(s => s.id !== stageId)
    }));
  };

  const startEditStage = (stage) => {
    setEditingStageId(stage.id);
    setEditedStage({ ...stage });
  };

  const saveEditedStage = async () => {
    if (!editedStage.stageName.trim()) {
      setError('Phase name is required');
      return;
    }

    try {
      setFormData(prev => ({
        ...prev,
        stages: prev.stages.map(s => s.id === editingStageId ? editedStage : s)
      }));

      setEditingStageId(null);
      setEditedStage(null);
      setError('');
      setSuccess('✓ Phase updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving phase:', err);
      setError('Failed to save phase: ' + (err.response?.data?.message || err.message));
    }
  };

  const cancelEditStage = () => {
    setEditingStageId(null);
    setEditedStage(null);
  };

  const handleEditedStageChange = (field, value) => {
    setEditedStage(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('='.repeat(80));
    console.log('[handleSubmit] *** FORM SUBMISSION STARTED ***');
    console.log('[handleSubmit] Current formData:', formData);
    console.log('[handleSubmit] Production phases:', productionPhases);
    console.log('='.repeat(80));

    // Validation
    if (!formData.rootCardId) {
      console.warn('[handleSubmit] Root Card ID is missing');
      setError('Please select a root card/project');
      setLoading(false);
      return;
    }

    if (!formData.planName) {
      console.warn('[handleSubmit] Plan name is missing');
      setError('Plan name is required');
      setLoading(false);
      return;
    }

    if (!formData.rootCardId) {
      console.warn('[handleSubmit] Root Card ID is missing');
      setError('Root Card ID is missing. Please select a valid root card.');
      setLoading(false);
      return;
    }

    if (!formData.stages || formData.stages.length === 0) {
      console.warn('[handleSubmit] No manufacturing stages added');
      setError('Please add at least one manufacturing stage');
      setLoading(false);
      return;
    }

    console.log('[handleSubmit] ✓ All validations passed');
    console.log('[handleSubmit] Making POST to: /root-cards/steps/' + formData.rootCardId + '/production-plan');
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        rootCardId: formData.rootCardId || null,
        planName: formData.planName || 'Production Plan',
        supervisorId: formData.supervisorId || null,
        timeline: {
          startDate: formData.productionStartDate || null,
          endDate: formData.estimatedCompletionDate || null,
          procurementStatus: formData.procurementStatus || null
        },
        selectedPhases: productionPhases.length > 0 ? Object.fromEntries(productionPhases.map(p => [p, true])) : {},
        estimatedCompletionDate: formData.estimatedCompletionDate || null,
        productionNotes: formData.notes || ''
      };

      console.log('[handleSubmit] Payload to send:', JSON.stringify(payload, null, 2));

      const response = await axios.post(`/root-cards/steps/${formData.rootCardId}/production-plan`, payload);

      console.log('[handleSubmit] ✓✓✓ SUCCESS! Response:', response.data);
      console.log('[handleSubmit] Production plan created with ID:', response.data.data?.planId);

      if (formData.stages && formData.stages.length > 0) {
        try {
          console.log('[handleSubmit] Creating', formData.stages.length, 'production plan stages');
          
          const stagesToCreate = formData.stages.map((stage) => {
            const stageData = {
              stageName: stage.stageName,
              stageType: stage.stageType || 'in_house',
              plannedStartDate: stage.plannedStartDate || null,
              plannedEndDate: stage.plannedEndDate || null,
              targetWarehouse: stage.targetWarehouse || null,
              assignedVendorId: null,
              notes: stage.notes || null
            };
            
            // Only add employee ID if it has a valid value
            const empId = stage.assignedEmployeeId ? parseInt(stage.assignedEmployeeId) : null;
            if (empId && !isNaN(empId) && empId > 0) {
              stageData.assignedEmployeeId = empId;
            } else {
              stageData.assignedEmployeeId = null;
            }
            
            // Only add facility ID if it has a valid value
            const facId = stage.facilityId ? parseInt(stage.facilityId) : null;
            if (facId && !isNaN(facId) && facId > 0) {
              stageData.assignedFacilityId = facId;
            } else {
              stageData.assignedFacilityId = null;
            }
            
            return stageData;
          });

          console.log('[handleSubmit] Stages to create:', JSON.stringify(stagesToCreate, null, 2));
          const stagesResponse = await axios.post(`/production/plans/${response.data.data?.planId}/stages`, stagesToCreate);
          console.log('[handleSubmit] ✓ Production plan stages created:', stagesResponse.data);
        } catch (stageErr) {
          console.error('[handleSubmit] Error creating stages:', stageErr.response?.data || stageErr.message);
          setError('Production plan created but failed to create stages: ' + (stageErr.response?.data?.message || stageErr.message));
          setLoading(false);
          return;
        }
      }

      // Success - reset form and navigate
      setSuccess('✓ Production plan created successfully!');
      setFormData({
        rootCardId: '',
        planName: '',
        productionStartDate: '',
        estimatedCompletionDate: '',
        procurementStatus: '',
        supervisorId: '',
        notes: '',
        stages: []
      });
      setProductionPhases([]);

      console.log('[handleSubmit] Navigating to /department/production/plans');
      setTimeout(() => {
        navigate('/department/production/plans');
      }, 2000);
      
    } catch (err) {
      console.error('='.repeat(80));
      console.error('[handleSubmit] *** ERROR OCCURRED ***');
      console.error('[handleSubmit] Error object:', err);
      console.error('[handleSubmit] Response status:', err.response?.status);
      console.error('[handleSubmit] Response data:', err.response?.data);
      console.error('[handleSubmit] Error message:', err.response?.data?.message || err.message);
      console.error('='.repeat(80));
      
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error occurred';
      setError('Failed to create production plan: ' + errorMsg);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (id) => {
    const employee = employees.find(e => e.id == id);
    return employee ? employee.username : 'Unknown';
  };

  const getFacilityName = (id) => {
    const facility = facilities.find(f => f.id == id);
    return facility ? facility.name : 'Not assigned';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Create Production Plan
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                Define manufacturing timeline and production phases
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
              {success}
            </div>
          )}
        </div>

        {/* Form */}
        <form 
          onSubmit={(e) => {
            console.log('[Form] onSubmit triggered');
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(e);
            return false;
          }} 
          className="space-y-6 pb-8"
          noValidate
        >
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Root Card / Project <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="rootCardId"
                    value={formData.rootCardId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Root Card</option>
                    {rootCards.map(card => (
                      <option key={card.id} value={card.id}>
                        {card.project?.name} {card.project?.code && `(${card.project.code})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Plan Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="planName"
                    value={formData.planName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="Auto-populated from project"
                  />
                </div>
              </div>

              {formData.productName && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    <span className="font-bold">Product:</span> {formData.productName}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar size={14} />
                    Production Start Date
                  </label>
                  <input
                    type="date"
                    name="productionStartDate"
                    value={formData.productionStartDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar size={14} />
                    Estimated Completion
                  </label>
                  <input
                    type="date"
                    name="estimatedCompletionDate"
                    value={formData.estimatedCompletionDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Procurement Status
                  </label>
                  <select
                    name="procurementStatus"
                    value={formData.procurementStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending Approval">Pending Approval</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <User size={14} />
                    Supervisor
                  </label>
                  <select
                    name="supervisorId"
                    value={formData.supervisorId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Supervisor (Optional)</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="Additional notes for this production plan"
                    rows="2"
                  />
                </div>
              </div>

              {productionPhases.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Production Phases (Auto-populated from Project)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {productionPhases.map((phase, index) => (
                      <span 
                        key={index}
                        className="inline-block px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700 rounded-full text-xs font-medium"
                      >
                        ✓ {phase}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Production Phases Form */}
          {showStageForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap size={20} />
                  Add New Production Phase
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Phase Name
                  </label>
                  <input
                    type="text"
                    name="stageName"
                    value={newStage.stageName}
                    onChange={handleStageInputChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Machining, Assembly"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Type
                  </label>
                  <select
                    name="stageType"
                    value={newStage.stageType}
                    onChange={handleStageInputChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="in_house">In House</option>
                    <option value="outsource">Outsource</option>
                  </select>
                </div>
              </div>

              {newStage.stageType === 'in_house' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Assigned Employee
                    </label>
                    <select
                      name="assignedEmployeeId"
                      value={newStage.assignedEmployeeId}
                      onChange={handleStageInputChange}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Employee</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Facility
                    </label>
                    <select
                      name="facilityId"
                      value={newStage.facilityId}
                      onChange={handleStageInputChange}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Facility</option>
                      {facilities.map(fac => (
                        <option key={fac.id} value={fac.id}>
                          {fac.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Target Warehouse
                    </label>
                    <select
                      name="targetWarehouse"
                      value={newStage.targetWarehouse}
                      onChange={handleStageInputChange}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map(wh => (
                        <option key={wh} value={wh}>
                          {wh}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {newStage.stageType === 'outsource' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    ✓ This task will be assigned to the Production Department for outsourcing
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar size={14} />
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="plannedStartDate"
                    value={newStage.plannedStartDate}
                    onChange={handleStageInputChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar size={14} />
                    End Date
                  </label>
                  <input
                    type="date"
                    name="plannedEndDate"
                    value={newStage.plannedEndDate}
                    onChange={handleStageInputChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={newStage.notes}
                  onChange={handleStageInputChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="Notes for this stage"
                  rows="2"
                />
              </div>

              <button
                type="button"
                onClick={addStage}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
              >
                <Plus size={18} />
                Add Phase
              </button>
            </CardContent>
            </Card>
          )}

          {/* Production Phases List */}
          {formData.stages.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Production Phases ({formData.stages.length})</CardTitle>
                  {!showStageForm && (
                    <button
                      type="button"
                      onClick={() => setShowStageForm(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      <Plus size={18} />
                      Add Phase
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {formData.stages.map((stage, index) => {
                    const isEditing = editingStageId === stage.id;

                    return (
                      <div key={stage.id} className={`p-4 border rounded-lg ${stage.notes?.includes('Auto-created') ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'}`}>
                        {!isEditing ? (
                          <>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${stage.notes?.includes('Auto-created') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'}`}>
                                    {stage.notes?.includes('Auto-created') ? '⚡ Auto' : `Stage ${index + 1}`}
                                  </span>
                                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {stage.stageName}
                                  </h4>
                                  <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded">
                                    {stage.stageType === 'in_house' ? '🏭 In House' : '🚚 Outsource'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600 dark:text-slate-400">
                                  {stage.assignedEmployeeId && <p><span className="font-medium">Assigned:</span> {getEmployeeName(stage.assignedEmployeeId)}</p>}
                                  {stage.facilityId && <p><span className="font-medium">Facility:</span> {getFacilityName(stage.facilityId)}</p>}
                                  {stage.targetWarehouse && <p><span className="font-medium">Target Wh:</span> {stage.targetWarehouse}</p>}
                                  {stage.plannedStartDate && <p><span className="font-medium">Start:</span> {stage.plannedStartDate}</p>}
                                  {stage.plannedEndDate && <p><span className="font-medium">End:</span> {stage.plannedEndDate}</p>}
                                  {stage.plannedStartDate && stage.plannedEndDate && (
                                    <p><span className="font-medium">Duration:</span> {Math.ceil((new Date(stage.plannedEndDate) - new Date(stage.plannedStartDate)) / (1000 * 60 * 60 * 24))} days</p>
                                  )}
                                </div>
                              </div>
                              <div className="ml-4 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditStage(stage)}
                                  className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition"
                                  title="Edit stage"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeStage(stage.id)}
                                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                                  title="Delete stage"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="space-y-4 mb-4">
                              <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 mb-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                  Phase Name
                                </label>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                  {editedStage?.stageName}
                                </p>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                  Type
                                </label>
                                <select
                                  autoFocus
                                  value={editedStage?.stageType || 'in_house'}
                                  onChange={(e) => handleEditedStageChange('stageType', e.target.value)}
                                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                >
                                  <option value="in_house">In House</option>
                                  <option value="outsource">Outsource</option>
                                </select>
                              </div>

                              {editedStage?.stageType === 'in_house' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                      Assigned Employee
                                    </label>
                                    <select
                                      value={editedStage?.assignedEmployeeId || ''}
                                      onChange={(e) => handleEditedStageChange('assignedEmployeeId', e.target.value)}
                                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    >
                                      <option value="">Select Employee</option>
                                      {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                          {emp.username}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                      Facility
                                    </label>
                                    <select
                                      value={editedStage?.facilityId || ''}
                                      onChange={(e) => handleEditedStageChange('facilityId', e.target.value)}
                                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    >
                                      <option value="">Select Facility</option>
                                      {facilities.map(fac => (
                                        <option key={fac.id} value={fac.id}>
                                          {fac.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                      Target Warehouse
                                    </label>
                                    <select
                                      value={editedStage?.targetWarehouse || ''}
                                      onChange={(e) => handleEditedStageChange('targetWarehouse', e.target.value)}
                                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    >
                                      <option value="">Select Warehouse</option>
                                      {warehouses.map(wh => (
                                        <option key={wh} value={wh}>
                                          {wh}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              )}

                              {editedStage?.stageType === 'outsource' && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    ✓ This task will be assigned to the Production Department for outsourcing
                                  </p>
                                </div>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                                    <Calendar size={14} />
                                    Start Date
                                  </label>
                                  <input
                                    type="date"
                                    value={editedStage?.plannedStartDate || ''}
                                    onChange={(e) => handleEditedStageChange('plannedStartDate', e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                                    <Calendar size={14} />
                                    End Date
                                  </label>
                                  <input
                                    type="date"
                                    value={editedStage?.plannedEndDate || ''}
                                    onChange={(e) => handleEditedStageChange('plannedEndDate', e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                  Notes
                                </label>
                                <textarea
                                  value={editedStage?.notes || ''}
                                  onChange={(e) => handleEditedStageChange('notes', e.target.value)}
                                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  placeholder="Notes for this stage"
                                  rows="2"
                                />
                              </div>
                            </div>

                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={cancelEditStage}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              >
                                <X size={16} />
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={saveEditedStage}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
                              >
                                <Save size={16} />
                                Save
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!loading) {
                  handleSubmit(e);
                }
              }}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Production Plan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductionPlanFormPage;
