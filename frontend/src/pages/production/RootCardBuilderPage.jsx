import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Eye, BarChart3, Trash2, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

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
      const params = { all: 'true' };
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      const response = await axios.get('/production/portal/root-cards', {
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

  return (
    <div className="space-y-8 pb-8">
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
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Total Root Cards</p>
                  <p className="text-4xl font-bold text-slate-900 dark:text-white">{stats.totalRootCards || 0}</p>
                </div>
                <BarChart3 size={40} className="text-blue-500 opacity-30 flex-shrink-0 ml-4" />
              </div>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">In Progress</p>
                  <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{stats.inProgressRootCards || 0}</p>
                </div>
                <div className="h-14 w-14 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex-shrink-0 ml-4"></div>
              </div>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Planning</p>
                  <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">{stats.planningRootCards || 0}</p>
                </div>
                <div className="h-14 w-14 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex-shrink-0 ml-4"></div>
              </div>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Completed</p>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">{stats.completedRootCards || 0}</p>
                </div>
                <div className="h-14 w-14 rounded-lg bg-green-100 dark:bg-green-900/30 flex-shrink-0 ml-4"></div>
              </div>
            </Card>
          </div>
        </div>
      )}

      <Card className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Root Cards</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage and track all production root cards</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors whitespace-nowrap">
            <Plus size={20} />
            Create Root Card
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, code, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700">
            <Filter size={18} className="text-slate-600 dark:text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 bg-transparent text-slate-900 dark:text-white outline-none cursor-pointer"
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

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-blue-200 border-b-blue-600"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading root cards...</p>
          </div>
        ) : rootCards.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-slate-500 dark:text-slate-400">No root cards found</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Create a new root card to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-8 px-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Project</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">PO Number</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Assigned Steps</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Priority</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rootCards.map((card) => (
                  <tr key={card.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-blue-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{card.code || `-`}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">{card.title || `-`}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {card.projectDetails?.code || card.project_code || `-`}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {card.salesOrderDetails?.customer || card.customer_name || `-`}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {card.salesOrderDetails?.poNumber || `-`}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {card.assignedSteps && card.assignedSteps.length > 0 ? (
                          card.assignedSteps.map((step, index) => (
                            <Badge 
                              key={`${card.id}-step-${step.stepId || index}`}
                              className={`inline-block text-xs font-semibold px-2 py-1 rounded ${getStepColor(step.stepId)}`}
                            >
                              {getStepLabel(step.stepId)}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {card.salesOrderDetails?.total ? `${card.salesOrderDetails?.currency || 'INR'} ${card.salesOrderDetails?.total}` : `-`}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full ${getStatusColor(card.status)}`}>
                        {getStatusLabel(card.status)}
                      </Badge>
                    </td>
                    <td className={`px-6 py-4 text-sm font-semibold ${getPriorityColor(card.priority)}`}>
                      {card.priority ? card.priority.toUpperCase() : `-`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(card.id)}
                          disabled={actionLoading === card.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          <Eye size={16} />
                          View
                        </button>
                        {card.status === 'planning' && (
                          <button
                            onClick={(e) => handleStartProduction(e, card.id)}
                            disabled={actionLoading === card.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            <Play size={14} />
                            Start
                          </button>
                        )}
                        {card.status === 'in_progress' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 text-amber-700 dark:text-amber-400 text-sm font-medium">
                            Running...
                          </span>
                        )}
                        <button
                          onClick={(e) => handleDeleteCard(e, card.id)}
                          disabled={actionLoading === card.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RootCardBuilderPage;
