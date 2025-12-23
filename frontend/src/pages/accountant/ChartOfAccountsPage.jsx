import { useState } from 'react';
import { Search, Filter, Download, Plus, Edit, Trash2 } from 'lucide-react';

const ChartOfAccountsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setcategoryFilter] = useState('all');

  const accounts = [
    { id: 1, code: '1000', name: 'Cash in Hand', category: 'Asset', balance: 2450000, type: 'Current' },
    { id: 2, code: '1010', name: 'Bank - HDFC', category: 'Asset', balance: 5000000, type: 'Current' },
    { id: 3, code: '1020', name: 'Bank - ICICI', category: 'Asset', balance: 3200000, type: 'Current' },
    { id: 4, code: '1050', name: 'Accounts Receivable', category: 'Asset', balance: 4532500, type: 'Current' },
    { id: 5, code: '1100', name: 'Inventory', category: 'Asset', balance: 8500000, type: 'Current' },
    { id: 6, code: '1200', name: 'Fixed Assets', category: 'Asset', balance: 15000000, type: 'Fixed' },
    { id: 7, code: '2000', name: 'Accounts Payable', category: 'Liability', balance: 2215000, type: 'Current' },
    { id: 8, code: '2100', name: 'Short-term Loans', category: 'Liability', balance: 5000000, type: 'Current' },
    { id: 9, code: '2200', name: 'Long-term Debt', category: 'Liability', balance: 10000000, type: 'Long-term' },
    { id: 10, code: '3000', name: 'Capital Stock', category: 'Equity', balance: 20000000, type: 'Equity' },
    { id: 11, code: '3100', name: 'Retained Earnings', category: 'Equity', balance: 8250000, type: 'Equity' },
    { id: 12, code: '4000', name: 'Sales Revenue', category: 'Revenue', balance: 95430000, type: 'Revenue' },
    { id: 13, code: '4100', name: 'Service Income', category: 'Revenue', balance: 12500000, type: 'Revenue' },
    { id: 14, code: '5000', name: 'COGS', category: 'Expense', balance: 45000000, type: 'Operating' },
    { id: 15, code: '5100', name: 'Salaries', category: 'Expense', balance: 22500000, type: 'Operating' },
    { id: 16, code: '5200', name: 'Rent', category: 'Expense', balance: 9600000, type: 'Operating' },
  ];

  const filteredAccounts = accounts.filter(account =>
    (account.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
     account.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (categoryFilter === 'all' || account.category === categoryFilter)
  );

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Asset':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Liability':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Equity':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Revenue':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Expense':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const totalAssets = accounts.filter(a => a.category === 'Asset').reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.category === 'Liability').reduce((sum, a) => sum + a.balance, 0);
  const totalEquity = accounts.filter(a => a.category === 'Equity').reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Chart of Accounts</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account structure and categories</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <Plus size={18} />
            New Account
          </button>
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors font-medium">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Assets</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">₹{totalAssets.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Liabilities</p>
          <p className="text-2xl font-bold text-red-600 mt-2">₹{totalLiabilities.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Equity</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">₹{totalEquity.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Search Accounts</label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category Filter</label>
          <select
            value={categoryFilter}
            onChange={(e) => setcategoryFilter(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
          >
            <option value="all">All Categories</option>
            <option value="Asset">Assets</option>
            <option value="Liability">Liabilities</option>
            <option value="Equity">Equity</option>
            <option value="Revenue">Revenue</option>
            <option value="Expense">Expenses</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Code</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Account Name</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Category</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Type</th>
              <th className="px-6 py-3 text-right font-semibold text-slate-900 dark:text-white">Balance</th>
              <th className="px-6 py-3 text-center font-semibold text-slate-900 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredAccounts.map((account) => (
              <tr key={account.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <td className="p-1 font-medium text-slate-900 dark:text-white">{account.code}</td>
                <td className="p-1 text-slate-700 dark:text-slate-300">{account.name}</td>
                <td className="p-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(account.category)}`}>
                    {account.category}
                  </span>
                </td>
                <td className="p-1 text-slate-700 dark:text-slate-300">{account.type}</td>
                <td className="p-1 text-right font-medium text-slate-900 dark:text-white">₹{account.balance.toLocaleString('en-IN')}</td>
                <td className="p-1 flex justify-center gap-2">
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded transition-colors">
                    <Edit size={16} className="text-blue-600 dark:text-blue-400" />
                  </button>
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded transition-colors">
                    <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChartOfAccountsPage;
