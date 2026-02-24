import React, { useState, useEffect, useCallback } from "react";
import { Link, Routes, Route, Navigate } from "react-router-dom";
import RoleDashboardLayout from "../../components/layout/RoleDashboardLayout";
import ProductionPhasesDisplay from "../../components/production/ProductionPhasesDisplay";
import axios from "../../utils/api";
import { Loader2, Package } from "lucide-react";
import ProductionPlansPage from "../production/ProductionPlansPage";
import ProductionPlanFormPage from "../production/ProductionPlanFormPage";
import SchedulingPage from "../production/SchedulingPage";
import ResourceAllocationPage from "../production/ResourceAllocationPage";
import ProductionSpecificationsPage from "../production/ProductionSpecificationsPage";
import ActiveStagesPage from "../production/ActiveStagesPage";
import StageProgressPage from "../production/StageProgressPage";
import StageDetailsPage from "../production/StageDetailsPage";
import AssignTasksPage from "../production/AssignTasksPage";
import TaskTrackingPage from "../production/TaskTrackingPage";
import PerformancePage from "../production/PerformancePage";
import GenerateChallanPage from "../production/GenerateChallanPage";
import ChallanListPage from "../production/ChallanListPage";
import TrackChallanPage from "../production/TrackChallanPage";
import PerformanceMetricsPage from "../production/PerformanceMetricsPage";
import ProductionTasksPage from "../department/ProductionTasksPage";
import OutsourceTasksPage from "../production/OutsourceTasksPage";
import WorkstationsPage from "../production/WorkstationsPage";
import WorkstationFormPage from "../production/WorkstationFormPage";
import {
  Factory,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  FileText,
  ShoppingCart,
  ChevronRight,
  Target,
  Monitor
} from "lucide-react";

