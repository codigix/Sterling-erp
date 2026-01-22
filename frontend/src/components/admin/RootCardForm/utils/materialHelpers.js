export const quantityPlaceholders = {
  steelSection: "e.g., 10",
  plateType: "e.g., 5",
  materialGrade: "e.g., 100",
  fastenerType: "e.g., 500",
};

export const defaultQualityPlaceholder = "e.g., A Grade, Premium";

export const SPEC_TYPES = [
  "machinedParts",
  "rollerMovementComponents",
  "liftingPullingMechanisms",
  "electricalAutomation",
  "safetyMaterials",
  "surfacePrepPainting",
  "fabricationConsumables",
  "hardwareMisc",
  "documentationMaterials",
];

export const getQuantityPlaceholder = (materialType) => {
  return quantityPlaceholders[materialType] || "e.g., 10";
};

export const getTitleForSpecType = (type) => {
  const titleMap = {
    steelSection: "Steel Section Specifications",
    plateType: "Plate Type Specifications",
    materialGrade: "Material Grade Specifications",
    fastenerType: "Fastener Type Specifications",
    machinedParts: "Machined Parts Specifications",
    rollerMovementComponents: "Roller/Movement Components Specifications",
    liftingPullingMechanisms: "Lifting/Pulling Mechanisms Specifications",
    electricalAutomation: "Electrical & Automation Specifications",
    safetyMaterials: "Safety Materials Specifications",
    surfacePrepPainting: "Surface Prep & Painting Specifications",
    fabricationConsumables: "Fabrication Consumables Specifications",
    hardwareMisc: "Hardware & Misc Specifications",
    documentationMaterials: "Documentation Materials Specifications",
  };
  return titleMap[type] || "Material Specifications";
};
