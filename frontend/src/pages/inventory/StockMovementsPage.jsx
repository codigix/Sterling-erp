import React, { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Calendar,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Clock,
  User,
} from 'lucide-react';

const StockMovementsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [movementType, setMovementType] = useState('all');
  const [dateRange, setDateRange] = useState('30days');

  const movementTypes = [
    { value: 'all', label: 'All Movements' },
    { value: 'in', label: 'Inbound' },
    { value: 'out', label: 'Outbound' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'adjustment', label: 'Adjustment' },
  ];

  const movements = [
    { id: 1, date: '2024-12-15', time: '14:30', type: 'in', item: 'Steel Plate 10mm', quantity: 50, unit: 'kg', from: 'Vendor A', to: 'Storage A-12', user: 'John Doe', reference: 'PO-2024-001', status: 'completed' },
    { id: 2, date: '2024-12-15', time: '12:15', type: 'out', item: 'Aluminum Sheet', quantity: 25, unit: 'sheets', from: 'Storage B-05', to: 'Project X', user: 'Jane Smith', reference: 'SO-2024-045', status: 'completed' },
    { id: 3, date: '2024-12-14', time: '10:00', type: 'in', item: 'Bearing Set A', quantity: 10, unit: 'sets', from: 'Vendor B', to: 'Storage C-03', user: 'Mike Johnson', reference: 'PO-2024-002', status: 'completed' },
    { id: 4, date: '2024-12-14', time: '09:45', type: 'transfer', item: 'Paint - Red', quantity: 15, unit: 'liters', from: 'Storage D-08', to: 'Storage D-07', user: 'Sarah Williams', reference: 'TRF-2024-012', status: 'completed' },
    { id: 5, date: '2024-12-13', time: '15:30', type: 'out', item: 'Fastener Pack', quantity: 500, unit: 'pcs', from: 'Storage A-01', to: 'Production Line 2', user: 'Tom Brown', reference: 'MR-2024-034', status: 'completed' },
    { id: 6, date: '2024-12-13', time: '11:20', type: 'adjustment', item: 'Wire Spool', quantity: -10, unit: 'meters', from: 'Stock', to: 'Waste', user: 'Admin', reference: 'ADJ-2024-008', status: 'pending' },
    { id: 7, date: '2024-12-12', time: '13:00', type: 'in', item: 'Motor Unit 3HP', quantity: 5, unit: 'units', from: 'Vendor C', to: 'Storage G-06', user: 'Lisa Anderson', reference: 'PO-2024-003', status: 'completed' },
    { id: 8, date: '2024-12-12', time: '10:30', type: 'out', item: 'Packaging Box L', quantity: 200, unit: 'boxes', from: 'Storage E-02', to: 'Shipping', user: 'David Lee', reference: 'SO-2024-044', status: 'completed' },
  ];

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         movement.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = movementType === 'all' || movement.type === movementType;
    return matchesSearch && matchesType;
  });

  const getMovementIcon = (type) => {
    switch (type) {
      case 'in':
        return <ArrowDown className="text-green-600" size={20} />;
      case 'out':
        return <ArrowUp className="text-orange-600" size={20} />;
      case 'transfer':
        return <TrendingUp className="text-blue-600" size={20} />;
      case 'adjustment':
        return <TrendingDown className="text-purple-600" size={20} />;
      default:
        return null;
    }
  };

  const getMovementColor = (type) => {
    switch (type) {
      case 'in':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'out':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'transfer':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'adjustment':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600';
    }
  };

  const getMovementLabel = (type) => {
    const typeObj = movementTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const handleExport = () => {
    console.log('Exporting movements data...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center text-xs gap-2">
            <Clock size={24} />
            Stock Movements
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {filteredMovements.length} movements found
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <Download size={18} />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by item or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Movement Type Filter */}
          <select
            value={movementType}
            onChange={(e) => setMovementType(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
          >
            {movementTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Movements Timeline */}
      <div className="space-y-3">
        {filteredMovements.map((movement) => (
          <div key={movement.id} className={`border rounded-xl p-4 ${getMovementColor(movement.type)} transition-all hover:shadow-md`}>
            <div className="flex gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 flex items-start pt-1">
                {getMovementIcon(movement.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row justify-between gap-2">
                  <div>
                    <div className="flex items-center text-xs gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {movement.item}
                      </h3>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {getMovementLabel(movement.type)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {movement.reference}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {movement.quantity > 0 ? '+' : ''}{movement.quantity} {movement.unit}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {movement.date} {movement.time}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">From</p>
                    <p className="font-medium text-slate-900 dark:text-white">{movement.from}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">To</p>
                    <p className="font-medium text-slate-900 dark:text-white">{movement.to}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center text-xs gap-1">
                      <User size={14} /> By
                    </p>
                    <p className="font-medium text-slate-900 dark:text-white">{movement.user}</p>
                  </div>
                  <div className="text-right sm:text-left">
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Status</p>
                    <p className={`font-medium capitalize ${movement.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {movement.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-green-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Inbound</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {filteredMovements.filter(m => m.type === 'in').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-orange-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Outbound</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {filteredMovements.filter(m => m.type === 'out').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-blue-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Transfers</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {filteredMovements.filter(m => m.type === 'transfer').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-purple-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Adjustments</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {filteredMovements.filter(m => m.type === 'adjustment').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StockMovementsPage;
