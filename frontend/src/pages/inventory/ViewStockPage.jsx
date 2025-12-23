import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

const ViewStockPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const categories = ['all', 'Raw Materials', 'Components', 'Finished Goods', 'Packaging'];

  const stockData = [
    { id: 1, name: 'Steel Plate 10mm', category: 'Raw Materials', quantity: 150, unit: 'kg', reorderLevel: 100, status: 'low', location: 'A-12-01', lastUpdated: '2 hrs ago' },
    { id: 2, name: 'Aluminum Sheet', category: 'Raw Materials', quantity: 450, unit: 'sheets', reorderLevel: 200, status: 'optimal', location: 'B-05-03', lastUpdated: '4 hrs ago' },
    { id: 3, name: 'Bearing Set A', category: 'Components', quantity: 45, unit: 'sets', reorderLevel: 80, status: 'critical', location: 'C-03-02', lastUpdated: '1 day ago' },
    { id: 4, name: 'Paint - Red', category: 'Finished Goods', quantity: 120, unit: 'liters', reorderLevel: 50, status: 'optimal', location: 'D-08-05', lastUpdated: '3 hrs ago' },
    { id: 5, name: 'Fastener Pack', category: 'Components', quantity: 2500, unit: 'pcs', reorderLevel: 1000, status: 'optimal', location: 'A-01-01', lastUpdated: '6 hrs ago' },
    { id: 6, name: 'Packaging Box L', category: 'Packaging', quantity: 80, unit: 'boxes', reorderLevel: 150, status: 'low', location: 'E-02-04', lastUpdated: '5 hrs ago' },
    { id: 7, name: 'Wire Spool', category: 'Raw Materials', quantity: 200, unit: 'meters', reorderLevel: 100, status: 'optimal', location: 'F-04-02', lastUpdated: '2 days ago' },
    { id: 8, name: 'Motor Unit 3HP', category: 'Components', quantity: 15, unit: 'units', reorderLevel: 20, status: 'critical', location: 'G-06-01', lastUpdated: '1 day ago' },
  ];

  const filteredData = stockData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'low':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'optimal':
        return <CheckCircle size={16} />;
      case 'low':
      case 'critical':
        return <AlertTriangle size={16} />;
      default:
        return null;
    }
  };

  const handleExport = () => {
    console.log('Exporting stock data...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center text-xs gap-2">
            <Package size={24} />
            Stock Inventory
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Showing {filteredData.length} items
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleExport}
            className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <Download size={18} />
            Export
          </button>
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium">
            <Plus size={18} />
            Add Item
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
          >
            <option value="name">Sort by Name</option>
            <option value="quantity">Sort by Quantity</option>
            <option value="status">Sort by Status</option>
            <option value="updated">Sort by Last Updated</option>
          </select>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Item Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Category</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Quantity</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Reorder Level</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Location</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="p-1">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Updated {item.lastUpdated}</p>
                    </div>
                  </td>
                  <td className="p-1 text-sm text-slate-600 dark:text-slate-400">{item.category}</td>
                  <td className="p-1 text-center">
                    <span className="font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{item.unit}</span>
                  </td>
                  <td className="p-1 text-center text-sm text-slate-600 dark:text-slate-400">{item.reorderLevel}</td>
                  <td className="p-1 text-sm font-mono text-slate-900 dark:text-white">{item.location}</td>
                  <td className="p-1 text-center">
                    <span className={`inline-flex items-center text-xs gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-1 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg transition-colors">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-green-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Optimal Stock</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">4</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-yellow-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Low Stock</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">2</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-red-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Critical Stock</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">2</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-blue-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Items</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{filteredData.length}</p>
        </div>
      </div>
    </div>
  );
};

export default ViewStockPage;
