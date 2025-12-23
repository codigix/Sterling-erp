import { useState } from 'react';
import { Search, Filter, Download, Calendar, CheckCircle, Clock } from 'lucide-react';

const PaymentTrackingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('all');

  const paymentTracking = [
    { id: 1, invoiceNo: 'CI-2025-001', customer: 'Client A Industries', amount: 350000, paymentAmount: 350000, status: 'paid', paymentDate: '2025-12-18', daysOutstanding: 0 },
    { id: 2, invoiceNo: 'CI-2025-002', customer: 'Client B Corp', amount: 520000, paymentAmount: 260000, status: 'partial', paymentDate: '2025-12-19', daysOutstanding: 3 },
    { id: 3, invoiceNo: 'CI-2025-003', customer: 'Global Solutions Ltd', amount: 275000, paymentAmount: 0, status: 'pending', paymentDate: null, daysOutstanding: 12 },
    { id: 4, invoiceNo: 'CI-2025-004', customer: 'Tech Ventures Inc', amount: 425000, paymentAmount: 0, status: 'pending', paymentDate: null, daysOutstanding: 9 },
    { id: 5, invoiceNo: 'CI-2025-005', customer: 'Enterprise Solutions', amount: 600000, paymentAmount: 0, status: 'pending', paymentDate: null, daysOutstanding: 7 },
  ];

  const filteredPayments = paymentTracking.filter(payment =>
    payment.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'partial':
        return <Clock size={20} className="text-blue-600" />;
      case 'pending':
        return <Clock size={20} className="text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'partial':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const stats = [
    { label: 'Total Outstanding', value: '₹22,15,000', color: 'text-yellow-600' },
    { label: 'Total Received', value: '₹6,10,000', color: 'text-green-600' },
    { label: 'Avg Days Outstanding', value: '8.2 days', color: 'text-blue-600' },
    { label: 'Collection Rate', value: '73.5%', color: 'text-purple-600' },
  ];

  const totalAmount = paymentTracking.reduce((sum, p) => sum + p.amount, 0);
  const totalReceived = paymentTracking.reduce((sum, p) => sum + p.paymentAmount, 0);
  const totalPending = totalAmount - totalReceived;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Payment Tracking</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor customer payment status and collections</p>
        </div>
        <button className="flex items-center text-xs gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors font-medium">
          <Download size={18} />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
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

          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="mt-1">{getStatusIcon(payment.status)}</div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{payment.invoiceNo}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{payment.customer}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Invoice Amount</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">₹{payment.amount.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Received</p>
                    <p className="text-lg font-bold text-green-600">₹{payment.paymentAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Outstanding</p>
                    <p className="text-lg font-bold text-yellow-600">₹{(payment.amount - payment.paymentAmount).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Days Outstanding</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{payment.daysOutstanding} days</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${(payment.paymentAmount / payment.amount) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 text-xs ">
                    {((payment.paymentAmount / payment.amount) * 100).toFixed(0)}% collected
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Collection Summary</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Amount</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">₹{totalAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <p className="text-sm text-slate-600 dark:text-slate-400">Received</p>
                <p className="text-xl font-bold text-green-600">₹{totalReceived.toLocaleString('en-IN')}</p>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
                <p className="text-xl font-bold text-yellow-600">₹{totalPending.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Filter by Status</h3>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTrackingPage;
