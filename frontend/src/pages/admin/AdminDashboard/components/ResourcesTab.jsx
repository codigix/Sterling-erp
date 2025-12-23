import React from "react";
import Card, { CardHeader, CardTitle, CardContent } from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Zap,
  Calendar,
  BarChart3,
  Target,
  FileText,
  Wrench,
  Users,
} from "lucide-react";
import { Line } from "react-chartjs-2";

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
        return "text-slate-600 bg-slate-100 dark: dark:text-slate-400";
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
        return "text-slate-600 bg-slate-100 dark: dark:text-slate-400";
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center text-xs">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Optimal Resources
                </p>
                <p className="text-xl font-bold  text-left">
                  3
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center text-xs">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  High Utilization
                </p>
                <p className="text-xl font-bold  text-left">
                  2
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center text-xs">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Bottlenecks
                </p>
                <p className="text-xl font-bold  text-left">
                  2
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center text-xs">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Avg Utilization
                </p>
                <p className="text-xl font-bold  text-left">
                  72%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xs">
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
                <div className="flex items-center text-xs justify-between mb-3">
                  <h4 className="font-medium  dark:">
                    {resource.type}
                  </h4>
                  <div className="flex items-center text-xs space-x-2">
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
                    <p className="text-lg font-bold  dark:">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xs">
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
                  <div className="flex items-center text-xs justify-between mb-2">
                    <h4 className="font-medium  dark:">
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
                      <p className="font-medium  dark:">
                        {resource.nextAvailable}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Queued Projects
                      </p>
                      <p className="font-medium  dark:">
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
            <CardTitle className="flex items-center text-xs">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xs">
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
                    <div className="flex items-center text-xs justify-between mb-2">
                      <h4 className="font-medium  dark:">
                        {insight.title}
                      </h4>
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact} Impact
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {insight.description}
                    </p>
                    <div className="flex items-center text-xs justify-between">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xs">
            <FileText className="w-5 h-5 mr-2" />
            Resource Allocation Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-medium  dark:">
                    Resource Type
                  </th>
                  <th className="text-left py-3 px-4 font-medium  dark:">
                    Total Capacity
                  </th>
                  <th className="text-left py-3 px-4 font-medium  dark:">
                    Current Allocation
                  </th>
                  <th className="text-left py-3 px-4 font-medium  dark:">
                    Available
                  </th>
                  <th className="text-left py-3 px-4 font-medium  dark:">
                    Efficiency
                  </th>
                  <th className="text-left py-3 px-4 font-medium  dark:">
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
                    <td className="py-3 px-4 font-medium  dark:">
                      {resource.type}
                    </td>
                    <td className="py-3 px-4  dark:">
                      {resource.total}
                    </td>
                    <td className="py-3 px-4  dark:">
                      {resource.total - resource.available}
                    </td>
                    <td className="py-3 px-4  dark:">
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

export default ResourcesTab;
