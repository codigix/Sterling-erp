import { Download, Filter } from 'lucide-react';

const BalanceSheetPage = () => {
  const balanceSheetData = {
    assets: {
      current: {
        cash: 2450000,
        bank: 8200000,
        receivable: 4532500,
        inventory: 8500000,
        total: 23682500,
      },
      fixed: {
        property: 10000000,
        equipment: 5000000,
        total: 15000000,
      },
      totalAssets: 38682500,
    },
    liabilities: {
      current: {
        payable: 2215000,
        shortTermLoan: 5000000,
        total: 7215000,
      },
      longTerm: {
        longTermDebt: 10000000,
        total: 10000000,
      },
      totalLiabilities: 17215000,
    },
    equity: {
      capital: 20000000,
      retainedEarnings: 1467500,
      totalEquity: 21467500,
    },
  };

  const totalLiabilitiesAndEquity = balanceSheetData.liabilities.totalLiabilities + balanceSheetData.equity.totalEquity;
  const balanceCheck = Math.abs(balanceSheetData.assets.totalAssets - totalLiabilitiesAndEquity);

  const ratios = {
    currentRatio: (balanceSheetData.assets.current.total / balanceSheetData.liabilities.current.total).toFixed(2),
    debtToEquity: (balanceSheetData.liabilities.totalLiabilities / balanceSheetData.equity.totalEquity).toFixed(2),
    assetTurnover: (balanceSheetData.assets.totalAssets / 110230000).toFixed(2),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Balance Sheet</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Financial position as of today</p>
        </div>
        <button className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
          <Download size={18} />
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700 p-4">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Assets</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">₹{balanceSheetData.assets.totalAssets.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900 rounded-lg border border-red-200 dark:border-red-700 p-4">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">Total Liabilities</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">₹{balanceSheetData.liabilities.totalLiabilities.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700 p-4">
          <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Equity</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">₹{balanceSheetData.equity.totalEquity.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-left mb-6">Assets</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Current Assets</h3>
              <div className="space-y-2 pl-4 border-l-2 border-blue-200 dark:border-blue-700">
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Cash in Hand</span>
                  <span>₹{balanceSheetData.assets.current.cash.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Bank Balance</span>
                  <span>₹{balanceSheetData.assets.current.bank.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Accounts Receivable</span>
                  <span>₹{balanceSheetData.assets.current.receivable.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Inventory</span>
                  <span>₹{balanceSheetData.assets.current.inventory.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2 flex justify-between font-semibold text-slate-900 dark:text-white">
                  <span>Total Current Assets</span>
                  <span>₹{balanceSheetData.assets.current.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Fixed Assets</h3>
              <div className="space-y-2 pl-4 border-l-2 border-blue-200 dark:border-blue-700">
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Property & Land</span>
                  <span>₹{balanceSheetData.assets.fixed.property.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Equipment & Machinery</span>
                  <span>₹{balanceSheetData.assets.fixed.equipment.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2 flex justify-between font-semibold text-slate-900 dark:text-white">
                  <span>Total Fixed Assets</span>
                  <span>₹{balanceSheetData.assets.fixed.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-slate-300 dark:border-slate-600 border-double pt-4">
              <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white">
                <span>Total Assets</span>
                <span>₹{balanceSheetData.assets.totalAssets.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-left mb-6">Liabilities & Equity</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Current Liabilities</h3>
              <div className="space-y-2 pl-4 border-l-2 border-red-200 dark:border-red-700">
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Accounts Payable</span>
                  <span>₹{balanceSheetData.liabilities.current.payable.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Short-term Loans</span>
                  <span>₹{balanceSheetData.liabilities.current.shortTermLoan.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2 flex justify-between font-semibold text-slate-900 dark:text-white">
                  <span>Total Current Liabilities</span>
                  <span>₹{balanceSheetData.liabilities.current.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Long-term Liabilities</h3>
              <div className="space-y-2 pl-4 border-l-2 border-red-200 dark:border-red-700">
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Long-term Debt</span>
                  <span>₹{balanceSheetData.liabilities.longTerm.longTermDebt.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2 flex justify-between font-semibold text-slate-900 dark:text-white">
                  <span>Total Long-term Liabilities</span>
                  <span>₹{balanceSheetData.liabilities.longTerm.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Equity</h3>
              <div className="space-y-2 pl-4 border-l-2 border-green-200 dark:border-green-700">
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Capital Stock</span>
                  <span>₹{balanceSheetData.equity.capital.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Retained Earnings</span>
                  <span>₹{balanceSheetData.equity.retainedEarnings.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2 flex justify-between font-semibold text-slate-900 dark:text-white">
                  <span>Total Equity</span>
                  <span>₹{balanceSheetData.equity.totalEquity.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-slate-300 dark:border-slate-600 border-double pt-4">
              <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white">
                <span>Total Liabilities & Equity</span>
                <span>₹{totalLiabilitiesAndEquity.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Financial Ratios</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Current Ratio</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{ratios.currentRatio}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Current Assets / Current Liabilities</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Debt-to-Equity</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{ratios.debtToEquity}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Liabilities / Total Equity</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Asset Turnover</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{ratios.assetTurnover}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Revenue / Total Assets</p>
          </div>
        </div>
      </div>

      {balanceCheck < 1 && (
        <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <p className="text-green-800 dark:text-green-200 font-medium">✓ Balance sheet is balanced</p>
        </div>
      )}
    </div>
  );
};

export default BalanceSheetPage;
