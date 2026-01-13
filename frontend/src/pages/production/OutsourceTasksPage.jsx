import React, { useState, useEffect } from 'react';
import { ShoppingCart, Calendar, AlertCircle, CheckCircle, Clock, Eye, Package, X, Inbox } from 'lucide-react';
import axios from '../../utils/api';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal, { ModalBody } from '../../components/ui/Modal';
import OutwardChallanForm from '../../components/outsourcing/OutwardChallanForm';
import InwardChallanForm from '../../components/outsourcing/InwardChallanForm';

const OutsourceTasksPage = () => {
  const [outsourceTasks, setOutsourceTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedOutsourcingTaskId, setSelectedOutsourcingTaskId] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showChallanForm, setShowChallanForm] = useState(false);
  const [showInwardChallanForm, setShowInwardChallanForm] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
  const [challanFormTask, setChallanFormTask] = useState(null);
  const [inwardChallanTask, setInwardChallanTask] = useState(null);
  const [projectMaterials, setProjectMaterials] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchOutsourceTasks();
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axios.get('/inventory/vendors');
      setVendors(response.data || []);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    }
  };

  const fetchOutsourceTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/production/portal/outsource-tasks');
      setOutsourceTasks(response.data || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch outsource tasks:', err);
      setError('Failed to load outsource tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTaskDetails = (task) => {
    setSelectedTaskDetails(task);
    setShowTaskDetails(true);
  };

  const handleMarkAsCompleted = async (taskId) => {
    if (!window.confirm('Are you sure you want to mark this task as completed?')) return;
    
    try {
      setUpdatingStatus(true);
      await axios.post(`/production/outsourcing/tasks/${taskId}/complete`);
      setSuccessMessage('Task marked as completed!');
      fetchOutsourceTasks();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to complete task:', err);
      setError('Failed to mark task as completed');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCreateInwardChallan = async (stageId) => {
    try {
      const response = await axios.get(`/production/outsourcing/tasks/production-stage/${stageId}`);
      if (response.data.data) {
        setInwardChallanTask(response.data.data);
        setShowInwardChallanForm(true);
      }
    } catch (err) {
      console.error('Failed to fetch outsourcing task:', err);
      setError('Failed to create inward challan form');
    }
  };

  const handleCreateOutwardChallan = async (task) => {
    try {
      const response = await axios.get(`/production/outsourcing/tasks/production-stage/${task.stage_id}`);
      if (response.data.data) {
        const outsourcingTask = response.data.data;
        setChallanFormTask(outsourcingTask);
        
        if (outsourcingTask.project_id) {
          const materialsResponse = await axios.get(
            `/production/outsourcing/project/${outsourcingTask.project_id}/materials`
          );
          setProjectMaterials(materialsResponse.data.data || []);
        }
        
        setShowChallanForm(true);
      }
    } catch (err) {
      console.error('Failed to fetch task for challan:', err);
      setError('Failed to create outward challan form');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'outward_challan_generated':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'inward_challan_generated':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'outward_challan_generated':
        return <Package className="w-4 h-4" />;
      case 'inward_challan_generated':
        return <Inbox className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredTasks =
    filterStatus === 'all'
      ? outsourceTasks
      : outsourceTasks.filter((t) => t.status === filterStatus);

  const stats = {
    total: outsourceTasks.length,
    pending: outsourceTasks.filter((t) => t.status === 'pending').length,
    inProgress: outsourceTasks.filter((t) => t.status === 'in_progress').length,
    completed: outsourceTasks.filter((t) => t.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Loading outsource tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white dark:bg-slate-900 p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Outsource Tasks
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage and track outsourced production stages
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
              Total Tasks
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">All outsource stages</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
              Pending
            </p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Awaiting start</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
              In Progress
            </p>
            <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
              Completed
            </p>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Finished tasks</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart size={20} />
              Outsource Tasks List
            </CardTitle>
            <div className="flex gap-2">
              {['all', 'pending', 'in_progress', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">
                {filterStatus === 'all'
                  ? 'No outsource tasks found'
                  : `No ${filterStatus.replace('_', ' ')} outsource tasks`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.stage_id}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-slate-700/50 transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {task.stage_name}
                        </h3>
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusIcon(task.status)}
                          <span className="ml-1">{task.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2 text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          {task.project_name} {task.project_code && `(${task.project_code})`}
                        </span>
                        {task.product_name && (
                          <span className="text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
                            <Package size={14} /> {task.product_name}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                        {task.planned_start_date && (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            Start: {new Date(task.planned_start_date).toLocaleDateString('en-IN')}
                          </div>
                        )}
                        {task.planned_end_date && (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            End: {new Date(task.planned_end_date).toLocaleDateString('en-IN')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {task.status === 'pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateOutwardChallan(task);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Create Outward Challan"
                        >
                          <Package className="w-5 h-5" />
                        </button>
                      )}
                      {task.status === 'outward_challan_generated' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateInwardChallan(task.stage_id);
                          }}
                          className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                          title="Create Inward Challan"
                        >
                          <Inbox className="w-5 h-5" />
                        </button>
                      )}
                      {task.status === 'inward_challan_generated' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsCompleted(task.outsourcing_task_id || task.id);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Mark as Completed"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTaskDetails(task);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        title="View Task Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-red-800 p-4 rounded-lg text-green-700 dark:text-green-400 z-50 animate-pulse">
          {successMessage}
        </div>
      )}

      <Modal 
        isOpen={showInwardChallanForm && !!inwardChallanTask} 
        onClose={() => {
          setShowInwardChallanForm(false);
          setInwardChallanTask(null);
        }}
        title="Create Inward Challan"
        size="xl"
      >
        <ModalBody>
          <InwardChallanForm
            task={inwardChallanTask}
            onChallanCreated={() => {
              setSuccessMessage('Inward challan created successfully!');
              setShowInwardChallanForm(false);
              setInwardChallanTask(null);
              fetchOutsourceTasks();
              setTimeout(() => setSuccessMessage(''), 3000);
            }}
          />
        </ModalBody>
      </Modal>

      <Modal 
        isOpen={showChallanForm && !!challanFormTask} 
        onClose={() => {
          setShowChallanForm(false);
          setChallanFormTask(null);
          setProjectMaterials([]);
        }}
        title="Create Outward Challan"
        size="xl"
      >
        <ModalBody>
          <OutwardChallanForm
            task={challanFormTask}
            materials={projectMaterials}
            vendors={vendors}
            onChallanCreated={() => {
              setSuccessMessage('Outward challan created successfully!');
              setShowChallanForm(false);
              setChallanFormTask(null);
              setProjectMaterials([]);
              fetchOutsourceTasks();
              setTimeout(() => setSuccessMessage(''), 3000);
            }}
          />
        </ModalBody>
      </Modal>

      <Modal 
        isOpen={showTaskDetails && !!selectedTaskDetails} 
        onClose={() => {
          setShowTaskDetails(false);
          setSelectedTaskDetails(null);
        }}
        title="Task Details"
        size="lg"
      >
        <ModalBody>
          {selectedTaskDetails && (
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                    Production Stage
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {selectedTaskDetails.stage_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                    Status
                  </p>
                  <Badge className={getStatusColor(selectedTaskDetails.status)}>
                    {getStatusIcon(selectedTaskDetails.status)}
                    <span className="ml-1">
                      {selectedTaskDetails.status.replace('_', ' ')}
                    </span>
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                Project
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {selectedTaskDetails.project_name}
              </p>
              {selectedTaskDetails.project_code && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedTaskDetails.project_code}
                </p>
              )}
            </div>

            {selectedTaskDetails.product_name && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                  Product
                </p>
                <p className="font-semibold text-purple-600 dark:text-purple-400">
                  {selectedTaskDetails.product_name}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {selectedTaskDetails.planned_start_date && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                    Planned Start Date
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {new Date(selectedTaskDetails.planned_start_date).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )}
              {selectedTaskDetails.planned_end_date && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                    Planned End Date
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {new Date(selectedTaskDetails.planned_end_date).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )}
            </div>

            {selectedTaskDetails.notes && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                  Notes
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {selectedTaskDetails.notes}
                </p>
              </div>
            )}
          </div>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default OutsourceTasksPage;
