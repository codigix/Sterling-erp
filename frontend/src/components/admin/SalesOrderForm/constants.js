import {
  FileText,
  Zap,
  Package,
  Check,
  Truck,
  CheckCircle,
} from "lucide-react";

export const WIZARD_STEPS = [
  { number: 1, name: "Client PO", icon: FileText },
  { number: 2, name: "Sales Order", icon: Zap },
  { number: 3, name: "Design Engineering", icon: FileText },
  { number: 4, name: "Material Requirement", icon: Package },
  { number: 5, name: "Production Plan", icon: Zap },
  { number: 6, name: "Quality Check", icon: Check },
  { number: 7, name: "Shipment", icon: Truck },
  { number: 8, name: "Delivery", icon: CheckCircle },
];

export const PRODUCTION_PHASES = {
  "Material Prep": [
    { value: "marking", label: "Marking" },
    { value: "cutting_laser", label: "Cutting (laser/plasma/bandsaw)" },
  ],
  Fabrication: [
    { value: "edge_prep", label: "Edge prep" },
    { value: "mig_welding", label: "MIG/SMAW/TIG welding" },
    { value: "fit_up", label: "Fit-up" },
    { value: "structure_fabrication", label: "Structure fabrication" },
    { value: "heat_treatment", label: "Heat treatment (optional)" },
  ],
  Machining: [
    { value: "drilling", label: "Drilling" },
    { value: "turning", label: "Turning" },
    { value: "milling", label: "Milling" },
    { value: "boring", label: "Boring" },
  ],
  "Surface Prep": [
    { value: "grinding", label: "Grinding" },
    { value: "shot_blasting", label: "Shot blasting" },
    { value: "painting", label: "Painting" },
  ],
  Assembly: [
    { value: "mechanical_assembly", label: "Mechanical assembly" },
    { value: "shaft_bearing_assembly", label: "Shaft/bearing assembly" },
    { value: "alignment", label: "Alignment" },
  ],
  Electrical: [
    { value: "panel_wiring", label: "Panel wiring" },
    { value: "motor_wiring", label: "Motor wiring" },
    { value: "sensor_installation", label: "Sensor installation" },
  ],
};

export const MACHINED_PARTS_SPECS = {
  Shafts: [
    { name: "shaftDiameter", label: "Diameter (mm)", placeholder: "e.g., 25" },
    { name: "shaftLength", label: "Length (mm)", placeholder: "e.g., 100" },
  ],
  Bushes: [
    { name: "bushOuterDiameter", label: "Outer Diameter (mm)", placeholder: "e.g., 30" },
    { name: "bushInnerDiameter", label: "Inner Diameter (mm)", placeholder: "e.g., 20" },
    { name: "bushLength", label: "Length (mm)", placeholder: "e.g., 25" },
  ],
  Spacers: [
    { name: "spacerOuterDiameter", label: "Outer Diameter (mm)", placeholder: "e.g., 50" },
    { name: "spacerInnerDiameter", label: "Inner Diameter (mm)", placeholder: "e.g., 25" },
    { name: "spacerThickness", label: "Thickness (mm)", placeholder: "e.g., 10" },
  ],
  "Machined brackets": [
    { name: "bracketThickness", label: "Thickness (mm)", placeholder: "e.g., 12" },
    { name: "bracketHoleSize", label: "Hole Size (mm)", placeholder: "e.g., 8" },
  ],
  Flanges: [
    { name: "flangeOuterDiameter", label: "Outer Diameter (mm)", placeholder: "e.g., 100" },
    { name: "flangeInnerDiameter", label: "Inner Diameter (mm)", placeholder: "e.g., 50" },
    { name: "flangeThickness", label: "Thickness (mm)", placeholder: "e.g., 15" },
  ],
  "Bearing housings": [
    { name: "housingBoreSize", label: "Bore Size (mm)", placeholder: "e.g., 30" },
  ],
};

export const PRIORITY_LEVELS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export const DELIVERY_MODES = [
  { value: "air", label: "Air" },
  { value: "road", label: "Road" },
  { value: "rail", label: "Rail" },
  { value: "ship", label: "Ship" },
];

export const MATERIAL_UNITS = [
  { value: "kg", label: "KG" },
  { value: "meter", label: "Meter" },
  { value: "piece", label: "Piece" },
  { value: "box", label: "Box" },
];

export const ROLLER_MOVEMENT_COMPONENTS_SPECS = {
  "Rollers (Nylon/PU/Steel)": [
    { name: "rollerDiameter", label: "Diameter (mm)", placeholder: "e.g., 50" },
    { name: "rollerMaterial", label: "Material", placeholder: "e.g., Nylon, PU, Steel" },
    { name: "rollerWidth", label: "Width (mm)", placeholder: "e.g., 30" },
    { name: "rollerLoadCapacity", label: "Load Capacity (kg)", placeholder: "e.g., 500" },
    { name: "rollerFinish", label: "Surface Finish", placeholder: "e.g., Chromated, Painted" },
  ],
  "Bearings (ball, tapered, spherical)": [
    { name: "bearingType", label: "Type", placeholder: "e.g., Ball, Tapered, Spherical" },
    { name: "bearingBoreDiameter", label: "Bore Diameter (mm)", placeholder: "e.g., 20" },
    { name: "bearingOuterDiameter", label: "Outer Diameter (mm)", placeholder: "e.g., 52" },
    { name: "bearingWidth", label: "Width (mm)", placeholder: "e.g., 15" },
    { name: "bearingLoadRating", label: "Load Rating (kg)", placeholder: "e.g., 1000" },
  ],
  "Linear guide rails": [
    { name: "railType", label: "Rail Type", placeholder: "e.g., THK, Hiwin, Bosch" },
    { name: "railLength", label: "Length (mm)", placeholder: "e.g., 1000" },
    { name: "railLoadCapacity", label: "Load Capacity (kg)", placeholder: "e.g., 2000" },
    { name: "railMountType", label: "Mount Type", placeholder: "e.g., Top, Side, Bottom" },
    { name: "railFinish", label: "Surface Finish", placeholder: "e.g., Chrome, Stainless" },
  ],
  "Guide wheels": [
    { name: "wheelDiameter", label: "Diameter (mm)", placeholder: "e.g., 80" },
    { name: "wheelWidth", label: "Width (mm)", placeholder: "e.g., 40" },
    { name: "wheelMaterial", label: "Material", placeholder: "e.g., Nylon, Polyurethane, Steel" },
    { name: "wheelLoadCapacity", label: "Load Capacity (kg)", placeholder: "e.g., 1500" },
    { name: "wheelMountType", label: "Mount Type", placeholder: "e.g., Eccentric, Fixed" },
  ],
  "Gear racks / pinions": [
    { name: "gearType", label: "Type", placeholder: "e.g., Rack, Pinion" },
    { name: "gearModule", label: "Module", placeholder: "e.g., 2.0, 2.5, 3.0" },
    { name: "gearTeethCount", label: "Teeth Count", placeholder: "e.g., 30, 50" },
    { name: "gearMaterial", label: "Material", placeholder: "e.g., Steel, Cast Iron" },
    { name: "gearFinish", label: "Surface Finish", placeholder: "e.g., Hardened, Tempered" },
  ],
};

