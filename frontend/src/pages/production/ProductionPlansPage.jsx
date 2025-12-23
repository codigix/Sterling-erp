import React, { useState } from 'react';
import {
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

const ProductionPlansPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const productionPlans = [
    { id: 1, planNo: 'PP-001-2025', projectCode: 'PROJ-001', customer: 'Client A', plannedQty: 500, units: 'units', startDate: '2025-12-16', endDate: '2025-12-25', status: 'active', progress: 45, priority: 'high' },
    { id: 2, planNo: 'PP-002-2025', projectCode: 'PROJ-002', customer: 'Client B', plannedQty: 300, units: 'units', startDate: '2025-12-15', endDate: '2025-12-22', status: 'active', progress: 65, priority: 'medium' },
    { id: 3, planNo: 'PP-003-2025', projectCode: 'PROJ-003', customer: 'Client C', plannedQty: 150, units: 'units', startDate: '2025-12-18', endDate: '2025-12-28', status: 'planned', progress: 0, priority: 'low' },
    { id: 4, planNo: 'PP-004-2025', projectCode: 'PROJ-004', customer: 'Client D', plannedQty: 400, units: 'units', startDate: '2025-12-10', endDate: '2025-12-20', status: 'active', progress: 85, priority: 'high' },
    { id: 5, planNo: 'PP-005-2025', projectCode: 'PROJ-005', customer: 'Client E', plannedQty: 250, units: 'units', startDate: '2025-12-01', endDate: '2025-12-15', status: 'completed', progress: 100, priority: 'medium' },
    { id: 6, planNo: 'PP-006-2025', projectCode: 'PROJ-006', customer: 'Client F', plannedQty: 600, units: 'units', startDate: '2025-12-20', endDate: '2026-01-05', status: 'planned', progress: 0, priority: 'high' },
  ];

  const filteredPlans = productionPlans.filter(plan =>
    (plan.planNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
     plan.projectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
     plan.customer.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'all' || plan.status === statusFilter)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const stats = [
    { label: 'Total Plans', value: productionPlans.length, color: 'text-blue-600' },
    { label: 'Active', value: productionPlans.filter(p => p.status === 'active').length, color: 'text-blue-600' },
    { label: 'Completed', value: productionPlans.filter(p => p.status === 'completed').length, color: 'text-green-600' },
    { label: 'Planned', value: productionPlans.filter(p => p.status === 'planned').length, color: 'text-yellow-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Production Plans</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track production plans</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <Plus size={18} />
            New Plan
          </button>
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors font-medium">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search plan, project or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="planned">Planned</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Plan No.</th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Project</th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Customer</th>
                <th className="p-2 text-center text-sm font-semibold text-slate-900 dark:text-white">Qty</th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Timeline</th>
                <th className="p-2 text-center text-sm font-semibold text-slate-900 dark:text-white">Progress</th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                <th className="p-2 text-center text-sm font-semibold text-slate-900 dark:text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlans.map((plan) => (
                <tr key={plan.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-2 text-sm font-medium text-slate-900 text-left dark:text-white">{plan.planNo}</td>
                  <td className="p-2 text-sm text-slate-600 dark:text-slate-400">{plan.projectCode}</td>
                  <td className="p-2 text-sm text-slate-600 dark:text-slate-400">{plan.customer}</td>
                  <td className="p-2 text-sm text-center text-slate-600 dark:text-slate-400">
                    {plan.plannedQty} {plan.units}
                  </td>
                  <td className="p-2 text-sm text-slate-600 dark:text-slate-400">
                    {plan.startDate} to {plan.endDate}
                  </td>
                  <td className="p-2 text-sm">
                    <div className="w-24">
                      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${plan.progress}%` }}></div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{plan.progress}%</p>
                    </div>
                  </td>
                  <td className="p-2 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(plan.status)}`}>
                      {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-2 text-center text-sm">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors">
                        <Eye size={16} className="text-blue-600 dark:text-blue-400" />
                      </button>
                      <button className="p-2 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-lg transition-colors">
                        <Edit size={16} className="text-yellow-600 dark:text-yellow-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductionPlansPage;
