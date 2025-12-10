import React from "react";
import Card, { CardHeader, CardTitle, CardContent } from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import {
  UserCheck,
  TrendingUp,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Factory,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Bar, Doughnut } from "react-chartjs-2";

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

export default EmployeesTab;