export const MACHINED_PARTS_SPECIFIC_FIELDS = {
  Shafts: [
    { name: "shaftMaterialGrade", label: "Material Grade", placeholder: "e.g., EN8, EN9, EN16" },
    { name: "shaftToleranceClass", label: "Tolerance Class", placeholder: "e.g., H7, H8, P7" },
  ],
  Bushes: [
    { name: "bushMaterialType", label: "Material Type", placeholder: "e.g., Bronze, Nylon, PTFE" },
  ],
  Spacers: [
    { name: "spacerMaterialType", label: "Material Type", placeholder: "e.g., Aluminum, Steel, Brass" },
  ],
  "Machined brackets": [
    { name: "bracketMaterialType", label: "Material Type", placeholder: "e.g., Mild Steel, Aluminum, SS" },
    { name: "bracketMachiningOperations", label: "Machining Operations", placeholder: "e.g., Drilling, Tapping, Milling" },
  ],
  Flanges: [
    { name: "flangePCD", label: "PCD (Pitch Circle Diameter, mm)", placeholder: "e.g., 100" },
    { name: "flangeNumberOfHoles", label: "Number of Holes", placeholder: "e.g., 4, 6, 8" },
  ],
  "Bearing housings": [
    { name: "housingType", label: "Housing Type", placeholder: "e.g., Pillow Block, Flange, Pedestal" },
    { name: "housingMaterialType", label: "Material Type", placeholder: "e.g., Cast Iron, Aluminum, Steel" },
  ],
};

export const ROLLER_MOVEMENT_COMPONENTS_SPECIFIC_FIELDS = {
  "Rollers (Nylon/PU/Steel)": [
    { name: "rollerBearingType", label: "Bearing Type (Inserted?)", placeholder: "e.g., Yes, No, Ball Bearing" },
  ],
  "Bearings (ball, tapered, spherical)": [
    { name: "bearingNumber", label: "Bearing Number", placeholder: "e.g., 6204, 6304, SKF" },
  ],
  "Linear guide rails": [
    { name: "railBlockType", label: "Block Type (Carriage Type)", placeholder: "e.g., Standard, Wide, Compact" },
  ],
  "Guide wheels": [],
  "Gear racks / pinions": [],
};

export const LIFTING_PULLING_MECHANISMS_SPECS = {
  "Hoists (Chain, Wire Rope)": [
    { name: "hoistType", label: "Type", placeholder: "e.g., Chain, Wire Rope" },
    { name: "hoistCapacity", label: "Capacity (tons)", placeholder: "e.g., 2, 5, 10" },
    { name: "hoistLift", label: "Lift Height (m)", placeholder: "e.g., 3, 5, 10" },
    { name: "hoistSpeed", label: "Lifting Speed (m/min)", placeholder: "e.g., 10, 20" },
    { name: "hoistPower", label: "Power (kW)", placeholder: "e.g., 1.5, 3, 5.5" },
  ],
  "Trolleys (Hand, Electric)": [
    { name: "trolleyType", label: "Type", placeholder: "e.g., Hand, Electric" },
    { name: "trolleyCapacity", label: "Capacity (tons)", placeholder: "e.g., 1, 2, 3" },
    { name: "trolleyTrackGauge", label: "Track Gauge (mm)", placeholder: "e.g., 80, 100, 150" },
    { name: "trolleyWheels", label: "Number of Wheels", placeholder: "e.g., 4, 6, 8" },
    { name: "trolleyMaterial", label: "Material", placeholder: "e.g., Steel, Cast Iron" },
  ],
  "Pulleys": [
    { name: "pulleyDiameter", label: "Diameter (mm)", placeholder: "e.g., 50, 75, 100" },
    { name: "pulleyBoreDiameter", label: "Bore Diameter (mm)", placeholder: "e.g., 20, 25, 30" },
    { name: "pulleyMaterial", label: "Material", placeholder: "e.g., Steel, Aluminum, Nylon" },
    { name: "pulleyLoadRating", label: "Load Rating (kg)", placeholder: "e.g., 500, 1000, 2000" },
    { name: "pulleyFinish", label: "Finish", placeholder: "e.g., Painted, Galvanized" },
  ],
  "Wire Ropes": [
    { name: "ropeDiameter", label: "Diameter (mm)", placeholder: "e.g., 6, 8, 10, 12" },
    { name: "ropeGrade", label: "Grade", placeholder: "e.g., 1770, 1960 MPa" },
    { name: "ropeTensileStrength", label: "Tensile Strength (kg/mm²)", placeholder: "e.g., 1570, 1770" },
    { name: "ropeLength", label: "Length (m)", placeholder: "e.g., 50, 100, 500" },
    { name: "ropeMaterial", label: "Material", placeholder: "e.g., Steel, Stainless" },
  ],
};

export const ELECTRICAL_AUTOMATION_SPECS = {
  "Motors (AC, DC, Servo)": [
    { name: "motorType", label: "Type", placeholder: "e.g., AC, DC, Servo" },
    { name: "motorPower", label: "Power (kW)", placeholder: "e.g., 0.5, 1.5, 3, 5.5" },
    { name: "motorSpeed", label: "Speed (RPM)", placeholder: "e.g., 900, 1500, 3000" },
    { name: "motorVoltage", label: "Voltage (V)", placeholder: "e.g., 230, 400, 415" },
    { name: "motorEfficiency", label: "Efficiency", placeholder: "e.g., IE2, IE3" },
  ],
  "VFD (Variable Frequency Drive)": [
    { name: "vfdPower", label: "Power Rating (kW)", placeholder: "e.g., 1.5, 3, 5.5, 11" },
    { name: "vfdInputVoltage", label: "Input Voltage (V)", placeholder: "e.g., 230, 400, 415" },
    { name: "vfdOutputFreq", label: "Output Frequency (Hz)", placeholder: "e.g., 0-50, 0-60" },
    { name: "vfdDimension", label: "Dimension", placeholder: "e.g., 180x200x100 mm" },
    { name: "vfdCooling", label: "Cooling Method", placeholder: "e.g., Air, Water" },
  ],
  "PLCs (Programmable Logic Controllers)": [
    { name: "plcModel", label: "Model", placeholder: "e.g., Siemens S7-1200, Allen Bradley" },
    { name: "plcInputs", label: "Number of Inputs", placeholder: "e.g., 8, 16, 32" },
    { name: "plcOutputs", label: "Number of Outputs", placeholder: "e.g., 6, 8, 16" },
    { name: "plcMemory", label: "Memory (KB)", placeholder: "e.g., 64, 128, 256" },
    { name: "plcPower", label: "Power Supply (V)", placeholder: "e.g., 24 DC" },
  ],
  "Control Panels": [
    { name: "panelSize", label: "Panel Size (mm)", placeholder: "e.g., 600x800x300" },
    { name: "panelMaterial", label: "Material", placeholder: "e.g., Stainless Steel, Powder Coated" },
    { name: "panelIP", label: "IP Rating", placeholder: "e.g., IP54, IP65, IP67" },
    { name: "panelComponents", label: "Components", placeholder: "e.g., MCB, Contactor, Relay" },
    { name: "panelCooling", label: "Cooling", placeholder: "e.g., Fan, Air-conditioned" },
  ],
};

