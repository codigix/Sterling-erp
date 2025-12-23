import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Play, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import axios from '../../utils/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import '../../styles/TaskPage.css';

const RootCardBuilderPage = () => {
  const [searchParams] = useSearchParams();
  const [salesOrders, setSalesOrders] = useState([]);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState(null);
  const [boms, setBoms] = useState([]);
  const [selectedBOM, setSelectedBOM] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    planName: '',
    startDate: '',
    endDate: '',
    estimatedCompletionDate: '',
    assignedSupervisor: '',
    notes: '',
    stages: [
      {
        stageName: '',
        stageSequence: 1,
        stageType: 'in_house',
        estimatedDurationDays: 1,
        estimatedDelayDays: 0,
        plannedStartDate: '',
        plannedEndDate: '',
        assignedEmployeeId: null,
        facilityId: null,
        vendorId: null,
        notes: ''
      }
    ]
  });

  const fetchSalesOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/sales/orders', { __sessionGuard: true });
      setSalesOrders(response.data.orders || []);
    } catch (err) {
      setError('Failed to load sales orders');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBOMs = useCallback(async () => {
    if (!selectedSalesOrder) return;
    try {
      const response = await axios.get('/api/engineering/bom', {
        params: { salesOrderId: selectedSalesOrder },
        __sessionGuard: true
      });
      setBoms(response.data || []);
    } catch (err) {
      console.error('Failed to fetch BOMs:', err);
    }
  }, [selectedSalesOrder]);

  const fetchEmployeesAndFacilities = useCallback(async () => {
    try {
      const [empRes, facRes] = await Promise.all([
        axios.get('/api/admin/users?role=Operator,Employee', { __sessionGuard: true }),
        axios.get('/api/inventory/facilities', { __sessionGuard: true })
      ]);
      setEmployees(empRes.data?.users || []);
      setFacilities(facRes.data || []);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    }
  }, []);

  const fetchProductions = useCallback(async () => {
    if (!selectedSalesOrder) return;
    try {
      const response = await axios.get('/api/production/plans', {
        params: { projectId: selectedSalesOrder },
        __sessionGuard: true
      });
      setProductions(response.data || []);
    } catch (err) {
      console.error('Failed to fetch productions:', err);
    }
  }, [selectedSalesOrder]);

  useEffect(() => {
    fetchSalesOrders();
    fetchEmployeesAndFacilities();
  }, [fetchSalesOrders, fetchEmployeesAndFacilities]);

  useEffect(() => {
    fetchBOMs();
    fetchProductions();
  }, [selectedSalesOrder, fetchBOMs, fetchProductions]);

  const handleStageChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.map((stage, i) =>
        i === index ? { ...stage, [field]: value } : stage
      )
    }));
  };

  const addStage = () => {
    setFormData(prev => ({
      ...prev,
      stages: [...prev.stages, {
        stageName: '',
        stageSequence: prev.stages.length + 1,
        stageType: 'in_house',
        estimatedDurationDays: 1,
        estimatedDelayDays: 0,
        plannedStartDate: '',
        plannedEndDate: '',
        assignedEmployeeId: null,
        facilityId: null,
        vendorId: null,
        notes: ''
      }]
    }));
  };

  const removeStage = (index) => {
    if (formData.stages.length === 1) return;
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.filter((_, i) => i !== index)
    }));
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!selectedSalesOrder || !formData.planName || formData.stages.some(s => !s.stageName)) {
      setError('Please fill all required fields');
      return;
    }

    try {
      await axios.post('/api/production/plans', {
        projectId: selectedSalesOrder,
        planName: formData.planName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        estimatedCompletionDate: formData.estimatedCompletionDate,
        assignedSupervisor: formData.assignedSupervisor,
        notes: formData.notes,
        stages: formData.stages
      }, { __sessionGuard: true });

      resetForm();
      fetchProductions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create production plan');
    }
  };

  const handleStartProduction = async (planId) => {
    try {
      await axios.patch(`/api/production/plans/${planId}/status`, {
        status: 'in_progress'
      }, { __sessionGuard: true });
      fetchProductions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start production');
    }
  };

  const resetForm = () => {
    setFormData({
      planName: '',
      startDate: '',
      endDate: '',
      estimatedCompletionDate: '',
      assignedSupervisor: '',
      notes: '',
      stages: [{
        stageName: '',
        stageSequence: 1,
        stageType: 'in_house',
        estimatedDurationDays: 1,
        estimatedDelayDays: 0,
        plannedStartDate: '',
        plannedEndDate: '',
        assignedEmployeeId: null,
        facilityId: null,
        vendorId: null,
        notes: ''
      }]
    });
    setShowForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="task-page-container">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-4 text-red-600 hover:text-red-700">×</button>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium  dark: mb-2">
          Select Sales Order
        </label>
        <select
          value={selectedSalesOrder || ''}
          onChange={(e) => setSelectedSalesOrder(Number(e.target.value))}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:"
        >
          <option value="">Select an order...</option>
          {salesOrders.map(order => (
            <option key={order.id} value={order.id}>
              SO-{String(order.id).padStart(4, '0')} - {order.customer}
            </option>
          ))}
        </select>
      </div>

      {selectedSalesOrder && (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium  dark: mb-2">
              Select BOM (Bill of Materials)
            </label>
            <select
              value={selectedBOM || ''}
              onChange={(e) => setSelectedBOM(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:"
            >
              <option value="">Select a BOM...</option>
              {boms.map(bom => (
                <option key={bom.id} value={bom.id}>
                  {bom.bom_name}
                </option>
              ))}
            </select>
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center text-xs gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors mb-6"
            >
              <Plus size={18} />
              Create Production Plan
            </button>
          )}

          {showForm && (
            <Card className="mb-6 p-6">
              <h3 className="text-lg font-bold  dark: mb-4">Create Root Card Production Plan</h3>
              <form onSubmit={handleCreatePlan} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Plan Name *
                    </label>
                    <input
                      type="text"
                      value={formData.planName}
                      onChange={(e) => setFormData(prev => ({ ...prev, planName: e.target.value }))}
                      placeholder="e.g., Production Plan Q1 2025"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Supervisor
                    </label>
                    <select
                      value={formData.assignedSupervisor}
                      onChange={(e) => setFormData(prev => ({ ...prev, assignedSupervisor: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:"
                    >
                      <option value="">Select supervisor...</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Estimated Completion
                    </label>
                    <input
                      type="date"
                      value={formData.estimatedCompletionDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedCompletionDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about this production plan"
                    rows="3"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:"
                  />
                </div>

                <div>
                  <div className="flex items-center text-xs justify-between mb-4">
                    <h4 className="text-md font-semibold  dark:">Production Stages</h4>
                    <button
                      type="button"
                      onClick={addStage}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      + Add Stage
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.stages.map((stage, idx) => (
                      <div key={idx} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h5 className="font-medium  dark:">Stage {idx + 1}</h5>
                          {formData.stages.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeStage(idx)}
                              className="text-red-600 hover:bg-red-50 p-1 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                              Stage Name *
                            </label>
                            <input
                              type="text"
                              value={stage.stageName}
                              onChange={(e) => handleStageChange(idx, 'stageName', e.target.value)}
                              placeholder="e.g., Machining"
                              className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700  dark:"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                              Stage Type *
                            </label>
                            <select
                              value={stage.stageType}
                              onChange={(e) => handleStageChange(idx, 'stageType', e.target.value)}
                              className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700  dark:"
                            >
                              <option value="in_house">In-House</option>
                              <option value="outsource">Outsource</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                              Duration (days)
                            </label>
                            <input
                              type="number"
                              value={stage.estimatedDurationDays}
                              onChange={(e) => handleStageChange(idx, 'estimatedDurationDays', Number(e.target.value))}
                              min="1"
                              className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700  dark:"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                              Estimated Delay (days)
                            </label>
                            <input
                              type="number"
                              value={stage.estimatedDelayDays}
                              onChange={(e) => handleStageChange(idx, 'estimatedDelayDays', Number(e.target.value))}
                              min="0"
                              className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700  dark:"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                              Planned Start
                            </label>
                            <input
                              type="date"
                              value={stage.plannedStartDate}
                              onChange={(e) => handleStageChange(idx, 'plannedStartDate', e.target.value)}
                              className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700  dark:"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                              Planned End
                            </label>
                            <input
                              type="date"
                              value={stage.plannedEndDate}
                              onChange={(e) => handleStageChange(idx, 'plannedEndDate', e.target.value)}
                              className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700  dark:"
                            />
                          </div>

                          {stage.stageType === 'in_house' ? (
                            <>
                              <div>
                                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                                  Assign Employee
                                </label>
                                <select
                                  value={stage.assignedEmployeeId || ''}
                                  onChange={(e) => handleStageChange(idx, 'assignedEmployeeId', e.target.value ? Number(e.target.value) : null)}
                                  className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700  dark:"
                                >
                                  <option value="">Select employee...</option>
                                  {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                                  Assign Facility
                                </label>
                                <select
                                  value={stage.facilityId || ''}
                                  onChange={(e) => handleStageChange(idx, 'facilityId', e.target.value ? Number(e.target.value) : null)}
                                  className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700  dark:"
                                >
                                  <option value="">Select facility...</option>
                                  {facilities.map(fac => (
                                    <option key={fac.id} value={fac.id}>{fac.name}</option>
                                  ))}
                                </select>
                              </div>
                            </>
                          ) : (
                            <div>
                              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                                Vendor (Auto-generate outward challan)
                              </label>
                              <select
                                value={stage.vendorId || ''}
                                onChange={(e) => handleStageChange(idx, 'vendorId', e.target.value ? Number(e.target.value) : null)}
                                className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700  dark:"
                              >
                                <option value="">Select vendor...</option>
                                {/* Would filter for vendor role users */}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Create Production Plan
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 rounded-lg  dark:bg-slate-600  dark: hover:bg-slate-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Card>
          )}

          <Card>
            <h3 className="text-lg font-bold  dark: mb-4 px-6 pt-4">Production Plans</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">Plan Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">Start Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">End Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-6 text-center text-sm text-slate-500">
                        No production plans created yet
                      </td>
                    </tr>
                  )}
                  {productions.map(prod => (
                    <tr key={prod.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition-colors">
                      <td className="p-1 text-sm font-medium  dark:">{prod.plan_name}</td>
                      <td className="p-1 text-sm text-slate-700 dark:text-slate-300">{prod.start_date ? new Date(prod.start_date).toLocaleDateString() : '-'}</td>
                      <td className="p-1 text-sm text-slate-700 dark:text-slate-300">{prod.end_date ? new Date(prod.end_date).toLocaleDateString() : '-'}</td>
                      <td className="p-1">
                        <Badge className={`flex items-center text-xs gap-1 w-fit ${getStatusColor(prod.status)}`}>
                          {prod.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="p-1">
                        {prod.status === 'draft' && (
                          <button
                            onClick={() => handleStartProduction(prod.id)}
                            className="flex items-center text-xs gap-2 px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm"
                          >
                            <Play size={14} />
                            START PRODUCTION
                          </button>
                        )}
                        {prod.status === 'in_progress' && (
                          <span className="flex items-center text-xs gap-2 text-sm text-purple-600 dark:text-purple-400">
                            <Clock size={14} />
                            Running...
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default RootCardBuilderPage;
