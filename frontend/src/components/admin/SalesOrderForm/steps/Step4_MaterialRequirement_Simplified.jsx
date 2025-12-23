import React, { useState } from "react";
import { Package, Plus, Trash2, Edit2 } from "lucide-react";
import Input from "../../../ui/Input";
import FormSection from "../shared/FormSection";
import AssigneeField from "../shared/AssigneeField";
import Button from "../../../ui/Button";
import { useFormData, useSalesOrderContext } from "../hooks";

const MATERIAL_TYPES = [
  { id: "steelSections", label: "Steel Sections", category: "Structural" },
  { id: "plates", label: "Plates", category: "Structural" },
  { id: "fasteners", label: "Fasteners & Hardware", category: "Hardware" },
  { id: "machinedParts", label: "Machined Parts", category: "Components" },
  { id: "components", label: "Mechanical Components", category: "Components" },
  { id: "electrical", label: "Electrical & Automation", category: "Electrical" },
  { id: "safety", label: "Safety Materials", category: "Safety" },
  { id: "consumables", label: "Consumables & Paint", category: "Consumables" },
  { id: "documentation", label: "Documentation Materials", category: "Docs" },
];

export default function Step4_MaterialRequirement() {
  const { formData, updateField } = useFormData();
  const { state } = useSalesOrderContext();
  const [materials, setMaterials] = useState(formData.materials || []);
  const [selectedMaterials, setSelectedMaterials] = useState({});
  const [quantities, setQuantities] = useState({});

  const handleMaterialToggle = (materialId) => {
    setSelectedMaterials(prev => ({
      ...prev,
      [materialId]: !prev[materialId]
    }));
  };

  const handleQuantityChange = (materialId, value) => {
    setQuantities(prev => ({
      ...prev,
      [materialId]: value
    }));
  };

  const addMaterial = () => {
    const selected = Object.entries(selectedMaterials)
      .filter(([_, isSelected]) => isSelected)
      .map(([materialId]) => {
        const material = MATERIAL_TYPES.find(m => m.id === materialId);
        return {
          id: Date.now() + Math.random(),
          materialId,
          name: material.label,
          category: material.category,
          quantity: quantities[materialId] || "0",
          unit: "Units",
        };
      });

    if (selected.length === 0) {
      alert("Please select at least one material type");
      return;
    }

    setMaterials(prev => [...prev, ...selected]);
    updateField("materials", [...materials, ...selected]);
    
    setSelectedMaterials({});
    setQuantities({});
  };

  const removeMaterial = (id) => {
    const updated = materials.filter(m => m.id !== id);
    setMaterials(updated);
    updateField("materials", updated);
  };

  const categoryGroups = MATERIAL_TYPES.reduce((acc, material) => {
    if (!acc[material.category]) acc[material.category] = [];
    acc[material.category].push(material);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <AssigneeField
        stepType="material_requirement"
        formData={state.formData}
        updateField={updateField}
        employees={state.employees}
      />
      <FormSection
        title="Material Requirement"
        subtitle="Select required materials for this project"
        icon={Package}
      >
        <div className="space-y-6">
          {Object.entries(categoryGroups).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-slate-900 mb-3 text-left">
                {category}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map(material => (
                  <div key={material.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={material.id}
                      checked={selectedMaterials[material.id] || false}
                      onChange={() => handleMaterialToggle(material.id)}
                      className=" w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                    <label 
                      htmlFor={material.id}
                      className="flex-1 cursor-pointer"
                    >
                      <p className="text-sm font-medium text-slate-900 text-left">
                        {material.label}
                      </p>
                      {selectedMaterials[material.id] && (
                        <input
                          type="number"
                          placeholder="Quantity"
                          value={quantities[material.id] || ""}
                          onChange={(e) => handleQuantityChange(material.id, e.target.value)}
                          className="mt-2 w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.1"
                        />
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Button 
            onClick={addMaterial}
            className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add Selected Materials
          </Button>
        </div>
      </FormSection>

      {materials.length > 0 && (
        <FormSection
          title="Required Materials List"
          subtitle="Materials required for this project"
          icon={Package}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="p-2 text-left font-semibold text-slate-900 dark:text-slate-100">
                    Material Type
                  </th>
                  <th className="p-2 text-left font-semibold text-slate-900 dark:text-slate-100">
                    Category
                  </th>
                  <th className="p-2 text-left font-semibold text-slate-900 dark:text-slate-100">
                    Quantity
                  </th>
                  <th className="p-2 text-left font-semibold text-slate-900 dark:text-slate-100">
                    Unit
                  </th>
                  <th className="p-2 text-center font-semibold text-slate-900 dark:text-slate-100">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {materials.map(material => (
                  <tr key={material.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 text-xs">
                    <td className="p-2 text-slate-900 dark:text-slate-100 text-left">
                      {material.name}
                    </td>
                    <td className="p-2 text-slate-600 dark:text-slate-400">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                        {material.category}
                      </span>
                    </td>
                    <td className="p-2 text-slate-900 dark:text-slate-100 text-left">
                      {material.quantity}
                    </td>
                    <td className="p-2 text-slate-600 dark:text-slate-400">
                      {material.unit}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => removeMaterial(material.id)}
                        className="inline-flex items-center justify-center p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              <strong>Note:</strong> Detailed material specifications, quality standards, and advanced requirements will be managed by the Inventory Manager in the Material Specifications Dashboard.
            </p>
          </div>
        </FormSection>
      )}
    </div>
  );
}