export const SAFETY_MATERIALS_SPECS = {
  "Safety Guards (Mesh, Polycarbonate)": [
    { name: "guardType", label: "Type", placeholder: "e.g., Mesh, Polycarbonate, Metal" },
    { name: "guardSize", label: "Size (mm)", placeholder: "e.g., 500x500, 1000x1000" },
    { name: "guardThickness", label: "Thickness (mm)", placeholder: "e.g., 1.5, 2, 3" },
    { name: "guardColor", label: "Color", placeholder: "e.g., Yellow, Orange" },
    { name: "guardFinish", label: "Finish", placeholder: "e.g., Powder Coated, Anodized" },
  ],
  "Safety Switches (Interlock, Limit)": [
    { name: "switchType", label: "Type", placeholder: "e.g., Interlock, Limit, Emergency" },
    { name: "switchVoltage", label: "Voltage (V)", placeholder: "e.g., 24, 230, 415" },
    { name: "switchCurrent", label: "Current Rating (A)", placeholder: "e.g., 10, 16, 25" },
    { name: "switchIP", label: "IP Rating", placeholder: "e.g., IP65, IP67" },
    { name: "switchMaterial", label: "Material", placeholder: "e.g., Stainless Steel, Plastic" },
  ],
  "Emergency Stop Buttons": [
    { name: "buttonDiameter", label: "Diameter (mm)", placeholder: "e.g., 40, 60, 80" },
    { name: "buttonColor", label: "Color", placeholder: "e.g., Red" },
    { name: "buttonType", label: "Button Type", placeholder: "e.g., Push, Twist" },
    { name: "buttonVoltage", label: "Voltage (V)", placeholder: "e.g., 24, 230" },
    { name: "buttonMounting", label: "Mounting", placeholder: "e.g., Panel, Station" },
  ],
};

export const SURFACE_PREP_PAINTING_SPECS = {
  "Abrasive Materials (Grit, Shot)": [
    { name: "abrasiveType", label: "Type", placeholder: "e.g., Sand, Steel Shot, Grit" },
    { name: "abrasiveGrit", label: "Grit Size", placeholder: "e.g., 80, 120, 220" },
    { name: "abrasiveQuantity", label: "Quantity (kg)", placeholder: "e.g., 50, 100, 500" },
    { name: "abrasiveGrade", label: "Grade", placeholder: "e.g., Coarse, Medium, Fine" },
    { name: "abrasiveSource", label: "Source", placeholder: "e.g., Supplier Name" },
  ],
  "Primers": [
    { name: "primerType", label: "Type", placeholder: "e.g., Epoxy, Polyester, Zinc-rich" },
    { name: "primerQuantity", label: "Quantity (liters)", placeholder: "e.g., 10, 20, 50" },
    { name: "primerCoverage", label: "Coverage (m²/liter)", placeholder: "e.g., 8-10" },
    { name: "primerDryTime", label: "Dry Time (hours)", placeholder: "e.g., 4-8" },
    { name: "primerColor", label: "Color", placeholder: "e.g., Red, Gray, White" },
  ],
  "Top Coats": [
    { name: "topcoatType", label: "Type", placeholder: "e.g., Polyurethane, Acrylic, Enamel" },
    { name: "topcoatQuantity", label: "Quantity (liters)", placeholder: "e.g., 10, 20, 50" },
    { name: "topcoatCoverage", label: "Coverage (m²/liter)", placeholder: "e.g., 10-12" },
    { name: "topcoatSheen", label: "Sheen", placeholder: "e.g., Matte, Semi-gloss, Gloss" },
    { name: "topcoatColor", label: "Color Code", placeholder: "e.g., RAL 9016, Pantone 123" },
  ],
};

export const FABRICATION_CONSUMABLES_SPECS = {
  "Welding Rods (ER70S-6, E6013)": [
    { name: "rodType", label: "Type", placeholder: "e.g., ER70S-6, E6013, E7018" },
    { name: "rodDiameter", label: "Diameter (mm)", placeholder: "e.g., 1.2, 1.6, 2.0, 2.4" },
    { name: "rodQuantity", label: "Quantity (kg)", placeholder: "e.g., 5, 10, 25" },
    { name: "rodGrade", label: "Grade", placeholder: "e.g., AWS A5.18, ISO 14341" },
    { name: "rodMaterial", label: "Base Material", placeholder: "e.g., Mild Steel, Stainless" },
  ],
  "Shielding Gas": [
    { name: "gasType", label: "Type", placeholder: "e.g., Argon, CO2, Argon+CO2" },
    { name: "gasQuantity", label: "Quantity (liters)", placeholder: "e.g., 10, 20, 40" },
    { name: "gasPurity", label: "Purity (%)", placeholder: "e.g., 99.9%" },
    { name: "gasBottleSize", label: "Bottle Size", placeholder: "e.g., 6L, 10L, 20L" },
    { name: "gasSupplier", label: "Supplier", placeholder: "e.g., Supplier Name" },
  ],
  "Flux & Additives": [
    { name: "fluxType", label: "Type", placeholder: "e.g., Soldering, Brazing Flux" },
    { name: "fluxQuantity", label: "Quantity (kg)", placeholder: "e.g., 1, 2, 5" },
    { name: "fluxComposition", label: "Composition", placeholder: "e.g., Active, Rosin-based" },
    { name: "fluxMeltingPoint", label: "Melting Point (°C)", placeholder: "e.g., 200-250" },
    { name: "fluxApplication", label: "Application", placeholder: "e.g., Soldering, Brazing" },
  ],
};

export const HARDWARE_MISC_SPECS = {
  "Bolts, Nuts, Screws": [
    { name: "boltType", label: "Type", placeholder: "e.g., M6, M8, M10" },
    { name: "boltGrade", label: "Grade", placeholder: "e.g., 5.8, 8.8, 10.9" },
    { name: "boltQuantity", label: "Quantity", placeholder: "e.g., 100, 500, 1000" },
    { name: "boltMaterial", label: "Material", placeholder: "e.g., Mild Steel, Stainless" },
    { name: "boltFinish", label: "Finish", placeholder: "e.g., Zinc, Galvanized" },
  ],
  "Washers, Gaskets": [
    { name: "washerType", label: "Type", placeholder: "e.g., Flat, Spring, Nylon" },
    { name: "washerSize", label: "Size (mm)", placeholder: "e.g., 6, 8, 10, 12" },
    { name: "washerQuantity", label: "Quantity", placeholder: "e.g., 100, 500, 1000" },
    { name: "washerMaterial", label: "Material", placeholder: "e.g., Steel, Rubber, PTFE" },
    { name: "washerThickness", label: "Thickness (mm)", placeholder: "e.g., 0.5, 1, 2" },
  ],
  "Springs": [
    { name: "springType", label: "Type", placeholder: "e.g., Compression, Tension, Torsion" },
    { name: "springWireGauge", label: "Wire Gauge", placeholder: "e.g., 1.2, 1.6, 2.0" },
    { name: "springQuantity", label: "Quantity", placeholder: "e.g., 50, 100, 500" },
    { name: "springMaterial", label: "Material", placeholder: "e.g., Stainless, Carbon Steel" },
    { name: "springRate", label: "Spring Rate (N/mm)", placeholder: "e.g., 5, 10, 20" },
  ],
};

