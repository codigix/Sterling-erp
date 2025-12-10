import React from "react";
import Card, { CardHeader, CardTitle, CardContent } from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import { Factory, BarChart3, PieChart, LineChart } from "lucide-react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import departmentData from "../data/departmentsData.json";
import { getStatusColor } from "../utils/colorHelpers";

const DepartmentsTab = () => {
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

export default DepartmentsTab;
