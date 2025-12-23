import { useState } from 'react';
import { Download, Plus, Edit, TrendingUp, AlertTriangle } from 'lucide-react';

const BudgetManagementPage = () => {
  const [budgetYear, setBudgetYear] = useState('2025');

  const budgets = [
    { id: 1, department: 'Operations', budgeted: 45000000, spent: 42500000, percentage: 94, status: 'on-track' },
    { id: 2, department: 'Sales & Marketing', budgeted: 22500000, spent: 21800000, percentage: 97, status: 'warning' },
    { id: 3, department: 'R&D', budgeted: 18000000, spent: 15200000, percentage: 84, status: 'on-track' },
    { id: 4, department: 'Administration', budgeted: 15750000, spent: 15600000, percentage: 99, status: 'critical' },
    { id: 5, department: 'Travel', budgeted: 8500000, spent: 7200000, percentage: 85, status: 'on-track' },
    { id: 6, department: 'IT & Infrastructure', budgeted: 6250000, spent: 5800000, percentage: 93, status: 'on-track' },
  ];

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.budgeted, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const overallPercentage = ((totalSpent / totalBudgeted) * 100).toFixed(1);

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-track':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getBarColor = (percentage) => {
    if (percentage >= 95) return 'bg-red-600';
    if (percentage >= 85) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Budget Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track budget allocation and spending</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <Plus size={18} />
            New Budget
          </button>
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors font-medium">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Budgeted</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">₹{totalBudgeted.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Spent</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">₹{totalSpent.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Remaining</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">₹{totalRemaining.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Overall Utilization</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">{overallPercentage}%</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Budget Year</label>
          <select
            value={budgetYear}
            onChange={(e) => setBudgetYear(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
          >
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>

        <div className="space-y-6">
          {budgets.map((budget) => (
            <div key={budget.id} className="pb-6 border-b border-slate-200 dark:border-slate-700 last:border-b-0 last:pb-0">
              <div className="flex items-center text-xs justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{budget.department}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Spent: ₹{budget.spent.toLocaleString('en-IN')} of ₹{budget.budgeted.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(budget.status)}`}>
                    {budget.percentage}% Used
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${getBarColor(budget.percentage)}`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 text-xs ">
                <span>₹{budget.spent.toLocaleString('en-IN')}</span>
                <span>₹{(budget.budgeted - budget.spent).toLocaleString('en-IN')} remaining</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center text-xs gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            Budget Utilization Trend
          </h3>
          <div className="space-y-4">
            {[
              { month: 'Jan', utilization: 35 },
              { month: 'Feb', utilization: 48 },
              { month: 'Mar', utilization: 62 },
              { month: 'Apr', utilization: 71 },
              { month: 'May', utilization: 78 },
              { month: 'Jun', utilization: 85 },
            ].map((item) => (
              <div key={item.month}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.month}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{item.utilization}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${item.utilization}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center text-xs gap-2">
            <AlertTriangle size={20} className="text-orange-600" />
            Budget Alerts
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-red-50 dark:bg-red-900 rounded-lg border border-red-200 dark:border-red-700">
              <p className="font-medium text-red-900 dark:text-red-200">Critical Alert</p>
              <p className="text-sm text-red-800 dark:text-red-300 mt-1">Administration budget at 99% utilization</p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-700">
              <p className="font-medium text-yellow-900 dark:text-yellow-200">Warning</p>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">Sales & Marketing budget at 97% utilization</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700">
              <p className="font-medium text-green-900 dark:text-green-200">On Track</p>
              <p className="text-sm text-green-800 dark:text-green-300 mt-1">Overall budget utilization at {overallPercentage}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetManagementPage;
