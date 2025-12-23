import { useState, useEffect } from 'react';
import axios from '../../../utils/api';
import Button from '../../ui/Button';
import Card, { CardContent } from '../../ui/Card';
import DataTable from '../../ui/DataTable/DataTable';
import { STATUS_LEVELS } from '../SalesOrderForm/constants';
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  Download,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Filter,
  IndianRupee,
} from 'lucide-react';

const formatIndianCurrency = (value) => {
  const num = parseInt(value);
  if (num < 1000) return num.toString();
  if (num < 100000) {
    const k = (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1);
    return `${k}K`;
  }
  if (num < 10000000) {
    const lc = (num / 100000).toFixed(num % 100000 === 0 ? 0 : 1);
    return `${lc}Lc`;
  }
  const cr = (num / 10000000).toFixed(num % 10000000 === 0 ? 0 : 1);
  return `${cr}Cr`;
};

const SalesOrderList = ({ onCreateNew, onViewOrder, onEditOrder, onAssignOrder, refreshTrigger = 0 }) => {
  const [orders, setOrders] = useState([]);
  const [success, setSuccess] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/sales/orders', {
          params: { includeSteps: true }
        });
        setOrders(response.data.orders || []);
      } catch (error) {
        console.error('Error fetching sales orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [refreshTrigger]);

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const handleDelete = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this sales order?')) {
      return;
    }
    try {
      await axios.delete(`/api/sales/orders/${orderId}`);
      setOrders(orders.filter(order => order.id !== orderId));
      setSuccess('Sales order deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting sales order:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete sales order';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleDownload = (order) => {
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const data = {
      poNumber: order.po_number,
      clientName: order.customer,
      orderDate: formatDate(order.order_date),
      dueDate: formatDate(order.due_date),
      total: `₹ ${formatIndianCurrency(order.total)}`,
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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      const response = await axios.patch(`/api/sales/orders/${orderId}/status`, {
        status: newStatus
      });
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      setSuccess('Status updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to update status';
      alert(`Error: ${errorMessage}`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const columns = [
    {
      key: 'po_number',
      label: 'PO No & Project',
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-slate-900 dark:text-white">
            {value}
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {row.project_name || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'customer',
      label: 'Client',
      sortable: true,
    },
    {
      key: 'order_date',
      label: 'Order Date',
      sortable: true,
      render: (value) => {
        const date = new Date(value);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return (
          <span className="text-slate-600 dark:text-slate-400 text-xs">
            {`${day}/${month}/${year}`}
          </span>
        );
      },
    },
    {
      key: 'due_date',
      label: 'Est. Date',
      sortable: true,
      render: (value) => {
        const date = new Date(value);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return (
          <span className="text-slate-600 dark:text-slate-400 text-xs">
            {`${day}/${month}/${year}`}
          </span>
        );
      },
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value) => {
        const priorityBg = {
          low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
          medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
          high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
        };
        return (
          <span className={`inline-block p-1 rounded text-xxs font-medium ${priorityBg[value] || 'bg-slate-100 text-slate-800'}`}>
            {value?.charAt(0).toUpperCase() + value?.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value, row) => {
        const statusColors = {
          draft: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
          pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
          ready_to_start: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
          assigned: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100',
          approved: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
          in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
          on_hold: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
          critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
          completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
          delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
        };
        return (
          <select
            value={value || 'pending'}
            onChange={(e) => handleStatusChange(row.id, e.target.value)}
            disabled={updatingStatus === row.id}
            className={`px-2 py-1 rounded text-xxs font-medium border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${statusColors[value] || statusColors.pending} disabled:opacity-50`}
          >
            {STATUS_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      key: 'total',
      label: 'Amount',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-1 text-slate-900 dark:text-white font-medium text-xs">
          <IndianRupee className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
          <span> {formatIndianCurrency(value)}</span>
        </div>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      sortable: false,
      render: (value, row) => (
        <div className="flex items-center text-xs gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewOrder(row);
            }}
            title="View"
            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition"
          >
            <Eye className="w-3 h-3 text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditOrder(row);
            }}
            title="Edit"
            className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition"
          >
            <Edit2 className="w-3 h-3 text-green-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(row);
            }}
            title="Download"
            className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded transition"
          >
            <Download className="w-3 h-3 text-purple-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAssignOrder(row);
            }}
            title="Assign"
            className="p-1 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded transition"
          >
            <UserPlus className="w-3 h-3 text-orange-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            title="Delete"
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition"
          >
            <Trash2 className="w-3 h-3 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Header Section */}
      <div className="flex items-center text-xs justify-between">
        <div>
          <h1 className="text-xl font-bold  text-left">
            Sales Orders
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 text-left">
            Manage and track all sales orders
          </p>
        </div>
        <Button
          onClick={onCreateNew}
          className="flex items-center text-xs gap-1 text-sm px-3 py-2 h-auto"
        >
          <Plus className="w-3 h-3" />
          New Order
        </Button>
      </div>

      {/* Alert Messages */}
      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded flex items-center text-xs gap-2">
          <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0" />
          <span className="text-sm text-green-700 dark:text-green-300">{success}</span>
        </div>
      )}

      {/* Filter Pills */}
      <div className="flex items-center text-xs gap-2">
        <Filter className="w-3 h-3 text-slate-500 flex-shrink-0" />
        <div className="flex gap-1 flex-wrap">
          {['all', 'pending', 'approved', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* DataTable */}
      <Card shadow="md" padding="none" className="bg-white dark:border-slate-700">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={filteredOrders}
            emptyMessage="No sales orders found"
            sortable={true}
            striped={true}
            hover={true}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesOrderList;
