import { useState } from 'react';
import { Search, Filter, Download, Plus, Eye, CheckCircle, Clock, X } from 'lucide-react';

const ExpenseTrackingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const expenses = [
    { id: 1, date: '2025-12-20', category: 'Travel', description: 'Hotel stay in Mumbai', amount: 8500, employee: 'John Smith', receipt: 'yes', status: 'approved', approvedBy: 'Manager A' },
    { id: 2, date: '2025-12-19', category: 'Meals', description: 'Team lunch meeting', amount: 3200, employee: 'Sarah Johnson', receipt: 'yes', status: 'pending', approvedBy: null },
    { id: 3, date: '2025-12-18', category: 'Office Supplies', description: 'Printer cartridges', amount: 2150, employee: 'Mike Chen', receipt: 'yes', status: 'approved', approvedBy: 'Manager B' },
    { id: 4, date: '2025-12-17', category: 'Client Meeting', description: 'Client entertainment', amount: 5800, employee: 'Emma Davis', receipt: 'no', status: 'pending', approvedBy: null },
    { id: 5, date: '2025-12-16', category: 'Travel', description: 'Flight tickets', amount: 12500, employee: 'Alex Brown', receipt: 'yes', status: 'approved', approvedBy: 'Manager A' },
    { id: 6, date: '2025-12-15', category: 'Conferences', description: 'Conference registration', amount: 4500, employee: 'Lisa White', receipt: 'yes', status: 'approved', approvedBy: 'Director' },
  ];

  const filteredExpenses = expenses.filter(expense =>
    (expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
     expense.employee.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'all' || expense.status === statusFilter) &&
    (categoryFilter === 'all' || expense.category === categoryFilter)
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={18} className="text-green-600" />;
      case 'pending':
        return <Clock size={18} className="text-yellow-600" />;
      case 'rejected':
        return <X size={18} className="text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const stats = [
    { label: 'Total Expenses', value: expenses.length, color: 'text-blue-600' },
    { label: 'Approved', value: expenses.filter(e => e.status === 'approved').length, color: 'text-green-600' },
    { label: 'Pending', value: expenses.filter(e => e.status === 'pending').length, color: 'text-yellow-600' },
    { label: 'Total Amount', value: '₹' + expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString('en-IN'), color: 'text-purple-600' },
  ];

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const approvedAmount = expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0);
  const pendingAmount = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);

  const expensesByCategory = {};
  expenses.forEach(expense => {
    expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + expense.amount;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Expense Tracking</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and approve employee expenses</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <Plus size={18} />
            New Expense
          </button>
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors font-medium">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex gap-4 flex-wrap mb-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Search Expenses</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search description or employee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
              >
                <option value="all">All Categories</option>
                <option value="Travel">Travel</option>
                <option value="Meals">Meals</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Client Meeting">Client Meeting</option>
                <option value="Conferences">Conferences</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Date</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Description</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Employee</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Category</th>
                  <th className="px-6 py-3 text-right font-semibold text-slate-900 dark:text-white">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="p-1 text-slate-700 dark:text-slate-300">{expense.date}</td>
                    <td className="p-1 text-slate-900 dark:text-white font-medium">{expense.description}</td>
                    <td className="p-1 text-slate-700 dark:text-slate-300">{expense.employee}</td>
                    <td className="p-1">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-medium text-slate-700 dark:text-slate-300">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-1 text-right font-medium text-slate-900 dark:text-white">₹{expense.amount.toLocaleString('en-IN')}</td>
                    <td className="p-1">
                      <div className="flex items-center text-xs gap-2">
                        {getStatusIcon(expense.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                          {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Expense Summary</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Amount</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">₹{totalAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <p className="text-sm text-slate-600 dark:text-slate-400">Approved</p>
                <p className="text-xl font-bold text-green-600">₹{approvedAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
                <p className="text-xl font-bold text-yellow-600">₹{pendingAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">By Category</h3>
            <div className="space-y-3">
              {Object.entries(expensesByCategory).map(([category, amount]) => (
                <div key={category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{category}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">₹{amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${(amount / totalAmount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTrackingPage;
