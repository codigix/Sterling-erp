import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Plus,
  Calendar,
  Filter,
  TrendingUp,
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  PieChart,
  LineChart,
} from 'lucide-react';

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState('30days');
  const [reportType, setReportType] = useState('all');

  const reports = [
    {
      id: 1,
      name: 'Stock Level Report',
      description: 'Current inventory levels by category',
      category: 'inventory',
      lastGenerated: '2024-12-15 10:30',
      format: 'PDF, Excel',
      icon: Package,
    },
    {
      id: 2,
      name: 'Stock Movement Summary',
      description: 'Inbound, outbound, and transfer movements',
      category: 'movement',
      lastGenerated: '2024-12-14 15:45',
      format: 'PDF, Excel',
      icon: TrendingUp,
    },
    {
      id: 3,
      name: 'GRN Processing Report',
      description: 'Goods received notes status and inspections',
      category: 'grn',
      lastGenerated: '2024-12-15 09:20',
      format: 'PDF, Excel',
      icon: Truck,
    },
    {
      id: 4,
      name: 'Quality Control Report',
      description: 'QC inspection results and defect analysis',
      category: 'qc',
      lastGenerated: '2024-12-14 16:00',
      format: 'PDF, Excel',
      icon: CheckCircle,
    },
    {
      id: 5,
      name: 'Reorder Analysis',
      description: 'Items below reorder levels and predictions',
      category: 'reorder',
      lastGenerated: '2024-12-13 11:15',
      format: 'PDF, Excel',
      icon: AlertTriangle,
    },
    {
      id: 6,
      name: 'Vendor Performance',
      description: 'Vendor rating, delivery, and quality metrics',
      category: 'vendor',
      lastGenerated: '2024-12-12 14:30',
      format: 'PDF, Excel',
      icon: TrendingUp,
    },
    {
      id: 7,
      name: 'Batch Expiry Report',
      description: 'Expiring and expired batch tracking',
      category: 'batch',
      lastGenerated: '2024-12-15 08:45',
      format: 'PDF, Excel',
      icon: Calendar,
    },
    {
      id: 8,
      name: 'Warehouse Utilization',
      description: 'Rack and shelf capacity analysis',
      category: 'warehouse',
      lastGenerated: '2024-12-14 13:20',
      format: 'PDF, Excel',
      icon: BarChart3,
    },
  ];

  const filteredReports = reports.filter(report =>
    reportType === 'all' || report.category === reportType
  );

  const keyMetrics = [
    { label: 'Total Stock Value', value: '₹24.5L', icon: Package, trend: '+8%' },
    { label: 'Pending GRN', value: '3', icon: Truck, trend: '-2%' },
    { label: 'QC Approved', value: '94%', icon: CheckCircle, trend: '+5%' },
    { label: 'Low Stock Items', value: '23', icon: AlertTriangle, trend: '+3%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Generate and view inventory analytics reports</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <Plus size={18} />
            Custom Report
          </button>
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors font-medium">
            <Download size={18} />
            Export All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{metric.label}</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white mt-2">{metric.value}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">{metric.trend}</p>
                </div>
                <Icon size={24} className="text-slate-400 dark:text-slate-500" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
            >
              <option value="all">All Reports</option>
              <option value="inventory">Inventory</option>
              <option value="movement">Stock Movement</option>
              <option value="grn">GRN</option>
              <option value="qc">Quality Control</option>
              <option value="reorder">Reorder</option>
              <option value="vendor">Vendor</option>
              <option value="batch">Batch</option>
              <option value="warehouse">Warehouse</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredReports.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.id}
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 hover:shadow-lg dark:hover:shadow-slate-900/50 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center text-xs gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                      <Icon size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{report.name}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{report.description}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-xs justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Last Generated:</span>
                    <span className="text-slate-900 dark:text-white font-medium">{report.lastGenerated}</span>
                  </div>
                  <div className="flex items-center text-xs justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Format:</span>
                    <span className="text-slate-900 dark:text-white font-medium">{report.format}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                      Generate
                    </button>
                    <button className="flex-1 px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg text-sm font-medium transition-colors">
                      Download
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center text-xs gap-3 mb-4">
            <LineChart size={20} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Stock Trend (30 Days)</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center text-xs justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-400">Inbound</span>
                <span className="font-medium text-slate-900 dark:text-white">+420 units</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center text-xs justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-400">Outbound</span>
                <span className="font-medium text-slate-900 dark:text-white">-380 units</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '59%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center text-xs justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-400">Transfers</span>
                <span className="font-medium text-slate-900 dark:text-white">+120 units</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '18%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center text-xs gap-3 mb-4">
            <PieChart size={20} className="text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Category Distribution</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center text-xs justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-400">Raw Materials</span>
                <span className="font-medium text-slate-900 dark:text-white">35%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center text-xs justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-400">Components</span>
                <span className="font-medium text-slate-900 dark:text-white">28%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center text-xs justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-400">Finished Goods</span>
                <span className="font-medium text-slate-900 dark:text-white">22%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-pink-600 h-2 rounded-full" style={{ width: '22%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center text-xs justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-400">Packaging</span>
                <span className="font-medium text-slate-900 dark:text-white">15%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-cyan-600 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
