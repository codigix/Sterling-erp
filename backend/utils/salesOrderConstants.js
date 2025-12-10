const SALES_ORDER_STEPS = {
  CLIENT_PO: {
    id: 1,
    name: 'Client PO',
    type: 'client_po',
    displayName: 'Client Purchase Order',
    description: 'Client PO details and project information'
  },
  SALES_ORDER: {
    id: 2,
    name: 'Sales Order',
    type: 'sales_order',
    displayName: 'Sales Order Details',
    description: 'Sales order specifics and quotation details'
  },
  DESIGN_ENGINEERING: {
    id: 3,
    name: 'Design & Engineering',
    type: 'design_engineering',
    displayName: 'Design & Engineering',
    description: 'Design documents and engineering verification'
  },
  MATERIAL_REQUIREMENT: {
    id: 4,
    name: 'Material Requirement',
    type: 'material_requirement',
    displayName: 'Material Requirements',
    description: 'Material requirements and procurement'
  },
  PRODUCTION_PLAN: {
    id: 5,
    name: 'Production Plan',
    type: 'production_plan',
    displayName: 'Production Planning',
    description: 'Production plan and resource allocation'
  },
  QUALITY_CHECK: {
    id: 6,
    name: 'Quality Check',
    type: 'quality_check',
    displayName: 'Quality Assurance',
    description: 'Quality checks and inspections'
  },
  SHIPMENT: {
    id: 7,
    name: 'Shipment',
    type: 'shipment',
    displayName: 'Shipment & Logistics',
    description: 'Shipment preparation and logistics'
  },
  DELIVERY: {
    id: 8,
    name: 'Delivery',
    type: 'delivery',
    displayName: 'Delivery & Handover',
    description: 'Final delivery and client handover'
  }
};

const STEP_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
  REJECTED: 'rejected'
};

const STEP_SEQUENCE = [
  SALES_ORDER_STEPS.CLIENT_PO.type,
  SALES_ORDER_STEPS.SALES_ORDER.type,
  SALES_ORDER_STEPS.DESIGN_ENGINEERING.type,
  SALES_ORDER_STEPS.MATERIAL_REQUIREMENT.type,
  SALES_ORDER_STEPS.PRODUCTION_PLAN.type,
  SALES_ORDER_STEPS.QUALITY_CHECK.type,
  SALES_ORDER_STEPS.SHIPMENT.type,
  SALES_ORDER_STEPS.DELIVERY.type
];

const MATERIAL_TYPES = {
  PLATE: 'Plate',
  BEAM: 'Beam',
  CHANNEL: 'Channel',
  PIPE: 'Pipe',
  BAR: 'Bar',
  ROLLER_COMPONENTS: 'Roller Movement Components',
  LIFTING_MECHANISMS: 'Lifting/Pulling Mechanisms',
  ELECTRICAL: 'Electrical/Automation',
  SAFETY: 'Safety Materials',
  SURFACE_PREP: 'Surface Prep/Painting',
  FABRICATION: 'Fabrication Consumables',
  HARDWARE: 'Hardware/Misc',
  DOCUMENTATION: 'Documentation Materials',
  MACHINED_PARTS: 'Machined Parts'
};

const QUALITY_CHECK_TYPES = {
  MATERIAL_INSPECTION: 'material_inspection',
  DIMENSIONAL_CHECK: 'dimensional_check',
  SURFACE_FINISH: 'surface_finish',
  FUNCTIONAL_TEST: 'functional_test',
  DOCUMENTATION_REVIEW: 'documentation_review'
};

const SHIPMENT_STATUS = {
  PENDING: 'pending',
  PACKED: 'packed',
  DISPATCHED: 'dispatched',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  RETURNED: 'returned'
};

const DELIVERY_STATUS = {
  PENDING: 'pending',
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  DELIVERED: 'delivered',
  RECEIVED: 'received',
  ISSUES: 'issues'
};

const DOCUMENT_TYPES = {
  QAP: 'qap',
  ATP: 'atp',
  DRAWING: 'drawing',
  PD: 'pd',
  FEA: 'fea',
  SPECIFICATION: 'specification',
  CERTIFICATE: 'certificate',
  OTHER: 'other'
};

module.exports = {
  SALES_ORDER_STEPS,
  STEP_STATUSES,
  STEP_SEQUENCE,
  MATERIAL_TYPES,
  QUALITY_CHECK_TYPES,
  SHIPMENT_STATUS,
  DELIVERY_STATUS,
  DOCUMENT_TYPES
};
