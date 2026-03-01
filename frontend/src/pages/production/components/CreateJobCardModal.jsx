import React, { useState, useEffect } from 'react';
import { X, Calendar, ClipboardList, User, Layers, Box, Hash, Activity, Users } from 'lucide-react';
import axios from '../../../utils/api';
import { showSuccess, showError } from '../../../utils/toastUtils';
import Swal from 'sweetalert2';

const CreateJobCardModal = ({ isOpen, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [workOrders, setWorkOrders] = useState([]);
  const [workstations, setWorkstations] = useState([]);
  const [operators, setOperators] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [predefinedOperations, setPredefinedOperations] = useState([]);
  
  const [formData, setFormData] = useState({
    workOrderId: '',
    operationName: '',
    workstation: '',
    operatorId: '',
    vendorId: '',
    type: 'in-house',
    quantity: '',
    status: 'pending',
    plannedStartDate: new Date().toISOString().split('T')[0],
    plannedEndDate: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  const fetchInitialData = async () => {
    try {
      const [woRes, wsRes, opRes, vRes] = await Promise.all([
        axios.get('/production/work-orders'),
        axios.get('/inventory/facilities'),
        axios.get('/production/portal/employees'),
        axios.get('/inventory/vendors')
      ]);
      
      setWorkOrders(woRes.data || []);
      setWorkstations(wsRes.data?.facilities || []);
      setOperators(opRes.data || []);
      setVendors(vRes.data || []);
    } catch (error) {
      console.error('Error fetching modal data:', error);
    }
  };

  const handleWorkOrderChange = async (e) => {
    const woId = e.target.value;
    setFormData({ ...formData, workOrderId: woId, operationName: '' });
    
    if (woId) {
      try {
        const response = await axios.get(`/production/work-orders/${woId}`);
        const wo = response.data;
        setSelectedWorkOrder(wo);
        setPredefinedOperations(wo.operations || []);
        setFormData(prev => ({ 
          ...prev, 
          workOrderId: woId,
          quantity: wo.quantity || '' 
        }));
      } catch (error) {
        console.error('Error fetching work order details:', error);
      }
    } else {
      setSelectedWorkOrder(null);
      setPredefinedOperations([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validation
      if (!formData.workOrderId || !formData.operationName || !formData.quantity) {
        showError('Please fill in all required fields');
        return;
      }

      await axios.post('/production/work-orders/operations', {
        ...formData,
        sequence: predefinedOperations.findIndex(op => op.operation_name === formData.operationName) + 1 || 1
      });

      showSuccess('Job card created successfully');
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error creating job card:', error);
      showError(error.response?.data?.message || 'Failed to create job card');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ClipboardList size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Create Job Card</h3>
              <p className="text-xs text-slate-500 font-medium">Manually generate a production operation</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body - Scrollable if needed */}
        <div className="overflow-y-auto max-h-[calc(100vh-160px)]">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {/* Work Order Select */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Work Order *</label>
                <div className="relative group">
                  <Box size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <select
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-700"
                    value={formData.workOrderId}
                    onChange={handleWorkOrderChange}
                    required
                  >
                    <option value="">Select Work Order</option>
                    {workOrders.map(wo => (
                      <option key={wo.id} value={wo.id}>{wo.work_order_no} - {wo.item_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Workstation Select */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Workstation *</label>
                <div className="relative group">
                  <Layers size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <select
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-700"
                    value={formData.workstation}
                    onChange={(e) => setFormData({ ...formData, workstation: e.target.value })}
                    required
                  >
                    <option value="">Select Workstation</option>
                    {workstations.map(ws => (
                      <option key={ws.id} value={ws.name}>{ws.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Operator Select */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Operator</label>
                <div className="relative group">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <select
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-700"
                    value={formData.operatorId}
                    onChange={(e) => setFormData({ ...formData, operatorId: e.target.value })}
                  >
                    <option value="">Select Operator</option>
                    {operators.map(op => (
                      <option key={op.id} value={op.id}>
                        {op.name} {op.employee_id ? `(${op.employee_id})` : ''} {op.department ? `- ${op.department}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Operation Select */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Operation *</label>
                <div className="relative group">
                  <Activity size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <select
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-700 disabled:opacity-50"
                    value={formData.operationName}
                    onChange={(e) => {
                      const opName = e.target.value;
                      const op = predefinedOperations.find(o => o.operation_name === opName);
                      setFormData({ 
                        ...formData, 
                        operationName: opName,
                        type: op ? (op.type || 'in-house') : formData.type,
                        vendorId: op ? (op.vendor_id || '') : ''
                      });
                    }}
                    required
                    disabled={!selectedWorkOrder}
                  >
                    <option value="">{selectedWorkOrder ? 'Select Operation' : 'Select Work Order first'}</option>
                    {predefinedOperations.map((op, idx) => (
                      <option key={idx} value={op.operation_name}>{op.operation_name}</option>
                    ))}
                    <option value="Custom">Custom Operation...</option>
                  </select>
                </div>
                {formData.operationName === 'Custom' && (
                  <input
                    type="text"
                    placeholder="Enter custom operation name"
                    className="w-full mt-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    onChange={(e) => setFormData({ ...formData, operationName: e.target.value })}
                  />
                )}
              </div>

              {/* Quantity */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Quantity *</label>
                <div className="relative group">
                  <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="number"
                    step="0.000001"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Status */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-700"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="pending">Draft</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>

              {/* Type */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Operation Type</label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-700"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value, operatorId: e.target.value === 'outsource' ? '' : formData.operatorId })}
                >
                  <option value="in-house">In-House</option>
                  <option value="outsource">Outsource</option>
                </select>
              </div>

              {/* Vendor Select (Shows for Outsource) */}
              {formData.type === 'outsource' && (
                <div className="col-span-2 md:col-span-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Assign Vendor *</label>
                  <div className="relative group">
                    <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <select
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-indigo-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700"
                      value={formData.vendorId}
                      onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                      required
                    >
                      <option value="">Select Vendor</option>
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.name} ({v.category || 'Vendor'})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date *</label>
                <div className="relative group">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="date"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-700"
                    value={formData.plannedStartDate}
                    onChange={(e) => setFormData({ ...formData, plannedStartDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">End Date</label>
                <div className="relative group">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="date"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-700"
                    value={formData.plannedEndDate}
                    onChange={(e) => setFormData({ ...formData, plannedEndDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Notes</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all min-h-[100px] text-slate-700 font-medium"
                  placeholder="Enter any additional instructions or notes here..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Create Job Card
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateJobCardModal;
