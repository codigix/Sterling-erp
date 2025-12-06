import React, { useState, useEffect } from 'react';
import axios from '../../utils/api';
import { Plus, Eye, Edit2, Download, ArrowRight, Filter, AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import '../../styles/TaskPage.css';

const InventoryTasksPage = () => {
  const [stock, setStock] = useState([]);
  const [issuances, setIssuances] = useState([]);
  const [inventoryStats, setInventoryStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stock');

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        const [stockRes, issuanceRes] = await Promise.all([
          axios.get('/api/inventory/portal/stock'),
          axios.get('/api/inventory/portal/issuances')
        ]);
        setStock(stockRes.data.stock || []);
        setIssuances(issuanceRes.data || []);
        setInventoryStats(stockRes.data.stats || {});
      } catch (error) {
        console.error('Fetch inventory error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading inventory data...</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'low-stock': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalSKUs: inventoryStats.totalSKUs || 0,
    totalQuantity: inventoryStats.totalQuantity || 0,
    lowStock: inventoryStats.lowStock || 0,
    pendingIssuance: inventoryStats.pendingIssuance || 0
  };

  return (
    <div className="task-page-container">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total SKUs</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.totalSKUs}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Quantity</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.totalQuantity}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Low Stock Items</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.lowStock}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Pending Issuance</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.pendingIssuance}</p>
          </div>
        </Card>
      </div>

      {/* Tab and Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'stock'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300'
            }`}
          >
            Stock Inventory
          </button>
          <button
            onClick={() => setActiveTab('issuance')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'issuance'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300'
            }`}
          >
            Material Issuance
          </button>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 transition-colors">
            <Filter size={18} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            <Plus size={18} />
            {activeTab === 'stock' ? 'Add Stock' : 'Issue Material'}
          </button>
        </div>
      </div>

      {/* Stock Inventory */}
      {activeTab === 'stock' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-3 text-left text-sm font-semibold">SKU</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Material Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Batch</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Quantity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Rack</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Location</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stock.map(item => (
                  <tr key={item.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="px-6 py-4 text-sm font-medium">{item.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{item.batch}</td>
                    <td className="px-6 py-4 text-sm text-center font-bold">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{item.rack}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{item.location}</td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status === 'low-stock' ? 'Low Stock' : 'Available'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 transition-colors">
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Material Issuance */}
      {activeTab === 'issuance' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-3 text-left text-sm font-semibold">Issuance ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Material</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">SKU</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Quantity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Issued To</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {issuances.map(issuance => (
                  <tr key={issuance.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="px-6 py-4 text-sm font-medium">{issuance.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{issuance.material}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{issuance.sku}</td>
                    <td className="px-6 py-4 text-sm text-center font-bold">{issuance.quantity}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{issuance.issuedTo}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{issuance.issuedDate}</td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(issuance.status)}>
                        {issuance.status.charAt(0).toUpperCase() + issuance.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 transition-colors">
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default InventoryTasksPage;
