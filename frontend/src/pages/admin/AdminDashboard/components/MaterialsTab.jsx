import React from "react";
import Card, { CardHeader, CardTitle, CardContent } from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import { Package, BarChart3, PieChart, FileText, AlertTriangle } from "lucide-react";
import { Bar, Doughnut } from "react-chartjs-2";
import materialData from "../data/materialsData.json";
import movementLogs from "../data/movementLogsData.json";
import {
  getMaterialStatusColor,
  getMovementTypeColor,
  getStockLevel,
} from "../utils/colorHelpers";

const MaterialsTab = () => {
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
                  <CardTitle className="text-base flex items-center text-xs justify-between">
                    <span className="flex items-center text-xs space-x-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="truncate">{material.name}</span>
                    </span>
                    <Badge
                      className={getMaterialStatusColor(material.status)}
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
                      <p className="text-lg font-bold  dark:">
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
                      <span className="font-medium  dark:">
                        {material.minStock}/{material.maxStock}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Location:</span>
                      <span className="font-medium  dark:">
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
            <CardTitle className="flex items-center text-xs space-x-2">
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
            <CardTitle className="flex items-center text-xs space-x-2">
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
          <CardTitle className="flex items-center text-xs">
            <FileText className="w-5 h-5 mr-2" />
            Recent Material Movements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-medium  dark:">
                    Movement ID
                  </th>
                  <th className="text-left py-3 px-4 font-medium  dark:">
                    Material
                  </th>
                  <th className="text-left py-3 px-4 font-medium  dark:">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-medium  dark:">
                    Quantity
                  </th>
                  <th className="text-left py-3 px-4 font-medium  dark:">
                    From → To
                  </th>
                  <th className="text-left py-3 px-4 font-medium  dark:">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium  dark:">
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
                    <td className="py-3 px-4 text-sm font-medium  dark:">
                      {log.id}
                    </td>
                    <td className="py-3 px-4 text-sm  dark:">
                      {log.material}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getMovementTypeColor(log.type)}>
                        {log.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm  dark:">
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
          <CardTitle className="flex items-center text-xs">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Inventory Alerts & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium  dark:">
                Critical Stock Alerts
              </h4>
              <div className="space-y-3">
                <div className="flex items-center text-xs p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
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
                <div className="flex items-center text-xs p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
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
              <h4 className="font-medium  dark:">
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

export default MaterialsTab;
