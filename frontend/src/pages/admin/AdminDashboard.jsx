import { useState, useEffect } from "react";
import axios from "../../utils/api";
import Card, { CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import SalesOrderForm from "../../components/admin/SalesOrderForm";
import SalesOrderList from "../../components/admin/SalesOrderList/SalesOrderList";
import {
  BarChart3,
  ShoppingCart,
  Target,
  Factory,
  Truck,
  Package,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  AlertTriangle,
  Zap,
  PieChart,
  TrendingUp,
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
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
  const [kpis, setKpis] = useState({
    total_projects: 0,
    total_orders: 0,
    total_users: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    systemUptime: 0,
    criticalAlerts: 0,
    pendingTasks: 0,
  });
  const [chartData, setChartData] = useState({
    projectsByStatus: { onTrack: 0, delayed: 0, critical: 0, completed: 0 },
    monthlyCompletion: Array(6).fill(0),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const kpiResponse = await axios.get('/api/admin/kpis');
        const kpiData = kpiResponse.data;

        const projectsResponse = await axios.get('/api/admin/projects');
        const projects = projectsResponse.data.projects || [];

        const statusCounts = {
          onTrack: projects.filter(p => p.status === 'in_progress').length,
          delayed: projects.filter(p => p.status === 'on_hold').length,
          critical: projects.filter(p => p.status === 'critical').length,
          completed: projects.filter(p => p.status === 'completed').length,
        };

        setKpis({
          total_projects: kpiData.total_projects || 0,
          total_orders: kpiData.total_orders || 0,
          total_users: kpiData.total_users || 0,
          totalProjects: kpiData.total_projects || 0,
          activeProjects: statusCounts.onTrack + statusCounts.delayed,
          completedProjects: statusCounts.completed,
          totalEmployees: kpiData.total_users || 0,
          activeEmployees: Math.round((kpiData.total_users || 0) * 0.85),
          systemUptime: 99.8,
          criticalAlerts: statusCounts.critical,
          pendingTasks: statusCounts.delayed,
        });

        setChartData({
          projectsByStatus: statusCounts,
          monthlyCompletion: [2, 3, 1, 4, 2, 3],
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading overview data...</div>;
  }

  const metrics = [
    {
      icon: ShoppingCart,
      label: 'Sales Orders',
      value: String(kpis.total_orders),
      trend: '+12%',
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    },
    {
      icon: CheckCircle2,
      label: 'Completed',
      value: String(kpis.completedProjects),
      trend: '+8%',
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    },
    {
      icon: Clock,
      label: 'In Progress',
      value: String(kpis.activeProjects),
      trend: '-2%',
      color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    },
    {
      icon: AlertCircle,
      label: 'Critical',
      value: String(kpis.criticalAlerts),
      trend: '+3%',
      color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    },
  ];

  const navigation = [
    { icon: BarChart3, label: 'Overview', color: 'text-blue-600 dark:text-blue-400' },
    { icon: ShoppingCart, label: 'Sales Orders', color: 'text-green-600 dark:text-green-400' },
    { icon: Target, label: 'Projects', color: 'text-purple-600 dark:text-purple-400' },
    { icon: Factory, label: 'Departments', color: 'text-orange-600 dark:text-orange-400' },
    { icon: Truck, label: 'Vendors', color: 'text-red-600 dark:text-red-400' },
    { icon: Package, label: 'Materials', color: 'text-cyan-600 dark:text-cyan-400' },
    { icon: Users, label: 'Employees', color: 'text-indigo-600 dark:text-indigo-400' },
  ];

  return (
    <div className="w-full min-h-screen bg-white space-y-6 p-4">
      {/* Header */}
      <div>
        <h1 className="text-xl text-left font-bold">
          Dashboard & Overview
        </h1>
        <p className="text-sm text-slate-600 mt-1 text-left">
          Real-time manufacturing system analytics and KPIs
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="bg-white border-2 border-blue-100 rounded-xl p-4 hover:shadow-lg transition-all hover:border-blue-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 uppercase text-left mb-2">
                Total Projects
              </p>
              <p className="text-xl text-left font-bold">
                {kpis.totalProjects}
              </p>
              <p className="text-xs text-left text-blue-600 mt-2 font-medium">
                Active & Completed
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center text-xs justify-center border border-blue-200">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-white border-2 border-emerald-100 rounded-xl p-4 hover:shadow-lg transition-all hover:border-emerald-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 uppercase text-left mb-2">
                Active Projects
              </p>
              <p className="text-xl text-left font-bold">
                {kpis.activeProjects}
              </p>
              <p className="text-xs text-lef text-emerald-600 mt-2 font-semibold">
                {Math.round((kpis.activeProjects / kpis.totalProjects) * 100)}% of total
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl flex items-center text-xs justify-center border border-emerald-200">
                <Activity className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Employees */}
        <div className="bg-white border-2 border-amber-100 rounded-xl p-4 hover:shadow-lg transition-all hover:border-amber-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 uppercase text-left mb-2">
                Active Employees
              </p>
              <p className="text-xl text-left font-bold">
                {kpis.activeEmployees}
              </p>
              <p className="text-xs text-left text-amber-600 mt-2 font-semibold">
                {Math.round((kpis.activeEmployees / kpis.totalEmployees) * 100)}% of workforce
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl flex items-center text-xs justify-center border border-amber-200">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-white border-2 border-red-100 rounded-xl p-4 hover:shadow-lg transition-all hover:border-red-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 uppercase text-left mb-2">
                Critical Alerts
              </p>
              <p className="text-xl text-left font-bold">
                {kpis.criticalAlerts}
              </p>
              <p className="text-xs text-left text-red-600 mt-2 font-semibold">
                Require attention
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-red-100 rounded-xl flex items-center text-xs justify-center border border-red-200">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Project Status Distribution */}
        <Card className="hover:shadow-lg transition-shadow border border-slate-100">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center text-xs gap-4 text-lg">
              <div className="p-2 bg-blue-50 rounded-lg">
                <PieChart className="w-5 h-5 text-blue-600" />
              </div>
              <span className='text-sm'>Project Status Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Doughnut
                data={{
                  labels: [
                    `On Track (${chartData.projectsByStatus.onTrack})`,
                    `Delayed (${chartData.projectsByStatus.delayed})`,
                    `Critical (${chartData.projectsByStatus.critical})`,
                    `Completed (${chartData.projectsByStatus.completed})`
                  ],
                  datasets: [
                    {
                      data: [
                        chartData.projectsByStatus.onTrack,
                        chartData.projectsByStatus.delayed,
                        chartData.projectsByStatus.critical,
                        chartData.projectsByStatus.completed
                      ],
                      backgroundColor: [
                        "#10b981",
                        "#f59e0b",
                        "#ef4444",
                        "#94a3b8",
                      ],
                      borderColor: "#ffffff",
                      borderWidth: 3,
                      hoverOffset: 15,
                      hoverBorderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        padding: 20,
                        font: { size: 13, weight: 500 },
                        usePointStyle: true,
                        pointStyle: 'circle',
                        color: '#1f2937',
                      },
                    },
                    tooltip: {
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      padding: 14,
                      titleFont: { size: 14, weight: 'bold' },
                      bodyFont: { size: 13 },
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      borderWidth: 1,
                      titleColor: '#fff',
                      bodyColor: '#fff',
                      callbacks: {
                        label: function(context) {
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = ((context.parsed / total) * 100).toFixed(1);
                          return `${context.parsed} projects (${percentage}%)`;
                        }
                      }
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Performance Trend */}
        <Card className="hover:shadow-lg transition-shadow border border-slate-100">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center text-xs gap-4 text-lg">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <span className='text-sm'>Projects Completed - 6 Month Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line
                data={{
                  labels: ["January", "February", "March", "April", "May", "June"],
                  datasets: [
                    {
                      label: "Completed",
                      data: chartData.monthlyCompletion,
                      borderColor: "#3b82f6",
                      backgroundColor: "rgba(59, 130, 246, 0.08)",
                      borderWidth: 3,
                      fill: true,
                      pointRadius: 6,
                      pointBackgroundColor: "#3b82f6",
                      pointBorderColor: "#ffffff",
                      pointBorderWidth: 2,
                      pointHoverRadius: 8,
                      pointShadowOffsetX: 0,
                      pointShadowOffsetY: 2,
                      pointShadowBlur: 4,
                      tension: 0.4,
                    },
                    {
                      label: "Target",
                      data: [3, 3, 3, 3, 3, 3],
                      borderColor: "#10b981",
                      borderWidth: 2,
                      borderDash: [5, 5],
                      pointRadius: 0,
                      fill: false,
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'top',
                      labels: {
                        font: { size: 13, weight: 500 },
                        padding: 20,
                        usePointStyle: true,
                        color: '#1f2937',
                      },
                    },
                    tooltip: {
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      padding: 14,
                      titleFont: { size: 14, weight: 'bold' },
                      bodyFont: { size: 13 },
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      borderWidth: 1,
                      titleColor: '#fff',
                      bodyColor: '#fff',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 5,
                      ticks: {
                        stepSize: 1,
                        font: { size: 12 },
                        color: '#6b7280',
                      },
                      grid: {
                        color: "rgba(226, 232, 240, 0.5)",
                        drawBorder: false,
                      },
                    },
                    x: {
                      ticks: { font: { size: 12 }, color: '#6b7280' },
                      grid: { color: "rgba(226, 232, 240, 0.5)", drawBorder: false },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance Bar Chart */}
      <Card className="hover:shadow-lg transition-shadow border border-slate-100">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center text-xs gap-4 text-lg">
            <div className="p-2 bg-purple-50 rounded-lg">
              <BarChart3 className="w-2 h-5 text-purple-600" />
            </div>
            <span className='text-sm'>Department Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Bar
              data={{
                labels: ["Engineering", "Production", "Quality", "Procurement", "HR", "Finance"],
                datasets: [
                  {
                    label: "Performance Score",
                    data: [95, 88, 97, 92, 85, 91],
                    backgroundColor: [
                      "#3b82f6",
                      "#10b981",
                      "#f59e0b",
                      "#ef4444",
                      "#8b5cf6",
                      "#06b6d4",
                    ],
                    borderRadius: 4,
                    borderSkipped: false,
                    hoverBackgroundColor: [
                      "#2563eb",
                      "#059669",
                      "#d97706",
                      "#dc2626",
                      "#7c3aed",
                      "#0891b2",
                    ],
                    borderWidth: 0,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    padding: 14,
                    titleFont: { size: 10, weight: 'bold' },
                    bodyFont: { size: 13 },
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    callbacks: {
                      label: function(context) {
                        return `Score: ${context.parsed.y}%`;
                      }
                    }
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      stepSize: 20,
                      font: { size: 12 },
                      color: '#6b7280',
                      callback: function(value) {
                        return value + '%';
                      }
                    },
                    grid: { color: "rgba(226, 232, 240, 0.5)", drawBorder: false },
                  },
                  x: {
                    ticks: { font: { size: 12 }, color: '#6b7280' },
                    grid: { display: false, drawBorder: false },
                  },
                },
              }}
            />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600 font-medium mb-1">Highest</p>
              <p className="text-lg font-bold">Quality (97%)</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600 font-medium mb-1">Average</p>
              <p className="text-lg font-bold">91%</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600 font-medium mb-1">Lowest</p>
              <p className="text-lg font-bold">HR (85%)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Completion Rate */}
        <Card className="hover:shadow-lg transition-shadow border border-slate-100">
          <CardContent>
            <div className="flex items-center text-xs justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase text-left mb-2">
                  Completion Rate
                </p>
                <p className="text-xl text-left font-bold">
                  {Math.round((kpis.completedProjects / kpis.totalProjects) * 100)}%
                </p>
                <p className="text-xs text-left text-blue-600 mt-2 font-medium">
                  {kpis.completedProjects} of {kpis.totalProjects} complete
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center text-xs justify-center flex-shrink-0 border border-blue-200">
                <CheckCircle2 className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Uptime */}
        <Card className="hover:shadow-lg transition-shadow border border-slate-100">
          <CardContent>
            <div className="flex items-center text-xs justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase text-left mb-2">
                  System Uptime
                </p>
                <p className="text-xl text-left font-bold">
                  {kpis.systemUptime}%
                </p>
                <p className="text-xs text-left text-emerald-600 mt-2 font-medium">
                  Excellent performance
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center text-xs justify-center flex-shrink-0 border border-emerald-200">
                <Zap className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card className="hover:shadow-lg transition-shadow border border-slate-100">
          <CardContent>
            <div className="flex items-center text-xs justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase text-left mb-2">
                  Pending Tasks
                </p>
                <p className="text-xl text-left font-bold">
                  {kpis.pendingTasks}
                </p>
                <p className="text-xs text-left text-amber-600 mt-2 font-medium">
                  Awaiting action
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center text-xs justify-center flex-shrink-0 border border-amber-200">
                <Clock className="w-7 h-7 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


    </div>
  );
};

const SalesOrdersTab = () => {
  const [mode, setMode] = useState('list');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
    setRefreshTrigger(prev => prev + 1);
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
        refreshTrigger={refreshTrigger}
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
