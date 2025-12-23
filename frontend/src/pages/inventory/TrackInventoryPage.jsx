import React, { useState } from 'react';
import {
  TrendingUp,
  Search,
  MapPin,
  Package,
  Calendar,
  Filter,
  Download,
  BarChart3,
  Eye,
  Edit,
} from 'lucide-react';

const TrackInventoryPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const locations = ['all', 'Storage A', 'Storage B', 'Storage C', 'Storage D', 'Storage E'];

  const inventoryData = [
    { id: 1, item: 'Steel Plate 10mm', sku: 'SP-001', currentQty: 150, location: 'Storage A-12-01', lastUpdated: '2024-12-15 14:30', variance: '+5', trend: 'up' },
    { id: 2, item: 'Aluminum Sheet', sku: 'AS-002', currentQty: 450, location: 'Storage B-05-03', lastUpdated: '2024-12-15 12:15', variance: '+20', trend: 'up' },
    { id: 3, item: 'Bearing Set A', sku: 'BS-003', currentQty: 45, location: 'Storage C-03-02', lastUpdated: '2024-12-14 10:00', variance: '-8', trend: 'down' },
    { id: 4, item: 'Paint - Red', sku: 'PR-004', currentQty: 120, location: 'Storage D-08-05', lastUpdated: '2024-12-15 09:45', variance: '+15', trend: 'up' },
    { id: 5, item: 'Fastener Pack', sku: 'FP-005', currentQty: 2500, location: 'Storage A-01-01', lastUpdated: '2024-12-14 15:30', variance: '+100', trend: 'up' },
    { id: 6, item: 'Wire Spool', sku: 'WS-006', currentQty: 200, location: 'Storage F-04-02', lastUpdated: '2024-12-12 13:00', variance: '0', trend: 'stable' },
    { id: 7, item: 'Motor Unit 3HP', sku: 'MU-007', currentQty: 15, location: 'Storage G-06-01', lastUpdated: '2024-12-14 11:20', variance: '-3', trend: 'down' },
    { id: 8, item: 'Packaging Box L', sku: 'PB-008', currentQty: 80, location: 'Storage E-02-04', lastUpdated: '2024-12-15 08:00', variance: '+10', trend: 'up' },
  ];

  const filteredData = inventoryData.filter(item =>
    (item.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.sku.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedLocation === 'all' || item.location.startsWith(selectedLocation))
  );

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const getTrendBg = (trend) => {
    switch (trend) {
      case 'up':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'down':
        return 'bg-red-50 dark:bg-red-900/20';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center text-xs gap-2">
            <TrendingUp size={24} />
            Inventory Tracking
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Real-time inventory levels by location
          </p>
        </div>
        <button className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by item or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>
                {loc === 'all' ? 'All Locations' : loc}
              </option>
            ))}
          </select>

          <button className="flex items-center text-xs justify-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Filter size={18} />
            More Filters
          </button>
        </div>
      </div>

      {/* Inventory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredData.map(item => (
          <div key={item.id} className={`${getTrendBg(item.trend)} border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-lg transition-shadow`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{item.sku}</p>
                <p className="font-bold text-slate-900 dark:text-white mt-1">{item.item}</p>
              </div>
              <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors">
                <Eye size={18} className="text-blue-600 dark:text-blue-400" />
              </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 mb-3">
              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Current Quantity</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{item.currentQty}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getTrendColor(item.trend)}`}>
                  {item.variance}
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min((item.currentQty / 100) * 10, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center text-xs justify-between">
                <span className="text-slate-600 dark:text-slate-400 flex items-center text-xs gap-2">
                  <MapPin size={16} />
                  Location
                </span>
                <span className="font-medium text-slate-900 dark:text-white">{item.location}</span>
              </div>
              <div className="flex items-center text-xs justify-between">
                <span className="text-slate-600 dark:text-slate-400 flex items-center text-xs gap-2">
                  <Calendar size={16} />
                  Last Updated
                </span>
                <span className="font-medium text-slate-900 dark:text-white">{item.lastUpdated}</span>
              </div>
            </div>

            <button className="w-full mt-4 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center text-xs justify-center gap-2">
              <Edit size={16} />
              Adjust Stock
            </button>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-blue-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Items Tracked</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{filteredData.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-green-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Quantity</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{filteredData.reduce((sum, item) => sum + item.currentQty, 0).toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-purple-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Locations Used</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{new Set(filteredData.map(item => item.location.split('-')[0])).size}</p>
        </div>
      </div>
    </div>
  );
};

export default TrackInventoryPage;
