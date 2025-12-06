import React, { useState, useEffect } from 'react';
import axios from '../../utils/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Upload,
  Check,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
  FileText,
  Package,
  Zap,
  Truck,
} from 'lucide-react';
import './SalesOrderWizard.css';

const WORKFLOW_STEPS = [
  { number: 1, name: 'PO Details', type: 'po_details', icon: FileText },
  { number: 2, name: 'Sales Details', type: 'sales_details', icon: Zap },
  { number: 3, name: 'Documents', type: 'documents_upload', icon: Upload },
  { number: 4, name: 'Designs', type: 'designs_upload', icon: Upload },
  { number: 5, name: 'Materials', type: 'material_request', icon: Package },
  { number: 6, name: 'Production', type: 'production_plan', icon: Zap },
  { number: 7, name: 'QC', type: 'quality_check', icon: Check },
  { number: 8, name: 'Shipment', type: 'shipment', icon: Truck },
  { number: 9, name: 'Delivered', type: 'delivered', icon: CheckCircle2 },
];

const SalesOrderWizard = ({ salesOrderId, onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stepData, setStepData] = useState({});
  const [assignments, setAssignments] = useState({});

  useEffect(() => {
    fetchWorkflowSteps();
    fetchEmployees();
  }, [salesOrderId]);

  const fetchWorkflowSteps = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/sales/workflow/${salesOrderId}/steps`);
      setWorkflowSteps(response.data.steps || []);
    } catch (err) {
      setError('Failed to load workflow steps');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/sales/employees');
      const employeeList = Array.isArray(response.data) ? response.data : response.data.users || [];
      setEmployees(employeeList);
    } catch (err) {
      console.error('Failed to load employees:', err);
    }
  };

  const handleAssignEmployee = async (stepId, employeeId) => {
    try {
      const response = await axios.post('/api/sales/workflow/steps/assign', {
        stepId,
        employeeId,
        reason: `Assigned to ${WORKFLOW_STEPS[currentStep - 1].name} step`,
      });

      setAssignments((prev) => ({
        ...prev,
        [stepId]: employeeId,
      }));

      // Show success message
      setError(null);
      alert('Employee assigned successfully and task added to their dashboard!');
      
      // Refresh workflow steps
      await fetchWorkflowSteps();
    } catch (err) {
      setError('Failed to assign employee');
      console.error(err);
    }
  };

  const handleUpdateStepStatus = async (stepId, status) => {
    try {
      setLoading(true);
      await axios.put(`/api/sales/workflow/steps/${stepId}/status`, {
        status,
        notes: stepData[currentStep]?.notes || '',
      });

      setError(null);
      await fetchWorkflowSteps();

      if (status === 'completed' && currentStep < WORKFLOW_STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    } catch (err) {
      setError('Failed to update step status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, stepId) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      setLoading(true);
      await axios.post(`/api/sales/workflow/steps/${stepId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setError(null);
      alert('Documents uploaded successfully!');
      await fetchWorkflowSteps();
    } catch (err) {
      setError('Failed to upload documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < WORKFLOW_STEPS.length) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const getStepStatus = (stepNumber) => {
    const step = workflowSteps.find((s) => s.step_number === stepNumber);
    return step?.status || 'pending';
  };

  const currentStepData = workflowSteps.find((s) => s.step_number === currentStep);
  const StepIcon = WORKFLOW_STEPS[currentStep - 1]?.icon || FileText;

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Step Tracker */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Sales Order Workflow
          </h2>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Step {currentStep} of {WORKFLOW_STEPS.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-6">
          <div
            className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / WORKFLOW_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Step Icons */}
        <div className="grid grid-cols-1 md:grid-cols-9 gap-2 mb-6">
          {WORKFLOW_STEPS.map((step, idx) => {
            const stepStatus = getStepStatus(step.number);
            const isActive = currentStep === step.number;
            const isCompleted = stepStatus === 'completed';
            const isPending = stepStatus === 'pending';

            return (
              <button
                key={step.number}
                onClick={() => setCurrentStep(step.number)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-600'
                    : isCompleted
                    ? 'bg-green-100 dark:bg-green-900'
                    : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-green-600 text-white'
                      : isPending
                      ? 'bg-slate-400 text-white'
                      : 'bg-slate-300 text-slate-600'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{step.number}</span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium text-center line-clamp-2 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : isCompleted
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {step.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      {/* Current Step Content */}
      <Card className="mb-6">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <StepIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {WORKFLOW_STEPS[currentStep - 1].name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-normal">
                Step {currentStep} of {WORKFLOW_STEPS.length}
              </p>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : currentStepData ? (
            <>
              {/* Step Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Current Status
                  </p>
                  <div className="flex items-center gap-2">
                    {currentStepData.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : currentStepData.status === 'in_progress' ? (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-slate-400" />
                    )}
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {currentStepData.status || 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Assigned To
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {currentStepData.assignedEmployee?.username || 'Unassigned'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Assigned Date
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {currentStepData.assigned_at
                      ? new Date(currentStepData.assigned_at).toLocaleDateString()
                      : 'Not assigned'}
                  </p>
                </div>
              </div>

              {/* Assign Employee */}
              {!currentStepData.assigned_employee_id && (
                <div className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                      Assign Employee to this Step
                    </h4>
                  </div>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAssignEmployee(
                          currentStepData.id,
                          parseInt(e.target.value)
                        );
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Document Upload */}
              {(currentStep === 3 || currentStep === 4) && (
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Upload className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                      Upload Documents
                    </h4>
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(e, currentStepData.id)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                  />

                  {/* Uploaded Documents */}
                  {currentStepData.documents && currentStepData.documents.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        Uploaded Documents:
                      </p>
                      <ul className="space-y-2">
                        {(Array.isArray(currentStepData.documents)
                          ? currentStepData.documents
                          : []
                        ).map((doc, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded"
                          >
                            <FileText className="w-4 h-4 text-slate-600" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              {typeof doc === 'string' ? doc : doc.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Step Notes
                </label>
                <textarea
                  value={stepData[currentStep]?.notes || ''}
                  onChange={(e) =>
                    setStepData((prev) => ({
                      ...prev,
                      [currentStep]: {
                        ...prev[currentStep],
                        notes: e.target.value,
                      },
                    }))
                  }
                  rows="4"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder="Add any notes for this step..."
                />
              </div>

              {/* Step Actions */}
              {currentStepData.status !== 'completed' && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleUpdateStepStatus(currentStepData.id, 'in_progress')}
                    disabled={currentStepData.status === 'in_progress'}
                    className="flex-1"
                  >
                    {currentStepData.status === 'in_progress'
                      ? 'In Progress'
                      : 'Start Step'}
                  </Button>
                  <Button
                    onClick={() => handleUpdateStepStatus(currentStepData.id, 'completed')}
                    variant="success"
                    className="flex-1"
                  >
                    Complete Step
                  </Button>
                </div>
              )}

              {currentStepData.status === 'completed' && (
                <div className="p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 dark:text-green-300">
                    This step has been completed on{' '}
                    {new Date(currentStepData.completed_at).toLocaleString()}
                  </span>
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">
              Loading step information...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex gap-3">
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
          {currentStep === WORKFLOW_STEPS.length && getStepStatus(9) === 'completed' && (
            <Button onClick={onComplete} variant="success">
              Complete Workflow
            </Button>
          )}
        </div>

        <Button
          onClick={handleNext}
          disabled={currentStep === WORKFLOW_STEPS.length}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default SalesOrderWizard;
