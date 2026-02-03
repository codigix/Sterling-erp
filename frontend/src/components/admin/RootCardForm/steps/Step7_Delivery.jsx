import React, { useMemo } from "react";
import { CheckCircle } from "lucide-react";
import Input from "../../../ui/Input";
import FormSection from "../shared/FormSection";
import FormRow from "../shared/FormRow";
import AssigneeField from "../shared/AssigneeField";
import { useFormData, useRootCardContext } from "../hooks";

export default function Step7_Delivery({ readOnly = false }) {
  const { formData, updateField, setNestedField } = useFormData();
  const { state } = useRootCardContext();

  const content = useMemo(() => (
    <div className="space-y-3">
      <AssigneeField
        stepType="delivery"
        formData={state.formData}
        updateField={updateField}
        employees={state.employees}
        readOnly={readOnly}
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
                value={formData.delivery?.actualDeliveryDate || ""}
                onChange={(e) =>
                  setNestedField("delivery", "actualDeliveryDate", e.target.value)
                }
                disabled={readOnly}
              />
              <Input
                label="Delivered To (Name)"
                value={formData.delivery?.deliveredTo || ""}
                onChange={(e) =>
                  setNestedField("delivery", "deliveredTo", e.target.value)
                }
                placeholder="Enter recipient name"
                disabled={readOnly}
              />
            </FormRow>
            <FormRow cols={2}>
              <Input
                label="Customer Contact Person"
                value={formData.delivery?.customerContact || ""}
                onChange={(e) =>
                  setNestedField("delivery", "customerContact", e.target.value)
                }
                placeholder="Enter contact person name"
                disabled={readOnly}
              />
              <div className="hidden md:block"></div>
            </FormRow>
          </div>

          {/* Delivery Details */}
          <div className="border-t border-slate-200 pt-3">
            <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">Delivery Logistics</h5>
            <FormRow cols={2}>
              <Input
                label="Delivery Date"
                type="date"
                value={formData.delivery?.deliveryDate || ""}
                onChange={(e) => setNestedField("delivery", "deliveryDate", e.target.value)}
                disabled={readOnly}
              />
              <Input
                label="POD / LR Number"
                value={formData.delivery?.podNumber || ""}
                onChange={(e) => setNestedField("delivery", "podNumber", e.target.value)}
                placeholder="Proof of delivery number"
                disabled={readOnly}
              />
            </FormRow>
            <FormRow cols={2}>
              <Input
                label="Delivered Quantity"
                type="number"
                value={formData.delivery?.deliveredQuantity || ""}
                onChange={(e) => setNestedField("delivery", "deliveredQuantity", e.target.value)}
                placeholder="Total units delivered"
                disabled={readOnly}
              />
              <Input
                label="Delivery Cost (₹)"
                type="number"
                value={formData.delivery?.deliveryCost || ""}
                onChange={(e) => setNestedField("delivery", "deliveryCost", e.target.value)}
                placeholder="0.00"
                disabled={readOnly}
              />
            </FormRow>
            <div className="mt-3">
              <label className="block text-sm font-medium text-slate-900 text-left mb-2">Delivery Notes</label>
              <textarea
                value={formData.delivery?.deliveryNotes || ""}
                onChange={(e) => setNestedField("delivery", "deliveryNotes", e.target.value)}
                disabled={readOnly}
                rows="2"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any special notes for delivery"
              />
            </div>
          </div>

          {/* Installation Status */}
          <div>
            <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">Installation Status</h5>
            <FormRow cols={2}>
              <Input
                label="Installation Completed"
                value={formData.delivery?.installationCompleted || ""}
                onChange={(e) =>
                  setNestedField("delivery", "installationCompleted", e.target.value)
                }
                placeholder="e.g., Yes, completed"
                disabled={readOnly}
              />
              <Input
                label="Site Commissioning Completed"
                value={formData.delivery?.siteCommissioningCompleted || ""}
                onChange={(e) =>
                  setNestedField("delivery", "siteCommissioningCompleted", e.target.value)
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
              value={formData.delivery?.warrantyTermsAcceptance || ""}
              onChange={(e) =>
                setNestedField("delivery", "warrantyTermsAcceptance", e.target.value)
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
              value={formData.delivery?.completionRemarks || ""}
              onChange={(e) =>
                setNestedField("delivery", "completionRemarks", e.target.value)
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
                value={formData.delivery?.projectManager || ""}
                onChange={(e) =>
                  setNestedField("delivery", "projectManager", e.target.value)
                }
                placeholder="Enter project manager name"
                disabled={readOnly}
              />
              <Input
                label="Production Supervisor"
                value={formData.delivery?.productionSupervisor || ""}
                onChange={(e) =>
                  setNestedField("delivery", "productionSupervisor", e.target.value)
                }
                placeholder="Enter production supervisor name"
                disabled={readOnly}
              />
            </FormRow>
          </div>
        </div>
      </FormSection>
    </div>
  ), [formData.delivery, state.employees, state.formData, readOnly, setNestedField, updateField]);

  return content;
}
