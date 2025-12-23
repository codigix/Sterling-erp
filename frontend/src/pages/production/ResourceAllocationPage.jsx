import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';

const ResourceAllocationPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const resources = [
    { id: 1, department: 'Cutting & Preparation', totalWorkers: 8, allocated: 8, available: 0, activeProjects: 2, utilization: 100, efficiency: 94 },
    { id: 2, department: 'Welding & Assembly', totalWorkers: 6, allocated: 5, available: 1, activeProjects: 2, utilization: 83, efficiency: 89 },
    { id: 3, department: 'Finishing', totalWorkers: 5, allocated: 4, available: 1, activeProjects: 1, utilization: 80, efficiency: 91 },
    { id: 4, department: 'Final Inspection', totalWorkers: 3, allocated: 2, available: 1, activeProjects: 1, utilization: 67, efficiency: 96 },
    { id: 5, department: 'Painting & Coating', totalWorkers: 4, allocated: 3, available: 1, activeProjects: 2, utilization: 75, efficiency: 88 },
    { id: 6, department: 'Quality Control', totalWorkers: 5, allocated: 4, available: 1, activeProjects: 3, utilization: 80, efficiency: 92 },
  ];

  const filturedResources = resources.filter(resource =>
    (resource.department.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (departmentFilter === 'all' || resource.department === departmentFilter)
  );

  const getUtilizationColor = (utilization) => {
    if (utilization >= 90) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (utilization >= 75) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  const stats = [
    { label: 'Total Departments', value: resources.length, color: 'text-blue-600' },
    { label: 'Total Workers', value: resources.reduce((sum, r) => sum + r.totalWorkers, 0), color: 'text-green-600' },
    { label: 'Allocated', value: resources.reduce((sum, r) => sum + r.allocated, 0), color: 'text-yellow-600' },
    { label: 'Available', value: resources.reduce((sum, r) => sum + r.available, 0), color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Resource Allocation</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage workforce allocation across departments</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <Plus size={18} />
            Allocate Workers
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filturedResources.map((resource) => (
              <div key={resource.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-center text-xs justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{resource.department}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{resource.activeProjects} active project(s)</p>
                  </div>
                  <button className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors">
                    <Edit size={18} className="text-blue-600 dark:text-blue-400" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Worker Distribution</p>
                    <div className="flex items-center text-xs gap-2">
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${(resource.allocated / resource.totalWorkers) * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-medium text-slate-900 text-left dark:text-white">
                        {resource.allocated}/{resource.totalWorkers}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Utilization</p>
                    <div className="flex items-center text-xs gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getUtilizationColor(resource.utilization)}`}>
                        {resource.utilization}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                    <p className="text-slate-600 dark:text-slate-400">Available</p>
                    <p className="font-bold text-slate-900 dark:text-white">{resource.available}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                    <p className="text-slate-600 dark:text-slate-400">Allocated</p>
                    <p className="font-bold text-slate-900 dark:text-white">{resource.allocated}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded">
                    <p className="text-slate-600 dark:text-slate-400">Efficiency</p>
                    <p className="font-bold text-green-600">{resource.efficiency}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Allocation Summary</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center text-xs justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Utilization</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {Math.round((resources.reduce((sum, r) => sum + r.allocated, 0) / resources.reduce((sum, r) => sum + r.totalWorkers, 0)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${Math.round((resources.reduce((sum, r) => sum + r.allocated, 0) / resources.reduce((sum, r) => sum + r.totalWorkers, 0)) * 100)}%` }}></div>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Department Status</h4>
              <div className="space-y-2">
                {resources.map((resource) => (
                  <div key={resource.id} className="flex items-center text-xs justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">{resource.department.split(' ')[0]}</span>
                    <div className="flex items-center text-xs gap-2">
                      <div className="w-12 bg-slate-200 dark:bg-slate-700 rounded h-1.5">
                        <div className="bg-green-600 h-1.5 rounded" style={{ width: `${resource.efficiency}%` }}></div>
                      </div>
                      <span className="text-slate-900 dark:text-white font-medium">{resource.efficiency}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceAllocationPage;
