import React, { useState } from 'react';
import {
  AlertTriangle,
  Package,
  Search,
  Edit,
  Save,
  X,
  Plus,
  Download,
  ShoppingCart,
  TrendingDown,
} from 'lucide-react';

const ReorderLevelsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const reorderItems = [
    { id: 1, name: 'Steel Plate 10mm', current: 150, reorderLevel: 100, reorderQty: 200, status: 'low', supplier: 'Vendor A', lastOrdered: '2024-12-05', leadTime: '7 days' },
    { id: 2, name: 'Bearing Set A', current: 45, reorderLevel: 80, reorderQty: 150, status: 'critical', supplier: 'Vendor B', lastOrdered: '2024-11-28', leadTime: '5 days' },
    { id: 3, name: 'Aluminum Sheet', current: 450, reorderLevel: 200, reorderQty: 300, status: 'optimal', supplier: 'Vendor A', lastOrdered: '2024-12-12', leadTime: '7 days' },
    { id: 4, name: 'Packaging Box L', current: 80, reorderLevel: 150, reorderQty: 300, status: 'low', supplier: 'Vendor D', lastOrdered: '2024-11-25', leadTime: '10 days' },
    { id: 5, name: 'Paint - Red', current: 120, reorderLevel: 50, reorderQty: 100, status: 'optimal', supplier: 'Vendor C', lastOrdered: '2024-12-10', leadTime: '3 days' },
    { id: 6, name: 'Motor Unit 3HP', current: 15, reorderLevel: 20, reorderQty: 30, status: 'critical', supplier: 'Vendor B', lastOrdered: '2024-12-01', leadTime: '14 days' },
    { id: 7, name: 'Wire Spool', current: 200, reorderLevel: 100, reorderQty: 200, status: 'optimal', supplier: 'Vendor E', lastOrdered: '2024-12-08', leadTime: '5 days' },
    { id: 8, name: 'Fastener Pack', current: 2500, reorderLevel: 1000, reorderQty: 2000, status: 'optimal', supplier: 'Vendor A', lastOrdered: '2024-12-09', leadTime: '7 days' },
  ];

  const filteredItems = reorderItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditValues({ ...item });
  };

  const handleSave = () => {
    console.log('Saving reorder levels:', editValues);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleCreateOrder = (item) => {
    console.log('Creating purchase order for:', item.name);
  };

  const handleExport = () => {
    console.log('Exporting reorder levels...');
  };

  const criticalItems = filteredItems.filter(item => item.status === 'critical');
  const lowStockItems = filteredItems.filter(item => item.status === 'low');
  const optimalItems = filteredItems.filter(item => item.status === 'optimal');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center text-xs gap-2">
            <AlertTriangle size={24} />
            Reorder Levels Management
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage stock reorder thresholds
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

      {/* Critical Alerts */}
      {criticalItems.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center text-xs gap-2 mb-3">
            <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
            <h3 className="font-bold text-red-900 dark:text-red-100">Critical Items Requiring Immediate Order</h3>
          </div>
          <div className="space-y-2">
            {criticalItems.map(item => (
              <div key={item.id} className="flex items-center text-xs justify-between bg-white dark:bg-slate-800 p-3 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Current: {item.current} | Reorder Level: {item.reorderLevel}</p>
                </div>
                <button
                  onClick={() => handleCreateOrder(item)}
                  className="flex items-center text-xs gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  <ShoppingCart size={16} />
                  Order Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Filter */}
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

      {/* Reorder Levels Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Item Name</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Current Stock</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Reorder Level</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Reorder Quantity</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Supplier</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="p-1">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Last ordered: {item.lastOrdered}</p>
                    </div>
                  </td>
                  {editingId === item.id ? (
                    <>
                      <td className="p-1 text-center">
                        <input
                          type="number"
                          value={editValues.current}
                          onChange={(e) => setEditValues({ ...editValues, current: parseInt(e.target.value) })}
                          className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-center"
                        />
                      </td>
                      <td className="p-1 text-center">
                        <input
                          type="number"
                          value={editValues.reorderLevel}
                          onChange={(e) => setEditValues({ ...editValues, reorderLevel: parseInt(e.target.value) })}
                          className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-center"
                        />
                      </td>
                      <td className="p-1 text-center">
                        <input
                          type="number"
                          value={editValues.reorderQty}
                          onChange={(e) => setEditValues({ ...editValues, reorderQty: parseInt(e.target.value) })}
                          className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-center"
                        />
                      </td>
                      <td className="p-1 text-slate-900 dark:text-white text-sm">{item.supplier}</td>
                      <td className="p-1 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-1 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={handleSave}
                            className="p-2 hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-1 text-center">
                        <span className="font-medium text-slate-900 dark:text-white">{item.current}</span>
                      </td>
                      <td className="p-1 text-center">
                        <span className="font-medium text-slate-900 dark:text-white">{item.reorderLevel}</span>
                      </td>
                      <td className="p-1 text-center">
                        <span className="text-slate-600 dark:text-slate-400">{item.reorderQty}</span>
                      </td>
                      <td className="p-1 text-slate-900 dark:text-white text-sm">{item.supplier}</td>
                      <td className="p-1 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-1 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleCreateOrder(item)}
                            className="p-2 hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                            disabled={item.status === 'optimal'}
                          >
                            <ShoppingCart size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-green-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Optimal Stock</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{optimalItems.length}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 text-xs ">Items with adequate stock</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-yellow-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Low Stock</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{lowStockItems.length}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 text-xs ">Items below reorder level</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-red-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Critical Stock</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{criticalItems.length}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 text-xs ">Immediate action required</p>
        </div>
      </div>
    </div>
  );
};

export default ReorderLevelsPage;
