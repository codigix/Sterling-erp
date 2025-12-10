import React from "react";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { useState, useEffect } from "react";
import axios from "../../utils/api";
import SalesOrderForm from "../../components/admin/SalesOrderForm";
import SalesOrderList from "../../components/admin/SalesOrderList/SalesOrderList";
import {
  Shield,
  Users,
  AlertTriangle,
  Database,
  RefreshCw,
  Plus,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  PieChart,
  LineChart,
  Package,
  Factory,
  UserCheck,
  Timer,
  Zap,
  Target,
  Calendar,
  DollarSign,
  Truck,
  Wrench,
  FileText,
  Settings,
  ShoppingCart,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  OverviewTab,
  ProjectsTab,
  DepartmentsTab,
  VendorsTab,
  MaterialsTab,
  ProductionTab,
  EmployeesTab,
  ResourcesTab,
} from "./AdminDashboard/components";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  return (
    <div className="w-full overflow-x-hidden">
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-6">
          <BarChart3 className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2 text-center">
          Admin Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-center max-w-md mb-8">
          Select a dashboard section from the sidebar to view analytics and
          reports for your manufacturing system.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
          <div className="flex flex-col items-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Overview
            </span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
            <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Sales Orders
            </span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
            <Target className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Projects
            </span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
            <Factory className="w-6 h-6 text-orange-600 dark:text-orange-400 mb-2" />
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Departments
            </span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
            <Truck className="w-6 h-6 text-red-600 dark:text-red-400 mb-2" />
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Vendors
            </span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
            <Package className="w-6 h-6 text-cyan-600 dark:text-cyan-400 mb-2" />
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Materials
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SalesOrdersTab = () => {
  const [mode, setMode] = useState('list');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setMode('view');
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setMode('edit');
  };

  const handleAssignOrder = (order) => {
    setSelectedOrder(order);
    setMode('assign');
  };

  const handleBackToList = () => {
    setMode('list');
    setSelectedOrder(null);
  };

  if (mode === 'create' || mode === 'view' || mode === 'edit' || mode === 'assign') {
    return (
      <SalesOrderForm
        mode={mode}
        initialData={selectedOrder}
        onSubmit={handleBackToList}
        onCancel={handleBackToList}
      />
    );
  }

  return (
    <div className="w-full">
      <SalesOrderList
        onCreateNew={() => setMode('create')}
        onViewOrder={handleViewOrder}
        onEditOrder={handleEditOrder}
        onAssignOrder={handleAssignOrder}
      />
    </div>
  );
};

export default AdminDashboard;
export {
  OverviewTab,
  ProjectsTab,
  DepartmentsTab,
  VendorsTab,
  MaterialsTab,
  ProductionTab,
  EmployeesTab,
  ResourcesTab,
  SalesOrdersTab,
};
