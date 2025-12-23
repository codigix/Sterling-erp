import React, { useState, useEffect } from 'react';
import axios from '../../utils/api';
import { Plus, Eye, Edit2, Download, X, CheckCircle, Clock, Filter } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import MaterialRequestPage from './MaterialRequestPage';
import '../../styles/TaskPage.css';

const ProcurementTasksPage = () => {
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('material-requests');
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    const fetchProcurementData = async () => {
      try {
        setLoading(true);
        const [prRes, poRes, quotesRes] = await Promise.all([
          axios.get('/api/procurement/portal/purchase-requests'),
          axios.get('/api/procurement/portal/purchase-orders'),
          axios.get('/api/procurement/portal/quotes')
        ]);
        setPurchaseRequests(prRes.data || []);
        setPurchaseOrders(poRes.data || []);
        setQuotes(quotesRes.data || []);
      } catch (err) {
        setError('Failed to load procurement data');
        console.error('Fetch procurement error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProcurementData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center text-xs justify-center py-12">
        <p className="text-slate-600">Loading procurement data...</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'placed': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalPR: purchaseRequests.length,
    totalPO: purchaseOrders.length,
    totalQuotes: quotes.length,
    pendingAmount: purchaseOrders.filter(po => po.status === 'placed').length
  };

  return (
    <div className="task-page-container">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Purchase Requests</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalPR}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Purchase Orders</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalPO}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Vendor Quotes</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalQuotes}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Pending Orders</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pendingAmount}</p>
          </div>
        </Card>
      </div>

      {/* Tab and Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('material-requests')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'material-requests'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700  dark: hover:'
            }`}
          >
            Material Requests
          </button>
          <button
            onClick={() => setActiveTab('pr')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'pr'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700  dark: hover:'
            }`}
          >
            Purchase Requests
          </button>
          <button
            onClick={() => setActiveTab('po')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'po'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700  dark: hover:'
            }`}
          >
            Purchase Orders
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'quotes'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700  dark: hover:'
            }`}
          >
            Vendor Quotes
          </button>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center text-xs gap-2 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700  dark: hover: transition-colors">
            <Filter size={18} />
            Filter
          </button>
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="flex items-center text-xs gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            New {activeTab === 'pr' ? 'PR' : activeTab === 'po' ? 'PO' : 'Quote'}
          </button>
        </div>
      </div>

      {/* Material Requests */}
      {activeTab === 'material-requests' && (
        <MaterialRequestPage />
      )}

      {/* Purchase Requests */}
      {activeTab === 'pr' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-3 text-left text-sm font-semibold">PR Number</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Project</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Items</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Total Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Required Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchaseRequests.map(pr => (
                  <tr key={pr.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs">
                    <td className="p-1 text-sm font-medium">{pr.id}</td>
                    <td className="p-1 text-sm text-slate-700 dark:text-slate-300">{pr.project}</td>
                    <td className="p-1 text-sm text-center font-medium">{pr.items}</td>
                    <td className="p-1 text-sm font-medium">{pr.totalAmount}</td>
                    <td className="p-1 text-sm text-slate-700 dark:text-slate-300">{pr.requiredDate}</td>
                    <td className="p-1">
                      <Badge className={getStatusColor(pr.status)}>
                        {pr.status.charAt(0).toUpperCase() + pr.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-1">
                      <div className="flex gap-2">
                        <button className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover: transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 transition-colors">
                          <Edit2 size={16} />
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

      {/* Purchase Orders */}
      {activeTab === 'po' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-3 text-left text-sm font-semibold">PO ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Vendor</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Vendor PO</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Expected Delivery</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map(po => (
                  <tr key={po.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs">
                    <td className="p-1 text-sm font-medium">{po.id}</td>
                    <td className="p-1 text-sm text-slate-700 dark:text-slate-300">{po.vendor}</td>
                    <td className="p-1 text-sm text-slate-700 dark:text-slate-300">{po.poNumber}</td>
                    <td className="p-1 text-sm font-medium">{po.amount}</td>
                    <td className="p-1 text-sm text-slate-700 dark:text-slate-300">{po.expectedDelivery}</td>
                    <td className="p-1">
                      <Badge className={getStatusColor(po.status)}>
                        {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-1">
                      <div className="flex gap-2">
                        <button className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover: transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover: transition-colors">
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

      {/* Vendor Quotes */}
      {activeTab === 'quotes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quotes.map(quote => (
            <Card key={quote.id}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold  dark:">{quote.vendor}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Quote: {quote.id}</p>
                  </div>
                  <Badge className={getStatusColor(quote.status)}>
                    {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Amount:</span>
                    <span className="font-bold  dark:">{quote.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Items:</span>
                    <span className="font-bold  dark:">{quote.items}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Expires:</span>
                    <span className="font-bold  dark:">{quote.expiryDate}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button className="flex-1 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium">
                    Accept
                  </button>
                  <button className="flex-1 px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700  dark: hover: transition-colors text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProcurementTasksPage;
