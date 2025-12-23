import React, { useState } from 'react';
import {
  CheckCircle,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  AlertTriangle,
  Clock,
  User,
  FileText,
} from 'lucide-react';

const QCInspectionsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const inspectionData = [
    { id: 1, inspectionNo: 'QCI-001-2024', grnNo: 'GRN-001-2024', item: 'Steel Plate 10mm', quantity: 500, unit: 'kg', inspector: 'John Smith', inspectionDate: '2024-12-16', status: 'approved', defects: 0, remarks: 'All items meet quality standards' },
    { id: 2, inspectionNo: 'QCI-002-2024', grnNo: 'GRN-002-2024', item: 'Fastener Pack', quantity: 2000, unit: 'pcs', inspector: 'Sarah Johnson', inspectionDate: '2024-12-15', status: 'approved', defects: 0, remarks: 'Packaging intact, quality verified' },
    { id: 3, inspectionNo: 'QCI-003-2024', grnNo: 'GRN-003-2024', item: 'Bearing Set A', quantity: 95, unit: 'sets', inspector: 'Mike Chen', inspectionDate: '2024-12-19', status: 'hold', defects: 5, remarks: '5 units found with bearing noise' },
    { id: 4, inspectionNo: 'QCI-004-2024', grnNo: 'GRN-004-2024', item: 'Paint - Red', quantity: 180, unit: 'liters', inspector: 'Emma Davis', inspectionDate: '2024-12-14', status: 'rejected', defects: 20, remarks: '20 liters found with discoloration' },
    { id: 5, inspectionNo: 'QCI-005-2024', grnNo: 'GRN-005-2024', item: 'Motor Unit 3HP', quantity: 50, unit: 'units', inspector: 'John Smith', inspectionDate: '2024-12-25', status: 'pending', defects: null, remarks: 'Inspection in progress' },
    { id: 6, inspectionNo: 'QCI-006-2024', grnNo: 'GRN-006-2024', item: 'Wire Spool', quantity: 400, unit: 'meters', inspector: 'Sarah Johnson', inspectionDate: '2024-12-15', status: 'approved', defects: 0, remarks: 'Spool quality and length verified' },
    { id: 7, inspectionNo: 'QCI-007-2024', grnNo: 'GRN-007-2024', item: 'Packaging Box L', quantity: 1000, unit: 'boxes', inspector: 'Mike Chen', inspectionDate: null, status: 'pending', defects: null, remarks: 'Awaiting sample collection' },
    { id: 8, inspectionNo: 'QCI-008-2024', grnNo: 'GRN-008-2024', item: 'Aluminum Sheet', quantity: 300, unit: 'sheets', inspector: 'Emma Davis', inspectionDate: '2024-12-12', status: 'approved', defects: 0, remarks: 'Sheet thickness and surface quality OK' },
  ];

  const filteredData = inspectionData.filter(inspection =>
    (inspection.inspectionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
     inspection.grnNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
     inspection.item.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'all' || inspection.status === statusFilter)
  );

  const getStatusColor = (status) => {
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

  const getDefectColor = (defects) => {
    if (defects === null) return 'text-slate-400';
    if (defects === 0) return 'text-green-600';
    if (defects < 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const stats = [
    { label: 'Total Inspections', value: inspectionData.length, color: 'text-blue-600' },
    { label: 'Approved', value: inspectionData.filter(i => i.status === 'approved').length, color: 'text-green-600' },
    { label: 'Pending', value: inspectionData.filter(i => i.status === 'pending').length, color: 'text-yellow-600' },
    { label: 'Rejected', value: inspectionData.filter(i => i.status === 'rejected').length, color: 'text-red-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">QC Inspections</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Quality control inspection records and reports</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <Plus size={18} />
            New Inspection
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
              placeholder="Search inspection, GRN or item..."
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
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="hold">On Hold</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Inspection ID</th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">GRN No.</th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Item</th>
                <th className="p-2 text-center text-sm font-semibold text-slate-900 dark:text-white">Qty</th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Inspector</th>
                <th className="p-2 text-center text-sm font-semibold text-slate-900 dark:text-white">Defects</th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                <th className="p-2 text-center text-sm font-semibold text-slate-900 dark:text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((inspection) => (
                <tr key={inspection.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-2 text-sm font-medium text-slate-900 text-left dark:text-white">{inspection.inspectionNo}</td>
                  <td className="p-2 text-sm text-slate-600 dark:text-slate-400">{inspection.grnNo}</td>
                  <td className="p-2 text-sm text-slate-600 dark:text-slate-400">{inspection.item}</td>
                  <td className="p-2 text-sm text-center text-slate-600 dark:text-slate-400">
                    {inspection.quantity} {inspection.unit}
                  </td>
                  <td className="p-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center text-xs gap-2">
                      <User size={14} className="text-slate-400" />
                      {inspection.inspector}
                    </div>
                  </td>
                  <td className={`p-2 text-sm font-bold text-center ${getDefectColor(inspection.defects)}`}>
                    {inspection.defects === null ? '-' : inspection.defects}
                  </td>
                  <td className="p-2 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(inspection.status)}`}>
                      {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-2 text-center text-sm">
                    <button className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors">
                      <Eye size={16} className="text-blue-600 dark:text-blue-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <FileText size={24} className="text-blue-600 dark:text-blue-400 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Inspection Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-blue-700 dark:text-blue-300">Pass Rate</p>
                <p className="font-bold text-blue-900 dark:text-blue-100 text-lg">
                  {Math.round((inspectionData.filter(i => i.status === 'approved').length / inspectionData.length) * 100)}%
                </p>
              </div>
              <div>
                <p className="text-blue-700 dark:text-blue-300">Total Defects Found</p>
                <p className="font-bold text-blue-900 dark:text-blue-100 text-lg">
                  {inspectionData.reduce((sum, i) => sum + (i.defects || 0), 0)}
                </p>
              </div>
              <div>
                <p className="text-blue-700 dark:text-blue-300">Avg Defect Rate</p>
                <p className="font-bold text-blue-900 dark:text-blue-100 text-lg">
                  {(inspectionData.reduce((sum, i) => sum + (i.defects || 0), 0) / inspectionData.filter(i => i.defects !== null).length).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QCInspectionsPage;
