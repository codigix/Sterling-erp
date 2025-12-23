import React, { useState } from 'react';
import {
  Target,
  Building2,
  Truck,
  Package,
  Zap,
  Users,
  BarChart3,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import {
  ProjectsTab,
  DepartmentsTab,
  VendorsTab,
  MaterialsTab,
  ProductionTab,
  EmployeesTab,
  ResourcesTab,
} from './AdminDashboard/components';

const AnalyticsReportsPage = () => {
  const [activeTab, setActiveTab] = useState('projects');

  const tabs = [
    {
      id: 'projects',
      label: 'Projects',
      icon: Target,
      component: ProjectsTab,
      data: {
        progress: [],
      },
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: Building2,
      component: DepartmentsTab,
      data: null,
    },
    {
      id: 'vendors',
      label: 'Vendors',
      icon: Truck,
      component: VendorsTab,
      data: null,
    },
    {
      id: 'materials',
      label: 'Materials',
      icon: Package,
      component: MaterialsTab,
      data: null,
    },
    {
      id: 'production',
      label: 'Production',
      icon: Zap,
      component: ProductionTab,
      data: null,
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      component: EmployeesTab,
      data: null,
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: BarChart3,
      component: ResourcesTab,
      data: null,
    },
  ];

  const activeTabObj = tabs.find(t => t.id === activeTab);
  const Component = activeTabObj?.component;

  return (
    <div className="w-full space-y-3 overflow-hidden">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white text-left">
          Analytics & Reports
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 text-left">
          Comprehensive analysis and performance metrics
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <Card className="bg-white dark:bg-slate-800">
        {Component && (
          <div className="p-3">
            {activeTabObj.id === 'projects' ? (
              <Component projects={activeTabObj.data} />
            ) : (
              <Component />
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AnalyticsReportsPage;