const ProductionManagerDashboard = () => {
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [rootCards, setRootCards] = useState([]);
  const [loadingRootCards, setLoadingRootCards] = useState(true);
  const [selectedRootCard, setSelectedRootCard] = useState(null);
  const [departmentTasks, setDepartmentTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const navigationItems = [
    {
      title: "Dashboard",
      path: "/production-manager/dashboard",
      icon: Factory,
    },
    {
      title: "Production Planning",
      icon: Clock,
      submenu: [
        {
          title: "Production Plans",
          path: "/production-manager/planning/plans",
          icon: Clock,
        },
        {
          title: "Production Specifications",
          path: "/production-manager/planning/specifications",
          icon: FileText,
        },
        {
          title: "Scheduling",
          path: "/production-manager/planning/schedule",
          icon: Clock,
        },
        {
          title: "Resource Allocation",
          path: "/production-manager/planning/resources",
          icon: Users,
        },
      ],
    },
    {
      title: "Manufacturing Stages",
      icon: Factory,
      submenu: [
        {
          title: "Active Stages",
          path: "/production-manager/stages/active",
          icon: Factory,
        },
        {
          title: "Stage Progress",
          path: "/production-manager/stages/progress",
          icon: TrendingUp,
        },
        {
          title: "Stage Details",
          path: "/production-manager/stages/details",
          icon: Clock,
        },
      ],
    },
    {
      title: "Workstations",
      path: "/production-manager/workstations",
      icon: Monitor,
    },
    {
      title: "Worker Management",
      icon: Users,
      submenu: [
        {
          title: "Assign Tasks",
          path: "/production-manager/workers/assign",
          icon: Users,
        },
        {
          title: "Task Tracking",
          path: "/production-manager/workers/tracking",
          icon: Clock,
        },
        {
          title: "Performance",
          path: "/production-manager/workers/performance",
          icon: TrendingUp,
        },
      ],
    },
    {
      title: "Challan Management",
      icon: CheckCircle,
      submenu: [
        {
          title: "Generate Challan",
          path: "/production-manager/challan/generate",
          icon: CheckCircle,
        },
        {
          title: "Challan List",
          path: "/production-manager/challan/list",
          icon: Clock,
        },
        {
          title: "Track Challan",
          path: "/production-manager/challan/track",
          icon: TrendingUp,
        },
      ],
    },
    {
      title: "Performance Metrics",
      path: "/production-manager/metrics",
      icon: TrendingUp,
    },
    {
      title: "Outsource Tasks",
      path: "/production-manager/outsource-tasks",
      icon: CheckCircle,
    },
  ];

  const fetchPlans = useCallback(async () => {
    try {
      setLoadingPlans(true);
      const response = await axios.get('/production/plans');
      setPlans(response.data.plans || []);
    } catch (error) {
      console.error('Error fetching production plans:', error);
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoadingTasks(true);
      const response = await axios.get("/employee/tasks?type=production_plan");
      setDepartmentTasks(response.data.tasks || []);
    } catch (err) {
      console.error("Error fetching production tasks:", err);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  const fetchRootCards = useCallback(async () => {
    setLoadingRootCards(true);
    try {
      const response = await axios.get('/production/root-cards', {
        params: { status: 'planning', assignedOnly: true },
        __sessionGuard: true
      });
      const cards = Array.isArray(response.data) ? response.data : response.data.rootCards || [];
      setRootCards(cards);
      if (cards.length > 0) {
        setSelectedRootCard(cards[0].id);
      }
    } catch (error) {
      console.error('Error fetching root cards:', error);
    } finally {
      setLoadingRootCards(false);
    }
  }, []);

  useEffect(() => {
    fetchRootCards();
    fetchTasks();
    fetchPlans();
  }, [fetchTasks, fetchPlans, fetchRootCards]);

  const stats = [
    {
      title: "Active Plans",
      value: plans.filter(p => p.status === 'in_progress' || p.status === 'planning').length.toString(),
      change: "+2",
      positive: true,
      icon: Clock,
    },
    {
      title: "Completed",
      value: plans.filter(p => p.status === 'completed').length.toString(),
      change: "+3",
      positive: true,
      icon: CheckCircle,
    },
    {
      title: "In-Progress Tasks",
      value: plans.reduce((acc, p) => acc + (p.active_stages_count || 0), 0).toString(),
      change: "+5",
      positive: false,
      icon: Target,
    },
    {
      title: "Potential Delays",
      value: plans.filter(p => p.status === 'delayed').length.toString(),
      change: "0",
      positive: true,
      icon: AlertTriangle,
    },
  ];

  const DashboardContent = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center text-xs justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {stat.title}
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white text-xs mt-2">
                    {stat.value}
                  </p>
                  <p
                    className={`text-sm mt-2 ${
                      stat.positive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.positive ? "↑" : "↓"} {stat.change}
                  </p>
                </div>
                <Icon size={32} className="text-blue-500" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Assigned Production Planning Tasks Section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
            <Clock size={20} className="text-blue-600" />
            Assigned Root Cards (Production Planning)
          </h2>
          <Link
            to="/production-manager/department-tasks"
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
            {departmentTasks.slice(0, 6).map((task) => (
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
                    to={`/production-manager/department-tasks`}
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
              No active production planning tasks assigned.
            </p>
          </div>
        )}
      </div>

      {/* Active Production Plans Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target size={20} className="text-blue-600" />
            Active Production Plans
          </h2>
          <Link
            to="/production-manager/planning/plans"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Manage All <ChevronRight size={14} />
          </Link>
        </div>
        
        {loadingPlans ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-blue-600" size={24} />
          </div>
        ) : plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.filter(p => p.status !== 'completed').slice(0, 3).map((plan, idx) => (
              <div
                key={plan.id}
                className="border-l-4 border-blue-500 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {plan.plan_name}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">
                      {plan.product_name || "Multiple Products"}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] rounded-full font-bold uppercase ${
                      plan.status === "in_progress"
                        ? "bg-blue-100 text-blue-700"
                        : plan.status === "delayed"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {plan.status?.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>PROGRESS</span>
                    <span>{plan.progress_percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${plan.status === 'delayed' ? 'bg-red-500' : 'bg-blue-600'}`}
                      style={{ width: `${plan.progress_percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <Clock size={12} />
                    <span>Ends {plan.end_date ? new Date(plan.end_date).toLocaleDateString() : 'TBD'}</span>
                  </div>
                  <Link to={`/production-manager/planning/plans`} className="text-[10px] font-bold text-blue-600">
                    DETAILS
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
            <Package className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-sm text-slate-500 font-medium">No active production plans.</p>
          </div>
        )}
      </div>

      {/* Production Phases by Root Card */}
      {selectedRootCard && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-left mb-4">
            Production Phases
          </h2>
          {rootCards.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Select Root Card
              </label>
              <select
                value={selectedRootCard || ''}
                onChange={(e) => setSelectedRootCard(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {rootCards.map((rc) => (
                  <option key={rc.id} value={rc.id}>
                    {rc.title} ({rc.code || 'No Code'})
                  </option>
                ))}
              </select>
            </div>
          )}
          <ProductionPhasesDisplay rootCardId={selectedRootCard} editable={false} />
        </div>
      )}

      {/* Manufacturing Stages Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stages Status */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-xs text-left mb-4">
            Stage Status
          </h2>
          <div className="space-y-3">
            {[
              { name: "Cutting & Preparation", status: "Active", count: 3 },
              { name: "Welding & Assembly", status: "Active", count: 2 },
              { name: "Finishing", status: "Pending", count: 1 },
              { name: "Final Inspection", status: "Completed", count: 2 },
            ].map((stage, idx) => (
              <div
                key={idx}
                className="flex items-center text-xs justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-xs text-sm">
                    {stage.name}
                  </p>
                </div>
                <div className="flex items-center text-xs gap-3">
                  <span
                    className={`px-2 py-1 text-xs rounded font-medium ${
                      stage.status === "Active"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : stage.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    }`}
                  >
                    {stage.status}
                  </span>
                  <span className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 px-2 py-1 text-xs rounded">
                    {stage.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Allocation */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-xs text-left mb-4">
            Team Allocation
          </h2>
          <div className="space-y-3">
            {[
              { department: "Cutting & Prep", allocated: 8, utilization: 85 },
              { department: "Welding", allocated: 6, utilization: 92 },
              { department: "Assembly", allocated: 5, utilization: 78 },
              { department: "Finishing", allocated: 4, utilization: 65 },
            ].map((dept, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 dark:bg-slate-700 rounded"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium text-slate-900 dark:text-white text-xs text-sm">
                    {dept.department}
                  </p>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {dept.allocated} workers
                  </span>
                </div>
                <div className="w-full bg-slate-300 dark:bg-slate-600 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${dept.utilization}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 text-xs">
                  {dept.utilization}% Utilized
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white text-xs text-left mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/production-manager/planning/plans"
            className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
          >
            <Clock
              size={24}
              className="text-blue-600 dark:text-blue-300 mb-2"
            />
            <p className="font-medium text-blue-900 dark:text-blue-100">
              Plans
            </p>
          </Link>
          <Link
            to="/production-manager/stages/active"
            className="p-4 bg-green-50 dark:bg-green-900 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
          >
            <Factory
              size={24}
              className="text-green-600 dark:text-green-300 mb-2"
            />
            <p className="font-medium text-green-900 dark:text-green-100">
              Stages
            </p>
          </Link>
          <Link
            to="/production-manager/workers/assign"
            className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
          >
            <Users
              size={24}
              className="text-purple-600 dark:text-purple-300 mb-2"
            />
            <p className="font-medium text-purple-900 dark:text-purple-100">
              Assign Tasks
            </p>
          </Link>
          <Link
            to="/production-manager/challan/generate"
            className="p-4 bg-orange-50 dark:bg-orange-900 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors"
          >
            <CheckCircle
              size={24}
              className="text-orange-600 dark:text-orange-300 mb-2"
            />
            <p className="font-medium text-orange-900 dark:text-orange-100">
              Challan
            </p>
          </Link>
          <Link
            to="/production-manager/department-tasks"
            className="p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors"
          >
            <FileText
              size={24}
              className="text-indigo-600 dark:text-indigo-300 mb-2"
            />
            <p className="font-medium text-indigo-900 dark:text-indigo-100">
              Dept. Tasks
            </p>
          </Link>
          <Link
            to="/production-manager/outsource-tasks"
            className="p-4 bg-cyan-50 dark:bg-cyan-900 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-800 transition-colors"
          >
            <ShoppingCart
              size={24}
              className="text-cyan-600 dark:text-cyan-300 mb-2"
            />
            <p className="font-medium text-cyan-900 dark:text-cyan-100">
              Outsource Tasks
            </p>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <RoleDashboardLayout
      roleNavigation={navigationItems}
      roleName="Production Manager"
      roleIcon={Factory}
    >
      <Routes>
        <Route path="/" element={<DashboardContent />} />
        <Route path="/dashboard" element={<DashboardContent />} />
        <Route path="/planning/plans" element={<ProductionPlansPage />} />
        <Route path="/planning/plans/new" element={<ProductionPlanFormPage />} />
        <Route
          path="/planning/specifications"
          element={<ProductionSpecificationsPage />}
        />
        <Route path="/planning/schedule" element={<SchedulingPage />} />
        <Route
          path="/planning/resources"
          element={<ResourceAllocationPage />}
        />
        <Route path="/stages/active" element={<ActiveStagesPage />} />
        <Route path="/stages/progress" element={<StageProgressPage />} />
        <Route path="/stages/details" element={<StageDetailsPage />} />
        <Route path="/workers/assign" element={<AssignTasksPage />} />
        <Route path="/workers/tracking" element={<TaskTrackingPage />} />
        <Route path="/workers/performance" element={<PerformancePage />} />
        <Route path="/challan/generate" element={<GenerateChallanPage />} />
        <Route path="/challan/list" element={<ChallanListPage />} />
        <Route path="/challan/track" element={<TrackChallanPage />} />
        <Route path="/metrics" element={<PerformanceMetricsPage />} />
        <Route path="/workstations" element={<WorkstationsPage />} />
        <Route path="/workstations/new" element={<WorkstationFormPage />} />
        <Route path="/workstations/edit/:id" element={<WorkstationFormPage />} />
        <Route path="/department-tasks" element={<ProductionTasksPage />} />
        <Route path="/outsource-tasks" element={<OutsourceTasksPage />} />
        <Route
          path="*"
          element={<Navigate to="/production-manager/dashboard" replace />}
        />
      </Routes>
    </RoleDashboardLayout>
  );
};

export default ProductionManagerDashboard;
