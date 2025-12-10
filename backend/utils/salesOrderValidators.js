const validateClientPO = (data) => {
  const errors = [];

  if (!data.poNumber || !data.poNumber.trim()) {
    errors.push('PO Number is required');
  }

  if (!data.poDate) {
    errors.push('PO Date is required');
  }

  if (!data.clientName || !data.clientName.trim()) {
    errors.push('Client Name is required');
  }

  if (!data.clientEmail || !data.clientEmail.trim()) {
    errors.push('Client Email is required');
  }

  if (data.clientEmail && !isValidEmail(data.clientEmail)) {
    errors.push('Invalid email format');
  }

  if (!data.clientPhone || !data.clientPhone.trim()) {
    errors.push('Client Phone is required');
  }

  if (!data.projectName || !data.projectName.trim()) {
    errors.push('Project Name is required');
  }

  if (!data.projectCode || !data.projectCode.trim()) {
    errors.push('Project Code is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateSalesOrder = (data) => {
  const errors = [];

  if (!data.clientEmail || !isValidEmail(data.clientEmail)) {
    errors.push('Valid Client Email is required');
  }

  if (!data.clientPhone || !data.clientPhone.trim()) {
    errors.push('Client Phone is required');
  }

  if (!data.estimatedEndDate) {
    errors.push('Estimated End Date is required');
  }

  if (!data.billingAddress || !data.billingAddress.trim()) {
    errors.push('Billing Address is required');
  }

  if (!data.shippingAddress || !data.shippingAddress.trim()) {
    errors.push('Shipping Address is required');
  }

  if (!data.productDetails || !data.productDetails.itemName) {
    errors.push('Item Name is required');
  }

  if (!data.productDetails || !data.productDetails.itemDescription) {
    errors.push('Item Description is required');
  }

  if (!data.productDetails || !data.productDetails.quantity || data.productDetails.quantity <= 0) {
    errors.push('Valid Quantity is required');
  }

  if (!data.productDetails || !data.productDetails.unitPrice || data.productDetails.unitPrice <= 0) {
    errors.push('Valid Unit Price is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateDesignEngineering = (data) => {
  const errors = [];

  if (!data.documents || data.documents.length === 0) {
    errors.push('At least one document is required');
  }

  if (data.documents && data.documents.length > 0) {
    const validTypes = ['QAP', 'ATP', 'Drawings', 'PD', 'FEA'];
    data.documents.forEach((doc, index) => {
      if (!doc.type || !validTypes.includes(doc.type)) {
        errors.push(`Document ${index + 1}: Invalid document type`);
      }
      if (!doc.filePath || !doc.filePath.trim()) {
        errors.push(`Document ${index + 1}: File path is required`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateMaterialRequirements = (data) => {
  const errors = [];

  if (!data.materials || data.materials.length === 0) {
    errors.push('At least one material is required');
  }

  if (data.materials && data.materials.length > 0) {
    data.materials.forEach((material, index) => {
      const quantity = parseFloat(material.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        errors.push(`Material ${index + 1}: Valid Quantity is required`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateProductionPlan = (data) => {
  const errors = [];

  if (!data.timeline || !data.timeline.startDate) {
    errors.push('Start Date is required');
  }

  if (!data.timeline || !data.timeline.endDate) {
    errors.push('End Date is required');
  }

  if (data.timeline && data.timeline.startDate && data.timeline.endDate) {
    if (new Date(data.timeline.startDate) >= new Date(data.timeline.endDate)) {
      errors.push('End Date must be after Start Date');
    }
  }

  if (!data.selectedPhases || Object.keys(data.selectedPhases).length === 0) {
    errors.push('At least one production phase is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateQualityCheck = (data) => {
  const errors = [];

  if (data.inspections && data.inspections.length > 0) {
    data.inspections.forEach((inspection, index) => {
      if (!inspection.parameter || !inspection.parameter.trim()) {
        errors.push(`Inspection ${index + 1}: Parameter is required`);
      }
      if (!inspection.result || !['passed', 'failed', 'conditional'].includes(inspection.result)) {
        errors.push(`Inspection ${index + 1}: Valid Result is required`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateShipment = (data) => {
  const errors = [];

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateDelivery = (data) => {
  const errors = [];
  const warnings = [];

  const validStatuses = ['pending', 'in_progress', 'delivered', 'failed', 'partial', 'complete', 'signed', 'cancelled'];
  if (data.deliveryStatus && !validStatuses.includes(data.deliveryStatus)) {
    errors.push('Invalid delivery status');
  }

  if (data.deliveryStatus === 'partial' && (!data.deliveredQuantity || data.deliveredQuantity <= 0)) {
    errors.push('Delivered Quantity is required for partial deliveries');
  }

  if ((data.deliveryStatus === 'delivered' || data.deliveryStatus === 'complete') && !data.actualDeliveryDate) {
    warnings.push('Actual delivery date should be set for completed deliveries');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  validateClientPO,
  validateSalesOrder,
  validateDesignEngineering,
  validateMaterialRequirements,
  validateProductionPlan,
  validateQualityCheck,
  validateShipment,
  validateDelivery
};
