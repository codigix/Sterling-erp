const { ROOT_CARD_STEPS } = require('./rootCardStepConstants');

const generateStepCode = (stepKey, projectCode) => {
  const step = Object.values(ROOT_CARD_STEPS).find(s => s.key === stepKey);
  if (!step) return null;
  return `${projectCode}-${step.id.toString().padStart(2, '0')}`;
};

const getStepByKey = (stepKey) => {
  return Object.values(ROOT_CARD_STEPS).find(s => s.key === stepKey) || null;
};

const getStepById = (stepId) => {
  return Object.values(ROOT_CARD_STEPS).find(s => s.id === stepId) || null;
};

const getNextStep = (currentStepId) => {
  return Object.values(ROOT_CARD_STEPS).find(s => s.id === currentStepId + 1) || null;
};

const getPreviousStep = (currentStepId) => {
  return Object.values(ROOT_CARD_STEPS).find(s => s.id === currentStepId - 1) || null;
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
  const totalSteps = Object.keys(ROOT_CARD_STEPS).length;
  const completedCount = completedSteps.length;
  return Math.round((completedCount / totalSteps) * 100);
};

const getStepCompletionPercentage = (stepId) => {
  const totalSteps = Object.keys(ROOT_CARD_STEPS).length;
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

const parseJsonField = (value, defaultValue = {}) => {
  if (!value) return defaultValue;
  
  // If it's already an object, return it
  if (typeof value === 'object') {
    // If it's a Buffer (sometimes happens with MySQL JSON fields), convert to string
    if (Buffer.isBuffer(value)) {
      try {
        return JSON.parse(value.toString());
      } catch (e) {
        return defaultValue;
      }
    }
    return value;
  }
  
  // If it's the corrupted "[object Object]" string, return default
  if (value === '[object Object]') {
    console.warn('Detected corrupted JSON string "[object Object]", returning default value');
    return defaultValue;
  }
  
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch (error) {
    console.error('Failed to parse JSON field:', value, error);
    return defaultValue;
  }
};

const ensureArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      return [value];
    }
  }
  return [value];
};

const normalizeStepData = (data, mappings) => {
  const normalized = { ...data };
  
  Object.entries(mappings).forEach(([targetKey, sourcePath]) => {
    if (data[targetKey] !== undefined) return; // Already exists
    
    const parts = sourcePath.split('.');
    let current = data;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        current = undefined;
        break;
      }
    }
    
    if (current !== undefined) {
      normalized[targetKey] = current;
    }
  });
  
  return normalized;
};

const stringifyJsonField = (value) => {
  if (value === null || value === undefined) return null;
  
  // If it's already a valid JSON string, return it as-is
  if (typeof value === 'string') {
    if (value === '[object Object]') {
      console.error('Warning: Attempting to save corrupted "[object Object]" string');
      return null;
    }
    try {
      JSON.parse(value);
      return value;
    } catch (error) {
      // It's a plain string, not a JSON string. 
      // For a JSON column, we should stringify it to make it a valid JSON string.
      return JSON.stringify(value);
    }
  }
  
  // If it's an object or array, stringify it
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error('Failed to stringify value:', value, error);
    return null;
  }
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
    // Check multiple possible price/cost fields
    const price = parseFloat(material.sellingRate || material.selling_rate || material.unitPrice || material.unitCost || material.valuationRate || material.valuation_rate || 0);
    return total + (quantity * price);
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
  ensureArray,
  normalizeStepData,
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
