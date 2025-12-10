import React, { useState, useEffect } from 'react';
import axios from '../../../utils/api';
import Button from '../../ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../ui/Card';
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  Download,
  UserPlus,
  Loader,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const SalesOrderList = ({ onCreateNew, onViewOrder, onEditOrder, onAssignOrder }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `/api/sales/orders${filter !== 'all' ? `?status=${filter}` : ''}`
      );
      setOrders(response.data.orders || []);
    } catch (err) {
      setError('Failed to load sales orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this sales order?')) {
      return;
    }
    try {
      await axios.delete(`/api/sales/orders/${orderId}`);
      setSuccess('Sales order deleted successfully');
      fetchOrders();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete sales order');
      console.error(err);
    }
  };

  const handleDownload = (order) => {
    const data = {
      poNumber: order.po_number,
      clientName: order.customer,
      orderDate: new Date(order.order_date).toLocaleDateString(),
      dueDate: new Date(order.due_date).toLocaleDateString(),
      total: `${order.currency} ${order.total}`,
      status: order.status,
      priority: order.priority,
    };

    const csvContent = [
      ['PO Number', data.poNumber],
      ['Client Name', data.clientName],
      ['Order Date', data.orderDate],
      ['Due Date', data.dueDate],
      ['Total Amount', data.total],
      ['Status', data.status],
      ['Priority', data.priority],
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SO_${order.po_number}_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const statusColors = {
    draft: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
  };

  const priorityColors = {
    low: 'text-blue-600',
    medium: 'text-orange-600',
    high: 'text-red-600',
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Sales Orders
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage all sales orders and assignments
          </p>
        </div>
        <Button
          onClick={onCreateNew}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Sales Order
        </Button>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="text-green-700 dark:text-green-300">{success}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'approved', 'completed'].map((status) => (
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

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-slate-600 dark:text-slate-400">
                Loading sales orders...
              </p>
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
                      PO No
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      Project Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      Client Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      Order Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      Estimated Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      Priority
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      Amount
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
                        {order.project_name || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                        {order.customer}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {new Date(order.order_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {new Date(order.due_date).toLocaleDateString()}
                      </td>
                      <td className={`py-3 px-4 font-medium ${priorityColors[order.priority] || 'text-slate-600'}`}>
                        {order.priority?.charAt(0).toUpperCase() +
                          order.priority?.slice(1)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            statusColors[order.status] ||
                            statusColors.pending
                          }`}
                        >
                          {order.status?.charAt(0).toUpperCase() +
                            order.status?.slice(1).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                        {order.currency} {order.total}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => onViewOrder(order)}
                            title="View"
                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => onEditOrder(order)}
                            title="Edit"
                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition"
                          >
                            <Edit2 className="w-4 h-4 text-green-600" />
                          </button>
                          <button
                            onClick={() => handleDownload(order)}
                            title="Download"
                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition"
                          >
                            <Download className="w-4 h-4 text-purple-600" />
                          </button>
                          <button
                            onClick={() => onAssignOrder(order)}
                            title="Assign"
                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition"
                          >
                            <UserPlus className="w-4 h-4 text-orange-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(order.id)}
                            title="Delete"
                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
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
    </div>
  );
};

export default SalesOrderList;
