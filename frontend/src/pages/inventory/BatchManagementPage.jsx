import React, { useState } from 'react';
import {
  Package,
  Search,
  Plus,
  Filter,
  Download,
  Trash2,
  Eye,
  Check,
  Clock,
  AlertTriangle,
} from 'lucide-react';

const BatchManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const batchData = [
    { id: 1, batchNo: 'BATCH-001-2024', item: 'Steel Plate 10mm', supplier: 'Vendor A', quantity: 500, unit: 'kg', dateReceived: '2024-12-01', expiryDate: '2025-12-01', status: 'active', location: 'Storage A-12-01' },
    { id: 2, batchNo: 'BATCH-002-2024', item: 'Aluminum Sheet', supplier: 'Vendor A', quantity: 300, unit: 'sheets', dateReceived: '2024-12-05', expiryDate: '2025-06-05', status: 'active', location: 'Storage B-05-03' },
    { id: 3, batchNo: 'BATCH-003-2024', item: 'Bearing Set A', supplier: 'Vendor B', quantity: 100, unit: 'sets', dateReceived: '2024-11-15', expiryDate: '2024-12-25', status: 'expiring', location: 'Storage C-03-02' },
    { id: 4, batchNo: 'BATCH-004-2024', item: 'Paint - Red', supplier: 'Vendor C', quantity: 200, unit: 'liters', dateReceived: '2024-10-20', expiryDate: '2024-10-30', status: 'expired', location: 'Storage D-08-05' },
    { id: 5, batchNo: 'BATCH-005-2024', item: 'Fastener Pack', supplier: 'Vendor A', quantity: 5000, unit: 'pcs', dateReceived: '2024-12-10', expiryDate: '2026-12-10', status: 'active', location: 'Storage A-01-01' },
    { id: 6, batchNo: 'BATCH-006-2024', item: 'Wire Spool', supplier: 'Vendor E', quantity: 400, unit: 'meters', dateReceived: '2024-11-30', expiryDate: '2025-11-30', status: 'active', location: 'Storage F-04-02' },
    { id: 7, batchNo: 'BATCH-007-2024', item: 'Motor Unit 3HP', supplier: 'Vendor B', quantity: 50, unit: 'units', dateReceived: '2024-11-05', expiryDate: '2025-11-05', status: 'active', location: 'Storage G-06-01' },
    { id: 8, batchNo: 'BATCH-008-2024', item: 'Packaging Box L', supplier: 'Vendor D', quantity: 1000, unit: 'boxes', dateReceived: '2024-12-08', expiryDate: '2025-12-08', status: 'active', location: 'Storage E-02-04' },
  ];

  const filteredData = batchData.filter(batch =>
    (batch.batchNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
     batch.item.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'all' || batch.status === statusFilter)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Check size={16} />;
      case 'expiring':
        return <Clock size={16} />;
      case 'expired':
        return <AlertTriangle size={16} />;
      default:
        return null;
    }
  };

  const calculateDaysUntilExpiry = (expiryDate) => {
    const today = new Date('2024-12-15');
    const expiry = new Date(expiryDate);
    const days = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center text-xs gap-2">
            <Package size={24} />
            Batch Management
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Track and manage inventory batches
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium">
            <Plus size={18} />
            New Batch
          </button>
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search batch or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
          >
            <option value="all">All Batches</option>
            <option value="active">Active</option>
            <option value="expiring">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>

          <button className="flex items-center text-xs justify-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Filter size={18} />
            Advanced Filter
          </button>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Batch Number</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Item</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Quantity</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Supplier</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Expiry Date</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
              {filteredData.map(batch => {
                const daysLeft = calculateDaysUntilExpiry(batch.expiryDate);
                return (
                  <tr key={batch.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="p-1">
                      <p className="font-bold text-slate-900 dark:text-white">{batch.batchNo}</p>
                    </td>
                    <td className="p-1 text-slate-700 dark:text-slate-300">{batch.item}</td>
                    <td className="p-1 text-center">
                      <span className="font-semibold text-slate-900 dark:text-white">{batch.quantity}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{batch.unit}</span>
                    </td>
                    <td className="p-1 text-slate-700 dark:text-slate-300">{batch.supplier}</td>
                    <td className="p-1">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{batch.expiryDate}</p>
                        <p className={`text-xs mt-1 ${daysLeft <= 0 ? 'text-red-600' : daysLeft <= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {daysLeft <= 0 ? 'Expired' : daysLeft === 1 ? '1 day left' : `${daysLeft} days left`}
                        </p>
                      </div>
                    </td>
                    <td className="p-1 text-center">
                      <span className={`inline-flex items-center text-xs gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(batch.status)}`}>
                        {getStatusIcon(batch.status)}
                        {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-1 text-center">
                      <div className="flex justify-center gap-2">
                        <button className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-green-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Active Batches</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {filteredData.filter(b => b.status === 'active').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-yellow-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Expiring Soon</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {filteredData.filter(b => b.status === 'expiring').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-red-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Expired Batches</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {filteredData.filter(b => b.status === 'expired').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-blue-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Quantity</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {filteredData.reduce((sum, batch) => sum + batch.quantity, 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BatchManagementPage;
