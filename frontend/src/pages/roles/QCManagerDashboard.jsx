import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "../../utils/api";
import RoleDashboardLayout from "../../components/layout/RoleDashboardLayout";
import { Loader2, Package } from "lucide-react";
import {
  CheckCircle,
  AlertCircle,
  FileText,
  TrendingUp,
  Clock,
  BarChart3,
} from "lucide-react";

const QCManagerDashboard = () => {
  const [departmentTasks, setDepartmentTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      setLoadingTasks(true);
      const response = await axios.get("/employee/tasks?type=quality_check");
      setDepartmentTasks(response.data.tasks || []);
    } catch (err) {
      console.error("Error fetching QC tasks:", err);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const navigationItems = [
    {
      title: "Dashboard",
      path: "/qc-manager/dashboard",
      icon: CheckCircle,
    },
    {
      title: "Quality Checks",
      icon: CheckCircle,
      submenu: [
        { title: "Pending QC", path: "/qc-manager/qc/pending", icon: Clock },
        {
          title: "In Progress",
          path: "/qc-manager/qc/progress",
          icon: TrendingUp,
        },
        {
          title: "Completed",
          path: "/qc-manager/qc/completed",
          icon: CheckCircle,
        },
      ],
    },
    {
      title: "GRN Processing",
      icon: FileText,
      submenu: [
        { title: "GRN List", path: "/qc-manager/grn/list", icon: FileText },
        {
          title: "Material Testing",
          path: "/qc-manager/grn/testing",
          icon: CheckCircle,
        },
        {
          title: "GRN Reports",
          path: "/qc-manager/grn/reports",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Material Testing",
      icon: TrendingUp,
      submenu: [
        {
          title: "Test Plans",
          path: "/qc-manager/testing/plans",
          icon: FileText,
        },
        {
          title: "Test Results",
          path: "/qc-manager/testing/results",
          icon: CheckCircle,
        },
        {
          title: "Certifications",
          path: "/qc-manager/testing/certs",
          icon: FileText,
        },
      ],
    },
    {
      title: "Non-Conformance",
      icon: AlertCircle,
      submenu: [
        { title: "NCR List", path: "/qc-manager/ncr/list", icon: AlertCircle },
        {
          title: "Corrective Actions",
          path: "/qc-manager/ncr/actions",
          icon: TrendingUp,
        },
        {
          title: "Closed NCRs",
          path: "/qc-manager/ncr/closed",
          icon: CheckCircle,
        },
      ],
    },
    {
      title: "Reports & Analytics",
      path: "/qc-manager/reports",
      icon: BarChart3,
    },
  ];

  const stats = [
    {
      title: "Total Inspections",
      value: "156",
      change: "+12%",
      positive: true,
      icon: CheckCircle,
    },
    {
      title: "Pass Rate",
      value: "94.2%",
      change: "+2.1%",
      positive: true,
      icon: TrendingUp,
    },
    {
      title: "Pending Inspections",
      value: "12",
      change: "-3",
      positive: true,
      icon: Clock,
    },
    {
      title: "Active NCRs",
      value: "5",
      change: "+1",
      positive: false,
      icon: AlertCircle,
    },
  ];

  return (
    <RoleDashboardLayout
      roleNavigation={navigationItems}
      roleName="QC Manager"
      roleIcon={CheckCircle}
    >
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

        {/* Assigned Root Cards (Quality Check) */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
              <Clock size={20} className="text-blue-600" />
              Assigned Root Cards (Quality Check)
            </h2>
            <Link
              to="/qc-manager/qc/pending"
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
                      to={`/qc-manager/qc/pending`}
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
                No active quality check tasks assigned.
              </p>
            </div>
          )}
        </div>

        {/* QC Metrics */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-xs text-left mb-4">
            Quality Metrics (This Month)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">94.2%</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-xs ">
                Pass Rate
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">1,234</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-xs ">
                Items Inspected
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">74</div>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-xs ">
                Defects Found
              </p>
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
              to="/qc-manager/qc/pending"
              className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
            >
              <Clock
                size={24}
                className="text-blue-600 dark:text-blue-300 mb-2"
              />
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Pending QC
              </p>
            </Link>
            <Link
              to="/qc-manager/grn/list"
              className="p-4 bg-green-50 dark:bg-green-900 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
            >
              <CheckCircle
                size={24}
                className="text-green-600 dark:text-green-300 mb-2"
              />
              <p className="font-medium text-green-900 dark:text-green-100">
                GRN List
              </p>
            </Link>
            <Link
              to="/qc-manager/testing/results"
              className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
            >
              <TrendingUp
                size={24}
                className="text-purple-600 dark:text-purple-300 mb-2"
              />
              <p className="font-medium text-purple-900 dark:text-purple-100">
                Test Results
              </p>
            </Link>
            <Link
              to="/qc-manager/ncr/list"
              className="p-4 bg-red-50 dark:bg-red-900 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
            >
              <AlertCircle
                size={24}
                className="text-red-600 dark:text-red-300 mb-2"
              />
              <p className="font-medium text-red-900 dark:text-red-100">NCRs</p>
            </Link>
          </div>
        </div>
      </div>
    </RoleDashboardLayout>
  );
};

export default QCManagerDashboard;
