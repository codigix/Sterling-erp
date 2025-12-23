export const getStatusColor = (status) => {
  switch (status) {
    case "Excellent":
      return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
    case "Good":
      return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400";
    case "Average":
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400";
    case "Poor":
      return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
    default:
      return "text-slate-600 bg-slate-100 dark: dark:text-slate-400";
  }
};

export const getQualityColor = (rating) => {
  if (rating >= 4.5) return "text-green-600";
  if (rating >= 4.0) return "text-blue-600";
  if (rating >= 3.5) return "text-yellow-600";
  return "text-red-600";
};

export const getDelayStatusColor = (status) => {
  switch (status) {
    case "On Track":
      return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
    case "Delayed":
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400";
    case "Critical Delay":
      return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
    default:
      return "text-slate-600 bg-slate-100 dark: dark:text-slate-400";
  }
};

export const getBottleneckImpactColor = (impact) => {
  switch (impact) {
    case "Critical":
      return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
    case "High":
      return "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-400";
    case "Medium":
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400";
    case "Low":
      return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
    default:
      return "text-slate-600 bg-slate-100 dark: dark:text-slate-400";
  }
};

export const getMaterialStatusColor = (status) => {
  switch (status) {
    case "Optimal":
      return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
    case "Low Stock":
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400";
    case "Critical":
      return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
    case "Overstock":
      return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400";
    default:
      return "text-slate-600 bg-slate-100 dark: dark:text-slate-400";
  }
};

export const getMovementTypeColor = (type) => {
  switch (type) {
    case "Inbound":
      return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
    case "Outbound":
      return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
    case "Transfer":
      return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400";
    default:
      return "text-slate-600 bg-slate-100 dark: dark:text-slate-400";
  }
};

export const getResourceStatusColor = (status) => {
  switch (status) {
    case "Optimal":
      return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
    case "High Utilization":
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400";
    case "Critical":
      return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
    default:
      return "text-slate-600 bg-slate-100 dark: dark:text-slate-400";
  }
};

export const getImpactColor = (impact) => {
  switch (impact) {
    case "Critical":
      return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
    case "High":
      return "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-400";
    case "Medium":
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400";
    case "Low":
      return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
    default:
      return "text-slate-600 bg-slate-100 dark: dark:text-slate-400";
  }
};

export const getPerformanceColor = (status) => {
  switch (status) {
    case "Excellent":
      return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
    case "Good":
      return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400";
    case "Average":
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400";
    case "Poor":
      return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400";
    default:
      return "text-slate-600 bg-slate-100 dark: dark:text-slate-400";
  }
};

export const getStockLevel = (current, min, max) => {
  const percentage = (current / max) * 100;
  if (current <= min) return { level: "Critical", color: "bg-red-500", percentage };
  if (current <= min * 1.2) return { level: "Low", color: "bg-yellow-500", percentage };
  if (current >= max * 0.9) return { level: "High", color: "bg-blue-500", percentage };
  return { level: "Optimal", color: "bg-green-500", percentage };
};