export const DOCUMENTATION_MATERIALS_SPECS = {
  "Drawings (CAD, PDF)": [
    { name: "drawingType", label: "Type", placeholder: "e.g., Assembly, Detail, GD&T" },
    { name: "drawingFormat", label: "Format", placeholder: "e.g., PDF, DWG, STEP" },
    { name: "drawingRevision", label: "Revision", placeholder: "e.g., Rev 1, Rev 2" },
    { name: "drawingScale", label: "Scale", placeholder: "e.g., 1:1, 1:2, 1:10" },
    { name: "drawingStandard", label: "Standard", placeholder: "e.g., ISO, ANSI, DIN" },
  ],
  "Technical Specifications": [
    { name: "specDocument", label: "Document", placeholder: "e.g., Design Spec, Process Spec" },
    { name: "specVersion", label: "Version", placeholder: "e.g., 1.0, 1.1, 2.0" },
    { name: "specPages", label: "Number of Pages", placeholder: "e.g., 10, 20, 50" },
    { name: "specScope", label: "Scope", placeholder: "e.g., Functional, Technical, Quality" },
    { name: "specAuthor", label: "Author", placeholder: "e.g., Engineering Dept" },
  ],
  "Quality Documents (QAP, CoC)": [
    { name: "qapType", label: "Type", placeholder: "e.g., QAP, Inspection Plan, FAT" },
    { name: "qapPages", label: "Pages", placeholder: "e.g., 5, 10, 20" },
    { name: "qapCheckpoints", label: "Checkpoints", placeholder: "e.g., 20, 50, 100" },
    { name: "qapStandard", label: "Standard", placeholder: "e.g., ISO 9001, AS9100" },
    { name: "qapApprover", label: "Approver", placeholder: "e.g., QA Manager" },
  ],
};

