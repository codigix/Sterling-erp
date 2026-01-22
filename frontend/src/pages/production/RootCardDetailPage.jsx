import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Play, Calendar, User, Package, Tag, AlertCircle, Plus, X } from 'lucide-react';
import axios from '../../utils/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const RootCardDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [stages, setStages] = useState([]);
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [newStage, setNewStage] = useState({
    stageName: '',
    stageType: 'in_house',
    plannedStart: '',
    plannedEnd: '',
    notes: ''
  });
  const [editingStageId, setEditingStageId] = useState(null);
  const [editingStage, setEditingStage] = useState({});

  useEffect(() => {
    fetchRootCardDetail();
  }, [id]);

  const fetchRootCardDetail = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/production/root-cards/${id}`, { __sessionGuard: true });
      setCard(response.data);
      setFormData(response.data);
      setStages(response.data.stages || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch root card details');
      console.error('Error fetching root card:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axios.patch(`/production/root-cards/${id}`, formData, { __sessionGuard: true });
      setCard(formData);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError('Failed to update root card');
    }
  };

  const handleAddStage = async () => {
    if (!newStage.stageName.trim()) {
      setError('Stage name is required');
      return;
    }

    try {
      await axios.post(`/production/root-cards/${id}/stages`, newStage, { __sessionGuard: true });
      fetchRootCardDetail();
      setNewStage({
        stageName: '',
        stageType: 'in_house',
        plannedStart: '',
        plannedEnd: '',
        notes: ''
      });
      setIsAddingStage(false);
    } catch (err) {
      setError('Failed to add production phase');
      console.error('Error adding stage:', err);
    }
  };

  const handleDeleteStage = async (stageId) => {
    if (window.confirm('Are you sure you want to delete this production phase?')) {
      try {
        await axios.delete(`/production/root-cards/${id}/stages/${stageId}`, { __sessionGuard: true });
        fetchRootCardDetail();
      } catch (err) {
        setError('Failed to delete production phase');
      }
    }
  };

  const handleStartProduction = async () => {
    try {
      await axios.patch(`/production/root-cards/${id}/status`, {
        status: 'in_progress'
      }, { __sessionGuard: true });
      fetchRootCardDetail();
    } catch (err) {
      setError('Failed to start production');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this root card?')) {
      try {
        await axios.delete(`/production/root-cards/${id}`, { __sessionGuard: true });
        navigate('/department/production/root-cards');
      } catch (err) {
        setError('Failed to delete root card');
      }
    }
  };

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

  const getStageTypeColor = (stageType) => {
    switch (stageType) {
      case 'in_house':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'outsource':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-blue-200 border-b-blue-600 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading root card details...</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-slate-500 dark:text-slate-400">Root card not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/department/production/root-cards')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{card.title}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Root Card #{card.code}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300 flex items-start gap-3">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
        >
          <Edit size={18} />
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
        {card.status === 'planning' && (
          <button
            onClick={handleStartProduction}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
          >
            <Play size={18} />
            Start Production
          </button>
        )}
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
        >
          <Trash2 size={18} />
          Delete
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Details</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Title
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-medium">{card.title}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Product
                  </label>
                  <p className="text-slate-900 dark:text-white font-medium">{card.product_name || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Code
                  </label>
                  <p className="text-slate-900 dark:text-white font-medium">{card.code || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Status
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.status || 'planning'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="draft">Draft</option>
                      <option value="planning">Planning</option>
                      <option value="in_progress">In Progress</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  ) : (
                    <Badge className={`inline-block text-sm font-semibold px-3 py-1.5 rounded-full ${getStatusColor(card.status)}`}>
                      {getStatusLabel(card.status)}
                    </Badge>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Priority
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.priority || 'medium'}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  ) : (
                    <p className={`font-semibold ${getPriorityColor(card.priority)}`}>
                      {card.priority ? card.priority.toUpperCase() : '-'}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Planned Start Date
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.planned_start ? formData.planned_start.split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, planned_start: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white">
                      {card.planned_start ? new Date(card.planned_start).toLocaleDateString() : '-'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Planned End Date
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.planned_end ? formData.planned_end.split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, planned_end: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white">
                      {card.planned_end ? new Date(card.planned_end).toLocaleDateString() : '-'}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Notes
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                ) : (
                  <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{card.notes || '-'}</p>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(card);
                    }}
                    className="px-6 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-medium transition-colors hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Production Phases</h2>
              {!isAddingStage && (
                <button
                  onClick={() => setIsAddingStage(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors text-sm"
                >
                  <Plus size={16} />
                  Add Phase
                </button>
              )}
            </div>

            {isAddingStage && (
              <div className="mb-6 p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Phase Name *
                    </label>
                    <input
                      type="text"
                      value={newStage.stageName}
                      onChange={(e) => setNewStage({ ...newStage, stageName: e.target.value })}
                      placeholder="e.g., Cutting, Welding, Assembly..."
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Type
                    </label>
                    <select
                      value={newStage.stageType}
                      onChange={(e) => setNewStage({ ...newStage, stageType: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    >
                      <option value="in_house">In-House</option>
                      <option value="outsource">Outsource</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Planned Start
                    </label>
                    <input
                      type="date"
                      value={newStage.plannedStart}
                      onChange={(e) => setNewStage({ ...newStage, plannedStart: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Planned End
                    </label>
                    <input
                      type="date"
                      value={newStage.plannedEnd}
                      onChange={(e) => setNewStage({ ...newStage, plannedEnd: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={newStage.notes}
                    onChange={(e) => setNewStage({ ...newStage, notes: e.target.value })}
                    placeholder="Add any notes about this phase..."
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddStage}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors text-sm"
                  >
                    Save Phase
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingStage(false);
                      setNewStage({
                        stageName: '',
                        stageType: 'in_house',
                        plannedStart: '',
                        plannedEnd: '',
                        notes: ''
                      });
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white font-medium transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {stages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400">No production phases defined yet</p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Create phases to plan your production workflow</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stages.map((stage, index) => (
                  <div key={stage.id || index} className="flex items-start justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Phase {index + 1}</span>
                        <Badge className={`text-xs font-semibold px-2 py-1 rounded ${getStageTypeColor(stage.stage_type || stage.stageType)}`}>
                          {(stage.stage_type || stage.stageType) === 'in_house' ? 'In-House' : 'Outsource'}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{stage.stage_name || stage.stageName}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {(stage.planned_start || stage.plannedStart) && (
                          <div>
                            <span className="text-slate-600 dark:text-slate-400">Start:</span>
                            <p className="text-slate-900 dark:text-white">{new Date(stage.planned_start || stage.plannedStart).toLocaleDateString()}</p>
                          </div>
                        )}
                        {(stage.planned_end || stage.plannedEnd) && (
                          <div>
                            <span className="text-slate-600 dark:text-slate-400">End:</span>
                            <p className="text-slate-900 dark:text-white">{new Date(stage.planned_end || stage.plannedEnd).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                      {(stage.notes || stage.notes) && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{stage.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteStage(stage.id)}
                      className="ml-4 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Information</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                  <User size={16} />
                  Supervisor
                </div>
                <p className="font-medium text-slate-900 dark:text-white">{card.assigned_supervisor_name || '-'}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                  <Package size={16} />
                  Customer
                </div>
                <p className="font-medium text-slate-900 dark:text-white">{card.customer_name || '-'}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                  <Tag size={16} />
                  Project
                </div>
                <p className="font-medium text-slate-900 dark:text-white">{card.project_name || '-'}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                  <Calendar size={16} />
                  Created
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {new Date(card.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>

          {card.projectDetails && (
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Project Details</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">Project Name</p>
                  <p className="font-medium text-slate-900 dark:text-white">{card.projectDetails.name || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">Project Code</p>
                  <p className="font-medium text-slate-900 dark:text-white">{card.projectDetails.code || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">Client</p>
                  <p className="font-medium text-slate-900 dark:text-white">{card.projectDetails.clientName || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">Project Status</p>
                  <p className="font-medium text-slate-900 dark:text-white">{card.projectDetails.status ? card.projectDetails.status.replace('_', ' ').toUpperCase() : '-'}</p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">Project Priority</p>
                  <p className={`font-medium ${getPriorityColor(card.projectDetails.priority)}`}>
                    {card.projectDetails.priority ? card.projectDetails.priority.toUpperCase() : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">Expected Dates</p>
                  <p className="font-medium text-slate-900 dark:text-white text-xs">
                    {card.projectDetails.expectedStart ? new Date(card.projectDetails.expectedStart).toLocaleDateString() : '-'} to{' '}
                    {card.projectDetails.expectedEnd ? new Date(card.projectDetails.expectedEnd).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">Project Manager</p>
                  <p className="font-medium text-slate-900 dark:text-white">{card.projectDetails.managerName || '-'}</p>
                </div>
                {card.projectDetails.summary && (
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 mb-1">Summary</p>
                    <p className="text-slate-700 dark:text-slate-300 text-xs">{card.projectDetails.summary}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {card.rootCardDetails && (
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Root Card Details</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">PO Number</p>
                  <p className="font-medium text-slate-900 dark:text-white">{card.rootCardDetails.poNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">Order Date</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {card.rootCardDetails.orderDate ? new Date(card.rootCardDetails.orderDate).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">Due Date</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {card.rootCardDetails.dueDate ? new Date(card.rootCardDetails.dueDate).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">Total Amount</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {card.rootCardDetails.total ? `${card.rootCardDetails.currency || 'INR'} ${card.rootCardDetails.total}` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">Order Status</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {card.rootCardDetails.status ? card.rootCardDetails.status.replace('_', ' ').toUpperCase() : '-'}
                  </p>
                </div>
                {card.rootCardDetails.items && card.rootCardDetails.items.length > 0 && (
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 mb-2">Items</p>
                    <div className="space-y-1">
                      {card.rootCardDetails.items.map((item, idx) => (
                        <div key={idx} className="text-xs text-slate-700 dark:text-slate-300">
                          {item.name || item.description} - Qty: {item.quantity || item.qty}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Status Summary</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Status</span>
                </div>
                <Badge className={`inline-block text-xs font-semibold px-3 py-2 rounded-full ${getStatusColor(card.status)}`}>
                  {getStatusLabel(card.status)}
                </Badge>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Phases</span>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stages.length}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RootCardDetailPage;
