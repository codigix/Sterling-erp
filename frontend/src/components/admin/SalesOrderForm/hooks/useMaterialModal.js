import { useState } from "react";
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
} from "../constants";

export const useMaterialModal = (setCurrentMaterial) => {
  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [specModalType, setSpecModalType] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingMaterial, setViewingMaterial] = useState(null);

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

  return {
    specModalOpen,
    setSpecModalOpen,
    specModalType,
    setSpecModalType,
    viewModalOpen,
    setViewModalOpen,
    viewingMaterial,
    setViewingMaterial,
    openSpecModal,
    closeSpecModal,
    getSpecsForType,
    handleDetailSubmit,
  };
};
