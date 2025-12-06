import React from "react";
import { CheckCircle } from "lucide-react";
import Input from "../../../ui/Input";
import FormSection from "../shared/FormSection";
import FormRow from "../shared/FormRow";
import { useFormData } from "../hooks";

export default function Step8_Delivery() {
  const { formData, updateField, setNestedField } = useFormData();

  return (
    <div className="space-y-6">
      <FormSection
        title="Delivery & Handover"
        subtitle="Finalize delivery and project completion"
        icon={CheckCircle}
      >
        <div className="space-y-6">
          {/* Final Delivery Info */}
          <div>
            <h5 className="text-sm font-semibold text-slate-300 mb-3">Final Delivery</h5>
            <FormRow cols={2}>
              <Input
                label="Actual Delivery Date"
                type="date"
                value={formData.deliveryTerms?.deliverySchedule || ""}
                onChange={(e) =>
                  setNestedField("deliveryTerms", "deliverySchedule", e.target.value)
                }
              />
              <Input
                label="Delivered To (Name)"
                value={formData.customerContact || ""}
                onChange={(e) =>
                  updateField("customerContact", e.target.value)
                }
                placeholder="Enter recipient name"
              />
            </FormRow>
          </div>

          {/* Installation Status */}
          <div>
            <h5 className="text-sm font-semibold text-slate-300 mb-3">Installation Status</h5>
            <FormRow cols={2}>
              <Input
                label="Installation Completed"
                value={formData.deliveryTerms?.installationRequired || ""}
                onChange={(e) =>
                  setNestedField("deliveryTerms", "installationRequired", e.target.value)
                }
                placeholder="e.g., Yes, completed"
              />
              <Input
                label="Site Commissioning Completed"
                value={formData.deliveryTerms?.siteCommissioning || ""}
                onChange={(e) =>
                  setNestedField("deliveryTerms", "siteCommissioning", e.target.value)
                }
                placeholder="e.g., Yes, signed off"
              />
            </FormRow>
          </div>

          {/* Warranty & Compliance */}
          <div>
            <h5 className="text-sm font-semibold text-slate-300 mb-3">Warranty & Compliance</h5>
            <Input
              label="Warranty Terms Acceptance"
              value={formData.warrantySupport?.warrantyPeriod || ""}
              onChange={(e) =>
                setNestedField("warrantySupport", "warrantyPeriod", e.target.value)
              }
              placeholder="e.g., 2 years warranty accepted"
            />
          </div>

          {/* Project Completion */}
          <div>
            <h5 className="text-sm font-semibold text-slate-300 mb-3">Project Completion</h5>
            <Input
              label="Completion Remarks"
              value={formData.projectRequirements?.acceptanceCriteria || ""}
              onChange={(e) =>
                setNestedField("projectRequirements", "acceptanceCriteria", e.target.value)
              }
              placeholder="Enter any final remarks or sign-off notes"
            />
          </div>

          {/* Internal Info */}
          <div>
            <h5 className="text-sm font-semibold text-slate-300 mb-3">Internal Project Info</h5>
            <FormRow cols={2}>
              <Input
                label="Project Manager"
                value={formData.internalInfo?.projectManager || ""}
                onChange={(e) =>
                  setNestedField("internalInfo", "projectManager", e.target.value)
                }
                placeholder="Enter project manager name"
              />
              <Input
                label="Production Supervisor"
                value={formData.internalInfo?.productionSupervisor || ""}
                onChange={(e) =>
                  setNestedField("internalInfo", "productionSupervisor", e.target.value)
                }
                placeholder="Enter production supervisor name"
              />
            </FormRow>
          </div>
        </div>
      </FormSection>
    </div>
  );
}
