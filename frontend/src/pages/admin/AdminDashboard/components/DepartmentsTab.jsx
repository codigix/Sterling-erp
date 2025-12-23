import React from "react";
import Card, { CardHeader, CardTitle, CardContent } from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import { Factory, BarChart3, PieChart, LineChart } from "lucide-react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import departmentData from "../data/departmentsData.json";
import { getStatusColor } from "../utils/colorHelpers";

const DepartmentsTab = () => {
  return (
    <div className="w-full space-y-3 overflow-x-hidden">
      {/* Department Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {departmentData.map((dept, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center text-xs justify-between">
                <span className="flex items-center text-xs gap-1">
                  <Factory className="w-3.5 h-3.5 text-primary-600" />
                  <span className="truncate">{dept.name}</span>
                </span>
                <Badge className={`${getStatusColor(dept.status)} text-xs px-2 py-0.5`}>
                  {dept.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                    Tasks
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {dept.tasksCompleted}/{dept.totalTasks}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                    Efficiency
                  </p>
                  <p className="text-sm font-bold text-green-600">
                    {dept.efficiency}%
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">
                    Avg. Time
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">{dept.avgTime}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">
                    Employees
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">{dept.employees}</span>
                </div>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
                <div
                  className="bg-primary-600 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${dept.efficiency}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Department Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1 text-xs">
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="text-sm">Efficiency</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <Bar
                data={{
                  labels: departmentData.map((d) => d.name.split(' ')[0]),
                  datasets: [
                    {
                      label: "Efficiency %",
                      data: departmentData.map((d) => d.efficiency),
                      backgroundColor: "#475569",
                      borderRadius: 2,
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
                        font: { size: 10 },
                        callback: (value) => value + "%",
                      },
                    },
                    x: {
                      ticks: { font: { size: 10 } },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1 text-xs">
              <PieChart className="w-3.5 h-3.5" />
              <span className="text-sm">Task Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <Doughnut
                data={{
                  labels: departmentData.map((d) => d.name.split(' ')[0]),
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
                    legend: { position: "bottom", labels: { boxWidth: 8, font: { size: 10 } } },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Trends */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-1 text-xs">
            <LineChart className="w-3.5 h-3.5" />
            <span className="text-sm">Performance Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
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
                    label: "QC",
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
                  legend: { position: "top", labels: { boxWidth: 8, font: { size: 10 } } },
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    min: 80,
                    max: 100,
                    ticks: {
                      font: { size: 10 },
                      callback: (value) => value + "%",
                    },
                  },
                  x: {
                    ticks: { font: { size: 10 } },
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
