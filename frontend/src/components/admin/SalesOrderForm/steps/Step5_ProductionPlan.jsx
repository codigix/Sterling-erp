import React, { useState } from "react";
import { Zap, AlertCircle } from "lucide-react";
import Input from "../../../ui/Input";
import FormSection from "../shared/FormSection";
import FormRow from "../shared/FormRow";
import AssigneeField from "../shared/AssigneeField";
import { useFormData, useSalesOrderContext } from "../hooks";

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

export default function Step5_ProductionPlan({ readOnly = false }) {
  const { formData, updateField } = useFormData();
  const { state } = useSalesOrderContext();

  const [selectedPhases, setSelectedPhases] = useState(formData?.selectedPhases || {});

  const handlePhaseToggle = (phase) => {
    setSelectedPhases((prev) => {
      const newPhases = { ...prev };
      if (newPhases[phase]) {
        delete newPhases[phase];
      } else {
        newPhases[phase] = true;
      }
      updateField("selectedPhases", newPhases);
      return newPhases;
    });
  };

  return (
    <div className="space-y-6">
      <AssigneeField
        stepType="production_plan"
        formData={state.formData}
        updateField={updateField}
        employees={state.employees}
      />
      <FormSection
        title="Production Plan"
        subtitle="Define manufacturing timeline and production phases"
        icon={Zap}
      >
        <div className="space-y-6">
          {/* Manufacturing Timeline */}
          <div>
            <h5 className="text-sm font-semibold text-slate-900 mb-3 text-left">
              Manufacturing Timeline
            </h5>
            <FormRow cols={2}>
              <Input
                label="Production Start Date"
                type="date"
                value={formData.productionStartDate || ""}
                onChange={(e) =>
                  updateField("productionStartDate", e.target.value)
                }
              />
              <Input
                label="Estimated Completion Date"
                type="date"
                value={formData.estimatedCompletionDate || ""}
                onChange={(e) =>
                  updateField("estimatedCompletionDate", e.target.value)
                }
              />
            </FormRow>
          </div>

          {/* Material Procurement Status */}
          <div className="pt-4">
            <h5 className="text-sm font-semibold text-slate-900 mb-3 text-left">
              Material Procurement Status
            </h5>
            <div>
              <label className="block text-sm font-medium text-slate-900 text-left mb-2">
                Procurement Status
              </label>
              <select
                value={formData.procurementStatus || ""}
                onChange={(e) =>
                  updateField("procurementStatus", e.target.value)
                }
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Pending Approval">Pending Approval</option>
              </select>
            </div>
          </div>

          {/* Production Phases */}
          <div className="pt-4 border-t border-slate-200">
            <h5 className="text-sm font-semibold text-slate-900 mb-3 text-left">
              Production Phases
            </h5>
            <p className="text-sm text-slate-600 mb-4">
              Select the production phases required for this project
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.keys(PRODUCTION_PHASES).map((phase) => (
                <label
                  key={phase}
                  className="flex items-center text-xs gap-2 p-3 border border-slate-200 rounded-lg bg-white cursor-pointer hover:bg-purple-50 hover:border-purple-400 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedPhases[phase] || false}
                    onChange={() => handlePhaseToggle(phase)}
                    className="w-4 h-4 text-purple-600 bg-white border-slate-300 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-900 text-left">
                    {phase}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Production Dashboard Banner */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                Detailed Production Planning
              </p>
              <p className="text-sm text-blue-700">
                Go to the Production Manager Dashboard to configure detailed production stages, sub-tasks, requirements, and schedules for each phase selected above.
              </p>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );
}