export const PRODUCTION_PHASE_FORMS = {
  marking: [
    { name: "componentName", label: "Component Name", type: "text", placeholder: "e.g., Shaft Assembly" },
    { name: "drawingNo", label: "Drawing No. & Revision", type: "text", placeholder: "e.g., DRG-001-R2" },
    { name: "markingMethod", label: "Marking Method", type: "select", options: ["Hand", "Auto marking"] },
    { name: "toolsUsed", label: "Tools Used", type: "text", placeholder: "e.g., Marker, Scribe, Punch" },
    { name: "markingDoneBy", label: "Marking Done By", type: "text", placeholder: "e.g., John Doe" },
    { name: "markingDate", label: "Marking Date", type: "date" },
    { name: "qcInspectionResult", label: "QC Inspection Result", type: "select", options: ["Pass", "Fail", "Pending"] },
    { name: "markingPhoto", label: "Upload Marking Photo", type: "file" },
  ],
  cutting_laser: [
    { name: "quantity", label: "Quantity", type: "number", placeholder: "e.g., 10" },
    { name: "estimatedHours", label: "Estimated Hours", type: "number", placeholder: "e.g., 4" },
    { name: "responsiblePerson", label: "Responsible Person / Team", type: "text", placeholder: "e.g., Laser Operator" },
    { name: "equipmentRequired", label: "Equipment Required", type: "text", placeholder: "e.g., Laser Cutter" },
    { name: "specialInstructions", label: "Special Instructions / Notes", type: "textarea", placeholder: "e.g., Kerf compensation: 0.2mm" },
    { name: "estimatedCost", label: "Estimated Cost ($)", type: "number", placeholder: "e.g., 200" },
    { name: "qualityStandards", label: "Quality Standards", type: "text", placeholder: "e.g., Sharp edges, no burrs" },
  ],
  edge_prep: [
    { name: "componentName", label: "Component Name", type: "text", placeholder: "e.g., Base Plate, Side Beam" },
    { name: "bevelAngle", label: "Bevel Angle", type: "text", placeholder: "e.g., 45°" },
    { name: "bevelType", label: "Bevel Type", type: "select", options: ["Single", "Double"] },
    { name: "operatorName", label: "Operator Name", type: "text", placeholder: "e.g., John Doe" },
    { name: "prepDate", label: "Date", type: "date" },
    { name: "qcResult", label: "QC Result", type: "select", options: ["Pass", "Fail", "Pending"] },
    { name: "edgePrepImage", label: "Upload Image", type: "file" },
  ],
  mig_welding: [
    { name: "weldJointNo", label: "Weld Joint No.", type: "text", placeholder: "e.g., WJ-001" },
    { name: "weldingProcess", label: "Welding Process", type: "select", options: ["MIG", "SMAW", "TIG"] },
    { name: "electrodeWireType", label: "Electrode / Wire Type", type: "text", placeholder: "e.g., ER70S-2" },
    { name: "wpsNo", label: "WPS No.", type: "text", placeholder: "e.g., WPS-2024-001" },
    { name: "welderId", label: "Welder ID", type: "text", placeholder: "e.g., W-001" },
    { name: "noOfPasses", label: "No. of Passes", type: "number", placeholder: "e.g., 3" },
    { name: "postweldObservation", label: "Post-weld Observation", type: "textarea", placeholder: "e.g., Good bead appearance" },
    { name: "qcStatus", label: "QC Status", type: "select", options: ["Pass", "Fail", "Pending"] },
    { name: "weldPhoto", label: "Upload Weld Photo", type: "file" },
  ],
  fit_up: [
    { name: "assemblyName", label: "Assembly Name", type: "text", placeholder: "e.g., Main Frame Assembly" },
    { name: "fitUpDrawingNo", label: "Fit-Up Drawing No.", type: "text", placeholder: "e.g., DRG-FU-001" },
    { name: "tackWeldCount", label: "Tack Weld Count", type: "number", placeholder: "e.g., 4" },
    { name: "fitUpDoneBy", label: "Fit-Up Done By", type: "text", placeholder: "e.g., John Doe" },
    { name: "fitUpStatus", label: "Fit-Up Status", type: "select", options: ["Approved", "Rework Required", "Rejected"] },
    { name: "fitUpImage", label: "Upload Fit-Up Image", type: "file" },
  ],
  structure_fabrication: [
    { name: "structureName", label: "Structure Name", type: "select", options: ["Base Frame", "Support", "Rail"] },
    { name: "frameDimensions", label: "Frame Dimensions (L×W×H)", type: "text", placeholder: "e.g., 1000×500×800mm" },
    { name: "fabricatedBy", label: "Fabricated By", type: "text", placeholder: "e.g., Tech-001" },
    { name: "completionDate", label: "Completion Date", type: "date" },
    { name: "qcApproval", label: "QC Approval", type: "select", options: ["Approved", "Conditional", "Rejected"] },
    { name: "assemblyImage", label: "Upload Assembly Image", type: "file" },
  ],
  heat_treatment: [
    { name: "componentName", label: "Component Name", type: "text", placeholder: "e.g., Shaft" },
    { name: "htType", label: "Type", type: "select", options: ["Stress Relief", "Normalizing", "Annealing"] },
    { name: "temperatureRange", label: "Temperature Range", type: "text", placeholder: "e.g., 850-870°C" },
    { name: "coolingMethod", label: "Cooling Method", type: "text", placeholder: "e.g., Oil quench" },
    { name: "htCompletedBy", label: "HT Completed By", type: "text", placeholder: "e.g., Tech-001" },
    { name: "qcStatus", label: "QC Status", type: "select", options: ["Pass", "Fail", "Pending"] },
  ],
  drilling: [
    { name: "componentName", label: "Component Name", type: "text", placeholder: "e.g., Plate" },
    { name: "holeSize", label: "Hole Size", type: "text", placeholder: "e.g., 10mm" },
    { name: "numberOfHoles", label: "Number of Holes", type: "number", placeholder: "e.g., 4" },
    { name: "operatorName", label: "Operator Name", type: "text", placeholder: "e.g., John Doe" },
    { name: "dimensionalCheck", label: "Dimensional Check", type: "text", placeholder: "e.g., ±0.1mm" },
    { name: "qcStatus", label: "QC Status", type: "select", options: ["Pass", "Fail", "Pending"] },
    { name: "drillingPhoto", label: "Upload Photo", type: "file" },
  ],
  turning: [
    { name: "componentName", label: "Component Name", type: "text", placeholder: "e.g., Shaft" },
    { name: "outerDiameter", label: "Outer Diameter", type: "text", placeholder: "e.g., 50mm" },
    { name: "length", label: "Length", type: "text", placeholder: "e.g., 100mm" },
    { name: "operatorName", label: "Operator Name", type: "text", placeholder: "e.g., John Doe" },
    { name: "dimensionalCheck", label: "Dimensional Check", type: "text", placeholder: "e.g., ±0.1mm" },
    { name: "qcStatus", label: "QC Status", type: "select", options: ["Pass", "Fail", "Pending"] },
    { name: "turningPhoto", label: "Upload Photo", type: "file" },
  ],
  milling: [
    { name: "componentName", label: "Component Name", type: "text", placeholder: "e.g., Plate" },
    { name: "operatorName", label: "Operator Name", type: "text", placeholder: "e.g., John Doe" },
    { name: "toleranceRequired", label: "Tolerance Required", type: "text", placeholder: "e.g., ±0.05mm" },
    { name: "dimensionalCheck", label: "Dimensional Check", type: "text", placeholder: "e.g., All verified" },
    { name: "qcStatus", label: "QC Status", type: "select", options: ["Pass", "Fail", "Pending"] },
    { name: "millingPhoto", label: "Upload Photo", type: "file" },
  ],
  boring: [
    { name: "componentName", label: "Component Name", type: "text", placeholder: "e.g., Housing" },
    { name: "boreDiameter", label: "Bore Diameter", type: "text", placeholder: "e.g., 80mm" },
    { name: "operatorName", label: "Operator Name", type: "text", placeholder: "e.g., John Doe" },
    { name: "tolerance", label: "Tolerance (mm)", type: "text", placeholder: "e.g., ±0.1mm" },
    { name: "qcStatus", label: "QC Status", type: "select", options: ["Pass", "Fail", "Pending"] },
    { name: "boringPhoto", label: "Upload Photo", type: "file" },
  ],
  grinding: [
    { name: "componentName", label: "Component Name", type: "text", placeholder: "e.g., Plate" },
    { name: "grindingType", label: "Grinding Type", type: "select", options: ["Surface", "Edge", "Weld"] },
    { name: "operatorName", label: "Operator Name", type: "text", placeholder: "e.g., John Doe" },
    { name: "qcApproval", label: "QC Approval", type: "select", options: ["Approved", "Rework Required", "Rejected"] },
    { name: "grindingImage", label: "Upload Image", type: "file" },
  ],
  shot_blasting: [
    { name: "componentAssembly", label: "Component / Assembly", type: "text", placeholder: "e.g., Frame" },
    { name: "blastingGrade", label: "Blasting Grade", type: "select", options: ["SA2", "SA2.5"] },
    { name: "operatorName", label: "Operator Name", type: "text", placeholder: "e.g., John Doe" },
    { name: "blastingDate", label: "Date", type: "date" },
    { name: "qcStatus", label: "QC Status", type: "select", options: ["Pass", "Fail", "Pending"] },
    { name: "blastingImage", label: "Upload Image", type: "file" },
  ],
  painting: [
    { name: "primerType", label: "Primer Type & Batch No.", type: "text", placeholder: "e.g., Epoxy Primer" },
    { name: "painterName", label: "Painter Name", type: "text", placeholder: "e.g., John Doe" },
    { name: "dryingTime", label: "Drying Time", type: "text", placeholder: "e.g., 24 hours" },
    { name: "qcStatus", label: "QC Status", type: "select", options: ["Pass", "Fail", "Pending"] },
    { name: "paintedImage", label: "Upload Painted Image", type: "file" },
  ],
  mechanical_assembly: [
    { name: "assemblyName", label: "Assembly Name", type: "text", placeholder: "e.g., Main Frame Assembly" },
    { name: "boltCount", label: "Bolt Count", type: "number", placeholder: "e.g., 8" },
    { name: "assemblyDoneBy", label: "Assembly Done By", type: "text", placeholder: "e.g., John Doe" },
    { name: "qcApproval", label: "QC Approval", type: "select", options: ["Approved", "Rework Required", "Rejected"] },
    { name: "assemblyImage", label: "Upload Assembly Image", type: "file" },
  ],
  shaft_bearing_assembly: [
    { name: "shaftSize", label: "Shaft Size", type: "text", placeholder: "e.g., Ø20mm" },
    { name: "bearingType", label: "Bearing Type", type: "text", placeholder: "e.g., Deep groove ball" },
    { name: "fittingMethod", label: "Fitting Method", type: "select", options: ["Press", "Heat fit"] },
    { name: "assembledBy", label: "Assembled By", type: "text", placeholder: "e.g., John Doe" },
    { name: "qcStatus", label: "QC Status", type: "select", options: ["Pass", "Fail", "Pending"] },
    { name: "bearingAssemblyImage", label: "Upload Image", type: "file" },
  ],
  alignment: [
    { name: "alignmentType", label: "Alignment Type", type: "select", options: ["Rail", "Shaft", "Roller", "Frame"] },
    { name: "straightnessMeasurement", label: "Straightness Measurement (mm deviation)", type: "text", placeholder: "e.g., ±0.1mm" },
    { name: "alignedBy", label: "Aligned By", type: "text", placeholder: "e.g., John Doe" },
    { name: "inspectorApproval", label: "Inspector Approval", type: "select", options: ["Approved", "Rework Required", "Rejected"] },
    { name: "measurementReportUpload", label: "Upload Measurement Report", type: "file" },
  ],
  panel_wiring: [
    { name: "panelName", label: "Panel Name", type: "text", placeholder: "e.g., Main Distribution Panel" },
    { name: "componentsInstalled", label: "Components Installed", type: "text", placeholder: "e.g., MCB, Contactor" },
    { name: "wiringContinuityCheck", label: "Wiring Continuity Check", type: "text", placeholder: "e.g., All circuits OK" },
    { name: "doneBy", label: "Done By", type: "text", placeholder: "e.g., John Doe" },
    { name: "qcApproval", label: "QC Approval", type: "select", options: ["Approved", "Rework Required", "Rejected"] },
    { name: "panelPhoto", label: "Upload Panel Photo", type: "file" },
  ],
  motor_wiring: [
    { name: "motorNameplateDetails", label: "Motor Nameplate Details", type: "text", placeholder: "e.g., 3-phase 5.5kW" },
    { name: "cableSize", label: "Cable Size", type: "text", placeholder: "e.g., 4mm²" },
    { name: "motorDoneBy", label: "Done By", type: "text", placeholder: "e.g., John Doe" },
    { name: "motorQcApproval", label: "QC Approval", type: "select", options: ["Approved", "Rework Required", "Rejected"] },
    { name: "motorImage", label: "Upload Image", type: "file" },
  ],
  sensor_installation: [
    { name: "sensorType", label: "Sensor Type", type: "select", options: ["Proximity", "Limit", "Pressure"] },
    { name: "location", label: "Location", type: "text", placeholder: "e.g., Entrance gate" },
    { name: "functionalTestResult", label: "Functional Test Result", type: "text", placeholder: "e.g., Test passed" },
    { name: "installedBy", label: "Installed By", type: "text", placeholder: "e.g., John Doe" },
    { name: "sensorQcApproval", label: "QC Approval", type: "select", options: ["Approved", "Rework Required", "Rejected"] },
    { name: "sensorPhoto", label: "Upload Photo", type: "file" },
  ],
};

