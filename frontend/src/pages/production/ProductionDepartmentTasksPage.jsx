import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Eye, 
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import axios from '../../utils/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const ProductionDepartmentTasksPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleId] = useState(5); // Production Role ID

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/department/portal/tasks/${roleId}?excludeWorkflow=true`, { __sessionGuard: true });
      setTasks(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load department tasks');
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await axios.patch(`/department/portal/tasks/${taskId}`, { status: newStatus }, { __sessionGuard: true });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'on_hold':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const woSuffix = task.work_order_no?.split('-')?.pop() || task.work_order_id;
    const jobCardNo = task.work_order_operation_id 
      ? `JC-${woSuffix}-${task.work_order_operation_id}` 
      : '';

    const matchesSearch = 
      (task.task_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.root_card_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.po_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (jobCardNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.work_order_no || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="text-blue-600" />
            Production Department Tasks
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Monitor and manage tasks assigned to the entire production department
          </p>
        </div>
        <button 
          onClick={fetchTasks}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold">×</button>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by title, job card or work order..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Task Info</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Card / Work Order</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned By</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500">Loading tasks...</td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500">No tasks found</td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{task.task_title}</div>
                      {task.product_name && (
                        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 uppercase tracking-tight">
                          Item: {task.product_name}
                        </div>
                      )}
                      <div className="text-xs text-slate-500 mt-1 line-clamp-1 italic font-medium">{task.task_description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 dark:text-white font-bold">
                        {task.work_order_operation_id 
                          ? `JC-${task.work_order_no?.split('-')?.pop() || task.work_order_id || 'WO'}-${task.work_order_operation_id}` 
                          : 'N/A'}
                      </div>
                      <div className="text-xs text-slate-500">
                        WO: {task.work_order_no || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`
                        ${task.priority === 'critical' ? 'bg-red-100 text-red-800' : 
                          task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          task.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-800'}
                      `}>
                        {task.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {task.assigned_by_name || 'System'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {task.link && task.status !== 'completed' && (
                          <button
                            onClick={() => navigate(task.link)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                            title="Go to Production Entry"
                          >
                            <ArrowRight size={18} />
                            ENTRY
                          </button>
                        )}
                        {task.status !== 'completed' && (
                          <button
                            onClick={() => handleUpdateStatus(task.id, 'completed')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Mark as Completed"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {task.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Start Task"
                          >
                            <Clock size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ProductionDepartmentTasksPage;
