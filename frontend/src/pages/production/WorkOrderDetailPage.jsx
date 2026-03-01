import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Edit2, Trash2, Calendar, AlertCircle, CheckCircle, Clock, User, 
  Save, X, Activity, Box, FileText, Layout, ListChecks, Zap, Loader2,
  Package, Cpu, ChevronRight, Settings, Info, Truck, TrendingUp
} from 'lucide-react';
import axios from '../../utils/api';
import Swal from 'sweetalert2';
import { toast } from '../../utils/toastUtils';

const WorkOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrderDetail = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await axios.get(`/production/work-orders/${id}`);
      setOrder(response.data);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to fetch work order details');
      console.error('Error fetching work order:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await axios.put(`/production/work-orders/${id}`, {
        ...order,
        status: newStatus
      });
      await fetchOrderDetail(false);
      setIsEditingStatus(false);
      toast.success(`Work order status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/production/work-orders/${id}`);
        toast.success('Work order has been deleted.');
        navigate('/department/production/work-orders');
      } catch (error) {
        console.error('Error deleting work order:', error);
        toast.error('Failed to delete work order');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'planning': 
      case 'pending': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'on_hold': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={40} />
          <p className="text-slate-600 font-medium">Loading work order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Order</h2>
          <p className="text-slate-600 mb-6">{error || 'Work order not found'}</p>
          <button 
            onClick={() => navigate('/department/production/work-orders')}
            className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
          >
            Back to Work Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Breadcrumbs & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/department/production/work-orders')}
              className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200 group"
            >
              <ArrowLeft size={20} className="text-slate-500 group-hover:text-slate-900" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded border border-indigo-100">
                  Manufacturing Order
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {order.work_order_no}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">
                {order.item_name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/department/production/work-orders/edit/${id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-all text-sm shadow-sm"
            >
              <Edit size={16} className="text-slate-500" />
              Edit Order
            </Link>
            <button
              onClick={handleDelete}
              className="p-2 bg-white border border-slate-200 text-red-500 rounded-lg hover:bg-red-50 transition-all shadow-sm"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Core Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100/50">
                    <Info size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Work Order Information</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Basic Details</p>
                  </div>
                </div>
                <div className="relative">
                  {isEditingStatus ? (
                    <div className="flex items-center gap-2">
                      <select 
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(e.target.value)}
                        disabled={updatingStatus}
                        className="text-xs font-bold border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="planning">Planning</option>
                        <option value="in_progress">In Progress</option>
                        <option value="on_hold">On Hold</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button onClick={() => setIsEditingStatus(false)} className="p-1 text-slate-400 hover:text-slate-600">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsEditingStatus(true)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all hover:opacity-80 ${getStatusBadge(order.status)}`}
                    >
                      {order.status?.toUpperCase().replace('_', ' ')}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Production Item</label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                          <Box size={24} />
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-900">{order.item_name}</p>
                          <p className="text-xs text-slate-500 font-mono font-medium">{order.item_code}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Associated Project / SO</label>
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-indigo-500" />
                        <span className="text-sm font-bold text-slate-700">{order.project_name || 'Stock Order'}</span>
                        {order.sales_order_no && (
                          <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-bold uppercase">{order.sales_order_no}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Target Quantity</label>
                        <p className="text-lg font-black text-slate-900">{order.quantity} <span className="text-xs font-bold text-slate-400 uppercase">{order.unit}</span></p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Priority</label>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className={`w-2 h-2 rounded-full ${order.priority === 'high' ? 'bg-red-500' : order.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                          <span className={`text-xs font-bold uppercase ${order.priority === 'high' ? 'text-red-600' : order.priority === 'medium' ? 'text-amber-600' : 'text-blue-600'}`}>
                            {order.priority || 'medium'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Bill of Materials</label>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-white rounded-lg text-indigo-600 shadow-sm">
                            <ListChecks size={16} />
                          </div>
                          <span className="text-sm font-bold text-slate-700">Standard BOM Rev 1.0</span>
                        </div>
                        <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider">View BOM</button>
                      </div>
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="mt-8 p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={14} className="text-amber-600" />
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Production Notes</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Operations Sequence */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 border border-purple-100/50">
                    <Cpu size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Manufacturing Operations</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{order.operations?.length || 0} Total Stages</p>
                  </div>
                </div>
              </div>

              <div className="p-0">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sequence</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operation Name</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Workstation</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {order.operations?.length > 0 ? (
                      order.operations.map((op, idx) => (
                        <tr key={op.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-slate-400">#{(op.sequence || idx + 1).toString().padStart(2, '0')}</span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-900">{op.operation_name}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-tighter">
                              <Settings size={12} /> {op.workstation || 'General'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              op.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' :
                              op.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              'bg-slate-50 text-slate-500 border-slate-200'
                            }`}>
                              {(op.status || 'pending').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider">Manage</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <Activity size={32} className="mb-2 opacity-20" />
                            <p className="text-sm font-medium">No operations defined for this work order</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inventory Requirements */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                    <Package size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Required Materials</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{order.inventory?.length || 0} Components</span>
              </div>

              <div className="p-0">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Component</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Qty</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Source Warehouse</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {order.inventory?.length > 0 ? (
                      order.inventory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-bold text-slate-900 uppercase">{item.item_name}</p>
                              <p className="text-[10px] text-slate-400 font-mono font-medium">{item.item_code}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-700">{item.required_qty} <span className="text-[10px] font-bold text-slate-400 uppercase ml-0.5">{item.unit || 'Nos'}</span></p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Truck size={14} className="text-slate-400" />
                              <span className="text-xs font-medium uppercase tracking-tight">{item.source_warehouse || 'Main Store'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100">
                              AVAILABLE
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-10 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <Package size={32} className="mb-2 opacity-20" />
                            <p className="text-sm font-medium">No material requirements recorded</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            {/* Timeline & Progress Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar size={18} className="text-indigo-600" />
                Production Timeline
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5" />
                    <div className="w-0.5 h-12 bg-slate-100" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Planned Start</p>
                    <p className="text-sm font-bold text-slate-700">{order.planned_start_date ? new Date(order.planned_start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD'}</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-slate-200 mt-1.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estimated Completion</p>
                    <p className="text-sm font-bold text-slate-700">{order.planned_end_date ? new Date(order.planned_end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Progress</span>
                  <span className="text-xs font-black text-indigo-600">0%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full w-0 rounded-full" />
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-slate-900 rounded-2xl shadow-lg p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                <Zap size={18} className="text-yellow-400" />
                Active Controls
              </h3>
              
              <button 
                onClick={() => handleUpdateStatus('in_progress')}
                disabled={order.status === 'in_progress' || updatingStatus}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Activity size={16} />
                Release to Shop Floor
              </button>
              
              <button 
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} />
                Quality Inspection
              </button>
              
              <button 
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <Truck size={16} />
                Material Issue
              </button>
            </div>

            {/* Performance Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
               <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-green-600" />
                Performance Metrics
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Cycle Efficiency</span>
                  <span className="text-xs font-bold text-slate-900">-- %</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Resource Utilization</span>
                  <span className="text-xs font-bold text-slate-900">-- %</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Yield Rate</span>
                  <span className="text-xs font-bold text-slate-900">100 %</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderDetailPage;
