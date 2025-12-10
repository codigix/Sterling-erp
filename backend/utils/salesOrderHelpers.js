const { SALES_ORDER_STEPS } = require('./salesOrderStepConstants');

const generateStepCode = (stepKey, projectCode) => {
  const step = Object.values(SALES_ORDER_STEPS).find(s => s.key === stepKey);
  if (!step) return null;
  return `${projectCode}-${step.id.toString().padStart(2, '0')}`;
};

const getStepByKey = (stepKey) => {
  return Object.values(SALES_ORDER_STEPS).find(s => s.key === stepKey) || null;
};

const getStepById = (stepId) => {
  return Object.values(SALES_ORDER_STEPS).find(s => s.id === stepId) || null;
};

const getNextStep = (currentStepId) => {
  return Object.values(SALES_ORDER_STEPS).find(s => s.id === currentStepId + 1) || null;
};

const getPreviousStep = (currentStepId) => {
  return Object.values(SALES_ORDER_STEPS).find(s => s.id === currentStepId - 1) || null;
};

const formatStepResponse = (step, data) => {
  return {
    step: {
      id: step.id,
      name: step.name,
      key: step.key,
      displayName: step.displayName
    },
    data,
    timestamp: new Date().toISOString()
  };
};

const calculateProjectProgress = (completedSteps) => {
  const totalSteps = Object.keys(SALES_ORDER_STEPS).length;
  const completedCount = completedSteps.length;
  return Math.round((completedCount / totalSteps) * 100);
};

const getStepCompletionPercentage = (stepId) => {
  const totalSteps = Object.keys(SALES_ORDER_STEPS).length;
  return Math.round((stepId / totalSteps) * 100);
};

const formatErrorResponse = (errors) => {
  return {
    success: false,
    errors: Array.isArray(errors) ? errors : [errors],
    timestamp: new Date().toISOString()
  };
};

const formatSuccessResponse = (data, message = 'Operation successful') => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

const parseJsonField = (value, defaultValue = null) => {
  if (!value) return defaultValue;
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch (error) {
    return defaultValue;
  }
};

const stringifyJsonField = (value) => {
  if (!value) return null;
  return typeof value === 'string' ? value : JSON.stringify(value);
};

const generateDocumentFileName = (stepKey, projectCode, originalFileName) => {
  const timestamp = Date.now();
  const extension = originalFileName.split('.').pop();
  return `${projectCode}-${stepKey}-${timestamp}.${extension}`;
};

const calculateMaterialCost = (materials) => {
  if (!Array.isArray(materials)) return 0;
  return materials.reduce((total, material) => {
    const quantity = parseFloat(material.quantity) || 0;
    const unitPrice = parseFloat(material.unitPrice) || 0;
    return total + (quantity * unitPrice);
  }, 0);
};

const formatCurrency = (amount, currency = 'INR') => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return formatter.format(amount);
};

const getStepStatusColor = (status) => {
  const statusColors = {
    'pending': '#f59e0b',
    'in_progress': '#3b82f6',
    'completed': '#10b981',
    'approved': '#10b981',
    'rejected': '#ef4444',
    'on_hold': '#6366f1'
  };
  return statusColors[status] || '#6b7280';
};

const buildStepTimeline = (steps) => {
  return steps.map((step) => ({
    id: step.id,
    name: step.name,
    status: step.status,
    startDate: step.startDate || null,
    endDate: step.endDate || null,
    duration: calculateDuration(step.startDate, step.endDate),
    assignedTo: step.assignedTo || null
  }));
};

const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end;
};

const getWorkingDays = (startDate, endDate) => {
  let count = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
};

module.exports = {
  generateStepCode,
  getStepByKey,
  getStepById,
  getNextStep,
  getPreviousStep,
  formatStepResponse,
  calculateProjectProgress,
  getStepCompletionPercentage,
  formatErrorResponse,
  formatSuccessResponse,
  parseJsonField,
  stringifyJsonField,
  generateDocumentFileName,
  calculateMaterialCost,
  formatCurrency,
  getStepStatusColor,
  buildStepTimeline,
  calculateDuration,
  validateDateRange,
  getWorkingDays
};
