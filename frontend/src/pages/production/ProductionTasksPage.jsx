import React, { useState, useEffect } from 'react';
import axios from '../../utils/api';
import { Plus, Eye, Edit2, ArrowRight, Filter, Settings, X } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ProductionPlanFormPage from './ProductionPlanFormPage';
import '../../styles/TaskPage.css';

const ProductionTasksPage = () => {
  const [rootCards, setRootCards] = useState([]);
  const [stages, setStages] = useState([]);
  const [productionStats, setProductionStats] = useState({});
  const [stageStats, setStageStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('plans');
  const [showRootCardBuilder, setShowRootCardBuilder] = useState(false);

  useEffect(() => {
    const fetchProductionData = async () => {
      try {
        setLoading(true);
        const [rcRes, stageRes] = await Promise.all([
          axios.get('/api/production/portal/root-cards'),
          axios.get('/api/production/portal/stages')
        ]);
        setRootCards(rcRes.data.rootCards || []);
        setProductionStats(rcRes.data.stats || {});
        setStages(stageRes.data.stages || []);
        setStageStats(stageRes.data.stats || {});
      } catch (error) {
        console.error('Fetch production error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductionData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center text-xs justify-center py-12">
        <p className="text-slate-600">Loading production data...</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalRC: rootCards.length,
    inProgress: rootCards.filter(rc => rc.status === 'in-progress').length,
    totalStages: stages.length,
    activeStages: stages.filter(s => s.status === 'in-progress').length
  };

  return (
    <div className="task-page-container">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Root Cards</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalRC}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">In Progress</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.inProgress}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Stages</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalStages}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Active Stages</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.activeStages}</p>
          </div>
        </Card>
      </div>

      {/* Tab and Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'plans'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700  dark: hover:'
            }`}
          >
            Production Plans
          </button>
          <button
            onClick={() => setActiveTab('rootcards')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'rootcards'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700  dark: hover:'
            }`}
          >
            Root Cards
          </button>
          <button
            onClick={() => setActiveTab('stages')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'stages'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700  dark: hover:'
            }`}
          >
            Manufacturing Stages
          </button>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center text-xs gap-2 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700  dark: hover: transition-colors">
            <Filter size={18} />
            Filter
          </button>
          <button
            onClick={() => setShowRootCardBuilder(!showRootCardBuilder)}
            className="flex items-center text-xs gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            New {activeTab === 'rootcards' ? 'Root Card' : 'Stage'}
          </button>
        </div>
      </div>

      {/* Root Card Builder Modal */}
      {showRootCardBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center text-xs justify-center z-50 p-4">
          <Card className="max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center text-xs justify-between mb-4">
                <h3 className="text-lg font-bold  dark:">Root Card Builder</h3>
                <button onClick={() => setShowRootCardBuilder(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium  dark: mb-2">Project</label>
                  <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:">
                    <option>Select Project...</option>
                    <option>PROJ-001 - Motor Assembly Unit</option>
                    <option>PROJ-002 - Control Panel</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium  dark: mb-2">Manufacturing Stages</label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {['In-house Assembly Stage 1', 'Outsourced - Painting', 'In-house Assembly Stage 2', 'Testing & QC', 'Packing & Dispatch'].map((stage, idx) => (
                      <div key={idx} className="flex items-center text-xs gap-2 p-2 border border-slate-200 dark:border-slate-600 rounded-lg">
                        <input type="checkbox" className="w-4 h-4" />
                        <span className="text-sm  dark:">{stage}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium  dark: mb-2">Notes</label>
                  <textarea className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:" rows="3" />
                </div>
              </div>

              <div className="flex gap-2 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium">
                  Create Root Card
                </button>
                <button onClick={() => setShowRootCardBuilder(false)} className="flex-1 px-4 py-2 rounded-lg  dark:bg-slate-600  dark: hover:bg-slate-400 transition-colors font-medium">
                  Cancel
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Production Plans */}
      {activeTab === 'plans' && (
        <ProductionPlanFormPage />
      )}

      {/* Root Cards */}
      {activeTab === 'rootcards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rootCards.map(rc => (
            <Card key={rc.id} className="card-hover">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold  dark:">{rc.id}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{rc.projectName}</p>
                  </div>
                  <Badge className={getStatusColor(rc.status)}>
                    {rc.status.charAt(0).toUpperCase() + rc.status.slice(1)}
                  </Badge>
                </div>

                <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase mb-2">Progress</p>
                  <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(rc.completedStages / rc.stages) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 text-xs ">
                    {rc.completedStages} of {rc.stages} stages completed
                  </p>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                  Created: {rc.createdDate}
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button className="flex-1 flex items-center text-xs justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium">
                    <Settings size={16} />
                    Manage
                  </button>
                  <button className="flex-1 flex items-center text-xs justify-center gap-2 px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700  dark: hover: transition-colors text-sm font-medium">
                    <Eye size={16} />
                    View
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Manufacturing Stages */}
      {activeTab === 'stages' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-3 text-left text-sm font-semibold">Stage ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Root Card</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Stage Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Progress</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stages.map(stage => (
                  <tr key={stage.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs">
                    <td className="p-1 text-sm font-medium">{stage.id}</td>
                    <td className="p-1 text-sm text-slate-700 dark:text-slate-300">{stage.rootCard}</td>
                    <td className="p-1 text-sm text-slate-700 dark:text-slate-300">{stage.stageName}</td>
                    <td className="p-1 text-sm">
                      <Badge className={stage.type === 'in-house' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                        {stage.type === 'in-house' ? 'In-House' : 'Outsourced'}
                      </Badge>
                    </td>
                    <td className="p-1">
                      <div className="flex items-center text-xs gap-2">
                        <div className="w-16 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${stage.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stage.progress}%</span>
                      </div>
                    </td>
                    <td className="p-1">
                      <Badge className={getStatusColor(stage.status)}>
                        {stage.status.charAt(0).toUpperCase() + stage.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-1">
                      <div className="flex gap-2">
                        <button className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                          <ArrowRight size={16} />
                        </button>
                        <button className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover: transition-colors">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProductionTasksPage;
