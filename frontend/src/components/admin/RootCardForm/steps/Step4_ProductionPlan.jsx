import React, { useCallback, useMemo, useState } from "react";
import { Zap, AlertCircle, Plus, Trash2 } from "lucide-react";
import Input from "../../../ui/Input";
import FormSection from "../shared/FormSection";
import FormRow from "../shared/FormRow";
import AssigneeField from "../shared/AssigneeField";
import Button from "../../../ui/Button";
import { useFormData, useRootCardContext } from "../hooks";
import AddProductionPhaseModal from "./AddProductionPhaseModal";

export default function Step4_ProductionPlan({ readOnly = false }) {
  const { formData, updateField } = useFormData();
  const { state } = useRootCardContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const availablePhases = useMemo(() => {
    return Array.isArray(formData.availablePhases) ? formData.availablePhases : [];
  }, [formData.availablePhases]);
  const selectedPhases = useMemo(() => formData.selectedPhases || {}, [formData.selectedPhases]);

  const handlePhaseToggle = useCallback((phaseName) => {
    const newPhases = { ...selectedPhases };
    if (newPhases[phaseName]) {
      delete newPhases[phaseName];
    } else {
      newPhases[phaseName] = true;
    }
    updateField("selectedPhases", newPhases);
  }, [selectedPhases, updateField]);

  const handleDeletePhase = useCallback((phaseName, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Remove from available phases
    const updatedAvailable = availablePhases.filter(p => p.name !== phaseName);
    updateField("availablePhases", updatedAvailable);
    
    // Remove from selected phases if it was selected
    if (selectedPhases[phaseName]) {
      const newSelected = { ...selectedPhases };
      delete newSelected[phaseName];
      updateField("selectedPhases", newSelected);
    }
  }, [availablePhases, selectedPhases, updateField]);

  const handleAddPhaseSuccess = (newPhase) => {
    // Add to local available phases for this root card
    const updatedAvailable = [...availablePhases, newPhase];
    updateField("availablePhases", updatedAvailable);
    
    // Auto-select the newly added phase
    const newSelected = { ...selectedPhases, [newPhase.name]: true };
    updateField("selectedPhases", newSelected);
  };

  const content = useMemo(() => (
    <div className="space-y-6">
      <AssigneeField
        stepType="productionPlan"
        formData={state.formData}
        updateField={updateField}
        employees={state.employees}
        readOnly={readOnly}
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
                disabled={readOnly}
              />
              <Input
                label="Estimated Completion Date"
                type="date"
                value={formData.estimatedCompletionDate || ""}
                onChange={(e) =>
                  updateField("estimatedCompletionDate", e.target.value)
                }
                disabled={readOnly}
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
                disabled={readOnly}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-50 disabled:text-slate-500"
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
            <div className="flex items-center justify-between mb-3">
              <div>
                <h5 className="text-sm font-semibold text-slate-900 text-left">
                  Production Phases
                </h5>
                <p className="text-sm text-slate-600">
                  {availablePhases.length === 0 
                    ? "No phases added yet. Click 'Add Phase' to start." 
                    : "Select the production phases required for this project"}
                </p>
              </div>
              {!readOnly && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Phase
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availablePhases.map((phase, index) => (
                <div key={phase.id || index} className="relative group">
                  <label
                    className={`flex flex-col p-3 border border-slate-200 rounded-lg bg-white cursor-pointer hover:bg-purple-50 hover:border-purple-400 transition-colors ${readOnly ? 'pointer-events-none opacity-80' : ''} ${selectedPhases[phase.name] ? 'border-purple-500 bg-purple-50' : ''}`}
                  >
                    <div className="flex items-center text-xs gap-2">
                      <input
                        type="checkbox"
                        checked={selectedPhases[phase.name] || false}
                        onChange={() => !readOnly && handlePhaseToggle(phase.name)}
                        disabled={readOnly}
                        className="w-4 h-4 text-purple-600 bg-white border-slate-300 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <span className="text-sm font-bold text-slate-900 text-left">
                        {phase.name}
                      </span>
                    </div>
                    {phase.hourly_rate > 0 && (
                      <span className="text-xs text-slate-500 mt-1 ml-6">
                        Rate: ₹{phase.hourly_rate}/hr
                      </span>
                    )}
                  </label>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={(e) => handleDeletePhase(phase.name, e)}
                      className="absolute -top-1.5 -right-1.5 p-1 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-full shadow-sm transition-all z-20 group-hover:text-red-500"
                      title="Delete Phase"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Production Dashboard Banner */}
          
        </div>
      </FormSection>

      <AddProductionPhaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleAddPhaseSuccess}
      />
    </div>
  ), [
    state.formData,
    state.employees,
    formData.productionStartDate,
    formData.estimatedCompletionDate,
    formData.procurementStatus,
    selectedPhases,
    readOnly,
    handlePhaseToggle,
    handleDeletePhase,
    updateField,
    availablePhases,
    isModalOpen
  ]);

  return content;
}