export const STEEL_SECTIONS_SPECS = {
  "Round bars": [
    { name: "steelSize", label: "Diameter (mm)", placeholder: "e.g., 16, 20, 25" },
    { name: "steelLength", label: "Length (mm)", placeholder: "e.g., 6000" },
    { name: "steelTolerance", label: "Tolerance", placeholder: "e.g., ±5mm" },
  ],
  "ISMB Beams (100–500 mm)": [
    { name: "steelSize", label: "ISMB Size", placeholder: "e.g., ISMB 100, 150, 200" },
    { name: "steelLength", label: "Length (mm)", placeholder: "e.g., 6000" },
    { name: "steelTolerance", label: "Tolerance", placeholder: "e.g., ±10mm" },
  ],
  "ISMC Channels (75–400 mm)": [
    { name: "steelSize", label: "ISMC Size", placeholder: "e.g., ISMC 75, 100, 150" },
    { name: "steelLength", label: "Length (mm)", placeholder: "e.g., 6000" },
    { name: "steelTolerance", label: "Tolerance", placeholder: "e.g., ±10mm" },
  ],
  "RHS / SHS box sections": [
    { name: "steelSize", label: "Box Size (mm)", placeholder: "e.g., 50x50x3, 100x100x4" },
    { name: "steelLength", label: "Length (mm)", placeholder: "e.g., 6000" },
    { name: "steelTolerance", label: "Tolerance", placeholder: "e.g., ±5mm" },
  ],
  "Angles (equal/unequal)": [
    { name: "steelSize", label: "Angle Size (mm)", placeholder: "e.g., 50x50x5, 75x50x6" },
    { name: "steelLength", label: "Length (mm)", placeholder: "e.g., 6000" },
    { name: "steelTolerance", label: "Tolerance", placeholder: "e.g., ±10mm" },
  ],
  "Flat bars": [
    { name: "steelSize", label: "Size (W×H mm)", placeholder: "e.g., 50x10, 100x12" },
    { name: "steelLength", label: "Length (mm)", placeholder: "e.g., 6000" },
    { name: "steelTolerance", label: "Tolerance", placeholder: "e.g., ±5mm" },
  ],
};

export const PLATE_TYPES_SPECS = {
  "Mild Steel Plates": [
    { name: "plateThickness", label: "Thickness (mm)", placeholder: "e.g., 6, 8, 10, 12" },
    { name: "plateLength", label: "Length (mm)", placeholder: "e.g., 2500" },
    { name: "plateWidth", label: "Width (mm)", placeholder: "e.g., 1250" },
    { name: "plateSurfaceFinish", label: "Surface Finish", placeholder: "e.g., As Rolled, Pickled" },
  ],
  "Stainless Steel Plates": [
    { name: "plateThickness", label: "Thickness (mm)", placeholder: "e.g., 2, 3, 4, 5" },
    { name: "plateLength", label: "Length (mm)", placeholder: "e.g., 2500" },
    { name: "plateWidth", label: "Width (mm)", placeholder: "e.g., 1250" },
    { name: "plateSurfaceFinish", label: "Surface Finish", placeholder: "e.g., 2B, BA, 8K Polish" },
  ],
  "Aluminum Plates": [
    { name: "plateThickness", label: "Thickness (mm)", placeholder: "e.g., 3, 5, 10" },
    { name: "plateLength", label: "Length (mm)", placeholder: "e.g., 2500" },
    { name: "plateWidth", label: "Width (mm)", placeholder: "e.g., 1250" },
    { name: "plateSurfaceFinish", label: "Alloy Grade", placeholder: "e.g., 6061, 5052" },
  ],
  "Brass / Copper Plates": [
    { name: "plateThickness", label: "Thickness (mm)", placeholder: "e.g., 2, 3, 5" },
    { name: "plateLength", label: "Length (mm)", placeholder: "e.g., 1000" },
    { name: "plateWidth", label: "Width (mm)", placeholder: "e.g., 500" },
    { name: "plateSurfaceFinish", label: "Surface Finish", placeholder: "e.g., Polished, As Cast" },
  ],
};

export const MATERIAL_GRADES_SPECS = {
  "IS2062 E250/E350/E410": [
    { name: "is2062Grade", label: "Grade Selection", placeholder: "E250 / E350 / E410" },
  ],
  "EN8/EN19 (for shafts)": [
    { name: "en8Grade", label: "Grade Selection", placeholder: "EN8 / EN19" },
  ],
  "SS304 / SS316 (if needed)": [
    { name: "ss3xxGrade", label: "Grade Selection", placeholder: "304 / 316" },
  ],
};

