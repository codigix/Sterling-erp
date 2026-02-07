import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/api';
import { 
  Search, 
  Filter, 
  Clock, 
  Plus,
  ChevronDown,
  ChevronUp,
  FileText,
  ClipboardList,
  Activity,
  Zap,
  Play,
  Edit2,
  Trash2,
  CheckCircle,
  Box,
  Layers,
  LayoutDashboard,
  TrendingUp,
  Users
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import CreateJobCardModal from './components/CreateJobCardModal';
import InlineOperationEdit from './components/InlineOperationEdit';

const JobCardsPage = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOperationId, setEditingOperationId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.workOrderId) {
      const orderId = parseInt(location.state.workOrderId);
      setExpandedOrders(new Set([orderId]));
      
      // Scroll to the specific job card after a short delay to ensure list is rendered
      setTimeout(() => {
        const element = document.getElementById(`work-order-${orderId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [location.state]);

  const fetchJobCards = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/production/work-orders/job-cards', {
        params: {
          search: searchTerm,
          status: statusFilter === 'all' ? undefined : statusFilter
        }
      });
      setWorkOrders(response.data || []);
      
      // Auto-expand all for now if searching
      if (searchTerm) {
        setExpandedOrders(new Set(response.data.map(wo => wo.id)));
      }
    } catch (error) {
      console.error('Error fetching job cards:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchJobCards();
  }, [fetchJobCards]);

  const handleStartOperation = async (operation) => {
    try {
      const result = await Swal.fire({
        title: 'Start Operation?',
        text: 'This will move the operation to in-progress status.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Start!'
      });

      if (result.isConfirmed) {
        await axios.post(`/production/work-orders/operations/${operation.id}/start`, {
          operatorId: operation.operator_id,
          workstationId: operation.workstation_id
        });
        Swal.fire({
          title: 'Started!',
          text: 'Operation is now in production.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        
        // Redirect to Production Entry page
        navigate(`/department/production/operations/${operation.id}/entry`);
      }
    } catch (error) {
      console.error('Error starting operation:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to start operation';
      Swal.fire('Error', errorMessage, 'error');
    }
  };

  const handleDeleteOperation = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this operational step!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await axios.delete(`/production/work-orders/operations/${id}`);
        Swal.fire('Deleted!', 'Operation has been removed.', 'success');
        fetchJobCards();
        setEditingOperationId(null);
      }
    } catch (error) {
      console.error('Error deleting operation:', error);
      Swal.fire('Error', 'Failed to delete operation', 'error');
    }
  };

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'draft': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'on_hold': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-200">
              <ClipboardList size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">Job Cards</h1>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase tracking-wider border border-blue-100">
                  Live Operations
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                  Manufacturing Intelligence <ChevronDown size={12} className="rotate-270" /> Operational Controls
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  System Status: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium">
               <Trash2 size={16} />
               Reset Queue
             </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-black transition-all text-sm shadow-sm"
            >
              <Plus size={18} />
              Create Job Card
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-300 transition-colors">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Operations</p>
              <h3 className="text-2xl font-black text-slate-900">
                {workOrders.reduce((acc, wo) => acc + (wo.operations?.length || 0), 0)}
              </h3>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Active Work Orders</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Layers size={22} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-amber-300 transition-colors">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">In Production</p>
              <h3 className="text-2xl font-black text-slate-900">
                {workOrders.reduce((acc, wo) => acc + (wo.operations?.filter(op => op.status === 'in_progress').length || 0), 0)}
              </h3>
              <p className="text-[10px] text-emerald-500 mt-1 font-bold flex items-center gap-1">
                <Activity size={10} /> +12% Current Throughput
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
              <Zap size={22} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-green-300 transition-colors">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Completed</p>
              <h3 className="text-2xl font-black text-slate-900">
                {workOrders.reduce((acc, wo) => acc + (wo.operations?.filter(op => op.status === 'completed').length || 0), 0)}
              </h3>
              <p className="text-[10px] text-emerald-500 mt-1 font-bold flex items-center gap-1">
                <CheckCircle size={10} /> +5% Finalized Today
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all">
              <CheckCircle size={22} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-colors">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Completion Rate</p>
              <h3 className="text-2xl font-black text-slate-900">0%</h3>
              <p className="text-[10px] text-slate-500 mt-1 font-medium text-indigo-500">Work Order Progress</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <TrendingUp size={22} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-2xl">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Work Order ID or Item name..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
             <div className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-3">
                <Filter size={16} className="text-slate-400" />
                <select 
                  className="bg-transparent text-sm font-bold text-slate-700 outline-none min-w-[150px]"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Operational States</option>
                  <option value="draft">Draft</option>
                  <option value="in_progress">In Production</option>
                  <option value="completed">Completed</option>
                </select>
             </div>
          </div>
        </div>

        {/* Work Order Cards with Operations */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 font-medium shadow-sm">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              Loading manufacturing operations...
            </div>
          ) : workOrders.length === 0 ? (
            <div className="bg-white p-16 rounded-2xl border border-slate-200 text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Box size={40} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No operations found</h3>
              <p className="text-slate-500 mt-1 max-w-xs mx-auto">Try adjusting your filters or create a new work order to start production.</p>
            </div>
          ) : (
            workOrders.map((wo) => (
              <div key={wo.id} id={`work-order-${wo.id}`} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Work Order Header */}
                <div 
                  className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${expandedOrders.has(wo.id) ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}
                  onClick={() => toggleExpand(wo.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                      <Box size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-sm font-bold text-slate-900">{wo.item_name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(wo.status)}`}>
                          {wo.status}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">
                        {wo.work_order_no}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-12">
                     <div className="hidden md:block">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Priority Level</p>
                        <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-full border ${getPriorityBadge(wo.priority)}`}>
                          {wo.priority}
                        </span>
                     </div>
                     <div className="hidden md:block">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Quantity</p>
                        <p className="text-[11px] font-bold text-slate-900">{wo.quantity} <span className="text-slate-400 font-medium">Units</span></p>
                     </div>
                     <div className="hidden md:block">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Scheduled End</p>
                        <p className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                          <Clock size={12} className="text-indigo-500" />
                          {wo.planned_end_date ? new Date(wo.planned_end_date).toLocaleDateString() : '-'}
                        </p>
                     </div>
                     <button className="p-2 text-slate-400 hover:text-slate-600">
                        {expandedOrders.has(wo.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                     </button>
                  </div>
                </div>

                {/* Operations List */}
                {expandedOrders.has(wo.id) && (
                  <div className="border-t border-slate-100 bg-slate-50/30 p-4 space-y-3">
                    <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <div className="col-span-4">Operational Phase</div>
                      <div className="col-span-3">Assignment</div>
                      <div className="col-span-1">Status</div>
                      <div className="col-span-2 text-center">Metrics</div>
                      <div className="col-span-2 text-right">Action</div>
                    </div>
                    
                    {wo.operations?.length > 0 ? (
                      wo.operations.map((op) => (
                        <React.Fragment key={op.id}>
                          {editingOperationId === op.id ? (
                            <InlineOperationEdit 
                              operation={op} 
                              workOrderId={wo.id}
                              workOrderQuantity={wo.quantity}
                              onCancel={() => setEditingOperationId(null)}
                              onSave={() => {
                                setEditingOperationId(null);
                                fetchJobCards();
                              }}
                              onDelete={handleDeleteOperation}
                            />
                          ) : (
                            <div className="grid grid-cols-12 items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm group hover:border-blue-200 transition-all">
                              <div className="col-span-4 flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                  <Activity size={18} />
                                </div>
                                <div>
                                  <div className="text-[13px] font-bold text-slate-900 opacity-100">{op.operation_name}</div>
                                  <p className="text-[10px] font-medium text-slate-400 mt-0.5 uppercase tracking-tighter">
                                    JC-{op.id}-{op.created_at ? new Date(op.created_at).getTime().toString(36) : 'new'}
                                  </p>
                                </div>
                              </div>

                              <div className="col-span-3">
                                <div className="flex items-center gap-2 text-slate-600">
                                  <Layers size={14} className="text-slate-400" />
                                  <span className="text-[11px] font-bold">{op.workstation || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1.5 text-slate-400">
                                  <Users size={14} />
                                  <span className="text-[10px] font-medium italic">
                                    {op.operator_name || 'Unassigned'}
                                  </span>
                                </div>
                              </div>

                              <div className="col-span-1">
                                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(op.status)}`}>
                                  <FileText size={10} />
                                  {op.status}
                                </div>
                              </div>

                              <div className="col-span-2 text-center">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Quality Yield <span className="text-blue-600 ml-1">0%</span></p>
                                <div className="flex items-center justify-center gap-2 mt-1">
                                  <span className="text-[11px] font-black text-slate-400">0.00</span>
                                  <div className="h-1 w-12 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-0" />
                                  </div>
                                  <span className="text-[11px] font-black text-slate-900">{wo.quantity}.00</span>
                                </div>
                              </div>

                              <div className="col-span-2 flex items-center justify-end gap-2">
                                {op.status === 'in_progress' ? (
                                  <button 
                                    onClick={() => navigate(`/department/production/operations/${op.id}/entry`)}
                                    className="p-1.5 bg-indigo-600 text-white rounded-lg transition-all shadow-sm hover:shadow-indigo-200"
                                    title="Production Entry"
                                  >
                                    <Zap size={18} fill="white" />
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleStartOperation(op)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[11px] font-black hover:bg-emerald-600 hover:text-white transition-all"
                                  >
                                    <Play size={14} fill="currentColor" />
                                    Start
                                  </button>
                                )}
                                <button 
                                  onClick={() => setEditingOperationId(op.id)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteOperation(op.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
                         <ClipboardList size={24} className="text-slate-300 mx-auto mb-2" />
                         <p className="text-xs font-medium text-slate-400">No job cards available for this work order.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <CreateJobCardModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchJobCards}
      />
    </div>
  );
};

export default JobCardsPage;
