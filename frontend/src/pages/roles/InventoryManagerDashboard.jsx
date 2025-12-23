import React, { useState } from 'react';
import { Link, Routes, Route, Navigate } from 'react-router-dom';
import RoleDashboardLayout from '../../components/layout/RoleDashboardLayout';
import ViewStockPage from '../inventory/ViewStockPage';
import StockMovementsPage from '../inventory/StockMovementsPage';
import ReorderLevelsPage from '../inventory/ReorderLevelsPage';
import TrackInventoryPage from '../inventory/TrackInventoryPage';
import BatchManagementPage from '../inventory/BatchManagementPage';
import RackAndShelfPage from '../inventory/RackAndShelfPage';
import VendorsPage from '../inventory/VendorsPage';
import QuotationsPage from '../inventory/QuotationsPage';
import PurchaseOrderPage from '../inventory/PurchaseOrderPage';
import GRNProcessingPage from '../inventory/GRNProcessingPage';
import QCInspectionsPage from '../inventory/QCInspectionsPage';
import ReportsPage from '../inventory/ReportsPage';
import MaterialSpecificationsPage from '../inventory/MaterialSpecificationsPage';
import InventoryTasksPage from '../department/InventoryTasksPage';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import {
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Boxes,
  RefreshCw,
  Download,
  Clock,
  Activity,
  BarChart3,
  FileText,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const DashboardContent = ({
  stats,
  criticalAlerts,
  recentMovements,
  inventoryTrendData,
  stockStatusData,
  stockMovementData,
  chartOptions,
  dateRange,
  setDateRange,
  handleExport,
}) => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Inventory Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor stock levels and movements</p>
      </div>
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleExport}
          className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <Download size={18} />
          Export
        </button>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white font-medium"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
        </select>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className={`bg-gradient-to-br ${stat.bgColor} dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border ${stat.borderColor} dark:border-slate-600 hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-center text-xs justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  {stat.title}
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                  {stat.value}
                </p>
                <p
                  className={`text-sm font-medium mt-2 flex items-center text-xs gap-1 ${
                    stat.positive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.positive ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 bg-white dark:bg-slate-600 rounded-lg ${stat.iconColor}`}>
                <Icon size={28} />
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {criticalAlerts.length > 0 && (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="flex items-center text-xs gap-3 mb-4">
          <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
          <h2 className="text-xl font-bold text-red-900 dark:text-red-100">Critical Stock Alerts</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {criticalAlerts.map((alert) => (
            <div key={alert.id} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-red-100 dark:border-red-700">
              <p className="font-semibold text-slate-900 dark:text-white">{alert.item}</p>
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-slate-600 dark:text-slate-400">Current: <span className="font-bold text-red-600">{alert.current}</span></p>
                <p className="text-slate-600 dark:text-slate-400">Reorder: <span className="font-bold">{alert.reorder}</span></p>
              </div>
              <button className="mt-3 w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors">
                Place Order
              </button>
            </div>
          ))}
        </div>
      </div>
    )}

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center text-xs gap-2">
          <BarChart3 size={20} />
          Inventory Trend
        </h3>
        <Line data={inventoryTrendData} options={chartOptions} />
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center text-xs gap-2">
          <Activity size={20} />
          Stock Status
        </h3>
        <Doughnut data={stockStatusData} options={chartOptions} />
      </div>
    </div>

    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center text-xs gap-2">
        <RefreshCw size={20} />
        Stock Movement Summary
      </h3>
      <Bar data={stockMovementData} options={chartOptions} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center text-xs gap-2">
          <Clock size={20} />
          Recent Stock Movements
        </h3>
        <div className="space-y-3">
          {recentMovements.map((movement, idx) => (
            <div key={idx} className="flex items-center text-xs justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-white">{movement.item}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{movement.vendor} • {movement.time}</p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-2 rounded-lg text-sm font-semibold ${
                    movement.type === 'in'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                  }`}
                >
                  {movement.qty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <Link
            to="/inventory-manager/stock/view"
            className="flex items-center text-xs gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors border border-blue-100 dark:border-blue-800"
          >
            <Package size={20} className="text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">View Stock</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">See all items</p>
            </div>
          </Link>
          <Link
            to="/inventory-manager/stock/reorder"
            className="flex items-center text-xs gap-3 p-3 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors border border-red-100 dark:border-red-800"
          >
            <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
            <div>
              <p className="font-medium text-red-900 dark:text-red-100">Reorder Items</p>
              <p className="text-xs text-red-700 dark:text-red-300">23 items low</p>
            </div>
          </Link>
          <Link
            to="/inventory-manager/vendors/po"
            className="flex items-center text-xs gap-3 p-3 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors border border-purple-100 dark:border-purple-800"
          >
            <Truck size={20} className="text-purple-600 dark:text-purple-400" />
            <div>
              <p className="font-medium text-purple-900 dark:text-purple-100">Purchase Orders</p>
              <p className="text-xs text-purple-700 dark:text-purple-300">Create new PO</p>
            </div>
          </Link>
          <Link
            to="/inventory-manager/qc/grn"
            className="flex items-center text-xs gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg transition-colors border border-emerald-100 dark:border-emerald-800"
          >
            <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="font-medium text-emerald-900 dark:text-emerald-100">GRN Processing</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">8 pending</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  </div>
);

const InventoryManagerDashboard = () => {
  const [dateRange, setDateRange] = useState('30days');

  const navigationItems = [
    {
      title: 'Dashboard',
      path: '/inventory-manager/dashboard',
      icon: Package,
    },
    {
      title: 'Stock Management',
      icon: Boxes,
      submenu: [
        { title: 'View Stock', path: '/inventory-manager/stock/view', icon: Package },
        { title: 'Stock Movements', path: '/inventory-manager/stock/movements', icon: RefreshCw },
        { title: 'Reorder Levels', path: '/inventory-manager/stock/reorder', icon: AlertTriangle },
      ]
    },
    {
      title: 'Inventory Tracking',
      icon: TrendingUp,
      submenu: [
        { title: 'Track Inventory', path: '/inventory-manager/tracking/inventory', icon: TrendingUp },
        { title: 'Batch Management', path: '/inventory-manager/tracking/batches', icon: Boxes },
        { title: 'Rack & Shelf', path: '/inventory-manager/tracking/location', icon: Package },
      ]
    },
    {
      title: 'Vendor Management',
      icon: Truck,
      submenu: [
        { title: 'Vendors', path: '/inventory-manager/vendors/list', icon: Truck },
        { title: 'Quotations', path: '/inventory-manager/vendors/quotations', icon: TrendingUp },
        { title: 'Purchase Orders', path: '/inventory-manager/vendors/po', icon: Package },
      ]
    },
    {
      title: 'Quality Control',
      icon: CheckCircle,
      submenu: [
        { title: 'GRN Processing', path: '/inventory-manager/qc/grn', icon: CheckCircle },
        { title: 'QC Inspections', path: '/inventory-manager/qc/inspections', icon: CheckCircle },
      ]
    },
    {
      title: 'Material Specifications',
      path: '/inventory-manager/material-specs',
      icon: FileText,
    },
    {
      title: 'Reports',
      path: '/inventory-manager/reports',
      icon: TrendingUp,
    },
    {
      title: 'Department Tasks',
      path: '/inventory-manager/department-tasks',
      icon: CheckCircle,
    },
  ];

  const stats = [
    {
      title: 'Total Items',
      value: '1,234',
      change: '+12%',
      positive: true,
      icon: Package,
      bgColor: 'from-blue-50 to-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Low Stock Items',
      value: '23',
      change: '+5%',
      positive: false,
      icon: AlertTriangle,
      bgColor: 'from-red-50 to-red-100',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200',
    },
    {
      title: 'Pending GRN',
      value: '8',
      change: '-2%',
      positive: true,
      icon: Truck,
      bgColor: 'from-amber-50 to-amber-100',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-200',
    },
    {
      title: 'Inventory Value',
      value: '₹24.5L',
      change: '+8%',
      positive: true,
      icon: TrendingUp,
      bgColor: 'from-emerald-50 to-emerald-100',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
    },
  ];

  const inventoryTrendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Stock Level',
        data: [1200, 1400, 1100, 1600, 1450, 1234],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
      },
      {
        label: 'Reorder Level',
        data: [800, 800, 800, 800, 800, 800],
        borderColor: 'rgb(239, 68, 68)',
        borderDash: [5, 5],
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  const stockMovementData = {
    labels: ['Inbound', 'Outbound', 'Transfers', 'Adjustments'],
    datasets: [
      {
        label: 'Units',
        data: [420, 380, 120, 45],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(249, 115, 22)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const stockStatusData = {
    labels: ['Optimal', 'Low Stock', 'Critical', 'Overstock'],
    datasets: [
      {
        data: [65, 18, 12, 5],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)',
          'rgb(168, 85, 247)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const criticalAlerts = [
    { id: 1, item: 'Steel Plate 10mm', current: 15, reorder: 100, status: 'critical', icon: AlertTriangle },
    { id: 2, item: 'Bearing Set A', current: 45, reorder: 80, status: 'warning', icon: AlertTriangle },
    { id: 3, item: 'Aluminum Sheet', current: 200, reorder: 150, status: 'warning', icon: AlertTriangle },
  ];

  const recentMovements = [
    { item: 'Steel Plate 10mm', qty: '+50 kg', type: 'in', vendor: 'Vendor A', time: '2 hrs ago' },
    { item: 'Aluminum Sheet', qty: '-25 kg', type: 'out', vendor: 'Project X', time: '4 hrs ago' },
    { item: 'Bearing Set', qty: '+10 pcs', type: 'in', vendor: 'Vendor B', time: '6 hrs ago' },
    { item: 'Paint - Red', qty: '-5 L', type: 'out', vendor: 'Production', time: '1 day ago' },
  ];

  const handleExport = () => {
    console.log('Export dashboard data');
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: { size: 12 },
        },
      },
    },
  };



  return (
    <RoleDashboardLayout
      roleNavigation={navigationItems}
      roleName="Inventory Manager"
      roleIcon={Package}
    >
      <Routes>
        <Route
          path="/"
          element={
            <DashboardContent
              stats={stats}
              criticalAlerts={criticalAlerts}
              recentMovements={recentMovements}
              inventoryTrendData={inventoryTrendData}
              stockStatusData={stockStatusData}
              stockMovementData={stockMovementData}
              chartOptions={chartOptions}
              dateRange={dateRange}
              setDateRange={setDateRange}
              handleExport={handleExport}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            <DashboardContent
              stats={stats}
              criticalAlerts={criticalAlerts}
              recentMovements={recentMovements}
              inventoryTrendData={inventoryTrendData}
              stockStatusData={stockStatusData}
              stockMovementData={stockMovementData}
              chartOptions={chartOptions}
              dateRange={dateRange}
              setDateRange={setDateRange}
              handleExport={handleExport}
            />
          }
        />
        <Route path="/stock/view" element={<ViewStockPage />} />
        <Route path="/stock/movements" element={<StockMovementsPage />} />
        <Route path="/stock/reorder" element={<ReorderLevelsPage />} />
        <Route path="/tracking/inventory" element={<TrackInventoryPage />} />
        <Route path="/tracking/batches" element={<BatchManagementPage />} />
        <Route path="/tracking/location" element={<RackAndShelfPage />} />
        <Route path="/vendors/list" element={<VendorsPage />} />
        <Route path="/vendors/quotations" element={<QuotationsPage />} />
        <Route path="/vendors/po" element={<PurchaseOrderPage />} />
        <Route path="/qc/grn" element={<GRNProcessingPage />} />
        <Route path="/qc/inspections" element={<QCInspectionsPage />} />
        <Route path="/material-specs" element={<MaterialSpecificationsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/department-tasks" element={<InventoryTasksPage />} />
        <Route path="*" element={<Navigate to="/inventory-manager/dashboard" replace />} />
      </Routes>
    </RoleDashboardLayout>
  );
};

export default InventoryManagerDashboard;
