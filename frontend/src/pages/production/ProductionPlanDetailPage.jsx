import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, AlertCircle, CheckCircle, Clock, User } from 'lucide-react';
import axios from '../../utils/api';

const ProductionPlanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    fetchPlanDetail();
    
    pollingIntervalRef.current = setInterval(() => {
      fetchPlanDetail(false);
    }, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPlanDetail = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await axios.get(`/production/plans/${id}/with-stages`, { __sessionGuard: true });
      setPlan(response.data);
      setFormData(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch plan details');
      console.error('Error fetching plan:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await axios.patch(`/production/plans/${id}`, formData, { __sessionGuard: true });
      setPlan(formData);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to update plan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      await axios.delete(`/production/plans/${id}`, { __sessionGuard: true });
      navigate('/department/production/plans');
    } catch (err) {
      setError(err.message || 'Failed to delete plan');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
      case 'in_progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'on_hold':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status) => {
    return status?.replace(/_/g, ' ')?.toUpperCase() || 'UNKNOWN';
  };

  const getStageStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-blue-200 border-b-blue-600 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading plan details...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-slate-500 dark:text-slate-400">Plan not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/department/production/plans')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{plan.plan_name}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Production Plan #{plan.id}</p>
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

      <div className="flex gap-4 flex-wrap">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
          disabled={isSaving}
        >
          <Edit size={18} />
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
        {isEditing && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
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

      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Plan Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Product</p>
              <p className="text-slate-900 dark:text-white font-medium">{plan.product_name || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Customer</p>
              <p className="text-slate-900 dark:text-white font-medium">{plan.customer_name || 'Not assigned'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Status</p>
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getStatusColor(plan.status)}`}>
                  {getStatusLabel(plan.status)}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Created</p>
              <p className="text-slate-900 dark:text-white font-medium">
                {plan.created_at ? new Date(plan.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Supervisor</p>
              <p className="text-slate-900 dark:text-white font-medium">{plan.supervisor_name || 'Not assigned'}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Plan Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.planName || ''}
                    onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white font-medium">{plan.plan_name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Status
                </label>
                {isEditing ? (
                  <select
                    value={formData.status || ''}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="planning">Planning</option>
                    <option value="approved">Approved</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                ) : (
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getStatusColor(plan.status)}`}>
                      {getStatusLabel(plan.status)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Planned Start Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.plannedStartDate ? formData.plannedStartDate.split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, plannedStartDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white font-medium">
                    {plan.planned_start_date ? new Date(plan.planned_start_date).toLocaleDateString() : 'Not set'}
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
                    value={formData.plannedEndDate ? formData.plannedEndDate.split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, plannedEndDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white font-medium">
                    {plan.planned_end_date ? new Date(plan.planned_end_date).toLocaleDateString() : 'Not set'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Estimated Completion Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.estimatedCompletionDate ? formData.estimatedCompletionDate.split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, estimatedCompletionDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white font-medium">
                    {plan.estimated_completion_date ? new Date(plan.estimated_completion_date).toLocaleDateString() : 'Not set'}
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
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-slate-900 dark:text-white whitespace-pre-wrap">{plan.notes || 'No notes'}</p>
              )}
            </div>
          </div>
        </div>

        {plan.stages && plan.stages.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Production Stages</h3>
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{plan.completedStages || 0}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{plan.totalStages || 0}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Stage Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Root Card</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Assigned To / Facility</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Target Warehouse</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.stages.map((stage) => (
                    <tr key={stage.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-slate-900 dark:text-white">
                        <div>
                          <p className="font-medium">{stage.stageName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stage.stageType}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{stage.rootCardTitle || '-'}</td>
                      <td className="px-6 py-4">
                        {stage.workerName ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{stage.workerName}</p>
                              {stage.assignedFacilityId && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                  Facility #{stage.assignedFacilityId}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Not assigned</p>
                            {stage.assignedFacilityId && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                Facility #{stage.assignedFacilityId}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {stage.targetWarehouse ? (
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-medium border border-purple-200 dark:border-purple-800">
                            {stage.targetWarehouse}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Default</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                        {stage.plannedStart ? new Date(stage.plannedStart).toLocaleDateString('en-IN') : '-'} 
                        <br />
                        to {stage.plannedEnd ? new Date(stage.plannedEnd).toLocaleDateString('en-IN') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStageStatusIcon(stage.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(stage.status)}`}>
                            {getStatusLabel(stage.status)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionPlanDetailPage;
