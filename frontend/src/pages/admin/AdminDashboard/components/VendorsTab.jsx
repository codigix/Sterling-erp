import React from "react";
import Card, { CardHeader, CardTitle, CardContent } from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import { Truck, BarChart3, PieChart, Target, DollarSign, LineChart } from "lucide-react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import vendorData from "../data/vendorsData.json";
import { getStatusColor, getQualityColor } from "../utils/colorHelpers";

const VendorsTab = () => {
  return (
    <div className="w-full space-y-3 overflow-x-hidden">
      {/* Vendor Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {vendorData.map((vendor, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center text-xs justify-between">
                <span className="flex items-center text-xs gap-1">
                  <Truck className="w-3.5 h-3.5 text-primary-600" />
                  <span className="truncate">{vendor.name}</span>
                </span>
                <Badge className={`${getStatusColor(vendor.status)} text-xs px-2 py-0.5`}>
                  {vendor.status}
                </Badge>
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {vendor.category}
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                    On-Time Delivery
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {vendor.onTimeDelivery}/{vendor.totalOrders}
                  </p>
                  <p className="text-xs text-green-600">
                    {Math.round(
                      (vendor.onTimeDelivery / vendor.totalOrders) * 100
                    )}
                    %
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                    Quality
                  </p>
                  <p
                    className={`text-sm font-bold ${getQualityColor(
                      vendor.qualityRating
                    )}`}
                  >
                    {vendor.qualityRating}/5
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">
                    Avg. Time
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">{vendor.avgDeliveryTime}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">
                    Total Value
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    ₹{vendor.totalValue.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
                <div
                  className="bg-primary-600 h-1 rounded-full transition-all duration-300"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1 text-xs">
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="text-sm">Delivery Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <Bar
                data={{
                  labels: vendorData.map((v) => v.name.split(" ")[0]),
                  datasets: [
                    {
                      label: "On-Time %",
                      data: vendorData.map((v) =>
                        Math.round((v.onTimeDelivery / v.totalOrders) * 100)
                      ),
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
              <span className="text-sm">Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <Doughnut
                data={{
                  labels: [
                    "Raw Mat",
                    "Machined",
                    "Electronics",
                    "Logistics",
                    "Components",
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

      {/* Vendor Quality & Cost Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1 text-xs">
              <Target className="w-3.5 h-3.5" />
              <span className="text-sm">Quality Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <Line
                data={{
                  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                  datasets: [
                    {
                      label: "Avg Quality",
                      data: [4.5, 4.6, 4.4, 4.7, 4.5, 4.6],
                      borderColor: "#10b981",
                      backgroundColor: "#10b98120",
                      tension: 0.4,
                    },
                    {
                      label: "Target",
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
                    legend: { position: "top", labels: { boxWidth: 8, font: { size: 10 } } },
                  },
                  scales: {
                    y: {
                      beginAtZero: false,
                      min: 4.0,
                      max: 5.0,
                      ticks: {
                        font: { size: 10 },
                        stepSize: 0.1,
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
              <DollarSign className="w-3.5 h-3.5" />
              <span className="text-sm">Spending Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-start justify-between p-2 border border-slate-200 dark:border-slate-700 rounded text-xs">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-xs">
                    Top Vendor
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    MetalWorks
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600 text-sm">₹14.5L</p>
                  <p className="text-xs text-slate-500">23%</p>
                </div>
              </div>

              <div className="flex items-start justify-between p-2 border border-slate-200 dark:border-slate-700 rounded text-xs">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-xs">
                    Total Spend
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    All Vendors
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    ₹45.2L
                  </p>
                  <p className="text-xs text-green-600">+8%</p>
                </div>
              </div>

              <div className="flex items-start justify-between p-2 border border-slate-200 dark:border-slate-700 rounded text-xs">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-xs">
                    Savings
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    This QTR
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600 text-sm">₹2.8L</p>
                  <p className="text-xs text-slate-500">12%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorsTab;
