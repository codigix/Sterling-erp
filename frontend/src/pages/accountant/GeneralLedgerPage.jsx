import { useState } from 'react';
import { Search, Filter, Download, Calendar } from 'lucide-react';

const GeneralLedgerPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [accountFilter, setAccountFilter] = useState('all');
  const [dateRange, setDateRange] = useState('month');

  const ledgerEntries = [
    { id: 1, date: '2025-12-20', account: 'Cash in Hand', type: 'Debit', amount: 150000, description: 'Received payment from Client A', reference: 'CI-2025-001', balance: 2450000 },
    { id: 2, date: '2025-12-20', account: 'Bank - HDFC', type: 'Credit', amount: 80000, description: 'Bill payment to ABC Supplies', reference: 'VI-2025-001', balance: 1850000 },
    { id: 3, date: '2025-12-19', account: 'Accounts Receivable', type: 'Debit', amount: 350000, description: 'Invoice issued to Client B', reference: 'CI-2025-002', balance: 2520000 },
    { id: 4, date: '2025-12-19', account: 'Sales Revenue', type: 'Credit', amount: 350000, description: 'Monthly sales recorded', reference: 'SALES-001', balance: 3500000 },
    { id: 5, date: '2025-12-18', account: 'Operating Expenses', type: 'Debit', amount: 45000, description: 'Utility bill payment', reference: 'EXP-001', balance: 2150000 },
    { id: 6, date: '2025-12-18', account: 'Bank - ICICI', type: 'Credit', amount: 45000, description: 'Utility payment', reference: 'EXP-001', balance: 1850000 },
  ];

  const filteredEntries = ledgerEntries.filter(entry =>
    (entry.account.toLowerCase().includes(searchQuery.toLowerCase()) ||
     entry.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (accountFilter === 'all' || entry.account === accountFilter)
  );

  const totalDebits = filteredEntries.filter(e => e.type === 'Debit').reduce((sum, e) => sum + e.amount, 0);
  const totalCredits = filteredEntries.filter(e => e.type === 'Credit').reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">General Ledger</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View all ledger entries and transactions</p>
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
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Debits</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">₹{totalDebits.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Credits</p>
          <p className="text-2xl font-bold text-green-600 mt-2">₹{totalCredits.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Balance</p>
          <p className={`text-2xl font-bold mt-2 ${totalDebits >= totalCredits ? 'text-blue-600' : 'text-red-600'}`}>
            ₹{Math.abs(totalDebits - totalCredits).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Search Entries</label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by account or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Account Filter</label>
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
          >
            <option value="all">All Accounts</option>
            <option value="Cash in Hand">Cash in Hand</option>
            <option value="Bank - HDFC">Bank - HDFC</option>
            <option value="Bank - ICICI">Bank - ICICI</option>
            <option value="Accounts Receivable">Accounts Receivable</option>
            <option value="Sales Revenue">Sales Revenue</option>
            <option value="Operating Expenses">Operating Expenses</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Date</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Account</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Description</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Type</th>
              <th className="px-6 py-3 text-right font-semibold text-slate-900 dark:text-white">Amount</th>
              <th className="px-6 py-3 text-right font-semibold text-slate-900 dark:text-white">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <td className="p-1 text-slate-700 dark:text-slate-300">{entry.date}</td>
                <td className="p-1 font-medium text-slate-900 dark:text-white">{entry.account}</td>
                <td className="p-1 text-slate-700 dark:text-slate-300">{entry.description}</td>
                <td className="p-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    entry.type === 'Debit' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {entry.type}
                  </span>
                </td>
                <td className={`p-1 text-right font-medium ${
                  entry.type === 'Debit' ? 'text-blue-600' : 'text-green-600'
                }`}>
                  ₹{entry.amount.toLocaleString('en-IN')}
                </td>
                <td className="p-1 text-right font-medium text-slate-900 dark:text-white">₹{entry.balance.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GeneralLedgerPage;