export const MATERIAL_GRADE_SPECIFIC_FIELDS = {
  "IS2062 E250/E350/E410": [
    { name: "is2062Grade", label: "Grade Selection", placeholder: "E250 / E350 / E410" },
    { name: "is2062CharpyRequired", label: "Charpy Requirement?", placeholder: "Yes / No" },
    { name: "is2062MTCRequired", label: "MTC Required?", placeholder: "Yes / No" },
  ],
  "EN8/EN19 (for shafts)": [
    { name: "en8Grade", label: "Grade Selection", placeholder: "EN8 / EN19" },
    { name: "en8HeatTreatmentRequired", label: "Heat Treatment Required?", placeholder: "Yes / No" },
    { name: "en8MachiningRequired", label: "Machining Required?", placeholder: "Yes / No" },
  ],
  "SS304 / SS316 (if needed)": [
    { name: "ss3xxGrade", label: "Grade", placeholder: "304 / 316" },
    { name: "ss3xxFinish", label: "Finish", placeholder: "HR / CR / 2B / Matt" },
    { name: "ss3xxCorrosionRequired", label: "Corrosion Requirement?", placeholder: "Yes / No" },
  ],
};

export const FASTENER_TYPES_SPECS = {
  "High tensile bolts (8.8 / 10.9)": [
    { name: "boltSize", label: "Bolt Size", placeholder: "e.g., M8–M36" },
  ],
  "Nuts, washers (spring + flat)": [
    { name: "nutWasherSize", label: "Size", placeholder: "e.g., M8–M36" },
  ],
  "Anchor bolts (for foundation)": [
    { name: "anchorBoltDiameter", label: "Diameter", placeholder: "e.g., M8–M36" },
  ],
};

export const FASTENER_SPECIFIC_FIELDS = {
  "High tensile bolts (8.8 / 10.9)": [
    { name: "boltSize", label: "Bolt Size (M8–M36)", placeholder: "e.g., M8, M10, M12, M16, M20, M24, M30, M36" },
    { name: "boltLength", label: "Length (mm)", placeholder: "e.g., 20, 30, 40, 50, 60" },
    { name: "boltGrade", label: "Grade", placeholder: "8.8 / 10.9" },
    { name: "boltCoating", label: "Coating", placeholder: "Zinc / Black" },
  ],
  "Nuts, washers (spring + flat)": [
    { name: "nutWasherSize", label: "Size (M8–M36)", placeholder: "e.g., M8, M10, M12, M16, M20, M24, M30, M36" },
    { name: "nutWasherType", label: "Type", placeholder: "Plain / Spring / Flat" },
    { name: "nutWasherCoating", label: "Coating Type", placeholder: "Zinc / Black / Stainless" },
  ],
  "Anchor bolts (for foundation)": [
    { name: "anchorBoltDiameter", label: "Diameter (mm)", placeholder: "e.g., 8, 10, 12, 16, 20, 24" },
    { name: "anchorBoltLength", label: "Length (mm)", placeholder: "e.g., 200, 300, 400, 500, 600" },
    { name: "anchorBoltType", label: "Type", placeholder: "L-type / J-type / Sleeve" },
    { name: "anchorBoltGrade", label: "Grade", placeholder: "e.g., 8.8, 10.9" },
  ],
};


export const LIFTING_PULLING_MECHANISMS_SPECIFIC_FIELDS = {
  "Hoists (Chain, Wire Rope)": [
    { name: "hoistPullMechanism", label: "Pull Mechanism Type", placeholder: "e.g., Hand, Electric, Pneumatic" },
  ],
  "Trolleys (Hand, Electric)": [
    { name: "trolleyBrakingSystem", label: "Braking System", placeholder: "e.g., Electromagnetic, Mechanical, None" },
  ],
  "Pulleys": [
    { name: "pulleyGrooveType", label: "Groove Type", placeholder: "e.g., V-groove, U-groove, Flat" },
  ],
  "Wire Ropes": [
    { name: "ropeLayType", label: "Lay Type", placeholder: "e.g., Right Lay, Left Lay" },
    { name: "ropeCoreType", label: "Core Type", placeholder: "e.g., Steel, Fiber" },
  ],
  "Winch Drum": [
    { name: "drumMaterialGrade", label: "Material Grade", placeholder: "e.g., Cast Iron, Steel" },
    { name: "drumRopeCapacity", label: "Rope Capacity (m×diameter)", placeholder: "e.g., 500×10mm" },
  ],
  "Hydraulic System": [
    { name: "hydraulicMountingType", label: "Mounting Type", placeholder: "e.g., Flange, Foot, Custom" },
    { name: "hydraulicPressureRating", label: "Pressure Rating (bar)", placeholder: "e.g., 210, 280, 350" },
  ],
};

export const ELECTRICAL_AUTOMATION_SPECIFIC_FIELDS = {
  "Motors (AC, DC, Servo)": [
    { name: "motorInsulationClass", label: "Insulation Class", placeholder: "e.g., F, H" },
    { name: "motorMountingType", label: "Mounting Type", placeholder: "e.g., Flange, Foot, Face" },
  ],
  "VFD (Variable Frequency Drive)": [
    { name: "vfdInputPhase", label: "Input Phase", placeholder: "e.g., 1-phase, 3-phase" },
    { name: "vfdOutputPhase", label: "Output Phase", placeholder: "e.g., 3-phase" },
  ],
  "PLCs (Programmable Logic Controllers)": [
    { name: "plcCommunicationProtocol", label: "Communication Protocol", placeholder: "e.g., Ethernet, Profibus, Modbus" },
  ],
  "Control Panels": [
    { name: "panelComponentType", label: "Main Component Type", placeholder: "e.g., MCB, MCCB, Contactor, VFD, SMPS" },
    { name: "panelRating", label: "Rating (A/kW)", placeholder: "e.g., 63A, 30kW" },
  ],
  "Panel Components": [
    { name: "componentRating", label: "Rating (A/kW)", placeholder: "e.g., 10, 20, 50" },
    { name: "componentVoltage", label: "Voltage (V)", placeholder: "e.g., 230, 400, 415" },
    { name: "componentPhase", label: "Phase", placeholder: "e.g., 1-phase, 3-phase" },
    { name: "componentPoles", label: "Number of Poles", placeholder: "e.g., 1, 2, 3, 4" },
  ],
  "Sensors": [
    { name: "sensorRange", label: "Range", placeholder: "e.g., 0-10mm, 0-100mm, 0-500kg" },
    { name: "sensorVoltageRating", label: "Voltage Rating (V)", placeholder: "e.g., 24, 230" },
    { name: "sensorOutputType", label: "Output Type", placeholder: "e.g., NO, NC, Analog" },
  ],
  "Wiring": [
    { name: "powerCableSize", label: "Power Cable Size (sqmm)", placeholder: "e.g., 1.5, 2.5, 4, 6" },
    { name: "powerCableCoreCount", label: "Core Count", placeholder: "e.g., 2, 3, 4" },
    { name: "controlCableSize", label: "Control Cable Size (sqmm)", placeholder: "e.g., 0.5, 0.75, 1.0" },
    { name: "controlCableShielded", label: "Shielded/Unshielded", placeholder: "e.g., Shielded, Unshielded" },
    { name: "dragChainCableSize", label: "Drag Chain Cable Size (sqmm)", placeholder: "e.g., 1.0, 1.5, 2.5" },
    { name: "dragChainFlexibilityRating", label: "Flexibility Rating", placeholder: "e.g., 1M, 2M, 5M cycles" },
  ],
};

