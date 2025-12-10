import React from "react";
import Card, { CardHeader, CardTitle, CardContent } from "../../../../components/ui/Card";
import Badge from "../../../../components/ui/Badge";
import { Truck, BarChart3, PieChart, Target, DollarSign, LineChart } from "lucide-react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import vendorData from "../data/vendorsData.json";
import { getStatusColor, getQualityColor } from "../utils/colorHelpers";

const VendorsTab = () => {
  return (
    <div className="w-full space-y-6 overflow-x-hidden">
      {/* Vendor Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendorData.map((vendor, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-primary-600" />
                  {vendor.name}
                </span>
                <Badge className={getStatusColor(vendor.status)}>
                  {vendor.status}
                </Badge>
              </CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {vendor.category}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    On-Time Delivery
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {vendor.onTimeDelivery}/{vendor.totalOrders}
                  </p>
                  <p className="text-sm text-green-600">
                    {Math.round(
                      (vendor.onTimeDelivery / vendor.totalOrders) * 100
                    )}
                    %
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Quality Rating
                  </p>
                  <p
                    className={`text-xl font-bold ${getQualityColor(
                      vendor.qualityRating
                    )}`}
                  >
                    {vendor.qualityRating}/5.0
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Avg. Delivery Time
                  </span>
                  <span className="font-medium">{vendor.avgDeliveryTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Total Value
                  </span>
                  <span className="font-medium">
                    ₹{vendor.totalValue.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Vendor Delivery Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar
                data={{
                  labels: vendorData.map((v) => v.name.split(" ")[0]),
                  datasets: [
                    {
                      label: "On-Time Delivery %",
                      data: vendorData.map((v) =>
                        Math.round((v.onTimeDelivery / v.totalOrders) * 100)
                      ),
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
              Vendor Categories Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut
                data={{
                  labels: [
                    "Raw Materials",
                    "Machined Parts",
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
                        "#06b6d4",
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

      {/* Vendor Quality & Cost Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Quality Ratings Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line
                data={{
                  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                  datasets: [
                    {
                      label: "Average Quality Rating",
                      data: [4.5, 4.6, 4.4, 4.7, 4.5, 4.6],
                      borderColor: "#10b981",
                      backgroundColor: "#10b98120",
                      tension: 0.4,
                    },
                    {
                      label: "Target Rating (4.5)",
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
                    legend: { position: "top" },
                  },
                  scales: {
                    y: {
                      beginAtZero: false,
                      min: 4.0,
                      max: 5.0,
                      ticks: {
                        stepSize: 0.1,
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
              <DollarSign className="w-5 h-5 mr-2" />
              Vendor Spending Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    Top Vendor
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    MetalWorks Pro
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">₹14.5L</p>
                  <p className="text-sm text-slate-500">23% of total</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    Total Monthly Spend
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    All Vendors
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    ₹45.2L
                  </p>
                  <p className="text-sm text-green-600">+8% vs last month</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    Cost Savings
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    This Quarter
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">₹2.8L</p>
                  <p className="text-sm text-slate-500">12% reduction</p>
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
