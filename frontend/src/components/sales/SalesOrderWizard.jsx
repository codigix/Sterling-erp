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

      setError(null);
      alert('Employee assigned successfully and task added to their dashboard!');
      
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
    <div className="w-full bg-white min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="border-b border-slate-200 pb-8">
          <div className="flex items-center text-xs justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Sales Order Workflow</h1>
              <p className="text-slate-600">
                Managing order: <span className="font-semibold text-slate-900">Step {currentStep} of {WORKFLOW_STEPS.length}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600">{Math.round((currentStep / WORKFLOW_STEPS.length) * 100)}%</div>
              <p className="text-sm text-slate-600">Progress</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / WORKFLOW_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Tracker Cards */}
        <div className="bg-gradient-to-b from-slate-50 to-white rounded-xl  border border-slate-200 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-3">
            {WORKFLOW_STEPS.map((step) => {
              const stepStatus = getStepStatus(step.number);
              const isActive = currentStep === step.number;
              const isCompleted = stepStatus === 'completed';

              return (
                <button
                  key={step.number}
                  onClick={() => setCurrentStep(step.number)}
                  className={`group relative p-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-300'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:border-emerald-300'
                      : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center text-xs justify-center font-bold transition-all ${
                        isActive
                          ? 'bg-white text-purple-600'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : ' text-slate-600'
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <span>{step.number}</span>}
                    </div>
                    <span className="text-xs text-center line-clamp-2 leading-tight">{step.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-xs gap-3 animate-pulse">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        )}

        {/* Main Content Card */}
        <Card className="border border-slate-200 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-slate-200">
            <CardTitle className="flex items-center text-xs gap-4">
              <div className="p-4 bg-purple-600 text-white rounded-lg">
                <StepIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 text-black">
                  {WORKFLOW_STEPS[currentStep - 1]?.name}
                </h2>
                <p className="text-sm text-slate-600 font-normal mt-1">
                  Step {currentStep} of {WORKFLOW_STEPS.length}
                </p>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
                <p className="text-slate-600 font-medium">Loading workflow data...</p>
              </div>
            ) : currentStepData ? (
              <>
                {/* Step Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center text-xs justify-between mb-3">
                      <p className="text-sm font-semibold text-slate-700">Current Status</p>
                      {currentStepData.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : currentStepData.status === 'in_progress' ? (
                        <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                      ) : (
                        <Clock className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <p className="font-bold text-slate-900 capitalize">
                      {currentStepData.status || 'Pending'}
                    </p>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Assigned To</p>
                    <p className="font-bold text-slate-900">
                      {currentStepData.assignedEmployee?.username || (
                        <span className="text-slate-500">Not assigned</span>
                      )}
                    </p>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Assigned Date</p>
                    <p className="font-bold text-slate-900">
                      {currentStepData.assigned_at
                        ? new Date(currentStepData.assigned_at).toLocaleDateString()
                        : <span className="text-slate-500">Not assigned</span>}
                    </p>
                  </div>
                </div>

                {/* Assign Employee Section */}
                {!currentStepData.assigned_employee_id && (
                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 bg-purple-50">
                    <div className="flex items-center text-xs gap-3 mb-5">
                      <div className="p-3 bg-purple-600 text-white rounded-lg">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">Assign Employee</h4>
                        <p className="text-sm text-slate-600">Assign this step to a team member</p>
                      </div>
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
                      className="w-full p-2 border border-purple-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
                    >
                      <option value="">Select an employee...</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName} ({emp.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Document Upload Section */}
                {(currentStep === 3 || currentStep === 4) && (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 bg-slate-50">
                    <div className="flex items-center text-xs gap-3 mb-5">
                      <div className="p-3 bg-slate-600 text-white rounded-lg">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">Upload Documents</h4>
                        <p className="text-sm text-slate-600">Drag and drop or select files</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileUpload(e, currentStepData.id)}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />

                    {/* Uploaded Documents List */}
                    {currentStepData.documents && currentStepData.documents.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-slate-200">
                        <p className="text-sm font-semibold text-slate-900 mb-4">
                          📁 Uploaded Documents ({currentStepData.documents.length})
                        </p>
                        <ul className="space-y-2">
                          {(Array.isArray(currentStepData.documents)
                            ? currentStepData.documents
                            : []
                          ).map((doc, idx) => (
                            <li
                              key={idx}
                              className="flex items-center text-xs gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                            >
                              <FileText className="w-5 h-5 text-purple-600 flex-shrink-0" />
                              <span className="text-sm text-slate-700 font-medium">
                                {typeof doc === 'string' ? doc : doc.name}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes Section */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-900">
                    Step Notes & Comments
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
                    rows="5"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Add any relevant notes for this workflow step..."
                  />
                </div>

                {/* Step Actions */}
                {currentStepData.status !== 'completed' && (
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => handleUpdateStepStatus(currentStepData.id, 'in_progress')}
                      disabled={currentStepData.status === 'in_progress'}
                      className="flex-1 px-6 py-3 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors font-semibold border border-slate-300"
                    >
                      {currentStepData.status === 'in_progress'
                        ? '⏱️ In Progress'
                        : '▶️ Start Step'}
                    </button>
                    <button
                      onClick={() => handleUpdateStepStatus(currentStepData.id, 'completed')}
                      className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                    >
                      ✓ Complete Step
                    </button>
                  </div>
                )}

                {currentStepData.status === 'completed' && (
                  <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center text-xs gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-emerald-900">Step Completed</p>
                      <p className="text-sm text-emerald-700">
                        on {new Date(currentStepData.completed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600 font-medium">Loading step information...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Footer */}
        <div className="flex items-center text-xs justify-between gap-4 pt-8 border-t border-slate-200">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors flex items-center text-xs gap-2 font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-3 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
            >
              Cancel
            </button>
            {currentStep === WORKFLOW_STEPS.length && getStepStatus(9) === 'completed' && (
              <button
                onClick={onComplete}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold shadow-md hover:shadow-lg"
              >
                ✓ Complete Workflow
              </button>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={currentStep === WORKFLOW_STEPS.length}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center text-xs gap-2 font-semibold shadow-md hover:shadow-lg"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderWizard;
