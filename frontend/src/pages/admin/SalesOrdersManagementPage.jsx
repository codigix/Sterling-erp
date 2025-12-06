import React, { useState, useEffect } from 'react';
import axios from '../../utils/api';
import Button from '../../components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import SalesOrderWizard from '../../components/sales/SalesOrderWizard';
import SalesOrderForm from '../../components/admin/SalesOrderForm';
import {
  Plus,
  Play,
  Eye,
  Loader,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';

const SalesOrdersManagementPage = () => {
  const [mode, setMode] = useState('list'); // 'list', 'create', 'wizard'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (mode === 'list') {
      fetchOrders();
    }
  }, [filter, mode]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/sales/orders?status=${filter}`);
      setOrders(response.data.orders || []);
    } catch (err) {
      setError('Failed to load sales orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (order) => {
    try {
      await axios.post('/api/sales/workflow/initialize', {
        salesOrderId: order.id,
      });

      setSelectedOrder(order);
      setMode('wizard');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('already')) {
        setSelectedOrder(order);
        setMode('wizard');
      } else {
        setError('Failed to initialize workflow: ' + err.message);
        setMode('list');
        await fetchOrders();
      }
    }
  };

  const handleStartWorkflow = async (order) => {
    try {
      // Initialize workflow for this order
      await axios.post('/api/sales/workflow/initialize', {
        salesOrderId: order.id,
      });

      // Set selected order and open wizard
      setSelectedOrder(order);
      setMode('wizard');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('already')) {
        // Workflow already initialized, just open wizard
        setSelectedOrder(order);
        setMode('wizard');
      } else {
        setError('Failed to initialize workflow: ' + err.message);
      }
    }
  };

  const handleWizardComplete = () => {
    setMode('list');
    setSelectedOrder(null);
    fetchOrders();
  };

  const handleWizardCancel = () => {
    setMode('list');
    setSelectedOrder(null);
  };

  if (mode === 'create') {
    return (
      <SalesOrderForm
        onSubmit={handleCreateOrder}
        onCancel={() => setMode('list')}
      />
    );
  }

  if (mode === 'wizard' && selectedOrder) {
    return (
      <SalesOrderWizard
        salesOrderId={selectedOrder.id}
        onComplete={handleWizardComplete}
        onCancel={handleWizardCancel}
      />
    );
  }

  const statusColors = {
    draft: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
  };

  const workflowStatusColors = {
    draft: 'bg-slate-100 text-slate-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    on_hold: 'bg-orange-100 text-orange-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Sales Orders Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Create and manage sales order workflows
          </p>
        </div>
        <Button
          onClick={() => setMode('create')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Sales Order
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'draft', 'pending', 'approved', 'in_progress', 'completed', 'delivered'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-slate-600 dark:text-slate-400">Loading sales orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                No sales orders found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      PO Number
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      Client
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      Order Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      Workflow
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      Progress
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                    >
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                        {order.po_number}
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                        {order.customer}
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                        {order.currency} {order.total}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {new Date(order.order_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            statusColors[order.status] ||
                            statusColors.pending
                          }`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status?.charAt(0).toUpperCase() +
                            order.status?.slice(1).replace('_', ' ')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {order.workflow_status ? (
                          <div
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              workflowStatusColors[order.workflow_status] ||
                              workflowStatusColors.draft
                            }`}
                          >
                            {order.workflow_status
                              ?.charAt(0)
                              .toUpperCase() +
                              order.workflow_status
                                ?.slice(1)
                                .replace('_', ' ')}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">Not started</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {order.workflow_status === 'in_progress' && (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-200 rounded-full">
                              <div
                                className="h-2 bg-blue-600 rounded-full transition-all"
                                style={{
                                  width: `${((order.current_step || 1) / 9) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-slate-600">
                              {order.current_step || 1}/9
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {order.workflow_status ? (
                            <Button
                              size="sm"
                              onClick={() => handleStartWorkflow(order)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              Open
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleStartWorkflow(order)}
                              className="flex items-center gap-1"
                            >
                              <Play className="w-3 h-3" />
                              Start
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Orders</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {orders.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              In Progress
            </p>
            <p className="text-2xl font-bold text-purple-600">
              {orders.filter((o) => o.workflow_status === 'in_progress').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {orders.filter((o) => o.workflow_status === 'completed').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Not Started</p>
            <p className="text-2xl font-bold text-slate-600">
              {orders.filter((o) => !o.workflow_status).length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesOrdersManagementPage;
