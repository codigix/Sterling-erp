import React, { useState } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Printer,
  Trash2,
  Calendar,
  DollarSign,
  Truck,
} from 'lucide-react';

const PurchaseOrderPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const purchaseOrders = [
    { id: 1, poNo: 'PO-001-2024', vendor: 'Vendor A', items: 'Steel Plate 10mm', quantity: 500, unitPrice: 450, totalAmount: 225000, poDate: '2024-12-10', expectedDelivery: '2024-12-17', status: 'confirmed', paymentStatus: 'pending' },
    { id: 2, poNo: 'PO-002-2024', vendor: 'Vendor A', items: 'Fastener Pack', quantity: 2000, unitPrice: 5, totalAmount: 10000, poDate: '2024-12-08', expectedDelivery: '2024-12-15', status: 'delivered', paymentStatus: 'paid' },
    { id: 3, poNo: 'PO-003-2024', vendor: 'Vendor B', items: 'Bearing Set A', quantity: 100, unitPrice: 850, totalAmount: 85000, poDate: '2024-12-12', expectedDelivery: '2024-12-20', status: 'in-transit', paymentStatus: 'pending' },
    { id: 4, poNo: 'PO-004-2024', vendor: 'Vendor C', items: 'Paint - Red', quantity: 200, unitPrice: 320, totalAmount: 64000, poDate: '2024-12-05', expectedDelivery: '2024-12-12', status: 'cancelled', paymentStatus: 'cancelled' },
    { id: 5, poNo: 'PO-005-2024', vendor: 'Vendor B', items: 'Motor Unit 3HP', quantity: 50, unitPrice: 5500, totalAmount: 275000, poDate: '2024-12-14', expectedDelivery: '2024-12-28', status: 'confirmed', paymentStatus: 'pending' },
    { id: 6, poNo: 'PO-006-2024', vendor: 'Vendor E', items: 'Wire Spool', quantity: 400, unitPrice: 180, totalAmount: 72000, poDate: '2024-12-09', expectedDelivery: '2024-12-16', status: 'delivered', paymentStatus: 'paid' },
    { id: 7, poNo: 'PO-007-2024', vendor: 'Vendor D', items: 'Packaging Box L', quantity: 1000, unitPrice: 95, totalAmount: 95000, poDate: '2024-12-11', expectedDelivery: '2024-12-21', status: 'confirmed', paymentStatus: 'partial' },
    { id: 8, poNo: 'PO-008-2024', vendor: 'Vendor F', items: 'Aluminum Sheet', quantity: 300, unitPrice: 650, totalAmount: 195000, poDate: '2024-12-06', expectedDelivery: '2024-12-13', status: 'delivered', paymentStatus: 'paid' },
  ];

  const filteredData = purchaseOrders.filter(po =>
    (po.poNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
     po.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
     po.items.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'all' || po.status === statusFilter)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in-transit':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPaymentColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'partial':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'cancelled':
        return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const isOverdue = (expectedDelivery) => {
    const today = new Date('2024-12-15');
    const delivery = new Date(expectedDelivery);
    return delivery < today;
  };

  const getDaysUntilDelivery = (expectedDelivery) => {
    const today = new Date('2024-12-15');
    const delivery = new Date(expectedDelivery);
    return Math.ceil((delivery - today) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center text-xs gap-2">
            <ShoppingCart size={24} />
            Purchase Orders
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Track all purchase orders and deliveries
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium">
            <Plus size={18} />
            Create PO
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
              placeholder="Search PO, vendor, or item..."
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
            <option value="all">All Orders</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button className="flex items-center text-xs justify-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Filter size={18} />
            Advanced Filter
          </button>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">PO Number</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Vendor</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Item</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Qty</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Delivery</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Order Status</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Payment</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
              {filteredData.map(po => (
                <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="p-1">
                    <p className="font-bold text-slate-900 dark:text-white">{po.poNo}</p>
                  </td>
                  <td className="p-1 text-slate-700 dark:text-slate-300">{po.vendor}</td>
                  <td className="p-1 text-slate-700 dark:text-slate-300 text-sm">{po.items}</td>
                  <td className="p-1 text-center">
                    <span className="font-semibold text-slate-900 dark:text-white">{po.quantity}</span>
                  </td>
                  <td className="p-1 text-right">
                    <p className="font-bold text-slate-900 dark:text-white flex items-center text-xs justify-end gap-1">
                      <DollarSign size={14} />
                      {po.totalAmount.toLocaleString()}
                    </p>
                  </td>
                  <td className="p-1">
                    <div className="flex items-center text-xs gap-2">
                      <Calendar size={14} className="text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 text-left dark:text-white">{po.expectedDelivery}</p>
                        <p className={`text-xs ${isOverdue(po.expectedDelivery) ? 'text-red-600 font-semibold' : getDaysUntilDelivery(po.expectedDelivery) <= 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {isOverdue(po.expectedDelivery) ? 'Overdue' : getDaysUntilDelivery(po.expectedDelivery) + ' days'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-1 text-center">
                    <span className={`inline-flex items-center text-xs gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(po.status)}`}>
                      {po.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </td>
                  <td className="p-1 text-center">
                    <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${getPaymentColor(po.paymentStatus)}`}>
                      {po.paymentStatus.charAt(0).toUpperCase() + po.paymentStatus.slice(1)}
                    </span>
                  </td>
                  <td className="p-1 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg transition-colors" title="View">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg transition-colors" title="Print">
                        <Printer size={16} />
                      </button>
                      {po.status !== 'delivered' && (
                        <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-blue-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total POs</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{filteredData.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-green-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Delivered</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {filteredData.filter(po => po.status === 'delivered').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-orange-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">In Transit</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {filteredData.filter(po => po.status === 'in-transit').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-yellow-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Pending Payment</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {filteredData.filter(po => po.paymentStatus === 'pending').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-purple-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Value</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            ₹{(filteredData.reduce((sum, po) => sum + po.totalAmount, 0) / 100000).toFixed(1)}L
          </p>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderPage;
