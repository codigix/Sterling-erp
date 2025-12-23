import React, { useState } from 'react';
import {
  Grid3x3,
  Search,
  Plus,
  Filter,
  Download,
  Layers,
  Package,
  AlertCircle,
  Edit,
  Trash2,
} from 'lucide-react';

const RackAndShelfPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWing, setSelectedWing] = useState('all');

  const wings = ['all', 'Wing A', 'Wing B', 'Wing C', 'Wing D', 'Wing E'];

  const rackData = [
    { id: 1, location: 'A-12-01', wing: 'Wing A', rack: 12, shelf: 1, capacity: 500, current: 150, item: 'Steel Plate 10mm', utilization: 30, status: 'active' },
    { id: 2, location: 'A-12-02', wing: 'Wing A', rack: 12, shelf: 2, capacity: 300, current: 280, item: 'Fastener Pack', utilization: 93, status: 'high' },
    { id: 3, location: 'B-05-03', wing: 'Wing B', rack: 5, shelf: 3, capacity: 600, current: 450, item: 'Aluminum Sheet', utilization: 75, status: 'active' },
    { id: 4, location: 'B-06-01', wing: 'Wing B', rack: 6, shelf: 1, capacity: 200, current: 0, item: 'Empty', utilization: 0, status: 'empty' },
    { id: 5, location: 'C-03-02', wing: 'Wing C', rack: 3, shelf: 2, capacity: 100, current: 45, item: 'Bearing Set A', utilization: 45, status: 'active' },
    { id: 6, location: 'D-08-05', wing: 'Wing D', rack: 8, shelf: 5, capacity: 300, current: 120, item: 'Paint - Red', utilization: 40, status: 'active' },
    { id: 7, location: 'E-02-04', wing: 'Wing E', rack: 2, shelf: 4, capacity: 500, current: 80, item: 'Packaging Box L', utilization: 16, status: 'low' },
    { id: 8, location: 'A-01-01', wing: 'Wing A', rack: 1, shelf: 1, capacity: 2000, current: 2500, item: 'Fastener Pack', utilization: 125, status: 'overflow' },
    { id: 9, location: 'F-04-02', wing: 'Wing F', rack: 4, shelf: 2, capacity: 400, current: 200, item: 'Wire Spool', utilization: 50, status: 'active' },
    { id: 10, location: 'G-06-01', wing: 'Wing G', rack: 6, shelf: 1, capacity: 50, current: 15, item: 'Motor Unit 3HP', utilization: 30, status: 'active' },
  ];

  const filteredData = rackData.filter(rack =>
    (rack.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
     rack.item.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedWing === 'all' || rack.wing === selectedWing)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200';
      case 'high':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200';
      case 'empty':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-200';
      case 'overflow':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const getUtilizationColor = (util) => {
    if (util > 100) return 'bg-red-500';
    if (util > 80) return 'bg-blue-500';
    if (util > 50) return 'bg-green-500';
    return 'bg-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center text-xs gap-2">
            <Grid3x3 size={24} />
            Rack & Shelf Management
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Warehouse location and capacity tracking
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium">
            <Plus size={18} />
            Add Location
          </button>
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <Download size={18} />
            Export Map
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
              placeholder="Search location or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedWing}
            onChange={(e) => setSelectedWing(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
          >
            {wings.map(wing => (
              <option key={wing} value={wing}>
                {wing === 'all' ? 'All Wings' : wing}
              </option>
            ))}
          </select>

          <button className="flex items-center text-xs justify-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Filter size={18} />
            More Filters
          </button>
        </div>
      </div>

      {/* Rack Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredData.map(rack => (
          <div key={rack.id} className={`border rounded-xl p-4 ${getStatusColor(rack.status)}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-bold uppercase opacity-75">Location</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{rack.location}</p>
                <p className="text-xs opacity-75 mt-1">{rack.wing}</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-75">Rack {rack.rack}</p>
                <p className="text-sm font-semibold">Shelf {rack.shelf}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 mb-3">
              <div className="flex items-center text-xs justify-between mb-2">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Item</p>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">{rack.item}</p>
                </div>
                <Layers size={16} className="text-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Current</p>
                  <p className="font-bold text-slate-900 dark:text-white">{rack.current}</p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400">Capacity</p>
                  <p className="font-bold text-slate-900 dark:text-white">{rack.capacity}</p>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Utilization</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{rack.utilization}%</p>
              </div>
              <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${getUtilizationColor(rack.utilization)}`}
                  style={{ width: `${Math.min(rack.utilization, 100)}%` }}
                ></div>
              </div>
              {rack.utilization > 100 && (
                <div className="flex items-center text-xs gap-1 mt-1 text-red-600 dark:text-red-400">
                  <AlertCircle size={12} />
                  <p className="text-xs">Over capacity</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors flex items-center text-xs justify-center gap-1">
                <Edit size={14} />
                Edit
              </button>
              <button className="flex-1 px-3 py-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-slate-900 dark:text-white rounded text-xs font-medium transition-colors flex items-center text-xs justify-center gap-1">
                <Trash2 size={14} />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Warehouse Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-blue-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Locations</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{filteredData.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-green-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Active Locations</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {filteredData.filter(r => r.status === 'active').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-yellow-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Avg. Utilization</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {Math.round(filteredData.reduce((sum, r) => sum + r.utilization, 0) / filteredData.length)}%
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-red-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Over Capacity</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {filteredData.filter(r => r.utilization > 100).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RackAndShelfPage;
