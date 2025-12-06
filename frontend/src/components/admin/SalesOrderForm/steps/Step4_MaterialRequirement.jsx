import React, { useState } from "react";
import { Package, Plus, Trash2, Edit2, X, FileText, Save } from "lucide-react";
import Input from "../../../ui/Input";
import FormSection from "../shared/FormSection";
import FormRow from "../shared/FormRow";
import Modal from "../../../ui/Modal";
import Button from "../../../ui/Button";
import { useFormData, useSalesOrderContext } from "../hooks";
import {
  MACHINED_PARTS_SPECS,
  ROLLER_MOVEMENT_COMPONENTS_SPECS,
  LIFTING_PULLING_MECHANISMS_SPECS,
  ELECTRICAL_AUTOMATION_SPECS,
  SAFETY_MATERIALS_SPECS,
  SURFACE_PREP_PAINTING_SPECS,
  FABRICATION_CONSUMABLES_SPECS,
  HARDWARE_MISC_SPECS,
  DOCUMENTATION_MATERIALS_SPECS,
  STEEL_SECTIONS_SPECS,
  PLATE_TYPES_SPECS,
  MATERIAL_GRADES_SPECS,
  FASTENER_TYPES_SPECS,
} from "../constants";

const materialUnits = [
  { key: "kg", value: "kg", label: "Kilogram (kg)" },
  { key: "ton", value: "ton", label: "Ton" },
  { key: "m", value: "m", label: "Meter (m)" },
  { key: "mm", value: "mm", label: "Millimeter (mm)" },
  { key: "piece", value: "piece", label: "Piece" },
  { key: "set", value: "set", label: "Set" },
];

const materialSources = [
  { key: "local", value: "local", label: "Local" },
  { key: "imported", value: "imported", label: "Imported" },
  { key: "vendor", value: "vendor", label: "Vendor" },
];

