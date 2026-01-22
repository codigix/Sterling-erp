import materialDetailsConfig from "../config/materialDetailsConfig.json";
import materialSubFieldsConfig from "../config/materialSubFieldsConfig.json";

export const getDetailRowConfig = (materialTypeId) => {
  return materialDetailsConfig.materialTypes.find(
    (mt) => mt.id === materialTypeId
  );
};

export const formatDetailDisplay = (row, materialTypeId) => {
  const config = getDetailRowConfig(materialTypeId);
  if (!config) return "-";

  if (config.type === "simple" && config.displayFields) {
    return config.displayFields
      .map((field) => {
        const value = row[field.key];
        if (!value) return null;
        return field.format.replace("{value}", value);
      })
      .filter(Boolean)
      .join(" | ");
  }

  if (config.type === "complex" && config.excludeFields) {
    return Object.entries(row)
      .filter(([key]) => !config.excludeFields.includes(key))
      .map(([key, value]) => value && `${key}: ${value}`)
      .filter(Boolean)
      .join(" | ");
  }

  return "-";
};

export const getSpecsKeyName = (materialTypeId) => {
  return `${materialTypeId}Specs`;
};

export const getQuantityKeyName = (materialTypeId) => {
  return `${materialTypeId}Quantity`;
};

export const getQualityKeyName = (materialTypeId) => {
  return `${materialTypeId}Quality`;
};

export const buildSpecsObject = (row, materialTypeId) => {
  const config = getDetailRowConfig(materialTypeId);
  if (!config || config.type !== "complex") return {};

  return Object.entries(row)
    .filter(([key]) => !config.excludeFields.includes(key))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
};

export const getModalTitle = (materialTypeId) => {
  return (
    materialDetailsConfig.modalTitles[materialTypeId] || "Specifications"
  );
};

export const getMaterialTypeLabel = (materialTypeId) => {
  const config = getDetailRowConfig(materialTypeId);
  return config?.displayLabel || "-";
};

export const getDetailRowEditData = (row, materialTypeId) => {
  const config = getDetailRowConfig(materialTypeId);
  if (!config) return {};

  const quantityField = config.quantityField;
  const qualityField = config.qualityField;

  if (config.type === "simple" && config.displayFields) {
    const editData = { [materialTypeId]: row.selection };
    config.displayFields.forEach((field) => {
      editData[field.key] = row[field.key];
    });
    editData[quantityField] = row[quantityField];
    editData[qualityField] = row[qualityField];
    return editData;
  }

  if (config.type === "complex") {
    const editData = {
      [materialTypeId]: row.selection,
      [getSpecsKeyName(materialTypeId)]: buildSpecsObject(row, materialTypeId),
      [quantityField]: row[quantityField],
      [qualityField]: row[qualityField],
    };
    return editData;
  }

  return {};
};

export const getSubFieldsForMaterialType = (materialTypeId) => {
  return materialSubFieldsConfig[materialTypeId] || {};
};

export const getSubFieldsForCategory = (materialTypeId, categoryName) => {
  const subFields = getSubFieldsForMaterialType(materialTypeId);
  return subFields[categoryName] || null;
};

export const getAllSubCategories = (materialTypeId) => {
  const subFields = getSubFieldsForMaterialType(materialTypeId);
  return Object.keys(subFields);
};

export const getSubCategoryLabel = (materialTypeId, categoryName) => {
  const subCategory = getSubFieldsForCategory(materialTypeId, categoryName);
  return subCategory?.label || categoryName;
};
