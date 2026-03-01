import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Link, Routes, Route, Navigate } from "react-router-dom";
import axios from "../../utils/api";
import RoleDashboardLayout from "../../components/layout/RoleDashboardLayout";

// Lazy load sub-pages for better performance
const StockBalancePage = lazy(() => import("../inventory/StockBalancePage"));
const StockEntriesPage = lazy(() => import("../inventory/StockEntriesPage"));
const StockMovementsPage = lazy(() => import("../inventory/StockMovementsPage"));
const ReorderLevelsPage = lazy(() => import("../inventory/ReorderLevelsPage"));
const TrackInventoryPage = lazy(() => import("../inventory/TrackInventoryPage"));
const BatchManagementPage = lazy(() => import("../inventory/BatchManagementPage"));
const RackAndShelfPage = lazy(() => import("../inventory/RackAndShelfPage"));
const VendorsPage = lazy(() => import("../inventory/VendorsPage"));
const QuotationsPage = lazy(() => import("../inventory/QuotationsPage"));
const PurchaseOrderPage = lazy(() => import("../inventory/PurchaseOrderPage"));
const PurchaseReceiptPage = lazy(() => import("../inventory/PurchaseReceiptPage"));
const GRNProcessingPage = lazy(() => import("../inventory/GRNProcessingPage"));
const CreateQuotationPage = lazy(() => import("../inventory/CreateQuotationPage"));
const MaterialRequestsPage = lazy(() => import("../inventory/MaterialRequestsPage"));
const WarehousesPage = lazy(() => import("../inventory/WarehousesPage"));
const PurchaseOrderDetailPage = lazy(() => import("../inventory/PurchaseOrderDetailPage"));
const PurchaseOrderEditPage = lazy(() => import("../inventory/PurchaseOrderEditPage"));
const InventoryTasksPage = lazy(() => import("../department/InventoryTasksPage"));
import { Line, Bar, Doughnut } from "react-chartjs-2";
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
} from "chart.js";
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
  Loader2,
  ClipboardList,
  Warehouse,
} from "lucide-react";

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

