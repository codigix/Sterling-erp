import React, { useState, useEffect } from 'react';
import axios from '../../utils/api';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Users
} from 'lucide-react';

const ProductionPlanDetail = ({ rootCard, onRefresh }) => {
  const [stages, setStages] = useState([]);
  const [expandedStages, setExpandedStages] = useState({});
  const [loading, setLoading] = useState(false);
  const [showNewStageForm, setShowNewStageForm] = useState(false);
  const [newStageData, setNewStageData] = useState({
    stageName: '',
    stageType: 'in_house',
    plannedStart: '',
    plannedEnd: ''
  });

  useEffect(() => {
    fetchStages();
  }, [rootCard.id]);

  const fetchStages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/production/manufacturing-stages/${rootCard.id}`);
      setStages(response.data.stages || []);
    } catch (error) {
      console.error('Failed to fetch stages:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStageExpand = (stageId) => {
    setExpandedStages(prev => ({
      ...prev,
      [stageId]: !prev[stageId]
    }));
  };

  const handleAddStage = async () => {
    if (!newStageData.stageName.trim()) {
      alert('Stage name is required');
      return;
    }

    try {
      await axios.post('/api/production/manufacturing-stages', {
        rootCardId: rootCard.id,
        ...newStageData
      });
      setNewStageData({ stageName: '', stageType: 'in_house', plannedStart: '', plannedEnd: '' });
      setShowNewStageForm(false);
      fetchStages();
    } catch (error) {
      console.error('Failed to create stage:', error);
      alert('Failed to create manufacturing stage');
    }
  };

  const handleUpdateStageStatus = async (stageId, newStatus) => {
    try {
      await axios.patch(`/api/production/manufacturing-stages/${stageId}/status`, {
        status: newStatus
      });
      fetchStages();
    } catch (error) {
      console.error('Failed to update stage status:', error);
      alert('Failed to update stage status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{rootCard.title}</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {rootCard.project} {rootCard.projectCode && `(${rootCard.projectCode})`}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getPriorityColor(rootCard.priority)}>
                {rootCard.priority.toUpperCase()}
              </Badge>
              <Badge className={getStatusColor(rootCard.status)}>
                {rootCard.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Production Code</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{rootCard.code || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Stages</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{rootCard.totalStages}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Completed Stages</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{rootCard.completedStages}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Overall Progress</p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${rootCard.progress || 0}%` }}
                  ></div>
                </div>
                <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">{rootCard.progress || 0}%</span>
              </div>
            </div>
          </div>

          {rootCard.plannedStart || rootCard.plannedEnd ? (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              {rootCard.plannedStart && (
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Planned Start</p>
                  <p className="text-slate-900 dark:text-slate-100">{new Date(rootCard.plannedStart).toLocaleDateString()}</p>
                </div>
              )}
              {rootCard.plannedEnd && (
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Planned End</p>
                  <p className="text-slate-900 dark:text-slate-100">{new Date(rootCard.plannedEnd).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Manufacturing Stages</CardTitle>
          <Button
            size="sm"
            onClick={() => setShowNewStageForm(!showNewStageForm)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Stage
          </Button>
        </CardHeader>
        <CardContent>
          {showNewStageForm && (
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Stage Name"
                  value={newStageData.stageName}
                  onChange={(e) => setNewStageData({ ...newStageData, stageName: e.target.value })}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
                <select
                  value={newStageData.stageType}
                  onChange={(e) => setNewStageData({ ...newStageData, stageType: e.target.value })}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="in_house">In-House</option>
                  <option value="outsourced">Outsourced</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  value={newStageData.plannedStart}
                  onChange={(e) => setNewStageData({ ...newStageData, plannedStart: e.target.value })}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
                <input
                  type="date"
                  value={newStageData.plannedEnd}
                  onChange={(e) => setNewStageData({ ...newStageData, plannedEnd: e.target.value })}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleAddStage}>
                  Create Stage
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowNewStageForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400">Loading stages...</p>
            </div>
          ) : stages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400">No manufacturing stages yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stages.map((stage, index) => (
                <div key={stage.id} className="border border-slate-200 dark:border-slate-700 rounded-lg">
                  <button
                    onClick={() => toggleStageExpand(stage.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Stage {index + 1}
                      </span>
                      {getStatusIcon(stage.status)}
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {stage.stage_name}
                      </span>
                      <Badge className={getStatusColor(stage.status)}>
                        {stage.status}
                      </Badge>
                    </div>
                    {expandedStages[stage.id] ? (
                      <ChevronUp className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    )}
                  </button>

                  {expandedStages[stage.id] && (
                    <div className="px-4 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Type</p>
                          <p className="text-slate-900 dark:text-slate-100">
                            {stage.stage_type?.replace('_', ' ') || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Progress</p>
                          <p className="text-slate-900 dark:text-slate-100">{stage.progress || 0}%</p>
                        </div>
                        {stage.planned_start && (
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Planned Start</p>
                            <p className="text-slate-900 dark:text-slate-100">
                              {new Date(stage.planned_start).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {stage.planned_end && (
                          <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Planned End</p>
                            <p className="text-slate-900 dark:text-slate-100">
                              {new Date(stage.planned_end).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 pt-2">
                        {stage.status !== 'completed' && (
                          <>
                            {stage.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleUpdateStageStatus(stage.id, 'in_progress')}
                              >
                                Start Stage
                              </Button>
                            )}
                            {stage.status === 'in_progress' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleUpdateStageStatus(stage.id, 'completed')}
                              >
                                Complete Stage
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionPlanDetail;
