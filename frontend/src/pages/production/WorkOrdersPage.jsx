import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/api';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Plus,
  ChevronRight,
  AlertCircle,
  FileText,
  ClipboardList,
  Trash2,
  CheckCircle2,
  Edit2,
  Layers,
  Zap,
  Settings,
  Eye,
  Activity,
  ArrowLeft,
  LayoutDashboard,
  Timer,
  CheckCircle,
  AlertTriangle,
  MoreVertical,
  Play,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const WorkOrdersPage = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const fetchWorkOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/production/work-orders', {
        params: {
          search: searchTerm,
          status: statusFilter === 'all' ? undefined : statusFilter
        }
      });
      
      const orders = response.data || [];
      setWorkOrders(orders);
      
      // Calculate stats from orders
      const newStats = {
        total: orders.length,
        inProgress: orders.filter(o => o.status === 'in_progress').length,
        completed: orders.filter(o => o.status === 'completed').length,
        pending: orders.filter(o => o.status === 'draft' || o.status === 'pending').length
      };
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching work orders:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await axios.delete(`/production/work-orders/${id}`);
        Swal.fire('Deleted!', 'Work order has been deleted.', 'success');
        fetchWorkOrders();
      }
    } catch (error) {
      console.error('Error deleting work order:', error);
      Swal.fire('Error!', 'Failed to delete work order.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'planning': 
      case 'pending': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'on_hold': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-blue-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Work Orders
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
                  <Layers size={14} /> Production
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                  <Clock size={14} /> 03:11 PM
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/department/production/work-orders/new')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-black transition-all text-sm shadow-sm"
            >
              <Plus size={18} />
              Create Order
            </button>
            <button className="p-2 rounded-lg border border-slate-200 text-red-500 hover:bg-red-50 transition-all">
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Total Orders</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tight font-medium">Global manufacturing volume</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Layers size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">In Progress</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.inProgress}</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tight font-medium">Active production lines</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center">
              <Activity size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Completed</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.completed}</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tight font-medium">Ready for delivery</p>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Pending</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.pending}</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tight font-medium">Awaiting scheduling</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Timer size={24} />
            </div>
          </div>
        </div>

        {/* Scheduling Analyzer */}
        <div className="bg-slate-900 rounded-xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
            <Activity size={18} className="text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Scheduling Analyzer</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="p-6">
              <p className="text-xs text-slate-400 mb-2">High Priority Pending</p>
              <h4 className="text-xl font-bold text-white mb-4">1 <span className="text-xs font-medium text-red-500 ml-2 uppercase tracking-widest">Critical</span></h4>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 w-[20%]" />
              </div>
            </div>
            <div className="p-6">
              <p className="text-xs text-slate-400 mb-2">Due This Week</p>
              <h4 className="text-xl font-bold text-white mb-4">0</h4>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-0" />
              </div>
            </div>
            <div className="p-6">
              <p className="text-xs text-slate-400 mb-2">Efficiency Rate</p>
              <h4 className="text-xl font-bold text-white mb-4">88 %</h4>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[88%]" />
              </div>
            </div>
            <div className="p-6">
              <p className="text-xs text-slate-400 mb-2">Ready for QC</p>
              <h4 className="text-xl font-bold text-white mb-4">0</h4>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Work Orders Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Work Orders</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time production tracking</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-bold border border-green-100">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  {workOrders.length} Orders Active
               </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="relative max-w-md w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search orders, items, or IDs..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                 <Filter size={16} className="text-slate-400" />
                 <select 
                   className="bg-transparent text-sm font-medium text-slate-600 outline-none"
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                 >
                    <option value="all">All Status</option>
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                 </select>
              </div>
              <div className="h-4 w-px bg-slate-300 mx-1" />
              <select className="bg-transparent text-sm font-medium text-slate-600 outline-none">
                 <option>Month</option>
              </select>
              <select className="bg-transparent text-sm font-medium text-slate-600 outline-none font-bold">
                 <option>2024</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Order Identity</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Item / Project</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status & Priority</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Timeline</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-slate-500">Loading work orders...</td>
                  </tr>
                ) : workOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-slate-500">No work orders found</td>
                  </tr>
                ) : (
                  workOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 leading-tight">{order.work_order_no}</p>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium">{order.notes || 'No notes'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div>
                          <p className="text-sm font-bold text-slate-700 leading-tight">{order.item_name}</p>
                          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tight">{order.project_name || order.sales_order_no || 'Stock Order'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(order.status)}`}>
                             <Clock size={12} />
                             {(order.status || 'pending').replace('_', ' ')}
                          </div>
                          <div className="flex items-center gap-1.5">
                             <div className={`w-1.5 h-1.5 rounded-full bg-current ${getPriorityColor(order.priority)}`} />
                             <span className={`text-[10px] font-bold uppercase tracking-tight ${getPriorityColor(order.priority)}`}>
                               {order.priority || 'medium'} priority
                             </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Calendar size={12} />
                            Start: {order.planned_start_date ? new Date(order.planned_start_date).toLocaleDateString() : 'TBD'}
                          </p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock size={12} />
                            End: {order.planned_end_date ? new Date(order.planned_end_date).toLocaleDateString() : 'TBD'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => navigate(`/department/production/work-orders/${order.id}`)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => navigate(`/department/production/work-orders/edit/${order.id}`)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(order.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
             <p className="text-xs text-slate-500">Showing {workOrders.length} manufacturing sequences</p>
             <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 disabled:opacity-50">Previous</button>
                <button className="px-4 py-1.5 bg-white border border-slate-200 text-xs font-bold text-slate-900 rounded-lg shadow-sm hover:bg-slate-50 transition-all">Next</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkOrdersPage;
