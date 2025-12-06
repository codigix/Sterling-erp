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

const OverviewTab = ({ kpis }) => (
  <div className="w-full space-y-8 overflow-x-hidden">
    {/* Enhanced KPI Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Projects */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
        <Card className="h-full hover:shadow-lg transition-all duration-300 border border-blue-100 dark:border-blue-900">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Total Projects
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {kpis.totalProjects}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Active & Completed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
        <Card className="h-full hover:shadow-lg transition-all duration-300 border border-emerald-100 dark:border-emerald-900">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Active Projects
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {kpis.activeProjects}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                  {Math.round((kpis.activeProjects / kpis.totalProjects) * 100)}
                  % of total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Employees */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-amber-400 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
        <Card className="h-full hover:shadow-lg transition-all duration-300 border border-amber-100 dark:border-amber-900">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Active Employees
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {kpis.activeEmployees}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
                  {Math.round(
                    (kpis.activeEmployees / kpis.totalEmployees) * 100
                  )}
                  % of workforce
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-400 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
        <Card className="h-full hover:shadow-lg transition-all duration-300 border border-red-100 dark:border-red-900">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-3 bg-red-100 dark:bg-red-900 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Critical Alerts
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {kpis.criticalAlerts}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
                  Require attention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* Charts Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Project Status Distribution */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <PieChart className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <span>Project Status Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-72">
            <Doughnut
              data={{
                labels: ["On Track", "Delayed", "Critical", "Completed"],
                datasets: [
                  {
                    data: [12, 4, 2, 6],
                    backgroundColor: [
                      "#10b981",
                      "#f59e0b",
                      "#ef4444",
                      "#64748b",
                    ],
                    borderColor: ["#ecfdf5", "#fef3c7", "#fef2f2", "#f1f5f9"],
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { padding: 15, font: { size: 12, weight: 500 } },
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance Trend */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span>Monthly Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-72">
            <Line
              data={{
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                datasets: [
                  {
                    label: "Projects Completed",
                    data: [2, 3, 1, 4, 2, 3],
                    borderColor: "#3b82f6",
                    backgroundColor: "#3b82f610",
                    borderWidth: 3,
                    fill: true,
                    pointRadius: 5,
                    pointBackgroundColor: "#3b82f6",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2,
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: { beginAtZero: true, grid: { color: "#e2e8f020" } },
                  x: { grid: { color: "#e2e8f020" } },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Summary Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Completion Rate
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {Math.round(
                  (kpis.completedProjects / kpis.totalProjects) * 100
                )}
                %
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                System Uptime
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {kpis.systemUptime}%
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
              <Zap className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Pending Tasks
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {kpis.pendingTasks}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const ProjectsTab = ({ projects }) => (
  <div className="w-full space-y-8 overflow-x-hidden">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Projects List */}
      <div className="lg:col-span-2">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span>Active Projects</span>
              </CardTitle>
              <Badge variant="secondary">{projects.progress.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {projects.progress.map((project, index) => (
                <div
                  key={index}
                  className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        {project.name}
                      </h4>
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={
                            project.status === "On Track"
                              ? "success"
                              : project.status === "Delayed"
                              ? "warning"
                              : "error"
                          }
                          className="text-xs"
                        >
                          {project.status}
                        </Badge>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Due: {project.deadline}
                        </span>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        project.status === "On Track"
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                          : project.status === "Delayed"
                          ? "bg-gradient-to-r from-amber-500 to-amber-600"
                          : "bg-gradient-to-r from-red-500 to-red-600"
                      }`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Summary Sidebar */}
      <div className="space-y-6">
        {/* Timeline Stats */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-base">Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Completed This Month
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  6
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  In Progress
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  18
                </p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="w-3 h-3 bg-amber-500 rounded-full mr-3 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Delayed
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  4
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
            <CardTitle className="text-base flex items-center space-x-2">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <span>Average Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {Math.round(
                  projects.progress.reduce((acc, p) => acc + p.progress, 0) /
                    projects.progress.length
                )}
                %
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                across all projects
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

// Department Productivity Analytics Tab
const DepartmentsTab = () => {
  const departmentData = [
    {
      name: "Engineering",
      tasksCompleted: 145,
      totalTasks: 160,
      efficiency: 91,
      avgTime: "2.3 days",
      employees: 28,
      status: "Excellent",
    },
    {
      name: "Procurement",
      tasksCompleted: 89,
      totalTasks: 95,
      efficiency: 94,
      avgTime: "1.8 days",
      employees: 12,
      status: "Excellent",
    },
    {
      name: "Quality Control",
      tasksCompleted: 203,
      totalTasks: 210,
      efficiency: 97,
      avgTime: "0.8 days",
      employees: 18,
      status: "Excellent",
    },
    {
      name: "Production",
      tasksCompleted: 312,
      totalTasks: 340,
      efficiency: 92,
      avgTime: "3.1 days",
      employees: 45,
      status: "Good",
    },
    {
      name: "Warehouse",
      tasksCompleted: 178,
      totalTasks: 185,
      efficiency: 96,
      avgTime: "1.2 days",
      employees: 15,
      status: "Excellent",
    },
    {
      name: "Sales",
      tasksCompleted: 67,
      totalTasks: 72,
      efficiency: 93,
      avgTime: "2.8 days",
      employees: 8,
      status: "Good",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Excellent":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
      case "Good":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400";
      case "Average":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400";
      case "Poor":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
      default:
        return "text-slate-600 bg-slate-100 dark:bg-slate-900 dark:text-slate-400";
    }
  };

  return (
    <div className="w-full space-y-6 overflow-x-hidden">
      {/* Department Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departmentData.map((dept, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center">
                  <Factory className="w-5 h-5 mr-2 text-primary-600" />
                  {dept.name}
                </span>
                <Badge className={getStatusColor(dept.status)}>
                  {dept.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Tasks Completed
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {dept.tasksCompleted}/{dept.totalTasks}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Efficiency
                  </p>
                  <p className="text-xl font-bold text-green-600">
                    {dept.efficiency}%
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Avg. Completion Time
                  </span>
                  <span className="font-medium">{dept.avgTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Active Employees
                  </span>
                  <span className="font-medium">{dept.employees}</span>
                </div>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${dept.efficiency}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Department Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Department Efficiency Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar
                data={{
                  labels: departmentData.map((d) => d.name),
                  datasets: [
                    {
                      label: "Efficiency %",
                      data: departmentData.map((d) => d.efficiency),
                      backgroundColor: "#475569",
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: (value) => value + "%",
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Task Distribution by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut
                data={{
                  labels: departmentData.map((d) => d.name),
                  datasets: [
                    {
                      data: departmentData.map((d) => d.tasksCompleted),
                      backgroundColor: [
                        "#3b82f6",
                        "#10b981",
                        "#f59e0b",
                        "#ef4444",
                        "#8b5cf6",
                        "#06b6d4",
                        "#84cc16",
                        "#f97316",
                      ],
                      borderWidth: 0,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "bottom", labels: { boxWidth: 12 } },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LineChart className="w-5 h-5 mr-2" />
            Department Performance Trends (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Line
              data={{
                labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                datasets: [
                  {
                    label: "Engineering",
                    data: [86, 88, 89, 90, 91, 91],
                    borderColor: "#3b82f6",
                    backgroundColor: "#3b82f620",
                    tension: 0.4,
                  },
                  {
                    label: "Procurement",
                    data: [89, 91, 92, 93, 93, 94],
                    borderColor: "#10b981",
                    backgroundColor: "#10b98120",
                    tension: 0.4,
                  },
                  {
                    label: "Quality Control",
                    data: [95, 96, 96, 97, 97, 97],
                    borderColor: "#f59e0b",
                    backgroundColor: "#f59e0b20",
                    tension: 0.4,
                  },
                  {
                    label: "Production",
                    data: [87, 89, 90, 91, 91, 92],
                    borderColor: "#ef4444",
                    backgroundColor: "#ef444420",
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" },
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    min: 80,
                    max: 100,
                    ticks: {
                      callback: (value) => value + "%",
                    },
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Vendor Performance Dashboard Tab
const VendorsTab = () => {
  const vendorData = [
    {
      name: "SteelCorp Industries",
      totalOrders: 45,
      onTimeDelivery: 42,
      qualityRating: 4.8,
      avgDeliveryTime: "8.5 days",
      totalValue: 1250000,
      status: "Excellent",
      category: "Raw Materials",
    },
    {
      name: "Precision Components Ltd",
      totalOrders: 38,
      onTimeDelivery: 35,
      qualityRating: 4.6,
      avgDeliveryTime: "6.2 days",
      totalValue: 890000,
      status: "Excellent",
      category: "Machined Parts",
    },
    {
      name: "ElectroTech Solutions",
      totalOrders: 29,
      onTimeDelivery: 25,
      qualityRating: 4.3,
      avgDeliveryTime: "10.1 days",
      totalValue: 675000,
      status: "Good",
      category: "Electronics",
    },
    {
      name: "MetalWorks Pro",
      totalOrders: 52,
      onTimeDelivery: 48,
      qualityRating: 4.7,
      avgDeliveryTime: "7.8 days",
      totalValue: 1450000,
      status: "Excellent",
      category: "Raw Materials",
    },
    {
      name: "FastTrack Logistics",
      totalOrders: 67,
      onTimeDelivery: 58,
      qualityRating: 4.2,
      avgDeliveryTime: "12.3 days",
      totalValue: 320000,
      status: "Average",
      category: "Logistics",
    },
    {
      name: "Quality Bearings Inc",
      totalOrders: 31,
      onTimeDelivery: 29,
      qualityRating: 4.9,
      avgDeliveryTime: "5.7 days",
      totalValue: 450000,
      status: "Excellent",
      category: "Components",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Excellent":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
      case "Good":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400";
      case "Average":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400";
      case "Poor":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
      default:
        return "text-slate-600 bg-slate-100 dark:bg-slate-900 dark:text-slate-400";
    }
  };

  const getQualityColor = (rating) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-blue-600";
    if (rating >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="w-full space-y-6 overflow-x-hidden">
      {/* Vendor Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendorData.map((vendor, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-primary-600" />
                  {vendor.name}
                </span>
                <Badge className={getStatusColor(vendor.status)}>
                  {vendor.status}
                </Badge>
              </CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {vendor.category}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    On-Time Delivery
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {vendor.onTimeDelivery}/{vendor.totalOrders}
                  </p>
                  <p className="text-sm text-green-600">
                    {Math.round(
                      (vendor.onTimeDelivery / vendor.totalOrders) * 100
                    )}
                    %
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Quality Rating
                  </p>
                  <p
                    className={`text-xl font-bold ${getQualityColor(
                      vendor.qualityRating
                    )}`}
                  >
                    {vendor.qualityRating}/5.0
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Avg. Delivery Time
                  </span>
                  <span className="font-medium">{vendor.avgDeliveryTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Total Value
                  </span>
                  <span className="font-medium">
                    ₹{vendor.totalValue.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (vendor.onTimeDelivery / vendor.totalOrders) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vendor Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Vendor Delivery Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar
                data={{
                  labels: vendorData.map((v) => v.name.split(" ")[0]),
                  datasets: [
                    {
                      label: "On-Time Delivery %",
                      data: vendorData.map((v) =>
                        Math.round((v.onTimeDelivery / v.totalOrders) * 100)
                      ),
                      backgroundColor: "#475569",
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: (value) => value + "%",
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Vendor Categories Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut
                data={{
                  labels: [
                    "Raw Materials",
                    "Machined Parts",
                    "Electronics",
                    "Logistics",
                    "Components",
                  ],
                  datasets: [
                    {
                      data: [2, 1, 1, 1, 1], // Count of vendors per category
                      backgroundColor: [
                        "#3b82f6",
                        "#10b981",
                        "#f59e0b",
                        "#ef4444",
                        "#8b5cf6",
                        "#06b6d4",
                      ],
                      borderWidth: 0,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "bottom", labels: { boxWidth: 12 } },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Quality & Cost Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Quality Ratings Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line
                data={{
                  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                  datasets: [
                    {
                      label: "Average Quality Rating",
                      data: [4.5, 4.6, 4.4, 4.7, 4.5, 4.6],
                      borderColor: "#10b981",
                      backgroundColor: "#10b98120",
                      tension: 0.4,
                    },
                    {
                      label: "Target Rating (4.5)",
                      data: [4.5, 4.5, 4.5, 4.5, 4.5, 4.5],
                      borderColor: "#f59e0b",
                      borderDash: [5, 5],
                      fill: false,
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "top" },
                  },
                  scales: {
                    y: {
                      beginAtZero: false,
                      min: 4.0,
                      max: 5.0,
                      ticks: {
                        stepSize: 0.1,
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Vendor Spending Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    Top Vendor
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    MetalWorks Pro
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">₹14.5L</p>
                  <p className="text-sm text-slate-500">23% of total</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    Total Monthly Spend
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    All Vendors
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    ₹45.2L
                  </p>
                  <p className="text-sm text-green-600">+8% vs last month</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    Cost Savings
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    This Quarter
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">₹2.8L</p>
                  <p className="text-sm text-slate-500">12% reduction</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Material Movement Reports Tab
const MaterialsTab = () => {
  const materialData = [
    {
      name: "Steel Alloy A36",
      category: "Raw Materials",
      currentStock: 1250,
      minStock: 500,
      maxStock: 2000,
      unit: "kg",
      location: "Warehouse A",
      lastMovement: "2025-11-20",
      status: "Optimal",
    },
    {
      name: "Aluminum 6061",
      category: "Raw Materials",
      currentStock: 320,
      minStock: 400,
      maxStock: 1500,
      unit: "kg",
      location: "Warehouse B",
      lastMovement: "2025-11-19",
      status: "Low Stock",
    },
    {
      name: "Titanium Grade 5",
      category: "Special Alloys",
      currentStock: 85,
      minStock: 100,
      maxStock: 300,
      unit: "kg",
      location: "Secure Vault",
      lastMovement: "2025-11-18",
      status: "Critical",
    },
    {
      name: "Copper Wire 14AWG",
      category: "Electrical",
      currentStock: 2500,
      minStock: 800,
      maxStock: 5000,
      unit: "meters",
      location: "Warehouse A",
      lastMovement: "2025-11-20",
      status: "Optimal",
    },
    {
      name: "Ball Bearings 10mm",
      category: "Components",
      currentStock: 15000,
      minStock: 5000,
      maxStock: 25000,
      unit: "pieces",
      location: "Warehouse C",
      lastMovement: "2025-11-19",
      status: "Optimal",
    },
    {
      name: "Carbon Fiber Sheets",
      category: "Composites",
      currentStock: 45,
      minStock: 50,
      maxStock: 200,
      unit: "sheets",
      location: "Climate Control",
      lastMovement: "2025-11-17",
      status: "Low Stock",
    },
  ];

  const movementLogs = [
    {
      id: "MOV001",
      material: "Steel Alloy A36",
      type: "Inbound",
      quantity: 500,
      from: "SteelCorp Industries",
      to: "Warehouse A",
      date: "2025-11-20",
      status: "Completed",
    },
    {
      id: "MOV002",
      material: "Aluminum 6061",
      type: "Outbound",
      quantity: 150,
      from: "Warehouse B",
      to: "Production Line 3",
      date: "2025-11-19",
      status: "Completed",
    },
    {
      id: "MOV003",
      material: "Copper Wire 14AWG",
      type: "Transfer",
      quantity: 800,
      from: "Warehouse A",
      to: "Warehouse C",
      date: "2025-11-19",
      status: "In Transit",
    },
    {
      id: "MOV004",
      material: "Ball Bearings 10mm",
      type: "Outbound",
      quantity: 2000,
      from: "Warehouse C",
      to: "Assembly Line 1",
      date: "2025-11-18",
      status: "Completed",
    },
    {
      id: "MOV005",
      material: "Titanium Grade 5",
      type: "Inbound",
      quantity: 25,
      from: "Precision Components Ltd",
      to: "Secure Vault",
      date: "2025-11-18",
      status: "Completed",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Optimal":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
      case "Low Stock":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400";
      case "Critical":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
      case "Overstock":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400";
      default:
        return "text-slate-600 bg-slate-100 dark:bg-slate-900 dark:text-slate-400";
    }
  };

  const getMovementTypeColor = (type) => {
    switch (type) {
      case "Inbound":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
      case "Outbound":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
      case "Transfer":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400";
      default:
        return "text-slate-600 bg-slate-100 dark:bg-slate-900 dark:text-slate-400";
    }
  };

  const getStockLevel = (current, min, max) => {
    const percentage = (current / max) * 100;
    if (current <= min)
      return { level: "Critical", color: "bg-red-500", percentage };
    if (current <= min * 1.2)
      return { level: "Low", color: "bg-yellow-500", percentage };
    if (current >= max * 0.9)
      return { level: "High", color: "bg-blue-500", percentage };
    return { level: "Optimal", color: "bg-green-500", percentage };
  };

  return (
    <div className="w-full space-y-8 overflow-x-hidden">
      {/* Material Stock Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materialData.map((material, index) => {
          const stockInfo = getStockLevel(
            material.currentStock,
            material.minStock,
            material.maxStock
          );
          return (
            <div key={index} className="group relative">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${
                  material.status === "Optimal"
                    ? "from-emerald-600 to-emerald-400"
                    : material.status === "Low Stock"
                    ? "from-amber-600 to-amber-400"
                    : "from-red-600 to-red-400"
                } rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              ></div>
              <Card
                className="h-full hover:shadow-lg transition-all duration-300 border-l-4"
                style={{
                  borderLeftColor:
                    material.status === "Optimal"
                      ? "#10b981"
                      : material.status === "Low Stock"
                      ? "#f59e0b"
                      : "#ef4444",
                }}
              >
                <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-700">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="truncate">{material.name}</span>
                    </span>
                    <Badge
                      className={getStatusColor(material.status)}
                      style={{ fontSize: "0.75rem" }}
                    >
                      {material.status}
                    </Badge>
                  </CardTitle>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {material.category}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Current Stock
                      </p>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {material.currentStock.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {material.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Stock Level
                      </p>
                      <p
                        className={`text-lg font-bold ${
                          stockInfo.level === "Critical"
                            ? "text-red-600"
                            : stockInfo.level === "Low"
                            ? "text-amber-600"
                            : stockInfo.level === "High"
                            ? "text-blue-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {stockInfo.level}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Min/Max:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {material.minStock}/{material.maxStock}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Location:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {material.location}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${stockInfo.color}`}
                      style={{
                        width: `${Math.min(stockInfo.percentage, 100)}%`,
                      }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Material Movement Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Stock Level Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-72">
              <Bar
                data={{
                  labels: ["Optimal", "Low Stock", "Critical", "Overstock"],
                  datasets: [
                    {
                      label: "Number of Materials",
                      data: [3, 2, 1, 0],
                      backgroundColor: [
                        "#10b981",
                        "#f59e0b",
                        "#ef4444",
                        "#3b82f6",
                      ],
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true, grid: { color: "#e2e8f020" } },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                <PieChart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span>Material Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-72">
              <Doughnut
                data={{
                  labels: [
                    "Raw Materials",
                    "Components",
                    "Electrical",
                    "Special Alloys",
                    "Composites",
                  ],
                  datasets: [
                    {
                      data: [2, 1, 1, 1, 1],
                      backgroundColor: [
                        "#3b82f6",
                        "#10b981",
                        "#f59e0b",
                        "#ef4444",
                        "#8b5cf6",
                      ],
                      borderColor: [
                        "#ecf0f1",
                        "#ecf0f1",
                        "#ecf0f1",
                        "#ecf0f1",
                        "#ecf0f1",
                      ],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: { padding: 15, font: { size: 12, weight: 500 } },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Movement Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Recent Material Movements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    Movement ID
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    Material
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    Quantity
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    From → To
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {movementLogs.map((log, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-100 dark:border-slate-800"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                      {log.id}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900 dark:text-slate-100">
                      {log.material}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getMovementTypeColor(log.type)}>
                        {log.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900 dark:text-slate-100">
                      {log.quantity}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                      {log.from} → {log.to}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                      {log.date}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          log.status === "Completed"
                            ? "success"
                            : log.status === "In Transit"
                            ? "warning"
                            : "default"
                        }
                      >
                        {log.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Inventory Alerts & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">
                Critical Stock Alerts
              </h4>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">
                      Titanium Grade 5 - Critical Stock
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Current: 85kg (Below minimum: 100kg)
                    </p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium text-yellow-900 dark:text-yellow-100">
                      Aluminum 6061 - Low Stock
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Current: 320kg (Below minimum: 400kg)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">
                Recommendations
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Reorder Alert
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Place order for Titanium Grade 5 (25kg needed)
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Optimization
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Consider redistributing Copper Wire from Warehouse A to C
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Production Delay Monitoring Tab
const ProductionTab = ({ production }) => {
  const [selectedRootCard, setSelectedRootCard] = useState(null);

  const fallbackProductionData = [
    {
      project: "DRDO Missile System",
      stage: "Assembly Phase 2",
      status: "Delayed",
      delayDays: 5,
      estimatedCompletion: "2025-11-25",
      actualCompletion: "2025-11-30",
      bottleneck: "Material Shortage",
      assignedWorkers: 8,
      progress: 78,
    },
    {
      project: "Defense Radar Unit",
      stage: "Testing Phase",
      status: "On Track",
      delayDays: 0,
      estimatedCompletion: "2025-12-01",
      actualCompletion: "2025-12-01",
      bottleneck: "None",
      assignedWorkers: 6,
      progress: 92,
    },
    {
      project: "Naval Communication",
      stage: "Quality Check",
      status: "Delayed",
      delayDays: 3,
      estimatedCompletion: "2025-11-22",
      actualCompletion: "2025-11-25",
      bottleneck: "QC Backlog",
      assignedWorkers: 4,
      progress: 85,
    },
    {
      project: "Aerospace Components",
      stage: "Machining",
      status: "Critical Delay",
      delayDays: 12,
      estimatedCompletion: "2025-11-20",
      actualCompletion: "2025-12-02",
      bottleneck: "Equipment Failure",
      assignedWorkers: 12,
      progress: 45,
    },
  ];

  const bottleneckData = [
    {
      type: "Material Shortage",
      count: 8,
      impact: "High",
      affectedProjects: 3,
    },
    {
      type: "Equipment Failure",
      count: 5,
      impact: "Critical",
      affectedProjects: 2,
    },
    { type: "QC Backlog", count: 12, impact: "Medium", affectedProjects: 4 },
    { type: "Labor Shortage", count: 3, impact: "Low", affectedProjects: 1 },
    { type: "Vendor Delay", count: 6, impact: "High", affectedProjects: 2 },
  ];

  const getDelayStatusColor = (status) => {
    switch (status) {
      case "On Track":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
      case "Delayed":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400";
      case "Critical Delay":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
      default:
        return "text-slate-600 bg-slate-100 dark:bg-slate-900 dark:text-slate-400";
    }
  };

  const getBottleneckImpactColor = (impact) => {
    switch (impact) {
      case "Critical":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
      case "High":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-400";
      case "Medium":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400";
      case "Low":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
      default:
        return "text-slate-600 bg-slate-100 dark:bg-slate-900 dark:text-slate-400";
    }
  };

  const displayData =
    production?.rootCards && production.rootCards.length > 0
      ? production.rootCards
      : fallbackProductionData;

  if (selectedRootCard) {
    return (
      <ProductionPlanDetail
        rootCard={selectedRootCard}
        onRefresh={() => setSelectedRootCard(null)}
      />
    );
  }

  return (
    <div className="w-full space-y-6 overflow-x-hidden">
      {/* Production Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  On Track
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  12
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Delayed
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  8
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Critical
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  3
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Timer className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Avg Delay
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  5.2 days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Delay Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Production Delay Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      {item.project}
                    </h4>
                    <Badge className={getDelayStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {item.stage}
                  </p>
                  <div className="flex items-center mb-2">
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 mr-4">
                      <div
                        className={`h-2 rounded-full ${
                          item.status === "On Track"
                            ? "bg-green-500"
                            : item.status === "Delayed"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {item.progress}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">
                        Delay:
                      </span>
                      <span
                        className={`ml-1 font-medium ${
                          item.delayDays === 0
                            ? "text-green-600"
                            : item.delayDays <= 5
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.delayDays} days
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">
                        Workers:
                      </span>
                      <span className="ml-1 font-medium">
                        {item.assignedWorkers}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Bottleneck
                  </p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {item.bottleneck}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Due: {item.actualCompletion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottleneck Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="w-5 h-5 mr-2" />
              Bottleneck Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bottleneckData.map((bottleneck, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {bottleneck.type}
                      </h4>
                      <Badge
                        className={getBottleneckImpactColor(bottleneck.impact)}
                      >
                        {bottleneck.impact}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {bottleneck.count} occurrences •{" "}
                      {bottleneck.affectedProjects} projects affected
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          bottleneck.impact === "Critical"
                            ? "bg-red-500"
                            : bottleneck.impact === "High"
                            ? "bg-orange-500"
                            : bottleneck.impact === "Medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${(bottleneck.count / 15) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Delay Impact by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar
                data={{
                  labels: ["Material", "Equipment", "QC", "Labor", "Vendor"],
                  datasets: [
                    {
                      label: "Delay Days",
                      data: [25, 18, 15, 8, 12],
                      backgroundColor: [
                        "#ef4444",
                        "#f59e0b",
                        "#3b82f6",
                        "#10b981",
                        "#8b5cf6",
                      ],
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: "Total Delay Days",
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Escalation Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Escalation Alerts & Actions Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-900 dark:text-red-100">
                    Critical: Aerospace Components Project
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    12-day delay due to equipment failure. Production Head
                    notified. Urgent maintenance team dispatch required.
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-red-600 dark:text-red-400">
                      Escalated to: Production Head
                    </span>
                    <span className="mx-2">•</span>
                    <span className="text-xs text-red-600 dark:text-red-400">
                      Priority: Critical
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                    Delay: DRDO Missile System
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    5-day delay due to material shortage. Supplier contacted for
                    expedited delivery.
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">
                      Escalated to: Procurement Manager
                    </span>
                    <span className="mx-2">•</span>
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">
                      Priority: High
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    QC Backlog Alert
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Quality Control team overloaded. Consider redistributing
                    workload or hiring temporary staff.
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      Action Required: Resource Allocation
                    </span>
                    <span className="mx-2">•</span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      Priority: Medium
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Employee Performance Analytics Tab
const EmployeesTab = () => {
  const employeeData = [
    {
      name: "Rajesh Kumar",
      department: "Production",
      role: "Senior Machinist",
      tasksCompleted: 45,
      totalTasks: 48,
      efficiency: 94,
      avgTime: "6.2 hrs",
      qualityScore: 4.8,
      attendance: 98,
      status: "Excellent",
    },
    {
      name: "Priya Sharma",
      department: "Quality Control",
      role: "QC Inspector",
      tasksCompleted: 38,
      totalTasks: 40,
      efficiency: 95,
      avgTime: "4.8 hrs",
      qualityScore: 4.9,
      attendance: 100,
      status: "Excellent",
    },
    {
      name: "Amit Singh",
      department: "Engineering",
      role: "Design Engineer",
      tasksCompleted: 22,
      totalTasks: 25,
      efficiency: 88,
      avgTime: "8.5 hrs",
      qualityScore: 4.6,
      attendance: 95,
      status: "Good",
    },
    {
      name: "Sneha Patel",
      department: "Procurement",
      role: "Procurement Officer",
      tasksCompleted: 31,
      totalTasks: 35,
      efficiency: 89,
      avgTime: "5.7 hrs",
      qualityScore: 4.4,
      attendance: 97,
      status: "Good",
    },
    {
      name: "Vikram Rao",
      department: "Warehouse",
      role: "Inventory Manager",
      tasksCompleted: 28,
      totalTasks: 30,
      efficiency: 93,
      avgTime: "7.1 hrs",
      qualityScore: 4.7,
      attendance: 99,
      status: "Excellent",
    },
    {
      name: "Kavita Jain",
      department: "Sales",
      role: "Sales Executive",
      tasksCompleted: 15,
      totalTasks: 18,
      efficiency: 83,
      avgTime: "6.8 hrs",
      qualityScore: 4.2,
      attendance: 92,
      status: "Average",
    },
  ];

  const departmentStats = [
    {
      department: "Production",
      avgEfficiency: 91,
      avgQuality: 4.6,
      totalEmployees: 45,
      topPerformer: "Rajesh Kumar",
    },
    {
      department: "Quality Control",
      avgEfficiency: 93,
      avgQuality: 4.8,
      totalEmployees: 18,
      topPerformer: "Priya Sharma",
    },
    {
      department: "Engineering",
      avgEfficiency: 87,
      avgQuality: 4.5,
      totalEmployees: 28,
      topPerformer: "Amit Singh",
    },
    {
      department: "Procurement",
      avgEfficiency: 89,
      avgQuality: 4.4,
      totalEmployees: 12,
      topPerformer: "Sneha Patel",
    },
    {
      department: "Warehouse",
      avgEfficiency: 92,
      avgQuality: 4.6,
      totalEmployees: 15,
      topPerformer: "Vikram Rao",
    },
    {
      department: "Sales",
      avgEfficiency: 82,
      avgQuality: 4.1,
      totalEmployees: 8,
      topPerformer: "Kavita Jain",
    },
  ];

  const getPerformanceColor = (status) => {
    switch (status) {
      case "Excellent":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
      case "Good":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400";
      case "Average":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400";
      case "Poor":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
      default:
        return "text-slate-600 bg-slate-100 dark:bg-slate-900 dark:text-slate-400";
    }
  };

  const getQualityColor = (score) => {
    if (score >= 4.5) return "text-green-600";
    if (score >= 4.0) return "text-blue-600";
    if (score >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="w-full space-y-6 overflow-x-hidden">
      {/* Employee Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Top Performers
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  18
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Avg Efficiency
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  89%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Target className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Avg Quality
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  4.5/5.0
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Avg Attendance
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  97%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="w-5 h-5 mr-2" />
            Top Performing Employees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {employeeData.slice(0, 4).map((employee, index) => (
              <div
                key={index}
                className="flex items-center p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                      {employee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      {employee.name}
                    </h4>
                    <Badge className={getPerformanceColor(employee.status)}>
                      {employee.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {employee.role} • {employee.department}
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">
                        Efficiency
                      </span>
                      <p className="font-medium text-green-600">
                        {employee.efficiency}%
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">
                        Quality
                      </span>
                      <p
                        className={`font-medium ${getQualityColor(
                          employee.qualityScore
                        )}`}
                      >
                        {employee.qualityScore}/5.0
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">
                        Attendance
                      </span>
                      <p className="font-medium text-blue-600">
                        {employee.attendance}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Performance Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Department Efficiency Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar
                data={{
                  labels: departmentStats.map((d) => d.department),
                  datasets: [
                    {
                      label: "Average Efficiency %",
                      data: departmentStats.map((d) => d.avgEfficiency),
                      backgroundColor: "#475569",
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: (value) => value + "%",
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Performance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut
                data={{
                  labels: ["Excellent", "Good", "Average", "Needs Improvement"],
                  datasets: [
                    {
                      data: [18, 24, 8, 2],
                      backgroundColor: [
                        "#10b981",
                        "#3b82f6",
                        "#f59e0b",
                        "#ef4444",
                      ],
                      borderWidth: 0,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "bottom", labels: { boxWidth: 12 } },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Factory className="w-5 h-5 mr-2" />
            Department Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    Department
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    Employees
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    Avg Efficiency
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    Avg Quality
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    Top Performer
                  </th>
                </tr>
              </thead>
              <tbody>
                {departmentStats.map((dept, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-100 dark:border-slate-800"
                  >
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {dept.department}
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                      {dept.totalEmployees}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-medium ${
                          dept.avgEfficiency >= 90
                            ? "text-green-600"
                            : dept.avgEfficiency >= 85
                            ? "text-blue-600"
                            : dept.avgEfficiency >= 80
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {dept.avgEfficiency}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-medium ${getQualityColor(
                          dept.avgQuality
                        )}`}
                      >
                        {dept.avgQuality}/5.0
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                      {dept.topPerformer}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Performance Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">
                Strengths
              </h4>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      Quality Control Excellence
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      QC team maintains 4.8/5.0 average quality score
                    </p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      High Attendance Rate
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      97% average attendance across all departments
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">
                Areas for Improvement
              </h4>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium text-yellow-900 dark:text-yellow-100">
                      Sales Performance
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Sales team efficiency at 82% - consider additional
                      training
                    </p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <Target className="w-5 h-5 text-orange-600 mr-3" />
                  <div>
                    <p className="font-medium text-orange-900 dark:text-orange-100">
                      Engineering Workload
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Consider redistributing complex tasks to balance workload
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Resource & Bottleneck Management Tab
const ResourcesTab = () => {
  const resourceData = [
    {
      type: "Machining Centers",
      total: 12,
      available: 8,
      utilization: 67,
      status: "Optimal",
      bottleneck: false,
    },
    {
      type: "Quality Control Stations",
      total: 6,
      available: 2,
      utilization: 67,
      status: "High Utilization",
      bottleneck: true,
    },
    {
      type: "Assembly Workstations",
      total: 15,
      available: 12,
      utilization: 80,
      status: "High Utilization",
      bottleneck: false,
    },
    {
      type: "Testing Equipment",
      total: 8,
      available: 6,
      utilization: 75,
      status: "Optimal",
      bottleneck: false,
    },
    {
      type: "Packaging Lines",
      total: 4,
      available: 1,
      utilization: 75,
      status: "Critical",
      bottleneck: true,
    },
    {
      type: "Storage Racks",
      total: 50,
      available: 35,
      utilization: 70,
      status: "Optimal",
      bottleneck: false,
    },
  ];

  const capacityPlanning = [
    {
      resource: "CNC Machining Center A1",
      currentLoad: 85,
      maxCapacity: 100,
      nextAvailable: "2025-11-23",
      queuedProjects: 3,
      recommendation: "Schedule maintenance",
    },
    {
      resource: "Quality Lab Station 1",
      currentLoad: 95,
      maxCapacity: 100,
      nextAvailable: "2025-11-22",
      queuedProjects: 5,
      recommendation: "Add temporary station",
    },
    {
      resource: "Assembly Line 2",
      currentLoad: 78,
      maxCapacity: 100,
      nextAvailable: "2025-11-24",
      queuedProjects: 2,
      recommendation: "Optimal utilization",
    },
  ];

  const optimizationInsights = [
    {
      title: "Workload Balancing",
      description:
        "QC Station 2 is underutilized. Redistribute 30% of QC Station 1 workload.",
      impact: "High",
      savings: "2 hours/day",
      type: "optimization",
    },
    {
      title: "Equipment Maintenance",
      description:
        "Schedule preventive maintenance for Machining Center B3 to avoid breakdowns.",
      impact: "Critical",
      savings: "Prevent 3-day downtime",
      type: "preventive",
    },
    {
      title: "Resource Allocation",
      description:
        "Reallocate 2 assembly workers to packaging line to resolve bottleneck.",
      impact: "High",
      savings: "1.5 days faster delivery",
      type: "reallocation",
    },
    {
      title: "Capacity Expansion",
      description:
        "Consider adding 2 more QC stations based on 6-month growth projection.",
      impact: "Medium",
      savings: "Reduce backlog by 40%",
      type: "expansion",
    },
  ];

  const getResourceStatusColor = (status) => {
    switch (status) {
      case "Optimal":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
      case "High Utilization":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400";
      case "Critical":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
      default:
        return "text-slate-600 bg-slate-100 dark:bg-slate-900 dark:text-slate-400";
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case "Critical":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
      case "High":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-400";
      case "Medium":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400";
      case "Low":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
      default:
        return "text-slate-600 bg-slate-100 dark:bg-slate-900 dark:text-slate-400";
    }
  };

  const getOptimizationIcon = (type) => {
    switch (type) {
      case "optimization":
        return <TrendingUp className="w-5 h-5" />;
      case "preventive":
        return <Wrench className="w-5 h-5" />;
      case "reallocation":
        return <Users className="w-5 h-5" />;
      case "expansion":
        return <Zap className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full space-y-6 overflow-x-hidden">
      {/* Resource Utilization Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Optimal Resources
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  3
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  High Utilization
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  2
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Bottlenecks
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  2
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Avg Utilization
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  72%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Status Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Resource Utilization Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resourceData.map((resource, index) => (
              <div
                key={index}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                    {resource.type}
                  </h4>
                  <div className="flex items-center space-x-2">
                    {resource.bottleneck && (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Bottleneck
                      </Badge>
                    )}
                    <Badge className={getResourceStatusColor(resource.status)}>
                      {resource.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Available
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {resource.available}/{resource.total}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Utilization
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        resource.utilization >= 80
                          ? "text-red-600"
                          : resource.utilization >= 70
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {resource.utilization}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Status
                    </p>
                    <div
                      className={`w-full h-2 rounded-full mt-1 ${
                        resource.utilization >= 80
                          ? "bg-red-500"
                          : resource.utilization >= 70
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${resource.utilization}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Capacity Planning */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Capacity Planning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {capacityPlanning.map((resource, index) => (
                <div
                  key={index}
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      {resource.resource}
                    </h4>
                    <Badge
                      variant={
                        resource.currentLoad >= 90
                          ? "error"
                          : resource.currentLoad >= 80
                          ? "warning"
                          : "success"
                      }
                    >
                      {resource.currentLoad}% Load
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Next Available
                      </p>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {resource.nextAvailable}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Queued Projects
                      </p>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {resource.queuedProjects}
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${
                        resource.currentLoad >= 90
                          ? "bg-red-500"
                          : resource.currentLoad >= 80
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${resource.currentLoad}%` }}
                    ></div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Recommendation:</span>{" "}
                    {resource.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Resource Utilization Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line
                data={{
                  labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
                  datasets: [
                    {
                      label: "Machining Centers",
                      data: [65, 72, 68, 67],
                      borderColor: "#3b82f6",
                      backgroundColor: "#3b82f620",
                      tension: 0.4,
                    },
                    {
                      label: "QC Stations",
                      data: [78, 85, 82, 67],
                      borderColor: "#10b981",
                      backgroundColor: "#10b98120",
                      tension: 0.4,
                    },
                    {
                      label: "Assembly Lines",
                      data: [70, 75, 82, 80],
                      borderColor: "#f59e0b",
                      backgroundColor: "#f59e0b20",
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "top" },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: (value) => value + "%",
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Optimization Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {optimizationInsights.map((insight, index) => (
              <div
                key={index}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <div className="flex items-start">
                  <div
                    className={`p-2 rounded-lg mr-3 ${
                      insight.type === "optimization"
                        ? "bg-blue-100 dark:bg-blue-900"
                        : insight.type === "preventive"
                        ? "bg-yellow-100 dark:bg-yellow-900"
                        : insight.type === "reallocation"
                        ? "bg-green-100 dark:bg-green-900"
                        : "bg-purple-100 dark:bg-purple-900"
                    }`}
                  >
                    {getOptimizationIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">
                        {insight.title}
                      </h4>
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact} Impact
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {insight.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600">
                        Potential Savings: {insight.savings}
                      </span>
                      <Button size="sm" variant="secondary">
                        Implement
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Allocation Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Resource Allocation Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    Resource Type
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    Total Capacity
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    Current Allocation
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    Available
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    Efficiency
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {resourceData.map((resource, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-100 dark:border-slate-800"
                  >
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {resource.type}
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                      {resource.total}
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                      {resource.total - resource.available}
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                      {resource.available}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-medium ${
                          resource.utilization >= 80
                            ? "text-red-600"
                            : resource.utilization >= 70
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {resource.utilization}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={getResourceStatusColor(resource.status)}
                      >
                        {resource.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SalesOrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/sales/orders?status=${filter}`);
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error("Failed to load sales orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (order) => {
    setShowForm(false);
    fetchOrders();
  };

  if (showForm) {
    return (
      <SalesOrderForm
        onSubmit={handleFormSubmit}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    in_progress: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    delivered: "bg-slate-100 text-slate-800",
  };

  return (
    <div className="w-full space-y-6 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Sales Orders
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage all sales orders
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-2" />
          New Sales Order
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          "all",
          "pending",
          "approved",
          "in_progress",
          "completed",
          "delivered",
        ].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Loading...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400">
                No sales orders found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      PO Number
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      Client
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      Order Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      Due Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      Priority
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                    >
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                        {order.po_number}
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                        {order.customer}
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                        {order.currency} {order.total}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {new Date(order.order_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {order.due_date
                          ? new Date(order.due_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            order.priority === "high" ||
                            order.priority === "urgent"
                              ? "bg-red-100 text-red-800"
                              : order.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }
                        >
                          {order.priority.charAt(0).toUpperCase() +
                            order.priority.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            statusColors[order.status] ||
                            "bg-slate-100 text-slate-800"
                          }
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1).replace("_", " ")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
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
