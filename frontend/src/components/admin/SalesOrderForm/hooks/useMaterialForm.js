import { useState } from "react";

const INITIAL_MATERIAL = {
  quantity: "",
  unit: "",
  source: "",
  assignee: "",
  steelSection: "",
  steelSize: "",
  steelLength: "",
  steelTolerance: "",
  ismbBeamSize: "",
  ismbFlangeWidth: "",
  ismbWebThickness: "",
  ismbSectionWeight: "",
  ismcChannelSize: "",
  ismcFlangeWidth: "",
  ismcWebThickness: "",
  rhsSectionType: "",
  rhsDimensions: "",
  rhsThickness: "",
  rhsLength: "",
  angleType: "",
  angleSize: "",
  angleThickness: "",
  flatBarWidth: "",
  flatBarThickness: "",
  roundBarDiameter: "",
  plateType: "",
  plateThickness: "",
  plateLength: "",
  plateWidth: "",
  plateSurfaceFinish: "",
  msThickness: "",
  msLength: "",
  msWidth: "",
  msMaterialGrade: "",
  msWeight: "",
  chequeredThickness: "",
  chequeredLength: "",
  chequeredWidth: "",
  chequeredPatternType: "",
  chequeredMaterialGrade: "",
  baseThickness: "",
  baseLength: "",
  baseWidth: "",
  baseMaterialGrade: "",
  baseMachiningRequired: "",
  materialGrade: "",
  is2062Grade: "",
  is2062CharpyRequired: "",
  is2062MTCRequired: "",
  en8Grade: "",
  en8HeatTreatmentRequired: "",
  en8MachiningRequired: "",
  ss3xxGrade: "",
  ss3xxFinish: "",
  ss3xxCorrosionRequired: "",
  fastenerType: "",
  boltSize: "",
  boltLength: "",
  boltGrade: "",
  boltCoating: "",
  nutWasherSize: "",
  nutWasherType: "",
  nutWasherCoating: "",
  anchorBoltDiameter: "",
  anchorBoltLength: "",
  anchorBoltType: "",
  anchorBoltGrade: "",
  fastenerQuantityPerUnit: "",
  machinedParts: "",
  shaftMaterialGrade: "",
  shaftToleranceClass: "",
  bushMaterialType: "",
  spacerMaterialType: "",
  bracketMaterialType: "",
  bracketMachiningOperations: "",
  flangePCD: "",
  flangeNumberOfHoles: "",
  housingType: "",
  housingMaterialType: "",
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
  rollerBearingType: "",
  bearingNumber: "",
  railBlockType: "",
};

export const useMaterialForm = (onOpenSpecModal, updateField, formData) => {
  const [currentMaterial, setCurrentMaterial] = useState(INITIAL_MATERIAL);
  const [editingDetail, setEditingDetail] = useState(null);

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
      setTimeout(() => onOpenSpecModal(name), 100);
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
    setCurrentMaterial(INITIAL_MATERIAL);
    setEditingDetail(null);
  };

  return {
    currentMaterial,
    setCurrentMaterial,
    editingDetail,
    setEditingDetail,
    handleMaterialChange,
    addMaterial,
    removeMaterial,
    editMaterial,
    updateMaterial,
    resetMaterial,
  };
};
