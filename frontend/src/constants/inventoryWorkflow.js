export const INVENTORY_WORKFLOW = {
  name: 'Complete Inventory Management Workflow',
  description: 'End-to-end workflow from material requirements check through inventory management',
  phases: [
    {
      id: 'quotation',
      name: 'Planning & Quotation',
      description: 'Material requirements review and quotation request',
      color: 'blue'
    },
    {
      id: 'purchase',
      name: 'Purchase Phase',
      description: 'Purchase order creation and dispatch',
      color: 'purple'
    },
    {
      id: 'receipt',
      name: 'Receipt Phase',
      description: 'Material receipt and PO approval',
      color: 'indigo'
    },
    {
      id: 'quality',
      name: 'Quality Phase',
      description: 'GRN processing and QC inspection',
      color: 'amber'
    },
    {
      id: 'storage',
      name: 'Storage Phase',
      description: 'Stock storage and reorder management',
      color: 'green'
    },
    {
      id: 'usage',
      name: 'Usage Phase',
      description: 'Stock tracking and movements',
      color: 'cyan'
    }
  ],
  steps: [
    {
      id: 1,
      title: 'Check Project Material Requirements',
      description: 'Review and verify all material requirements for the project from procurement',
      phase: 'quotation',
      category: 'Material Planning',
      page: '/procurement/material-requirements',
      icon: 'FileText',
      priority: 'critical',
      order: 1,
    },
    {
      id: 2,
      title: 'Create RFQ Quotation',
      description: 'Create Request for Quotation (RFQ) for required materials from vendors',
      phase: 'quotation',
      category: 'Procurement',
      page: '/inventory-manager/quotations',
      icon: 'FileText',
      priority: 'high',
      order: 2,
    },
    {
      id: 3,
      title: 'Send Quotation to Vendor',
      description: 'Send RFQ quotation to vendor via email',
      phase: 'quotation',
      category: 'Procurement',
      page: '/inventory-manager/quotations',
      icon: 'Mail',
      priority: 'high',
      order: 3,
    },
    {
      id: 4,
      title: 'Receive Vendor Quotation',
      description: 'Receive and review vendor quotation response',
      phase: 'purchase',
      category: 'Procurement',
      page: '/inventory-manager/quotations',
      icon: 'CheckCircle',
      priority: 'high',
      order: 4,
    },
    {
      id: 5,
      title: 'Create Purchase Order',
      description: 'Create Purchase Order based on vendor quotation',
      phase: 'purchase',
      category: 'Procurement',
      page: '/inventory-manager/purchase-orders',
      icon: 'Package',
      priority: 'high',
      order: 5,
    },
    {
      id: 6,
      title: 'Send PO to Vendor',
      description: 'Send Purchase Order to vendor via email',
      phase: 'purchase',
      category: 'Procurement',
      page: '/inventory-manager/purchase-orders',
      icon: 'Mail',
      priority: 'high',
      order: 6,
    },
    {
      id: 7,
      title: 'Approve Purchase Order',
      description: 'Approve PO before material receipt',
      phase: 'purchase',
      category: 'Procurement',
      page: '/inventory-manager/purchase-orders',
      icon: 'CheckCircle',
      priority: 'high',
      order: 7,
    },
    {
      id: 8,
      title: 'Receive Material',
      description: 'Receive material from vendor at warehouse',
      phase: 'receipt',
      category: 'Receiving',
      page: '/inventory-manager/purchase-orders',
      icon: 'TrendingDown',
      priority: 'high',
      order: 8,
    },
    {
      id: 9,
      title: 'GRN Processing',
      description: 'Process Goods Receipt Note (GRN) for received material',
      phase: 'quality',
      category: 'Quality Control',
      page: '/inventory-manager/grn-processing',
      icon: 'CheckCircle',
      priority: 'high',
      order: 9,
    },
    {
      id: 10,
      title: 'QC Inspection',
      description: 'Perform quality control inspection (accept/reject)',
      phase: 'quality',
      category: 'Quality Control',
      page: '/inventory-manager/grn-processing',
      icon: 'CheckCircle',
      priority: 'high',
      order: 10,
    },
    {
      id: 11,
      title: 'Stock Addition',
      description: 'Add inspected materials to stock inventory',
      phase: 'storage',
      category: 'Stock Management',
      page: '/inventory-manager/grn-processing',
      icon: 'Package',
      priority: 'high',
      order: 11,
    },
    {
      id: 12,
      title: 'Release Material',
      description: 'Release material to production or departments',
      phase: 'usage',
      category: 'Stock Management',
      page: '/inventory-manager/material-requests',
      icon: 'Zap',
      priority: 'high',
      order: 12,
    },
  ]
};

export const generateWorkflowTasks = (rootCardData, roleId = 2) => {
  return INVENTORY_WORKFLOW.steps.map((step, index) => ({
    title: step.title,
    description: step.description,
    priority: step.priority,
    status: 'pending',
    roleId: roleId,
    rootCardId: rootCardData?.id,
    project: rootCardData?.project || {},
    notes: JSON.stringify({
      workflow_step: index + 1,
      total_steps: INVENTORY_WORKFLOW.steps.length,
      category: step.category,
      page: step.page,
      icon: step.icon,
      phase: step.phase,
    }),
  }));
};

export const getWorkflowStep = (stepNumber) => {
  return INVENTORY_WORKFLOW.steps[stepNumber - 1] || null;
};
