import React from "react";
import { CheckCircle } from "lucide-react";
import Input from "../../../ui/Input";
import Select from "../../../ui/Select";
import FormSection from "../shared/FormSection";
import FormRow from "../shared/FormRow";
import AssigneeField from "../shared/AssigneeField";
import { useFormData, useSalesOrderContext } from "../hooks";

export default function Step8_Delivery({ readOnly = false }) {
  const { formData, updateField, setNestedField } = useFormData();
  const { state } = useSalesOrderContext();

  return (
    <div className="space-y-3">
      <AssigneeField
        stepType="delivery"
        formData={state.formData}
        updateField={updateField}
        employees={state.employees}
      />
      <FormSection
        title="Delivery & Handover"
        subtitle="Finalize delivery and project completion"
        icon={CheckCircle}
      >
        <div className="space-y-3">
          {/* Final Delivery Info */}
          <div>
            <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">Final Delivery</h5>
            <FormRow cols={2}>
              <Input
                label="Actual Delivery Date"
                type="date"
                value={formData.deliveryTerms?.deliverySchedule || ""}
                onChange={(e) =>
                  setNestedField("deliveryTerms", "deliverySchedule", e.target.value)
                }
                disabled={readOnly}
              />
              <Input
                label="Delivered To (Name)"
                value={formData.customerContact || ""}
                onChange={(e) =>
                  updateField("customerContact", e.target.value)
                }
                placeholder="Enter recipient name"
                disabled={readOnly}
              />
            </FormRow>
          </div>

          {/* Installation Status */}
          <div>
            <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">Installation Status</h5>
            <FormRow cols={2}>
              <Input
                label="Installation Completed"
                value={formData.deliveryTerms?.installationRequired || ""}
                onChange={(e) =>
                  setNestedField("deliveryTerms", "installationRequired", e.target.value)
                }
                placeholder="e.g., Yes, completed"
                disabled={readOnly}
              />
              <Input
                label="Site Commissioning Completed"
                value={formData.deliveryTerms?.siteCommissioning || ""}
                onChange={(e) =>
                  setNestedField("deliveryTerms", "siteCommissioning", e.target.value)
                }
                placeholder="e.g., Yes, signed off"
                disabled={readOnly}
              />
            </FormRow>
          </div>

          {/* Warranty & Compliance */}
          <div>
            <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">Warranty & Compliance</h5>
            <Input
              label="Warranty Terms Acceptance"
              value={formData.warrantySupport?.warrantyPeriod || ""}
              onChange={(e) =>
                setNestedField("warrantySupport", "warrantyPeriod", e.target.value)
              }
              placeholder="e.g., 2 years warranty accepted"
              disabled={readOnly}
            />
          </div>

          {/* Project Completion */}
          <div>
            <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">Project Completion</h5>
            <Input
              label="Completion Remarks"
              value={formData.projectRequirements?.acceptanceCriteria || ""}
              onChange={(e) =>
                setNestedField("projectRequirements", "acceptanceCriteria", e.target.value)
              }
              placeholder="Enter any final remarks or sign-off notes"
              disabled={readOnly}
            />
          </div>

          {/* Internal Info */}
          <div>
            <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">Internal Project Info</h5>
            <FormRow cols={2}>
              <Input
                label="Project Manager"
                value={formData.internalInfo?.projectManager || ""}
                onChange={(e) =>
                  setNestedField("internalInfo", "projectManager", e.target.value)
                }
                placeholder="Enter project manager name"
                disabled={readOnly}
              />
              <Input
                label="Production Supervisor"
                value={formData.internalInfo?.productionSupervisor || ""}
                onChange={(e) =>
                  setNestedField("internalInfo", "productionSupervisor", e.target.value)
                }
                placeholder="Enter production supervisor name"
                disabled={readOnly}
              />
            </FormRow>
          </div>

          {/* Delivery Assignment */}
          <div className="border-t border-slate-200 pt-4">
            <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">Delivery Assignment</h5>
            <FormRow cols={1}>
              <Select
                label="Assign Delivery to Employee"
                options={(Array.isArray(state.employees) ? state.employees : []).map((emp) => ({
                  label: `${emp.firstName} ${emp.lastName} (${emp.designation})`,
                  value: emp.id.toString(),
                }))}
                value={formData.deliveryAssignedTo?.toString() || ""}
                onChange={(e) => updateField("deliveryAssignedTo", e.target.value)}
                placeholder="Select an employee for delivery..."
                disabled={readOnly}
              />
            </FormRow>
          </div>
        </div>
      </FormSection>
    </div>
  );
}
