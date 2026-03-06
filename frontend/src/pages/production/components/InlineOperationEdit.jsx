import React, { useState, useEffect } from 'react';
import { Calendar, Layers, User, Users, Activity, Hash, X, Check, Trash2 } from 'lucide-react';
import axios from '../../../utils/api';
import { toast } from '../../../utils/toastUtils';

const InlineOperationEdit = ({ operation, workOrderQuantity, onCancel, onSave, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [workstations, setWorkstations] = useState([]);
  const [operators, setOperators] = useState([]);
  const [vendors, setVendors] = useState([]);
  
  const [formData, setFormData] = useState({
    operationName: operation.operation_name || '',
    workstation: operation.workstation || '',
    operatorId: operation.operator_id || '',
    vendorId: operation.vendor_id || '',
    type: operation.type || 'in-house',
    status: operation.status || 'pending',
    plannedQty: operation.quantity || workOrderQuantity || 0,
    producedQty: operation.produced_qty || 0,
    plannedStartDate: operation.planned_start_date ? new Date(operation.planned_start_date).toISOString().split('T')[0] : '',
    plannedEndDate: operation.planned_end_date ? new Date(operation.planned_end_date).toISOString().split('T')[0] : '',
    notes: operation.notes || ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [wsRes, opRes, vRes] = await Promise.all([
        axios.get('/production/workstations'),
        axios.get('/production/portal/employees'),
        axios.get('/inventory/vendors')
      ]);
      setWorkstations(wsRes.data?.workstations || []);
      setOperators(opRes.data || []);
      setVendors(vRes.data || []);
    } catch (error) {
      console.error('Error fetching inline edit data:', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(`/production/work-orders/operations/${operation.id}`, formData);
      toast.success('Operational step has been modified.');
      onSave();
    } catch (error) {
      console.error('Error updating operation:', error);
      toast.error('Failed to update operation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-span-12 mt-2 mb-4 animate-in slide-in-from-top-2 duration-200">
      <div className="bg-blue-50/50 border-2 border-blue-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-blue-600 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <div className="p-1 bg-white/20 rounded-md">
              <Activity size={14} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Modify Operational Step</span>
            <span className="text-[10px] opacity-70 font-mono">JC-{operation.id}</span>
          </div>
          <button 
            onClick={onCancel}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Operation */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Operation</label>
              <div className="relative group">
                <Activity size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={formData.operationName}
                  onChange={(e) => setFormData({ ...formData, operationName: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Workstation */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Workstation</label>
              <div className="relative">
                <Layers size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={formData.workstation}
                  onChange={(e) => setFormData({ ...formData, workstation: e.target.value })}
                >
                  <option value="">Select Workstation</option>
                  {workstations.map(ws => (
                    <option key={ws.id} value={ws.display_name}>{ws.display_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
              <select
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Type</label>
              <select
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value, operatorId: e.target.value === 'outsource' ? '' : formData.operatorId })}
              >
                <option value="in-house">In-House</option>
                <option value="outsource">Outsource</option>
              </select>
            </div>

            {/* Vendor (Shows for Outsource) */}
            {formData.type === 'outsource' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Vendor</label>
                <div className="relative">
                  <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    className="w-full pl-9 pr-3 py-2 bg-white border border-indigo-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={formData.vendorId}
                    onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                    required
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Operator (Shows for In-House) */}
            {formData.type === 'in-house' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Operator</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={formData.operatorId}
                    onChange={(e) => setFormData({ ...formData, operatorId: e.target.value })}
                  >
                    <option value="">Select Operator</option>
                    {operators.map(op => (
                      <option key={op.id} value={op.id}>
                        {op.name} {op.employee_id ? `(${op.employee_id})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Planned Qty */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Planned Qty</label>
              <div className="relative">
                <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                  value={formData.plannedQty}
                  disabled
                />
              </div>
            </div>

            {/* Produced Qty */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Produced Qty</label>
              <div className="relative">
                <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={formData.producedQty}
                  onChange={(e) => setFormData({ ...formData, producedQty: e.target.value })}
                />
              </div>
              <p className="text-[9px] text-emerald-600 font-bold mt-1">Limit: {formData.plannedQty}.00</p>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Start Date</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={formData.plannedStartDate}
                  onChange={(e) => setFormData({ ...formData, plannedStartDate: e.target.value })}
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">End Date</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={formData.plannedEndDate}
                  onChange={(e) => setFormData({ ...formData, plannedEndDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-4 border-t border-blue-100">
             <button
                type="button"
                onClick={() => onDelete(operation.id)}
                className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-xs font-bold transition-all"
              >
                <Trash2 size={14} />
                Delete Step
              </button>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg transition-all"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  Commit Changes
                </button>
              </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InlineOperationEdit;
