import React, { useState, useEffect } from 'react';
import axios from '../../utils/api';
import { Plus, Eye, CheckCircle, X, AlertCircle, Filter, TrendingUp } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import '../../styles/TaskPage.css';

const QCTasksPage = () => {
  const [grnInspections, setGrnInspections] = useState([]);
  const [stageQC, setStageQC] = useState([]);
  const [grnStats, setGrnStats] = useState({});
  const [stageQCStats, setStageQCStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('grn');

  useEffect(() => {
    const fetchQCData = async () => {
      try {
        setLoading(true);
        const [grnRes, stageRes] = await Promise.all([
          axios.get('/api/qc/portal/grn-inspections'),
          axios.get('/api/qc/portal/stage-qc')
        ]);
        setGrnInspections(grnRes.data.grnInspections || []);
        setGrnStats(grnRes.data.stats || {});
        setStageQC(stageRes.data.stageQC || []);
        setStageQCStats(stageRes.data.stats || {});
      } catch (error) {
        console.error('Fetch QC error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQCData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center text-xs justify-center py-12">
        <p className="text-slate-600">Loading QC data...</p>
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
    totalGRN: grnStats.totalGRN || 0,
    pendingGRN: grnStats.pendingGRN || 0,
    totalStageQC: stageQCStats.totalStageQC || 0,
    pendingStageQC: stageQCStats.pendingStageQC || 0
  };

  return (
    <div className="task-page-container">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total GRN</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalGRN}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Pending GRN</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pendingGRN}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Stage QC Tasks</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalStageQC}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Pending QC</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pendingStageQC}</p>
          </div>
        </Card>
      </div>

      {/* Tab and Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('grn')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'grn'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700  dark: hover:'
            }`}
          >
            GRN Inspections
          </button>
          <button
            onClick={() => setActiveTab('stage')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'stage'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700  dark: hover:'
            }`}
          >
            Stage-wise QC
          </button>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center text-xs gap-2 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700  dark: hover: transition-colors">
            <Filter size={18} />
            Filter
          </button>
        </div>
      </div>

      {/* GRN Inspections */}
      {activeTab === 'grn' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {grnInspections.map(grn => (
            <Card key={grn.id} className="card-hover">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold  dark:">{grn.id}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">PO: {grn.poNumber}</p>
                  </div>
                  <Badge className={getStatusColor(grn.qcStatus)}>
                    {grn.qcStatus.charAt(0).toUpperCase() + grn.qcStatus.slice(1)}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Vendor:</span>
                    <span className="font-medium  dark:">{grn.vendor}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Received:</span>
                    <span className="font-medium  dark:">{grn.receivedDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Total Items:</span>
                    <span className="font-bold  dark:">{grn.items}</span>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg flex gap-3">
                  <div className="flex-1">
                    <p className="text-xs text-blue-600 dark:text-blue-300">Accepted</p>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-200">{grn.acceptedItems}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-red-600 dark:text-red-300">Rejected</p>
                    <p className="text-lg font-bold text-red-700 dark:text-red-200">{grn.rejectedItems}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium">
                    Start Inspection
                  </button>
                  <button className="flex-1 px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700  dark: hover: transition-colors text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Stage-wise QC */}
      {activeTab === 'stage' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-3 text-left text-sm font-semibold">QC ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Stage</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Project</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Due Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stageQC.map(qc => (
                  <tr key={qc.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs">
                    <td className="p-1 text-sm font-medium">{qc.id}</td>
                    <td className="p-1 text-sm text-slate-700 dark:text-slate-300">{qc.stage}</td>
                    <td className="p-1 text-sm text-slate-700 dark:text-slate-300">{qc.projectId}</td>
                    <td className="p-1 text-sm text-slate-700 dark:text-slate-300">{qc.dueDate}</td>
                    <td className="p-1">
                      <Badge className={getStatusColor(qc.status)}>
                        {qc.status.charAt(0).toUpperCase() + qc.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-1">
                      <div className="flex gap-2">
                        <button className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                          <CheckCircle size={16} />
                        </button>
                        <button className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700  dark: hover: transition-colors">
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

export default QCTasksPage;
