#!/usr/bin/env python3

content = '''
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
'''

file_path = r'd:\passion\Sterling-erp\frontend\src\components\admin\SalesOrderForm\constants.js'
with open(file_path, 'a', encoding='utf-8') as f:
    f.write('\n' + content)

print("Constants appended successfully")
