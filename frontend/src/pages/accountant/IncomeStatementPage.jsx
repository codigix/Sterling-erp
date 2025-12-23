import { useState } from 'react';
import { Download, Filter, TrendingUp } from 'lucide-react';

const IncomeStatementPage = () => {
  const [dateRange, setDateRange] = useState('year');

  const incomeStatementData = {
    revenue: {
      sales: 95430000,
      serviceIncome: 12500000,
      otherIncome: 2300000,
      total: 110230000,
    },
    costOfGoodsSold: {
      rawMaterials: 35000000,
      labor: 8000000,
      manufacturing: 2500000,
      total: 45500000,
    },
    operatingExpenses: {
      salaries: 22500000,
      rent: 9600000,
      utilities: 4200000,
      marketing: 5500000,
      depreciation: 2800000,
      other: 3400000,
      total: 48000000,
    },
  };

  const grossProfit = incomeStatementData.revenue.total - incomeStatementData.costOfGoodsSold.total;
  const operatingProfit = grossProfit - incomeStatementData.operatingExpenses.total;
  const interestExpense = 1500000;
  const taxExpense = operatingProfit > 0 ? operatingProfit * 0.30 : 0;
  const netProfit = operatingProfit - interestExpense - taxExpense;

  const ratios = {
    grossMargin: ((grossProfit / incomeStatementData.revenue.total) * 100).toFixed(2),
    operatingMargin: ((operatingProfit / incomeStatementData.revenue.total) * 100).toFixed(2),
    netMargin: ((netProfit / incomeStatementData.revenue.total) * 100).toFixed(2),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Income Statement</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Profit & Loss statement for the period</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700 p-4">
          <p className="text-sm font-medium text-green-700 dark:text-green-300">Gross Profit</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">₹{grossProfit.toLocaleString('en-IN')}</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">{ratios.grossMargin}% margin</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700 p-4">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Operating Profit</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">₹{operatingProfit.toLocaleString('en-IN')}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{ratios.operatingMargin}% margin</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900 rounded-lg border border-purple-200 dark:border-purple-700 p-4">
          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Net Profit</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">₹{netProfit.toLocaleString('en-IN')}</p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">{ratios.netMargin}% margin</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Income Statement</h2>
        
        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Revenue</h3>
              <p className="text-lg font-bold text-green-600">₹{incomeStatementData.revenue.total.toLocaleString('en-IN')}</p>
            </div>
            <div className="space-y-2 pl-6 border-l-2 border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Sales Revenue</span>
                <span>₹{incomeStatementData.revenue.sales.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Service Income</span>
                <span>₹{incomeStatementData.revenue.serviceIncome.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Other Income</span>
                <span>₹{incomeStatementData.revenue.otherIncome.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Cost of Goods Sold</h3>
              <p className="text-lg font-bold text-red-600">₹{incomeStatementData.costOfGoodsSold.total.toLocaleString('en-IN')}</p>
            </div>
            <div className="space-y-2 pl-6 border-l-2 border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Raw Materials</span>
                <span>₹{incomeStatementData.costOfGoodsSold.rawMaterials.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Labor Costs</span>
                <span>₹{incomeStatementData.costOfGoodsSold.labor.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Manufacturing Overhead</span>
                <span>₹{incomeStatementData.costOfGoodsSold.manufacturing.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Gross Profit</h3>
              <p className="text-lg font-bold text-green-600">₹{grossProfit.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Operating Expenses</h3>
              <p className="text-lg font-bold text-red-600">₹{incomeStatementData.operatingExpenses.total.toLocaleString('en-IN')}</p>
            </div>
            <div className="space-y-2 pl-6 border-l-2 border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Salaries & Wages</span>
                <span>₹{incomeStatementData.operatingExpenses.salaries.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Rent</span>
                <span>₹{incomeStatementData.operatingExpenses.rent.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Utilities</span>
                <span>₹{incomeStatementData.operatingExpenses.utilities.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Marketing & Advertising</span>
                <span>₹{incomeStatementData.operatingExpenses.marketing.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Depreciation</span>
                <span>₹{incomeStatementData.operatingExpenses.depreciation.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Other Expenses</span>
                <span>₹{incomeStatementData.operatingExpenses.other.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Operating Profit</h3>
              <p className="text-lg font-bold text-blue-600">₹{operatingProfit.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div>
            <div className="space-y-2 pl-6 border-l-2 border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Interest Expense</span>
                <span>-₹{interestExpense.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Tax Expense (30%)</span>
                <span>-₹{taxExpense.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-slate-300 dark:border-slate-600 border-double pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white text-left">Net Profit</h3>
              <p className="text-xl font-bold text-green-600">₹{netProfit.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeStatementPage;
