import React, { useState, useEffect } from "react";
import axios from "../../utils/api";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Card, { CardHeader, CardTitle, CardContent } from "../ui/Card";
import Modal from "../ui/Modal";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Upload,
  X,
  Save,
  Loader,
  Check,
  FileText,
  Zap,
  Package,
  Truck,
  CheckCircle,
  User,
  Edit,
} from "lucide-react";
import "./SalesOrderForm.css";

const WIZARD_STEPS = [
  { number: 1, name: "Client PO", icon: FileText },
  { number: 2, name: "Sales Order", icon: Zap },
  { number: 3, name: "Design Engineering", icon: FileText },
  { number: 4, name: "Material Requirement", icon: Package },
  { number: 5, name: "Production Plan", icon: Zap },
  { number: 6, name: "Quality Check", icon: Check },
  { number: 7, name: "Shipment", icon: Truck },
  { number: 8, name: "Delivery", icon: CheckCircle },
];

const MACHINED_PARTS_SPECS = {
  Shafts: [
    { name: "shaftDiameter", label: "Diameter (mm)", placeholder: "e.g., 25" },
    { name: "shaftLength", label: "Length (mm)", placeholder: "e.g., 100" },
    {
      name: "shaftMaterial",
      label: "Material",
      placeholder: "e.g., EN8, EN19",
    },
    { name: "shaftTolerance", label: "Tolerance", placeholder: "e.g., h6, h7" },
    {
      name: "shaftFinish",
      label: "Surface Finish",
      placeholder: "e.g., Hardened, Ground",
    },
  ],
  Bushes: [
    {
      name: "bushInnerDiameter",
      label: "Inner Diameter (mm)",
      placeholder: "e.g., 20",
    },
    {
      name: "bushOuterDiameter",
      label: "Outer Diameter (mm)",
      placeholder: "e.g., 30",
    },
    { name: "bushLength", label: "Length (mm)", placeholder: "e.g., 25" },
    {
      name: "bushMaterial",
      label: "Material",
      placeholder: "e.g., Bronze, Steel",
    },
    {
      name: "bushFinish",
      label: "Surface Finish",
      placeholder: "e.g., Polished, Plated",
    },
  ],
  Spacers: [
    {
      name: "spacerInnerDiameter",
      label: "Inner Diameter (mm)",
      placeholder: "e.g., 15",
    },
    {
      name: "spacerOuterDiameter",
      label: "Outer Diameter (mm)",
      placeholder: "e.g., 25",
    },
    { name: "spacerHeight", label: "Height (mm)", placeholder: "e.g., 10" },
    {
      name: "spacerMaterial",
      label: "Material",
      placeholder: "e.g., Mild Steel, Stainless",
    },
    {
      name: "spacerFinish",
      label: "Surface Finish",
      placeholder: "e.g., Zinc plated, Painted",
    },
  ],
  "Machined brackets": [
    { name: "bracketLength", label: "Length (mm)", placeholder: "e.g., 100" },
    { name: "bracketWidth", label: "Width (mm)", placeholder: "e.g., 50" },
    { name: "bracketHeight", label: "Height (mm)", placeholder: "e.g., 30" },
    {
      name: "bracketHoles",
      label: "Bolt Pattern / Holes",
      placeholder: "e.g., 4 holes M8",
    },
    {
      name: "bracketMaterial",
      label: "Material",
      placeholder: "e.g., Mild Steel, Aluminium",
    },
    {
      name: "bracketFinish",
      label: "Surface Finish",
      placeholder: "e.g., Painted, Powder coated",
    },
  ],
  Flanges: [
    {
      name: "flangeDiameter",
      label: "Flange Diameter (mm)",
      placeholder: "e.g., 100",
    },
    {
      name: "flangeThickness",
      label: "Thickness (mm)",
      placeholder: "e.g., 12",
    },
    {
      name: "flangeBoreDiameter",
      label: "Bore Diameter (mm)",
      placeholder: "e.g., 40",
    },
    {
      name: "flangeBoltPattern",
      label: "Bolt Pattern",
      placeholder: "e.g., 4x M10",
    },
    {
      name: "flangeMaterial",
      label: "Material",
      placeholder: "e.g., MS, SS304",
    },
    {
      name: "flangeFinish",
      label: "Surface Finish",
      placeholder: "e.g., Polished, Anodized",
    },
  ],
  "Bearing housings": [
    {
      name: "housingBoreDiameter",
      label: "Bore Diameter (mm)",
      placeholder: "e.g., 50",
    },
    {
      name: "housingOuterDimension",
      label: "Outer Dimension (mm)",
      placeholder: "e.g., 120x80x60",
    },
    {
      name: "housingMountingType",
      label: "Mounting Type",
      placeholder: "e.g., Flange, Foot mount",
    },
    {
      name: "housingBearingType",
      label: "Bearing Type",
      placeholder: "e.g., Deep groove, Tapered",
    },
    {
      name: "housingMaterial",
      label: "Material",
      placeholder: "e.g., Cast Iron, Aluminium",
    },
    {
      name: "housingFinish",
      label: "Surface Finish",
      placeholder: "e.g., Painted, Epoxy",
    },
  ],
};

const ROLLER_MOVEMENT_COMPONENTS_SPECS = {
  "Rollers (Nylon/PU/Steel)": [
    { name: "rollerDiameter", label: "Diameter (mm)", placeholder: "e.g., 50" },
    {
      name: "rollerMaterial",
      label: "Material",
      placeholder: "e.g., Nylon, PU, Steel",
    },
    { name: "rollerWidth", label: "Width (mm)", placeholder: "e.g., 30" },
    {
      name: "rollerLoadCapacity",
      label: "Load Capacity (kg)",
      placeholder: "e.g., 500",
    },
    {
      name: "rollerFinish",
      label: "Surface Finish",
      placeholder: "e.g., Chromated, Painted",
    },
  ],
  "Bearings (ball, tapered, spherical)": [
    {
      name: "bearingType",
      label: "Type",
      placeholder: "e.g., Ball, Tapered, Spherical",
    },
    {
      name: "bearingBoreDiameter",
      label: "Bore Diameter (mm)",
      placeholder: "e.g., 20",
    },
    {
      name: "bearingOuterDiameter",
      label: "Outer Diameter (mm)",
      placeholder: "e.g., 52",
    },
    { name: "bearingWidth", label: "Width (mm)", placeholder: "e.g., 15" },
    {
      name: "bearingLoadRating",
      label: "Load Rating (kg)",
      placeholder: "e.g., 1000",
    },
  ],
  "Linear guide rails": [
    {
      name: "railType",
      label: "Rail Type",
      placeholder: "e.g., THK, Hiwin, Bosch",
    },
    { name: "railLength", label: "Length (mm)", placeholder: "e.g., 1000" },
    {
      name: "railLoadCapacity",
      label: "Load Capacity (kg)",
      placeholder: "e.g., 2000",
    },
    {
      name: "railMountType",
      label: "Mount Type",
      placeholder: "e.g., Top, Side, Bottom",
    },
    {
      name: "railFinish",
      label: "Surface Finish",
      placeholder: "e.g., Chrome, Stainless",
    },
  ],
  "Guide wheels": [
    { name: "wheelDiameter", label: "Diameter (mm)", placeholder: "e.g., 80" },
    { name: "wheelWidth", label: "Width (mm)", placeholder: "e.g., 40" },
    {
      name: "wheelMaterial",
      label: "Material",
      placeholder: "e.g., Nylon, Polyurethane, Steel",
    },
    {
      name: "wheelLoadCapacity",
      label: "Load Capacity (kg)",
      placeholder: "e.g., 1500",
    },
    {
      name: "wheelMountType",
      label: "Mount Type",
      placeholder: "e.g., Eccentric, Fixed",
    },
  ],
  "Gear racks / pinions (if motorized movement)": [
    { name: "gearType", label: "Type", placeholder: "e.g., Rack, Pinion" },
    { name: "gearModule", label: "Module", placeholder: "e.g., 2.0, 2.5, 3.0" },
    {
      name: "gearTeethCount",
      label: "Teeth Count",
      placeholder: "e.g., 30, 50",
    },
    {
      name: "gearMaterial",
      label: "Material",
      placeholder: "e.g., Steel, Cast Iron",
    },
    {
      name: "gearFinish",
      label: "Surface Finish",
      placeholder: "e.g., Hardened, Tempered",
    },
  ],
};

const LIFTING_PULLING_MECHANISMS_SPECS = {
  "Winch System": [
    {
      name: "winchDrumDiameter",
      label: "Winch Drum Diameter (mm)",
      placeholder: "e.g., 400",
    },
    {
      name: "winchDrumWidth",
      label: "Winch Drum Width (mm)",
      placeholder: "e.g., 200",
    },
    {
      name: "wireRopeType",
      label: "Wire Rope (steel cord) Type",
      placeholder: "e.g., 6x19, 8x19",
    },
    {
      name: "wireRopeDiameter",
      label: "Wire Rope Diameter (mm)",
      placeholder: "e.g., 12",
    },
    {
      name: "gearboxType",
      label: "Gearbox Type",
      placeholder: "e.g., Planetary, Helical",
    },
    {
      name: "gearboxRatio",
      label: "Gearbox Ratio",
      placeholder: "e.g., 10:1, 20:1",
    },
    {
      name: "motorType",
      label: "Electric Motor (3-phase)",
      placeholder: "e.g., 5.5 kW, 7.5 kW",
    },
    {
      name: "couplingType",
      label: "Couplings Type",
      placeholder: "e.g., Flexible, Rigid",
    },
    {
      name: "tensionerSpringType",
      label: "Tensioner Springs Type",
      placeholder: "e.g., Coil, Disc",
    },
    {
      name: "hookType",
      label: "Hooks / D-shackles Type",
      placeholder: "e.g., Lifting Hook, D-shackle",
    },
  ],
  "Hydraulic System": [
    {
      name: "cylinderType",
      label: "Cylinder Type",
      placeholder: "e.g., Single Acting, Double Acting",
    },
    {
      name: "cylinderBoreDiameter",
      label: "Cylinder Bore Diameter (mm)",
      placeholder: "e.g., 80",
    },
    {
      name: "cylinderStroke",
      label: "Cylinder Stroke (mm)",
      placeholder: "e.g., 500",
    },
    {
      name: "loadCapacity",
      label: "Load Capacity (kg)",
      placeholder: "e.g., 5000",
    },
    {
      name: "powerPackCapacity",
      label: "Power Pack Capacity (liters)",
      placeholder: "e.g., 50",
    },
    {
      name: "operatingPressure",
      label: "Operating Pressure (bar)",
      placeholder: "e.g., 210",
    },
    { name: "hoseSize", label: "Hose Size (mm)", placeholder: "e.g., DN25" },
    {
      name: "fittingType",
      label: "Fitting Type",
      placeholder: "e.g., SAE, ISO",
    },
  ],
};

const ELECTRICAL_AUTOMATION_SPECS = {
  "Panel Components": [
    {
      name: "mcbType",
      label: "MCB / MCCB Type",
      placeholder: "e.g., C16, C32, Miniature Circuit Breaker",
    },
    {
      name: "contactorRating",
      label: "Contactor Rating",
      placeholder: "e.g., 16A, 32A, 63A",
    },
    {
      name: "relayType",
      label: "Relay Type",
      placeholder: "e.g., Electromagnetic, Electronic",
    },
    {
      name: "vfdRating",
      label: "VFD Rating (if needed)",
      placeholder: "e.g., 1.5 kW, 3 kW, 5.5 kW",
    },
    {
      name: "smpsRating",
      label: "SMPS Rating",
      placeholder: "e.g., 24V, 10A; 48V, 5A",
    },
    {
      name: "terminalBlockType",
      label: "Terminal Blocks Type",
      placeholder: "e.g., DIN Rail, Screw Type",
    },
    {
      name: "cableGlandSize",
      label: "Cable Glands Size (mm)",
      placeholder: "e.g., M16, M20, M25",
    },
  ],
  Sensors: [
    {
      name: "limitSwitchType",
      label: "Limit Switches Type",
      placeholder: "e.g., Roller Lever, Pushwheel",
    },
    {
      name: "proximitySensorType",
      label: "Proximity Sensors Type",
      placeholder: "e.g., Inductive, Capacitive",
    },
    {
      name: "loadCellCapacity",
      label: "Load Cells Capacity (kg)",
      placeholder: "e.g., 50, 100, 500",
    },
    {
      name: "positionSensorType",
      label: "Position Sensors Type",
      placeholder: "e.g., LVDT, Potentiometric",
    },
    {
      name: "sensorOutput",
      label: "Sensor Output Type",
      placeholder: "e.g., Analog, Digital, 4-20mA",
    },
    {
      name: "sensorAccuracy",
      label: "Sensor Accuracy",
      placeholder: "e.g., ±0.5%, ±1%",
    },
    { name: "sensorIP", label: "IP Rating", placeholder: "e.g., IP65, IP67" },
  ],
  Wiring: [
    {
      name: "powerCableSize",
      label: "Power Cable Size (sq.mm)",
      placeholder: "e.g., 4, 6, 10, 16",
    },
    {
      name: "powerCableType",
      label: "Power Cable Type",
      placeholder: "e.g., PVC, Armoured, Flexible",
    },
    {
      name: "controlCableSize",
      label: "Control Cable Size (sq.mm)",
      placeholder: "e.g., 0.5, 0.75, 1",
    },
    {
      name: "controlCableType",
      label: "Control Cable Type",
      placeholder: "e.g., Multi-core, Twisted Pair",
    },
    {
      name: "dragChainCableLength",
      label: "Drag Chain Cable Length (m)",
      placeholder: "e.g., 5, 10, 20",
    },
    {
      name: "dragChainCableType",
      label: "Drag Chain Cable Type",
      placeholder: "e.g., Polyurethane, TPE",
    },
    {
      name: "cableConnectorType",
      label: "Cable Connectors Type",
      placeholder: "e.g., Phoenix, Terminal Blocks",
    },
  ],
};

const SAFETY_MATERIALS_SPECS = {
  "Emergency Stop & Guards": [
    {
      name: "eStopType",
      label: "Emergency Stop Switch Type",
      placeholder: "e.g., 40mm Mushroom, 60mm",
    },
    {
      name: "eStopRating",
      label: "E-Stop Rating",
      placeholder: "e.g., 40A, 63A",
    },
    {
      name: "guardMaterial",
      label: "Safety Guards/Covers Material",
      placeholder: "e.g., Steel, Polycarbonate, Expanded Metal",
    },
    {
      name: "guardThickness",
      label: "Guard Thickness (mm)",
      placeholder: "e.g., 2, 3, 5",
    },
    {
      name: "labelType",
      label: "Warning Labels Type",
      placeholder: "e.g., ISO 7010, ANSI, Custom",
    },
    {
      name: "labelQuantity",
      label: "Label Quantity",
      placeholder: "e.g., 5, 10, 20",
    },
    {
      name: "lockingPinType",
      label: "Locking Pins Type",
      placeholder: "e.g., Clevis Pin, Quick Release",
    },
  ],
  "Protective Barriers & Accessories": [
    {
      name: "antiSlipMatType",
      label: "Anti-slip Mats Type",
      placeholder: "e.g., Rubber, PVC, Textured",
    },
    {
      name: "antiSlipMatDimension",
      label: "Mats Dimension (mm)",
      placeholder: "e.g., 1000x500, 500x500",
    },
    {
      name: "antiSlipMatThickness",
      label: "Mat Thickness (mm)",
      placeholder: "e.g., 3, 5, 10",
    },
    {
      name: "chainBarrierType",
      label: "Chain/Rope Barriers Type",
      placeholder: "e.g., Steel Chain, Nylon Rope",
    },
    {
      name: "chainBarrierLength",
      label: "Barrier Length (m)",
      placeholder: "e.g., 10, 20, 50",
    },
    {
      name: "chainDiameter",
      label: "Chain/Rope Diameter (mm)",
      placeholder: "e.g., 6, 8, 10",
    },
    {
      name: "barrierPostType",
      label: "Barrier Post Type",
      placeholder: "e.g., Removable, Fixed, Retractable",
    },
  ],
};

const SURFACE_PREP_PAINTING_SPECS = {
  "Blasting & Primer": [
    {
      name: "blastingGritSize",
      label: "Shot Blasting Grit Size",
      placeholder: "e.g., S70, S90, S110",
    },
    {
      name: "blastingGritQuantity",
      label: "Grit Quantity (kg)",
      placeholder: "e.g., 50, 100, 500",
    },
    {
      name: "blastingGritType",
      label: "Grit Type",
      placeholder: "e.g., Steel Cut Wire, Chilled Iron Shot",
    },
    {
      name: "primerType",
      label: "Epoxy Zinc Primer Type",
      placeholder: "e.g., Zinc Rich, High Build",
    },
    {
      name: "primerThickness",
      label: "Primer Coating Thickness (microns)",
      placeholder: "e.g., 75, 100, 150",
    },
    {
      name: "primerQuantity",
      label: "Primer Quantity (liters)",
      placeholder: "e.g., 5, 10, 20",
    },
    {
      name: "primerCoverageArea",
      label: "Coverage Area (sq.m/liter)",
      placeholder: "e.g., 8, 10, 12",
    },
  ],
  "Topcoat & Finishing": [
    {
      name: "topcoatType",
      label: "PU Topcoat Paint Type",
      placeholder: "e.g., 2K Polyurethane, Single Component",
    },
    {
      name: "topcoatColor",
      label: "Topcoat Color",
      placeholder: "e.g., Blue, Red, Custom RAL",
    },
    {
      name: "topcoatQuantity",
      label: "Topcoat Quantity (liters)",
      placeholder: "e.g., 5, 10, 20",
    },
    {
      name: "thinnerType",
      label: "Thinner Type",
      placeholder: "e.g., Standard, Slow Evaporating",
    },
    {
      name: "thinnerQuantity",
      label: "Thinner Quantity (liters)",
      placeholder: "e.g., 1, 2, 5",
    },
    {
      name: "puttyType",
      label: "Putty/Filler Type",
      placeholder: "e.g., Epoxy Putty, Polyester Filler",
    },
    {
      name: "rustOilType",
      label: "Rust Preventive Oil Type",
      placeholder: "e.g., Thin Film, Thick Film",
    },
  ],
};

const FABRICATION_CONSUMABLES_SPECS = {
  "Welding Materials": [
    {
      name: "electrodeType",
      label: "Welding Electrodes Type",
      placeholder: "e.g., E6013, E7018, Stainless",
    },
    {
      name: "electrodeDiameter",
      label: "Electrode Diameter (mm)",
      placeholder: "e.g., 2.5, 3.2, 4.0",
    },
    {
      name: "electrodeQuantity",
      label: "Electrode Quantity (kg)",
      placeholder: "e.g., 5, 10, 25",
    },
    {
      name: "migTigWireType",
      label: "MIG/TIG Wire Type",
      placeholder: "e.g., ER70S-6, ER308, ER309",
    },
    {
      name: "wireDiameter",
      label: "Wire Diameter (mm)",
      placeholder: "e.g., 0.8, 1.0, 1.2",
    },
    {
      name: "wireQuantity",
      label: "Wire Quantity (kg)",
      placeholder: "e.g., 5, 10, 20",
    },
    {
      name: "gasType",
      label: "Gas Type",
      placeholder: "e.g., CO₂ (Argon, Argon+CO₂ Mix)",
    },
  ],
  "Cutting & Grinding": [
    {
      name: "cuttingWheelType",
      label: "Cutting Wheels Type",
      placeholder: "e.g., Abrasive, Diamond",
    },
    {
      name: "cuttingWheelDiameter",
      label: "Cutting Wheel Diameter (mm)",
      placeholder: "e.g., 100, 115, 125",
    },
    {
      name: "cuttingWheelThickness",
      label: "Wheel Thickness (mm)",
      placeholder: "e.g., 1.0, 1.6, 2.0",
    },
    {
      name: "grintingWheelGrit",
      label: "Grinding Wheel Grit Size",
      placeholder: "e.g., 80, 120, 180",
    },
    {
      name: "grindingWheelDiameter",
      label: "Grinding Wheel Diameter (mm)",
      placeholder: "e.g., 150, 200, 250",
    },
    {
      name: "buffingWheelType",
      label: "Buffing Wheel Type",
      placeholder: "e.g., Cotton, Sisal, Synthetic",
    },
    {
      name: "buffingWheelDiameter",
      label: "Buffing Wheel Diameter (mm)",
      placeholder: "e.g., 100, 150, 200",
    },
  ],
};

const HARDWARE_MISC_SPECS = {
  "Hardware Items": [
    {
      name: "hingeType",
      label: "Hinges Type",
      placeholder: "e.g., Piano Hinge, Butt Hinge, Continuous",
    },
    {
      name: "hingeSize",
      label: "Hinge Size (mm)",
      placeholder: "e.g., 40x40, 50x50, 75x75",
    },
    { name: "hingeQuantity", label: "Quantity", placeholder: "e.g., 2, 4, 8" },
    {
      name: "lugType",
      label: "Lugs Type",
      placeholder: "e.g., Cable Lug, Tab Lug, Ring Lug",
    },
    {
      name: "lugSize",
      label: "Lug Size (sq.mm)",
      placeholder: "e.g., 6, 10, 16",
    },
    {
      name: "eyeBoltSize",
      label: "Eye Bolts Size (mm)",
      placeholder: "e.g., M8, M10, M12",
    },
    {
      name: "uClampSize",
      label: "U-Clamps Size (mm)",
      placeholder: "e.g., M8, M10, M16",
    },
  ],
  "Fasteners & Supports": [
    {
      name: "shackleType",
      label: "Shackles Type",
      placeholder: "e.g., D-Shackle, Bow Shackle, Anchor",
    },
    {
      name: "shackleRating",
      label: "Shackle SWL Rating (tonnes)",
      placeholder: "e.g., 1, 2, 5",
    },
    {
      name: "rubberPadSize",
      label: "Rubber Pads Size (mm)",
      placeholder: "e.g., 50x50, 75x75, 100x100",
    },
    {
      name: "rubberPadThickness",
      label: "Pad Thickness (mm)",
      placeholder: "e.g., 5, 10, 15",
    },
    {
      name: "levelingJackType",
      label: "Leveling Jacks Type",
      placeholder: "e.g., Screw Jack, Hydraulic, Adjustable Feet",
    },
    {
      name: "jackCapacity",
      label: "Jack Capacity (tonnes)",
      placeholder: "e.g., 1, 2.5, 5",
    },
    {
      name: "jackHeight",
      label: "Jack Height Range (mm)",
      placeholder: "e.g., 50-150, 100-200",
    },
  ],
};

const DOCUMENTATION_MATERIALS_SPECS = {
  "Labeling & Tags": [
    {
      name: "nameplateType",
      label: "Name Plates Type",
      placeholder: "e.g., Aluminum, Stainless Steel, Plastic",
    },
    {
      name: "nameplateDimension",
      label: "Nameplate Dimension (mm)",
      placeholder: "e.g., 50x30, 100x50",
    },
    {
      name: "nameplateQuantity",
      label: "Quantity",
      placeholder: "e.g., 5, 10, 20",
    },
    {
      name: "serialTagType",
      label: "Serial Number Tags Type",
      placeholder: "e.g., Barcode, QR Code, Engraved",
    },
    {
      name: "serialTagFormat",
      label: "Tag Format",
      placeholder: "e.g., Sequential, Custom Format",
    },
    {
      name: "tagQuantity",
      label: "Tag Quantity",
      placeholder: "e.g., 10, 50, 100",
    },
    {
      name: "printingMethod",
      label: "Printing Method",
      placeholder: "e.g., Laser Engraving, UV Printing",
    },
  ],
  "Certificates & Documentation": [
    {
      name: "calibrationCertType",
      label: "Calibration Certificates Type",
      placeholder: "e.g., Internal, External (NABL)",
    },
    {
      name: "testEquipment",
      label: "Test Equipment Calibrated",
      placeholder: "e.g., Pressure Gauge, Weighing Scale",
    },
    {
      name: "inspectionReportFormat",
      label: "Inspection Report Format",
      placeholder: "e.g., Standard, Detailed, Custom",
    },
    {
      name: "qcStickerType",
      label: "QC Stickers Type",
      placeholder: "e.g., Passed, Failed, Hold for Review",
    },
    {
      name: "stickerQuantity",
      label: "Sticker Quantity",
      placeholder: "e.g., 50, 100, 500",
    },
    {
      name: "documentationLevel",
      label: "Documentation Level",
      placeholder: "e.g., Level 1, Level 2, Complete",
    },
    {
      name: "archivalRequirement",
      label: "Archival/Record Keeping",
      placeholder: "e.g., 1 Year, 3 Years, 5 Years",
    },
  ],
};

