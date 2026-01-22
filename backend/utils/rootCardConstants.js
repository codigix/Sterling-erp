const ROOT_CARD_STEPS = {
  CLIENT_PO: {
    id: 1,
    name: 'Client PO',
    type: 'client_po',
    displayName: 'Client Purchase Order',
    description: 'Client PO details and project information'
  },
  DESIGN_ENGINEERING: {
    id: 2,
    name: 'Design & Engineering',
    type: 'design_engineering',
    displayName: 'Design & Engineering',
    description: 'Design documents and engineering verification'
  },
  MATERIAL_REQUIREMENT: {
    id: 3,
    name: 'Material Requirement',
    type: 'material_requirement',
    displayName: 'Material Requirements',
    description: 'Material requirements and procurement'
  },
  PRODUCTION_PLAN: {
    id: 4,
    name: 'Production Plan',
    type: 'production_plan',
    displayName: 'Production Planning',
    description: 'Production plan and resource allocation'
  },
  QUALITY_CHECK: {
    id: 5,
    name: 'Quality Check',
    type: 'quality_check',
    displayName: 'Quality Assurance',
    description: 'Quality checks and inspections'
  },
  SHIPMENT: {
    id: 6,
    name: 'Shipment',
    type: 'shipment',
    displayName: 'Shipment & Logistics',
    description: 'Shipment preparation and logistics'
  },
  DELIVERY: {
    id: 7,
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
  ROOT_CARD_STEPS.CLIENT_PO.type,
  ROOT_CARD_STEPS.DESIGN_ENGINEERING.type,
  ROOT_CARD_STEPS.MATERIAL_REQUIREMENT.type,
  ROOT_CARD_STEPS.PRODUCTION_PLAN.type,
  ROOT_CARD_STEPS.QUALITY_CHECK.type,
  ROOT_CARD_STEPS.SHIPMENT.type,
  ROOT_CARD_STEPS.DELIVERY.type
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
  ROOT_CARD_STEPS,
  STEP_STATUSES,
  STEP_SEQUENCE,
  MATERIAL_TYPES,
  QUALITY_CHECK_TYPES,
  SHIPMENT_STATUS,
  DELIVERY_STATUS,
  DOCUMENT_TYPES
};
