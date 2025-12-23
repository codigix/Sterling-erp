import React, { useState } from "react";
import { Package, Plus, Trash2, Edit2, X, FileText, Save } from "lucide-react";
import Input from "../../../ui/Input";
import Select from "../../../ui/Select";
import FormSection from "../shared/FormSection";
import FormRow from "../shared/FormRow";
import Modal from "../../../ui/Modal";
import Button from "../../../ui/Button";
import { useFormData, useSalesOrderContext } from "../hooks";
import {
  MACHINED_PARTS_SPECS,
  MACHINED_PARTS_SPECIFIC_FIELDS,
  ROLLER_MOVEMENT_COMPONENTS_SPECS,
  ROLLER_MOVEMENT_COMPONENTS_SPECIFIC_FIELDS,
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
  MATERIAL_GRADE_SPECIFIC_FIELDS,
  FASTENER_TYPES_SPECS,
  FASTENER_SPECIFIC_FIELDS,
} from "../constants";
import materialSelectionConfig from "../config/materialSelectionConfig.json";
import formFieldsConfig from "../config/formFieldsConfig.json";
import materialInitialState from "../config/materialInitialState.json";
import materialConstants from "../config/materialConstants.json";
import materialDetailsConfig from "../config/materialDetailsConfig.json";
import {
  formatDetailDisplay,
  getModalTitle,
  getMaterialTypeLabel,
  getDetailRowConfig,
  buildSpecsObject,
  getDetailRowEditData,
  getSpecsKeyName,
  getQuantityKeyName,
  getQualityKeyName,
  getSubFieldsForMaterialType,
  getSubFieldsForCategory,
  getAllSubCategories,
  getSubCategoryLabel,
} from "../utils/materialUtilities";

const STEEL_SECTION_CATEGORY_FIELDS = formFieldsConfig.steelSectionFields;

const PLATE_CATEGORY_FIELDS = formFieldsConfig.plateFields;