const DashboardContent = React.memo(({
  dateRange,
  setDateRange,
  handleExport,
  inventoryTrendData,
  stockStatusData,
  stockMovementData,
  chartOptions
}) => {
  const [departmentTasks, setDepartmentTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [portalData, setPortalData] = useState({ stock: [], stats: {} });
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchPortalData = useCallback(async () => {
    try {
      setLoadingStats(true);
      const response = await axios.get("/inventory/portal/stock");
      setPortalData(response.data);
    } catch (err) {
      console.error("Error fetching portal data:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoadingTasks(true);
      const response = await axios.get("/employee/tasks", {
        params: {
          type: 'material_requirement,shipment,delivery',
          limit: 6
        }
      });
      setDepartmentTasks(response.data.tasks || []);
    } catch (err) {
      console.error("Error fetching inventory tasks:", err);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  useEffect(() => {
    fetchPortalData();
    fetchTasks();
  }, [fetchPortalData, fetchTasks]);

  const stats = React.useMemo(() => {
    const s = portalData.stats || {};
    return [
      {
        title: "Total Items",
        value: s.totalSKUs || 0,
        change: "+0%",
        positive: true,
        icon: Package,
        bgColor: "from-blue-50 to-blue-100",
        iconColor: "text-blue-600",
        borderColor: "border-blue-200",
      },
      {
        title: "Low Stock Items",
        value: s.lowStock || 0,
        change: s.lowStock > 0 ? "+5%" : "0%",
        positive: false,
        icon: AlertTriangle,
        bgColor: "from-red-50 to-red-100",
        iconColor: "text-red-600",
        borderColor: "border-red-200",
      },
      {
        title: "Total Quantity",
        value: s.totalQuantity || 0,
        change: "N/A",
        positive: true,
        icon: Boxes,
        bgColor: "from-amber-50 to-amber-100",
        iconColor: "text-amber-600",
        borderColor: "border-amber-200",
      },
      {
        title: "Inventory Value",
        value: `₹${((s.totalValue || 0) / 100000).toFixed(2)}L`,
        change: "+0%",
        positive: true,
        icon: TrendingUp,
        bgColor: "from-emerald-50 to-emerald-100",
        iconColor: "text-emerald-600",
        borderColor: "border-emerald-200",
      },
    ];
  }, [portalData.stats]);

  const criticalAlerts = React.useMemo(() => {
    return (portalData.stock || [])
      .filter(item => item.status === 'low-stock')
      .slice(0, 3)
      .map(item => ({
        id: item.id,
        item: item.name,
        current: item.quantity,
        reorder: item.reorder_level || 'N/A',
        status: "critical",
        icon: AlertTriangle,
      }));
  }, [portalData.stock]);

  const recentMovements = [
    {
      item: "Steel Plate 10mm",
      qty: "+50 kg",
      type: "in",
      vendor: "Vendor A",
      time: "2 hrs ago",
    },
    {
      item: "Aluminum Sheet",
      qty: "-25 kg",
      type: "out",
      vendor: "Root Card X",
      time: "4 hrs ago",
    },
  ];

  return (
    <div className="space-y-6">
      {loadingStats ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white text-xs">
                Inventory Overview
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Monitor stock levels and movements
              </p>
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
                      <p className="text-xl font-bold text-slate-900 dark:text-white text-xs mt-2">
                        {stat.value}
                      </p>
                      <p
                        className={`text-sm font-medium mt-2 flex items-center text-xs gap-1 ${
                          stat.positive ? "text-green-600" : "text-red-600"
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
                    <div
                      className={`p-3 bg-white dark:bg-slate-600 rounded-lg ${stat.iconColor}`}
                    >
                      <Icon size={28} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Assigned Root Cards Tasks Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                <Clock size={20} className="text-blue-600" />
                Assigned Root Cards (Logistics & Inventory)
              </h3>
              <Link
                to="/inventory-manager/department-tasks"
                className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700"
              >
                View All Tasks →
              </Link>
            </div>

            {loadingTasks ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            ) : departmentTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departmentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-blue-400 transition-all bg-slate-50 dark:bg-slate-900/50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                          {task.rootCard?.title || task.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {task.rootCard?.customer || task.salesOrder?.customer || "No Customer"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                          task.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        PO: {task.rootCard?.poNumber || task.salesOrder?.poNumber || "N/A"}
                      </span>
                      <Link
                        to={`/inventory-manager/department-tasks`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700"
                      >
                        Process →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                <Package className="mx-auto text-slate-300 mb-2" size={40} />
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  No active material, shipment, or delivery tasks assigned.
                </p>
              </div>
            )}
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <div className="flex items-center text-xs gap-3 mb-4">
              <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
              <h2 className="text-xl font-bold text-red-900 dark:text-red-100">
                Critical Stock Alerts
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {criticalAlerts.length > 0 ? (
                criticalAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-red-100 dark:border-red-700"
                  >
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {alert.item}
                    </p>
                    <div className="mt-3 space-y-1 text-sm">
                      <p className="text-slate-600 dark:text-slate-400">
                        Current:{" "}
                        <span className="font-bold text-red-600">
                          {alert.current}
                        </span>
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">
                        Reorder: <span className="font-bold">{alert.reorder}</span>
                      </p>
                    </div>
                    <Link
                      to="/inventory-manager/material-requests"
                      className="mt-3 block text-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                    >
                      Raise Material Request
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-4 text-green-600 font-medium">
                  No critical stock alerts. All items are above reorder level.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white text-xs mb-4 flex items-center text-xs gap-2">
            <BarChart3 size={20} />
            Inventory Trend
          </h3>
          <Line data={inventoryTrendData} options={chartOptions} />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white text-xs mb-4 flex items-center text-xs gap-2">
            <Activity size={20} />
            Stock Status
          </h3>
          <Doughnut data={stockStatusData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white text-xs mb-4 flex items-center text-xs gap-2">
          <RefreshCw size={20} />
          Stock Movement Summary
        </h3>
        <Bar data={stockMovementData} options={chartOptions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white text-xs mb-4 flex items-center text-xs gap-2">
            <Clock size={20} />
            Recent Stock Movements
          </h3>
          <div className="space-y-3">
            {recentMovements.map((movement, idx) => (
              <div
                key={idx}
                className="flex items-center text-xs justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {movement.item}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {movement.vendor} • {movement.time}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-2 rounded-lg text-sm font-semibold ${
                      movement.type === "in"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
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
          <h3 className="text-lg font-bold text-slate-900 dark:text-white text-xs mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              to="/inventory-manager/stock/balance"
              className="flex items-center text-xs gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors border border-blue-100 dark:border-blue-800"
            >
              <Package size={20} className="text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Stock Balance
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Check current inventory levels
                </p>
              </div>
            </Link>
            <Link
              to="/inventory-manager/stock/entries"
              className="flex items-center text-xs gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg transition-colors border border-emerald-100 dark:border-emerald-800"
            >
              <Boxes size={20} className="text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-medium text-emerald-900 dark:text-emerald-100">
                  Stock Entries
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  View all stock movements
                </p>
              </div>
            </Link>
            <Link
              to="/inventory-manager/purchase-orders"
              className="flex items-center text-xs gap-3 p-3 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors border border-purple-100 dark:border-purple-800"
            >
              <FileText
                size={20}
                className="text-purple-600 dark:text-purple-400"
              />
              <div>
                <p className="font-medium text-purple-900 dark:text-blue-100">
                  Purchase Orders
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  Create new PO
                </p>
              </div>
            </Link>
            <Link
              to="/inventory-manager/purchase-receipt"
              className="flex items-center text-xs gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg transition-colors border border-emerald-100 dark:border-emerald-800"
            >
              <Truck
                size={20}
                className="text-emerald-600 dark:text-emerald-400"
              />
              <div>
                <p className="font-medium text-emerald-900 dark:text-emerald-100">
                  Purchase Receipt
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Create new receipt
                </p>
              </div>
            </Link>
            <Link
              to="/inventory-manager/grn-processing"
              className="flex items-center text-xs gap-3 p-3 bg-cyan-50 dark:bg-cyan-900/30 hover:bg-cyan-100 dark:hover:bg-cyan-900 rounded-lg transition-colors border border-cyan-100 dark:border-cyan-800"
            >
              <CheckCircle size={20} className="text-cyan-600 dark:text-cyan-400" />
              <div>
                <p className="font-medium text-cyan-900 dark:text-cyan-100">
                  GRN Processing
                </p>
                <p className="text-xs text-cyan-700 dark:text-cyan-300">
                  Quality Inspections
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});

const InventoryManagerDashboard = () => {
  const [dateRange, setDateRange] = useState("30days");

  const navigationItems = React.useMemo(() => [
    {
      title: "Dashboard",
      path: "/inventory-manager/dashboard",
      icon: Package,
    },
    {
      title: "Material Requests",
      path: "/inventory-manager/material-requests",
      icon: ClipboardList,
    },
    {
      title: "Warehouses",
      path: "/inventory-manager/warehouses",
      icon: Warehouse,
    },
    {
      title: "Stock Management",
      icon: Boxes,
      submenu: [
        {
          title: "Stock Entries",
          path: "/inventory-manager/stock/entries",
          icon: ClipboardList,
        },
        {
          title: "Stock Balance",
          path: "/inventory-manager/stock/balance",
          icon: Package,
        },
        {
          title: "Stock Movements",
          path: "/inventory-manager/stock/movements",
          icon: RefreshCw,
        },
        {
          title: "Reorder Levels",
          path: "/inventory-manager/stock/reorder",
          icon: AlertTriangle,
        },
      ],
    },
    {
      title: "Inventory Tracking",
      icon: TrendingUp,
      submenu: [
        {
          title: "Track Inventory",
          path: "/inventory-manager/tracking/inventory",
          icon: TrendingUp,
        },
        {
          title: "Batch Management",
          path: "/inventory-manager/tracking/batches",
          icon: Boxes,
        },
        {
          title: "Rack & Shelf",
          path: "/inventory-manager/tracking/location",
          icon: Package,
        },
      ],
    },
    {
      title: "Vendors",
      path: "/inventory-manager/vendors",
      icon: Truck,
    },
    {
      title: "Quotations",
      path: "/inventory-manager/quotations",
      icon: FileText,
    },
    {
      title: "Purchase Orders",
      path: "/inventory-manager/purchase-orders",
      icon: Package,
    },
    {
      title: "Purchase Receipt",
      path: "/inventory-manager/purchase-receipt",
      icon: Truck,
    },
    {
      title: "GRN Processing",
      path: "/inventory-manager/grn-processing",
      icon: CheckCircle,
    },
    {
      title: "Department Tasks",
      path: "/inventory-manager/department-tasks",
      icon: ClipboardList,
    },
  ], []);

  const inventoryTrendData = React.useMemo(() => ({
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
    datasets: [
      {
        label: "Stock Level",
        data: [1200, 1400, 1100, 1600, 1450, 1234],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
        borderWidth: 2,
      },
      {
        label: "Reorder Level",
        data: [800, 800, 800, 800, 800, 800],
        borderColor: "rgb(239, 68, 68)",
        borderDash: [5, 5],
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  }), []);

  const stockMovementData = React.useMemo(() => ({
    labels: ["Inbound", "Outbound", "Transfers", "Adjustments"],
    datasets: [
      {
        label: "Units",
        data: [420, 380, 120, 45],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(249, 115, 22, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(168, 85, 247, 0.8)",
        ],
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(249, 115, 22)",
          "rgb(59, 130, 246)",
          "rgb(168, 85, 247)",
        ],
        borderWidth: 1,
      },
    ],
  }), []);

  const stockStatusData = React.useMemo(() => ({
    labels: ["Optimal", "Low Stock", "Critical", "Overstock"],
    datasets: [
      {
        data: [65, 18, 12, 5],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(249, 115, 22, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(168, 85, 247, 0.8)",
        ],
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(249, 115, 22)",
          "rgb(239, 68, 68)",
          "rgb(168, 85, 247)",
        ],
        borderWidth: 1,
      },
    ],
  }), []);

  const handleExport = useCallback(() => {
    console.log("Export dashboard data");
  }, []);

  const chartOptions = React.useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          padding: 15,
          font: { size: 12 },
        },
      },
    },
  }), []);

  return (
    <RoleDashboardLayout
      roleNavigation={navigationItems}
      roleName="Inventory Manager"
      roleIcon={Package}
    >
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      }>
        <Routes>
          <Route
            path="/"
            element={
              <DashboardContent
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
          <Route path="/material-requests" element={<MaterialRequestsPage />} />
          <Route path="/warehouses" element={<WarehousesPage />} />
          <Route path="/stock/balance" element={<StockBalancePage />} />
          <Route path="/stock/entries" element={<StockEntriesPage />} />
          <Route path="/stock/view" element={<Navigate to="/inventory-manager/stock/balance" replace />} />
          <Route path="/stock/movements" element={<StockMovementsPage />} />
          <Route path="/stock/reorder" element={<ReorderLevelsPage />} />
          <Route path="/tracking/inventory" element={<TrackInventoryPage />} />
          <Route path="/tracking/batches" element={<BatchManagementPage />} />
          <Route path="/tracking/location" element={<RackAndShelfPage />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/quotations" element={<Navigate to="sent" replace />} />
          <Route path="/quotations/sent" element={<QuotationsPage defaultTab="outbound" />} />
          <Route path="/quotations/received" element={<QuotationsPage defaultTab="inbound" />} />
          <Route
            path="/quotations/new"
            element={<CreateQuotationPage />}
          />
          <Route path="/purchase-orders" element={<PurchaseOrderPage />} />
          <Route path="/purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
          <Route path="/purchase-orders/edit/:id" element={<PurchaseOrderEditPage />} />
          <Route path="/purchase-receipt" element={<PurchaseReceiptPage />} />
          <Route path="/grn-processing" element={<GRNProcessingPage />} />
          <Route path="/department-tasks" element={<InventoryTasksPage />} />
          <Route
            path="*"
            element={<Navigate to="/inventory-manager/dashboard" replace />}
          />
        </Routes>
      </Suspense>
    </RoleDashboardLayout>
  );
};

export default InventoryManagerDashboard;