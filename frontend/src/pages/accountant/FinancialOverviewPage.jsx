import { useState } from 'react';
import { BarChart3, TrendingUp, Download, Filter } from 'lucide-react';

const FinancialOverviewPage = () => {
  const [dateRange, setDateRange] = useState('month');

  const financialMetrics = [
    { label: 'Total Revenue', value: '₹2,34,56,000', change: '+15.3%', trend: 'up' },
    { label: 'Total Expenses', value: '₹1,12,34,000', change: '+8.2%', trend: 'up' },
    { label: 'Net Profit', value: '₹1,22,22,000', change: '+22.1%', trend: 'up' },
    { label: 'Profit Margin', value: '52.1%', change: '+3.2%', trend: 'up' },
  ];

  const monthlyData = [
    { month: 'Jan', revenue: 18000000, expenses: 8500000, profit: 9500000 },
    { month: 'Feb', revenue: 19500000, expenses: 9000000, profit: 10500000 },
    { month: 'Mar', revenue: 21000000, expenses: 9500000, profit: 11500000 },
    { month: 'Apr', revenue: 22500000, expenses: 10000000, profit: 12500000 },
    { month: 'May', revenue: 23400000, expenses: 10200000, profit: 13200000 },
    { month: 'Jun', revenue: 25000000, expenses: 10800000, profit: 14200000 },
    { month: 'Jul', revenue: 26500000, expenses: 11200000, profit: 15300000 },
    { month: 'Aug', revenue: 28000000, expenses: 11800000, profit: 16200000 },
    { month: 'Sep', revenue: 29500000, expenses: 12000000, profit: 17500000 },
    { month: 'Oct', revenue: 31000000, expenses: 12500000, profit: 18500000 },
    { month: 'Nov', revenue: 32500000, expenses: 12800000, profit: 19700000 },
    { month: 'Dec', revenue: 34560000, expenses: 13340000, profit: 21220000 },
  ];

  const departmentExpenses = [
    { dept: 'Operations', amount: 45000000, percentage: 40 },
    { dept: 'Sales & Marketing', amount: 22500000, percentage: 20 },
    { dept: 'R&D', amount: 18000000, percentage: 16 },
    { dept: 'Administration', amount: 15750000, percentage: 14 },
    { dept: 'Others', amount: 10840000, percentage: 10 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Financial Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Comprehensive financial performance analysis</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <Download size={18} />
            Export
          </button>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {financialMetrics.map((metric) => (
          <div key={metric.label} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{metric.label}</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-2">{metric.value}</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1 font-medium">{metric.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Monthly Trends</h2>
            <BarChart3 size={20} className="text-blue-600" />
          </div>
          <div className="space-y-4">
            {monthlyData.slice(-6).map((data) => (
              <div key={data.month}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{data.month}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">₹{(data.profit / 1000000).toFixed(1)}M</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(data.profit / 20000000) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Expense Distribution</h2>
            <Filter size={20} className="text-purple-600" />
          </div>
          <div className="space-y-4">
            {departmentExpenses.map((dept) => (
              <div key={dept.dept}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{dept.dept}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{dept.percentage}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ width: `${dept.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Year-to-Date Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹2,34,56,000</p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">₹1,12,34,000</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">Net Profit</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹1,22,22,000</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialOverviewPage;
