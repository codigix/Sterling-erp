import { useState } from 'react';
import { Search, Filter, Download, Plus, Eye, Edit, Trash2 } from 'lucide-react';

const VendorInvoicesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const vendorInvoices = [
    { id: 1, invoiceNo: 'VI-2025-001', vendor: 'ABC Supplies Ltd', amount: 150000, dueDate: '2025-12-25', issueDate: '2025-12-16', status: 'pending', description: 'Raw Materials' },
    { id: 2, invoiceNo: 'VI-2025-002', vendor: 'XYZ Manufacturing', amount: 280000, dueDate: '2025-12-22', issueDate: '2025-12-10', status: 'overdue', description: 'Equipment Parts' },
    { id: 3, invoiceNo: 'VI-2025-003', vendor: 'Tech Components Co', amount: 95000, dueDate: '2026-01-15', issueDate: '2025-12-15', status: 'pending', description: 'Electronic Components' },
    { id: 4, invoiceNo: 'VI-2025-004', vendor: 'Global Logistics', amount: 45000, dueDate: '2025-12-20', issueDate: '2025-12-05', status: 'paid', description: 'Shipping Services' },
    { id: 5, invoiceNo: 'VI-2025-005', vendor: 'Quality Chemicals', amount: 125000, dueDate: '2026-01-10', issueDate: '2025-12-12', status: 'pending', description: 'Chemical Supplies' },
    { id: 6, invoiceNo: 'VI-2025-006', vendor: 'Industrial Tools', amount: 87000, dueDate: '2025-12-23', issueDate: '2025-12-08', status: 'overdue', description: 'Maintenance Tools' },
  ];

  const filteredInvoices = vendorInvoices.filter(invoice =>
    (invoice.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
     invoice.vendor.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'all' || invoice.status === statusFilter)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const stats = [
    { label: 'Total Invoices', value: vendorInvoices.length, color: 'text-blue-600' },
    { label: 'Pending', value: vendorInvoices.filter(v => v.status === 'pending').length, color: 'text-yellow-600' },
    { label: 'Overdue', value: vendorInvoices.filter(v => v.status === 'overdue').length, color: 'text-red-600' },
    { label: 'Paid', value: vendorInvoices.filter(v => v.status === 'paid').length, color: 'text-green-600' },
  ];

  const totalAmount = vendorInvoices.reduce((sum, v) => sum + v.amount, 0);
  const pendingAmount = vendorInvoices.filter(v => v.status !== 'paid').reduce((sum, v) => sum + v.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Vendor Invoices</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage vendor bills and invoices</p>
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
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Vendor</th>
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
                    <td className="p-1 text-slate-700 dark:text-slate-300">{invoice.vendor}</td>
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

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Summary</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Amount</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">₹{totalAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <p className="text-sm text-slate-600 dark:text-slate-400">Pending Amount</p>
                <p className="text-2xl font-bold text-yellow-600">₹{pendingAmount.toLocaleString('en-IN')}</p>
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
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorInvoicesPage;
