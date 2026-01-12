import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Package, FileText, X, ChevronDown } from 'lucide-react';
import axios from '../../utils/api';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import Badge from '../ui/Badge';
import SwipeButton from '../ui/SwipeButton';
import VendorSelector from './VendorSelector';
import OutwardChallanForm from './OutwardChallanForm';
import InwardChallanForm from './InwardChallanForm';

const OutsourcingTaskScreen = ({ taskId, onClose, onTaskCompleted }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState('details');
  const [showVendorSelector, setShowVendorSelector] = useState(false);
  const [showOutwardForm, setShowOutwardForm] = useState(false);
  const [showInwardForm, setShowInwardForm] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [projectMaterials, setProjectMaterials] = useState([]);

  useEffect(() => {
    fetchTaskDetails();
    fetchVendors();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/production/outsourcing/tasks/${taskId}`);
      setTask(response.data.data);
      
      if (response.data.data.project_id) {
        await fetchProjectMaterials(response.data.data.project_id);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching task:', err);
      setError('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await axios.get('/inventory/vendors');
      setVendors(response.data || []);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  };

  const fetchProjectMaterials = async (projectId) => {
    try {
      const response = await axios.get(`/production/outsourcing/project/${projectId}/materials`);
      setProjectMaterials(response.data.data || []);
    } catch (err) {
      console.error('Error fetching materials:', err);
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      outward_challan_generated: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      inward_challan_generated: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return statusMap[status] || 'bg-slate-100 text-slate-800';
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      pending: <AlertCircle className="w-4 h-4" />,
      outward_challan_generated: <FileText className="w-4 h-4" />,
      inward_challan_generated: <Package className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />
    };
    return iconMap[status] || <Clock className="w-4 h-4" />;
  };

  const handleCompleteTask = async () => {
    try {
      await axios.post(`/production/outsourcing/tasks/${taskId}/complete`);
      fetchTaskDetails();
      if (onTaskCompleted) onTaskCompleted();
    } catch (err) {
      setError('Failed to complete task');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-4xl">
          <CardContent className="py-12 text-center">
            <p className="text-slate-600 dark:text-slate-400">Loading task details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-4xl">
          <CardContent className="py-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Task not found</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg">
              Close
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8">
        <CardHeader className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {task.root_card_title || 'Outsourcing Task'}
            </h2>
            <Badge className={getStatusColor(task.status)}>
              {getStatusIcon(task.status)}
              <span className="ml-2">{task.status.replace(/_/g, ' ').toUpperCase()}</span>
            </Badge>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <CardContent className="space-y-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                Product Name
              </p>
              <p className="text-slate-900 dark:text-white font-medium">{task.product_name || 'N/A'}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                Project
              </p>
              <p className="text-slate-900 dark:text-white font-medium">{task.project_name || 'N/A'}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                Production Stage
              </p>
              <p className="text-slate-900 dark:text-white font-medium">{task.stage_name || 'N/A'}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                Selected Vendor
              </p>
              <p className="text-slate-900 dark:text-white font-medium">{task.vendor_name || 'Not Selected'}</p>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Workflow Steps</h3>
            
            <div className="space-y-3">
              <StepIndicator
                title="Vendor Selection"
                description="Select a vendor for this outsourcing task"
                status={task.selected_vendor_id ? 'completed' : task.status === 'pending' ? 'active' : 'disabled'}
                isActive={activeStep === 'vendor'}
                onClick={() => setActiveStep('vendor')}
              />

              <StepIndicator
                title="Create Outward Challan"
                description="Define materials to be sent to the vendor"
                status={
                  task.status === 'pending' ? 'disabled' :
                  task.status === 'outward_challan_generated' || task.status === 'inward_challan_generated' || task.status === 'completed'
                    ? 'completed'
                    : 'active'
                }
                isActive={activeStep === 'outward'}
                onClick={() => task.status !== 'pending' && setActiveStep('outward')}
              />

              <StepIndicator
                title="Create Inward Challan"
                description="Record material receipt from vendor"
                status={
                  ['pending', 'outward_challan_generated'].includes(task.status) ? 'disabled' :
                  task.status === 'inward_challan_generated' || task.status === 'completed'
                    ? 'completed'
                    : 'active'
                }
                isActive={activeStep === 'inward'}
                onClick={() => task.status !== 'pending' && task.status !== 'outward_challan_generated' && setActiveStep('inward')}
              />

              <StepIndicator
                title="Complete Task"
                description="Finalize and complete the outsourcing task"
                status={
                  task.status !== 'inward_challan_generated' ? 'disabled' :
                  task.status === 'completed' ? 'completed' : 'active'
                }
                isActive={activeStep === 'complete'}
                onClick={() => task.status === 'inward_challan_generated' && setActiveStep('complete')}
              />
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            {activeStep === 'vendor' && (
              <VendorSelector
                task={task}
                vendors={vendors}
                onVendorSelected={() => {
                  fetchTaskDetails();
                  setActiveStep('outward');
                }}
              />
            )}

            {activeStep === 'outward' && (
              <OutwardChallanForm
                task={task}
                materials={projectMaterials}
                vendors={vendors}
                onChallanCreated={() => {
                  fetchTaskDetails();
                  setActiveStep('inward');
                }}
              />
            )}

            {activeStep === 'inward' && task.status === 'outward_challan_generated' && (
              <InwardChallanForm
                task={task}
                onChallanCreated={() => {
                  fetchTaskDetails();
                  setActiveStep('complete');
                }}
              />
            )}

            {activeStep === 'complete' && task.status === 'inward_challan_generated' && (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-200">
                    All steps completed! Swipe below to finalize the outsourcing task.
                  </p>
                </div>
                <SwipeButton
                  onSwipeComplete={handleCompleteTask}
                  text="Swipe to Complete Task"
                  threshold={80}
                />
              </div>
            )}

            {task.status === 'completed' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="text-green-800 dark:text-green-200 font-medium">
                  Task Completed Successfully!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StepIndicator = ({ title, description, status, isActive, onClick }) => {
  const statusColors = {
    active: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
    completed: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20',
    disabled: 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 opacity-60'
  };

  const statusIcons = {
    active: <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    completed: <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />,
    disabled: <AlertCircle className="w-5 h-5 text-slate-400" />
  };

  return (
    <button
      onClick={onClick}
      disabled={status === 'disabled'}
      className={`w-full border-2 rounded-lg p-4 text-left transition-all ${statusColors[status]} ${
        status !== 'disabled' ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed'
      }`}
    >
      <div className="flex items-center gap-3">
        {statusIcons[status]}
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900 dark:text-white">{title}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
        </div>
        {status !== 'disabled' && <ChevronDown className="w-5 h-5" />}
      </div>
    </button>
  );
};

export default OutsourcingTaskScreen;
