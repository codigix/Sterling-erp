import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Eye, BarChart3, Trash2, Play, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/api';
import Card, { CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable/DataTable';

const formatIndianCurrency = (value) => {
  const num = parseInt(value);
  if (isNaN(num)) return '0';
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

const RootCardBuilderPage = () => {
  const navigate = useNavigate();
  const [rootCards, setRootCards] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRootCards = useCallback(async () => {
    setLoading(true);
    try {
      const params = { all: 'true', assignedOnly: true };
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      const response = await axios.get('/production/root-cards', {
        params,
        __sessionGuard: true
      });
      setRootCards(response.data?.rootCards || []);
      setStats(response.data?.stats || null);
      setError(null);
    } catch (err) {
      setError('Failed to fetch root cards');
      console.error('Error fetching root cards:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchRootCards();
  }, [fetchRootCards]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'draft':
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
      case 'in_progress':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'on_hold':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status) => {
    return status?.replace(/_/g, ' ')?.toUpperCase() || 'UNKNOWN';
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getStepLabel = (stepId) => {
    const stepLabels = {
      3: 'Design Engineering',
      4: 'Material Req.',
      5: 'Production Plan',
      6: 'Quality Check',
      7: 'Shipment',
      8: 'Delivery'
    };
    return stepLabels[stepId] || `Step ${stepId}`;
  };

  const getStepColor = (stepId) => {
    const colors = {
      3: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      4: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      5: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300',
      6: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
      7: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      8: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
    };
    return colors[stepId] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
  };

  const handleStartProduction = async (e, cardId) => {
    e.stopPropagation();
    setActionLoading(cardId);
    try {
      await axios.patch(`/production/root-cards/${cardId}/status`, {
        status: 'in_progress'
      }, { __sessionGuard: true });
      fetchRootCards();
    } catch {
      setError('Failed to start production');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCard = async (e, cardId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this root card?')) {
      setActionLoading(cardId);
      try {
        await axios.delete(`/production/root-cards/${cardId}`, { __sessionGuard: true });
        fetchRootCards();
      } catch {
        setError('Failed to delete root card');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleViewDetails = (cardId) => {
    navigate(`/department/production/root-cards/${cardId}`);
  };

  const columns = [
    {
      key: 'project_code',
      label: 'Code',
      sortable: true,
      render: (value, row) => (
        <span className="font-semibold text-slate-900 dark:text-white">
          {value || row.steps?.step1_clientPO?.projectCode || row.code || '-'}
        </span>
      ),
    },
    {
      key: 'po_number',
      label: 'PO No & Project',
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-slate-900 dark:text-white">
            {value || row.steps?.step1_clientPO?.poNumber || '-'}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {row.project_name || row.steps?.step1_clientPO?.projectName || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      sortable: true,
      render: (value, row) => (
        <span className="text-slate-600 dark:text-slate-400">
          {value || row.steps?.step1_clientPO?.clientName || row.rootCardDetails?.customer || row.customer_name || '-'}
        </span>
      ),
    },
    {
      key: 'assignedSteps',
      label: 'Assigned Steps',
      sortable: false,
      render: (value, row) => (
        <div className="flex flex-wrap gap-1">
          {value && value.length > 0 ? (
            value.map((step, index) => (
              <Badge 
                key={`${row.id}-step-${step.stepId || index}`}
                className={`text-[10px] px-1.5 py-0.5 rounded ${getStepColor(step.stepId)}`}
              >
                {getStepLabel(step.stepId)}
              </Badge>
            ))
          ) : (
            <span className="text-slate-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'total',
      label: 'Amount',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-1 text-slate-900 dark:text-white font-medium">
          <IndianRupee size={12} className="text-green-600 dark:text-green-400" />
          <span>{formatIndianCurrency(value || row.rootCardDetails?.total)}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Badge className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(value)}`}>
          {getStatusLabel(value)}
        </Badge>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value) => (
        <span className={`text-[10px] font-bold ${getPriorityColor(value)}`}>
          {value ? value.toUpperCase() : '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-4 font-semibold hover:opacity-75"
          >
            ×
          </button>
        </div>
      )}

      {stats && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card shadow="sm" className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Total Root Cards</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalRootCards || 0}</p>
                </div>
                <BarChart3 size={32} className="text-blue-500 opacity-20 flex-shrink-0" />
              </div>
            </Card>
            <Card shadow="sm" className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.inProgressRootCards || 0}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex-shrink-0"></div>
              </div>
            </Card>
            <Card shadow="sm" className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Planning</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.planningRootCards || 0}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex-shrink-0"></div>
              </div>
            </Card>
            <Card shadow="sm" className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completedRootCards || 0}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex-shrink-0"></div>
              </div>
            </Card>
          </div>
        </div>
      )}

      <Card shadow="md" padding="none" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Root Cards</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Manage and track all production root cards</p>
          </div>
        </div>

        <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, code, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700">
            <Filter size={16} className="text-slate-600 dark:text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <CardContent className="p-0 border-t border-slate-200 dark:border-slate-700">
          <DataTable
            columns={columns}
            data={rootCards}
            loading={loading}
            emptyMessage="No root cards found"
            sortable={true}
            striped={true}
            hover={true}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default RootCardBuilderPage;