export default function Step4_MaterialRequirement({ readOnly = false }) {
  const { formData, updateField } = useFormData();
  const {
    state,
    toggleMaterialType,
    updateMaterialDetail,
    deleteMaterialDetail,
  } = useSalesOrderContext();

  const [currentMaterial, setCurrentMaterial] = useState(materialInitialState);

  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [specModalType, setSpecModalType] = useState(null);
  const [editingDetail, setEditingDetail] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingMaterial, setViewingMaterial] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  const enabledMaterials = state.enabledMaterials;
  const materialDetailsTable = state.materialDetailsTable;

  const toggleEnabledMaterial = (materialType) => {
    toggleMaterialType(materialType);
  };

  const handleMaterialChange = (e) => {
    const { name, value } = e.target;
    setCurrentMaterial((prev) => ({ ...prev, [name]: value }));

    if (materialConstants.complexSpecTypes.includes(name) && value) {
      setTimeout(() => openSpecModal(name), 100);
    }
  };

  const getQuantityFieldName = () => {
    const quantityFieldMap = {
      steelSection: 'steelSectionQuantity',
      plateType: 'plateTypeQuantity',
      materialGrade: 'materialGradeQuantity',
      fastenerType: 'fastenerTypeQuantity',
      machinedParts: 'machinedPartsQuantity',
      rollerMovementComponents: 'rollerMovementComponentsQuantity',
      liftingPullingMechanisms: 'liftingPullingMechanismsQuantity',
      electricalAutomation: 'electricalAutomationQuantity',
      safetyMaterials: 'safetyMaterialsQuantity',
      surfacePrepPainting: 'surfacePrepPaintingQuantity',
      fabricationConsumables: 'fabricationConsumablesQuantity',
      hardwareMisc: 'hardwareMiscQuantity',
      documentationMaterials: 'documentationMaterialsQuantity',
    };

    for (const [materialType, quantityField] of Object.entries(quantityFieldMap)) {
      if (enabledMaterials[materialType] && currentMaterial[quantityField]) {
        return quantityField;
      }
    }
    return null;
  };

  const addMaterial = () => {
    const quantityField = getQuantityFieldName();
    const quantity = quantityField ? currentMaterial[quantityField] : null;

    if (!quantity || parseFloat(quantity) <= 0) {
      alert('Please enter a valid quantity for the selected material type');
      return;
    }

    const normalizedMaterial = { ...currentMaterial, quantity, id: Date.now() };
    updateField("materials", [
      ...formData.materials,
      normalizedMaterial,
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
    const quantityField = getQuantityFieldName();
    const quantity = quantityField ? currentMaterial[quantityField] : null;

    if (!quantity || parseFloat(quantity) <= 0) {
      alert('Please enter a valid quantity for the selected material type');
      return;
    }

    const normalizedMaterial = { ...currentMaterial, quantity };
    updateField(
      "materials",
      formData.materials.map((m) =>
        m.id === editingDetail ? normalizedMaterial : m
      )
    );
    resetMaterial();
    setEditingDetail(null);
  };

  const resetMaterial = () => {
    setCurrentMaterial(materialInitialState);
    setEditingDetail(null);
  };

  const openSpecModal = (type) => {
    setSpecModalType(type);
    setSpecModalOpen(true);
  };

  const closeSpecModal = () => {
    setSpecModalOpen(false);
    setSpecModalType(null);
    setSelectedSubCategory(null);
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
    if (materialConstants.complexSpecTypes.includes(type)) {
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

  const handleDocumentationFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileObjects = files.map((file) => ({
      name: file.name,
      size: (file.size / 1024).toFixed(2),
    }));

    setCurrentMaterial((prev) => ({
      ...prev,
      documentationUploadedFiles: [
        ...(prev.documentationUploadedFiles || []),
        ...fileObjects,
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

  const renderCommonFields = (materialType) => {
    const quantityKey = `${materialType}Quantity`;
    const qualityKey = `${materialType}Quality`;

    return (
      <>
        <Input
          label="Quantity"
          type="number"
          value={currentMaterial[quantityKey] || ""}
          onChange={(e) =>
            setCurrentMaterial((prev) => ({
              ...prev,
              [quantityKey]: e.target.value,
            }))
          }
          placeholder={materialConstants.quantityPlaceholders[materialType] || "e.g., 10"}
        />
        <Input
          label="Quality / Grade"
          value={currentMaterial[qualityKey] || ""}
          onChange={(e) =>
            setCurrentMaterial((prev) => ({
              ...prev,
              [qualityKey]: e.target.value,
            }))
          }
          placeholder={materialConstants.qualityPlaceholder}
        />
      </>
    );
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Steel Section */}
              <div className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={enabledMaterials.steelSection}
                    onChange={() => toggleEnabledMaterial("steelSection")}
                    className="w-5 h-5 mt-0.5"
                  />
                  <span className="text-sm font-semibold text-slate-900">Steel Sections</span>
                </label>
                {enabledMaterials.steelSection && (
                  <select
                    name="steelSection"
                    value={currentMaterial.steelSection || ""}
                    onChange={(e) => {
                      handleMaterialChange(e);
                      if (e.target.value) {
                        setTimeout(() => openSpecModal("steelSection"), 0);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    {materialSelectionConfig.materialTypes.find(m => m.id === 'steelSection')?.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Plate Type */}
              <div className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={enabledMaterials.plateType}
                    onChange={() => toggleEnabledMaterial("plateType")}
                    className="w-5 h-5 mt-0.5"
                  />
                  <span className="text-sm font-semibold text-slate-900">Plates</span>
                </label>
                {enabledMaterials.plateType && (
                  <select
                    name="plateType"
                    value={currentMaterial.plateType || ""}
                    onChange={(e) => {
                      handleMaterialChange(e);
                      if (e.target.value) {
                        setTimeout(() => openSpecModal("plateType"), 0);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    {materialSelectionConfig.materialTypes.find(m => m.id === 'plateType')?.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Material Grade */}
              <div className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={enabledMaterials.materialGrade}
                    onChange={() => toggleEnabledMaterial("materialGrade")}
                    className="w-5 h-5 mt-0.5"
                  />
                  <span className="text-sm font-semibold text-slate-900">Material Grades</span>
                </label>
                {enabledMaterials.materialGrade && (
                  <select
                    name="materialGrade"
                    value={currentMaterial.materialGrade || ""}
                    onChange={(e) => {
                      handleMaterialChange(e);
                      if (e.target.value) {
                        setTimeout(() => openSpecModal("materialGrade"), 0);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    {materialSelectionConfig.materialTypes.find(m => m.id === 'materialGrade')?.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Fastener Type */}
              <div className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={enabledMaterials.fastenerType}
                    onChange={() => toggleEnabledMaterial("fastenerType")}
                    className="w-5 h-5 mt-0.5"
                  />
                  <span className="text-sm font-semibold text-slate-900">Fasteners</span>
                </label>
                {enabledMaterials.fastenerType && (
                  <select
                    name="fastenerType"
                    value={currentMaterial.fastenerType || ""}
                    onChange={(e) => {
                      handleMaterialChange(e);
                      if (e.target.value) {
                        setTimeout(() => openSpecModal("fastenerType"), 0);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    {materialSelectionConfig.materialTypes.find(m => m.id === 'fastenerType')?.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Machined Parts */}
              <div className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={enabledMaterials.machinedParts}
                    onChange={() => toggleEnabledMaterial("machinedParts")}
                    className="w-5 h-5 mt-0.5"
                  />
                  <span className="text-sm font-semibold text-slate-900">Machined Parts</span>
                </label>
                {enabledMaterials.machinedParts && (
                  <select
                    name="machinedParts"
                    value={currentMaterial.machinedParts || ""}
                    onChange={(e) => {
                      handleMaterialChange(e);
                      if (e.target.value) {
                        setTimeout(() => openSpecModal("machinedParts"), 0);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    {materialSelectionConfig.materialTypes.find(m => m.id === 'machinedParts')?.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Roller Movement Components */}
              <div className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={enabledMaterials.rollerMovementComponents}
                    onChange={() => toggleEnabledMaterial("rollerMovementComponents")}
                    className="w-5 h-5 mt-0.5"
                  />
                  <span className="text-sm font-semibold text-slate-900">Roller / Movement</span>
                </label>
                {enabledMaterials.rollerMovementComponents && (
                  <select
                    name="rollerMovementComponents"
                    value={currentMaterial.rollerMovementComponents || ""}
                    onChange={(e) => {
                      handleMaterialChange(e);
                      if (e.target.value) {
                        setTimeout(() => openSpecModal("rollerMovementComponents"), 0);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    {materialSelectionConfig.materialTypes.find(m => m.id === 'rollerMovementComponents')?.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Lifting Pulling Mechanisms */}
              <div className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={enabledMaterials.liftingPullingMechanisms}
                    onChange={() => toggleEnabledMaterial("liftingPullingMechanisms")}
                    className="w-5 h-5 mt-0.5"
                  />
                  <span className="text-sm font-semibold text-slate-900">Lifting / Pulling</span>
                </label>
                {enabledMaterials.liftingPullingMechanisms && (
                  <select
                    name="liftingPullingMechanisms"
                    value={currentMaterial.liftingPullingMechanisms || ""}
                    onChange={(e) => {
                      handleMaterialChange(e);
                      if (e.target.value) {
                        setTimeout(() => openSpecModal("liftingPullingMechanisms"), 0);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    {materialSelectionConfig.materialTypes.find(m => m.id === 'liftingPullingMechanisms')?.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Electrical Automation */}
              <div className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={enabledMaterials.electricalAutomation}
                    onChange={() => toggleEnabledMaterial("electricalAutomation")}
                    className="w-5 h-5 mt-0.5"
                  />
                  <span className="text-sm font-semibold text-slate-900">Electrical / Automation</span>
                </label>
                {enabledMaterials.electricalAutomation && (
                  <select
                    name="electricalAutomation"
                    value={currentMaterial.electricalAutomation || ""}
                    onChange={(e) => {
                      handleMaterialChange(e);
                      if (e.target.value) {
                        setTimeout(() => openSpecModal("electricalAutomation"), 0);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    {materialSelectionConfig.materialTypes.find(m => m.id === 'electricalAutomation')?.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Safety Materials */}
              <div className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={enabledMaterials.safetyMaterials}
                    onChange={() => toggleEnabledMaterial("safetyMaterials")}
                    className="w-5 h-5 mt-0.5"
                  />
                  <span className="text-sm font-semibold text-slate-900">Safety Materials</span>
                </label>
                {enabledMaterials.safetyMaterials && (
                  <select
                    name="safetyMaterials"
                    value={currentMaterial.safetyMaterials || ""}
                    onChange={(e) => {
                      handleMaterialChange(e);
                      if (e.target.value) {
                        setTimeout(() => openSpecModal("safetyMaterials"), 0);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    {materialSelectionConfig.materialTypes.find(m => m.id === 'safetyMaterials')?.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Surface Prep Painting */}
              <div className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={enabledMaterials.surfacePrepPainting}
                    onChange={() => toggleEnabledMaterial("surfacePrepPainting")}
                    className="w-5 h-5 mt-0.5"
                  />
                  <span className="text-sm font-semibold text-slate-900">Surface Prep / Paint</span>
                </label>
                {enabledMaterials.surfacePrepPainting && (
                  <select
                    name="surfacePrepPainting"
                    value={currentMaterial.surfacePrepPainting || ""}
                    onChange={(e) => {
                      handleMaterialChange(e);
                      if (e.target.value) {
                        setTimeout(() => openSpecModal("surfacePrepPainting"), 0);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    {materialSelectionConfig.materialTypes.find(m => m.id === 'surfacePrepPainting')?.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Fabrication Consumables */}
              <div className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={enabledMaterials.fabricationConsumables}
                    onChange={() => toggleEnabledMaterial("fabricationConsumables")}
                    className="w-5 h-5 mt-0.5"
                  />
                  <span className="text-sm font-semibold text-slate-900">Fabrication Consumables</span>
                </label>
                {enabledMaterials.fabricationConsumables && (
                  <select
                    name="fabricationConsumables"
                    value={currentMaterial.fabricationConsumables || ""}
                    onChange={(e) => {
                      handleMaterialChange(e);
                      if (e.target.value) {
                        setTimeout(() => openSpecModal("fabricationConsumables"), 0);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    {materialSelectionConfig.materialTypes.find(m => m.id === 'fabricationConsumables')?.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Hardware Misc */}
              <div className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={enabledMaterials.hardwareMisc}
                    onChange={() => toggleEnabledMaterial("hardwareMisc")}
                    className="w-5 h-5 mt-0.5"
                  />
                  <span className="text-sm font-semibold text-slate-900">Hardware / Misc</span>
                </label>
                {enabledMaterials.hardwareMisc && (
                  <select
                    name="hardwareMisc"
                    value={currentMaterial.hardwareMisc || ""}
                    onChange={(e) => {
                      handleMaterialChange(e);
                      if (e.target.value) {
                        setTimeout(() => openSpecModal("hardwareMisc"), 0);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    {materialSelectionConfig.materialTypes.find(m => m.id === 'hardwareMisc')?.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Documentation Materials */}
              <div className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={enabledMaterials.documentationMaterials}
                    onChange={() => toggleEnabledMaterial("documentationMaterials")}
                    className="w-5 h-5 mt-0.5"
                  />
                  <span className="text-sm font-semibold text-slate-900">Documentation</span>
                </label>
                {enabledMaterials.documentationMaterials && (
                  <select
                    name="documentationMaterials"
                    value={currentMaterial.documentationMaterials || ""}
                    onChange={(e) => {
                      handleMaterialChange(e);
                      if (e.target.value) {
                        setTimeout(() => openSpecModal("documentationMaterials"), 0);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    {materialSelectionConfig.materialTypes.find(m => m.id === 'documentationMaterials')?.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>

        {formData.materials.length > 0 && (
          <div className="mt-8 space-y-4">
            <div>
              <h5 className="text-sm font-semibold text-slate-900 mb-3 text-left">
                Material Requirements
              </h5>
              <p className="text-xs text-slate-600 text-left">
                {formData.materials.length} material{formData.materials.length !== 1 ? 's' : ''} added
              </p>
            </div>
            <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="p-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Material Name
                    </th>
                    <th className="p-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Type
                    </th>
                    <th className="p-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Qty
                    </th>
                    <th className="p-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Unit
                    </th>
                    <th className="p-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Source
                    </th>
                    <th className="p-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Assignee
                    </th>
                    <th className="p-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
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
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="p-2 text-sm font-medium text-slate-900 text-left">
                          {materialType}
                        </td>
                        <td className="p-2 text-sm">
                          <span className="inline-flex items-center p-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {(() => {
                              for (const config of materialDetailsConfig.materialTypes) {
                                if (material[config.id]) {
                                  return config.displayLabel;
                                }
                              }
                              return "-";
                            })()}
                          </span>
                        </td>
                        <td className="p-2 text-sm font-medium text-slate-900 text-left">
                          {material.quantity}
                        </td>
                        <td className="p-2 text-sm text-slate-600">
                          {material.unit || "-"}
                        </td>
                        <td className="p-2 text-sm">
                          {material.source ? (
                            <span className="inline-flex items-center p-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 capitalize">
                              {material.source}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-2 text-sm">
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
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
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
                        <td className="p-2 text-sm">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setViewingMaterial(material);
                                setViewModalOpen(true);
                              }}
                              className="p-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors"
                              title="View Details"
                            >
                              <FileText size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => editMaterial(material)}
                              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-700 transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeMaterial(material.id)}
                              className="p-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors"
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
          <div className="mt-8 space-y-4">
            <div>
              <h5 className="text-sm font-semibold text-slate-900 mb-1 text-left">
                Material Specifications Summary
              </h5>
              <p className="text-xs text-slate-600 text-left">
                Detailed specifications for all materials
              </p>
            </div>
            <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Type
                    </th>
                    <th className="p-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Selection
                    </th>
                    <th className="p-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Details
                    </th>
                    <th className="p-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Quantity
                    </th>
                    <th className="p-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Quality
                    </th>
                    <th className="p-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {materialDetailsTable.steelSection.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="p-2 text-left text-sm font-medium text-slate-900 text-left">
                        Steel Section
                      </td>
                      <td className="p-2 text-left text-sm text-slate-900">
                        {row.selection}
                      </td>
                      <td className="p-2 text-left text-sm text-slate-600">
                        {row.steelSize && `Size: ${row.steelSize}`}
                        {row.steelLength && ` | Length: ${row.steelLength}mm`}
                        {row.steelTolerance && ` | Tol: ${row.steelTolerance}`}
                      </td>
                      <td className="p-2 text-left text-sm text-slate-900">
                        {row.steelSectionQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-sm text-slate-900">
                        {row.steelSectionQuality || "-"}
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex justify-center gap-1">
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
                            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-700 transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              removeDetailRow("steelSection", row.id)
                            }
                            className="p-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors"
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
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="p-2 text-left text-sm font-medium text-slate-900 text-left">
                        Plate
                      </td>
                      <td className="p-2 text-left text-sm text-slate-900">
                        {row.selection}
                      </td>
                      <td className="p-2 text-left text-sm text-slate-600">
                        {row.plateThickness && `Thick: ${row.plateThickness}mm`}
                        {row.plateLength && ` | Length: ${row.plateLength}mm`}
                        {row.plateWidth && ` | Width: ${row.plateWidth}mm`}
                        {row.plateSurfaceFinish &&
                          ` | Finish: ${row.plateSurfaceFinish}`}
                      </td>
                      <td className="p-2 text-left text-sm text-slate-900">
                        {row.plateTypeQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-sm text-slate-900">
                        {row.plateTypeQuality || "-"}
                      </td>
                      <td className="p-2 text-center">
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
                      className="border-b border-slate-200 hover:bg-purple-50"
                    >
                      <td className="p-2 text-left text-slate-900 font-medium">
                        Material Grade
                      </td>
                      <td className="p-2 text-left text-slate-900">
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
                      <td className="p-2 text-left text-slate-900">
                        {row.materialGradeQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-900">
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
                      className="border-b border-slate-200 hover:bg-purple-50"
                    >
                      <td className="p-2 text-left text-slate-900 font-medium">
                        Fastener
                      </td>
                      <td className="p-2 text-left text-slate-900">
                        {row.selection}
                      </td>
                      <td className="p-2 text-left text-slate-400">
                        {row.fastenerSize && `Size: M${row.fastenerSize}`}
                        {row.fastenerQuantityPerUnit &&
                          ` | Per Unit: ${row.fastenerQuantityPerUnit}pcs`}
                        {row.fastenerPlating &&
                          ` | Plating: ${row.fastenerPlating}`}
                      </td>
                      <td className="p-2 text-left text-slate-900">
                        {row.fastenerTypeQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-900">
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
                      className="border-b border-slate-200 hover:bg-purple-50"
                    >
                      <td className="p-2 text-left text-slate-900 font-medium">
                        Machined Part
                      </td>
                      <td className="p-2 text-left text-slate-900">
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
                      <td className="p-2 text-left text-slate-900">
                        {row.machinedPartsQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-900">
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
                      className="border-b border-slate-200 hover:bg-purple-50"
                    >
                      <td className="p-2 text-left text-slate-900 font-medium">
                        Roller/Movement
                      </td>
                      <td className="p-2 text-left text-slate-900">
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
                      <td className="p-2 text-left text-slate-900">
                        {row.rollerMovementComponentsQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-900">
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
                      className="border-b border-slate-200 hover:bg-purple-50"
                    >
                      <td className="p-2 text-left text-slate-900 font-medium">
                        Lifting/Pulling
                      </td>
                      <td className="p-2 text-left text-slate-900">
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
                      <td className="p-2 text-left text-slate-900">
                        {row.liftingPullingMechanismsQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-900">
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
                      className="border-b border-slate-200 hover:bg-purple-50"
                    >
                      <td className="p-2 text-left text-slate-900 font-medium">
                        Electrical/Automation
                      </td>
                      <td className="p-2 text-left text-slate-900">
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
                      <td className="p-2 text-left text-slate-900">
                        {row.electricalAutomationQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-900">
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
                      className="border-b border-slate-200 hover:bg-purple-50"
                    >
                      <td className="p-2 text-left text-slate-900 font-medium">
                        Safety Materials
                      </td>
                      <td className="p-2 text-left text-slate-900">
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
                      <td className="p-2 text-left text-slate-900">
                        {row.safetyMaterialsQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-900">
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
                      className="border-b border-slate-200 hover:bg-purple-50"
                    >
                      <td className="p-2 text-left text-slate-900 font-medium">
                        Surface Prep/Paint
                      </td>
                      <td className="p-2 text-left text-slate-900">
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
                      <td className="p-2 text-left text-slate-900">
                        {row.surfacePrepPaintingQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-900">
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
                      className="border-b border-slate-200 hover:bg-purple-50"
                    >
                      <td className="p-2 text-left text-slate-900 font-medium">
                        Fabrication Consumables
                      </td>
                      <td className="p-2 text-left text-slate-900">
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
                      <td className="p-2 text-left text-slate-900">
                        {row.fabricationConsumablesQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-900">
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
                      className="border-b border-slate-200 hover:bg-purple-50"
                    >
                      <td className="p-2 text-left text-slate-900 font-medium">
                        Hardware/Misc
                      </td>
                      <td className="p-2 text-left text-slate-900">
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
                      <td className="p-2 text-left text-slate-900">
                        {row.hardwareMiscQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-900">
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
                      className="border-b border-slate-200 hover:bg-purple-50"
                    >
                      <td className="p-2 text-left text-slate-900 font-medium">
                        Documentation
                      </td>
                      <td className="p-2 text-left text-slate-900">
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
                      <td className="p-2 text-left text-slate-900">
                        {row.documentationMaterialsQuantity || "-"}
                      </td>
                      <td className="p-2 text-left text-slate-900">
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
        title={`Edit ${getModalTitle(specModalType)} Specifications`}
        size="lg"
      >
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto bg-gradient-to-b from-slate-50 to-white">
          {specModalType === "steelSection" && (
            <div className="space-y-7">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                  <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Basic Specifications</h5>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                </div>
              </div>

              {currentMaterial.steelSection && STEEL_SECTION_CATEGORY_FIELDS[currentMaterial.steelSection] && (
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                    <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Category Details</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {STEEL_SECTION_CATEGORY_FIELDS[currentMaterial.steelSection]?.map(
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
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-1 w-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"></div>
                  <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Quantity & Quality</h5>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {renderCommonFields("steelSection")}
                </div>
              </div>
            </div>
          )}

          {specModalType === "plateType" && (
            <div className="space-y-7">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                  <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Basic Specifications</h5>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                </div>
              </div>

              {currentMaterial.plateType && PLATE_CATEGORY_FIELDS[currentMaterial.plateType] && (
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                    <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Category Details</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {PLATE_CATEGORY_FIELDS[currentMaterial.plateType]?.map(
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
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-1 w-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"></div>
                  <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Quantity & Quality</h5>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {renderCommonFields("plateType")}
                </div>
              </div>
            </div>
          )}

          {specModalType === "materialGrade" && (
            <div className="space-y-7">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                  <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Basic Specifications</h5>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                </div>
              </div>

              {currentMaterial.materialGrade && MATERIAL_GRADE_SPECIFIC_FIELDS[currentMaterial.materialGrade] && (
                <div>
                  <h5 className="text-sm font-semibold text-slate-200 mb-3">Category-Specific Details</h5>
                  <div className="grid grid-cols-2 gap-4">
                    {MATERIAL_GRADE_SPECIFIC_FIELDS[currentMaterial.materialGrade]?.map(
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
                  </div>
                </div>
              )}

              <div>
                <h5 className="text-sm font-semibold text-slate-200 mb-3">Quantity & Quality</h5>
                <div className="grid grid-cols-2 gap-4">
                  {renderCommonFields("materialGrade")}
                </div>
              </div>
            </div>
          )}

          {specModalType === "fastenerType" && (
            <div className="space-y-6">
              <div>
                <h5 className="text-sm font-semibold text-slate-200 mb-3">Basic Specifications</h5>
                <div className="grid grid-cols-2 gap-4">
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
                </div>
              </div>

              {currentMaterial.fastenerType && FASTENER_SPECIFIC_FIELDS[currentMaterial.fastenerType] && (
                <div>
                  <h5 className="text-sm font-semibold text-slate-200 mb-3">Category-Specific Details</h5>
                  <div className="grid grid-cols-2 gap-4">
                    {FASTENER_SPECIFIC_FIELDS[currentMaterial.fastenerType]?.map(
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
                  </div>
                </div>
              )}

              <div>
                <h5 className="text-sm font-semibold text-slate-200 mb-3">Quantity & Quality</h5>
                <div className="grid grid-cols-2 gap-4">
                  {renderCommonFields("fastenerType")}
                </div>
              </div>
            </div>
          )}

          {specModalType === "machinedParts" && (
            <div className="space-y-6">
              <div>
                <h5 className="text-sm font-semibold text-slate-200 mb-3">Basic Specifications</h5>
                <div className="grid grid-cols-2 gap-4">
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
                </div>
              </div>

              {currentMaterial.machinedParts && MACHINED_PARTS_SPECIFIC_FIELDS[currentMaterial.machinedParts] && (
                <div>
                  <h5 className="text-sm font-semibold text-slate-200 mb-3">Category-Specific Details</h5>
                  <div className="grid grid-cols-2 gap-4">
                    {MACHINED_PARTS_SPECIFIC_FIELDS[currentMaterial.machinedParts]?.map(
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
                  </div>
                </div>
              )}

              <div>
                <h5 className="text-sm font-semibold text-slate-200 mb-3">Quantity & Quality</h5>
                <div className="grid grid-cols-2 gap-4">
                  {renderCommonFields("machinedParts")}
                </div>
              </div>
            </div>
          )}

          {specModalType === "rollerMovementComponents" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 text-left mb-2 text-left">
                  Component Type
                </label>
                <select
                  value={selectedSubCategory || ""}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Component Type</option>
                  {getAllSubCategories("rollerMovementComponents").map((category) => (
                    <option key={category} value={category}>
                      {getSubCategoryLabel("rollerMovementComponents", category)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSubCategory && (
                <div>
                  <h5 className="text-sm font-semibold text-slate-200 mb-3">
                    {getSubCategoryLabel("rollerMovementComponents", selectedSubCategory)} Details
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    {getSubFieldsForCategory("rollerMovementComponents", selectedSubCategory)?.fields?.map(
                      (field) => (
                        field.type === "select" ? (
                          <div key={field.name}>
                            <label className="block text-sm font-medium text-slate-900 text-left mb-1 text-left">
                              {field.label}
                            </label>
                            <select
                              value={currentMaterial.rollerMovementComponentsSpecs[field.name] || ""}
                              onChange={(e) =>
                                setCurrentMaterial((prev) => ({
                                  ...prev,
                                  rollerMovementComponentsSpecs: {
                                    ...prev.rollerMovementComponentsSpecs,
                                    [field.name]: e.target.value,
                                  },
                                }))
                              }
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="">{field.placeholder}</option>
                              {field.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <Input
                            key={field.name}
                            label={field.label}
                            type={field.type || "text"}
                            value={currentMaterial.rollerMovementComponentsSpecs[field.name] || ""}
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
                        )
                      )
                    )}
                  </div>
                </div>
              )}

              <div>
                <h5 className="text-sm font-semibold text-slate-200 mb-3">
                  Quantity & Quality
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  {renderCommonFields("rollerMovementComponents")}
                </div>
              </div>
            </div>
          )}

          {specModalType === "liftingPullingMechanisms" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 text-left mb-2 text-left">
                  Mechanism Type
                </label>
                <select
                  value={selectedSubCategory || ""}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Mechanism Type</option>
                  {getAllSubCategories("liftingPullingMechanisms").map((category) => (
                    <option key={category} value={category}>
                      {getSubCategoryLabel("liftingPullingMechanisms", category)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSubCategory && (
                <div>
                  <h5 className="text-sm font-semibold text-slate-200 mb-3">
                    {getSubCategoryLabel("liftingPullingMechanisms", selectedSubCategory)} Specifications
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    {getSubFieldsForCategory("liftingPullingMechanisms", selectedSubCategory)?.fields?.map(
                      (field) => (
                        field.type === "select" ? (
                          <div key={field.name}>
                            <label className="block text-sm font-medium text-slate-900 text-left mb-1 text-left">
                              {field.label}
                            </label>
                            <select
                              value={currentMaterial.liftingPullingMechanismsSpecs[field.name] || ""}
                              onChange={(e) =>
                                setCurrentMaterial((prev) => ({
                                  ...prev,
                                  liftingPullingMechanismsSpecs: {
                                    ...prev.liftingPullingMechanismsSpecs,
                                    [field.name]: e.target.value,
                                  },
                                }))
                              }
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="">{field.placeholder}</option>
                              {field.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <Input
                            key={field.name}
                            label={field.label}
                            type={field.type || "text"}
                            value={currentMaterial.liftingPullingMechanismsSpecs[field.name] || ""}
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
                        )
                      )
                    )}
                  </div>
                </div>
              )}

              <div>
                <h5 className="text-sm font-semibold text-slate-200 mb-3">Quantity & Quality</h5>
                <div className="grid grid-cols-2 gap-4">
                  {renderCommonFields("liftingPullingMechanisms")}
                </div>
              </div>
            </div>
          )}

          {specModalType === "electricalAutomation" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 text-left mb-2 text-left">
                  Component Category
                </label>
                <select
                  value={selectedSubCategory || ""}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Category</option>
                  {getAllSubCategories("electricalAutomation").map((category) => (
                    <option key={category} value={category}>
                      {getSubCategoryLabel("electricalAutomation", category)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSubCategory && (
                <div>
                  <h5 className="text-sm font-semibold text-slate-200 mb-3">
                    {getSubCategoryLabel("electricalAutomation", selectedSubCategory)} Specifications
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    {getSubFieldsForCategory("electricalAutomation", selectedSubCategory)?.fields?.map(
                      (field) => (
                        field.type === "select" ? (
                          <div key={field.name}>
                            <label className="block text-sm font-medium text-slate-900 text-left mb-1 text-left">
                              {field.label}
                            </label>
                            <select
                              value={currentMaterial.electricalAutomationSpecs[field.name] || ""}
                              onChange={(e) =>
                                setCurrentMaterial((prev) => ({
                                  ...prev,
                                  electricalAutomationSpecs: {
                                    ...prev.electricalAutomationSpecs,
                                    [field.name]: e.target.value,
                                  },
                                }))
                              }
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="">{field.placeholder}</option>
                              {field.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <Input
                            key={field.name}
                            label={field.label}
                            type={field.type || "text"}
                            value={currentMaterial.electricalAutomationSpecs[field.name] || ""}
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
                        )
                      )
                    )}
                  </div>
                </div>
              )}

              <div>
                <h5 className="text-sm font-semibold text-slate-200 mb-3">Quantity & Quality</h5>
                <div className="grid grid-cols-2 gap-4">
                  {renderCommonFields("electricalAutomation")}
                </div>
              </div>
            </div>
          )}

          {specModalType === "safetyMaterials" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 text-left mb-2 text-left">
                  Safety Material Type
                </label>
                <select
                  value={selectedSubCategory || ""}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Type</option>
                  {getAllSubCategories("safetyMaterials").map((category) => (
                    <option key={category} value={category}>
                      {getSubCategoryLabel("safetyMaterials", category)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSubCategory && (
                <div>
                  <h5 className="text-sm font-semibold text-slate-200 mb-3">
                    {getSubCategoryLabel("safetyMaterials", selectedSubCategory)} Details
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    {getSubFieldsForCategory("safetyMaterials", selectedSubCategory)?.fields?.map(
                      (field) => (
                        field.type === "select" ? (
                          <div key={field.name}>
                            <label className="block text-sm font-medium text-slate-900 text-left mb-1 text-left">
                              {field.label}
                            </label>
                            <select
                              value={currentMaterial.safetyMaterialsSpecs[field.name] || ""}
                              onChange={(e) =>
                                setCurrentMaterial((prev) => ({
                                  ...prev,
                                  safetyMaterialsSpecs: {
                                    ...prev.safetyMaterialsSpecs,
                                    [field.name]: e.target.value,
                                  },
                                }))
                              }
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="">{field.placeholder}</option>
                              {field.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <Input
                            key={field.name}
                            label={field.label}
                            type={field.type || "text"}
                            value={currentMaterial.safetyMaterialsSpecs[field.name] || ""}
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
                      )
                    )}
                  </div>
                </div>
              )}

              <div>
                <h5 className="text-sm font-semibold text-slate-200 mb-3">Quantity & Quality</h5>
                <div className="grid grid-cols-2 gap-4">
                  {renderCommonFields("safetyMaterials")}
                </div>
              </div>
            </div>
          )}

          {specModalType === "surfacePrepPainting" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 text-left mb-2 text-left">
                  Painting Process
                </label>
                <select
                  value={selectedSubCategory || ""}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Process</option>
                  {getAllSubCategories("surfacePrepPainting").map((category) => (
                    <option key={category} value={category}>
                      {getSubCategoryLabel("surfacePrepPainting", category)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSubCategory && (
                <div>
                  <h5 className="text-sm font-semibold text-slate-200 mb-3">
                    {getSubCategoryLabel("surfacePrepPainting", selectedSubCategory)} Specifications
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    {getSubFieldsForCategory("surfacePrepPainting", selectedSubCategory)?.fields?.map(
                      (field) => (
                        field.type === "select" ? (
                          <div key={field.name}>
                            <label className="block text-sm font-medium text-slate-900 text-left mb-1 text-left">
                              {field.label}
                            </label>
                            <select
                              value={currentMaterial.surfacePrepPaintingSpecs[field.name] || ""}
                              onChange={(e) =>
                                setCurrentMaterial((prev) => ({
                                  ...prev,
                                  surfacePrepPaintingSpecs: {
                                    ...prev.surfacePrepPaintingSpecs,
                                    [field.name]: e.target.value,
                                  },
                                }))
                              }
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="">{field.placeholder}</option>
                              {field.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <Input
                            key={field.name}
                            label={field.label}
                            type={field.type || "text"}
                            value={currentMaterial.surfacePrepPaintingSpecs[field.name] || ""}
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
                        )
                      )
                    )}
                  </div>
                </div>
              )}

              <div>
                <h5 className="text-sm font-semibold text-slate-200 mb-3">Quantity & Quality</h5>
                <div className="grid grid-cols-2 gap-4">
                  {renderCommonFields("surfacePrepPainting")}
                </div>
              </div>
            </div>
          )}

          {specModalType === "fabricationConsumables" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 text-left mb-2 text-left">
                  Consumable Type
                </label>
                <select
                  value={selectedSubCategory || ""}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Type</option>
                  {getAllSubCategories("fabricationConsumables").map((category) => (
                    <option key={category} value={category}>
                      {getSubCategoryLabel("fabricationConsumables", category)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSubCategory && (
                <div>
                  <h5 className="text-sm font-semibold text-slate-200 mb-3">
                    {getSubCategoryLabel("fabricationConsumables", selectedSubCategory)} Details
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    {getSubFieldsForCategory("fabricationConsumables", selectedSubCategory)?.fields?.map(
                      (field) => (
                        field.type === "select" ? (
                          <div key={field.name}>
                            <label className="block text-sm font-medium text-slate-900 text-left mb-1 text-left">
                              {field.label}
                            </label>
                            <select
                              value={currentMaterial.fabricationConsumablesSpecs[field.name] || ""}
                              onChange={(e) =>
                                setCurrentMaterial((prev) => ({
                                  ...prev,
                                  fabricationConsumablesSpecs: {
                                    ...prev.fabricationConsumablesSpecs,
                                    [field.name]: e.target.value,
                                  },
                                }))
                              }
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="">{field.placeholder}</option>
                              {field.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <Input
                            key={field.name}
                            label={field.label}
                            type={field.type || "text"}
                            value={currentMaterial.fabricationConsumablesSpecs[field.name] || ""}
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
                        )
                      )
                    )}
                  </div>
                </div>
              )}

              <div>
                <h5 className="text-sm font-semibold text-slate-200 mb-3">Quantity & Quality</h5>
                <div className="grid grid-cols-2 gap-4">
                  {renderCommonFields("fabricationConsumables")}
                </div>
              </div>
            </div>
          )}

          {specModalType === "hardwareMisc" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 text-left mb-2 text-left">
                  Hardware Type
                </label>
                <select
                  value={selectedSubCategory || ""}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Type</option>
                  {getAllSubCategories("hardwareMisc").map((category) => (
                    <option key={category} value={category}>
                      {getSubCategoryLabel("hardwareMisc", category)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSubCategory && (
                <div>
                  <h5 className="text-sm font-semibold text-slate-200 mb-3">
                    {getSubCategoryLabel("hardwareMisc", selectedSubCategory)} Details
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    {getSubFieldsForCategory("hardwareMisc", selectedSubCategory)?.fields?.map(
                      (field) => (
                        field.type === "select" ? (
                          <div key={field.name}>
                            <label className="block text-sm font-medium text-slate-900 text-left mb-1 text-left">
                              {field.label}
                            </label>
                            <select
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
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="">{field.placeholder}</option>
                              {field.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <Input
                            key={field.name}
                            label={field.label}
                            type={field.type || "text"}
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
                      )
                    )}
                  </div>
                </div>
              )}

              <div>
                <h5 className="text-sm font-semibold text-slate-200 mb-3">Quantity & Quality</h5>
                <div className="grid grid-cols-2 gap-4">
                  {renderCommonFields("hardwareMisc")}
                </div>
              </div>
            </div>
          )}

          {specModalType === "documentationMaterials" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 text-left mb-2 text-left">
                  Documentation Type
                </label>
                <select
                  value={selectedSubCategory || ""}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Type</option>
                  {getAllSubCategories("documentationMaterials").map((category) => (
                    <option key={category} value={category}>
                      {getSubCategoryLabel("documentationMaterials", category)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSubCategory && (
                <div>
                  <h5 className="text-sm font-semibold text-slate-200 mb-3">
                    {getSubCategoryLabel("documentationMaterials", selectedSubCategory)} Details
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    {getSubFieldsForCategory("documentationMaterials", selectedSubCategory)?.fields?.map(
                      (field) => (
                        field.type === "select" ? (
                          <div key={field.name}>
                            <label className="block text-sm font-medium text-slate-900 text-left mb-1 text-left">
                              {field.label}
                            </label>
                            <select
                              value={currentMaterial.documentationMaterialsSpecs[field.name] || ""}
                              onChange={(e) =>
                                setCurrentMaterial((prev) => ({
                                  ...prev,
                                  documentationMaterialsSpecs: {
                                    ...prev.documentationMaterialsSpecs,
                                    [field.name]: e.target.value,
                                  },
                                }))
                              }
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="">{field.placeholder}</option>
                              {field.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : field.type === "date" ? (
                          <Input
                            key={field.name}
                            label={field.label}
                            type="date"
                            value={currentMaterial.documentationMaterialsSpecs[field.name] || ""}
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
                        ) : (
                          <Input
                            key={field.name}
                            label={field.label}
                            type={field.type || "text"}
                            value={currentMaterial.documentationMaterialsSpecs[field.name] || ""}
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
                        )
                      )
                    )}
                  </div>
                </div>
              )}

              <div>
                <h5 className="text-sm font-semibold text-slate-200 mb-3">Quantity & Quality</h5>
                <div className="grid grid-cols-2 gap-4">
                  {renderCommonFields("documentationMaterials")}
                </div>
              </div>

              <div className="bg-white p-3 rounded border border-slate-200 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-900 text-left mb-2 text-left">
                    Upload Documents
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                    onChange={handleDocumentationFileUpload}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm cursor-pointer hover:border-purple-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Supported: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT
                  </p>
                </div>
                {currentMaterial.documentationUploadedFiles &&
                  currentMaterial.documentationUploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-900">
                        Uploaded Files (
                        {currentMaterial.documentationUploadedFiles.length}):
                      </p>
                      {currentMaterial.documentationUploadedFiles.map(
                        (file, index) => (
                          <div
                            key={index}
                            className="flex items-center text-xs justify-between bg-purple-50 p-2 rounded border border-purple-200"
                          >
                            <div className="flex-1 truncate">
                              <p className="text-xs text-slate-900 truncate">
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
            </div>
          )}

          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200/50 sticky bottom-0 bg-gradient-to-b from-transparent to-white/95 backdrop-blur-sm -mx-8 px-8 pb-8">
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
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-sm py-3"
            >
              <Save size={18} className="stroke-2" />
              Save & Add to Table
            </Button>
            <Button
              type="button"
              onClick={closeSpecModal}
              variant="secondary"
              className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-all duration-300 text-sm py-3"
            >
              <X size={18} className="stroke-2" />
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)}>
        <div className=" p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center text-xs justify-between mb-4">
            <h3 className="text-xl font-semibold ">
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
                <h4 className="text-sm font-semibold text-slate-900 mb-3 text-left border-b border-slate-200 pb-2">
                  Basic Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-slate-400">Material Name</p>
                    <p className=" font-medium">
                      {viewingMaterial.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Category</p>
                    <p className="">
                      {viewingMaterial.category || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Description</p>
                    <p className="">
                      {viewingMaterial.description || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Quantity</p>
                    <p className=" font-medium">
                      {viewingMaterial.quantity} {viewingMaterial.unit}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3 text-left border-b border-slate-200 pb-2">
                  Assignment & Source
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-slate-400">Source</p>
                    <p className=" capitalize">
                      {viewingMaterial.source || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Assignee</p>
                    <p className="">
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
                    <p className="">
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
                  <h4 className="text-sm font-semibold text-slate-900 mb-3 text-left border-b border-slate-200 pb-2">
                    Material Specifications
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {viewingMaterial.steelSection && (
                      <>
                        <div>
                          <p className="text-slate-400">Steel Section</p>
                          <p className="">
                            {viewingMaterial.steelSection}
                          </p>
                        </div>
                        {viewingMaterial.steelSize && (
                          <div>
                            <p className="text-slate-400">Size</p>
                            <p className="">
                              {viewingMaterial.steelSize}
                            </p>
                          </div>
                        )}
                        {viewingMaterial.steelLength && (
                          <div>
                            <p className="text-slate-400">Length</p>
                            <p className="">
                              {viewingMaterial.steelLength} mm
                            </p>
                          </div>
                        )}
                        {viewingMaterial.steelTolerance && (
                          <div>
                            <p className="text-slate-400">Tolerance</p>
                            <p className="">
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
                          <p className="">
                            {viewingMaterial.plateType}
                          </p>
                        </div>
                        {viewingMaterial.plateThickness && (
                          <div>
                            <p className="text-slate-400">Thickness</p>
                            <p className="">
                              {viewingMaterial.plateThickness} mm
                            </p>
                          </div>
                        )}
                        {viewingMaterial.plateLength && (
                          <div>
                            <p className="text-slate-400">Length</p>
                            <p className="">
                              {viewingMaterial.plateLength} mm
                            </p>
                          </div>
                        )}
                        {viewingMaterial.plateWidth && (
                          <div>
                            <p className="text-slate-400">Width</p>
                            <p className="">
                              {viewingMaterial.plateWidth} mm
                            </p>
                          </div>
                        )}
                        {viewingMaterial.plateSurfaceFinish && (
                          <div>
                            <p className="text-slate-400">Surface Finish</p>
                            <p className="">
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
                          <p className="">
                            {viewingMaterial.materialGrade}
                          </p>
                        </div>
                        {viewingMaterial.grade && (
                          <div>
                            <p className="text-slate-400">Grade Spec</p>
                            <p className="">
                              {viewingMaterial.grade}
                            </p>
                          </div>
                        )}
                        {viewingMaterial.gradeCertificationRequired && (
                          <div>
                            <p className="text-slate-400">Certification</p>
                            <p className="">
                              {viewingMaterial.gradeCertificationRequired}
                            </p>
                          </div>
                        )}
                        {viewingMaterial.gradeTestingStandards && (
                          <div>
                            <p className="text-slate-400">Testing Standards</p>
                            <p className="">
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
                          <p className="">
                            {viewingMaterial.fastenerType}
                          </p>
                        </div>
                        {viewingMaterial.fastenerSize && (
                          <div>
                            <p className="text-slate-400">Size</p>
                            <p className="">
                              M{viewingMaterial.fastenerSize}
                            </p>
                          </div>
                        )}
                        {viewingMaterial.fastenerQuantityPerUnit && (
                          <div>
                            <p className="text-slate-400">Qty Per Unit</p>
                            <p className="">
                              {viewingMaterial.fastenerQuantityPerUnit}
                            </p>
                          </div>
                        )}
                        {viewingMaterial.fastenerPlating && (
                          <div>
                            <p className="text-slate-400">Plating/Grade</p>
                            <p className="">
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

          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
            <Button
              type="button"
              onClick={() => {
                editMaterial(viewingMaterial);
                setViewModalOpen(false);
              }}
              className="flex-1 flex items-center text-xs justify-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Edit2 size={16} />
              Edit Material
            </Button>
            <Button
              type="button"
              onClick={() => setViewModalOpen(false)}
              variant="secondary"
              className="flex-1 flex items-center text-xs justify-center gap-2"
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
