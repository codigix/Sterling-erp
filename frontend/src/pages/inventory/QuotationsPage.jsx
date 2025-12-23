import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Check,
  X,
  Calendar,
  DollarSign,
} from 'lucide-react';

const QuotationsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const quotationsData = [
    { id: 1, quoteNo: 'QT-001-2024', vendor: 'Vendor A', item: 'Steel Plate 10mm', quantity: 500, unit: 'kg', unitPrice: 450, totalPrice: 225000, validTill: '2024-12-25', status: 'pending', dateRequested: '2024-12-10' },
    { id: 2, quoteNo: 'QT-002-2024', vendor: 'Vendor A', item: 'Fastener Pack', quantity: 2000, unit: 'pcs', unitPrice: 5, totalPrice: 10000, validTill: '2024-12-28', status: 'accepted', dateRequested: '2024-12-08' },
    { id: 3, quoteNo: 'QT-003-2024', vendor: 'Vendor B', item: 'Bearing Set A', quantity: 100, unit: 'sets', unitPrice: 850, totalPrice: 85000, validTill: '2024-12-22', status: 'pending', dateRequested: '2024-12-12' },
    { id: 4, quoteNo: 'QT-004-2024', vendor: 'Vendor C', item: 'Paint - Red', quantity: 200, unit: 'liters', unitPrice: 320, totalPrice: 64000, validTill: '2024-12-20', status: 'rejected', dateRequested: '2024-12-05' },
    { id: 5, quoteNo: 'QT-005-2024', vendor: 'Vendor B', item: 'Motor Unit 3HP', quantity: 50, unit: 'units', unitPrice: 5500, totalPrice: 275000, validTill: '2024-12-30', status: 'pending', dateRequested: '2024-12-14' },
    { id: 6, quoteNo: 'QT-006-2024', vendor: 'Vendor E', item: 'Wire Spool', quantity: 400, unit: 'meters', unitPrice: 180, totalPrice: 72000, validTill: '2024-12-26', status: 'accepted', dateRequested: '2024-12-09' },
    { id: 7, quoteNo: 'QT-007-2024', vendor: 'Vendor D', item: 'Packaging Box L', quantity: 1000, unit: 'boxes', unitPrice: 95, totalPrice: 95000, validTill: '2024-12-23', status: 'pending', dateRequested: '2024-12-11' },
    { id: 8, quoteNo: 'QT-008-2024', vendor: 'Vendor F', item: 'Aluminum Sheet', quantity: 300, unit: 'sheets', unitPrice: 650, totalPrice: 195000, validTill: '2024-12-29', status: 'accepted', dateRequested: '2024-12-06' },
  ];

  const filteredData = quotationsData.filter(quote =>
    (quote.quoteNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
     quote.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
     quote.item.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'all' || quote.status === statusFilter)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const isExpired = (validTill) => {
    const today = new Date('2024-12-15');
    const expiry = new Date(validTill);
    return expiry < today;
  };

  const getDaysValid = (validTill) => {
    const today = new Date('2024-12-15');
    const expiry = new Date(validTill);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center text-xs gap-2">
            <FileText size={24} />
            Vendor Quotations
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage and compare vendor quotes
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium">
            <Plus size={18} />
            Request Quote
          </button>
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <Download size={18} />
            Export Report
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
              placeholder="Search quote, vendor, or item..."
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
            <option value="all">All Quotations</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>

          <button className="flex items-center text-xs justify-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Filter size={18} />
            Advanced Filter
          </button>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Quote No.</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Vendor</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Item</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Quantity</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">Total Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Valid Till</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
              {filteredData.map(quote => (
                <tr key={quote.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${isExpired(quote.validTill) ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                  <td className="p-1">
                    <p className="font-bold text-slate-900 dark:text-white">{quote.quoteNo}</p>
                  </td>
                  <td className="p-1 text-slate-700 dark:text-slate-300">{quote.vendor}</td>
                  <td className="p-1 text-slate-700 dark:text-slate-300">{quote.item}</td>
                  <td className="p-1 text-center">
                    <span className="font-semibold text-slate-900 dark:text-white">{quote.quantity}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{quote.unit}</span>
                  </td>
                  <td className="p-1 text-right">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white flex items-center text-xs justify-end gap-1">
                        <DollarSign size={14} />
                        {quote.totalPrice.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">@ {quote.unitPrice}/unit</p>
                    </div>
                  </td>
                  <td className="p-1">
                    <div className="flex items-center text-xs gap-2">
                      <Calendar size={14} className="text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 text-left dark:text-white">{quote.validTill}</p>
                        <p className={`text-xs ${isExpired(quote.validTill) ? 'text-red-600 font-semibold' : getDaysValid(quote.validTill) <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {isExpired(quote.validTill) ? 'Expired' : getDaysValid(quote.validTill) + ' days valid'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-1 text-center">
                    <span className={`inline-flex items-center text-xs gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(quote.status)}`}>
                      {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-1 text-center">
                    <div className="flex justify-center gap-2">
                      {quote.status === 'pending' && (
                        <>
                          <button className="p-2 hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400 rounded-lg transition-colors" title="Accept">
                            <Check size={16} />
                          </button>
                          <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded-lg transition-colors" title="Reject">
                            <X size={16} />
                          </button>
                        </>
                      )}
                      <button className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg transition-colors" title="View">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quotation Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-blue-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Quotations</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{filteredData.length}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-yellow-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Pending Quotes</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {filteredData.filter(q => q.status === 'pending').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-green-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Accepted Quotes</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {filteredData.filter(q => q.status === 'accepted').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-purple-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Value</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            ₹{(filteredData.reduce((sum, q) => sum + q.totalPrice, 0) / 100000).toFixed(1)}L
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuotationsPage;
