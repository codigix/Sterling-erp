import React, { useState } from 'react';
import {
  CheckCircle,
  Search,
  Filter,
  Download,
  Eye,
  Printer,
  Trash2,
} from 'lucide-react';

const ChallanListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const challans = [
    { id: 1, challanNo: 'CHLN-001-2025', planNo: 'PP-001-2025', customer: 'Client A', quantity: 300, generatedDate: '2025-12-16', deliveryDate: '2025-12-20', status: 'delivered' },
    { id: 2, challanNo: 'CHLN-002-2025', planNo: 'PP-002-2025', customer: 'Client B', quantity: 150, generatedDate: '2025-12-15', deliveryDate: '2025-12-19', status: 'in-transit' },
    { id: 3, challanNo: 'CHLN-003-2025', planNo: 'PP-004-2025', customer: 'Client D', quantity: 350, generatedDate: '2025-12-14', deliveryDate: '2025-12-21', status: 'pending' },
    { id: 4, challanNo: 'CHLN-004-2025', planNo: 'PP-003-2025', customer: 'Client C', quantity: 200, generatedDate: '2025-12-13', deliveryDate: '2025-12-17', status: 'delivered' },
  ];

  const filteredChallans = challans.filter(challan =>
    (challan.challanNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
     challan.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
     challan.planNo.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'all' || challan.status === statusFilter)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in-transit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const stats = [
    { label: 'Total Challans', value: challans.length, color: 'text-blue-600' },
    { label: 'Delivered', value: challans.filter(c => c.status === 'delivered').length, color: 'text-green-600' },
    { label: 'In Transit', value: challans.filter(c => c.status === 'in-transit').length, color: 'text-blue-600' },
    { label: 'Pending', value: challans.filter(c => c.status === 'pending').length, color: 'text-yellow-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Challan List</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage all generated delivery challans</p>
        </div>
        <button className="flex items-center text-xs gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors font-medium">
          <Download size={18} />
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
            <p className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search challan, customer or plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Challan No.</th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Plan No.</th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Customer</th>
                <th className="p-2 text-center text-sm font-semibold text-slate-900 dark:text-white">Quantity</th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Generated Date</th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Expected Delivery</th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                <th className="p-2 text-center text-sm font-semibold text-slate-900 dark:text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredChallans.map((challan) => (
                <tr key={challan.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-2 text-sm font-medium text-slate-900 text-left dark:text-white">{challan.challanNo}</td>
                  <td className="p-2 text-sm text-slate-600 dark:text-slate-400">{challan.planNo}</td>
                  <td className="p-2 text-sm text-slate-600 dark:text-slate-400">{challan.customer}</td>
                  <td className="p-2 text-sm text-center text-slate-600 dark:text-slate-400">{challan.quantity} units</td>
                  <td className="p-2 text-sm text-slate-600 dark:text-slate-400">{challan.generatedDate}</td>
                  <td className="p-2 text-sm text-slate-600 dark:text-slate-400">{challan.deliveryDate}</td>
                  <td className="p-2 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(challan.status)}`}>
                      {challan.status.charAt(0).toUpperCase() + challan.status.slice(1).replace('-', ' ')}
                    </span>
                  </td>
                  <td className="p-2 text-center text-sm">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors">
                        <Eye size={16} className="text-blue-600 dark:text-blue-400" />
                      </button>
                      <button className="p-2 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors">
                        <Printer size={16} className="text-green-600 dark:text-green-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChallanListPage;
