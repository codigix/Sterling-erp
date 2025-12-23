import { useState } from 'react';
import { Search, Filter, Download, Plus, Eye, Edit, Trash2 } from 'lucide-react';

const CustomerInvoicesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const customerInvoices = [
    { id: 1, invoiceNo: 'CI-2025-001', customer: 'Client A Industries', amount: 350000, dueDate: '2026-01-20', issueDate: '2025-12-20', status: 'paid', description: 'Production Run #1' },
    { id: 2, invoiceNo: 'CI-2025-002', customer: 'Client B Corp', amount: 520000, dueDate: '2026-01-10', issueDate: '2025-12-15', status: 'partial', description: 'Custom Manufacturing' },
    { id: 3, invoiceNo: 'CI-2025-003', customer: 'Global Solutions Ltd', amount: 275000, dueDate: '2025-12-30', issueDate: '2025-12-18', status: 'pending', description: 'Supply Delivery' },
    { id: 4, invoiceNo: 'CI-2025-004', customer: 'Tech Ventures Inc', amount: 425000, dueDate: '2026-01-15', issueDate: '2025-12-16', status: 'pending', description: 'Project Work' },
    { id: 5, invoiceNo: 'CI-2025-005', customer: 'Enterprise Solutions', amount: 600000, dueDate: '2026-02-01', issueDate: '2025-12-14', status: 'pending', description: 'Annual Contract' },
  ];

  const filteredInvoices = customerInvoices.filter(invoice =>
    (invoice.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
     invoice.customer.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'all' || invoice.status === statusFilter)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'partial':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const stats = [
    { label: 'Total Invoices', value: customerInvoices.length, color: 'text-blue-600' },
    { label: 'Paid', value: customerInvoices.filter(c => c.status === 'paid').length, color: 'text-green-600' },
    { label: 'Pending', value: customerInvoices.filter(c => c.status === 'pending').length, color: 'text-yellow-600' },
    { label: 'Partial', value: customerInvoices.filter(c => c.status === 'partial').length, color: 'text-blue-600' },
  ];

  const totalAmount = customerInvoices.reduce((sum, c) => sum + c.amount, 0);
  const paidAmount = customerInvoices.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0);
  const outstandingAmount = totalAmount - paidAmount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Customer Invoices</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage customer invoices and collections</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <Plus size={18} />
            New Invoice
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
          <div className="relative mb-6">
            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Invoice</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Customer</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Due Date</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Status</th>
                  <th className="px-6 py-3 text-center font-semibold text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="p-1 font-medium text-slate-900 dark:text-white">{invoice.invoiceNo}</td>
                    <td className="p-1 text-slate-700 dark:text-slate-300">{invoice.customer}</td>
                    <td className="p-1 font-medium text-slate-900 dark:text-white">₹{invoice.amount.toLocaleString('en-IN')}</td>
                    <td className="p-1 text-slate-700 dark:text-slate-300">{invoice.dueDate}</td>
                    <td className="p-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-1 flex justify-center gap-2">
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded transition-colors">
                        <Eye size={16} className="text-slate-600 dark:text-slate-400" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded transition-colors">
                        <Edit size={16} className="text-blue-600 dark:text-blue-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Revenue Summary</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Invoiced</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">₹{totalAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <p className="text-sm text-slate-600 dark:text-slate-400">Paid Amount</p>
                <p className="text-xl font-bold text-green-600">₹{paidAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <p className="text-sm text-slate-600 dark:text-slate-400">Outstanding</p>
                <p className="text-xl font-bold text-yellow-600">₹{outstandingAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Status Filter</h3>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
            >
              <option value="all">All Invoices</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInvoicesPage;
