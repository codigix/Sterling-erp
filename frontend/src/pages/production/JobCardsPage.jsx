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
  Users,
  AlertTriangle,
  AlertCircle,
  Truck,
  X,
  Package,
  Eye
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { showSuccess, showError, showWarning } from '../../utils/toastUtils';
import CreateJobCardModal from './components/CreateJobCardModal';
import InlineOperationEdit from './components/InlineOperationEdit';
import JobCardDetailsModal from './components/JobCardDetailsModal';
import OutwardChallanForm from '../../components/outsourcing/OutwardChallanForm';
import InwardChallanForm from '../../components/outsourcing/InwardChallanForm';

const JobCardsPage = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [jobCards, setJobCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOperationId, setEditingOperationId] = useState(null);

  // Outward Challan Modal State
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOperationForDetails, setSelectedOperationForDetails] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [fetchingMaterials, setFetchingMaterials] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axios.get('/inventory/vendors');
      setVendors(response.data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchWorkOrderMaterials = async (workOrderId) => {
    try {
      setFetchingMaterials(true);
      const response = await axios.get(`/production/outsourcing/work-order/${workOrderId}/materials`);
      setMaterials(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setFetchingMaterials(false);
    }
  };

  const handleOpenChallanModal = (operation, workOrder) => {
    setSelectedOperation(operation);
    setSelectedWorkOrder(workOrder);
    fetchWorkOrderMaterials(workOrder.id);
    setIsChallanModalOpen(true);
  };

  const handleOpenInwardModal = (operation, workOrder) => {
    setSelectedOperation(operation);
    setSelectedWorkOrder(workOrder);
    setIsInwardModalOpen(true);
  };

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
      const params = new URLSearchParams(location.search);
      const salesOrderId = params.get('salesOrderId');
      const rootCardId = params.get('rootCardId');

      const response = await axios.get('/production/work-orders/job-cards', {
        params: {
          search: searchTerm,
          status: statusFilter === 'all' ? undefined : statusFilter,
          salesOrderId: salesOrderId,
          rootCardId: rootCardId,
          workOrderId: location.state?.workOrderId || undefined
        }
      });

      const orders = response.data || [];
      setWorkOrders(orders);

      // Flatten operations into jobCards
      const flattened = [];
      orders.forEach(wo => {
        if (wo.operations && Array.isArray(wo.operations)) {
          // Sort operations by sequence if available, otherwise by ID
          const sortedOps = [...wo.operations].sort((a, b) => (a.sequence || a.id) - (b.sequence || b.id));
          
          // Find the first operation that is not completed
          const firstIncompleteOp = sortedOps.find(op => op.status !== 'completed');
          
          sortedOps.forEach(op => {
            flattened.push({
              ...op,
              work_order_no: wo.work_order_no,
              work_order_item: wo.item_name,
              work_order_full_qty: wo.quantity,
              is_material_ready: wo.is_material_ready,
              sales_order_no: wo.sales_order_no,
              is_current_op: firstIncompleteOp ? firstIncompleteOp.id === op.id : false
            });
          });
        }
      });
      setJobCards(flattened);

      // Auto-expand all for now if searching
      if (searchTerm) {
        setExpandedOrders(new Set(orders.map(wo => wo.id)));
      }
    } catch (error) {
      console.error('Error fetching job cards:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, location.state]);

  useEffect(() => {
    fetchJobCards();
  }, [fetchJobCards]);

  const handleStartOperation = async (operation) => {
    if (!operation.operator_id) {
      showWarning('Please assign an operator before starting the operation.');
      setEditingOperationId(operation.id);
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Start Operation?',
        text: 'This will move the operation to in-progress status and assign the task to the operator.',
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

        showSuccess('Operation is now in-progress. Task assigned to operator.');

        fetchJobCards();
      }
    } catch (error) {
      console.error('Error starting operation:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to start operation';
      showError(errorMessage);
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
        showSuccess('Operation has been removed.');
        fetchJobCards();
        setEditingOperationId(null);
      }
    } catch (error) {
      console.error('Error deleting operation:', error);
      showError('Failed to delete operation');
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
      case 'completed': return 'text-green-600 font-bold';
      case 'in_progress': return 'text-orange-500 font-bold';
      case 'ready': return 'text-blue-500 font-bold';
      case 'draft': return 'text-slate-500 font-bold';
      case 'on_hold': return 'text-amber-600 font-bold';
      default: return 'text-slate-500 font-bold';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'in_progress': return 'In-Progress';
      case 'ready': return 'Ready';
      case 'draft': return 'Draft';
      case 'completed': return 'Completed';
      case 'pending': return 'Ready';
      default: return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Draft';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'outsource': return 'text-orange-500';
      case 'subcontract': return 'text-orange-500';
      case 'in-house': return 'text-blue-500';
      default: return 'text-blue-500';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'outsource': return 'Outsource';
      case 'subcontract': return 'Outsource';
      case 'in-house': return 'In-house';
      default: return 'In-house';
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

        {/* Job Cards Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-12 items-center px-6 py-4 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider gap-2">
              <div className="col-span-1">Job Card ID</div>
              <div className="col-span-2">Operation</div>
              <div className="col-span-1 whitespace-normal">Status</div>
              <div className="col-span-1 text-center whitespace-normal">Execution Mode</div>
              <div className="col-span-1 text-center whitespace-normal">Qty To Man.</div>
              <div className="col-span-1 text-center whitespace-normal">Produced Qty</div>
              <div className="col-span-1 text-center whitespace-normal">Accepted Qty</div>
              <div className="col-span-1 text-center whitespace-normal leading-tight">Workstation / Vendor</div>
              <div className="col-span-1 text-center whitespace-normal">Assignee</div>
              <div className="col-span-2 text-right px-4">Actions</div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                Loading job cards...
              </div>
            ) : jobCards.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                No job cards found
              </div>
            ) : (
              jobCards.map((op) => (
                <React.Fragment key={op.id}>
                  {editingOperationId === op.id ? (
                    <div className="p-6 bg-blue-50/30 border-b border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                      <InlineOperationEdit
                        operation={op}
                        workOrderQuantity={op.work_order_qty}
                        onCancel={() => setEditingOperationId(null)}
                        onSave={() => {
                          setEditingOperationId(null);
                          fetchJobCards();
                        }}
                        onDelete={handleDeleteOperation}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-12 items-center px-6 py-5 hover:bg-slate-50 transition-all group border-b border-slate-50 last:border-0 gap-2">
                      {/* ID */}
                      <div className="col-span-1">
                        <div className="text-[11px] font-black text-blue-600 hover:text-blue-700 cursor-pointer mb-0.5 tracking-tight break-all">
                          JC-{op.work_order_no?.split('-')?.pop() || op.work_order_id}-{op.id}
                        </div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter truncate">
                          Ref: {op.work_order_no}
                        </div>
                      </div>

                      {/* Operation */}
                      <div className="col-span-2">
                        <div className="text-[13px] font-black text-slate-900 leading-tight mb-0.5">{op.operation_name}</div>
                        <div className="text-[10px] text-slate-500 font-medium truncate italic" title={op.work_order_item}>
                          {op.work_order_item}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-1">
                        <span className={`text-[11px] font-black ${getStatusBadge(op.status)}`}>
                          {getStatusText(op.status)}
                        </span>
                      </div>

                      {/* Execution */}
                      <div className="col-span-1 text-center">
                        <span className={`text-[11px] font-black ${getTypeColor(op.type)}`}>
                          {getTypeText(op.type)}
                        </span>
                      </div>

                      {/* Qty To Man */}
                      <div className="col-span-1 text-center">
                        <div className="text-[12px] font-black text-slate-700">
                          {parseFloat(op.quantity || 0).toFixed(2)}
                        </div>
                        <div className="text-[9px] text-slate-400 font-medium">units</div>
                      </div>

                      {/* Produced Qty */}
                      <div className="col-span-1 text-center">
                        <div className="text-[12px] font-black text-slate-700">
                          {parseFloat(op.produced_qty || 0).toFixed(2)}
                        </div>
                        <div className="text-[9px] text-slate-400 font-medium">units</div>
                      </div>

                      {/* Accepted Qty */}
                      <div className="col-span-1 text-center">
                        <div className="text-[12px] font-black text-emerald-600">
                          {parseFloat(op.accepted_qty || 0).toFixed(2)}
                        </div>
                        <div className="text-[9px] text-slate-400 font-medium">units</div>
                      </div>

                      {/* Workstation/Vendor */}
                      <div className="col-span-1 text-center">
                        <span className={`text-[10px] font-black px-2 py-1 rounded block truncate ${op.type === 'outsource' || op.type === 'subcontract' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'text-slate-700 bg-slate-50'}`}>
                          {op.type === 'outsource' || op.type === 'subcontract' ? (op.vendor_name || 'Outsource') : (op.workstation || 'N/A')}
                        </span>
                      </div>

                      {/* Assignee */}
                      <div className="col-span-1 text-center">
                        <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-1 rounded block truncate">
                          {op.type === 'outsource' || op.type === 'subcontract' ? 'N/A' : (op.operator_name || 'Unassigned')}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-end gap-1 px-2">
                        <button
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="View Details"
                          onClick={() => {
                            setSelectedOperationForDetails(op);
                            setIsDetailsModalOpen(true);
                          }}
                        >
                          <Eye size={16} />
                        </button>

                        {(op.type === 'outsource' || op.type === 'subcontract') && (
                          <>
                            {!op.outward_challan_id ? (
                              <button
                                onClick={() => op.is_current_op && handleOpenChallanModal(op, { id: op.work_order_id, work_order_no: op.work_order_no, quantity: op.work_order_qty })}
                                disabled={!op.is_current_op}
                                className={`p-1.5 rounded-lg transition-all ${
                                  op.is_current_op 
                                  ? 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50' 
                                  : 'text-slate-200 cursor-not-allowed opacity-50'
                                }`}
                                title={op.is_current_op ? "Vendor Dispatch (Outward Challan)" : "Complete previous operations first"}
                              >
                                <Truck size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => op.is_current_op && handleOpenInwardModal(op, { id: op.work_order_id, work_order_no: op.work_order_no, quantity: op.work_order_qty })}
                                disabled={!op.is_current_op}
                                className={`p-1.5 rounded-lg transition-all ${
                                  op.is_current_op 
                                  ? 'text-emerald-600 hover:bg-emerald-50' 
                                  : 'text-slate-200 cursor-not-allowed opacity-50'
                                }`}
                                title={op.is_current_op ? "Vendor Receipt (Inward Challan)" : "Complete previous operations first"}
                              >
                                <Box size={16} />
                              </button>
                            )}
                          </>
                        )}

                        {op.status === 'in_progress' || op.status === 'completed' ? (
                          <button
                            onClick={() => (op.status === 'completed' || op.is_current_op) && navigate(`/department/production/operations/${op.id}/entry`)}
                            disabled={op.status !== 'completed' && !op.is_current_op}
                            className={`p-2 rounded-lg transition-all ${
                              (op.status === 'completed' || op.is_current_op)
                              ? 'text-blue-600 hover:bg-blue-50'
                              : 'text-slate-200 cursor-not-allowed opacity-50'
                            }`}
                            title={op.status === 'completed' ? "Production Entry (Completed)" : op.is_current_op ? "Production Entry" : "Complete previous operations first"}
                          >
                            <Zap size={18} fill="currentColor" />
                          </button>
                        ) : (
                          <button
                            onClick={() => op.is_material_ready && op.is_current_op && handleStartOperation(op)}
                            disabled={!op.is_material_ready || !op.is_current_op}
                            className={`p-2 rounded-lg transition-all ${
                              op.is_material_ready && op.is_current_op
                                ? 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'
                                : 'text-slate-200 cursor-not-allowed opacity-50'
                              }`}
                            title={!op.is_material_ready ? "Materials Pending" : op.is_current_op ? "Start Operation" : "Complete previous operations first"}
                          >
                            <Play size={18} fill="currentColor" />
                          </button>
                        )}

                        <button
                          onClick={() => setEditingOperationId(op.id)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Edit Operation"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => op.is_current_op && handleDeleteOperation(op.id)}
                          disabled={!op.is_current_op && op.status !== 'completed'}
                          className={`p-2 rounded-lg transition-all ${
                            op.is_current_op || op.status === 'completed'
                            ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                            : 'text-slate-200 cursor-not-allowed opacity-50'
                          }`}
                          title={op.is_current_op || op.status === 'completed' ? "Delete Operation" : "Complete previous operations first"}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))
            )}
          </div>
        </div>
      </div>

      <CreateJobCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchJobCards}
      />

      {/* Outward Challan Modal */}
      {isChallanModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Outward Challan</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-black uppercase tracking-tighter">
                    Dispatch Job Card JC-{selectedOperation?.id} to Vendor
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsChallanModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Operation</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{selectedOperation?.operation_name}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quantity</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {parseFloat(selectedWorkOrder?.quantity).toFixed(2)} units
                  </p>
                </div>
              </div>

              {fetchingMaterials ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-tighter">Loading materials...</p>
                </div>
              ) : (
                <OutwardChallanForm
                  type="job_card"
                  task={{
                    ...selectedOperation,
                    work_order_no: selectedWorkOrder?.work_order_no
                  }}
                  materials={materials}
                  vendors={vendors}
                  onChallanCreated={() => {
                    setIsChallanModalOpen(false);
                    fetchJobCards();
                    showSuccess('Outward challan created successfully');
                  }}
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3">
              <button
                onClick={() => setIsChallanModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inward Challan Modal (Vendor Receipt) */}
      {isInwardModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <Box className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Inward Challan</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-black uppercase tracking-tighter">
                    Receive from Vendor - JC-{selectedOperation?.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsInwardModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-950/50">
              <InwardChallanForm
                operation={selectedOperation}
                onChallanCreated={() => {
                  setIsInwardModalOpen(false);
                  fetchJobCards();
                  showSuccess('Inward challan created successfully');
                }}
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3">
              <button
                onClick={() => setIsInwardModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Operational Intelligence Modal */}
      <JobCardDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        operation={selectedOperationForDetails}
      />
    </div>
  );
};

export default JobCardsPage;
