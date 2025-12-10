import React from "react";
import Card, { CardHeader, CardTitle, CardContent } from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import {
  Target,
  Activity,
  Users,
  AlertTriangle,
  PieChart,
  TrendingUp,
  CheckCircle,
  Zap,
  Clock,
} from "lucide-react";
import { Line, Bar, Doughnut } from "react-chartjs-2";

const OverviewTab = ({ kpis }) => (
  <div className="w-full space-y-8 overflow-x-hidden">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

export default OverviewTab;
