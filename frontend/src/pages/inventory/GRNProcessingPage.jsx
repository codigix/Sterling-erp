import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  Download,
  Check,
  X,
  Plus,
  Eye,
  AlertTriangle,
  Clock,
  Truck,
} from 'lucide-react';

const GRNProcessingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const grnData = [
    { id: 1, grnNo: 'GRN-001-2024', poNo: 'PO-001-2024', vendor: 'Vendor A', item: 'Steel Plate 10mm', expectedQty: 500, receivedQty: 500, unit: 'kg', expectedDate: '2024-12-17', receivedDate: '2024-12-16', status: 'completed', inspectionStatus: 'approved' },
    { id: 2, grnNo: 'GRN-002-2024', poNo: 'PO-002-2024', vendor: 'Vendor A', item: 'Fastener Pack', expectedQty: 2000, receivedQty: 2000, unit: 'pcs', expectedDate: '2024-12-15', receivedDate: '2024-12-15', status: 'completed', inspectionStatus: 'approved' },
    { id: 3, grnNo: 'GRN-003-2024', poNo: 'PO-003-2024', vendor: 'Vendor B', item: 'Bearing Set A', expectedQty: 100, receivedQty: 95, unit: 'sets', expectedDate: '2024-12-20', receivedDate: '2024-12-19', status: 'pending', inspectionStatus: 'pending' },
    { id: 4, grnNo: 'GRN-004-2024', poNo: 'PO-004-2024', vendor: 'Vendor C', item: 'Paint - Red', expectedQty: 200, receivedQty: 180, unit: 'liters', expectedDate: '2024-12-12', receivedDate: '2024-12-14', status: 'completed', inspectionStatus: 'hold' },
    { id: 5, grnNo: 'GRN-005-2024', poNo: 'PO-005-2024', vendor: 'Vendor B', item: 'Motor Unit 3HP', expectedQty: 50, receivedQty: 50, unit: 'units', expectedDate: '2024-12-28', receivedDate: '2024-12-25', status: 'pending', inspectionStatus: 'pending' },
    { id: 6, grnNo: 'GRN-006-2024', poNo: 'PO-006-2024', vendor: 'Vendor E', item: 'Wire Spool', expectedQty: 400, receivedQty: 400, unit: 'meters', expectedDate: '2024-12-16', receivedDate: '2024-12-15', status: 'completed', inspectionStatus: 'approved' },
    { id: 7, grnNo: 'GRN-007-2024', poNo: 'PO-007-2024', vendor: 'Vendor D', item: 'Packaging Box L', expectedQty: 1000, receivedQty: 1000, unit: 'boxes', expectedDate: '2024-12-21', receivedDate: null, status: 'pending', inspectionStatus: 'pending' },
    { id: 8, grnNo: 'GRN-008-2024', poNo: 'PO-008-2024', vendor: 'Vendor F', item: 'Aluminum Sheet', expectedQty: 300, receivedQty: 300, unit: 'sheets', expectedDate: '2024-12-13', receivedDate: '2024-12-12', status: 'completed', inspectionStatus: 'approved' },
  ];

  const filteredData = grnData.filter(grn =>
    (grn.grnNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
     grn.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
     grn.item.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'all' || grn.status === statusFilter)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getInspectionColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hold':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getQtyVarianceColor = (expected, received) => {
    if (received === expected) return 'text-green-600';
    if (received < expected) return 'text-red-600';
    return 'text-orange-600';
  };

  const stats = [
    { label: 'Total GRNs', value: grnData.length, color: 'text-blue-600' },
    { label: 'Completed', value: grnData.filter(g => g.status === 'completed').length, color: 'text-green-600' },
    { label: 'Pending', value: grnData.filter(g => g.status === 'pending').length, color: 'text-yellow-600' },
    { label: 'Approved', value: grnData.filter(g => g.inspectionStatus === 'approved').length, color: 'text-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">GRN Processing</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage goods received notes and inspections</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <Plus size={18} />
            New GRN
          </button>
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors font-medium">
            <Download size={18} />
            Export
          </button>
        </div>
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
              placeholder="Search GRN, PO, vendor or item..."
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
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">GRN No.</th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">PO No.</th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Vendor</th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Item</th>
                <th className="p-2 text-center text-sm font-semibold text-slate-900 dark:text-white">Qty Variance</th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Inspection</th>
                <th className="p-2 text-center text-sm font-semibold text-slate-900 dark:text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((grn) => (
                <tr key={grn.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-2 text-sm font-medium text-slate-900 text-left dark:text-white">{grn.grnNo}</td>
                  <td className="p-2 text-sm text-slate-600 dark:text-slate-400">{grn.poNo}</td>
                  <td className="p-2 text-sm text-slate-600 dark:text-slate-400">{grn.vendor}</td>
                  <td className="p-2 text-sm text-slate-600 dark:text-slate-400">{grn.item}</td>
                  <td className={`p-2 text-sm font-medium text-center ${getQtyVarianceColor(grn.expectedQty, grn.receivedQty)}`}>
                    {grn.receivedQty}/{grn.expectedQty}
                  </td>
                  <td className="p-2 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(grn.status)}`}>
                      {grn.status.charAt(0).toUpperCase() + grn.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-2 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getInspectionColor(grn.inspectionStatus)}`}>
                      {grn.inspectionStatus.charAt(0).toUpperCase() + grn.inspectionStatus.slice(1)}
                    </span>
                  </td>
                  <td className="p-2 text-center text-sm">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors">
                        <Eye size={16} className="text-blue-600 dark:text-blue-400" />
                      </button>
                      <button className="p-2 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors">
                        <Check size={16} className="text-green-600 dark:text-green-400" />
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

export default GRNProcessingPage;
