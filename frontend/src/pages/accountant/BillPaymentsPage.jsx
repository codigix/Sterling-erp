import { useState } from 'react';
import { Search, Filter, Download, Plus, Eye, CreditCard, CheckCircle } from 'lucide-react';

const BillPaymentsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const billPayments = [
    { id: 1, paymentNo: 'BP-2025-001', vendor: 'ABC Supplies Ltd', amount: 150000, dueDate: '2025-12-25', paymentDate: '2025-12-20', method: 'NEFT', status: 'completed' },
    { id: 2, paymentNo: 'BP-2025-002', vendor: 'XYZ Manufacturing', amount: 280000, dueDate: '2025-12-22', paymentDate: null, method: 'Cheque', status: 'pending' },
    { id: 3, paymentNo: 'BP-2025-003', vendor: 'Tech Components Co', amount: 95000, dueDate: '2026-01-15', paymentDate: null, method: 'RTGS', status: 'scheduled' },
    { id: 4, paymentNo: 'BP-2025-004', vendor: 'Global Logistics', amount: 45000, dueDate: '2025-12-20', paymentDate: '2025-12-18', method: 'NEFT', status: 'completed' },
    { id: 5, paymentNo: 'BP-2025-005', vendor: 'Quality Chemicals', amount: 125000, dueDate: '2026-01-10', paymentDate: null, method: 'Cheque', status: 'pending' },
  ];

  const filteredPayments = billPayments.filter(payment =>
    (payment.paymentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
     payment.vendor.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'all' || payment.status === statusFilter)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const stats = [
    { label: 'Total Payments', value: billPayments.length, color: 'text-blue-600' },
    { label: 'Completed', value: billPayments.filter(b => b.status === 'completed').length, color: 'text-green-600' },
    { label: 'Pending', value: billPayments.filter(b => b.status === 'pending').length, color: 'text-yellow-600' },
    { label: 'Scheduled', value: billPayments.filter(b => b.status === 'scheduled').length, color: 'text-blue-600' },
  ];

  const totalAmount = billPayments.reduce((sum, b) => sum + b.amount, 0);
  const completedAmount = billPayments.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.amount, 0);
  const pendingAmount = billPayments.filter(b => b.status !== 'completed').reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Bill Payments</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track and manage bill payments</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <Plus size={18} />
            New Payment
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
              placeholder="Search payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Payment</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Vendor</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Amount</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Method</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">Status</th>
                  <th className="px-6 py-3 text-center font-semibold text-slate-900 dark:text-white">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="p-1 font-medium text-slate-900 dark:text-white">{payment.paymentNo}</td>
                    <td className="p-1 text-slate-700 dark:text-slate-300">{payment.vendor}</td>
                    <td className="p-1 font-medium text-slate-900 dark:text-white">₹{payment.amount.toLocaleString('en-IN')}</td>
                    <td className="p-1 text-slate-700 dark:text-slate-300">{payment.method}</td>
                    <td className="p-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-1 flex justify-center gap-2">
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded transition-colors">
                        <Eye size={16} className="text-slate-600 dark:text-slate-400" />
                      </button>
                      {payment.status === 'pending' && (
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded transition-colors">
                          <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Amount</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">₹{totalAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
                <p className="text-xl font-bold text-green-600">₹{completedAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
                <p className="text-xl font-bold text-yellow-600">₹{pendingAmount.toLocaleString('en-IN')}</p>
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
              <option value="all">All Payments</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillPaymentsPage;
