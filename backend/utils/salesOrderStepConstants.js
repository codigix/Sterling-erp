const SALES_ORDER_STEPS = {
  CLIENT_PO: {
    id: 1,
    name: 'Client PO',
    key: 'clientPO',
    displayName: 'Client PO Information',
    status: 'client_po_pending',
    completedStatus: 'client_po_completed'
  },
  SALES_ORDER: {
    id: 2,
    name: 'Sales Order',
    key: 'salesOrder',
    displayName: 'Root Card Details',
    status: 'sales_order_pending',
    completedStatus: 'sales_order_completed'
  },
  DESIGN_ENGINEERING: {
    id: 3,
    name: 'Design Engineering',
    key: 'designEngineering',
    displayName: 'Design & Engineering',
    status: 'design_pending',
    completedStatus: 'design_completed'
  },
  MATERIAL_REQUIREMENTS: {
    id: 4,
    name: 'Material Requirements',
    key: 'materialRequirements',
    displayName: 'Material Requirements',
    status: 'material_pending',
    completedStatus: 'material_completed'
  },
  PRODUCTION_PLAN: {
    id: 5,
    name: 'Production Plan',
    key: 'productionPlan',
    displayName: 'Production Plan',
    status: 'production_plan_pending',
    completedStatus: 'production_plan_completed'
  },
  QUALITY_CHECK: {
    id: 6,
    name: 'Quality Check',
    key: 'qualityCheck',
    displayName: 'Quality Control',
    status: 'qc_pending',
    completedStatus: 'qc_completed'
  },
  SHIPMENT: {
    id: 7,
    name: 'Shipment',
    key: 'shipment',
    displayName: 'Shipment Details',
    status: 'shipment_pending',
    completedStatus: 'shipment_completed'
  },
  DELIVERY: {
    id: 8,
    name: 'Delivery',
    key: 'delivery',
    displayName: 'Delivery Information',
    status: 'delivery_pending',
    completedStatus: 'delivery_completed'
  }
};

const STEP_STATUS_ENUM = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

const DESIGN_DOCUMENT_TYPES = {
  QAP: 'QAP',
  ATP: 'ATP',
  DRAWINGS: 'Drawings',
  PD: 'PD',
  FEA: 'FEA'
};

const MATERIAL_TYPES = [
  'rollerMovementComponents',
  'liftingPullingMechanisms',
  'electricalAutomation',
  'safetyMaterials',
  'surfacePrepPainting',
  'fabricationConsumables',
  'hardwareMisc',
  'documentationMaterials',
  'machinedParts',
  'steelSections',
  'plates',
  'materialGrades',
  'fasteners'
];

const PRODUCTION_PHASES = {
  ASSEMBLY: 'Assembly',
  FABRICATION: 'Fabrication',
  MACHINING: 'Machining',
  TESTING: 'Testing',
  FINISHING: 'Finishing',
  PAINTING: 'Painting',
  WELDING: 'Welding',
  OUTSOURCED_WORK: 'Outsourced Work'
};

const QC_INSPECTION_TYPES = {
  INCOMING: 'incoming',
  IN_PROCESS: 'in_process',
  FINAL: 'final'
};

const QC_RESULT_TYPES = {
  PASSED: 'passed',
  FAILED: 'failed',
  CONDITIONAL: 'conditional'
};

const SHIPMENT_STATUS = {
  READY: 'ready',
  DISPATCHED: 'dispatched',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

const DELIVERY_STATUS = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  COMPLETE: 'complete',
  SIGNED: 'signed',
  CANCELLED: 'cancelled'
};

module.exports = {
  SALES_ORDER_STEPS,
  STEP_STATUS_ENUM,
  PRIORITY_LEVELS,
  DESIGN_DOCUMENT_TYPES,
  MATERIAL_TYPES,
  PRODUCTION_PHASES,
  QC_INSPECTION_TYPES,
  QC_RESULT_TYPES,
  SHIPMENT_STATUS,
  DELIVERY_STATUS
};