export default function Step4_MaterialRequirement() {
  const { formData, updateField } = useFormData();
  const {
    state,
    toggleMaterialType,
    updateMaterialDetail,
    deleteMaterialDetail,
  } = useSalesOrderContext();

  const [currentMaterial, setCurrentMaterial] = useState({
    quantity: "",
    unit: "",
    source: "",
    assignee: "",
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
  });

  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [specModalType, setSpecModalType] = useState(null);
  const [editingDetail, setEditingDetail] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingMaterial, setViewingMaterial] = useState(null);

  const enabledMaterials = state.enabledMaterials;
  const materialDetailsTable = state.materialDetailsTable;

  const toggleEnabledMaterial = (materialType) => {
    toggleMaterialType(materialType);
  };

  const handleMaterialChange = (e) => {
    const { name, value } = e.target;
    setCurrentMaterial((prev) => ({ ...prev, [name]: value }));

    const specTypes = [
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
    updateField("materials", [
      ...formData.materials,
      { ...currentMaterial, id: Date.now() },
    ]);
    resetMaterial();
  };

  const removeMaterial = (id) => {
    updateField(
      "materials",
      formData.materials.filter((m) => m.id !== id)
    );
  };

  const editMaterial = (material) => {
    setCurrentMaterial(material);
    setEditingDetail(material.id);
  };

  const updateMaterial = () => {
    updateField(
      "materials",
      formData.materials.map((m) =>
        m.id === editingDetail ? currentMaterial : m
      )
    );
    resetMaterial();
    setEditingDetail(null);
  };

  const resetMaterial = () => {
    setCurrentMaterial({
      quantity: "",
      unit: "",
      source: "",
      assignee: "",
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
    });
    setEditingDetail(null);
  };

  const openSpecModal = (type) => {
    setSpecModalType(type);
    setSpecModalOpen(true);
  };

  const closeSpecModal = () => {
    setSpecModalOpen(false);
    setSpecModalType(null);
  };

  const getSpecsForType = (type) => {
    const specsMap = {
      machinedParts: MACHINED_PARTS_SPECS,
      rollerMovementComponents: ROLLER_MOVEMENT_COMPONENTS_SPECS,
      liftingPullingMechanisms: LIFTING_PULLING_MECHANISMS_SPECS,
      electricalAutomation: ELECTRICAL_AUTOMATION_SPECS,
      safetyMaterials: SAFETY_MATERIALS_SPECS,
      surfacePrepPainting: SURFACE_PREP_PAINTING_SPECS,
      fabricationConsumables: FABRICATION_CONSUMABLES_SPECS,
      hardwareMisc: HARDWARE_MISC_SPECS,
      documentationMaterials: DOCUMENTATION_MATERIALS_SPECS,
    };
    return specsMap[type] || {};
  };

  const handleDetailSubmit = (type, specs) => {
    const complexSpecTypes = [
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

    if (complexSpecTypes.includes(type)) {
      const { quantity, quality, ...specData } = specs;
      const specsKey = `${type}Specs`;
      const quantityKey = `${type}Quantity`;
      const qualityKey = `${type}Quality`;

      setCurrentMaterial((prev) => ({
        ...prev,
        [specsKey]: specData,
        [quantityKey]: quantity,
        [qualityKey]: quality,
      }));
    } else {
      setCurrentMaterial((prev) => ({ ...prev, ...specs }));
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="form-section">
          <div className="form-section-header">
            <Package className="form-section-header icon" />
            <h4>Material Requirement & Components</h4>
          </div>
          <div className="space-y-4">
            <div className="form-subsection-header">
              <h5>Material Selection</h5>
            </div>

            <div className="info-banner">
              <FileText className="info-banner-icon" />
              <p>
                Select the material types required for this project. Only
                checked materials will appear in the form.
              </p>
            </div>

            <div className="material-checkbox-grid">
              <label className="material-checkbox-item">
                <input
                  type="checkbox"
                  checked={enabledMaterials.steelSection}
                  onChange={() => toggleEnabledMaterial("steelSection")}
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
                  onChange={() => toggleEnabledMaterial("materialGrade")}
                />
                <span>Material Grades</span>
              </label>
              <label className="material-checkbox-item">
                <input
                  type="checkbox"
                  checked={enabledMaterials.fastenerType}
                  onChange={() => toggleEnabledMaterial("fastenerType")}
                />
                <span>Fasteners</span>
              </label>
              <label className="material-checkbox-item">
                <input
                  type="checkbox"
                  checked={enabledMaterials.machinedParts}
                  onChange={() => toggleEnabledMaterial("machinedParts")}
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
                  onChange={() => toggleEnabledMaterial("electricalAutomation")}
                />
                <span>Electrical/Automation</span>
              </label>
              <label className="material-checkbox-item">
                <input
                  type="checkbox"
                  checked={enabledMaterials.safetyMaterials}
                  onChange={() => toggleEnabledMaterial("safetyMaterials")}
                />
                <span>Safety Materials</span>
              </label>
              <label className="material-checkbox-item">
                <input
                  type="checkbox"
                  checked={enabledMaterials.surfacePrepPainting}
                  onChange={() => toggleEnabledMaterial("surfacePrepPainting")}
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
                  onChange={() => toggleEnabledMaterial("hardwareMisc")}
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
                      onChange={(e) => {
                        handleMaterialChange(e);
                        if (e.target.value) {
                          setTimeout(() => openSpecModal("steelSection"), 0);
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Steel Section (Optional)</option>
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
                      onChange={(e) => {
                        handleMaterialChange(e);
                        if (e.target.value) {
                          setTimeout(() => openSpecModal("plateType"), 0);
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Plate Type (Optional)</option>
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
                      onChange={(e) => {
                        handleMaterialChange(e);
                        if (e.target.value) {
                          setTimeout(() => openSpecModal("materialGrade"), 0);
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Material Grade (Optional)</option>
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
                      onChange={(e) => {
                        handleMaterialChange(e);
                        if (e.target.value) {
                          setTimeout(() => openSpecModal("fastenerType"), 0);
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Fastener Type (Optional)</option>
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
                      onChange={(e) => {
                        handleMaterialChange(e);
                        if (e.target.value) {
                          setTimeout(() => openSpecModal("machinedParts"), 0);
                        }
                      }}
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
                      <option value="Bearing housings">Bearing housings</option>
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
                      onChange={(e) => {
                        handleMaterialChange(e);
                        if (e.target.value) {
                          setTimeout(
                            () => openSpecModal("rollerMovementComponents"),
                            0
                          );
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Component Type (Optional)</option>
                      <option value="Rollers (Nylon/PU/Steel)">
                        Rollers (Nylon/PU/Steel)
                      </option>
                      <option value="Bearings (ball, tapered, spherical)">
                        Bearings (ball, tapered, spherical)
                      </option>
                      <option value="Linear guide rails">
                        Linear guide rails
                      </option>
                      <option value="Guide wheels">Guide wheels</option>
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
                      onChange={(e) => {
                        handleMaterialChange(e);
                        if (e.target.value) {
                          setTimeout(
                            () => openSpecModal("liftingPullingMechanisms"),
                            0
                          );
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Mechanism Type (Optional)</option>
                      <option value="Winch System">Winch System</option>
                      <option value="Hydraulic System">Hydraulic System</option>
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
                      onChange={(e) => {
                        handleMaterialChange(e);
                        if (e.target.value) {
                          setTimeout(
                            () => openSpecModal("electricalAutomation"),
                            0
                          );
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Type (Optional)</option>
                      <option value="Panel Components">Panel Components</option>
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
                      onChange={(e) => {
                        handleMaterialChange(e);
                        if (e.target.value) {
                          setTimeout(() => openSpecModal("safetyMaterials"), 0);
                        }
                      }}
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
                      onChange={(e) => {
                        handleMaterialChange(e);
                        if (e.target.value) {
                          setTimeout(
                            () => openSpecModal("surfacePrepPainting"),
                            0
                          );
                        }
                      }}
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
                      onChange={(e) => {
                        handleMaterialChange(e);
                        if (e.target.value) {
                          setTimeout(
                            () => openSpecModal("fabricationConsumables"),
                            0
                          );
                        }
                      }}
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
                      onChange={(e) => {
                        handleMaterialChange(e);
                        if (e.target.value) {
                          setTimeout(() => openSpecModal("hardwareMisc"), 0);
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Type (Optional)</option>
                      <option value="Hardware Items">Hardware Items</option>
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
                      onChange={(e) => {
                        handleMaterialChange(e);
                        if (e.target.value) {
                          setTimeout(
                            () => openSpecModal("documentationMaterials"),
                            0
                          );
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Type (Optional)</option>
                      <option value="Labeling & Tags">Labeling & Tags</option>
                      <option value="Certificates & Documentation">
                        Certificates & Documentation
                      </option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {formData.materials.length > 0 && (
          <div className="mt-8">
            <h5 className="text-lg font-semibold text-slate-200 mb-4">
              Material Requirements Table
            </h5>
            <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600 bg-slate-900">
                    <th className="p-2 text-left text-left text-slate-300 font-medium">
                      Material Name
                    </th>

                    <th className="p-2 text-left text-left text-slate-300 font-medium">
                      Type
                    </th>
                    <th className="p-2 text-left text-slate-300 font-medium">
                      Qty
                    </th>
                    <th className="p-2 text-left text-left text-slate-300 font-medium">
                      Unit
                    </th>
                    <th className="p-2 text-left text-left text-slate-300 font-medium">
                      Source
                    </th>
                    <th className="p-2 text-left text-left text-slate-300 font-medium">
                      Assignee
                    </th>
                    <th className="p-2 text-left text-slate-300 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formData.materials.map((material) => {
                    const assigneeName = material.assignee
                      ? state.employees?.find(
                          (e) => (e._id || e.id) === material.assignee
                        )?.name ||
                        state.employees?.find(
                          (e) => (e._id || e.id) === material.assignee
                        )?.employeeName ||
                        "Unknown"
                      : "-";
                    const materialType =
                      material.steelSection ||
                      material.plateType ||
                      material.materialGrade ||
                      material.fastenerType ||
                      material.machinedParts ||
                      material.rollerMovementComponents ||
                      material.liftingPullingMechanisms ||
                      material.electricalAutomation ||
                      material.safetyMaterials ||
                      material.surfacePrepPainting ||
                      material.fabricationConsumables ||
                      material.hardwareMisc ||
                      material.documentationMaterials ||
                      "-";

                    return (
                      <tr
                        key={material.id}
                        className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="p-2 text-left text-slate-100 font-medium">
                          {materialType}
                        </td>
                        <td className="p-2 text-left">
                          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                            {(() => {
                              if (material.steelSection)
                                return "Steel Sections";
                              if (material.plateType) return "Plates";
                              if (material.materialGrade)
                                return "Material Grades";
                              if (material.fastenerType) return "Fasteners";
                              if (material.machinedParts)
                                return "Machined Parts";
                              if (material.rollerMovementComponents)
                                return "Roller/Movement";
                              if (material.liftingPullingMechanisms)
                                return "Lifting/Pulling";
                              if (material.electricalAutomation)
                                return "Electrical/Automation";
                              if (material.safetyMaterials)
                                return "Safety Materials";
                              if (material.surfacePrepPainting)
                                return "Surface Prep/Paint";
                              if (material.fabricationConsumables)
                                return "Fabrication Consumables";
                              if (material.hardwareMisc) return "Hardware/Misc";
                              if (material.documentationMaterials)
                                return "Documentation";
                              return "-";
                            })()}
                          </span>
                        </td>
                        <td className="p-2 text-left text-slate-100 font-medium">
                          {material.quantity}
                        </td>
                        <td className="p-2 text-left text-slate-300">
                          {material.unit || "-"}
                        </td>
                        <td className="p-2 text-left text-slate-300">
                          {material.source ? (
                            <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded capitalize">
                              {material.source}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-2 text-left text-slate-300">
                          <select
                            value={material.assignee || ""}
                            onChange={(e) => {
                              updateField(
                                "materials",
                                formData.materials.map((m) =>
                                  m.id === material.id
                                    ? { ...m, assignee: e.target.value }
                                    : m
                                )
                              );
                            }}
                            className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Assignee</option>
                            {state.employees &&
                              state.employees.map((emp) => (
                                <option
                                  key={emp._id || emp.id}
                                  value={emp._id || emp.id}
                                >
                                  {emp.name || emp.employeeName}
                                </option>
                              ))}
                          </select>
                        </td>
                        <td className="p-2 text-left">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setViewingMaterial(material);
                                setViewModalOpen(true);
                              }}
                              className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors"
                              title="View Details"
                            >
                              <FileText size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => editMaterial(material)}
                              className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeMaterial(material.id)}
                              className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(materialDetailsTable.steelSection.length > 0 ||
          materialDetailsTable.plateType.length > 0 ||
          materialDetailsTable.materialGrade.length > 0 ||
          materialDetailsTable.fastenerType.length > 0 ||
          materialDetailsTable.machinedParts.length > 0 ||
          materialDetailsTable.rollerMovementComponents.length > 0 ||
          materialDetailsTable.liftingPullingMechanisms.length > 0 ||
          materialDetailsTable.electricalAutomation.length > 0 ||
          materialDetailsTable.safetyMaterials.length > 0 ||
          materialDetailsTable.surfacePrepPainting.length > 0 ||
          materialDetailsTable.fabricationConsumables.length > 0 ||
          materialDetailsTable.hardwareMisc.length > 0 ||
          materialDetailsTable.documentationMaterials.length > 0) && (
          <div className="mt-8">
            <h5 className="text-sm font-semibold text-slate-200 mb-4">
              Material Specifications Summary
            </h5>
            <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-700 border-b border-slate-600">
                    <th className="p-2 text-left text-left text-slate-300">
                      Type
                    </th>
                    <th className="p-2 text-left text-left text-slate-300">
                      Selection
                    </th>
                    <th className="p-2 text-left text-left text-slate-300">
                      Details
                    </th>
                    <th className="p-2 text-left text-left text-slate-300">
                      Quantity
                    </th>
                    <th className="p-2 text-left text-left text-slate-300">
                      Quality
                    </th>
                    <th className="p-2 text-left text-slate-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {materialDetailsTable.steelSection.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-700 hover:bg-slate-700/50"
                    >
                      <td className="p-2 text-left text-slate-300 font-medium">
                        Steel Section
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.selection}
                      </td>
                      <td className="p-2 text-left text-slate-400">
                        {row.steelSize && `Size: ${row.steelSize}`}
                        {row.steelLength && ` | Length: ${row.steelLength}mm`}
                        {row.steelTolerance && ` | Tol: ${row.steelTolerance}`}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.steelSectionQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.steelSectionQuality || "-"}
                      </td>
                      <td className="p-2 text-left">
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
                                steelSectionQuantity: row.steelSectionQuantity,
                                steelSectionQuality: row.steelSectionQuality,
                              }));
                              openSpecModal("steelSection");
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              removeDetailRow("steelSection", row.id)
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
                      <td className="p-2 text-left text-slate-300 font-medium">
                        Plate
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.selection}
                      </td>
                      <td className="p-2 text-left text-slate-400">
                        {row.plateThickness && `Thick: ${row.plateThickness}mm`}
                        {row.plateLength && ` | Length: ${row.plateLength}mm`}
                        {row.plateWidth && ` | Width: ${row.plateWidth}mm`}
                        {row.plateSurfaceFinish &&
                          ` | Finish: ${row.plateSurfaceFinish}`}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.plateTypeQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.plateTypeQuality || "-"}
                      </td>
                      <td className="p-2 text-left">
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
                                plateSurfaceFinish: row.plateSurfaceFinish,
                                plateTypeQuantity: row.plateTypeQuantity,
                                plateTypeQuality: row.plateTypeQuality,
                              }));
                              openSpecModal("plateType");
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeDetailRow("plateType", row.id)}
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
                      <td className="p-2 text-left text-slate-300 font-medium">
                        Material Grade
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.selection}
                      </td>
                      <td className="p-2 text-left text-slate-400">
                        {row.gradeCertificationRequired &&
                          `Cert: ${row.gradeCertificationRequired}`}
                        {row.gradeTestingStandards &&
                          ` | Testing: ${row.gradeTestingStandards}`}
                        {row.gradeSpecialRequirements &&
                          ` | Special: ${row.gradeSpecialRequirements}`}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.materialGradeQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.materialGradeQuality || "-"}
                      </td>
                      <td className="p-2 text-left">
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
                                materialGradeQuality: row.materialGradeQuality,
                              }));
                              openSpecModal("materialGrade");
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              removeDetailRow("materialGrade", row.id)
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
                      <td className="p-2 text-left text-slate-300 font-medium">
                        Fastener
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.selection}
                      </td>
                      <td className="p-2 text-left text-slate-400">
                        {row.fastenerSize && `Size: M${row.fastenerSize}`}
                        {row.fastenerQuantityPerUnit &&
                          ` | Per Unit: ${row.fastenerQuantityPerUnit}pcs`}
                        {row.fastenerPlating &&
                          ` | Plating: ${row.fastenerPlating}`}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.fastenerTypeQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.fastenerTypeQuality || "-"}
                      </td>
                      <td className="p-2 text-left">
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
                                fastenerPlating: row.fastenerPlating,
                                fastenerTypeQuantity: row.fastenerTypeQuantity,
                                fastenerTypeQuality: row.fastenerTypeQuality,
                              }));
                              openSpecModal("fastenerType");
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              removeDetailRow("fastenerType", row.id)
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
                      <td className="p-2 text-left text-slate-300 font-medium">
                        Machined Part
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.selection}
                      </td>
                      <td className="p-2 text-left text-slate-400">
                        {Object.entries(row)
                          .filter(
                            ([key]) =>
                              key !== "id" &&
                              key !== "selection" &&
                              key !== "machinedPartsQuantity" &&
                              key !== "machinedPartsQuality"
                          )
                          .map(([key, value]) => value && `${key}: ${value}`)
                          .filter(Boolean)
                          .join(" | ")}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.machinedPartsQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.machinedPartsQuality || "-"}
                      </td>
                      <td className="p-2 text-left">
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
                                machinedPartsSpecs: Object.entries(row)
                                  .filter(
                                    ([key]) =>
                                      key !== "id" &&
                                      key !== "selection" &&
                                      key !== "machinedPartsQuantity" &&
                                      key !== "machinedPartsQuality"
                                  )
                                  .reduce((acc, [key, value]) => {
                                    acc[key] = value;
                                    return acc;
                                  }, {}),
                                machinedPartsQuantity:
                                  row.machinedPartsQuantity,
                                machinedPartsQuality: row.machinedPartsQuality,
                              }));
                              openSpecModal("machinedParts");
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              removeDetailRow("machinedParts", row.id)
                            }
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {materialDetailsTable.rollerMovementComponents.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-700 hover:bg-slate-700/50"
                    >
                      <td className="p-2 text-left text-slate-300 font-medium">
                        Roller/Movement
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.selection}
                      </td>
                      <td className="p-2 text-left text-slate-400">
                        {Object.entries(row)
                          .filter(
                            ([key]) =>
                              key !== "id" &&
                              key !== "selection" &&
                              key !== "rollerMovementComponentsQuantity" &&
                              key !== "rollerMovementComponentsQuality"
                          )
                          .map(([key, value]) => value && `${key}: ${value}`)
                          .filter(Boolean)
                          .join(" | ")}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.rollerMovementComponentsQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.rollerMovementComponentsQuality || "-"}
                      </td>
                      <td className="p-2 text-left">
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
                                rollerMovementComponents: row.selection,
                                rollerMovementComponentsSpecs: Object.entries(
                                  row
                                )
                                  .filter(
                                    ([key]) =>
                                      key !== "id" &&
                                      key !== "selection" &&
                                      key !==
                                        "rollerMovementComponentsQuantity" &&
                                      key !== "rollerMovementComponentsQuality"
                                  )
                                  .reduce((acc, [key, value]) => {
                                    acc[key] = value;
                                    return acc;
                                  }, {}),
                                rollerMovementComponentsQuantity:
                                  row.rollerMovementComponentsQuantity,
                                rollerMovementComponentsQuality:
                                  row.rollerMovementComponentsQuality,
                              }));
                              openSpecModal("rollerMovementComponents");
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 size={14} />
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
                  ))}
                  {materialDetailsTable.liftingPullingMechanisms.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-700 hover:bg-slate-700/50"
                    >
                      <td className="p-2 text-left text-slate-300 font-medium">
                        Lifting/Pulling
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.selection}
                      </td>
                      <td className="p-2 text-left text-slate-400">
                        {Object.entries(row)
                          .filter(
                            ([key]) =>
                              key !== "id" &&
                              key !== "selection" &&
                              key !== "liftingPullingMechanismsQuantity" &&
                              key !== "liftingPullingMechanismsQuality"
                          )
                          .map(([key, value]) => value && `${key}: ${value}`)
                          .filter(Boolean)
                          .join(" | ")}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.liftingPullingMechanismsQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.liftingPullingMechanismsQuality || "-"}
                      </td>
                      <td className="p-2 text-left">
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
                                liftingPullingMechanisms: row.selection,
                                liftingPullingMechanismsSpecs: Object.entries(
                                  row
                                )
                                  .filter(
                                    ([key]) =>
                                      key !== "id" &&
                                      key !== "selection" &&
                                      key !==
                                        "liftingPullingMechanismsQuantity" &&
                                      key !== "liftingPullingMechanismsQuality"
                                  )
                                  .reduce((acc, [key, value]) => {
                                    acc[key] = value;
                                    return acc;
                                  }, {}),
                                liftingPullingMechanismsQuantity:
                                  row.liftingPullingMechanismsQuantity,
                                liftingPullingMechanismsQuality:
                                  row.liftingPullingMechanismsQuality,
                              }));
                              openSpecModal("liftingPullingMechanisms");
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 size={14} />
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
                  ))}
                  {materialDetailsTable.electricalAutomation.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-700 hover:bg-slate-700/50"
                    >
                      <td className="p-2 text-left text-slate-300 font-medium">
                        Electrical/Automation
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.selection}
                      </td>
                      <td className="p-2 text-left text-slate-400">
                        {Object.entries(row)
                          .filter(
                            ([key]) =>
                              key !== "id" &&
                              key !== "selection" &&
                              key !== "electricalAutomationQuantity" &&
                              key !== "electricalAutomationQuality"
                          )
                          .map(([key, value]) => value && `${key}: ${value}`)
                          .filter(Boolean)
                          .join(" | ")}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.electricalAutomationQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.electricalAutomationQuality || "-"}
                      </td>
                      <td className="p-2 text-left">
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
                                electricalAutomation: row.selection,
                                electricalAutomationSpecs: Object.entries(row)
                                  .filter(
                                    ([key]) =>
                                      key !== "id" &&
                                      key !== "selection" &&
                                      key !== "electricalAutomationQuantity" &&
                                      key !== "electricalAutomationQuality"
                                  )
                                  .reduce((acc, [key, value]) => {
                                    acc[key] = value;
                                    return acc;
                                  }, {}),
                                electricalAutomationQuantity:
                                  row.electricalAutomationQuantity,
                                electricalAutomationQuality:
                                  row.electricalAutomationQuality,
                              }));
                              openSpecModal("electricalAutomation");
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              removeDetailRow("electricalAutomation", row.id)
                            }
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {materialDetailsTable.safetyMaterials.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-700 hover:bg-slate-700/50"
                    >
                      <td className="p-2 text-left text-slate-300 font-medium">
                        Safety Materials
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.selection}
                      </td>
                      <td className="p-2 text-left text-slate-400">
                        {Object.entries(row)
                          .filter(
                            ([key]) =>
                              key !== "id" &&
                              key !== "selection" &&
                              key !== "safetyMaterialsQuantity" &&
                              key !== "safetyMaterialsQuality"
                          )
                          .map(([key, value]) => value && `${key}: ${value}`)
                          .filter(Boolean)
                          .join(" | ")}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.safetyMaterialsQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.safetyMaterialsQuality || "-"}
                      </td>
                      <td className="p-2 text-left">
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
                                safetyMaterialsSpecs: Object.entries(row)
                                  .filter(
                                    ([key]) =>
                                      key !== "id" &&
                                      key !== "selection" &&
                                      key !== "safetyMaterialsQuantity" &&
                                      key !== "safetyMaterialsQuality"
                                  )
                                  .reduce((acc, [key, value]) => {
                                    acc[key] = value;
                                    return acc;
                                  }, {}),
                                safetyMaterialsQuantity:
                                  row.safetyMaterialsQuantity,
                                safetyMaterialsQuality:
                                  row.safetyMaterialsQuality,
                              }));
                              openSpecModal("safetyMaterials");
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              removeDetailRow("safetyMaterials", row.id)
                            }
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {materialDetailsTable.surfacePrepPainting.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-700 hover:bg-slate-700/50"
                    >
                      <td className="p-2 text-left text-slate-300 font-medium">
                        Surface Prep/Paint
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.selection}
                      </td>
                      <td className="p-2 text-left text-slate-400">
                        {Object.entries(row)
                          .filter(
                            ([key]) =>
                              key !== "id" &&
                              key !== "selection" &&
                              key !== "surfacePrepPaintingQuantity" &&
                              key !== "surfacePrepPaintingQuality"
                          )
                          .map(([key, value]) => value && `${key}: ${value}`)
                          .filter(Boolean)
                          .join(" | ")}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.surfacePrepPaintingQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.surfacePrepPaintingQuality || "-"}
                      </td>
                      <td className="p-2 text-left">
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
                                surfacePrepPainting: row.selection,
                                surfacePrepPaintingSpecs: Object.entries(row)
                                  .filter(
                                    ([key]) =>
                                      key !== "id" &&
                                      key !== "selection" &&
                                      key !== "surfacePrepPaintingQuantity" &&
                                      key !== "surfacePrepPaintingQuality"
                                  )
                                  .reduce((acc, [key, value]) => {
                                    acc[key] = value;
                                    return acc;
                                  }, {}),
                                surfacePrepPaintingQuantity:
                                  row.surfacePrepPaintingQuantity,
                                surfacePrepPaintingQuality:
                                  row.surfacePrepPaintingQuality,
                              }));
                              openSpecModal("surfacePrepPainting");
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              removeDetailRow("surfacePrepPainting", row.id)
                            }
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {materialDetailsTable.fabricationConsumables.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-700 hover:bg-slate-700/50"
                    >
                      <td className="p-2 text-left text-slate-300 font-medium">
                        Fabrication Consumables
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.selection}
                      </td>
                      <td className="p-2 text-left text-slate-400">
                        {Object.entries(row)
                          .filter(
                            ([key]) =>
                              key !== "id" &&
                              key !== "selection" &&
                              key !== "fabricationConsumablesQuantity" &&
                              key !== "fabricationConsumablesQuality"
                          )
                          .map(([key, value]) => value && `${key}: ${value}`)
                          .filter(Boolean)
                          .join(" | ")}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.fabricationConsumablesQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.fabricationConsumablesQuality || "-"}
                      </td>
                      <td className="p-2 text-left">
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
                                fabricationConsumables: row.selection,
                                fabricationConsumablesSpecs: Object.entries(row)
                                  .filter(
                                    ([key]) =>
                                      key !== "id" &&
                                      key !== "selection" &&
                                      key !==
                                        "fabricationConsumablesQuantity" &&
                                      key !== "fabricationConsumablesQuality"
                                  )
                                  .reduce((acc, [key, value]) => {
                                    acc[key] = value;
                                    return acc;
                                  }, {}),
                                fabricationConsumablesQuantity:
                                  row.fabricationConsumablesQuantity,
                                fabricationConsumablesQuality:
                                  row.fabricationConsumablesQuality,
                              }));
                              openSpecModal("fabricationConsumables");
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              removeDetailRow("fabricationConsumables", row.id)
                            }
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {materialDetailsTable.hardwareMisc.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-700 hover:bg-slate-700/50"
                    >
                      <td className="p-2 text-left text-slate-300 font-medium">
                        Hardware/Misc
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.selection}
                      </td>
                      <td className="p-2 text-left text-slate-400">
                        {Object.entries(row)
                          .filter(
                            ([key]) =>
                              key !== "id" &&
                              key !== "selection" &&
                              key !== "hardwareMiscQuantity" &&
                              key !== "hardwareMiscQuality"
                          )
                          .map(([key, value]) => value && `${key}: ${value}`)
                          .filter(Boolean)
                          .join(" | ")}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.hardwareMiscQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.hardwareMiscQuality || "-"}
                      </td>
                      <td className="p-2 text-left">
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
                                hardwareMiscSpecs: Object.entries(row)
                                  .filter(
                                    ([key]) =>
                                      key !== "id" &&
                                      key !== "selection" &&
                                      key !== "hardwareMiscQuantity" &&
                                      key !== "hardwareMiscQuality"
                                  )
                                  .reduce((acc, [key, value]) => {
                                    acc[key] = value;
                                    return acc;
                                  }, {}),
                                hardwareMiscQuantity: row.hardwareMiscQuantity,
                                hardwareMiscQuality: row.hardwareMiscQuality,
                              }));
                              openSpecModal("hardwareMisc");
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              removeDetailRow("hardwareMisc", row.id)
                            }
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {materialDetailsTable.documentationMaterials.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-700 hover:bg-slate-700/50"
                    >
                      <td className="p-2 text-left text-slate-300 font-medium">
                        Documentation
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.selection}
                      </td>
                      <td className="p-2 text-left text-slate-400">
                        {Object.entries(row)
                          .filter(
                            ([key]) =>
                              key !== "id" &&
                              key !== "selection" &&
                              key !== "documentationMaterialsQuantity" &&
                              key !== "documentationMaterialsQuality"
                          )
                          .map(([key, value]) => value && `${key}: ${value}`)
                          .filter(Boolean)
                          .join(" | ")}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.documentationMaterialsQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-300">
                        {row.documentationMaterialsQuality || "-"}
                      </td>
                      <td className="p-2 text-left">
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
                                documentationMaterials: row.selection,
                                documentationMaterialsSpecs: Object.entries(row)
                                  .filter(
                                    ([key]) =>
                                      key !== "id" &&
                                      key !== "selection" &&
                                      key !==
                                        "documentationMaterialsQuantity" &&
                                      key !== "documentationMaterialsQuality"
                                  )
                                  .reduce((acc, [key, value]) => {
                                    acc[key] = value;
                                    return acc;
                                  }, {}),
                                documentationMaterialsQuantity:
                                  row.documentationMaterialsQuantity,
                                documentationMaterialsQuality:
                                  row.documentationMaterialsQuality,
                              }));
                              openSpecModal("documentationMaterials");
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              removeDetailRow("documentationMaterials", row.id)
                            }
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
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
              {STEEL_SECTIONS_SPECS[currentMaterial.steelSection]?.map(
                (field) => (
                  <Input
                    key={field.name}
                    label={field.label}
                    value={currentMaterial[field.name] || ""}
                    onChange={(e) =>
                      setCurrentMaterial((prev) => ({
                        ...prev,
                        [field.name]: e.target.value,
                      }))
                    }
                    placeholder={field.placeholder}
                  />
                )
              )}
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
              {PLATE_TYPES_SPECS[currentMaterial.plateType]?.map((field) => (
                <Input
                  key={field.name}
                  label={field.label}
                  value={currentMaterial[field.name] || ""}
                  onChange={(e) =>
                    setCurrentMaterial((prev) => ({
                      ...prev,
                      [field.name]: e.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                />
              ))}
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
              {MATERIAL_GRADES_SPECS[currentMaterial.materialGrade]?.map(
                (field) => (
                  <Input
                    key={field.name}
                    label={field.label}
                    value={currentMaterial[field.name] || ""}
                    onChange={(e) =>
                      setCurrentMaterial((prev) => ({
                        ...prev,
                        [field.name]: e.target.value,
                      }))
                    }
                    placeholder={field.placeholder}
                  />
                )
              )}
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
              {FASTENER_TYPES_SPECS[currentMaterial.fastenerType]?.map(
                (field) => (
                  <Input
                    key={field.name}
                    label={field.label}
                    value={currentMaterial[field.name] || ""}
                    onChange={(e) =>
                      setCurrentMaterial((prev) => ({
                        ...prev,
                        [field.name]: e.target.value,
                      }))
                    }
                    placeholder={field.placeholder}
                  />
                )
              )}
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

                setTimeout(() => {
                  addMaterial();
                  closeSpecModal();
                }, 100);
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save size={16} />
              Save & Add to Table
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

      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)}>
        <div className="bg-slate-900 p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-100">
              Material Details - {viewingMaterial?.name}
            </h3>
            <button
              onClick={() => setViewModalOpen(false)}
              className="text-slate-400 hover:text-slate-200"
            >
              <X size={24} />
            </button>
          </div>

          {viewingMaterial && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-3 border-b border-slate-700 pb-2">
                  Basic Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-slate-400">Material Name</p>
                    <p className="text-slate-100 font-medium">
                      {viewingMaterial.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Category</p>
                    <p className="text-slate-100">
                      {viewingMaterial.category || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Description</p>
                    <p className="text-slate-100">
                      {viewingMaterial.description || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Quantity</p>
                    <p className="text-slate-100 font-medium">
                      {viewingMaterial.quantity} {viewingMaterial.unit}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-3 border-b border-slate-700 pb-2">
                  Assignment & Source
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-slate-400">Source</p>
                    <p className="text-slate-100 capitalize">
                      {viewingMaterial.source || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Assignee</p>
                    <p className="text-slate-100">
                      {viewingMaterial.assignee
                        ? state.employees?.find(
                            (e) => (e._id || e.id) === viewingMaterial.assignee
                          )?.name ||
                          state.employees?.find(
                            (e) => (e._id || e.id) === viewingMaterial.assignee
                          )?.employeeName ||
                          "Unknown"
                        : "Unassigned"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Quality/Grade</p>
                    <p className="text-slate-100">
                      {viewingMaterial.quality || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {(viewingMaterial.steelSection ||
                viewingMaterial.plateType ||
                viewingMaterial.materialGrade ||
                viewingMaterial.fastenerType) && (
                <div className="md:col-span-2">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3 border-b border-slate-700 pb-2">
                    Material Specifications
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {viewingMaterial.steelSection && (
                      <>
                        <div>
                          <p className="text-slate-400">Steel Section</p>
                          <p className="text-slate-100">
                            {viewingMaterial.steelSection}
                          </p>
                        </div>
                        {viewingMaterial.steelSize && (
                          <div>
                            <p className="text-slate-400">Size</p>
                            <p className="text-slate-100">
                              {viewingMaterial.steelSize}
                            </p>
                          </div>
                        )}
                        {viewingMaterial.steelLength && (
                          <div>
                            <p className="text-slate-400">Length</p>
                            <p className="text-slate-100">
                              {viewingMaterial.steelLength} mm
                            </p>
                          </div>
                        )}
                        {viewingMaterial.steelTolerance && (
                          <div>
                            <p className="text-slate-400">Tolerance</p>
                            <p className="text-slate-100">
                              {viewingMaterial.steelTolerance}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    {viewingMaterial.plateType && (
                      <>
                        <div>
                          <p className="text-slate-400">Plate Type</p>
                          <p className="text-slate-100">
                            {viewingMaterial.plateType}
                          </p>
                        </div>
                        {viewingMaterial.plateThickness && (
                          <div>
                            <p className="text-slate-400">Thickness</p>
                            <p className="text-slate-100">
                              {viewingMaterial.plateThickness} mm
                            </p>
                          </div>
                        )}
                        {viewingMaterial.plateLength && (
                          <div>
                            <p className="text-slate-400">Length</p>
                            <p className="text-slate-100">
                              {viewingMaterial.plateLength} mm
                            </p>
                          </div>
                        )}
                        {viewingMaterial.plateWidth && (
                          <div>
                            <p className="text-slate-400">Width</p>
                            <p className="text-slate-100">
                              {viewingMaterial.plateWidth} mm
                            </p>
                          </div>
                        )}
                        {viewingMaterial.plateSurfaceFinish && (
                          <div>
                            <p className="text-slate-400">Surface Finish</p>
                            <p className="text-slate-100">
                              {viewingMaterial.plateSurfaceFinish}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    {viewingMaterial.materialGrade && (
                      <>
                        <div>
                          <p className="text-slate-400">Grade</p>
                          <p className="text-slate-100">
                            {viewingMaterial.materialGrade}
                          </p>
                        </div>
                        {viewingMaterial.grade && (
                          <div>
                            <p className="text-slate-400">Grade Spec</p>
                            <p className="text-slate-100">
                              {viewingMaterial.grade}
                            </p>
                          </div>
                        )}
                        {viewingMaterial.gradeCertificationRequired && (
                          <div>
                            <p className="text-slate-400">Certification</p>
                            <p className="text-slate-100">
                              {viewingMaterial.gradeCertificationRequired}
                            </p>
                          </div>
                        )}
                        {viewingMaterial.gradeTestingStandards && (
                          <div>
                            <p className="text-slate-400">Testing Standards</p>
                            <p className="text-slate-100">
                              {viewingMaterial.gradeTestingStandards}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    {viewingMaterial.fastenerType && (
                      <>
                        <div>
                          <p className="text-slate-400">Fastener Type</p>
                          <p className="text-slate-100">
                            {viewingMaterial.fastenerType}
                          </p>
                        </div>
                        {viewingMaterial.fastenerSize && (
                          <div>
                            <p className="text-slate-400">Size</p>
                            <p className="text-slate-100">
                              M{viewingMaterial.fastenerSize}
                            </p>
                          </div>
                        )}
                        {viewingMaterial.fastenerQuantityPerUnit && (
                          <div>
                            <p className="text-slate-400">Qty Per Unit</p>
                            <p className="text-slate-100">
                              {viewingMaterial.fastenerQuantityPerUnit}
                            </p>
                          </div>
                        )}
                        {viewingMaterial.fastenerPlating && (
                          <div>
                            <p className="text-slate-400">Plating/Grade</p>
                            <p className="text-slate-100">
                              {viewingMaterial.fastenerPlating}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-700">
            <Button
              type="button"
              onClick={() => {
                editMaterial(viewingMaterial);
                setViewModalOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Edit2 size={16} />
              Edit Material
            </Button>
            <Button
              type="button"
              onClick={() => setViewModalOpen(false)}
              variant="secondary"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <X size={16} />
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