export const SAFETY_MATERIALS_SPECIFIC_FIELDS = {
  "Safety Guards (Mesh, Polycarbonate)": [
    { name: "guardFrameMaterial", label: "Frame Material", placeholder: "e.g., Aluminum, Steel" },
  ],
  "Safety Switches (Interlock, Limit)": [
    { name: "switchOutputType", label: "Output Type", placeholder: "e.g., NO, NC" },
  ],
  "Emergency Stop Buttons": [
    { name: "buttonActuatorType", label: "Actuator Type", placeholder: "e.g., Pushbutton, Rotary" },
  ],
  "Emergency Stop & Guards": [
    { name: "estopGuardType", label: "Type", placeholder: "e.g., E-stop, Guard Panel, Cover" },
    { name: "estopGuardSize", label: "Size (mm)", placeholder: "e.g., 500x500, 1000x1000" },
    { name: "estopGuardMaterial", label: "Material", placeholder: "e.g., Steel, Aluminum, Polycarbonate" },
  ],
  "Protective Barriers & Accessories": [
    { name: "barrierType", label: "Barrier Type", placeholder: "e.g., Safety Rail, Mesh Panel, Acrylic" },
    { name: "barrierDimension", label: "Height/Length (mm)", placeholder: "e.g., 1200 height, 2000 length" },
    { name: "barrierMaterial", label: "Material", placeholder: "e.g., Steel, Aluminum, Polycarbonate" },
  ],
};

export const SURFACE_PREP_PAINTING_SPECIFIC_FIELDS = {
  "Abrasive Materials (Grit, Shot)": [
    { name: "abrasiveRecycleCount", label: "Recycle Count", placeholder: "e.g., 1st use, Recycled" },
  ],
  "Primers": [
    { name: "primerMixingRatio", label: "Mixing Ratio", placeholder: "e.g., 2:1, 1:1" },
  ],
  "Top Coats": [
    { name: "topcoatMixingRatio", label: "Mixing Ratio", placeholder: "e.g., 2:1, 4:1" },
  ],
  "Blasting & Primer": [
    { name: "blastingGritType", label: "Grit Type", placeholder: "e.g., Sand, Steel Shot, Aluminum Oxide" },
    { name: "blastingGrade", label: "Blasting Grade", placeholder: "e.g., SA2, SA2.5" },
    { name: "primerTypeBlasting", label: "Primer Type", placeholder: "e.g., Epoxy, Polyester, Zinc-rich" },
    { name: "primerDFTRequired", label: "DFT Required (microns)", placeholder: "e.g., 75, 100, 125" },
  ],
  "Topcoat & Finishing": [
    { name: "topcoatShade", label: "PU Topcoat Shade", placeholder: "e.g., RAL 9016, Pantone 123" },
    { name: "topcoatMixingRatioFinish", label: "Mixing Ratio", placeholder: "e.g., 2:1, 4:1" },
    { name: "topcoatDFTRequired", label: "DFT Required (microns)", placeholder: "e.g., 75, 100, 150" },
  ],
};

export const FABRICATION_CONSUMABLES_SPECIFIC_FIELDS = {
  "Welding Rods (ER70S-6, E6013)": [
    { name: "rodStorageCondition", label: "Storage Condition", placeholder: "e.g., Dry, Baked at 200°C" },
  ],
  "Shielding Gas": [
    { name: "gasFlowRate", label: "Flow Rate (CFH)", placeholder: "e.g., 15-25" },
  ],
  "Flux & Additives": [
    { name: "fluxActivityLevel", label: "Activity Level", placeholder: "e.g., Low, Medium, High" },
  ],
  "Welding Materials": [
    { name: "electrodeType", label: "Electrode Type", placeholder: "e.g., E6013, E7018" },
    { name: "electrodeDiameter", label: "Diameter (mm)", placeholder: "e.g., 2.0, 2.5, 3.15" },
  ],
  "Cutting & Grinding": [
    { name: "cuttingWheelDiameter", label: "Cutting Wheel Diameter (mm)", placeholder: "e.g., 105, 115, 230" },
    { name: "grindingWheelGrit", label: "Grinding Wheel Grit", placeholder: "e.g., 60, 80, 120" },
  ],
};

export const HARDWARE_MISC_SPECIFIC_FIELDS = {
  "Bolts, Nuts, Screws": [
    { name: "fastenerLength", label: "Length (mm)", placeholder: "e.g., 20, 30, 50" },
  ],
  "Washers, Gaskets": [
    { name: "washerInnerDiameter", label: "Inner Diameter (mm)", placeholder: "e.g., 5, 8, 10" },
    { name: "washerOuterDiameter", label: "Outer Diameter (mm)", placeholder: "e.g., 10, 15, 20" },
  ],
  "Springs": [
    { name: "springFreeLengthHeight", label: "Free Length/Height (mm)", placeholder: "e.g., 30, 50, 100" },
  ],
  "Hardware Items": [
    { name: "hingeType", label: "Hinge Type", placeholder: "e.g., Butt, Piano, Continuous" },
    { name: "eyeBoltSize", label: "Eye Bolt Size (mm)", placeholder: "e.g., M6, M8, M10" },
    { name: "rubberPadSize", label: "Rubber Pad Size (mm)", placeholder: "e.g., 50x50, 100x100" },
  ],
  "Fasteners & Supports": [
    { name: "uClampSize", label: "U-Clamp Size (mm)", placeholder: "e.g., 32, 42, 50" },
    { name: "shackleSize", label: "Shackle Size (mm)", placeholder: "e.g., M12, M16, M20" },
    { name: "levelingJackCapacity", label: "Leveling Jack Capacity (tons)", placeholder: "e.g., 2, 5, 10" },
  ],
};

export const DOCUMENTATION_MATERIALS_SPECIFIC_FIELDS = {
  "Drawings (CAD, PDF)": [
    { name: "drawingNumbering", label: "Drawing Numbering System", placeholder: "e.g., DRG-001, ASM-A-001" },
  ],
  "Technical Specifications": [
    { name: "specApprovalStatus", label: "Approval Status", placeholder: "e.g., Draft, Approved, Superseded" },
  ],
  "Quality Documents (QAP, CoC)": [
    { name: "qapFrequency", label: "Inspection Frequency", placeholder: "e.g., 100%, 10%, 5%" },
  ],
  "Labeling & Tags": [
    { name: "tagType", label: "Tag Type", placeholder: "e.g., Serial Number, QR Code, Barcode" },
    { name: "tagMaterial", label: "Material", placeholder: "e.g., Aluminum, Stainless Steel, Plastic" },
    { name: "tagSize", label: "Size (mm)", placeholder: "e.g., 50x30, 100x50" },
  ],
  "Certificates & Documentation": [
    { name: "certificateType", label: "Certificate Type", placeholder: "e.g., Calibration, QC, FAT" },
    { name: "certificateExpiryDate", label: "Expiry Date", placeholder: "e.g., Valid for 12 months" },
  ],
};
