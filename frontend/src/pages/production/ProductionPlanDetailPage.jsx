import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, Calendar, AlertCircle, CheckCircle, Clock, User, 
  Save, X, Activity, Box, FileText, Layout, ListChecks, Zap, Loader2 
} from 'lucide-react';
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
  const [generatingWorkOrders, setGeneratingWorkOrders] = useState(false);
  const [success, setSuccess] = useState('');
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    fetchPlanDetail();
    
    pollingIntervalRef.current = setInterval(() => {
      fetchPlanDetail(false);
    }, 5000);

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
      const data = response.data;
      setPlan(data);
      
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        // If it's already YYYY-MM-DD, return it directly to avoid timezone shifts
        if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          return dateStr;
        }
        try {
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return dateStr;
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        } catch {
          return dateStr || '';
        }
      };

      // Initialize formData with current values mapped to form field names
      setFormData({
        planName: data.plan_name || '',
        status: data.status || 'draft',
        plannedStartDate: formatDate(data.planned_start_date),
        plannedEndDate: formatDate(data.planned_end_date),
        estimatedCompletionDate: formatDate(data.estimated_completion_date),
        targetQuantity: data.target_quantity || data.quantity || 1,
        notes: data.notes || '',
        supervisorId: data.supervisor_id || ''
      });
      
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
      
      // If planName changed and we are using it in the URL, we need to update navigation
      if (formData.planName && formData.planName !== id && id.startsWith('PP-')) {
        navigate(`/department/production/plans/${formData.planName}`, { replace: true });
      } else {
        // Re-fetch to get updated and populated data
        await fetchPlanDetail(false);
      }
      
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

  const handleGenerateWorkOrders = async () => {
    setGeneratingWorkOrders(true);
    setError(null);
    setSuccess('');
    try {
      const response = await axios.post(`/production/plans/${id}/generate-work-orders`);
      setSuccess(`✓ ${response.data.message}`);
      // Refresh to show any updated status if applicable
      fetchPlanDetail(false);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error generating work orders:', err);
      setError('Failed to generate work orders: ' + (err.response?.data?.message || err.message));
    } finally {
      setGeneratingWorkOrders(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
      case 'planning':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'approved':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'in_progress':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
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
        return <Clock className="w-5 h-5 text-slate-400 dark:text-slate-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400 dark:text-slate-500" />;
    }
  };

  if (loading && !plan) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-b-purple-600 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Syncing plan data...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Plan Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">The production plan you're looking for might have been deleted or moved.</p>
          <button 
            onClick={() => navigate('/department/production/plans')}
            className="w-full py-3 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-all"
          >
            Back to All Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/department/production/plans')}
              className="p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
            >
              <ArrowLeft size={20} className="text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded">
                  Plan Details
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono">
                  #{plan.id}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {plan.plan_name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <>
                <button
                  onClick={handleGenerateWorkOrders}
                  disabled={generatingWorkOrders}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 disabled:bg-slate-400 transition-all text-sm shadow-lg shadow-green-600/20"
                >
                  {generatingWorkOrders ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Zap size={16} />
                  )}
                  Generate Work Orders
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-white dark:hover:bg-slate-800 transition-all text-sm"
                >
                  <Edit size={16} />
                  Edit Plan
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-sm border border-red-100 dark:border-red-900/30"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-white dark:hover:bg-slate-800 transition-all text-sm"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:bg-slate-400 shadow-lg shadow-blue-600/20 transition-all text-sm"
                >
                  {isSaving ? (
                    <Clock size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle size={18} />
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                    <Layout size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Strategic Parameters</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${getStatusColor(plan.status)}`}>
                  {getStatusLabel(plan.status)}
                </span>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Production Plan Name</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.planName || ''}
                          onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                          className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                      ) : (
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{plan.plan_name}</p>
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Target Quantity</p>
                      {isEditing ? (
                        <div className="flex items-center">
                          <input
                            type="number"
                            value={formData.targetQuantity || ''}
                            onChange={(e) => setFormData({ ...formData, targetQuantity: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-l-lg bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                          />
                          <span className="px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-l-0 border-slate-200 dark:border-slate-600 rounded-r-lg text-[10px] font-bold text-slate-500 uppercase">
                            {plan.uom || 'Units'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-end gap-2">
                          <p className="text-lg font-bold text-slate-900 dark:text-white">{plan.target_quantity || plan.quantity || 1}</p>
                          <span className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">{plan.uom || 'Units'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Supervisor</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                          <User size={20} />
                        </div>
                        <p className="font-bold text-slate-700 dark:text-slate-200">{plan.supervisor_name || 'Unassigned'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Lifecycle Status</p>
                      {isEditing ? (
                        <select
                          value={formData.status || ''}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        >
                          <option value="draft">Draft</option>
                          <option value="planning">Planning</option>
                          <option value="approved">Approved</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      ) : (
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${getStatusColor(plan.status)}`}>
                          <div className="w-2 h-2 rounded-full bg-current opacity-50" />
                          {getStatusLabel(plan.status)}
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Created On</p>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                        <Calendar size={18} className="text-slate-400" />
                        {plan.created_at ? new Date(plan.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700/50">
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3">Timeline Matrix</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase">Start Date</p>
                      {isEditing ? (
                        <input
                          type="date"
                          value={formData.plannedStartDate ? formData.plannedStartDate.split('T')[0] : ''}
                          onChange={(e) => setFormData({ ...formData, plannedStartDate: e.target.value })}
                          className="w-full bg-transparent border-none text-slate-900 dark:text-white font-bold outline-none"
                        />
                      ) : (
                        <p className="font-bold text-slate-900 dark:text-white">
                          {plan.planned_start_date ? new Date(plan.planned_start_date).toLocaleDateString() : 'Not Set'}
                        </p>
                      )}
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase">Target End</p>
                      {isEditing ? (
                        <input
                          type="date"
                          value={formData.plannedEndDate ? formData.plannedEndDate.split('T')[0] : ''}
                          onChange={(e) => setFormData({ ...formData, plannedEndDate: e.target.value })}
                          className="w-full bg-transparent border-none text-slate-900 dark:text-white font-bold outline-none"
                        />
                      ) : (
                        <p className="font-bold text-slate-900 dark:text-white">
                          {plan.planned_end_date ? new Date(plan.planned_end_date).toLocaleDateString() : 'Not Set'}
                        </p>
                      )}
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-900/30">
                      <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 mb-1 uppercase">Estimated Completion</p>
                      {isEditing ? (
                        <input
                          type="date"
                          value={formData.estimatedCompletionDate ? formData.estimatedCompletionDate.split('T')[0] : ''}
                          onChange={(e) => setFormData({ ...formData, estimatedCompletionDate: e.target.value })}
                          className="w-full bg-transparent border-none text-purple-700 dark:text-purple-300 font-bold outline-none"
                        />
                      ) : (
                        <p className="font-bold text-purple-700 dark:text-purple-300">
                          {plan.estimated_completion_date ? new Date(plan.estimated_completion_date).toLocaleDateString() : 'Pending'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3">Production Notes</p>
                  {isEditing ? (
                    <textarea
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      placeholder="Enter production directives..."
                    />
                  ) : (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 italic">
                      {plan.notes || 'No specific production directives recorded for this plan.'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stages Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                    <ListChecks size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Execution Stages</h3>
                </div>
                <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Progress</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {plan.completed_stages || 0} / {plan.total_stages || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                      <th className="px-6 py-4">Phase Name</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4">Timeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {plan.stages?.map((stage, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 dark:text-white">{stage.stage_name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{stage.notes || 'Standard processing'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded uppercase">
                            {stage.stage_type || 'In-House'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            {getStageStatusIcon(stage.status)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                            {stage.planned_start ? new Date(stage.planned_start).toLocaleDateString() : 'N/A'} - {stage.planned_end ? new Date(stage.planned_end).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!plan.stages?.length && (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-slate-500 italic">
                          No production stages have been initialized for this plan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Cards */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Box size={80} />
              </div>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mb-4">Production Target</p>
              <div className="relative z-10">
                <h4 className="text-lg font-bold mb-1 group-hover:text-blue-400 transition-colors">{plan.product_name || 'Generic Item'}</h4>
                <p className="text-xs text-slate-400 font-mono mb-6">{plan.item_code || 'ITM-XXXX'}</p>
                
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-white">{plan.target_quantity || plan.quantity || 1}</span>
                  <span className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">{plan.uom || 'Units'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <FileText size={12} className="text-blue-500" />
                Linked Resources
              </p>
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 group cursor-pointer hover:border-blue-500/30 transition-all">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Customer / Project</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                    {plan.customer_name || 'Direct Order'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 group cursor-pointer hover:border-purple-500/30 transition-all">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Sales Order Ref</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors">
                    {plan.sales_order_id ? `SO-${plan.sales_order_id}` : 'Internal Plan'}
                  </p>
                </div>
              </div>
            </div>

            {/* Health Indicators */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-4">Plan Intelligence</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Timeline Health</span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Resource Load</span>
                  <span className="text-[10px] font-bold text-amber-500 uppercase">Optimal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Risk Factor</span>
                  <span className="text-[10px] font-bold text-green-500 uppercase">Minimal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Detail Status Bar */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-6xl z-50">
          <div className="bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Activity size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Current Phase</p>
                  <p className="text-sm font-bold text-white uppercase">{plan.status === 'completed' ? 'Finalized' : 'Production Active'}</p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-8 border-l border-slate-700/50 pl-8">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Stages Complete</p>
                  <p className="text-sm font-bold text-white">{Math.round(((plan.completed_stages || 0) / (plan.total_stages || 1)) * 100)}%</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Efficiency</p>
                  <p className="text-sm font-bold text-green-400">94.2%</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Monitoring</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionPlanDetailPage;
