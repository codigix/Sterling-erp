import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, AlertCircle } from 'lucide-react';
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

  useEffect(() => {
    fetchPlanDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPlanDetail = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/production/plans/${id}`, { __sessionGuard: true });
      setPlan(response.data);
      setFormData(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch plan details');
      console.error('Error fetching plan:', err);
    } finally {
      setLoading(false);
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
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status) => {
    return status?.replace(/_/g, ' ')?.toUpperCase() || 'UNKNOWN';
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Details</h2>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Supervisor ID
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.supervisorId || ''}
                      onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-medium">{plan.supervisor_name || 'Not assigned'}</p>
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
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Customer</p>
                <p className="text-slate-900 dark:text-white mt-1 font-medium">{plan.customer_name || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Status</p>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getStatusColor(plan.status)}`}>
                    {getStatusLabel(plan.status)}
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Created</p>
                <p className="text-slate-900 dark:text-white mt-1 font-medium">
                  {plan.created_at ? new Date(plan.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {plan.phases && plan.phases.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Production Phases</h3>
              <div className="space-y-3">
                {plan.phases.map((phase, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">{phase.stage_name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                            {phase.stage_type || 'manufacturing'}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Status: {phase.status || 'pending'}
                          </span>
                        </div>
                        {(phase.planned_start_date || phase.planned_end_date) && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                            {phase.planned_start_date ? new Date(phase.planned_start_date).toLocaleDateString() : '-'} to {phase.planned_end_date ? new Date(phase.planned_end_date).toLocaleDateString() : '-'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionPlanDetailPage;
