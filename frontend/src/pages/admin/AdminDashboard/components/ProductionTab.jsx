import React, { useState } from "react";
import Card, { CardHeader, CardTitle, CardContent } from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Timer,
  AlertCircle,
  Wrench,
  BarChart3,
} from "lucide-react";
import { Bar } from "react-chartjs-2";

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

  return (
    <div className="w-full space-y-6 overflow-x-hidden">
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

export default ProductionTab;
