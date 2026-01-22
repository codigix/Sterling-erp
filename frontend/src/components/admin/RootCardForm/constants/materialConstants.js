export const materialUnits = [
  { key: "kg", value: "kg", label: "Kilogram (kg)" },
  { key: "ton", value: "ton", label: "Ton" },
  { key: "m", value: "m", label: "Meter (m)" },
  { key: "mm", value: "mm", label: "Millimeter (mm)" },
  { key: "piece", value: "piece", label: "Piece" },
  { key: "set", value: "set", label: "Set" },
];

export const materialSources = [
  { key: "local", value: "local", label: "Local" },
  { key: "imported", value: "imported", label: "Imported" },
  { key: "vendor", value: "vendor", label: "Vendor" },
];

export const STEEL_SECTION_CATEGORY_FIELDS = {
  "ISMB Beams (100–500 mm)": [
    { name: "ismbBeamSize", label: "Beam Size", placeholder: "e.g., ISMB 200" },
    { name: "ismbFlangeWidth", label: "Flange Width (optional)", placeholder: "e.g., 100 mm" },
    { name: "ismbWebThickness", label: "Web Thickness (optional)", placeholder: "e.g., 8 mm" },
    { name: "ismbSectionWeight", label: "Section Weight (kg/m)", placeholder: "e.g., 26.2" },
  ],
  "ISMC Channels (75–400 mm)": [
    { name: "ismcChannelSize", label: "Channel Size", placeholder: "e.g., ISMC 75" },
    { name: "ismcFlangeWidth", label: "Flange Width", placeholder: "e.g., 40 mm" },
    { name: "ismcWebThickness", label: "Web Thickness", placeholder: "e.g., 6 mm" },
  ],
  "RHS / SHS box sections": [
    { name: "rhsSectionType", label: "Section Type", placeholder: "RHS / SHS" },
    { name: "rhsDimensions", label: "Dimensions", placeholder: "e.g., 100×50 or 50×50" },
    { name: "rhsThickness", label: "Thickness (mm)", placeholder: "e.g., 3 mm" },
    { name: "rhsLength", label: "Length (mm)", placeholder: "e.g., 6000" },
  ],
  "Angles (equal/unequal)": [
    { name: "angleType", label: "Type", placeholder: "Equal / Unequal" },
    { name: "angleSize", label: "Size", placeholder: "e.g., 50×50×6, 65×50×6" },
    { name: "angleThickness", label: "Thickness (mm)", placeholder: "e.g., 6" },
  ],
  "Flat bars": [
    { name: "flatBarWidth", label: "Width (mm)", placeholder: "e.g., 50 mm" },
    { name: "flatBarThickness", label: "Thickness (mm)", placeholder: "e.g., 10 mm" },
  ],
  "Round bars": [
    { name: "roundBarDiameter", label: "Diameter (mm)", placeholder: "e.g., 25 mm" },
  ],
};

export const PLATE_CATEGORY_FIELDS = {
  "MS plates (5mm – 40mm)": [
    { name: "msThickness", label: "Thickness (mm)", placeholder: "e.g., 10 mm" },
    { name: "msLength", label: "Length (mm)", placeholder: "e.g., 2000" },
    { name: "msWidth", label: "Width (mm)", placeholder: "e.g., 1000" },
    { name: "msMaterialGrade", label: "Material Grade", placeholder: "e.g., E250, E350" },
    { name: "msWeight", label: "Weight (auto)", placeholder: "Auto-calculated" },
  ],
  "Chequered plates (if flooring needed)": [
    { name: "chequeredThickness", label: "Thickness (mm)", placeholder: "e.g., 5 mm" },
    { name: "chequeredLength", label: "Length (mm)", placeholder: "e.g., 2000" },
    { name: "chequeredWidth", label: "Width (mm)", placeholder: "e.g., 1000" },
    { name: "chequeredPatternType", label: "Pattern Type", placeholder: "e.g., 5-bar, Diamond" },
    { name: "chequeredMaterialGrade", label: "Material Grade", placeholder: "e.g., E250, E350" },
  ],
  "Base plates (thick 20–50mm)": [
    { name: "baseThickness", label: "Thickness (mm)", placeholder: "e.g., 25 mm" },
    { name: "baseLength", label: "Length (mm)", placeholder: "e.g., 500" },
    { name: "baseWidth", label: "Width (mm)", placeholder: "e.g., 500" },
    { name: "baseMaterialGrade", label: "Material Grade", placeholder: "e.g., E350, E450" },
    { name: "baseMachiningRequired", label: "Machining Required?", placeholder: "Yes / No" },
  ],
};
