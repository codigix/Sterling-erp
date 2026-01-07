import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, Loader } from 'lucide-react';
import axios from '../../utils/api';

const ProductionPhasesDisplay = ({ rootCardId, editable = false }) => {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newPhase, setNewPhase] = useState({
    stageName: '',
    stageType: 'in_house',
    plannedStart: '',
    plannedEnd: '',
    notes: ''
  });
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchPhases();
  }, [rootCardId]);

  const fetchPhases = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/production/root-cards/${rootCardId}`, {
        __sessionGuard: true
      });
      setPhases(response.data.stages || []);
    } catch (err) {
      setError('Failed to load production phases');
      console.error('Error fetching phases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhase = async (e) => {
    e.preventDefault();

    if (!newPhase.stageName.trim()) {
      setError('Phase name is required');
      return;
    }

    try {
      await axios.post(`/production/root-cards/${rootCardId}/stages`, newPhase, {
        __sessionGuard: true
      });
      setNewPhase({
        stageName: '',
        stageType: 'in_house',
        plannedStart: '',
        plannedEnd: '',
        notes: ''
      });
      setIsAdding(false);
      await fetchPhases();
    } catch (err) {
      setError('Failed to create phase');
      console.error('Error creating phase:', err);
    }
  };

  const handleDeletePhase = async (stageId) => {
    if (!window.confirm('Are you sure you want to delete this phase?')) {
      return;
    }

    setDeleting(stageId);
    try {
      await axios.delete(`/production/root-cards/${rootCardId}/stages/${stageId}`, {
        __sessionGuard: true
      });
      await fetchPhases();
    } catch (err) {
      setError('Failed to delete phase');
      console.error('Error deleting phase:', err);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="animate-spin text-blue-500" size={24} />
        <span className="ml-3 text-slate-600 dark:text-slate-400">Loading phases...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {phases.length === 0 && !isAdding ? (
        <div className="text-center py-8">
          <p className="text-slate-600 dark:text-slate-400 mb-4">No production phases yet</p>
          {editable && (
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Add Phase
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {phases.map((phase, index) => (
              <div
                key={phase.id}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {phase.stage_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          phase.stage_type === 'in_house'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        }`}>
                          {phase.stage_type === 'in_house' ? 'In-House' : 'Outsource'}
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {phase.status === 'pending' ? 'Pending' : phase.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {editable && (
                    <button
                      onClick={() => handleDeletePhase(phase.id)}
                      disabled={deleting === phase.id}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete phase"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                {(phase.planned_start || phase.planned_end) && (
                  <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                    {phase.planned_start && (
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Start Date</p>
                        <p className="text-slate-900 dark:text-white">
                          {new Date(phase.planned_start).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {phase.planned_end && (
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">End Date</p>
                        <p className="text-slate-900 dark:text-white">
                          {new Date(phase.planned_end).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {phase.notes && (
                  <div className="mt-3 p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Notes</p>
                    <p className="text-sm text-slate-900 dark:text-white mt-1">{phase.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {editable && !isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              + Add Phase
            </button>
          )}
        </>
      )}

      {editable && isAdding && (
        <form onSubmit={handleAddPhase} className="p-4 border-2 border-blue-300 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Phase Name *
            </label>
            <input
              type="text"
              value={newPhase.stageName}
              onChange={(e) => setNewPhase({ ...newPhase, stageName: e.target.value })}
              placeholder="e.g., Cutting, Assembly, Testing"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Type
              </label>
              <select
                value={newPhase.stageType}
                onChange={(e) => setNewPhase({ ...newPhase, stageType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="in_house">In-House</option>
                <option value="outsource">Outsource</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <select
                disabled
                value="pending"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white cursor-not-allowed"
              >
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Planned Start
              </label>
              <input
                type="date"
                value={newPhase.plannedStart}
                onChange={(e) => setNewPhase({ ...newPhase, plannedStart: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Planned End
              </label>
              <input
                type="date"
                value={newPhase.plannedEnd}
                onChange={(e) => setNewPhase({ ...newPhase, plannedEnd: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Notes
            </label>
            <textarea
              value={newPhase.notes}
              onChange={(e) => setNewPhase({ ...newPhase, notes: e.target.value })}
              placeholder="Add notes about this phase..."
              rows="3"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Phase
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewPhase({
                  stageName: '',
                  stageType: 'in_house',
                  plannedStart: '',
                  plannedEnd: '',
                  notes: ''
                });
              }}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProductionPhasesDisplay;
