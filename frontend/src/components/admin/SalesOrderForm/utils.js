export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhone = (phone) => {
  return /^\d{10}$/.test(phone.replace(/\D/g, ""));
};

export const validateRequired = (value) => {
  return value && value.trim() !== "";
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value || 0);
};

export const calculateTotal = (quantity, unitPrice, discount = 0) => {
  if (!quantity || !unitPrice) return 0;
  const subtotal = Number(quantity) * Number(unitPrice);
  return subtotal - (subtotal * Number(discount)) / 100;
};

export const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-IN");
};

export const validateStep1 = (formData) => {
  const errors = [];
  if (!validateRequired(formData.clientName)) {
    errors.push("Client name is required");
  }
  if (!validateRequired(formData.poNumber)) {
    errors.push("PO number is required");
  }
  if (!validateRequired(formData.projectName)) {
    errors.push("Project name is required");
  }
  if (formData.clientEmail && !validateEmail(formData.clientEmail)) {
    errors.push("Valid email is required");
  }
  if (formData.clientPhone && !validatePhone(formData.clientPhone)) {
    errors.push("Valid 10-digit phone is required");
  }
  return errors;
};

export const validateStep2 = (formData) => {
  const errors = [];
  if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
    errors.push("Total amount must be greater than 0");
  }
  return errors;
};


export const validateStep3 = (formData) => {
  const errors = [];
  
  const hasDrawings = formData.designEngineering?.attachments?.drawings?.length > 0;
  const hasDocuments = formData.designEngineering?.attachments?.documents?.length > 0;
  
  if (!hasDrawings && !hasDocuments) {
    errors.push("Please upload at least one design document or drawing");
  }
  
  return errors;
};

export const validateStep4 = (formData) => {
  const errors = [];
  return errors;
};

export const validateStep5 = (formData) => {
  const errors = [];
  return errors;
};

export const validateStep6 = (formData) => {
  const errors = [];
  return errors;
};

export const validateStep7 = (formData) => {
  const errors = [];
  return errors;
};

export const validateStep8 = (formData) => {
  const errors = [];
  return errors;
};