const PRODUCTION_PHASES = {
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

const PRODUCTION_PHASE_FORMS = {
  marking: [
    {
      name: "componentName",
      label: "Component Name",
      type: "text",
      placeholder: "e.g., Shaft Assembly, Plate Frame",
    },
    {
      name: "drawingNo",
      label: "Drawing No. & Revision",
      type: "text",
      placeholder: "e.g., DRG-001-R2",
    },
    {
      name: "markingMethod",
      label: "Marking Method",
      type: "select",
      options: ["Hand", "Auto marking"],
      placeholder: "",
    },
    {
      name: "dimensionsMarked",
      label: "Dimensions Marked",
      type: "text",
      placeholder: "e.g., 50mm, 100mm, Ø25mm",
    },
    {
      name: "toolsUsed",
      label: "Tools Used",
      type: "text",
      placeholder: "e.g., Marker, Scribe, Punch, Layout Fluid",
    },
    {
      name: "markingDoneBy",
      label: "Marking Done By",
      type: "text",
      placeholder: "e.g., John Doe",
    },
    {
      name: "markingDate",
      label: "Marking Date",
      type: "date",
      placeholder: "",
    },
    {
      name: "remarks",
      label: "Remarks",
      type: "textarea",
      placeholder:
        "e.g., Follow drawing DRG-001 exactly, Use waterproof marker",
    },
    {
      name: "qcInspectionResult",
      label: "QC Inspection Result",
      type: "select",
      options: ["Pass", "Fail", "Pending"],
      placeholder: "",
    },
    {
      name: "markingPhoto",
      label: "Upload Marking Photo",
      type: "file",
      placeholder: "",
    },
  ],
  cutting_laser: [
    {
      name: "quantity",
      label: "Quantity",
      type: "number",
      placeholder: "e.g., 10, 50",
    },
    {
      name: "estimatedHours",
      label: "Estimated Hours",
      type: "number",
      placeholder: "e.g., 4, 8",
    },
    {
      name: "responsiblePerson",
      label: "Responsible Person / Team",
      type: "text",
      placeholder: "e.g., Laser Operator",
    },
    {
      name: "equipmentRequired",
      label: "Equipment Required",
      type: "text",
      placeholder: "e.g., Laser Cutter, Plasma Cutter",
    },
    {
      name: "materialSpecs",
      label: "Material Specifications",
      type: "text",
      placeholder: "e.g., Material Type, Thickness",
    },
    {
      name: "specialInstructions",
      label: "Special Instructions / Notes",
      type: "textarea",
      placeholder: "e.g., Kerf compensation: 0.2mm",
    },
    {
      name: "estimatedCost",
      label: "Estimated Cost ($)",
      type: "number",
      placeholder: "e.g., 200",
    },
    {
      name: "qualityStandards",
      label: "Quality Standards",
      type: "text",
      placeholder: "e.g., Sharp edges, no burrs",
    },
  ],
  cutting: [
    {
      name: "componentName",
      label: "Component Name",
      type: "text",
      placeholder: "e.g., Base Plate, Side Frame",
    },
    {
      name: "cuttingMethod",
      label: "Cutting Method",
      type: "select",
      options: ["Laser", "Plasma", "Bandsaw"],
      placeholder: "",
    },
    {
      name: "materialThickness",
      label: "Material Thickness",
      type: "text",
      placeholder: "e.g., 5mm, 10mm",
    },
    {
      name: "cutLength",
      label: "Cut Length / Width",
      type: "text",
      placeholder: "e.g., 1000mm x 500mm",
    },
    {
      name: "nestingFile",
      label: "Nesting File Upload",
      type: "file",
      placeholder: "",
    },
    {
      name: "machineId",
      label: "Machine ID",
      type: "text",
      placeholder: "e.g., CUT-001, PLASMA-02",
    },
    {
      name: "operatorName",
      label: "Operator Name",
      type: "text",
      placeholder: "e.g., John Doe",
    },
    {
      name: "startTime",
      label: "Start Time",
      type: "datetime-local",
      placeholder: "",
    },
    {
      name: "endTime",
      label: "End Time",
      type: "datetime-local",
      placeholder: "",
    },
    {
      name: "edgeQualityCheck",
      label: "Edge Quality Check",
      type: "select",
      options: ["OK", "NG"],
      placeholder: "",
    },
    {
      name: "dimensionalCheck",
      label: "Dimensional Check (mm)",
      type: "text",
      placeholder: "e.g., ±0.5mm",
    },
    {
      name: "qcStatus",
      label: "QC Status",
      type: "select",
      options: ["Approved", "Rejected", "Pending"],
      placeholder: "",
    },
    {
      name: "cutComponentImage",
      label: "Upload Cut Component Image",
      type: "file",
      placeholder: "",
    },
  ],
  edge_prep: [
    {
      name: "componentName",
      label: "Component Name",
      type: "text",
      placeholder: "e.g., Base Plate, Side Beam",
    },
    {
      name: "bevelAngle",
      label: "Bevel Angle",
      type: "text",
      placeholder: "e.g., 45°, 30°",
    },
    {
      name: "bevelType",
      label: "Bevel Type",
      type: "select",
      options: ["Single", "Double"],
      placeholder: "",
    },
    {
      name: "lengthPrepared",
      label: "Length Prepared",
      type: "text",
      placeholder: "e.g., 1000mm, 500mm",
    },
    {
      name: "grinderId",
      label: "Grinder ID",
      type: "text",
      placeholder: "e.g., GRD-001, GRIND-02",
    },
    {
      name: "operatorName",
      label: "Operator Name",
      type: "text",
      placeholder: "e.g., John Doe",
    },
    { name: "prepDate", label: "Date", type: "date", placeholder: "" },
    {
      name: "qcResult",
      label: "QC Result",
      type: "select",
      options: ["Pass", "Fail", "Pending"],
      placeholder: "",
    },
    {
      name: "edgePrepImage",
      label: "Upload Image",
      type: "file",
      placeholder: "",
    },
  ],
  mig_welding: [
    {
      name: "weldJointNo",
      label: "Weld Joint No.",
      type: "text",
      placeholder: "e.g., WJ-001, Joint-A1",
    },
    {
      name: "weldingProcess",
      label: "Welding Process",
      type: "select",
      options: ["MIG", "SMAW", "TIG"],
      placeholder: "",
    },
    {
      name: "electrodeWireType",
      label: "Electrode / Wire Type",
      type: "text",
      placeholder: "e.g., ER70S-2, AWS E6010",
    },
    {
      name: "currentVoltage",
      label: "Current & Voltage",
      type: "text",
      placeholder: "e.g., 200A, 28V",
    },
    {
      name: "wpsNo",
      label: "WPS No. (Welding Procedure Spec)",
      type: "text",
      placeholder: "e.g., WPS-2024-001",
    },
    {
      name: "welderId",
      label: "Welder ID",
      type: "text",
      placeholder: "e.g., W-001, Welder-123",
    },
    {
      name: "noOfPasses",
      label: "No. of Passes",
      type: "number",
      placeholder: "e.g., 3, 5",
    },
    {
      name: "weldLengthCompleted",
      label: "Weld Length Completed",
      type: "text",
      placeholder: "e.g., 500mm, 1000mm",
    },
    {
      name: "preheatTemp",
      label: "Preheat Temp (if used)",
      type: "text",
      placeholder: "e.g., 150°C, 200°C",
    },
    {
      name: "postweldObservation",
      label: "Post-weld Observation",
      type: "textarea",
      placeholder: "e.g., Good bead appearance, No visible cracks",
    },
    {
      name: "ndtRequired",
      label: "NDT Required",
      type: "select",
      options: ["Yes", "No"],
      placeholder: "",
    },
    {
      name: "qcStatus",
      label: "QC Status (Visual/NDT)",
      type: "select",
      options: ["Pass", "Fail", "Pending"],
      placeholder: "",
    },
    {
      name: "weldPhoto",
      label: "Upload Weld Photo",
      type: "file",
      placeholder: "",
    },
  ],
  fit_up: [
    {
      name: "assemblyName",
      label: "Assembly Name",
      type: "text",
      placeholder: "e.g., Main Frame Assembly, Base Plate Assembly",
    },
    {
      name: "fitUpDrawingNo",
      label: "Fit-Up Drawing No.",
      type: "text",
      placeholder: "e.g., DRG-FU-001, FITUP-A2",
    },
    {
      name: "rootGapRequired",
      label: "Root Gap Required (mm)",
      type: "text",
      placeholder: "e.g., 2-3mm, 1.5-2.5mm",
    },
    {
      name: "misalignmentAllowed",
      label: "Misalignment Allowed (mm)",
      type: "text",
      placeholder: "e.g., ±1.0mm, ±0.5mm",
    },
    {
      name: "tackWeldCount",
      label: "Tack Weld Count",
      type: "number",
      placeholder: "e.g., 4, 6, 8",
    },
    {
      name: "fitUpDoneBy",
      label: "Fit-Up Done By",
      type: "text",
      placeholder: "e.g., John Doe, Technician-123",
    },
    {
      name: "inspectorName",
      label: "Inspector Name",
      type: "text",
      placeholder: "e.g., Inspector-001, Quality Lead",
    },
    {
      name: "fitUpStatus",
      label: "Fit-Up Status",
      type: "select",
      options: ["Approved", "Rework Required", "Rejected"],
      placeholder: "",
    },
    {
      name: "fitUpImage",
      label: "Upload Fit-Up Image",
      type: "file",
      placeholder: "",
    },
  ],
  structure_fabrication: [
    {
      name: "structureName",
      label: "Structure Name",
      type: "select",
      options: ["Base Frame", "Support", "Rail"],
      placeholder: "",
    },
    {
      name: "drawingNo",
      label: "Drawing No.",
      type: "text",
      placeholder: "e.g., DRG-SF-001, STRUCT-A1",
    },
    {
      name: "frameDimensions",
      label: "Frame Dimensions (L×W×H)",
      type: "text",
      placeholder: "e.g., 1000×500×800mm",
    },
    {
      name: "squarenessCheck",
      label: "Squareness Check (mm)",
      type: "text",
      placeholder: "e.g., ±2mm, ±1.5mm",
    },
    {
      name: "diagonalCheck",
      label: "Diagonal Check (mm)",
      type: "text",
      placeholder: "e.g., ±3mm, Diagonal 1414±5mm",
    },
    {
      name: "flatnessCheck",
      label: "Flatness Check",
      type: "text",
      placeholder: "e.g., ±1mm, ±0.5mm over 1m",
    },
    {
      name: "fabricatedBy",
      label: "Fabricated By",
      type: "text",
      placeholder: "e.g., Tech-001, Fabrication Lead",
    },
    {
      name: "completionDate",
      label: "Completion Date",
      type: "date",
      placeholder: "",
    },
    {
      name: "qcApproval",
      label: "QC Approval",
      type: "select",
      options: ["Approved", "Conditional", "Rejected"],
      placeholder: "",
    },
    {
      name: "assemblyImage",
      label: "Upload Assembly Image",
      type: "file",
      placeholder: "",
    },
  ],
  heat_treatment: [
    {
      name: "componentName",
      label: "Component Name",
      type: "text",
      placeholder: "e.g., Shaft, Plate, Coupling",
    },
    {
      name: "htType",
      label: "Type",
      type: "select",
      options: ["Stress Relief", "Normalizing", "Annealing"],
      placeholder: "",
    },
    {
      name: "temperatureRange",
      label: "Temperature Range",
      type: "text",
      placeholder: "e.g., 850-870°C, 650-700°C",
    },
    {
      name: "heatingTime",
      label: "Heating Time",
      type: "text",
      placeholder: "e.g., 1 hour, 2.5 hours",
    },
    {
      name: "coolingMethod",
      label: "Cooling Method",
      type: "text",
      placeholder: "e.g., Oil quench, Air cool, Furnace cool",
    },
    {
      name: "htCycleChart",
      label: "HT Cycle Chart Upload",
      type: "file",
      placeholder: "",
    },
    {
      name: "htCompletedBy",
      label: "HT Completed By",
      type: "text",
      placeholder: "e.g., Tech-001, HT Specialist",
    },
    {
      name: "qcStatus",
      label: "QC Status",
      type: "select",
      options: ["Pass", "Fail", "Pending"],
      placeholder: "",
    },
  ],
  drilling: [
    {
      name: "componentName",
      label: "Component Name",
      type: "text",
      placeholder: "e.g., Plate, Shaft, Housing",
    },
    {
      name: "holeSize",
      label: "Hole Size",
      type: "text",
      placeholder: "e.g., 10mm, M12, Ø8mm",
    },
    {
      name: "holeDepth",
      label: "Hole Depth",
      type: "text",
      placeholder: "e.g., 25mm, Through, 15mm",
    },
    {
      name: "numberOfHoles",
      label: "Number of Holes",
      type: "number",
      placeholder: "e.g., 4, 6, 8",
    },
    {
      name: "machineId",
      label: "Machine ID",
      type: "text",
      placeholder: "e.g., CNC-DRILL-001, DRILL-02",
    },
    {
      name: "operatorName",
      label: "Operator Name",
      type: "text",
      placeholder: "e.g., John Doe, CNC Operator",
    },
    {
      name: "toolUsed",
      label: "Tool Used",
      type: "text",
      placeholder: "e.g., Drill Bit ø10mm, Twist Drill",
    },
    {
      name: "dimensionalCheck",
      label: "Dimensional Check",
      type: "text",
      placeholder: "e.g., ±0.1mm, All holes within tolerance",
    },
    {
      name: "qcStatus",
      label: "QC Status",
      type: "select",
      options: ["Pass", "Fail", "Pending"],
      placeholder: "",
    },
    {
      name: "drillingPhoto",
      label: "Upload Photo",
      type: "file",
      placeholder: "",
    },
  ],
  turning: [
    {
      name: "componentName",
      label: "Component Name",
      type: "text",
      placeholder: "e.g., Shaft, Spindle, Coupling",
    },
    {
      name: "outerDiameter",
      label: "Outer Diameter",
      type: "text",
      placeholder: "e.g., 50mm, Ø50, 2 inches",
    },
    {
      name: "innerDiameter",
      label: "Inner Diameter",
      type: "text",
      placeholder: "e.g., 20mm, Ø20, Through bore",
    },
    {
      name: "length",
      label: "Length",
      type: "text",
      placeholder: "e.g., 100mm, 4 inches, 50mm overall",
    },
    {
      name: "machineId",
      label: "Machine ID",
      type: "text",
      placeholder: "e.g., LATHE-001, CNC-TURN-02",
    },
    {
      name: "operatorName",
      label: "Operator Name",
      type: "text",
      placeholder: "e.g., John Doe, Operator-123",
    },
    {
      name: "toolInsertType",
      label: "Tool Insert Type",
      type: "text",
      placeholder: "e.g., CCMT060204, TNMG160404",
    },
    {
      name: "speedFeed",
      label: "Speed / Feed",
      type: "text",
      placeholder: "e.g., 400 RPM / 0.2mm/rev",
    },
    {
      name: "dimensionalCheck",
      label: "Dimensional Check",
      type: "text",
      placeholder: "e.g., ±0.1mm, All dimensions within tolerance",
    },
    {
      name: "surfaceFinishCheck",
      label: "Surface Finish Check",
      type: "text",
      placeholder: "e.g., Ra 0.8µm, Smooth finish verified",
    },
    {
      name: "qcStatus",
      label: "QC Status",
      type: "select",
      options: ["Pass", "Fail", "Pending"],
      placeholder: "",
    },
    {
      name: "turningPhoto",
      label: "Upload Photo",
      type: "file",
      placeholder: "",
    },
  ],
  milling: [
    {
      name: "componentName",
      label: "Component Name",
      type: "text",
      placeholder: "e.g., Plate, Block, Housing",
    },
    {
      name: "slotSize",
      label: "Slot Size",
      type: "text",
      placeholder: "e.g., 10mm x 5mm, 8mm width",
    },
    {
      name: "faceMillingLength",
      label: "Face Milling Length",
      type: "text",
      placeholder: "e.g., 100mm, 150mm length",
    },
    {
      name: "keyawaySize",
      label: "Keyway Size",
      type: "text",
      placeholder: "e.g., 6mm x 6mm, Std DIN 6885",
    },
    {
      name: "machineId",
      label: "Machine ID",
      type: "text",
      placeholder: "e.g., CNC-MILL-001, MILLING-02",
    },
    {
      name: "operatorName",
      label: "Operator Name",
      type: "text",
      placeholder: "e.g., John Doe, CNC Programmer",
    },
    {
      name: "toleranceRequired",
      label: "Tolerance Required",
      type: "text",
      placeholder: "e.g., ±0.05mm, ±0.1mm",
    },
    {
      name: "dimensionalCheck",
      label: "Dimensional Check",
      type: "text",
      placeholder: "e.g., All dimensions verified within tolerance",
    },
    {
      name: "qcStatus",
      label: "QC Status",
      type: "select",
      options: ["Pass", "Fail", "Pending"],
      placeholder: "",
    },
    {
      name: "millingPhoto",
      label: "Upload Photo",
      type: "file",
      placeholder: "",
    },
  ],
  boring: [
    {
      name: "componentName",
      label: "Component Name",
      type: "text",
      placeholder: "e.g., Bushing, Housing, Plate",
    },
    {
      name: "boreDiameter",
      label: "Bore Diameter",
      type: "text",
      placeholder: "e.g., 80mm, Ø80, 3.15 inches",
    },
    {
      name: "boreDepth",
      label: "Bore Depth",
      type: "text",
      placeholder: "e.g., 100mm, Through, 50mm depth",
    },
    {
      name: "machineId",
      label: "Machine ID",
      type: "text",
      placeholder: "e.g., BORE-MILL-001, BORING-02",
    },
    {
      name: "toolType",
      label: "Tool Type",
      type: "text",
      placeholder: "e.g., Boring Bar, Reamer, Honing Tool",
    },
    {
      name: "operatorName",
      label: "Operator Name",
      type: "text",
      placeholder: "e.g., John Doe, Boring Operator",
    },
    {
      name: "tolerance",
      label: "Tolerance (mm)",
      type: "text",
      placeholder: "e.g., ±0.1mm, ±0.05mm",
    },
    {
      name: "roundnessCheck",
      label: "Roundness Check",
      type: "text",
      placeholder: "e.g., Within tolerance, TIR < 0.05mm",
    },
    {
      name: "qcStatus",
      label: "QC Status",
      type: "select",
      options: ["Pass", "Fail", "Pending"],
      placeholder: "",
    },
    {
      name: "boringPhoto",
      label: "Upload Photo",
      type: "file",
      placeholder: "",
    },
  ],
  grinding: [
    {
      name: "componentName",
      label: "Component Name",
      type: "text",
      placeholder: "e.g., Plate, Shaft, Housing",
    },
    {
      name: "grindingType",
      label: "Grinding Type",
      type: "select",
      options: ["Surface", "Edge", "Weld"],
      placeholder: "",
    },
    {
      name: "toolUsed",
      label: "Tool Used",
      type: "text",
      placeholder: "e.g., Grinding Wheel 120 Grit, Stone, Hone",
    },
    {
      name: "lengthGround",
      label: "Length Ground",
      type: "text",
      placeholder: "e.g., 500mm, 1000mm, Full length",
    },
    {
      name: "operatorName",
      label: "Operator Name",
      type: "text",
      placeholder: "e.g., John Doe, Grinding Operator",
    },
    {
      name: "surfaceFinishCheck",
      label: "Surface Finish Check",
      type: "text",
      placeholder: "e.g., Ra 0.8µm, Ra 0.4µm verified",
    },
    {
      name: "qcApproval",
      label: "QC Approval",
      type: "select",
      options: ["Approved", "Rework Required", "Rejected"],
      placeholder: "",
    },
    {
      name: "grindingImage",
      label: "Upload Image",
      type: "file",
      placeholder: "",
    },
  ],
  shot_blasting: [
    {
      name: "componentAssembly",
      label: "Component / Assembly",
      type: "text",
      placeholder: "e.g., Frame, Plate, Housing Assembly",
    },
    {
      name: "blastingGrade",
      label: "Blasting Grade",
      type: "select",
      options: ["SA2", "SA2.5"],
      placeholder: "",
    },
    {
      name: "surfaceProfileAchieved",
      label: "Surface Profile Achieved (µm)",
      type: "text",
      placeholder: "e.g., 50µm, 75µm, 100µm",
    },
    {
      name: "abrasiveUsed",
      label: "Abrasive Used",
      type: "text",
      placeholder: "e.g., Steel Shot S230, Steel Grit, Aluminum Oxide",
    },
    {
      name: "operatorName",
      label: "Operator Name",
      type: "text",
      placeholder: "e.g., John Doe, Blasting Technician",
    },
    { name: "blastingDate", label: "Date", type: "date", placeholder: "" },
    {
      name: "qcStatus",
      label: "QC Status",
      type: "select",
      options: ["Pass", "Fail", "Pending"],
      placeholder: "",
    },
    {
      name: "blastingImage",
      label: "Upload Image",
      type: "file",
      placeholder: "",
    },
  ],
  painting: [
    {
      name: "primerType",
      label: "Primer Type & Batch No.",
      type: "text",
      placeholder: "e.g., Epoxy Primer, Batch 2024-001",
    },
    {
      name: "primerDft",
      label: "Primer DFT (microns)",
      type: "text",
      placeholder: "e.g., 75µm, 100µm, 150µm",
    },
    {
      name: "topcoatType",
      label: "Topcoat Type",
      type: "text",
      placeholder: "e.g., 2K Polyurethane, Epoxy, Acrylic",
    },
    {
      name: "topcoatDft",
      label: "Topcoat DFT (microns)",
      type: "text",
      placeholder: "e.g., 80µm, 120µm, 150µm",
    },
    {
      name: "colorCode",
      label: "Color Code",
      type: "text",
      placeholder: "e.g., RAL 7035, Blue, Custom Code",
    },
    {
      name: "painterName",
      label: "Painter Name",
      type: "text",
      placeholder: "e.g., John Doe, Painter-123",
    },
    {
      name: "boothId",
      label: "Booth ID",
      type: "text",
      placeholder: "e.g., BOOTH-001, Paint-A",
    },
    {
      name: "dryingTime",
      label: "Drying Time",
      type: "text",
      placeholder: "e.g., 24 hours, 48 hours, Per specification",
    },
    {
      name: "dftReportUpload",
      label: "DFT Report Upload",
      type: "file",
      placeholder: "",
    },
    {
      name: "qcStatus",
      label: "QC Status",
      type: "select",
      options: ["Pass", "Fail", "Pending"],
      placeholder: "",
    },
    {
      name: "paintedImage",
      label: "Upload Painted Image",
      type: "file",
      placeholder: "",
    },
  ],
  mechanical_assembly: [
    {
      name: "assemblyName",
      label: "Assembly Name",
      type: "text",
      placeholder: "e.g., Main Frame Assembly, Base Plate Assembly",
    },
    {
      name: "drawingNumber",
      label: "Drawing Number",
      type: "text",
      placeholder: "e.g., DRG-001, ASM-2024-001",
    },
    {
      name: "torqueValuesApplied",
      label: "Torque Values Applied",
      type: "text",
      placeholder: "e.g., M8 bolts: 25 Nm, M10 bolts: 45 Nm",
    },
    {
      name: "rollerRotationCheck",
      label: "Roller Rotation Check",
      type: "text",
      placeholder: "e.g., Smooth, No binding, Free rotation confirmed",
    },
    {
      name: "boltCount",
      label: "Bolt Count",
      type: "number",
      placeholder: "e.g., 8, 12, 16",
    },
    {
      name: "clearanceCheck",
      label: "Clearance Check",
      type: "text",
      placeholder: "e.g., ±0.5mm, All clearances within tolerance",
    },
    {
      name: "assemblyDoneBy",
      label: "Assembly Done By",
      type: "text",
      placeholder: "e.g., John Doe, Technician-123",
    },
    {
      name: "qcApproval",
      label: "QC Approval",
      type: "select",
      options: ["Approved", "Rework Required", "Rejected"],
      placeholder: "",
    },
    {
      name: "assemblyImage",
      label: "Upload Assembly Image",
      type: "file",
      placeholder: "",
    },
  ],
  shaft_bearing_assembly: [
    {
      name: "shaftSize",
      label: "Shaft Size",
      type: "text",
      placeholder: "e.g., Ø20mm, Ø50mm, 1.5 inches",
    },
    {
      name: "bearingType",
      label: "Bearing Type",
      type: "text",
      placeholder: "e.g., Deep groove ball, SKF 6210, Angular contact",
    },
    {
      name: "fittingMethod",
      label: "Fitting Method",
      type: "select",
      options: ["Press", "Heat fit"],
      placeholder: "",
    },
    {
      name: "greaseType",
      label: "Grease Type",
      type: "text",
      placeholder: "e.g., NLGI 2, NLGI 3, Molybdenum disulfide",
    },
    {
      name: "preloadCheck",
      label: "Preload Check",
      type: "text",
      placeholder: "e.g., 500N, 1000N, Within specification",
    },
    {
      name: "runoutCheck",
      label: "Runout Check",
      type: "text",
      placeholder: "e.g., TIR < 0.05mm, Radial runout acceptable",
    },
    {
      name: "assembledBy",
      label: "Assembled By",
      type: "text",
      placeholder: "e.g., John Doe, Precision Tech",
    },
    {
      name: "qcStatus",
      label: "QC Status",
      type: "select",
      options: ["Pass", "Fail", "Pending"],
      placeholder: "",
    },
    {
      name: "bearingAssemblyImage",
      label: "Upload Image",
      type: "file",
      placeholder: "",
    },
  ],
  alignment: [
    {
      name: "alignmentType",
      label: "Alignment Type",
      type: "select",
      options: ["Rail", "Shaft", "Roller", "Frame"],
      placeholder: "",
    },
    {
      name: "laserToolId",
      label: "Laser Tool ID",
      type: "text",
      placeholder: "e.g., LASER-001, ALG-TOOL-2024",
    },
    {
      name: "straightnessMeasurement",
      label: "Straightness Measurement (mm deviation)",
      type: "text",
      placeholder: "e.g., ±0.1mm, 0.05mm deviation",
    },
    {
      name: "levelness",
      label: "Levelness (mm)",
      type: "text",
      placeholder: "e.g., ±0.2mm, 0.15mm per meter",
    },
    {
      name: "correctionPerformed",
      label: "Correction Performed",
      type: "text",
      placeholder: "e.g., Shims added, Bearings adjusted, No correction needed",
    },
    {
      name: "alignedBy",
      label: "Aligned By",
      type: "text",
      placeholder: "e.g., John Doe, Certified Technician",
    },
    {
      name: "inspectorApproval",
      label: "Inspector Approval",
      type: "select",
      options: ["Approved", "Rework Required", "Rejected"],
      placeholder: "",
    },
    {
      name: "measurementReportUpload",
      label: "Upload Measurement Report",
      type: "file",
      placeholder: "",
    },
  ],
  panel_wiring: [
    {
      name: "panelName",
      label: "Panel Name",
      type: "text",
      placeholder: "e.g., Main Distribution Panel, Control Panel A",
    },
    {
      name: "drawingNo",
      label: "Drawing No.",
      type: "text",
      placeholder: "e.g., SLD-001, Panel-DRG-2024",
    },
    {
      name: "componentsInstalled",
      label: "Components Installed",
      type: "text",
      placeholder: "e.g., MCB, Contactor, Relay, Thermal Overload, etc.",
    },
    {
      name: "cableSizeUsed",
      label: "Cable Size Used",
      type: "text",
      placeholder: "e.g., 10mm², 6mm², 4mm²",
    },
    {
      name: "tighteningTorque",
      label: "Tightening Torque",
      type: "text",
      placeholder: "e.g., Terminal screws: 2.5 Nm, Bus bars: 5 Nm",
    },
    {
      name: "wiringContinuityCheck",
      label: "Wiring Continuity Check",
      type: "text",
      placeholder: "e.g., All circuits OK, No breaks detected",
    },
    {
      name: "earthingCheck",
      label: "Earthing Check",
      type: "text",
      placeholder: "e.g., Earth resistance < 0.1Ω, All earths connected",
    },
    {
      name: "doneBy",
      label: "Done By",
      type: "text",
      placeholder: "e.g., John Doe, Electrician-001",
    },
    {
      name: "qcApproval",
      label: "QC Approval",
      type: "select",
      options: ["Approved", "Rework Required", "Rejected"],
      placeholder: "",
    },
    {
      name: "panelPhoto",
      label: "Upload Panel Photo",
      type: "file",
      placeholder: "",
    },
  ],
  motor_wiring: [
    {
      name: "motorNameplateDetails",
      label: "Motor Nameplate Details",
      type: "text",
      placeholder: "e.g., 3-phase 5.5kW, 440V, 10A, IE3 Class",
    },
    {
      name: "cableSize",
      label: "Cable Size",
      type: "text",
      placeholder: "e.g., 4mm², 6mm², 10mm²",
    },
    {
      name: "cableGlandType",
      label: "Cable Gland Type",
      type: "text",
      placeholder: "e.g., M20, M25, IP65 rated",
    },
    {
      name: "rotationDirectionChecked",
      label: "Rotation Direction Checked?",
      type: "select",
      options: ["Yes", "No"],
      placeholder: "",
    },
    {
      name: "overloadRelaySetting",
      label: "Overload Relay Setting",
      type: "text",
      placeholder: "e.g., 10A, 150% rated current",
    },
    {
      name: "motorDoneBy",
      label: "Done By",
      type: "text",
      placeholder: "e.g., John Doe, Electrician-002",
    },
    {
      name: "motorQcApproval",
      label: "QC Approval",
      type: "select",
      options: ["Approved", "Rework Required", "Rejected"],
      placeholder: "",
    },
    {
      name: "motorImage",
      label: "Upload Image",
      type: "file",
      placeholder: "",
    },
  ],
  sensor_installation: [
    {
      name: "sensorType",
      label: "Sensor Type",
      type: "select",
      options: ["Proximity", "Limit", "Pressure"],
      placeholder: "",
    },
    {
      name: "location",
      label: "Location",
      type: "text",
      placeholder: "e.g., Entrance gate, Motor mount, Control room",
    },
    {
      name: "gapClearance",
      label: "Gap / Clearance (mm)",
      type: "text",
      placeholder: "e.g., 5mm, 10mm, As per drawing",
    },
    {
      name: "sensorWiringVerified",
      label: "Sensor Wiring Verified",
      type: "text",
      placeholder: "e.g., All connections OK, Continuity confirmed",
    },
    {
      name: "functionalTestResult",
      label: "Functional Test Result",
      type: "text",
      placeholder: "e.g., Sensor responds correctly, Test passed",
    },
    {
      name: "installedBy",
      label: "Installed By",
      type: "text",
      placeholder: "e.g., John Doe, Technician-003",
    },
    {
      name: "sensorQcApproval",
      label: "QC Approval",
      type: "select",
      options: ["Approved", "Rework Required", "Rejected"],
      placeholder: "",
    },
    {
      name: "sensorPhoto",
      label: "Upload Photo",
      type: "file",
      placeholder: "",
    },
  ],
};

const SalesOrderForm = ({ onSubmit, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [specModalType, setSpecModalType] = useState(null);

  const [selectedProductionPhases, setSelectedProductionPhases] = useState({});
  const [productionPhaseDetails, setProductionPhaseDetails] = useState({});
  const [productionMaterialInfo, setProductionMaterialInfo] = useState({});
  const [productionPhaseModalOpen, setProductionPhaseModalOpen] =
    useState(false);
  const [selectedPhaseForModal, setSelectedPhaseForModal] = useState(null);
  const [currentPhaseDetail, setCurrentPhaseDetail] = useState({});
  const [productionPhaseTracking, setProductionPhaseTracking] = useState({});
  const [phaseProcessType, setPhaseProcessType] = useState({});
  const [outwardChallans, setOutwardChallans] = useState({});
  const [inwardChallans, setInwardChallans] = useState({});

  const [employees, setEmployees] = useState([]);
  const [projectCategories, setProjectCategories] = useState([]);
  const [materialUnits, setMaterialUnits] = useState([]);
  const [materialSources, setMaterialSources] = useState([]);
  const [priorityLevels, setPriorityLevels] = useState([]);

  const [formData, setFormData] = useState({
    poNumber: "",
    poDate: new Date().toISOString().split("T")[0],
    clientName: "",
    clientAddress: "",
    projectName: "",
    projectCategory: "",
    deliveryTimeline: "",
    paymentTerms: "",
    specialInstructions: "",
    customerContact: "",
    clientEmail: "",
    clientPhone: "",
    billingAddress: "",
    shippingAddress: "",
    projectStartDate: new Date().toISOString().split("T")[0],
    estimatedEndDate: "",
    projectPriority: "medium",
    internalProjectOwner: "",
    totalAmount: "",
    materials: [],
    projectEmployees: [],
    projectRequirements: {
      application: "",
      numberOfUnits: "",
      dimensions: "",
      loadCapacity: "",
      specifications: "",
      materialGrade: "",
      finishCoatings: "",
      accessories: "",
      installationRequirement: "",
      testingStandards: "",
      documentationRequirement: "",
      warrantTerms: "",
      penaltyClauses: "",
      confidentialityClauses: "",
      acceptanceCriteria: "",
    },
    projectCode: "",
    clientPO: {
      poNumber: "",
      poDate: new Date().toISOString().split("T")[0],
      poValue: "",
    },
    productDetails: {
      itemName: "CCIS – Container Canister Integration Stand",
      itemDescription: "",
      componentsList: "",
      certification: "",
    },
    pricingDetails: {
      quantity: "",
      unitPrice: "",
      totalPrice: "",
      discount: "",
      taxesApplicable: "18% GST",
    },
    deliveryTerms: {
      deliverySchedule: "",
      packagingInfo: "",
      dispatchMode: "",
      installationRequired: "",
      siteCommissioning: "",
    },
    qualityCompliance: {
      qualityStandards: "",
      weldingStandards: "",
      surfaceFinish: "",
      mechanicalLoadTesting: "",
      electricalCompliance: "",
      documentsRequired: "",
    },
    warrantySupport: {
      warrantyPeriod: "",
      serviceSupport: "",
    },
    internalInfo: {
      projectManager: "",
      productionSupervisor: "",
      purchaseResponsiblePerson: "",
      estimatedCosting: "",
      estimatedProfit: "",
      jobCardNo: "",
    },
    productionPlan: { rootCardNo: "", revisionNo: "1", stages: [] },
    designEngineering: {
      generalDesignInfo: {
        designId: "",
        revisionNo: "",
        designEngineerName: "",
        designStartDate: "",
        designCompletionDate: "",
        designStatus: "Pending",
      },
      productSpecification: {
        productName: "CCIS – Container Canister Integration Stand",
        systemLength: "",
        systemWidth: "",
        systemHeight: "",
        loadCapacity: "6000",
        operatingEnvironment: "",
        materialGrade: "",
        surfaceFinish: "",
      },
      baseFrameRails: {
        baseFrameLength: "",
        sectionType: "",
        railType: "",
        railAlignmentTolerance: "",
        railMountingMethod: "",
      },
      rollerSaddleAssembly: {
        noOfSaddleUnits: "",
        saddleLoadCapacity: "",
        rollerType: "",
        rollerDiameter: "",
        rollerBearingType: "",
      },
      rotationalCradle: {
        cradleDiameter: "",
        rotationAngle: "",
        mechanism: "",
        lockingSystemType: "",
      },
      winchPullingSystem: {
        winchCapacity: "",
        motorPower: "",
        gearboxType: "",
        cableLength: "",
        cableDiameter: "",
      },
      electricalControl: {
        controlPanelType: "",
        powerRequirement: "",
        limitSwitchCount: "",
        sensorTypes: "",
        emergencyStopRequirement: "",
        controlLogic: "",
      },
      safetyRequirements: {
        guardRequirements: "",
        interlocksRequired: "",
        antiTiltSystemDesign: "",
        maxOperatingSpeed: "",
        loadTestSafetyFactor: "",
      },
      standardsCompliance: {
        weldingStandard: "",
        paintingStandard: "",
        dimensionalToleranceStandards: "",
        qcInspectionStageRequired: "",
        drodComplianceRequirements: "",
      },
      attachments: {
        model3D: "",
        fabricationDrawings: "",
        assemblyDrawings: "",
        bomSheet: "",
        calculationSheet: "",
      },
      commentsNotes: {
        internalDesignNotes: "",
        riskAssessment: "",
        designConstraints: "",
        specialInstructions: "",
      },
    },
    materialProcurement: {
      materialProcurement: "",
      vendorAllocation: "",
      incomingInspection: "",
    },
    qualityCheck: {
      finalInspection: "",
      documentation: "",
    },
    shipment: {
      marking: "",
      dismantling: "",
      packing: "",
      dispatch: "",
    },
  });

  const [stepAssignees, setStepAssignees] = useState({
    6: "",
    7: "",
    8: "",
  });

  const [stepNotes, setStepNotes] = useState({
    6: "",
    7: "",
    8: "",
  });

  const [poDocuments, setPoDocuments] = useState([]);
  const [enabledMaterials, setEnabledMaterials] = useState({
    steelSection: false,
    plateType: false,
    materialGrade: false,
    fastenerType: false,
    machinedParts: false,
    rollerMovementComponents: false,
    liftingPullingMechanisms: false,
    electricalAutomation: false,
    safetyMaterials: false,
    surfacePrepPainting: false,
    fabricationConsumables: false,
    hardwareMisc: false,
    documentationMaterials: false,
  });
  const [materialDetailsTable, setMaterialDetailsTable] = useState({
    steelSection: [],
    plateType: [],
    materialGrade: [],
    fastenerType: [],
    machinedParts: [],
    rollerMovementComponents: [],
    liftingPullingMechanisms: [],
    electricalAutomation: [],
    safetyMaterials: [],
    surfacePrepPainting: [],
    fabricationConsumables: [],
    hardwareMisc: [],
    documentationMaterials: [],
  });
  const [editingDetail, setEditingDetail] = useState(null);

  const [currentMaterial, setCurrentMaterial] = useState({
    category: "",
    name: "",
    description: "",
    quantity: "",
    quality: "",
    unit: "",
    specification: "",
    drawingLink: "",
    source: "",
    steelSection: "",
    steelSize: "",
    steelLength: "",
    steelTolerance: "",
    plateType: "",
    plateThickness: "",
    plateLength: "",
    plateWidth: "",
    plateSurfaceFinish: "",
    materialGrade: "",
    gradeCertificationRequired: "",
    gradeTestingStandards: "",
    gradeSpecialRequirements: "",
    fastenerType: "",
    fastenerSize: "",
    fastenerQuantityPerUnit: "",
    fastenerPlating: "",
    machinedParts: "",
    machinedPartsSpecs: {},
    rollerMovementComponents: "",
    rollerMovementComponentsSpecs: {},
    liftingPullingMechanisms: "",
    liftingPullingMechanismsSpecs: {},
    electricalAutomation: "",
    electricalAutomationSpecs: {},
    safetyMaterials: "",
    safetyMaterialsSpecs: {},
    surfacePrepPainting: "",
    surfacePrepPaintingSpecs: {},
    fabricationConsumables: "",
    fabricationConsumablesSpecs: {},
    hardwareMisc: "",
    hardwareMiscSpecs: {},
    documentationMaterials: "",
    documentationMaterialsSpecs: {},
    documentationUploadedFiles: [],
  });

  useEffect(() => {
    fetchEmployees();
    fetchConfig();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("/api/sales/employees");
      const employeeList = Array.isArray(response.data)
        ? response.data
        : response.data.users || [];
      setEmployees(employeeList);
    } catch (err) {
      console.error("Failed to load employees:", err);
    }
  };

  const fetchConfig = async () => {
    try {
      const response = await axios.get("/api/sales/config/all");
      if (response.data.success && response.data.data) {
        const config = response.data.data;
        setProjectCategories(config.project_category || []);
        setMaterialUnits(config.material_unit || []);
        setMaterialSources(config.material_source || []);
        setPriorityLevels(config.priority_level || []);
      }
    } catch (err) {
      console.error("Failed to load system configuration:", err);
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.poNumber.trim()) {
          setError("PO Number is required");
          return false;
        }
        if (!formData.clientName.trim()) {
          setError("Client Name is required");
          return false;
        }
        if (!formData.projectName.trim()) {
          setError("Project Name is required");
          return false;
        }
        if (!formData.clientAddress.trim()) {
          setError("Client Address is required");
          return false;
        }
        if (!formData.deliveryTimeline.trim()) {
          setError("Delivery Timeline is required");
          return false;
        }
        if (poDocuments.length === 0) {
          setError("Please upload at least one PO document");
          return false;
        }
        return true;
      case 2:
        if (!formData.customerContact.trim()) {
          setError("Customer Contact is required");
          return false;
        }
        if (!formData.clientEmail.trim()) {
          setError("Client Email is required");
          return false;
        }
        if (!formData.clientPhone.trim()) {
          setError("Client Phone is required");
          return false;
        }
        if (!formData.estimatedEndDate.trim()) {
          setError("Estimated End Date is required");
          return false;
        }
        if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
          setError("Total Amount must be greater than 0");
          return false;
        }
        return true;
      case 3:
        if (formData.materials.length === 0) {
          setError("Please add at least one material");
          return false;
        }
        return true;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return true;
    }
  };

  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProjectRequirementsChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      projectRequirements: {
        ...prev.projectRequirements,
        [name]: value,
      },
    }));
  };

  const handleNestedFieldChange = (e, section, subsection = null) => {
    const { name, value } = e.target;
    if (subsection) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subsection]: {
            ...prev[section][subsection],
            [name]: value,
          },
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value,
        },
      }));
    }
  };

  const toggleEnabledMaterial = (materialType) => {
    setEnabledMaterials((prev) => ({
      ...prev,
      [materialType]: !prev[materialType],
    }));
    if (enabledMaterials[materialType]) {
      setMaterialDetailsTable((prev) => ({
        ...prev,
        [materialType]: [],
      }));
    }
  };

  const handleMaterialChange = (e) => {
    const { name, value } = e.target;
    setCurrentMaterial((prev) => ({ ...prev, [name]: value }));

    const specTypes = [
      "steelSection",
      "plateType",
      "materialGrade",
      "fastenerType",
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

    if (specTypes.includes(name) && value) {
      setTimeout(() => openSpecModal(name), 100);
    }
  };

  const addMaterial = () => {
    if (editingDetail) {
      updateMaterial();
    } else {
      setFormData((prev) => ({
        ...prev,
        materials: [...prev.materials, { ...currentMaterial, id: Date.now() }],
      }));
      resetMaterial();
    }
    setError(null);
  };

  const removeMaterial = (id) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m.id !== id),
    }));
  };

  const editMaterial = (material) => {
    setCurrentMaterial(material);
    setEditingDetail(material.id);
    window.scrollTo({ top: 0, behavior: "smooth" });

    const specTypes = [
      "steelSection",
      "plateType",
      "materialGrade",
      "fastenerType",
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
    const materialType = specTypes.find((type) => material[type]);

    if (materialType) {
      setTimeout(() => openSpecModal(materialType), 100);
    }
  };

  const updateMaterial = () => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.map((m) =>
        m.id === editingDetail ? currentMaterial : m
      ),
    }));
    resetMaterial();
    setEditingDetail(null);
  };

  const resetMaterial = () => {
    setCurrentMaterial({
      quantity: "",
      unit: "",
      drawingLink: "",
      source: "procurement",
      steelSection: "",
      steelSize: "",
      steelLength: "",
      steelTolerance: "",
      steelQuantity: "",
      steelQuality: "",
      plateType: "",
      plateThickness: "",
      plateLength: "",
      plateWidth: "",
      plateSurfaceFinish: "",
      plateQuantity: "",
      plateQuality: "",
      materialGrade: "",
      gradeCertificationRequired: "",
      gradeTestingStandards: "",
      gradeSpecialRequirements: "",
      gradeQuantity: "",
      gradeQuality: "",
      fastenerType: "",
      fastenerSize: "",
      fastenerQuantityPerUnit: "",
      fastenerPlating: "",
      fastenerQuantity: "",
      fastenerQuality: "",
      machinedParts: "",
      machinedPartsSpecs: {},
      machinedPartsQuantity: "",
      machinedPartsQuality: "",
      rollerMovementComponents: "",
      rollerMovementComponentsSpecs: {},
      rollerMovementQuantity: "",
      rollerMovementQuality: "",
      liftingPullingMechanisms: "",
      liftingPullingMechanismsSpecs: {},
      liftingPullingQuantity: "",
      liftingPullingQuality: "",
      electricalAutomation: "",
      electricalAutomationSpecs: {},
      electricalAutomationQuantity: "",
      electricalAutomationQuality: "",
      safetyMaterials: "",
      safetyMaterialsSpecs: {},
      safetyMaterialsQuantity: "",
      safetyMaterialsQuality: "",
      surfacePrepPainting: "",
      surfacePrepPaintingSpecs: {},
      surfacePrepPaintingQuantity: "",
      surfacePrepPaintingQuality: "",
      fabricationConsumables: "",
      fabricationConsumablesSpecs: {},
      fabricationConsumablesQuantity: "",
      fabricationConsumablesQuality: "",
      hardwareMisc: "",
      hardwareMiscSpecs: {},
      hardwareMiscQuantity: "",
      hardwareMiscQuality: "",
      documentationMaterials: "",
      documentationMaterialsSpecs: {},
      documentationMaterialsQuantity: "",
      documentationMaterialsQuality: "",
      documentationUploadedFiles: [],
    });
    setError(null);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setPoDocuments((prev) => [...prev, ...files]);
  };

  const removeDocument = (index) => {
    setPoDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDocumentationFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileMetadata = files.map((file) => ({
      name: file.name,
      size: Math.round(file.size / 1024),
    }));
    setCurrentMaterial((prev) => ({
      ...prev,
      documentationUploadedFiles: [
        ...(prev.documentationUploadedFiles || []),
        ...fileMetadata,
      ],
    }));
    e.target.value = "";
  };

  const removeDocumentationFile = (index) => {
    setCurrentMaterial((prev) => ({
      ...prev,
      documentationUploadedFiles: prev.documentationUploadedFiles.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const openSpecModal = (type) => {
    setSpecModalType(type);
    setSpecModalOpen(true);
  };

  const closeSpecModal = () => {
    setSpecModalOpen(false);
    setSpecModalType(null);
  };

  const openProductionPhaseModal = (phase, subTask) => {
    const key = `${phase}_${subTask.value}`;
    setCurrentPhaseDetail(productionPhaseDetails[key] || { phase, subTask });
    setSelectedPhaseForModal({ phase, subTask });
    setProductionPhaseModalOpen(true);
  };

  const closeProductionPhaseModal = () => {
    setProductionPhaseModalOpen(false);
    setSelectedPhaseForModal(null);
    setCurrentPhaseDetail({});
  };

  const handleProductionPhaseDetailChange = (e) => {
    const { name, value } = e.target;
    setCurrentPhaseDetail((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductionMaterialChange = (e) => {
    const { name, value } = e.target;
    setProductionMaterialInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductionMaterialFileChange = (e, fileType) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductionMaterialInfo((prev) => ({
        ...prev,
        [fileType]: file,
        [`${fileType}Name`]: file.name,
      }));
    }
  };

  const handleProductionPhaseFileChange = (e, fieldName) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentPhaseDetail((prev) => ({
        ...prev,
        [fieldName]: file,
        [`${fieldName}Name`]: file.name,
      }));
    }
  };

  const saveProductionPhaseDetail = () => {
    if (selectedPhaseForModal) {
      const key = `${selectedPhaseForModal.phase}_${selectedPhaseForModal.subTask.value}`;
      const stepNumber = Object.keys(productionPhaseDetails).length + 1;
      const processType = currentPhaseDetail.processType || "inhouse";
      setProductionPhaseDetails((prev) => ({
        ...prev,
        [key]: currentPhaseDetail,
      }));
      setPhaseProcessType((prev) => ({
        ...prev,
        [key]: processType,
      }));
      setProductionPhaseTracking((prev) => ({
        ...prev,
        [key]: {
          stepNumber,
          phase: selectedPhaseForModal.phase,
          subTask: selectedPhaseForModal.subTask.label,
          status: "Not Started",
          startTime: null,
          finishTime: null,
          assignee: "",
          processType,
          createdAt: new Date().toISOString(),
        },
      }));
      closeProductionPhaseModal();
    }
  };

  const updateProductionPhaseStatus = (key, updates) => {
    setProductionPhaseTracking((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...updates,
      },
    }));
  };

  const startProductionPhase = (key) => {
    updateProductionPhaseStatus(key, {
      status: "In Progress",
      startTime: new Date().toISOString(),
    });
  };

  const finishProductionPhase = (key) => {
    updateProductionPhaseStatus(key, {
      status: "Completed",
      finishTime: new Date().toISOString(),
    });
  };

  const createOutwardChallan = (key) => {
    const challanNo = `OC-${Date.now()}`;
    const timestamp = new Date().toISOString();
    setOutwardChallans((prev) => ({
      ...prev,
      [key]: {
        challanNo,
        createdAt: timestamp,
        status: "Issued",
        details: productionPhaseDetails[key],
        tracking: productionPhaseTracking[key],
      },
    }));
    updateProductionPhaseStatus(key, {
      status: "Outsourced",
      outwardChallanNo: challanNo,
    });
  };

  const createInwardChallan = (key) => {
    const challanNo = `IC-${Date.now()}`;
    const timestamp = new Date().toISOString();
    setInwardChallans((prev) => ({
      ...prev,
      [key]: {
        challanNo,
        createdAt: timestamp,
        status: "Received",
        receivedAt: timestamp,
        outwardChallanNo: productionPhaseTracking[key]?.outwardChallanNo,
      },
    }));
    updateProductionPhaseStatus(key, {
      status: "Completed",
      inwardChallanNo: challanNo,
      finishTime: timestamp,
    });
  };

  const handleDetailSubmit = (type, details) => {
    const selectedValue =
      currentMaterial[`${type}`] ||
      currentMaterial[
        type === "steelSection"
          ? "steelSection"
          : type === "plateType"
          ? "plateType"
          : type === "materialGrade"
          ? "materialGrade"
          : type === "fastenerType"
          ? "fastenerType"
          : "machinedParts"
      ];

    if (editingDetail && editingDetail.type === type) {
      setMaterialDetailsTable((prev) => ({
        ...prev,
        [type]: prev[type].map((row) =>
          row.id === editingDetail.id
            ? { ...row, selection: selectedValue, ...details }
            : row
        ),
      }));
      setSuccessMessage(`${type} details updated successfully!`);
    } else {
      setMaterialDetailsTable((prev) => ({
        ...prev,
        [type]: [
          ...prev[type],
          { id: Date.now(), selection: selectedValue, ...details },
        ],
      }));
      setSuccessMessage(`${type} details added successfully!`);
    }

    const resetState = { [type]: "" };

    if (type === "steelSection") {
      resetState.steelSize = "";
      resetState.steelLength = "";
      resetState.steelTolerance = "";
    } else if (type === "plateType") {
      resetState.plateThickness = "";
      resetState.plateLength = "";
      resetState.plateWidth = "";
      resetState.plateSurfaceFinish = "";
    } else if (type === "materialGrade") {
      resetState.gradeCertificationRequired = "";
      resetState.gradeTestingStandards = "";
      resetState.gradeSpecialRequirements = "";
    } else if (type === "fastenerType") {
      resetState.fastenerSize = "";
      resetState.fastenerQuantityPerUnit = "";
      resetState.fastenerPlating = "";
    } else if (type === "machinedParts") {
      resetState.machinedPartsSpecs = {};
    } else if (type === "rollerMovementComponents") {
      resetState.rollerMovementComponentsSpecs = {};
    } else if (type === "liftingPullingMechanisms") {
      resetState.liftingPullingMechanismsSpecs = {};
    } else if (type === "electricalAutomation") {
      resetState.electricalAutomationSpecs = {};
    } else if (type === "safetyMaterials") {
      resetState.safetyMaterialsSpecs = {};
    } else if (type === "surfacePrepPainting") {
      resetState.surfacePrepPaintingSpecs = {};
    } else if (type === "fabricationConsumables") {
      resetState.fabricationConsumablesSpecs = {};
    } else if (type === "hardwareMisc") {
      resetState.hardwareMiscSpecs = {};
    } else if (type === "documentationMaterials") {
      resetState.documentationMaterialsSpecs = {};
      resetState.documentationUploadedFiles = [];
    }

    setCurrentMaterial((prev) => ({ ...prev, ...resetState }));
    setEditingDetail(null);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const removeDetailRow = (type, rowId) => {
    setMaterialDetailsTable((prev) => ({
      ...prev,
      [type]: prev[type].filter((row) => row.id !== rowId),
    }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    setLoading(true);
    setError(null);

    try {
      const submitData = {
        clientName: formData.clientName,
        poNumber: formData.poNumber,
        orderDate: formData.poDate,
        dueDate: formData.deliveryTimeline,
        total: parseFloat(formData.totalAmount) || 0,
        currency: "USD",
        priority: formData.projectPriority || "medium",
        items: formData.materials.map((m) => ({
          category: m.category,
          name: m.name,
          description: m.description,
          quantity: parseFloat(m.quantity),
          unit: m.unit,
          specification: m.specification,
          drawingLink: m.drawingLink,
          source: m.source,
        })),
        documents: poDocuments.map((f) => f.name),
        notes: formData.specialInstructions,
        projectScope: {
          projectName: formData.projectName,
          projectCode: formData.projectCode,
          projectCategory: formData.projectCategory,
          paymentTerms: formData.paymentTerms,
          customerContact: formData.customerContact,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
          clientAddress: formData.clientAddress,
          billingAddress: formData.billingAddress,
          shippingAddress: formData.shippingAddress,
          projectStartDate: formData.projectStartDate,
          estimatedEndDate: formData.estimatedEndDate,
          projectPriority: formData.projectPriority,
          internalProjectOwner: formData.internalProjectOwner,
          projectEmployees: formData.projectEmployees,
        },
        projectRequirements: formData.projectRequirements,
        clientPO: formData.clientPO,
        productDetails: formData.productDetails,
        pricingDetails: formData.pricingDetails,
        deliveryTerms: formData.deliveryTerms,
        qualityCompliance: formData.qualityCompliance,
        warrantySupport: formData.warrantySupport,
        internalInfo: formData.internalInfo,
        designEngineering: formData.designEngineering,
        materialProcurement: formData.materialProcurement,
        qualityCheck: formData.qualityCheck,
        shipment: formData.shipment,
        productionPlan: {
          rootCardNo: formData.productionPlan.rootCardNo,
        },
      };

      const response = await axios.post("/api/sales/orders", submitData);
      const createdOrder = response.data.order;

      try {
        await axios.post("/api/sales/workflow/initialize", {
          salesOrderId: createdOrder.id,
        });
      } catch (err) {
        console.error("Failed to initialize workflow:", err);
      }

      setCreatedOrderId(createdOrder.id);
      setOrderSubmitted(true);
      setCurrentStep(5);
      setSuccessMessage(
        "Sales Order created successfully! Moving to workflow steps."
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create sales order");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEmployee = async (stepNumber) => {
    if (!stepAssignees[stepNumber]) {
      setError("Please select an employee for this step");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/sales/workflow/steps/assign", {
        stepId: stepNumber,
        employeeId: parseInt(stepAssignees[stepNumber]),
        reason: `Assigned to ${
          WIZARD_STEPS[stepNumber - 1].name
        } step for Sales Order #${createdOrderId}`,
      });

      setSuccessMessage(
        `Employee assigned to step ${stepNumber} successfully!`
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(
        "Failed to assign employee: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1 && !orderSubmitted) {
      setCurrentStep(currentStep - 1);
      setError(null);
    } else if (orderSubmitted && currentStep > 6) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const getEmployeeName = (empId) => {
    const emp = employees.find((e) => e.id === parseInt(empId));
    return emp
      ? `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "Unknown"
      : "Unknown";
  };

  const TAB_CLASSES = (isActive) =>
    `px-4 py-2 rounded-t-lg font-medium text-sm transition-all whitespace-nowrap ${
      isActive
        ? "bg-blue-600 text-white"
        : "bg-slate-700 text-slate-300 hover:bg-slate-600 cursor-pointer"
    }`;

  return (
    <div className="sales-order-form-wrapper">
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                {orderSubmitted
                  ? `Sales Order #${createdOrderId}`
                  : "Create Sales Order"}
              </h1>
              <p className="text-sm text-slate-400 mt-2">
                {orderSubmitted
                  ? "Assign employees to workflow steps"
                  : "Complete the sales order form step by step"}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 overflow-x-auto pb-2">
              {WIZARD_STEPS.map((step) => {
                const StepIcon = step.icon;
                const isClickable =
                  (orderSubmitted && step.number >= 6) ||
                  (!orderSubmitted && step.number <= 5);
                const isActive = currentStep === step.number;
                const isCompleted =
                  currentStep > step.number && !orderSubmitted;

                return (
                  <button
                    key={step.number}
                    onClick={() => {
                      if (isClickable) setCurrentStep(step.number);
                    }}
                    disabled={!isClickable}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                        : isCompleted
                        ? "bg-green-600 text-white"
                        : isClickable
                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                        isActive || isCompleted ? "" : "bg-slate-600"
                      }`}
                    >
                      {isCompleted ? <Check size={14} /> : step.number}
                    </div>
                    <StepIcon size={14} />
                    <span className="hidden sm:inline text-xs font-medium">
                      {step.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>

        {error && (
          <div className="mx-6 mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle
              className="text-red-400 flex-shrink-0 mt-0.5"
              size={18}
            />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mb-4 p-3 bg-green-900/20 border border-green-800 rounded-lg flex items-start gap-3">
            <CheckCircle2
              className="text-green-400 flex-shrink-0 mt-0.5"
              size={18}
            />
            <p className="text-sm text-green-300">{successMessage}</p>
          </div>
        )}

        <CardContent>
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            {!orderSubmitted ? (
              <>
                {currentStep === 1 && (
                  <div className="form-section">
                    <div className="form-section-header">
                      <FileText className="form-section-header icon" />
                      <h4>Client PO & Project Details</h4>
                    </div>

                    <div className="form-subsection-header">
                      <h5>PO Information</h5>
                    </div>
                    <div className="form-row">
                      <Input
                        label="PO Number *"
                        name="poNumber"
                        value={formData.poNumber}
                        onChange={handleBasicInfoChange}
                        placeholder="Enter PO number"
                        required
                      />
                      <Input
                        label="PO Date"
                        name="poDate"
                        type="date"
                        value={formData.poDate}
                        onChange={handleBasicInfoChange}
                      />
                    </div>

                    <div className="form-subsection-header">
                      <h5>Client Information</h5>
                    </div>
                    <div className="form-row">
                      <Input
                        label="Client Name *"
                        name="clientName"
                        value={formData.clientName}
                        onChange={handleBasicInfoChange}
                        placeholder="Enter client name"
                        required
                      />
                      <Input
                        label="Client Address *"
                        name="clientAddress"
                        value={formData.clientAddress}
                        onChange={handleBasicInfoChange}
                        placeholder="Enter client address"
                        required
                      />
                    </div>

                    <div className="form-subsection-header">
                      <h5>Project Details</h5>
                    </div>
                    <div className="form-row">
                      <Input
                        label="Project Name *"
                        name="projectName"
                        value={formData.projectName}
                        onChange={handleBasicInfoChange}
                        placeholder="e.g., Project-XYZ-2024"
                        required
                      />
                      <Input
                        label="Application"
                        name="application"
                        value={formData.projectRequirements.application}
                        onChange={handleProjectRequirementsChange}
                        placeholder="e.g., For loading/unloading missile canister"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Number of Units"
                        name="numberOfUnits"
                        type="number"
                        value={formData.projectRequirements.numberOfUnits}
                        onChange={handleProjectRequirementsChange}
                        placeholder="Enter number of units"
                      />
                      <Input
                        label="Delivery Timeline *"
                        name="deliveryTimeline"
                        type="date"
                        value={formData.deliveryTimeline}
                        onChange={handleBasicInfoChange}
                        required
                      />
                    </div>

                    <div className="form-subsection-header">
                      <h5>Technical Specifications</h5>
                    </div>
                    <div className="form-row">
                      <Input
                        label="Dimensions"
                        name="dimensions"
                        value={formData.projectRequirements.dimensions}
                        onChange={handleProjectRequirementsChange}
                        placeholder="e.g., 28m × 1.2m × 1.5m"
                      />
                      <Input
                        label="Load Capacity"
                        name="loadCapacity"
                        value={formData.projectRequirements.loadCapacity}
                        onChange={handleProjectRequirementsChange}
                        placeholder="e.g., 6000 kg"
                      />
                    </div>
                    <Input
                      label="Required Specifications/Standards"
                      name="specifications"
                      value={formData.projectRequirements.specifications}
                      onChange={handleProjectRequirementsChange}
                      placeholder="Enter technical specifications and standards"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Material Grade"
                        name="materialGrade"
                        value={formData.projectRequirements.materialGrade}
                        onChange={handleProjectRequirementsChange}
                        placeholder="e.g., SS 304, Mild Steel"
                      />
                      <Input
                        label="Finish & Coatings"
                        name="finishCoatings"
                        value={formData.projectRequirements.finishCoatings}
                        onChange={handleProjectRequirementsChange}
                        placeholder="e.g., Epoxy Primer, PU Defence Yellow"
                      />
                    </div>
                    <Input
                      label="Accessories"
                      name="accessories"
                      value={formData.projectRequirements.accessories}
                      onChange={handleProjectRequirementsChange}
                      placeholder="e.g., Winch unit, Roller saddles, Rotation stand"
                    />

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6">
                      Delivery & Testing Requirements
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Installation Requirement"
                        name="installationRequirement"
                        value={
                          formData.projectRequirements.installationRequirement
                        }
                        onChange={handleProjectRequirementsChange}
                        placeholder="e.g., On-site installation required"
                      />
                      <Input
                        label="Testing Standards"
                        name="testingStandards"
                        value={formData.projectRequirements.testingStandards}
                        onChange={handleProjectRequirementsChange}
                        placeholder="e.g., FAT, Load testing at 6000kg"
                      />
                    </div>
                    <Input
                      label="Documentation Requirement"
                      name="documentationRequirement"
                      value={
                        formData.projectRequirements.documentationRequirement
                      }
                      onChange={handleProjectRequirementsChange}
                      placeholder="e.g., QAP, Technical drawings, Operation manuals"
                    />

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6">
                      Commercial & Contractual Terms
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Warranty Terms"
                        name="warrantTerms"
                        value={formData.projectRequirements.warrantTerms}
                        onChange={handleProjectRequirementsChange}
                        placeholder="e.g., 2 years, 5 years"
                      />
                      <Input
                        label="Penalty Clauses"
                        name="penaltyClauses"
                        value={formData.projectRequirements.penaltyClauses}
                        onChange={handleProjectRequirementsChange}
                        placeholder="e.g., 0.5% per week delay"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Confidentiality Clauses"
                        name="confidentialityClauses"
                        value={
                          formData.projectRequirements.confidentialityClauses
                        }
                        onChange={handleProjectRequirementsChange}
                        placeholder="Enter confidentiality terms"
                      />
                      <Input
                        label="Acceptance Criteria"
                        name="acceptanceCriteria"
                        value={formData.projectRequirements.acceptanceCriteria}
                        onChange={handleProjectRequirementsChange}
                        placeholder="e.g., Load test at 6000kg, Functional test, FAT passed"
                      />
                    </div>

                    <div className="form-subsection-header">
                      <h5>PO Documents</h5>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 text-left mb-2">
                        Upload PO Documents *
                      </label>
                      <div className="border-2 border-dashed border-slate-600 rounded-lg p-4">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          id="po-upload"
                        />
                        <label
                          htmlFor="po-upload"
                          className="flex flex-col items-center gap-2 cursor-pointer"
                        >
                          <Upload size={24} className="text-slate-400" />
                          <span className="text-sm text-slate-300">
                            Click to upload PO documents
                          </span>
                        </label>
                      </div>
                      {poDocuments.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {poDocuments.map((doc, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-slate-700 p-2 rounded"
                            >
                              <span className="text-sm text-slate-200">
                                {doc.name || "Document"}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeDocument(idx)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="form-section">
                    <div className="form-section-header">
                      <Zap className="form-section-header icon" />
                      <h4>Sales Order & Order Information</h4>
                    </div>

                    <div className="form-subsection-header">
                      <h5>Sales & Contact Details</h5>
                    </div>
                    <div className="form-row">
                      <Input
                        label="Customer Contact Person *"
                        name="customerContact"
                        value={formData.customerContact}
                        onChange={handleBasicInfoChange}
                        placeholder="Enter contact person name"
                        required
                      />
                      <Input
                        label="Client Email *"
                        name="clientEmail"
                        type="email"
                        value={formData.clientEmail}
                        onChange={handleBasicInfoChange}
                        placeholder="Enter email address"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Client Phone *"
                        name="clientPhone"
                        value={formData.clientPhone}
                        onChange={handleBasicInfoChange}
                        placeholder="Enter phone number"
                        required
                      />
                      <Input
                        label="Estimated End Date *"
                        name="estimatedEndDate"
                        type="date"
                        value={formData.estimatedEndDate}
                        onChange={handleBasicInfoChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Billing Address"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleBasicInfoChange}
                        placeholder="Enter billing address"
                      />
                      <Input
                        label="Shipping Address"
                        name="shippingAddress"
                        value={formData.shippingAddress}
                        onChange={handleBasicInfoChange}
                        placeholder="Enter shipping address"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Payment Terms"
                        name="paymentTerms"
                        value={formData.paymentTerms}
                        onChange={handleBasicInfoChange}
                        placeholder="e.g., 40% advance, 40% before dispatch, 20% after installation"
                      />
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 text-left">
                          Project Priority
                        </label>
                        <select
                          name="projectPriority"
                          value={formData.projectPriority}
                          onChange={handleBasicInfoChange}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {priorityLevels.map((level) => (
                            <option key={level.key} value={level.value}>
                              {level.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6">
                      Client PO Information
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Client PO Number"
                        name="poNumber"
                        value={formData.clientPO.poNumber}
                        onChange={(e) => handleNestedFieldChange(e, "clientPO")}
                        placeholder="Enter Client PO number"
                      />
                      <Input
                        label="Client PO Date"
                        name="poDate"
                        type="date"
                        value={formData.clientPO.poDate}
                        onChange={(e) => handleNestedFieldChange(e, "clientPO")}
                      />
                    </div>
                    <Input
                      label="PO Value"
                      name="poValue"
                      type="number"
                      step="0.01"
                      value={formData.clientPO.poValue}
                      onChange={(e) => handleNestedFieldChange(e, "clientPO")}
                      placeholder="Enter PO value"
                    />

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6">
                      Product / Item Details
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Item Name"
                        name="itemName"
                        value={formData.productDetails.itemName}
                        onChange={(e) =>
                          handleNestedFieldChange(e, "productDetails")
                        }
                        placeholder="e.g., CCIS – Container Canister Integration Stand"
                      />
                      <Input
                        label="Item Description"
                        name="itemDescription"
                        value={formData.productDetails.itemDescription}
                        onChange={(e) =>
                          handleNestedFieldChange(e, "productDetails")
                        }
                        placeholder="Brief description of the item"
                      />
                    </div>
                    <Input
                      label="Components Included"
                      name="componentsList"
                      value={formData.productDetails.componentsList}
                      onChange={(e) =>
                        handleNestedFieldChange(e, "productDetails")
                      }
                      placeholder="e.g., Long Base Frame, Roller Saddle Assemblies, Rotational Cradle, Winch Unit"
                    />
                    <Input
                      label="Certification/Testing Requirements"
                      name="certification"
                      value={formData.productDetails.certification}
                      onChange={(e) =>
                        handleNestedFieldChange(e, "productDetails")
                      }
                      placeholder="e.g., QAP, FAT Report, CoC"
                    />

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6">
                      Quantity & Pricing
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Quantity"
                        name="quantity"
                        type="number"
                        value={formData.pricingDetails.quantity}
                        onChange={(e) =>
                          handleNestedFieldChange(e, "pricingDetails")
                        }
                        placeholder="e.g., 1, 2, etc."
                      />
                      <Input
                        label="Unit Price"
                        name="unitPrice"
                        type="number"
                        step="0.01"
                        value={formData.pricingDetails.unitPrice}
                        onChange={(e) =>
                          handleNestedFieldChange(e, "pricingDetails")
                        }
                        placeholder="Enter unit price"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Total Price *"
                        name="totalPrice"
                        type="number"
                        step="0.01"
                        value={formData.pricingDetails.totalPrice}
                        onChange={(e) =>
                          handleNestedFieldChange(e, "pricingDetails")
                        }
                        placeholder="Enter total price"
                        required
                      />
                      <Input
                        label="Discount / Special Terms"
                        name="discount"
                        value={formData.pricingDetails.discount}
                        onChange={(e) =>
                          handleNestedFieldChange(e, "pricingDetails")
                        }
                        placeholder="e.g., 5%, bulk discount"
                      />
                    </div>
                    <Input
                      label="Taxes Applicable"
                      name="taxesApplicable"
                      value={formData.pricingDetails.taxesApplicable}
                      onChange={(e) =>
                        handleNestedFieldChange(e, "pricingDetails")
                      }
                      placeholder="e.g., 18% GST"
                    />

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6">
                      Delivery & Production Terms
                    </h5>
                    <Input
                      label="Delivery Schedule"
                      name="deliverySchedule"
                      value={formData.deliveryTerms.deliverySchedule}
                      onChange={(e) =>
                        handleNestedFieldChange(e, "deliveryTerms")
                      }
                      placeholder="e.g., 12–16 Weeks from PO"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Packaging Information"
                        name="packagingInfo"
                        value={formData.deliveryTerms.packagingInfo}
                        onChange={(e) =>
                          handleNestedFieldChange(e, "deliveryTerms")
                        }
                        placeholder="e.g., Industrial pallet + wooden box + anti-rust oil"
                      />
                      <Input
                        label="Dispatch Mode"
                        name="dispatchMode"
                        value={formData.deliveryTerms.dispatchMode}
                        onChange={(e) =>
                          handleNestedFieldChange(e, "deliveryTerms")
                        }
                        placeholder="e.g., Road transport / Truck"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Installation Required"
                        name="installationRequired"
                        value={formData.deliveryTerms.installationRequired}
                        onChange={(e) =>
                          handleNestedFieldChange(e, "deliveryTerms")
                        }
                        placeholder="e.g., Yes, On-site installation"
                      />
                      <Input
                        label="Site Commissioning"
                        name="siteCommissioning"
                        value={formData.deliveryTerms.siteCommissioning}
                        onChange={(e) =>
                          handleNestedFieldChange(e, "deliveryTerms")
                        }
                        placeholder="e.g., Included / Not Included"
                      />
                    </div>

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6">
                      Quality & Compliance
                    </h5>
                    <Input
                      label="Quality Standards"
                      name="qualityStandards"
                      value={formData.qualityCompliance.qualityStandards}
                      onChange={(e) =>
                        handleNestedFieldChange(e, "qualityCompliance")
                      }
                      placeholder="e.g., ISO 9001:2015, DRDO standards"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Welding Standards"
                        name="weldingStandards"
                        value={formData.qualityCompliance.weldingStandards}
                        onChange={(e) =>
                          handleNestedFieldChange(e, "qualityCompliance")
                        }
                        placeholder="e.g., AWS D1.1"
                      />
                      <Input
                        label="Surface Finish"
                        name="surfaceFinish"
                        value={formData.qualityCompliance.surfaceFinish}
                        onChange={(e) =>
                          handleNestedFieldChange(e, "qualityCompliance")
                        }
                        placeholder="e.g., Blasting + Epoxy primer + PU coat"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Mechanical Load Testing"
                        name="mechanicalLoadTesting"
                        value={formData.qualityCompliance.mechanicalLoadTesting}
                        onChange={(e) =>
                          handleNestedFieldChange(e, "qualityCompliance")
                        }
                        placeholder="e.g., 6000 kg load test"
                      />
                      <Input
                        label="Electrical Compliance"
                        name="electricalCompliance"
                        value={formData.qualityCompliance.electricalCompliance}
                        onChange={(e) =>
                          handleNestedFieldChange(e, "qualityCompliance")
                        }
                        placeholder="e.g., IEC 61010, Safety compliance"
                      />
                    </div>
                    <Input
                      label="Documents Required"
                      name="documentsRequired"
                      value={formData.qualityCompliance.documentsRequired}
                      onChange={(e) =>
                        handleNestedFieldChange(e, "qualityCompliance")
                      }
                      placeholder="e.g., QAP, FAT Report, Installation Manual, Warranty Certificate"
                    />

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6">
                      Warranty & Support
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Warranty Period"
                        name="warrantyPeriod"
                        value={formData.warrantySupport.warrantyPeriod}
                        onChange={(e) =>
                          handleNestedFieldChange(e, "warrantySupport")
                        }
                        placeholder="e.g., 12 Months from installation"
                      />
                      <Input
                        label="Service Support"
                        name="serviceSupport"
                        value={formData.warrantySupport.serviceSupport}
                        onChange={(e) =>
                          handleNestedFieldChange(e, "warrantySupport")
                        }
                        placeholder="e.g., AMC available / On-call support"
                      />
                    </div>

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6">
                      Internal Information (For ERP)
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 text-left">
                          Project Manager
                        </label>
                        <select
                          name="projectManager"
                          value={formData.internalInfo.projectManager}
                          onChange={(e) =>
                            handleNestedFieldChange(e, "internalInfo")
                          }
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Project Manager</option>
                          {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.firstName} {emp.lastName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 text-left">
                          Production Supervisor
                        </label>
                        <select
                          name="productionSupervisor"
                          value={formData.internalInfo.productionSupervisor}
                          onChange={(e) =>
                            handleNestedFieldChange(e, "internalInfo")
                          }
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Production Supervisor</option>
                          {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.firstName} {emp.lastName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1 text-left">
                        Purchase Responsible Person
                      </label>
                      <select
                        name="purchaseResponsiblePerson"
                        value={formData.internalInfo.purchaseResponsiblePerson}
                        onChange={(e) =>
                          handleNestedFieldChange(e, "internalInfo")
                        }
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Responsible Person</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-2 gap-4">
                      <Input
                        label="Estimated Costing"
                        name="estimatedCosting"
                        type="number"
                        step="0.01"
                        value={formData.internalInfo.estimatedCosting}
                        onChange={(e) =>
                          handleNestedFieldChange(e, "internalInfo")
                        }
                        placeholder="Enter estimated costing"
                      />
                      <Input
                        label="Estimated Profit"
                        name="estimatedProfit"
                        type="number"
                        step="0.01"
                        value={formData.internalInfo.estimatedProfit}
                        onChange={(e) =>
                          handleNestedFieldChange(e, "internalInfo")
                        }
                        placeholder="Enter estimated profit"
                      />
                    </div>
                    <Input
                      label="Job Card Number"
                      name="jobCardNo"
                      value={formData.internalInfo.jobCardNo}
                      onChange={(e) =>
                        handleNestedFieldChange(e, "internalInfo")
                      }
                      placeholder="Auto-generated or enter manual number"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Total Amount *"
                        name="totalAmount"
                        type="number"
                        step="0.01"
                        value={formData.totalAmount}
                        onChange={handleBasicInfoChange}
                        placeholder="0.00"
                        required
                      />
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 text-left">
                          Project Category
                        </label>
                        <select
                          name="projectCategory"
                          value={formData.projectCategory}
                          onChange={handleBasicInfoChange}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select category</option>
                          {projectCategories.map((cat) => (
                            <option key={cat.key} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="form-section">
                    <div className="form-section-header">
                      <Package className="form-section-header icon" />
                      <h4>Material Requirement & Components</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 md:grid-cols-2 gap-4">
                        <Input
                          label="Material Category"
                          name="category"
                          value={currentMaterial.category}
                          onChange={handleMaterialChange}
                          placeholder="e.g., Raw Material"
                        />
                        <Input
                          label="Material Name *"
                          name="name"
                          value={currentMaterial.name}
                          onChange={handleMaterialChange}
                          placeholder="e.g., Stainless Steel"
                          required
                        />
                      </div>

                      <Input
                        label="Description"
                        name="description"
                        value={currentMaterial.description}
                        onChange={handleMaterialChange}
                        placeholder="Material description"
                      />

                      <div className="form-subsection-header">
                        <h5>Material Selection</h5>
                      </div>

                      <div className="info-banner">
                        <FileText className="info-banner-icon" />
                        <p>
                          Select the material types required for this project.
                          Only checked materials will appear in the form.
                        </p>
                      </div>

                      <div className="material-checkbox-grid">
                        <label className="material-checkbox-item">
                          <input
                            type="checkbox"
                            checked={enabledMaterials.steelSection}
                            onChange={() =>
                              toggleEnabledMaterial("steelSection")
                            }
                          />
                          <span>Steel Sections</span>
                        </label>
                        <label className="material-checkbox-item">
                          <input
                            type="checkbox"
                            checked={enabledMaterials.plateType}
                            onChange={() => toggleEnabledMaterial("plateType")}
                          />
                          <span>Plates</span>
                        </label>
                        <label className="material-checkbox-item">
                          <input
                            type="checkbox"
                            checked={enabledMaterials.materialGrade}
                            onChange={() =>
                              toggleEnabledMaterial("materialGrade")
                            }
                          />
                          <span>Material Grades</span>
                        </label>
                        <label className="material-checkbox-item">
                          <input
                            type="checkbox"
                            checked={enabledMaterials.fastenerType}
                            onChange={() =>
                              toggleEnabledMaterial("fastenerType")
                            }
                          />
                          <span>Fasteners</span>
                        </label>
                        <label className="material-checkbox-item">
                          <input
                            type="checkbox"
                            checked={enabledMaterials.machinedParts}
                            onChange={() =>
                              toggleEnabledMaterial("machinedParts")
                            }
                          />
                          <span>Machined Parts</span>
                        </label>
                        <label className="material-checkbox-item">
                          <input
                            type="checkbox"
                            checked={enabledMaterials.rollerMovementComponents}
                            onChange={() =>
                              toggleEnabledMaterial("rollerMovementComponents")
                            }
                          />
                          <span>Roller/Movement</span>
                        </label>
                        <label className="material-checkbox-item">
                          <input
                            type="checkbox"
                            checked={enabledMaterials.liftingPullingMechanisms}
                            onChange={() =>
                              toggleEnabledMaterial("liftingPullingMechanisms")
                            }
                          />
                          <span>Lifting/Pulling</span>
                        </label>
                        <label className="material-checkbox-item">
                          <input
                            type="checkbox"
                            checked={enabledMaterials.electricalAutomation}
                            onChange={() =>
                              toggleEnabledMaterial("electricalAutomation")
                            }
                          />
                          <span>Electrical/Automation</span>
                        </label>
                        <label className="material-checkbox-item">
                          <input
                            type="checkbox"
                            checked={enabledMaterials.safetyMaterials}
                            onChange={() =>
                              toggleEnabledMaterial("safetyMaterials")
                            }
                          />
                          <span>Safety Materials</span>
                        </label>
                        <label className="material-checkbox-item">
                          <input
                            type="checkbox"
                            checked={enabledMaterials.surfacePrepPainting}
                            onChange={() =>
                              toggleEnabledMaterial("surfacePrepPainting")
                            }
                          />
                          <span>Surface Prep/Paint</span>
                        </label>
                        <label className="material-checkbox-item">
                          <input
                            type="checkbox"
                            checked={enabledMaterials.fabricationConsumables}
                            onChange={() =>
                              toggleEnabledMaterial("fabricationConsumables")
                            }
                          />
                          <span>Fabrication Consumables</span>
                        </label>
                        <label className="material-checkbox-item">
                          <input
                            type="checkbox"
                            checked={enabledMaterials.hardwareMisc}
                            onChange={() =>
                              toggleEnabledMaterial("hardwareMisc")
                            }
                          />
                          <span>Hardware/Misc</span>
                        </label>
                        <label className="material-checkbox-item">
                          <input
                            type="checkbox"
                            checked={enabledMaterials.documentationMaterials}
                            onChange={() =>
                              toggleEnabledMaterial("documentationMaterials")
                            }
                          />
                          <span>Documentation</span>
                        </label>
                      </div>

                      <div className="">
                        <h6 className="text-xs font-semibold text-slate-300 uppercase">
                          Selection Options
                        </h6>
                        <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
                          {enabledMaterials.steelSection && (
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1 text-left">
                                Steel Sections
                              </label>
                              <select
                                name="steelSection"
                                value={currentMaterial.steelSection}
                                onChange={handleMaterialChange}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">
                                  Select Steel Section (Optional)
                                </option>
                                <option value="ISMB Beams (100–500 mm)">
                                  ISMB Beams (100–500 mm)
                                </option>
                                <option value="ISMC Channels (75–400 mm)">
                                  ISMC Channels (75–400 mm)
                                </option>
                                <option value="RHS / SHS box sections">
                                  RHS / SHS box sections
                                </option>
                                <option value="Angles (equal/unequal)">
                                  Angles (equal/unequal)
                                </option>
                                <option value="Flat bars">Flat bars</option>
                                <option value="Round bars">Round bars</option>
                              </select>
                            </div>
                          )}

                          {enabledMaterials.plateType && (
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1 text-left">
                                Plates
                              </label>
                              <select
                                name="plateType"
                                value={currentMaterial.plateType}
                                onChange={handleMaterialChange}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">
                                  Select Plate Type (Optional)
                                </option>
                                <option value="MS plates (5mm – 40mm)">
                                  MS plates (5mm – 40mm)
                                </option>
                                <option value="Chequered plates (if flooring needed)">
                                  Chequered plates (if flooring needed)
                                </option>
                                <option value="Base plates (thick 20–50mm)">
                                  Base plates (thick 20–50mm)
                                </option>
                              </select>
                            </div>
                          )}

                          {enabledMaterials.materialGrade && (
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1 text-left">
                                Material Grades
                              </label>
                              <select
                                name="materialGrade"
                                value={currentMaterial.materialGrade}
                                onChange={handleMaterialChange}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">
                                  Select Material Grade (Optional)
                                </option>
                                <option value="IS2062 E250/E350/E410">
                                  IS2062 E250/E350/E410
                                </option>
                                <option value="EN8/EN19 (for shafts)">
                                  EN8/EN19 (for shafts)
                                </option>
                                <option value="SS304 / SS316 (if needed)">
                                  SS304 / SS316 (if needed)
                                </option>
                              </select>
                            </div>
                          )}

                          {enabledMaterials.fastenerType && (
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1 text-left">
                                Fastener Type
                              </label>
                              <select
                                name="fastenerType"
                                value={currentMaterial.fastenerType}
                                onChange={handleMaterialChange}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">
                                  Select Fastener Type (Optional)
                                </option>
                                <option value="High tensile bolts (8.8 / 10.9)">
                                  High tensile bolts (8.8 / 10.9)
                                </option>
                                <option value="Nuts, washers (spring + flat)">
                                  Nuts, washers (spring + flat)
                                </option>
                                <option value="Anchor bolts (for foundation)">
                                  Anchor bolts (for foundation)
                                </option>
                              </select>
                            </div>
                          )}

                          {enabledMaterials.machinedParts && (
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1 text-left">
                                Machined Parts
                              </label>
                              <select
                                name="machinedParts"
                                value={currentMaterial.machinedParts}
                                onChange={handleMaterialChange}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">
                                  Select Machined Part Type (Optional)
                                </option>
                                <option value="Shafts">Shafts</option>
                                <option value="Bushes">Bushes</option>
                                <option value="Spacers">Spacers</option>
                                <option value="Machined brackets">
                                  Machined brackets
                                </option>
                                <option value="Flanges">Flanges</option>
                                <option value="Bearing housings">
                                  Bearing housings
                                </option>
                              </select>
                            </div>
                          )}

                          {enabledMaterials.rollerMovementComponents && (
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1 text-left">
                                Roller & Movement Components
                              </label>
                              <select
                                name="rollerMovementComponents"
                                value={currentMaterial.rollerMovementComponents}
                                onChange={handleMaterialChange}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">
                                  Select Component Type (Optional)
                                </option>
                                <option value="Rollers (Nylon/PU/Steel)">
                                  Rollers (Nylon/PU/Steel)
                                </option>
                                <option value="Bearings (ball, tapered, spherical)">
                                  Bearings (ball, tapered, spherical)
                                </option>
                                <option value="Linear guide rails">
                                  Linear guide rails
                                </option>
                                <option value="Guide wheels">
                                  Guide wheels
                                </option>
                                <option value="Gear racks / pinions (if motorized movement)">
                                  Gear racks / pinions (if motorized movement)
                                </option>
                              </select>
                            </div>
                          )}

                          {enabledMaterials.liftingPullingMechanisms && (
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1 text-left">
                                Lifting / Pulling Mechanisms
                              </label>
                              <select
                                name="liftingPullingMechanisms"
                                value={currentMaterial.liftingPullingMechanisms}
                                onChange={handleMaterialChange}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">
                                  Select Mechanism Type (Optional)
                                </option>
                                <option value="Winch System">
                                  Winch System
                                </option>
                                <option value="Hydraulic System">
                                  Hydraulic System
                                </option>
                              </select>
                            </div>
                          )}

                          {enabledMaterials.electricalAutomation && (
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1 text-left">
                                Electrical & Automation Materials
                              </label>
                              <select
                                name="electricalAutomation"
                                value={currentMaterial.electricalAutomation}
                                onChange={handleMaterialChange}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select Type (Optional)</option>
                                <option value="Panel Components">
                                  Panel Components
                                </option>
                                <option value="Sensors">Sensors</option>
                                <option value="Wiring">Wiring</option>
                              </select>
                            </div>
                          )}

                          {enabledMaterials.safetyMaterials && (
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1 text-left">
                                Safety Materials
                              </label>
                              <select
                                name="safetyMaterials"
                                value={currentMaterial.safetyMaterials}
                                onChange={handleMaterialChange}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select Type (Optional)</option>
                                <option value="Emergency Stop & Guards">
                                  Emergency Stop & Guards
                                </option>
                                <option value="Protective Barriers & Accessories">
                                  Protective Barriers & Accessories
                                </option>
                              </select>
                            </div>
                          )}

                          {enabledMaterials.surfacePrepPainting && (
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1 text-left">
                                Surface Prep & Painting Materials
                              </label>
                              <select
                                name="surfacePrepPainting"
                                value={currentMaterial.surfacePrepPainting}
                                onChange={handleMaterialChange}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select Type (Optional)</option>
                                <option value="Blasting & Primer">
                                  Blasting & Primer
                                </option>
                                <option value="Topcoat & Finishing">
                                  Topcoat & Finishing
                                </option>
                              </select>
                            </div>
                          )}

                          {enabledMaterials.fabricationConsumables && (
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1 text-left">
                                Fabrication Consumables
                              </label>
                              <select
                                name="fabricationConsumables"
                                value={currentMaterial.fabricationConsumables}
                                onChange={handleMaterialChange}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select Type (Optional)</option>
                                <option value="Welding Materials">
                                  Welding Materials
                                </option>
                                <option value="Cutting & Grinding">
                                  Cutting & Grinding
                                </option>
                              </select>
                            </div>
                          )}

                          {enabledMaterials.hardwareMisc && (
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1 text-left">
                                Hardware & Miscellaneous Items
                              </label>
                              <select
                                name="hardwareMisc"
                                value={currentMaterial.hardwareMisc}
                                onChange={handleMaterialChange}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select Type (Optional)</option>
                                <option value="Hardware Items">
                                  Hardware Items
                                </option>
                                <option value="Fasteners & Supports">
                                  Fasteners & Supports
                                </option>
                              </select>
                            </div>
                          )}

                          {enabledMaterials.documentationMaterials && (
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1 text-left">
                                Documentation Materials
                              </label>
                              <select
                                name="documentationMaterials"
                                value={currentMaterial.documentationMaterials}
                                onChange={handleMaterialChange}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select Type (Optional)</option>
                                <option value="Labeling & Tags">
                                  Labeling & Tags
                                </option>
                                <option value="Certificates & Documentation">
                                  Certificates & Documentation
                                </option>
                              </select>
                            </div>
                          )}
                        </div>

                        <div className="md:w-1/2 space-y-4">
                          <h6 className="text-xs font-semibold text-slate-300 uppercase">
                            Specifications
                          </h6>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Input
                          label="Quantity *"
                          name="quantity"
                          type="number"
                          value={currentMaterial.quantity}
                          onChange={handleMaterialChange}
                          placeholder="0"
                          required
                        />
                        <Input
                          label="Quality"
                          name="quality"
                          value={currentMaterial.quality}
                          onChange={handleMaterialChange}
                          placeholder="e.g., Premium, Standard, Budget"
                        />
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1 text-left">
                            Unit
                          </label>
                          <select
                            name="unit"
                            value={currentMaterial.unit}
                            onChange={handleMaterialChange}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {materialUnits.map((unit) => (
                              <option key={unit.key} value={unit.value}>
                                {unit.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1 text-left">
                            Source
                          </label>
                          <select
                            name="source"
                            value={currentMaterial.source}
                            onChange={handleMaterialChange}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {materialSources.map((source) => (
                              <option key={source.key} value={source.value}>
                                {source.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <Input
                        label="Specification"
                        name="specification"
                        value={currentMaterial.specification}
                        onChange={handleMaterialChange}
                        placeholder="e.g., 304 Grade, 2mm thickness"
                      />

                      <Input
                        label="Drawing Link"
                        name="drawingLink"
                        value={currentMaterial.drawingLink}
                        onChange={handleMaterialChange}
                        placeholder="Link to technical drawing"
                      />

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={addMaterial}
                          variant="secondary"
                          className="flex items-center gap-2"
                        >
                          <Plus size={18} />
                          {editingDetail ? "Update Material" : "Add Material"}
                        </Button>
                        {editingDetail && (
                          <Button
                            onClick={() => {
                              resetMaterial();
                              setEditingDetail(null);
                            }}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            Cancel Edit
                          </Button>
                        )}
                      </div>
                    </div>

                    {editingDetail && (
                      <div className="mt-4 mb-4 p-3 bg-blue-900 border border-blue-500 rounded-lg">
                        <p className="text-sm text-blue-200 flex items-center gap-2">
                          <span>✏️</span> Editing Material
                        </p>
                      </div>
                    )}

                    {formData.materials.length > 0 && (
                      <div className="mt-6 space-y-2">
                        <h5 className="text-sm font-medium text-slate-200">
                          Added Materials:
                        </h5>
                        {formData.materials.map((material) => (
                          <div
                            key={material.id}
                            className="flex items-center justify-between bg-slate-700 p-3 rounded"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-100">
                                {material.name}
                              </p>
                              <p className="text-xs text-slate-400">
                                {material.quantity} {material.unit} -{" "}
                                {material.category}
                              </p>
                              {material.steelSection && (
                                <p className="text-xs text-blue-400 mt-1">
                                  Steel: {material.steelSection}
                                </p>
                              )}
                              {material.plateType && (
                                <p className="text-xs text-blue-400">
                                  Plate: {material.plateType}
                                </p>
                              )}
                              {material.materialGrade && (
                                <p className="text-xs text-blue-400">
                                  Grade: {material.materialGrade}
                                </p>
                              )}
                              {(material.steelSize ||
                                material.steelLength ||
                                material.steelTolerance) && (
                                <div className="text-xs text-slate-400 mt-2 space-y-1">
                                  {material.steelSize && (
                                    <p>Size: {material.steelSize}</p>
                                  )}
                                  {material.steelLength && (
                                    <p>Length: {material.steelLength}mm</p>
                                  )}
                                  {material.steelTolerance && (
                                    <p>Tolerance: {material.steelTolerance}</p>
                                  )}
                                </div>
                              )}
                              {(material.plateThickness ||
                                material.plateLength ||
                                material.plateWidth ||
                                material.plateSurfaceFinish) && (
                                <div className="text-xs text-slate-400 mt-2 space-y-1">
                                  {material.plateThickness && (
                                    <p>
                                      Thickness: {material.plateThickness}mm
                                    </p>
                                  )}
                                  {material.plateLength && (
                                    <p>Length: {material.plateLength}mm</p>
                                  )}
                                  {material.plateWidth && (
                                    <p>Width: {material.plateWidth}mm</p>
                                  )}
                                  {material.plateSurfaceFinish && (
                                    <p>Finish: {material.plateSurfaceFinish}</p>
                                  )}
                                </div>
                              )}
                              {(material.gradeCertificationRequired ||
                                material.gradeTestingStandards ||
                                material.gradeSpecialRequirements) && (
                                <div className="text-xs text-slate-400 mt-2 space-y-1">
                                  {material.gradeCertificationRequired && (
                                    <p>
                                      Certification:{" "}
                                      {material.gradeCertificationRequired}
                                    </p>
                                  )}
                                  {material.gradeTestingStandards && (
                                    <p>
                                      Testing: {material.gradeTestingStandards}
                                    </p>
                                  )}
                                  {material.gradeSpecialRequirements && (
                                    <p>
                                      Requirements:{" "}
                                      {material.gradeSpecialRequirements}
                                    </p>
                                  )}
                                </div>
                              )}
                              {material.fastenerType && (
                                <p className="text-xs text-blue-400 mt-2">
                                  Fastener: {material.fastenerType}
                                </p>
                              )}
                              {(material.fastenerSize ||
                                material.fastenerQuantityPerUnit ||
                                material.fastenerPlating) && (
                                <div className="text-xs text-slate-400 mt-2 space-y-1">
                                  {material.fastenerSize && (
                                    <p>Size: M{material.fastenerSize}</p>
                                  )}
                                  {material.fastenerQuantityPerUnit && (
                                    <p>
                                      Per Unit:{" "}
                                      {material.fastenerQuantityPerUnit}
                                      pcs
                                    </p>
                                  )}
                                  {material.fastenerPlating && (
                                    <p>Plating: {material.fastenerPlating}</p>
                                  )}
                                </div>
                              )}
                              {material.machinedParts && (
                                <p className="text-xs text-blue-400 mt-2">
                                  Machined Part: {material.machinedParts}
                                </p>
                              )}
                              {material.machinedPartsSpecs &&
                                Object.keys(material.machinedPartsSpecs)
                                  .length > 0 && (
                                  <div className="text-xs text-slate-400 mt-2 space-y-1">
                                    {Object.entries(
                                      material.machinedPartsSpecs
                                    ).map(([key, value]) => (
                                      <p key={key}>
                                        {key}: {value}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              {material.rollerMovementComponents && (
                                <p className="text-xs text-blue-400 mt-2">
                                  Roller/Movement:{" "}
                                  {material.rollerMovementComponents}
                                </p>
                              )}
                              {material.rollerMovementComponentsSpecs &&
                                Object.keys(
                                  material.rollerMovementComponentsSpecs
                                ).length > 0 && (
                                  <div className="text-xs text-slate-400 mt-2 space-y-1">
                                    {Object.entries(
                                      material.rollerMovementComponentsSpecs
                                    ).map(([key, value]) => (
                                      <p key={key}>
                                        {key}: {value}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              {material.liftingPullingMechanisms && (
                                <p className="text-xs text-blue-400 mt-2">
                                  Lifting/Pulling:{" "}
                                  {material.liftingPullingMechanisms}
                                </p>
                              )}
                              {material.liftingPullingMechanismsSpecs &&
                                Object.keys(
                                  material.liftingPullingMechanismsSpecs
                                ).length > 0 && (
                                  <div className="text-xs text-slate-400 mt-2 space-y-1">
                                    {Object.entries(
                                      material.liftingPullingMechanismsSpecs
                                    ).map(([key, value]) => (
                                      <p key={key}>
                                        {key}: {value}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              {material.electricalAutomation && (
                                <p className="text-xs text-blue-400 mt-2">
                                  Electrical/Automation:{" "}
                                  {material.electricalAutomation}
                                </p>
                              )}
                              {material.electricalAutomationSpecs &&
                                Object.keys(material.electricalAutomationSpecs)
                                  .length > 0 && (
                                  <div className="text-xs text-slate-400 mt-2 space-y-1">
                                    {Object.entries(
                                      material.electricalAutomationSpecs
                                    ).map(([key, value]) => (
                                      <p key={key}>
                                        {key}: {value}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              {material.safetyMaterials && (
                                <p className="text-xs text-blue-400 mt-2">
                                  Safety Materials: {material.safetyMaterials}
                                </p>
                              )}
                              {material.safetyMaterialsSpecs &&
                                Object.keys(material.safetyMaterialsSpecs)
                                  .length > 0 && (
                                  <div className="text-xs text-slate-400 mt-2 space-y-1">
                                    {Object.entries(
                                      material.safetyMaterialsSpecs
                                    ).map(([key, value]) => (
                                      <p key={key}>
                                        {key}: {value}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              {material.surfacePrepPainting && (
                                <p className="text-xs text-blue-400 mt-2">
                                  Surface Prep/Paint:{" "}
                                  {material.surfacePrepPainting}
                                </p>
                              )}
                              {material.surfacePrepPaintingSpecs &&
                                Object.keys(material.surfacePrepPaintingSpecs)
                                  .length > 0 && (
                                  <div className="text-xs text-slate-400 mt-2 space-y-1">
                                    {Object.entries(
                                      material.surfacePrepPaintingSpecs
                                    ).map(([key, value]) => (
                                      <p key={key}>
                                        {key}: {value}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              {material.fabricationConsumables && (
                                <p className="text-xs text-blue-400 mt-2">
                                  Fabrication Consumables:{" "}
                                  {material.fabricationConsumables}
                                </p>
                              )}
                              {material.fabricationConsumablesSpecs &&
                                Object.keys(
                                  material.fabricationConsumablesSpecs
                                ).length > 0 && (
                                  <div className="text-xs text-slate-400 mt-2 space-y-1">
                                    {Object.entries(
                                      material.fabricationConsumablesSpecs
                                    ).map(([key, value]) => (
                                      <p key={key}>
                                        {key}: {value}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              {material.hardwareMisc && (
                                <p className="text-xs text-blue-400 mt-2">
                                  Hardware/Misc: {material.hardwareMisc}
                                </p>
                              )}
                              {material.hardwareMiscSpecs &&
                                Object.keys(material.hardwareMiscSpecs).length >
                                  0 && (
                                  <div className="text-xs text-slate-400 mt-2 space-y-1">
                                    {Object.entries(
                                      material.hardwareMiscSpecs
                                    ).map(([key, value]) => (
                                      <p key={key}>
                                        {key}: {value}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              {material.documentationMaterials && (
                                <p className="text-xs text-blue-400 mt-2">
                                  Documentation:{" "}
                                  {material.documentationMaterials}
                                </p>
                              )}
                              {material.documentationMaterialsSpecs &&
                                Object.keys(
                                  material.documentationMaterialsSpecs
                                ).length > 0 && (
                                  <div className="text-xs text-slate-400 mt-2 space-y-1">
                                    {Object.entries(
                                      material.documentationMaterialsSpecs
                                    ).map(([key, value]) => (
                                      <p key={key}>
                                        {key}: {value}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              {material.documentationUploadedFiles &&
                                material.documentationUploadedFiles.length >
                                  0 && (
                                  <div className="text-xs text-green-400 mt-2 space-y-1">
                                    <p className="font-medium">
                                      📄 Uploaded Files (
                                      {
                                        material.documentationUploadedFiles
                                          .length
                                      }
                                      ):
                                    </p>
                                    {material.documentationUploadedFiles.map(
                                      (file, idx) => (
                                        <p
                                          key={idx}
                                          className="text-slate-400 pl-2"
                                        >
                                          {file.name} ({file.size} KB)
                                        </p>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                            <button
                              type="button"
                              onClick={() => editMaterial(material)}
                              className="text-blue-400 hover:text-blue-300 mr-3"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeMaterial(material.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {(materialDetailsTable.steelSection.length > 0 ||
                      materialDetailsTable.plateType.length > 0 ||
                      materialDetailsTable.materialGrade.length > 0 ||
                      materialDetailsTable.fastenerType.length > 0 ||
                      materialDetailsTable.machinedParts.length > 0 ||
                      materialDetailsTable.rollerMovementComponents.length >
                        0 ||
                      materialDetailsTable.liftingPullingMechanisms.length >
                        0 ||
                      materialDetailsTable.electricalAutomation.length > 0 ||
                      materialDetailsTable.safetyMaterials.length > 0 ||
                      materialDetailsTable.surfacePrepPainting.length > 0 ||
                      materialDetailsTable.fabricationConsumables.length > 0 ||
                      materialDetailsTable.hardwareMisc.length > 0 ||
                      materialDetailsTable.documentationMaterials.length >
                        0) && (
                      <div className="mt-8">
                        <h5 className="text-sm font-semibold text-slate-200 mb-4">
                          Material Specifications Summary
                        </h5>
                        <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-700">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-slate-700 border-b border-slate-600">
                                <th className="px-4 py-3 text-left text-slate-300">
                                  Type
                                </th>
                                <th className="px-4 py-3 text-left text-slate-300">
                                  Selection
                                </th>
                                <th className="px-4 py-3 text-left text-slate-300">
                                  Details
                                </th>
                                <th className="px-4 py-3 text-left text-slate-300">
                                  Quantity
                                </th>
                                <th className="px-4 py-3 text-left text-slate-300">
                                  Quality
                                </th>
                                <th className="px-4 py-3 text-center text-slate-300">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {materialDetailsTable.steelSection.map((row) => (
                                <tr
                                  key={row.id}
                                  className="border-b border-slate-700 hover:bg-slate-700/50"
                                >
                                  <td className="px-4 py-3 text-slate-300 font-medium">
                                    Steel Section
                                  </td>
                                  <td className="px-4 py-3 text-slate-300">
                                    {row.selection}
                                  </td>
                                  <td className="px-4 py-3 text-slate-400">
                                    {row.steelSize && `Size: ${row.steelSize}`}
                                    {row.steelLength &&
                                      ` | Length: ${row.steelLength}mm`}
                                    {row.steelTolerance &&
                                      ` | Tol: ${row.steelTolerance}`}
                                  </td>
                                  <td className="px-4 py-3 text-slate-300">
                                    {row.steelSectionQuantity || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-slate-300">
                                    {row.steelSectionQuality || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingDetail({
                                            type: "steelSection",
                                            id: row.id,
                                          });
                                          setCurrentMaterial((prev) => ({
                                            ...prev,
                                            steelSection: row.selection,
                                            steelSize: row.steelSize,
                                            steelLength: row.steelLength,
                                            steelTolerance: row.steelTolerance,
                                            steelSectionQuantity:
                                              row.steelSectionQuantity,
                                            steelSectionQuality:
                                              row.steelSectionQuality,
                                          }));
                                          openSpecModal("steelSection");
                                        }}
                                        className="text-blue-400 hover:text-blue-300"
                                      >
                                        <Edit size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeDetailRow(
                                            "steelSection",
                                            row.id
                                          )
                                        }
                                        className="text-red-400 hover:text-red-300"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {materialDetailsTable.plateType.map((row) => (
                                <tr
                                  key={row.id}
                                  className="border-b border-slate-700 hover:bg-slate-700/50"
                                >
                                  <td className="px-4 py-3 text-slate-300 font-medium">
                                    Plate
                                  </td>
                                  <td className="px-4 py-3 text-slate-300">
                                    {row.selection}
                                  </td>
                                  <td className="px-4 py-3 text-slate-400">
                                    {row.plateThickness &&
                                      `Thick: ${row.plateThickness}mm`}
                                    {row.plateLength &&
                                      ` | Length: ${row.plateLength}mm`}
                                    {row.plateWidth &&
                                      ` | Width: ${row.plateWidth}mm`}
                                    {row.plateSurfaceFinish &&
                                      ` | Finish: ${row.plateSurfaceFinish}`}
                                  </td>
                                  <td className="px-4 py-3 text-slate-300">
                                    {row.plateTypeQuantity || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-slate-300">
                                    {row.plateTypeQuality || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingDetail({
                                            type: "plateType",
                                            id: row.id,
                                          });
                                          setCurrentMaterial((prev) => ({
                                            ...prev,
                                            plateType: row.selection,
                                            plateThickness: row.plateThickness,
                                            plateLength: row.plateLength,
                                            plateWidth: row.plateWidth,
                                            plateSurfaceFinish:
                                              row.plateSurfaceFinish,
                                            plateTypeQuantity:
                                              row.plateTypeQuantity,
                                            plateTypeQuality:
                                              row.plateTypeQuality,
                                          }));
                                          openSpecModal("plateType");
                                        }}
                                        className="text-blue-400 hover:text-blue-300"
                                      >
                                        <Edit size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeDetailRow("plateType", row.id)
                                        }
                                        className="text-red-400 hover:text-red-300"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {materialDetailsTable.materialGrade.map((row) => (
                                <tr
                                  key={row.id}
                                  className="border-b border-slate-700 hover:bg-slate-700/50"
                                >
                                  <td className="px-4 py-3 text-slate-300 font-medium">
                                    Material Grade
                                  </td>
                                  <td className="px-4 py-3 text-slate-300">
                                    {row.selection}
                                  </td>
                                  <td className="px-4 py-3 text-slate-400">
                                    {row.gradeCertificationRequired &&
                                      `Cert: ${row.gradeCertificationRequired}`}
                                    {row.gradeTestingStandards &&
                                      ` | Testing: ${row.gradeTestingStandards}`}
                                    {row.gradeSpecialRequirements &&
                                      ` | Special: ${row.gradeSpecialRequirements}`}
                                  </td>
                                  <td className="px-4 py-3 text-slate-300">
                                    {row.materialGradeQuantity || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-slate-300">
                                    {row.materialGradeQuality || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingDetail({
                                            type: "materialGrade",
                                            id: row.id,
                                          });
                                          setCurrentMaterial((prev) => ({
                                            ...prev,
                                            materialGrade: row.selection,
                                            gradeCertificationRequired:
                                              row.gradeCertificationRequired,
                                            gradeTestingStandards:
                                              row.gradeTestingStandards,
                                            gradeSpecialRequirements:
                                              row.gradeSpecialRequirements,
                                            materialGradeQuantity:
                                              row.materialGradeQuantity,
                                            materialGradeQuality:
                                              row.materialGradeQuality,
                                          }));
                                          openSpecModal("materialGrade");
                                        }}
                                        className="text-blue-400 hover:text-blue-300"
                                      >
                                        <Edit size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeDetailRow(
                                            "materialGrade",
                                            row.id
                                          )
                                        }
                                        className="text-red-400 hover:text-red-300"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {materialDetailsTable.fastenerType.map((row) => (
                                <tr
                                  key={row.id}
                                  className="border-b border-slate-700 hover:bg-slate-700/50"
                                >
                                  <td className="px-4 py-3 text-slate-300 font-medium">
                                    Fastener
                                  </td>
                                  <td className="px-4 py-3 text-slate-300">
                                    {row.selection}
                                  </td>
                                  <td className="px-4 py-3 text-slate-400">
                                    {row.fastenerSize &&
                                      `Size: M${row.fastenerSize}`}
                                    {row.fastenerQuantityPerUnit &&
                                      ` | Per Unit: ${row.fastenerQuantityPerUnit}pcs`}
                                    {row.fastenerPlating &&
                                      ` | Plating: ${row.fastenerPlating}`}
                                  </td>
                                  <td className="px-4 py-3 text-slate-300">
                                    {row.fastenerTypeQuantity || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-slate-300">
                                    {row.fastenerTypeQuality || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingDetail({
                                            type: "fastenerType",
                                            id: row.id,
                                          });
                                          setCurrentMaterial((prev) => ({
                                            ...prev,
                                            fastenerType: row.selection,
                                            fastenerSize: row.fastenerSize,
                                            fastenerQuantityPerUnit:
                                              row.fastenerQuantityPerUnit,
                                            fastenerPlating:
                                              row.fastenerPlating,
                                            fastenerTypeQuantity:
                                              row.fastenerTypeQuantity,
                                            fastenerTypeQuality:
                                              row.fastenerTypeQuality,
                                          }));
                                          openSpecModal("fastenerType");
                                        }}
                                        className="text-blue-400 hover:text-blue-300"
                                      >
                                        <Edit size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeDetailRow(
                                            "fastenerType",
                                            row.id
                                          )
                                        }
                                        className="text-red-400 hover:text-red-300"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {materialDetailsTable.machinedParts.map((row) => (
                                <tr
                                  key={row.id}
                                  className="border-b border-slate-700 hover:bg-slate-700/50"
                                >
                                  <td className="px-4 py-3 text-slate-300 font-medium">
                                    Machined Part
                                  </td>
                                  <td className="px-4 py-3 text-slate-300">
                                    {row.selection}
                                  </td>
                                  <td className="px-4 py-3 text-slate-400">
                                    {Object.entries(row)
                                      .filter(
                                        ([key]) =>
                                          key !== "id" &&
                                          key !== "selection" &&
                                          key !== "machinedPartsQuantity" &&
                                          key !== "machinedPartsQuality"
                                      )
                                      .map(
                                        ([key, value]) =>
                                          value && `${key}: ${value}`
                                      )
                                      .filter(Boolean)
                                      .join(" | ")}
                                  </td>
                                  <td className="px-4 py-3 text-slate-300">
                                    {row.machinedPartsQuantity || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-slate-300">
                                    {row.machinedPartsQuality || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingDetail({
                                            type: "machinedParts",
                                            id: row.id,
                                          });
                                          setCurrentMaterial((prev) => ({
                                            ...prev,
                                            machinedParts: row.selection,
                                            machinedPartsSpecs: Object.entries(
                                              row
                                            )
                                              .filter(
                                                ([key]) =>
                                                  key !== "id" &&
                                                  key !== "selection" &&
                                                  key !==
                                                    "machinedPartsQuantity" &&
                                                  key !== "machinedPartsQuality"
                                              )
                                              .reduce((acc, [key, value]) => {
                                                acc[key] = value;
                                                return acc;
                                              }, {}),
                                            machinedPartsQuantity:
                                              row.machinedPartsQuantity,
                                            machinedPartsQuality:
                                              row.machinedPartsQuality,
                                          }));
                                          openSpecModal("machinedParts");
                                        }}
                                        className="text-blue-400 hover:text-blue-300"
                                      >
                                        <Edit size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeDetailRow(
                                            "machinedParts",
                                            row.id
                                          )
                                        }
                                        className="text-red-400 hover:text-red-300"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {materialDetailsTable.rollerMovementComponents.map(
                                (row) => (
                                  <tr
                                    key={row.id}
                                    className="border-b border-slate-700 hover:bg-slate-700/50"
                                  >
                                    <td className="px-4 py-3 text-slate-300 font-medium">
                                      Roller/Movement
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">
                                      {row.selection}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">
                                      {Object.entries(row)
                                        .filter(
                                          ([key]) =>
                                            key !== "id" &&
                                            key !== "selection" &&
                                            key !==
                                              "rollerMovementComponentsQuantity" &&
                                            key !==
                                              "rollerMovementComponentsQuality"
                                        )
                                        .map(
                                          ([key, value]) =>
                                            value && `${key}: ${value}`
                                        )
                                        .filter(Boolean)
                                        .join(" | ")}
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">
                                      {row.rollerMovementComponentsQuantity ||
                                        "-"}
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">
                                      {row.rollerMovementComponentsQuality ||
                                        "-"}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <div className="flex justify-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingDetail({
                                              type: "rollerMovementComponents",
                                              id: row.id,
                                            });
                                            setCurrentMaterial((prev) => ({
                                              ...prev,
                                              rollerMovementComponents:
                                                row.selection,
                                              rollerMovementComponentsSpecs:
                                                Object.entries(row)
                                                  .filter(
                                                    ([key]) =>
                                                      key !== "id" &&
                                                      key !== "selection" &&
                                                      key !==
                                                        "rollerMovementComponentsQuantity" &&
                                                      key !==
                                                        "rollerMovementComponentsQuality"
                                                  )
                                                  .reduce(
                                                    (acc, [key, value]) => {
                                                      acc[key] = value;
                                                      return acc;
                                                    },
                                                    {}
                                                  ),
                                              rollerMovementComponentsQuantity:
                                                row.rollerMovementComponentsQuantity,
                                              rollerMovementComponentsQuality:
                                                row.rollerMovementComponentsQuality,
                                            }));
                                            openSpecModal(
                                              "rollerMovementComponents"
                                            );
                                          }}
                                          className="text-blue-400 hover:text-blue-300"
                                        >
                                          <Edit size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeDetailRow(
                                              "rollerMovementComponents",
                                              row.id
                                            )
                                          }
                                          className="text-red-400 hover:text-red-300"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              )}
                              {materialDetailsTable.liftingPullingMechanisms.map(
                                (row) => (
                                  <tr
                                    key={row.id}
                                    className="border-b border-slate-700 hover:bg-slate-700/50"
                                  >
                                    <td className="px-4 py-3 text-slate-300 font-medium">
                                      Lifting/Pulling
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">
                                      {row.selection}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">
                                      {Object.entries(row)
                                        .filter(
                                          ([key]) =>
                                            key !== "id" &&
                                            key !== "selection" &&
                                            key !==
                                              "liftingPullingMechanismsQuantity" &&
                                            key !==
                                              "liftingPullingMechanismsQuality"
                                        )
                                        .map(
                                          ([key, value]) =>
                                            value && `${key}: ${value}`
                                        )
                                        .filter(Boolean)
                                        .join(" | ")}
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">
                                      {row.liftingPullingMechanismsQuantity ||
                                        "-"}
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">
                                      {row.liftingPullingMechanismsQuality ||
                                        "-"}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <div className="flex justify-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingDetail({
                                              type: "liftingPullingMechanisms",
                                              id: row.id,
                                            });
                                            setCurrentMaterial((prev) => ({
                                              ...prev,
                                              liftingPullingMechanisms:
                                                row.selection,
                                              liftingPullingMechanismsSpecs:
                                                Object.entries(row)
                                                  .filter(
                                                    ([key]) =>
                                                      key !== "id" &&
                                                      key !== "selection" &&
                                                      key !==
                                                        "liftingPullingMechanismsQuantity" &&
                                                      key !==
                                                        "liftingPullingMechanismsQuality"
                                                  )
                                                  .reduce(
                                                    (acc, [key, value]) => {
                                                      acc[key] = value;
                                                      return acc;
                                                    },
                                                    {}
                                                  ),
                                              liftingPullingMechanismsQuantity:
                                                row.liftingPullingMechanismsQuantity,
                                              liftingPullingMechanismsQuality:
                                                row.liftingPullingMechanismsQuality,
                                            }));
                                            openSpecModal(
                                              "liftingPullingMechanisms"
                                            );
                                          }}
                                          className="text-blue-400 hover:text-blue-300"
                                        >
                                          <Edit size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeDetailRow(
                                              "liftingPullingMechanisms",
                                              row.id
                                            )
                                          }
                                          className="text-red-400 hover:text-red-300"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              )}
                              {materialDetailsTable.electricalAutomation.map(
                                (row) => (
                                  <tr
                                    key={row.id}
                                    className="border-b border-slate-700 hover:bg-slate-700/50"
                                  >
                                    <td className="px-4 py-3 text-slate-300 font-medium">
                                      Electrical/Automation
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">
                                      {row.selection}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">
                                      {Object.entries(row)
                                        .filter(
                                          ([key]) =>
                                            key !== "id" &&
                                            key !== "selection" &&
                                            key !==
                                              "electricalAutomationQuantity" &&
                                            key !==
                                              "electricalAutomationQuality"
                                        )
                                        .map(
                                          ([key, value]) =>
                                            value && `${key}: ${value}`
                                        )
                                        .filter(Boolean)
                                        .join(" | ")}
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">
                                      {row.electricalAutomationQuantity || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">
                                      {row.electricalAutomationQuality || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <div className="flex justify-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingDetail({
                                              type: "electricalAutomation",
                                              id: row.id,
                                            });
                                            setCurrentMaterial((prev) => ({
                                              ...prev,
                                              electricalAutomation:
                                                row.selection,
                                              electricalAutomationSpecs:
                                                Object.entries(row)
                                                  .filter(
                                                    ([key]) =>
                                                      key !== "id" &&
                                                      key !== "selection" &&
                                                      key !==
                                                        "electricalAutomationQuantity" &&
                                                      key !==
                                                        "electricalAutomationQuality"
                                                  )
                                                  .reduce(
                                                    (acc, [key, value]) => {
                                                      acc[key] = value;
                                                      return acc;
                                                    },
                                                    {}
                                                  ),
                                              electricalAutomationQuantity:
                                                row.electricalAutomationQuantity,
                                              electricalAutomationQuality:
                                                row.electricalAutomationQuality,
                                            }));
                                            openSpecModal(
                                              "electricalAutomation"
                                            );
                                          }}
                                          className="text-blue-400 hover:text-blue-300"
                                        >
                                          <Edit size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeDetailRow(
                                              "electricalAutomation",
                                              row.id
                                            )
                                          }
                                          className="text-red-400 hover:text-red-300"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              )}
                              {materialDetailsTable.safetyMaterials.map(
                                (row) => (
                                  <tr
                                    key={row.id}
                                    className="border-b border-slate-700 hover:bg-slate-700/50"
                                  >
                                    <td className="px-4 py-3 text-slate-300 font-medium">
                                      Safety Materials
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">
                                      {row.selection}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">
                                      {Object.entries(row)
                                        .filter(
                                          ([key]) =>
                                            key !== "id" &&
                                            key !== "selection" &&
                                            key !== "safetyMaterialsQuantity" &&
                                            key !== "safetyMaterialsQuality"
                                        )
                                        .map(
                                          ([key, value]) =>
                                            value && `${key}: ${value}`
                                        )
                                        .filter(Boolean)
                                        .join(" | ")}
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">
                                      {row.safetyMaterialsQuantity || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">
                                      {row.safetyMaterialsQuality || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <div className="flex justify-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingDetail({
                                              type: "safetyMaterials",
                                              id: row.id,
                                            });
                                            setCurrentMaterial((prev) => ({
                                              ...prev,
                                              safetyMaterials: row.selection,
                                              safetyMaterialsSpecs:
                                                Object.entries(row)
                                                  .filter(
                                                    ([key]) =>
                                                      key !== "id" &&
                                                      key !== "selection" &&
                                                      key !==
                                                        "safetyMaterialsQuantity" &&
                                                      key !==
                                                        "safetyMaterialsQuality"
                                                  )
                                                  .reduce(
                                                    (acc, [key, value]) => {
                                                      acc[key] = value;
                                                      return acc;
                                                    },
                                                    {}
                                                  ),
                                              safetyMaterialsQuantity:
                                                row.safetyMaterialsQuantity,
                                              safetyMaterialsQuality:
                                                row.safetyMaterialsQuality,
                                            }));
                                            openSpecModal("safetyMaterials");
                                          }}
                                          className="text-blue-400 hover:text-blue-300"
                                        >
                                          <Edit size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeDetailRow(
                                              "safetyMaterials",
                                              row.id
                                            )
                                          }
                                          className="text-red-400 hover:text-red-300"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              )}
                              {materialDetailsTable.surfacePrepPainting.map(
                                (row) => (
                                  <tr
                                    key={row.id}
                                    className="border-b border-slate-700 hover:bg-slate-700/50"
                                  >
                                    <td className="px-4 py-3 text-slate-300 font-medium">
                                      Surface Prep/Paint
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">
                                      {row.selection}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">
                                      {Object.entries(row)
                                        .filter(
                                          ([key]) =>
                                            key !== "id" &&
                                            key !== "selection" &&
                                            key !==
                                              "surfacePrepPaintingQuantity" &&
                                            key !== "surfacePrepPaintingQuality"
                                        )
                                        .map(
                                          ([key, value]) =>
                                            value && `${key}: ${value}`
                                        )
                                        .filter(Boolean)
                                        .join(" | ")}
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">
                                      {row.surfacePrepPaintingQuantity || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">
                                      {row.surfacePrepPaintingQuality || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <div className="flex justify-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingDetail({
                                              type: "surfacePrepPainting",
                                              id: row.id,
                                            });
                                            setCurrentMaterial((prev) => ({
                                              ...prev,
                                              surfacePrepPainting:
                                                row.selection,
                                              surfacePrepPaintingSpecs:
                                                Object.entries(row)
                                                  .filter(
                                                    ([key]) =>
                                                      key !== "id" &&
                                                      key !== "selection" &&
                                                      key !==
                                                        "surfacePrepPaintingQuantity" &&
                                                      key !==
                                                        "surfacePrepPaintingQuality"
                                                  )
                                                  .reduce(
                                                    (acc, [key, value]) => {
                                                      acc[key] = value;
                                                      return acc;
                                                    },
                                                    {}
                                                  ),
                                              surfacePrepPaintingQuantity:
                                                row.surfacePrepPaintingQuantity,
                                              surfacePrepPaintingQuality:
                                                row.surfacePrepPaintingQuality,
                                            }));
                                            openSpecModal(
                                              "surfacePrepPainting"
                                            );
                                          }}
                                          className="text-blue-400 hover:text-blue-300"
                                        >
                                          <Edit size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeDetailRow(
                                              "surfacePrepPainting",
                                              row.id
                                            )
                                          }
                                          className="text-red-400 hover:text-red-300"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              )}
                              {materialDetailsTable.fabricationConsumables.map(
                                (row) => (
                                  <tr
                                    key={row.id}
                                    className="border-b border-slate-700 hover:bg-slate-700/50"
                                  >
                                    <td className="px-4 py-3 text-slate-300 font-medium">
                                      Fabrication Consumables
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">
                                      {row.selection}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">
                                      {Object.entries(row)
                                        .filter(
                                          ([key]) =>
                                            key !== "id" &&
                                            key !== "selection" &&
                                            key !==
                                              "fabricationConsumablesQuantity" &&
                                            key !==
                                              "fabricationConsumablesQuality"
                                        )
                                        .map(
                                          ([key, value]) =>
                                            value && `${key}: ${value}`
                                        )
                                        .filter(Boolean)
                                        .join(" | ")}
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">
                                      {row.fabricationConsumablesQuantity ||
                                        "-"}
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">
                                      {row.fabricationConsumablesQuality || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <div className="flex justify-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingDetail({
                                              type: "fabricationConsumables",
                                              id: row.id,
                                            });
                                            setCurrentMaterial((prev) => ({
                                              ...prev,
                                              fabricationConsumables:
                                                row.selection,
                                              fabricationConsumablesSpecs:
                                                Object.entries(row)
                                                  .filter(
                                                    ([key]) =>
                                                      key !== "id" &&
                                                      key !== "selection" &&
                                                      key !==
                                                        "fabricationConsumablesQuantity" &&
                                                      key !==
                                                        "fabricationConsumablesQuality"
                                                  )
                                                  .reduce(
                                                    (acc, [key, value]) => {
                                                      acc[key] = value;
                                                      return acc;
                                                    },
                                                    {}
                                                  ),
                                              fabricationConsumablesQuantity:
                                                row.fabricationConsumablesQuantity,
                                              fabricationConsumablesQuality:
                                                row.fabricationConsumablesQuality,
                                            }));
                                            openSpecModal(
                                              "fabricationConsumables"
                                            );
                                          }}
                                          className="text-blue-400 hover:text-blue-300"
                                        >
                                          <Edit size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeDetailRow(
                                              "fabricationConsumables",
                                              row.id
                                            )
                                          }
                                          className="text-red-400 hover:text-red-300"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              )}
                              {materialDetailsTable.hardwareMisc.map((row) => (
                                <tr
                                  key={row.id}
                                  className="border-b border-slate-700 hover:bg-slate-700/50"
                                >
                                  <td className="px-4 py-3 text-slate-300 font-medium">
                                    Hardware/Misc
                                  </td>
                                  <td className="px-4 py-3 text-slate-300">
                                    {row.selection}
                                  </td>
                                  <td className="px-4 py-3 text-slate-400">
                                    {Object.entries(row)
                                      .filter(
                                        ([key]) =>
                                          key !== "id" &&
                                          key !== "selection" &&
                                          key !== "hardwareMiscQuantity" &&
                                          key !== "hardwareMiscQuality"
                                      )
                                      .map(
                                        ([key, value]) =>
                                          value && `${key}: ${value}`
                                      )
                                      .filter(Boolean)
                                      .join(" | ")}
                                  </td>
                                  <td className="px-4 py-3 text-slate-300">
                                    {row.hardwareMiscQuantity || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-slate-300">
                                    {row.hardwareMiscQuality || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingDetail({
                                            type: "hardwareMisc",
                                            id: row.id,
                                          });
                                          setCurrentMaterial((prev) => ({
                                            ...prev,
                                            hardwareMisc: row.selection,
                                            hardwareMiscSpecs: Object.entries(
                                              row
                                            )
                                              .filter(
                                                ([key]) =>
                                                  key !== "id" &&
                                                  key !== "selection" &&
                                                  key !==
                                                    "hardwareMiscQuantity" &&
                                                  key !== "hardwareMiscQuality"
                                              )
                                              .reduce((acc, [key, value]) => {
                                                acc[key] = value;
                                                return acc;
                                              }, {}),
                                            hardwareMiscQuantity:
                                              row.hardwareMiscQuantity,
                                            hardwareMiscQuality:
                                              row.hardwareMiscQuality,
                                          }));
                                          openSpecModal("hardwareMisc");
                                        }}
                                        className="text-blue-400 hover:text-blue-300"
                                      >
                                        <Edit size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeDetailRow(
                                            "hardwareMisc",
                                            row.id
                                          )
                                        }
                                        className="text-red-400 hover:text-red-300"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {materialDetailsTable.documentationMaterials.map(
                                (row) => (
                                  <tr
                                    key={row.id}
                                    className="border-b border-slate-700 hover:bg-slate-700/50"
                                  >
                                    <td className="px-4 py-3 text-slate-300 font-medium">
                                      Documentation
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">
                                      {row.selection}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">
                                      {Object.entries(row)
                                        .filter(
                                          ([key]) =>
                                            key !== "id" &&
                                            key !== "selection" &&
                                            key !==
                                              "documentationMaterialsQuantity" &&
                                            key !==
                                              "documentationMaterialsQuality"
                                        )
                                        .map(
                                          ([key, value]) =>
                                            value && `${key}: ${value}`
                                        )
                                        .filter(Boolean)
                                        .join(" | ")}
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">
                                      {row.documentationMaterialsQuantity ||
                                        "-"}
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">
                                      {row.documentationMaterialsQuality || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <div className="flex justify-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingDetail({
                                              type: "documentationMaterials",
                                              id: row.id,
                                            });
                                            setCurrentMaterial((prev) => ({
                                              ...prev,
                                              documentationMaterials:
                                                row.selection,
                                              documentationMaterialsSpecs:
                                                Object.entries(row)
                                                  .filter(
                                                    ([key]) =>
                                                      key !== "id" &&
                                                      key !== "selection" &&
                                                      key !==
                                                        "documentationMaterialsQuantity" &&
                                                      key !==
                                                        "documentationMaterialsQuality"
                                                  )
                                                  .reduce(
                                                    (acc, [key, value]) => {
                                                      acc[key] = value;
                                                      return acc;
                                                    },
                                                    {}
                                                  ),
                                              documentationMaterialsQuantity:
                                                row.documentationMaterialsQuantity,
                                              documentationMaterialsQuality:
                                                row.documentationMaterialsQuality,
                                            }));
                                            openSpecModal(
                                              "documentationMaterials"
                                            );
                                          }}
                                          className="text-blue-400 hover:text-blue-300"
                                        >
                                          <Edit size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeDetailRow(
                                              "documentationMaterials",
                                              row.id
                                            )
                                          }
                                          className="text-red-400 hover:text-red-300"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="form-section">
                    <div className="form-section-header">
                      <FileText className="form-section-header icon" />
                      <h4>Design Engineering Details</h4>
                    </div>

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide">
                      General Design Information
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Design ID / Drawing No."
                        name="designId"
                        value={
                          formData.designEngineering.generalDesignInfo.designId
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "generalDesignInfo"
                          )
                        }
                        placeholder="e.g., DRG-001-2025"
                      />
                      <Input
                        label="Revision No."
                        name="revisionNo"
                        value={
                          formData.designEngineering.generalDesignInfo
                            .revisionNo
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "generalDesignInfo"
                          )
                        }
                        placeholder="e.g., Rev 1.0"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Design Engineer Name"
                        name="designEngineerName"
                        value={
                          formData.designEngineering.generalDesignInfo
                            .designEngineerName
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "generalDesignInfo"
                          )
                        }
                        placeholder="Enter engineer name"
                      />
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1 text-left">
                          Design Status
                        </label>
                        <select
                          name="designStatus"
                          value={
                            formData.designEngineering.generalDesignInfo
                              .designStatus
                          }
                          onChange={(e) =>
                            handleNestedFieldChange(
                              e,
                              "designEngineering",
                              "generalDesignInfo"
                            )
                          }
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In-progress">In-progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Approved">Approved</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Design Start Date"
                        name="designStartDate"
                        type="date"
                        value={
                          formData.designEngineering.generalDesignInfo
                            .designStartDate
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "generalDesignInfo"
                          )
                        }
                      />
                      <Input
                        label="Design Completion Date"
                        name="designCompletionDate"
                        type="date"
                        value={
                          formData.designEngineering.generalDesignInfo
                            .designCompletionDate
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "generalDesignInfo"
                          )
                        }
                      />
                    </div>

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6">
                      Product Specification
                    </h5>
                    <Input
                      label="Product Name"
                      name="productName"
                      value={
                        formData.designEngineering.productSpecification
                          .productName
                      }
                      onChange={(e) =>
                        handleNestedFieldChange(
                          e,
                          "designEngineering",
                          "productSpecification"
                        )
                      }
                      placeholder="e.g., CCIS – Container Canister Integration Stand"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="System Length (mm)"
                        name="systemLength"
                        type="number"
                        value={
                          formData.designEngineering.productSpecification
                            .systemLength
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "productSpecification"
                          )
                        }
                        placeholder="Enter length in mm"
                      />
                      <Input
                        label="System Width (mm)"
                        name="systemWidth"
                        type="number"
                        value={
                          formData.designEngineering.productSpecification
                            .systemWidth
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "productSpecification"
                          )
                        }
                        placeholder="Enter width in mm"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="System Height (mm)"
                        name="systemHeight"
                        type="number"
                        value={
                          formData.designEngineering.productSpecification
                            .systemHeight
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "productSpecification"
                          )
                        }
                        placeholder="Enter height in mm"
                      />
                      <Input
                        label="Load Capacity (kg)"
                        name="loadCapacity"
                        type="number"
                        value={
                          formData.designEngineering.productSpecification
                            .loadCapacity
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "productSpecification"
                          )
                        }
                        placeholder="e.g., 6000"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Operating Environment"
                        name="operatingEnvironment"
                        value={
                          formData.designEngineering.productSpecification
                            .operatingEnvironment
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "productSpecification"
                          )
                        }
                        placeholder="e.g., Indoor / Outdoor"
                      />
                      <Input
                        label="Material Grade"
                        name="materialGrade"
                        value={
                          formData.designEngineering.productSpecification
                            .materialGrade
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "productSpecification"
                          )
                        }
                        placeholder="e.g., IS2062 E350, E410"
                      />
                    </div>
                    <Input
                      label="Surface Finish"
                      name="surfaceFinish"
                      value={
                        formData.designEngineering.productSpecification
                          .surfaceFinish
                      }
                      onChange={(e) =>
                        handleNestedFieldChange(
                          e,
                          "designEngineering",
                          "productSpecification"
                        )
                      }
                      placeholder="e.g., Blasting + Epoxy Primer + PU"
                    />

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6">
                      Base Frame & Rails
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Base Frame Length (mm)"
                        name="baseFrameLength"
                        type="number"
                        value={
                          formData.designEngineering.baseFrameRails
                            .baseFrameLength
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "baseFrameRails"
                          )
                        }
                        placeholder="Enter length"
                      />
                      <Input
                        label="Section Type"
                        name="sectionType"
                        value={
                          formData.designEngineering.baseFrameRails.sectionType
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "baseFrameRails"
                          )
                        }
                        placeholder="e.g., ISMB, ISMC, Custom"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Rail Type"
                        name="railType"
                        value={
                          formData.designEngineering.baseFrameRails.railType
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "baseFrameRails"
                          )
                        }
                        placeholder="e.g., Roller rail, Linear rail"
                      />
                      <Input
                        label="Rail Alignment Tolerance (mm)"
                        name="railAlignmentTolerance"
                        type="number"
                        value={
                          formData.designEngineering.baseFrameRails
                            .railAlignmentTolerance
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "baseFrameRails"
                          )
                        }
                        placeholder="Enter tolerance"
                      />
                    </div>
                    <Input
                      label="Rail Mounting Method"
                      name="railMountingMethod"
                      value={
                        formData.designEngineering.baseFrameRails
                          .railMountingMethod
                      }
                      onChange={(e) =>
                        handleNestedFieldChange(
                          e,
                          "designEngineering",
                          "baseFrameRails"
                        )
                      }
                      placeholder="e.g., Bolted, Welded"
                    />

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6">
                      Roller Saddle Assembly
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="No. of Saddle Units"
                        name="noOfSaddleUnits"
                        type="number"
                        value={
                          formData.designEngineering.rollerSaddleAssembly
                            .noOfSaddleUnits
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "rollerSaddleAssembly"
                          )
                        }
                        placeholder="Enter number"
                      />
                      <Input
                        label="Saddle Load Capacity (kg)"
                        name="saddleLoadCapacity"
                        type="number"
                        value={
                          formData.designEngineering.rollerSaddleAssembly
                            .saddleLoadCapacity
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "rollerSaddleAssembly"
                          )
                        }
                        placeholder="Enter capacity"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Roller Type"
                        name="rollerType"
                        value={
                          formData.designEngineering.rollerSaddleAssembly
                            .rollerType
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "rollerSaddleAssembly"
                          )
                        }
                        placeholder="e.g., Nylon, Steel, PU-coated"
                      />
                      <Input
                        label="Roller Diameter (mm)"
                        name="rollerDiameter"
                        type="number"
                        value={
                          formData.designEngineering.rollerSaddleAssembly
                            .rollerDiameter
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "rollerSaddleAssembly"
                          )
                        }
                        placeholder="Enter diameter"
                      />
                    </div>
                    <Input
                      label="Roller Bearing Type"
                      name="rollerBearingType"
                      value={
                        formData.designEngineering.rollerSaddleAssembly
                          .rollerBearingType
                      }
                      onChange={(e) =>
                        handleNestedFieldChange(
                          e,
                          "designEngineering",
                          "rollerSaddleAssembly"
                        )
                      }
                      placeholder="e.g., Ball bearing, Roller bearing"
                    />

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6">
                      Rotational Cradle / Holding Ring
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Cradle Diameter (mm)"
                        name="cradleDiameter"
                        type="number"
                        value={
                          formData.designEngineering.rotationalCradle
                            .cradleDiameter
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "rotationalCradle"
                          )
                        }
                        placeholder="Enter diameter"
                      />
                      <Input
                        label="Rotation Angle (degrees)"
                        name="rotationAngle"
                        value={
                          formData.designEngineering.rotationalCradle
                            .rotationAngle
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "rotationalCradle"
                          )
                        }
                        placeholder="e.g., 0–180°"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Mechanism"
                        name="mechanism"
                        value={
                          formData.designEngineering.rotationalCradle.mechanism
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "rotationalCradle"
                          )
                        }
                        placeholder="e.g., Manual, Motorized"
                      />
                      <Input
                        label="Locking System Type"
                        name="lockingSystemType"
                        value={
                          formData.designEngineering.rotationalCradle
                            .lockingSystemType
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "rotationalCradle"
                          )
                        }
                        placeholder="e.g., Pin lock, Hydraulic lock"
                      />
                    </div>

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6">
                      Winch & Pulling System
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Winch Capacity (kg)"
                        name="winchCapacity"
                        type="number"
                        value={
                          formData.designEngineering.winchPullingSystem
                            .winchCapacity
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "winchPullingSystem"
                          )
                        }
                        placeholder="Enter capacity"
                      />
                      <Input
                        label="Motor Power (kW)"
                        name="motorPower"
                        type="number"
                        step="0.01"
                        value={
                          formData.designEngineering.winchPullingSystem
                            .motorPower
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "winchPullingSystem"
                          )
                        }
                        placeholder="e.g., 5.5"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Gearbox Type"
                        name="gearboxType"
                        value={
                          formData.designEngineering.winchPullingSystem
                            .gearboxType
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "winchPullingSystem"
                          )
                        }
                        placeholder="e.g., Helical, Planetary"
                      />
                      <Input
                        label="Cable Length (m)"
                        name="cableLength"
                        type="number"
                        value={
                          formData.designEngineering.winchPullingSystem
                            .cableLength
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "winchPullingSystem"
                          )
                        }
                        placeholder="Enter length"
                      />
                    </div>
                    <Input
                      label="Cable Diameter (mm)"
                      name="cableDiameter"
                      type="number"
                      value={
                        formData.designEngineering.winchPullingSystem
                          .cableDiameter
                      }
                      onChange={(e) =>
                        handleNestedFieldChange(
                          e,
                          "designEngineering",
                          "winchPullingSystem"
                        )
                      }
                      placeholder="Enter diameter"
                    />

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6">
                      Electrical & Control Design
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Control Panel Type"
                        name="controlPanelType"
                        value={
                          formData.designEngineering.electricalControl
                            .controlPanelType
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "electricalControl"
                          )
                        }
                        placeholder="e.g., PLC-based, Relay-based"
                      />
                      <Input
                        label="Power Requirement (V/Hz/Phase)"
                        name="powerRequirement"
                        value={
                          formData.designEngineering.electricalControl
                            .powerRequirement
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "electricalControl"
                          )
                        }
                        placeholder="e.g., 415V/50Hz/3Ph"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Limit Switch Count"
                        name="limitSwitchCount"
                        type="number"
                        value={
                          formData.designEngineering.electricalControl
                            .limitSwitchCount
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "electricalControl"
                          )
                        }
                        placeholder="Enter count"
                      />
                      <Input
                        label="Sensor Types"
                        name="sensorTypes"
                        value={
                          formData.designEngineering.electricalControl
                            .sensorTypes
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "electricalControl"
                          )
                        }
                        placeholder="e.g., Proximity, Mechanical, Load cell"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Emergency Stop Requirement"
                        name="emergencyStopRequirement"
                        value={
                          formData.designEngineering.electricalControl
                            .emergencyStopRequirement
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "electricalControl"
                          )
                        }
                        placeholder="e.g., Yes, Emergency stop provided"
                      />
                      <Input
                        label="Control Logic"
                        name="controlLogic"
                        value={
                          formData.designEngineering.electricalControl
                            .controlLogic
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "electricalControl"
                          )
                        }
                        placeholder="e.g., Manual, Semi-automatic"
                      />
                    </div>

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6">
                      Safety Requirements
                    </h5>
                    <Input
                      label="Guard Requirements"
                      name="guardRequirements"
                      value={
                        formData.designEngineering.safetyRequirements
                          .guardRequirements
                      }
                      onChange={(e) =>
                        handleNestedFieldChange(
                          e,
                          "designEngineering",
                          "safetyRequirements"
                        )
                      }
                      placeholder="e.g., Perimeter guard, Safety rail"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Interlocks Required"
                        name="interlocksRequired"
                        value={
                          formData.designEngineering.safetyRequirements
                            .interlocksRequired
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "safetyRequirements"
                          )
                        }
                        placeholder="e.g., Safety interlock on access doors"
                      />
                      <Input
                        label="Anti-tilt System Design"
                        name="antiTiltSystemDesign"
                        value={
                          formData.designEngineering.safetyRequirements
                            .antiTiltSystemDesign
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "safetyRequirements"
                          )
                        }
                        placeholder="e.g., Low center of gravity, Wide base"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Max Operating Speed (m/min)"
                        name="maxOperatingSpeed"
                        type="number"
                        value={
                          formData.designEngineering.safetyRequirements
                            .maxOperatingSpeed
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "safetyRequirements"
                          )
                        }
                        placeholder="Enter speed"
                      />
                      <Input
                        label="Load Test Safety Factor"
                        name="loadTestSafetyFactor"
                        type="number"
                        step="0.1"
                        value={
                          formData.designEngineering.safetyRequirements
                            .loadTestSafetyFactor
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "safetyRequirements"
                          )
                        }
                        placeholder="e.g., 1.5, 2.0"
                      />
                    </div>

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6">
                      Standards & Compliance
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Welding Standard"
                        name="weldingStandard"
                        value={
                          formData.designEngineering.standardsCompliance
                            .weldingStandard
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "standardsCompliance"
                          )
                        }
                        placeholder="e.g., AWS D1.1, IS 9595"
                      />
                      <Input
                        label="Painting Standard"
                        name="paintingStandard"
                        value={
                          formData.designEngineering.standardsCompliance
                            .paintingStandard
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "standardsCompliance"
                          )
                        }
                        placeholder="e.g., IS 9399, ISO 12944"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Dimensional Tolerance Standards"
                        name="dimensionalToleranceStandards"
                        value={
                          formData.designEngineering.standardsCompliance
                            .dimensionalToleranceStandards
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "standardsCompliance"
                          )
                        }
                        placeholder="e.g., ISO 286"
                      />
                      <Input
                        label="QC Inspection Stage Required"
                        name="qcInspectionStageRequired"
                        value={
                          formData.designEngineering.standardsCompliance
                            .qcInspectionStageRequired
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(
                            e,
                            "designEngineering",
                            "standardsCompliance"
                          )
                        }
                        placeholder="e.g., Yes, At completion"
                      />
                    </div>
                    <Input
                      label="DRDO Compliance Requirements"
                      name="drodComplianceRequirements"
                      value={
                        formData.designEngineering.standardsCompliance
                          .drodComplianceRequirements
                      }
                      onChange={(e) =>
                        handleNestedFieldChange(
                          e,
                          "designEngineering",
                          "standardsCompliance"
                        )
                      }
                      placeholder="e.g., QAP, QC checklist, Certification required"
                    />

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6">
                      Comments / Notes
                    </h5>
                    <Input
                      label="Internal Design Notes"
                      name="internalDesignNotes"
                      value={
                        formData.designEngineering.commentsNotes
                          .internalDesignNotes
                      }
                      onChange={(e) =>
                        handleNestedFieldChange(
                          e,
                          "designEngineering",
                          "commentsNotes"
                        )
                      }
                      placeholder="Enter any internal design notes"
                    />
                    <Input
                      label="Risk Assessment"
                      name="riskAssessment"
                      value={
                        formData.designEngineering.commentsNotes.riskAssessment
                      }
                      onChange={(e) =>
                        handleNestedFieldChange(
                          e,
                          "designEngineering",
                          "commentsNotes"
                        )
                      }
                      placeholder="Identify any design risks"
                    />
                    <Input
                      label="Design Constraints"
                      name="designConstraints"
                      value={
                        formData.designEngineering.commentsNotes
                          .designConstraints
                      }
                      onChange={(e) =>
                        handleNestedFieldChange(
                          e,
                          "designEngineering",
                          "commentsNotes"
                        )
                      }
                      placeholder="List design constraints"
                    />
                    <Input
                      label="Special Instructions"
                      name="specialInstructions"
                      value={
                        formData.designEngineering.commentsNotes
                          .specialInstructions
                      }
                      onChange={(e) =>
                        handleNestedFieldChange(
                          e,
                          "designEngineering",
                          "commentsNotes"
                        )
                      }
                      placeholder="Any special instructions for fabrication"
                    />
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="form-section">
                    <div className="form-section-header">
                      <Zap className="form-section-header icon" />
                      <h4>Production Plan</h4>
                    </div>

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide">
                      Manufacturing Timeline
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Production Start Date"
                        name="productionStartDate"
                        type="date"
                        value={
                          formData.materialProcurement.materialProcurement || ""
                        }
                        onChange={(e) =>
                          handleNestedFieldChange(e, "materialProcurement")
                        }
                        placeholder="Select production start date"
                      />
                      <Input
                        label="Estimated Completion Date"
                        name="estimatedCompletionDate"
                        type="date"
                        value={formData.productDetails.itemDescription || ""}
                        onChange={(e) =>
                          handleNestedFieldChange(e, "productDetails")
                        }
                        placeholder="Select estimated completion date"
                      />
                    </div>

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6">
                      Material Procurement Status
                    </h5>
                    <Input
                      label="Procurement Status"
                      name="materialProcurement"
                      value={formData.materialProcurement.materialProcurement}
                      onChange={(e) =>
                        handleNestedFieldChange(e, "materialProcurement")
                      }
                      placeholder="e.g., In Progress, Completed, Pending Approval"
                    />

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6">
                      Vendor Allocation
                    </h5>
                    <Input
                      label="Assigned Vendors"
                      name="vendorAllocation"
                      value={formData.materialProcurement.vendorAllocation}
                      onChange={(e) =>
                        handleNestedFieldChange(e, "materialProcurement")
                      }
                      placeholder="e.g., Vendor A - Steel, Vendor B - Components"
                    />

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6 mb-4">
                      Material Information
                    </h5>
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">
                            Material Type
                          </label>
                          <select
                            name="materialType"
                            value={productionMaterialInfo.materialType || ""}
                            onChange={handleProductionMaterialChange}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Type</option>
                            <option value="Plate">Plate</option>
                            <option value="Beam">Beam</option>
                            <option value="Channel">Channel</option>
                            <option value="Pipe">Pipe</option>
                            <option value="Bar">Bar</option>
                          </select>
                        </div>
                        <Input
                          label="Grade"
                          type="text"
                          name="grade"
                          value={productionMaterialInfo.grade || ""}
                          onChange={handleProductionMaterialChange}
                          placeholder="e.g., E250, EN8"
                        />
                        <Input
                          label="Thickness / Size"
                          type="text"
                          name="thickness"
                          value={productionMaterialInfo.thickness || ""}
                          onChange={handleProductionMaterialChange}
                          placeholder="e.g., 10mm, 50x50"
                        />
                        <Input
                          label="Heat No."
                          type="text"
                          name="heatNo"
                          value={productionMaterialInfo.heatNo || ""}
                          onChange={handleProductionMaterialChange}
                          placeholder="e.g., HT-2024-001"
                        />
                        <Input
                          label="Supplier Name"
                          type="text"
                          name="supplierName"
                          value={productionMaterialInfo.supplierName || ""}
                          onChange={handleProductionMaterialChange}
                          placeholder="e.g., XYZ Steel Ltd"
                        />
                        <Input
                          label="Received Quantity"
                          type="number"
                          name="receivedQuantity"
                          value={productionMaterialInfo.receivedQuantity || ""}
                          onChange={handleProductionMaterialChange}
                          placeholder="e.g., 100"
                        />
                        <Input
                          label="Required Quantity"
                          type="number"
                          name="requiredQuantity"
                          value={productionMaterialInfo.requiredQuantity || ""}
                          onChange={handleProductionMaterialChange}
                          placeholder="e.g., 100"
                        />
                        <Input
                          label="Storage Location"
                          type="text"
                          name="storageLocation"
                          value={productionMaterialInfo.storageLocation || ""}
                          onChange={handleProductionMaterialChange}
                          placeholder="e.g., Rack A-10"
                        />
                        <Input
                          label="Prepared By"
                          type="text"
                          name="preparedBy"
                          value={productionMaterialInfo.preparedBy || ""}
                          onChange={handleProductionMaterialChange}
                          placeholder="e.g., John Doe"
                        />
                        <Input
                          label="Preparation Date"
                          type="date"
                          name="preparationDate"
                          value={productionMaterialInfo.preparationDate || ""}
                          onChange={handleProductionMaterialChange}
                        />
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">
                            QC Status
                          </label>
                          <select
                            name="qcStatus"
                            value={productionMaterialInfo.qcStatus || ""}
                            onChange={handleProductionMaterialChange}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Status</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Pending">Pending</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">
                            Upload MTC
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.png"
                              onChange={(e) =>
                                handleProductionMaterialFileChange(e, "mtcFile")
                              }
                              className="hidden"
                              id="mtc-upload"
                            />
                            <label
                              htmlFor="mtc-upload"
                              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 cursor-pointer hover:bg-slate-600 text-center text-sm"
                            >
                              {productionMaterialInfo.mtcFileName ||
                                "Choose File"}
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">
                            Upload Material Image
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.webp"
                              onChange={(e) =>
                                handleProductionMaterialFileChange(
                                  e,
                                  "materialImage"
                                )
                              }
                              className="hidden"
                              id="material-image-upload"
                            />
                            <label
                              htmlFor="material-image-upload"
                              className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 cursor-pointer hover:bg-slate-600 text-center text-sm"
                            >
                              {productionMaterialInfo.materialImageName ||
                                "Choose File"}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6 mb-4">
                      Production Phases
                    </h5>

                    <div className="info-banner mb-4">
                      <p className="text-sm">
                        Select the production phases required for this project.
                        Only checked phases will show selection options.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                      {Object.keys(PRODUCTION_PHASES).map((phase) => (
                        <label
                          key={phase}
                          className="flex items-center gap-2 p-3 border border-slate-600 rounded-lg bg-slate-800/50 cursor-pointer hover:bg-slate-800 hover:border-blue-500 transition-colors"
                        >
                          <input
                            type="checkbox"
                            id={`phase-${phase}`}
                            checked={phase in selectedProductionPhases}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProductionPhases((prev) => ({
                                  ...prev,
                                  [phase]: true,
                                }));
                              } else {
                                const newPhases = {
                                  ...selectedProductionPhases,
                                };
                                delete newPhases[phase];
                                setSelectedProductionPhases(newPhases);
                                const detailsToDelete = {};
                                Object.keys(productionPhaseDetails).forEach(
                                  (key) => {
                                    if (!key.startsWith(phase)) {
                                      detailsToDelete[key] =
                                        productionPhaseDetails[key];
                                    }
                                  }
                                );
                                setProductionPhaseDetails(detailsToDelete);
                              }
                            }}
                            className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="text-sm font-medium text-slate-200">
                            {phase}
                          </span>
                          {Object.entries(productionPhaseDetails).filter(
                            ([key]) => key.startsWith(phase)
                          ).length > 0 && (
                            <span className="ml-auto text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">
                              {
                                Object.entries(productionPhaseDetails).filter(
                                  ([key]) => key.startsWith(phase)
                                ).length
                              }
                            </span>
                          )}
                        </label>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {Object.keys(PRODUCTION_PHASES).map(
                        (phase) =>
                          selectedProductionPhases[phase] !== undefined && (
                            <div
                              key={phase}
                              className="border border-slate-600 rounded-lg overflow-hidden"
                            >
                              <div className="bg-gradient-to-r from-blue-900/30 to-slate-800 px-4 py-3 border-b border-slate-600">
                                <h6 className="text-sm font-semibold text-slate-100">
                                  {phase}
                                </h6>
                              </div>
                              <div className="p-4 bg-slate-900/50 space-y-3">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
                                    Select Sub-task
                                  </label>
                                  <select
                                    value=""
                                    onChange={(e) => {
                                      const selectedValue = e.target.value;
                                      if (selectedValue) {
                                        const subTask = PRODUCTION_PHASES[
                                          phase
                                        ].find(
                                          (t) => t.value === selectedValue
                                        );
                                        if (subTask) {
                                          openProductionPhaseModal(
                                            phase,
                                            subTask
                                          );
                                        }
                                      }
                                    }}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="">
                                      -- Select a sub-task --
                                    </option>
                                    {PRODUCTION_PHASES[phase].map((subTask) => (
                                      <option
                                        key={subTask.value}
                                        value={subTask.value}
                                      >
                                        {subTask.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="space-y-2">
                                  {Object.entries(productionPhaseDetails)
                                    .filter(([key]) => key.startsWith(phase))
                                    .map(([key, detail]) => {
                                      const subTask = PRODUCTION_PHASES[
                                        phase
                                      ].find(
                                        (t) => t.value === detail.subTask.value
                                      );
                                      return (
                                        <div
                                          key={key}
                                          className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex items-center justify-between"
                                        >
                                          <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-200">
                                              {subTask?.label}
                                            </p>
                                            <div className="text-xs text-slate-400 mt-1 space-y-0.5">
                                              {detail.quantity && (
                                                <p>Qty: {detail.quantity}</p>
                                              )}
                                              {detail.estimatedHours && (
                                                <p>
                                                  Hours: {detail.estimatedHours}
                                                </p>
                                              )}
                                              {detail.responsiblePerson && (
                                                <p>
                                                  Person:{" "}
                                                  {detail.responsiblePerson}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex gap-2 ml-3">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                openProductionPhaseModal(
                                                  phase,
                                                  detail.subTask
                                                )
                                              }
                                              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                                            >
                                              Edit
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const newDetails = {
                                                  ...productionPhaseDetails,
                                                };
                                                const newTracking = {
                                                  ...productionPhaseTracking,
                                                };
                                                delete newDetails[key];
                                                delete newTracking[key];
                                                setProductionPhaseDetails(
                                                  newDetails
                                                );
                                                setProductionPhaseTracking(
                                                  newTracking
                                                );
                                              }}
                                              className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors"
                                            >
                                              Remove
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            </div>
                          )
                      )}
                    </div>

                    {Object.keys(productionPhaseTracking).length > 0 && (
                      <>
                        <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-8 mb-4">
                          Production Phases Tracking
                        </h5>
                        <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-700 ">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-900 border-b border-slate-700">
                                <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                                  Step #
                                </th>
                                <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                                  Phase / SubTask
                                </th>
                                <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                                  Process Type
                                </th>
                                <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                                  Assignee / Vendor
                                </th>
                                <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                                  Contact / Details
                                </th>
                                <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                                  Delivery Date
                                </th>
                                <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                                  Start Time
                                </th>

                                <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                                  Finish Time
                                </th>
                                <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                                  Challan
                                </th>
                                <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(productionPhaseTracking).map(
                                ([key, tracking]) => {
                                  const isOutsource =
                                    phaseProcessType[key] === "outsource";
                                  return (
                                    <tr
                                      key={key}
                                      className={`border-b border-slate-700 hover:bg-slate-700/50 transition-colors ${
                                        isOutsource ? "bg-orange-950/20" : ""
                                      }`}
                                    >
                                      <td className="px-4 py-3 text-slate-200">
                                        {tracking.stepNumber}
                                      </td>
                                      <td className="px-4 py-3">
                                        <div>
                                          <p className="text-slate-200 font-medium">
                                            {tracking.phase}
                                          </p>
                                          <p className="text-xs text-slate-400">
                                            {tracking.subTask}
                                          </p>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <span
                                          className={`px-2 py-1 rounded text-xs font-medium ${
                                            isOutsource
                                              ? "bg-orange-900/50 text-orange-300"
                                              : "bg-blue-900/50 text-blue-300"
                                          }`}
                                        >
                                          {isOutsource
                                            ? "Outsource"
                                            : "In-House"}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <input
                                          type="text"
                                          value={tracking.assignee}
                                          onChange={(e) =>
                                            updateProductionPhaseStatus(key, {
                                              assignee: e.target.value,
                                            })
                                          }
                                          placeholder={
                                            isOutsource
                                              ? "Vendor name"
                                              : "Assignee name"
                                          }
                                          className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                      </td>
                                      <td className="px-4 py-3 text-xs text-slate-300">
                                        {isOutsource
                                          ? productionPhaseDetails[key]
                                              ?.vendorContact || "—"
                                          : productionPhaseDetails[key]
                                              ?.responsiblePerson || "—"}
                                      </td>
                                      <td className="px-4 py-3 text-xs text-slate-300">
                                        {productionPhaseDetails[key]
                                          ?.expectedDeliveryDate
                                          ? new Date(
                                              productionPhaseDetails[
                                                key
                                              ].expectedDeliveryDate
                                            ).toLocaleDateString()
                                          : "—"}
                                      </td>
                                      <td className="px-4 py-3 text-slate-300 text-xs">
                                        {tracking.startTime
                                          ? new Date(
                                              tracking.startTime
                                            ).toLocaleString()
                                          : "—"}
                                      </td>
                                      <td className="px-4 py-3 text-slate-300 text-xs">
                                        {tracking.finishTime
                                          ? new Date(
                                              tracking.finishTime
                                            ).toLocaleString()
                                          : "—"}
                                      </td>

                                      <td className="px-4 py-3">
                                        <span
                                          className={`px-2 py-1 rounded text-xs font-medium ${
                                            tracking.status === "Completed"
                                              ? "bg-green-900/50 text-green-300"
                                              : tracking.status === "Outsourced"
                                              ? "bg-orange-900/50 text-orange-300"
                                              : tracking.status ===
                                                "In Progress"
                                              ? "bg-blue-900/50 text-blue-300"
                                              : "bg-yellow-900/50 text-yellow-300"
                                          }`}
                                        >
                                          {tracking.status}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-xs">
                                        {outwardChallans[key] && (
                                          <div className="space-y-1">
                                            <p className="text-blue-300">
                                              OC:{" "}
                                              {outwardChallans[key].challanNo}
                                            </p>
                                            {inwardChallans[key] && (
                                              <p className="text-green-300">
                                                IC:{" "}
                                                {inwardChallans[key].challanNo}
                                              </p>
                                            )}
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="flex gap-1 flex-wrap">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const detail =
                                                productionPhaseDetails[key];
                                              if (detail) {
                                                openProductionPhaseModal(
                                                  detail.phase,
                                                  detail.subTask
                                                );
                                              }
                                            }}
                                            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded transition-colors"
                                          >
                                            Edit
                                          </button>
                                          {tracking.status ===
                                            "Not Started" && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                startProductionPhase(key)
                                              }
                                              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                                            >
                                              Start
                                            </button>
                                          )}
                                          {isOutsource &&
                                            tracking.status === "In Progress" &&
                                            !outwardChallans[key] && (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  createOutwardChallan(key)
                                                }
                                                className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded transition-colors"
                                              >
                                                Out Challan
                                              </button>
                                            )}
                                          {isOutsource &&
                                            outwardChallans[key] &&
                                            tracking.status === "Outsourced" &&
                                            !inwardChallans[key] && (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  createInwardChallan(key)
                                                }
                                                className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition-colors"
                                              >
                                                In Challan
                                              </button>
                                            )}
                                          {!isOutsource &&
                                            tracking.status ===
                                              "In Progress" && (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  finishProductionPhase(key)
                                                }
                                                className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition-colors"
                                              >
                                                Finish
                                              </button>
                                            )}
                                          {tracking.status ===
                                            "In Progress" && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                updateProductionPhaseStatus(
                                                  key,
                                                  { status: "On Hold" }
                                                )
                                              }
                                              className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded transition-colors"
                                            >
                                              Hold
                                            </button>
                                          )}
                                          {(tracking.status === "On Hold" ||
                                            tracking.status ===
                                              "Not Started") && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                updateProductionPhaseStatus(
                                                  key,
                                                  { status: "Cancelled" }
                                                )
                                              }
                                              className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors"
                                            >
                                              Cancel
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                }
                              )}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6">
                      Quality Checkpoints
                    </h5>
                    <Input
                      label="Incoming Inspection"
                      name="incomingInspection"
                      value={formData.materialProcurement.incomingInspection}
                      onChange={(e) =>
                        handleNestedFieldChange(e, "materialProcurement")
                      }
                      placeholder="e.g., Yes, Ongoing, Completed"
                    />

                    <h5 className="text-xs font-semibold text-blue-300 uppercase tracking-wide mt-6">
                      Production Notes
                    </h5>
                    <textarea
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                      placeholder="Enter any special production instructions or constraints"
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                {currentStep >= 6 && (
                  <div className="space-y-6">
                    <h4 className="text-sm font-semibold text-slate-100">
                      Step {currentStep}: {WIZARD_STEPS[currentStep - 1].name} -
                      Assign Employee
                    </h4>

                    <div className="bg-slate-700 p-4 rounded-lg">
                      <p className="text-sm text-slate-300 mb-4">
                        Assign an employee to handle this step of the workflow.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Select Employee *
                          </label>
                          <select
                            value={stepAssignees[currentStep] || ""}
                            onChange={(e) =>
                              setStepAssignees((prev) => ({
                                ...prev,
                                [currentStep]: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Choose an employee</option>
                            {employees.map((emp) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.firstName} {emp.lastName} -{" "}
                                {emp.designation}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Notes
                          </label>
                          <input
                            type="text"
                            value={stepNotes[currentStep] || ""}
                            onChange={(e) =>
                              setStepNotes((prev) => ({
                                ...prev,
                                [currentStep]: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Add notes for this step"
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={() => handleAssignEmployee(currentStep)}
                        className="mt-4 flex items-center gap-2"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader size={16} className="animate-spin" />
                            Assigning...
                          </>
                        ) : (
                          <>
                            <User size={16} />
                            Assign Employee to Step
                          </>
                        )}
                      </Button>

                      {stepAssignees[currentStep] && (
                        <div className="mt-4 p-3 bg-green-900/20 border border-green-800 rounded-lg">
                          <p className="text-sm text-green-300">
                            Assigned to:{" "}
                            {getEmployeeName(stepAssignees[currentStep])}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between gap-4 pt-6 border-t border-slate-700">
              <Button
                type="button"
                onClick={handlePreviousStep}
                disabled={
                  currentStep === 1 || (orderSubmitted && currentStep === 6)
                }
                className="flex items-center gap-2"
                variant="secondary"
              >
                <ChevronLeft size={18} />
                Previous
              </Button>

              {!orderSubmitted ? (
                currentStep === 5 ? (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Creating Order...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Create & Continue to Workflow
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight size={18} />
                  </Button>
                )
              ) : currentStep === 8 ? (
                <Button
                  type="button"
                  onClick={() => onSubmit?.({ id: createdOrderId })}
                  variant="success"
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  Complete Workflow
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={currentStep === WIZARD_STEPS.length}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight size={18} />
                </Button>
              )}

              {!orderSubmitted && currentStep === 1 && (
                <Button
                  type="button"
                  onClick={onCancel}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <X size={16} />
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Modal
        isOpen={specModalOpen}
        onClose={closeSpecModal}
        title={`Edit ${
          specModalType === "steelSection"
            ? "Steel Section"
            : specModalType === "plateType"
            ? "Plate"
            : specModalType === "materialGrade"
            ? "Material Grade"
            : specModalType === "fastenerType"
            ? "Fastener"
            : specModalType === "machinedParts"
            ? "Machined Parts"
            : specModalType === "rollerMovementComponents"
            ? "Roller Movement"
            : specModalType === "liftingPullingMechanisms"
            ? "Lifting/Pulling"
            : specModalType === "electricalAutomation"
            ? "Electrical/Automation"
            : specModalType === "safetyMaterials"
            ? "Safety Materials"
            : specModalType === "surfacePrepPainting"
            ? "Surface Prep/Painting"
            : specModalType === "fabricationConsumables"
            ? "Fabrication Consumables"
            : specModalType === "hardwareMisc"
            ? "Hardware/Misc"
            : specModalType === "documentationMaterials"
            ? "Documentation"
            : "Specifications"
        } Specifications`}
        size="lg"
      >
        <div className="bg-slate-900 p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {specModalType === "steelSection" && (
            <>
              <Input
                label="Size / Dimension"
                value={currentMaterial.steelSize || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    steelSize: e.target.value,
                  }))
                }
                placeholder="e.g., 100x100"
              />
              <Input
                label="Length (mm)"
                type="number"
                value={currentMaterial.steelLength || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    steelLength: e.target.value,
                  }))
                }
                placeholder="e.g., 6000"
              />
              <Input
                label="Tolerance"
                value={currentMaterial.steelTolerance || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    steelTolerance: e.target.value,
                  }))
                }
                placeholder="e.g., ±10mm"
              />
              <Input
                label="Quantity"
                type="number"
                value={currentMaterial.steelQuantity || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    steelQuantity: e.target.value,
                  }))
                }
                placeholder="e.g., 10"
              />
              <Input
                label="Quality / Grade"
                value={currentMaterial.steelQuality || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    steelQuality: e.target.value,
                  }))
                }
                placeholder="e.g., A Grade, Premium"
              />
            </>
          )}

          {specModalType === "plateType" && (
            <>
              <Input
                label="Thickness (mm)"
                type="number"
                value={currentMaterial.plateThickness || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    plateThickness: e.target.value,
                  }))
                }
                placeholder="e.g., 10"
              />
              <Input
                label="Length (mm)"
                type="number"
                value={currentMaterial.plateLength || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    plateLength: e.target.value,
                  }))
                }
                placeholder="e.g., 2500"
              />
              <Input
                label="Width (mm)"
                type="number"
                value={currentMaterial.plateWidth || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    plateWidth: e.target.value,
                  }))
                }
                placeholder="e.g., 1250"
              />
              <Input
                label="Surface Finish"
                value={currentMaterial.plateSurfaceFinish || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    plateSurfaceFinish: e.target.value,
                  }))
                }
                placeholder="e.g., Hot Rolled"
              />
              <Input
                label="Quantity"
                type="number"
                value={currentMaterial.plateQuantity || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    plateQuantity: e.target.value,
                  }))
                }
                placeholder="e.g., 5"
              />
              <Input
                label="Quality / Grade"
                value={currentMaterial.plateQuality || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    plateQuality: e.target.value,
                  }))
                }
                placeholder="e.g., A Grade, Premium"
              />
            </>
          )}

          {specModalType === "materialGrade" && (
            <>
              <Input
                label="Grade"
                value={currentMaterial.grade || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    grade: e.target.value,
                  }))
                }
                placeholder="e.g., IS2062, IS1570"
              />
              <Input
                label="Certification Required"
                value={currentMaterial.gradeCertificationRequired || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    gradeCertificationRequired: e.target.value,
                  }))
                }
                placeholder="e.g., Yes, ISO 9001"
              />
              <Input
                label="Testing Standards"
                value={currentMaterial.gradeTestingStandards || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    gradeTestingStandards: e.target.value,
                  }))
                }
                placeholder="e.g., IS 1608, ISO 6892"
              />
              <Input
                label="Special Requirements"
                value={currentMaterial.gradeSpecialRequirements || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    gradeSpecialRequirements: e.target.value,
                  }))
                }
                placeholder="e.g., Impact test required"
              />
              <Input
                label="Quantity"
                type="number"
                value={currentMaterial.gradeQuantity || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    gradeQuantity: e.target.value,
                  }))
                }
                placeholder="e.g., 100"
              />
              <Input
                label="Quality / Grade"
                value={currentMaterial.gradeQuality || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    gradeQuality: e.target.value,
                  }))
                }
                placeholder="e.g., Premium, Standard"
              />
            </>
          )}

          {specModalType === "fastenerType" && (
            <>
              <Input
                label="Size"
                value={currentMaterial.fastenerSize || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    fastenerSize: e.target.value,
                  }))
                }
                placeholder="e.g., M8, M10"
              />
              <Input
                label="Quantity Per Unit"
                value={currentMaterial.fastenerQuantityPerUnit || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    fastenerQuantityPerUnit: e.target.value,
                  }))
                }
                placeholder="e.g., 100"
              />
              <Input
                label="Plating"
                value={currentMaterial.fastenerPlating || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    fastenerPlating: e.target.value,
                  }))
                }
                placeholder="e.g., Zinc Plated, Stainless"
              />
              <Input
                label="Quantity"
                type="number"
                value={currentMaterial.fastenerQuantity || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    fastenerQuantity: e.target.value,
                  }))
                }
                placeholder="e.g., 500"
              />
              <Input
                label="Quality / Grade"
                value={currentMaterial.fastenerQuality || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    fastenerQuality: e.target.value,
                  }))
                }
                placeholder="e.g., Grade 8.8, Grade 10.9"
              />
            </>
          )}

          {specModalType === "machinedParts" && (
            <>
              {MACHINED_PARTS_SPECS[currentMaterial.machinedParts]?.map(
                (field) => (
                  <Input
                    key={field.name}
                    label={field.label}
                    value={currentMaterial.machinedPartsSpecs[field.name] || ""}
                    onChange={(e) =>
                      setCurrentMaterial((prev) => ({
                        ...prev,
                        machinedPartsSpecs: {
                          ...prev.machinedPartsSpecs,
                          [field.name]: e.target.value,
                        },
                      }))
                    }
                    placeholder={field.placeholder}
                  />
                )
              )}
              <Input
                label="Quantity"
                type="number"
                value={currentMaterial.machinedPartsQuantity || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    machinedPartsQuantity: e.target.value,
                  }))
                }
                placeholder="e.g., 25"
              />
              <Input
                label="Quality / Grade"
                value={currentMaterial.machinedPartsQuality || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    machinedPartsQuality: e.target.value,
                  }))
                }
                placeholder="e.g., Premium, Standard"
              />
            </>
          )}

          {specModalType === "rollerMovementComponents" && (
            <>
              {ROLLER_MOVEMENT_COMPONENTS_SPECS[
                currentMaterial.rollerMovementComponents
              ]?.map((field) => (
                <Input
                  key={field.name}
                  label={field.label}
                  value={
                    currentMaterial.rollerMovementComponentsSpecs[field.name] ||
                    ""
                  }
                  onChange={(e) =>
                    setCurrentMaterial((prev) => ({
                      ...prev,
                      rollerMovementComponentsSpecs: {
                        ...prev.rollerMovementComponentsSpecs,
                        [field.name]: e.target.value,
                      },
                    }))
                  }
                  placeholder={field.placeholder}
                />
              ))}
              <Input
                label="Quantity"
                type="number"
                value={currentMaterial.rollerMovementQuantity || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    rollerMovementQuantity: e.target.value,
                  }))
                }
                placeholder="e.g., 8"
              />
              <Input
                label="Quality / Grade"
                value={currentMaterial.rollerMovementQuality || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    rollerMovementQuality: e.target.value,
                  }))
                }
                placeholder="e.g., Industrial, Precision"
              />
            </>
          )}

          {specModalType === "liftingPullingMechanisms" && (
            <>
              {LIFTING_PULLING_MECHANISMS_SPECS[
                currentMaterial.liftingPullingMechanisms
              ]?.map((field) => (
                <Input
                  key={field.name}
                  label={field.label}
                  value={
                    currentMaterial.liftingPullingMechanismsSpecs[field.name] ||
                    ""
                  }
                  onChange={(e) =>
                    setCurrentMaterial((prev) => ({
                      ...prev,
                      liftingPullingMechanismsSpecs: {
                        ...prev.liftingPullingMechanismsSpecs,
                        [field.name]: e.target.value,
                      },
                    }))
                  }
                  placeholder={field.placeholder}
                />
              ))}
              <Input
                label="Quantity"
                type="number"
                value={currentMaterial.liftingPullingQuantity || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    liftingPullingQuantity: e.target.value,
                  }))
                }
                placeholder="e.g., 2"
              />
              <Input
                label="Quality / Grade"
                value={currentMaterial.liftingPullingQuality || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    liftingPullingQuality: e.target.value,
                  }))
                }
                placeholder="e.g., Industrial, Heavy Duty"
              />
            </>
          )}

          {specModalType === "electricalAutomation" && (
            <>
              {ELECTRICAL_AUTOMATION_SPECS[
                currentMaterial.electricalAutomation
              ]?.map((field) => (
                <Input
                  key={field.name}
                  label={field.label}
                  value={
                    currentMaterial.electricalAutomationSpecs[field.name] || ""
                  }
                  onChange={(e) =>
                    setCurrentMaterial((prev) => ({
                      ...prev,
                      electricalAutomationSpecs: {
                        ...prev.electricalAutomationSpecs,
                        [field.name]: e.target.value,
                      },
                    }))
                  }
                  placeholder={field.placeholder}
                />
              ))}
              <Input
                label="Quantity"
                type="number"
                value={currentMaterial.electricalAutomationQuantity || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    electricalAutomationQuantity: e.target.value,
                  }))
                }
                placeholder="e.g., 15"
              />
              <Input
                label="Quality / Grade"
                value={currentMaterial.electricalAutomationQuality || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    electricalAutomationQuality: e.target.value,
                  }))
                }
                placeholder="e.g., Industrial, IEC Standard"
              />
            </>
          )}

          {specModalType === "safetyMaterials" && (
            <>
              {SAFETY_MATERIALS_SPECS[currentMaterial.safetyMaterials]?.map(
                (field) => (
                  <Input
                    key={field.name}
                    label={field.label}
                    value={
                      currentMaterial.safetyMaterialsSpecs[field.name] || ""
                    }
                    onChange={(e) =>
                      setCurrentMaterial((prev) => ({
                        ...prev,
                        safetyMaterialsSpecs: {
                          ...prev.safetyMaterialsSpecs,
                          [field.name]: e.target.value,
                        },
                      }))
                    }
                    placeholder={field.placeholder}
                  />
                )
              )}
              <Input
                label="Quantity"
                type="number"
                value={currentMaterial.safetyMaterialsQuantity || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    safetyMaterialsQuantity: e.target.value,
                  }))
                }
                placeholder="e.g., 20"
              />
              <Input
                label="Quality / Grade"
                value={currentMaterial.safetyMaterialsQuality || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    safetyMaterialsQuality: e.target.value,
                  }))
                }
                placeholder="e.g., ISO Certified, Premium"
              />
            </>
          )}

          {specModalType === "surfacePrepPainting" && (
            <>
              {SURFACE_PREP_PAINTING_SPECS[
                currentMaterial.surfacePrepPainting
              ]?.map((field) => (
                <Input
                  key={field.name}
                  label={field.label}
                  value={
                    currentMaterial.surfacePrepPaintingSpecs[field.name] || ""
                  }
                  onChange={(e) =>
                    setCurrentMaterial((prev) => ({
                      ...prev,
                      surfacePrepPaintingSpecs: {
                        ...prev.surfacePrepPaintingSpecs,
                        [field.name]: e.target.value,
                      },
                    }))
                  }
                  placeholder={field.placeholder}
                />
              ))}
              <Input
                label="Quantity"
                type="number"
                value={currentMaterial.surfacePrepPaintingQuantity || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    surfacePrepPaintingQuantity: e.target.value,
                  }))
                }
                placeholder="e.g., 50"
              />
              <Input
                label="Quality / Grade"
                value={currentMaterial.surfacePrepPaintingQuality || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    surfacePrepPaintingQuality: e.target.value,
                  }))
                }
                placeholder="e.g., Premium, Industrial Grade"
              />
            </>
          )}

          {specModalType === "fabricationConsumables" && (
            <>
              {FABRICATION_CONSUMABLES_SPECS[
                currentMaterial.fabricationConsumables
              ]?.map((field) => (
                <Input
                  key={field.name}
                  label={field.label}
                  value={
                    currentMaterial.fabricationConsumablesSpecs[field.name] ||
                    ""
                  }
                  onChange={(e) =>
                    setCurrentMaterial((prev) => ({
                      ...prev,
                      fabricationConsumablesSpecs: {
                        ...prev.fabricationConsumablesSpecs,
                        [field.name]: e.target.value,
                      },
                    }))
                  }
                  placeholder={field.placeholder}
                />
              ))}
              <Input
                label="Quantity"
                type="number"
                value={currentMaterial.fabricationConsumablesQuantity || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    fabricationConsumablesQuantity: e.target.value,
                  }))
                }
                placeholder="e.g., 100"
              />
              <Input
                label="Quality / Grade"
                value={currentMaterial.fabricationConsumablesQuality || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    fabricationConsumablesQuality: e.target.value,
                  }))
                }
                placeholder="e.g., Industrial, Premium Grade"
              />
            </>
          )}

          {specModalType === "hardwareMisc" && (
            <>
              {HARDWARE_MISC_SPECS[currentMaterial.hardwareMisc]?.map(
                (field) => (
                  <Input
                    key={field.name}
                    label={field.label}
                    value={currentMaterial.hardwareMiscSpecs[field.name] || ""}
                    onChange={(e) =>
                      setCurrentMaterial((prev) => ({
                        ...prev,
                        hardwareMiscSpecs: {
                          ...prev.hardwareMiscSpecs,
                          [field.name]: e.target.value,
                        },
                      }))
                    }
                    placeholder={field.placeholder}
                  />
                )
              )}
              <Input
                label="Quantity"
                type="number"
                value={currentMaterial.hardwareMiscQuantity || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    hardwareMiscQuantity: e.target.value,
                  }))
                }
                placeholder="e.g., 30"
              />
              <Input
                label="Quality / Grade"
                value={currentMaterial.hardwareMiscQuality || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    hardwareMiscQuality: e.target.value,
                  }))
                }
                placeholder="e.g., Standard, Premium"
              />
            </>
          )}

          {specModalType === "documentationMaterials" && (
            <>
              {DOCUMENTATION_MATERIALS_SPECS[
                currentMaterial.documentationMaterials
              ]?.map((field) => (
                <Input
                  key={field.name}
                  label={field.label}
                  value={
                    currentMaterial.documentationMaterialsSpecs[field.name] ||
                    ""
                  }
                  onChange={(e) =>
                    setCurrentMaterial((prev) => ({
                      ...prev,
                      documentationMaterialsSpecs: {
                        ...prev.documentationMaterialsSpecs,
                        [field.name]: e.target.value,
                      },
                    }))
                  }
                  placeholder={field.placeholder}
                />
              ))}
              <Input
                label="Quantity"
                type="number"
                value={currentMaterial.documentationMaterialsQuantity || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    documentationMaterialsQuantity: e.target.value,
                  }))
                }
                placeholder="e.g., 10"
              />
              <Input
                label="Quality / Grade"
                value={currentMaterial.documentationMaterialsQuality || ""}
                onChange={(e) =>
                  setCurrentMaterial((prev) => ({
                    ...prev,
                    documentationMaterialsQuality: e.target.value,
                  }))
                }
                placeholder="e.g., Original, Certified Copy"
              />
              <div className="bg-slate-800 p-3 rounded border border-slate-600 space-y-3 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 text-left">
                    Upload Documents
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                    onChange={handleDocumentationFileUpload}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm cursor-pointer hover:border-blue-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Supported: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT
                  </p>
                </div>
                {currentMaterial.documentationUploadedFiles &&
                  currentMaterial.documentationUploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-300">
                        Uploaded Files (
                        {currentMaterial.documentationUploadedFiles.length}):
                      </p>
                      {currentMaterial.documentationUploadedFiles.map(
                        (file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-slate-700 p-2 rounded border border-slate-600"
                          >
                            <div className="flex-1 truncate">
                              <p className="text-xs text-slate-300 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {file.size} KB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDocumentationFile(index)}
                              className="ml-2 text-red-400 hover:text-red-300 flex-shrink-0"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>
            </>
          )}

          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-700">
            <Button
              type="button"
              onClick={() => {
                handleDetailSubmit(
                  specModalType,
                  specModalType === "steelSection"
                    ? {
                        steelSize: currentMaterial.steelSize,
                        steelLength: currentMaterial.steelLength,
                        steelTolerance: currentMaterial.steelTolerance,
                        steelQuantity: currentMaterial.steelQuantity,
                        steelQuality: currentMaterial.steelQuality,
                      }
                    : specModalType === "plateType"
                    ? {
                        plateThickness: currentMaterial.plateThickness,
                        plateLength: currentMaterial.plateLength,
                        plateWidth: currentMaterial.plateWidth,
                        plateSurfaceFinish: currentMaterial.plateSurfaceFinish,
                        plateQuantity: currentMaterial.plateQuantity,
                        plateQuality: currentMaterial.plateQuality,
                      }
                    : specModalType === "materialGrade"
                    ? {
                        grade: currentMaterial.grade,
                        gradeCertificationRequired:
                          currentMaterial.gradeCertificationRequired,
                        gradeTestingStandards:
                          currentMaterial.gradeTestingStandards,
                        gradeSpecialRequirements:
                          currentMaterial.gradeSpecialRequirements,
                        gradeQuantity: currentMaterial.gradeQuantity,
                        gradeQuality: currentMaterial.gradeQuality,
                      }
                    : specModalType === "fastenerType"
                    ? {
                        fastenerSize: currentMaterial.fastenerSize,
                        fastenerQuantityPerUnit:
                          currentMaterial.fastenerQuantityPerUnit,
                        fastenerPlating: currentMaterial.fastenerPlating,
                        fastenerQuantity: currentMaterial.fastenerQuantity,
                        fastenerQuality: currentMaterial.fastenerQuality,
                      }
                    : specModalType === "machinedParts"
                    ? {
                        ...currentMaterial.machinedPartsSpecs,
                        machinedPartsQuantity:
                          currentMaterial.machinedPartsQuantity,
                        machinedPartsQuality:
                          currentMaterial.machinedPartsQuality,
                      }
                    : specModalType === "rollerMovementComponents"
                    ? {
                        ...currentMaterial.rollerMovementComponentsSpecs,
                        rollerMovementQuantity:
                          currentMaterial.rollerMovementQuantity,
                        rollerMovementQuality:
                          currentMaterial.rollerMovementQuality,
                      }
                    : specModalType === "liftingPullingMechanisms"
                    ? {
                        ...currentMaterial.liftingPullingMechanismsSpecs,
                        liftingPullingQuantity:
                          currentMaterial.liftingPullingQuantity,
                        liftingPullingQuality:
                          currentMaterial.liftingPullingQuality,
                      }
                    : specModalType === "electricalAutomation"
                    ? {
                        ...currentMaterial.electricalAutomationSpecs,
                        electricalAutomationQuantity:
                          currentMaterial.electricalAutomationQuantity,
                        electricalAutomationQuality:
                          currentMaterial.electricalAutomationQuality,
                      }
                    : specModalType === "safetyMaterials"
                    ? {
                        ...currentMaterial.safetyMaterialsSpecs,
                        safetyMaterialsQuantity:
                          currentMaterial.safetyMaterialsQuantity,
                        safetyMaterialsQuality:
                          currentMaterial.safetyMaterialsQuality,
                      }
                    : specModalType === "surfacePrepPainting"
                    ? {
                        ...currentMaterial.surfacePrepPaintingSpecs,
                        surfacePrepPaintingQuantity:
                          currentMaterial.surfacePrepPaintingQuantity,
                        surfacePrepPaintingQuality:
                          currentMaterial.surfacePrepPaintingQuality,
                      }
                    : specModalType === "fabricationConsumables"
                    ? {
                        ...currentMaterial.fabricationConsumablesSpecs,
                        fabricationConsumablesQuantity:
                          currentMaterial.fabricationConsumablesQuantity,
                        fabricationConsumablesQuality:
                          currentMaterial.fabricationConsumablesQuality,
                      }
                    : specModalType === "hardwareMisc"
                    ? {
                        ...currentMaterial.hardwareMiscSpecs,
                        hardwareMiscQuantity:
                          currentMaterial.hardwareMiscQuantity,
                        hardwareMiscQuality:
                          currentMaterial.hardwareMiscQuality,
                      }
                    : specModalType === "documentationMaterials"
                    ? {
                        ...currentMaterial.documentationMaterialsSpecs,
                        documentationMaterialsQuantity:
                          currentMaterial.documentationMaterialsQuantity,
                        documentationMaterialsQuality:
                          currentMaterial.documentationMaterialsQuality,
                      }
                    : {}
                );
                closeSpecModal();
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save size={16} />
              Save Details
            </Button>
            <Button
              type="button"
              onClick={closeSpecModal}
              variant="secondary"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <X size={16} />
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={productionPhaseModalOpen}
        onClose={closeProductionPhaseModal}
        title={`Details - ${selectedPhaseForModal?.phase} / ${selectedPhaseForModal?.subTask?.label}`}
        size="lg"
      >
        <div className="bg-slate-900 p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Process Type *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="processType"
                  value="inhouse"
                  checked={
                    currentPhaseDetail.processType === "inhouse" ||
                    !currentPhaseDetail.processType
                  }
                  onChange={(e) => handleProductionPhaseDetailChange(e)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-slate-200">In-House</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="processType"
                  value="outsource"
                  checked={currentPhaseDetail.processType === "outsource"}
                  onChange={(e) => handleProductionPhaseDetailChange(e)}
                  className="w-4 h-4 text-orange-600 bg-slate-700 border-slate-600 focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-slate-200">Outsource</span>
              </label>
            </div>
          </div>

          {selectedPhaseForModal &&
            (() => {
              const baseFields =
                PRODUCTION_PHASE_FORMS[selectedPhaseForModal.subTask.value] ||
                [];
              const isOutsource =
                currentPhaseDetail.processType === "outsource";

              const employeeFields = [
                "assemblyDoneBy",
                "doneBy",
                "motorDoneBy",
                "assembledBy",
                "alignedBy",
                "fitUpDoneBy",
                "fabricatedBy",
                "htCompletedBy",
                "operatorName",
                "painterName",
                "welderId",
                "markingDoneBy",
                "installedBy",
                "responsiblePerson",
              ];

              const vendorFields = [
                {
                  name: "vendorName",
                  label: "Vendor Name",
                  type: "text",
                  placeholder: "e.g., XYZ Industries, ABC Manufacturing",
                },
                {
                  name: "vendorContact",
                  label: "Vendor Contact",
                  type: "text",
                  placeholder:
                    "e.g., Phone/Email: 9876543210, vendor@example.com",
                },
                {
                  name: "expectedDeliveryDate",
                  label: "Expected Delivery Date",
                  type: "date",
                  placeholder: "",
                },
              ];

              let fieldsToRender = baseFields;
              if (isOutsource) {
                fieldsToRender = [
                  ...vendorFields,
                  ...baseFields.filter(
                    (field) => !employeeFields.includes(field.name)
                  ),
                ];
              } else {
                fieldsToRender = baseFields.filter(
                  (field) => !employeeFields.includes(field.name)
                );
              }

              return fieldsToRender;
            })().map((field) => {
              if (field.type === "textarea") {
                return (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {field.label}
                    </label>
                    <textarea
                      name={field.name}
                      value={currentPhaseDetail[field.name] || ""}
                      onChange={handleProductionPhaseDetailChange}
                      rows="4"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={field.placeholder}
                    />
                  </div>
                );
              }
              if (field.type === "select") {
                return (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {field.label}
                    </label>
                    <select
                      name={field.name}
                      value={currentPhaseDetail[field.name] || ""}
                      onChange={handleProductionPhaseDetailChange}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }
              if (field.type === "file") {
                return (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {field.label}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        onChange={(e) =>
                          handleProductionPhaseFileChange(e, field.name)
                        }
                        className="hidden"
                        id={`file-${field.name}`}
                      />
                      <label
                        htmlFor={`file-${field.name}`}
                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 cursor-pointer hover:bg-slate-700 text-center text-sm"
                      >
                        {currentPhaseDetail[`${field.name}Name`] ||
                          "Choose File"}
                      </label>
                    </div>
                  </div>
                );
              }
              return (
                <Input
                  key={field.name}
                  label={field.label}
                  type={field.type}
                  name={field.name}
                  value={currentPhaseDetail[field.name] || ""}
                  onChange={handleProductionPhaseDetailChange}
                  placeholder={field.placeholder}
                />
              );
            })}

          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <Button
              type="button"
              onClick={saveProductionPhaseDetail}
              className="flex items-center gap-2 flex-1"
            >
              <Save size={16} />
              Save Details
            </Button>
            <Button
              type="button"
              onClick={closeProductionPhaseModal}
              className="flex-1 flex items-center justify-center gap-2"
              variant="secondary"
            >
              <X size={16} />
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SalesOrderForm;
