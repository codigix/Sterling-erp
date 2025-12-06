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
    { name: "shaftMaterial", label: "Material", placeholder: "e.g., EN8" },
    { name: "shaftTolerance", label: "Tolerance", placeholder: "e.g., h6" },
    { name: "shaftFinish", label: "Surface Finish", placeholder: "e.g., Ground" },
  ],
  Bushes: [
    { name: "bushInnerDiameter", label: "Inner Diameter (mm)", placeholder: "e.g., 20" },
    { name: "bushOuterDiameter", label: "Outer Diameter (mm)", placeholder: "e.g., 30" },
    { name: "bushLength", label: "Length (mm)", placeholder: "e.g., 25" },
    { name: "bushMaterial", label: "Material", placeholder: "e.g., Bronze" },
    { name: "bushFinish", label: "Surface Finish", placeholder: "e.g., Polished" },
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
  "Mild Steel (E250, E350)": [
    { name: "grade", label: "Grade Specification", placeholder: "e.g., E250, E350" },
    { name: "gradeCertificationRequired", label: "Certification Required", placeholder: "e.g., Yes, No" },
    { name: "gradeTestingStandards", label: "Testing Standards", placeholder: "e.g., IS 226, ASTM A36" },
  ],
  "High Tensile Steel (E450, E550)": [
    { name: "grade", label: "Grade Specification", placeholder: "e.g., E450, E550" },
    { name: "gradeCertificationRequired", label: "Certification Required", placeholder: "e.g., Yes, No" },
    { name: "gradeTestingStandards", label: "Testing Standards", placeholder: "e.g., IS 226, ASTM A572" },
  ],
  "Stainless Steel (304, 316)": [
    { name: "grade", label: "Grade Specification", placeholder: "e.g., 304, 316" },
    { name: "gradeCertificationRequired", label: "Certification Required", placeholder: "e.g., Yes, No" },
    { name: "gradeTestingStandards", label: "Testing Standards", placeholder: "e.g., ASTM A240, EN 10088" },
  ],
  "Aluminum Alloys": [
    { name: "grade", label: "Alloy Grade", placeholder: "e.g., 6061, 6063, 5052" },
    { name: "gradeCertificationRequired", label: "Certification Required", placeholder: "e.g., Yes, No" },
    { name: "gradeTestingStandards", label: "Testing Standards", placeholder: "e.g., ASTM B308, EN 573" },
  ],
};

export const FASTENER_TYPES_SPECS = {
  "Bolts": [
    { name: "fastenerSize", label: "Bolt Size (M×L)", placeholder: "e.g., M6x20, M8x30, M10x40" },
    { name: "fastenerQuantityPerUnit", label: "Quantity", placeholder: "e.g., 100, 500, 1000" },
    { name: "fastenerPlating", label: "Coating/Grade", placeholder: "e.g., 5.8, 8.8, 10.9, Zinc" },
  ],
  "Nuts": [
    { name: "fastenerSize", label: "Nut Size", placeholder: "e.g., M6, M8, M10, M12" },
    { name: "fastenerQuantityPerUnit", label: "Quantity", placeholder: "e.g., 100, 500, 1000" },
    { name: "fastenerPlating", label: "Coating/Grade", placeholder: "e.g., Plain, Zinc, Nylon Insert" },
  ],
  "Screws": [
    { name: "fastenerSize", label: "Screw Size (D×L)", placeholder: "e.g., 3x10, 5x20, 6x25" },
    { name: "fastenerQuantityPerUnit", label: "Quantity", placeholder: "e.g., 100, 500, 1000" },
    { name: "fastenerPlating", label: "Type/Coating", placeholder: "e.g., Machine, Wood, Phillips, Cross" },
  ],
  "Washers": [
    { name: "fastenerSize", label: "Washer Size", placeholder: "e.g., For M6, M8, M10" },
    { name: "fastenerQuantityPerUnit", label: "Quantity", placeholder: "e.g., 100, 500, 1000" },
    { name: "fastenerPlating", label: "Material/Type", placeholder: "e.g., Steel, Rubber, PTFE" },
  ],
};
