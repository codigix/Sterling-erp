import React from "react";
import { FileText, Edit2, Trash2 } from "lucide-react";

const getMaterialType = (material) => {
  const typeMap = {
    steelSection: "Steel Sections",
    plateType: "Plates",
    materialGrade: "Material Grades",
    fastenerType: "Fasteners",
    machinedParts: "Machined Parts",
    rollerMovementComponents: "Roller/Movement",
    liftingPullingMechanisms: "Lifting/Pulling",
    electricalAutomation: "Electrical/Automation",
    safetyMaterials: "Safety Materials",
    surfacePrepPainting: "Surface Prep/Paint",
    fabricationConsumables: "Fabrication Consumables",
    hardwareMisc: "Hardware/Misc",
    documentationMaterials: "Documentation",
  };

  for (const [key, label] of Object.entries(typeMap)) {
    if (material[key]) {
      return label;
    }
  }
  return "-";
};

const getMaterialName = (material) => {
  return (
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
    "-"
  );
};

export default function MaterialTable({
  materials = [],
  employees = [],
  onView,
  onEdit,
  onDelete,
  onAssigneeChange,
}) {
  if (materials.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h5 className="text-lg font-semibold text-slate-200 mb-4">
        Material Requirements Table
      </h5>
      <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-600 bg-slate-900">
              <th className="p-2 text-left text-slate-300 font-medium">
                Material Name
              </th>
              <th className="p-2 text-left text-slate-300 font-medium">
                Type
              </th>
              <th className="p-2 text-left text-slate-300 font-medium">
                Qty
              </th>
              <th className="p-2 text-left text-slate-300 font-medium">
                Unit
              </th>
              <th className="p-2 text-left text-slate-300 font-medium">
                Source
              </th>
              <th className="p-2 text-left text-slate-300 font-medium">
                Assignee
              </th>
              <th className="p-2 text-left text-slate-300 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material) => (
              <tr
                key={material.id}
                className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
              >
                <td className="p-2 text-left text-slate-100 font-medium">
                  {getMaterialName(material)}
                </td>
                <td className="p-2 text-left">
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                    {getMaterialType(material)}
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
                    onChange={(e) =>
                      onAssigneeChange(material.id, e.target.value)
                    }
                    className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Assignee</option>
                    {employees.map((emp) => (
                      <option key={emp._id || emp.id} value={emp._id || emp.id}>
                        {emp.name || emp.employeeName}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2 text-left">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onView(material)}
                      className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors"
                      title="View Details"
                    >
                      <FileText size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(material)}
                      className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(material.id)}
                      className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
