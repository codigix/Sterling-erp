import React from "react";
import { Check } from "lucide-react";
import Input from "../../../ui/Input";
import Select from "../../../ui/Select";
import FormSection from "../shared/FormSection";
import FormRow from "../shared/FormRow";
import AssigneeField from "../shared/AssigneeField";
import { useFormData, useSalesOrderContext } from "../hooks";

export default function Step6_QualityCheck({ readOnly = false, isAssignMode = false }) {
  const { formData, updateField } = useFormData();
  const { state, setNestedField } = useSalesOrderContext();

  return (
    <div className="space-y-6">
      <AssigneeField
        stepType="quality_check"
        formData={state.formData}
        updateField={updateField}
        employees={state.employees}
      />
      <FormSection
        title="Quality Check & Compliance"
        subtitle="Define quality standards and compliance requirements"
        icon={Check}
      >
        <div className="space-y-3">
          {/* Quality Standards */}
          <div>
            <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">Quality Standards</h5>
            <FormRow cols={2}>
              <Input
                label="Quality Standards"
                value={formData.qualityCompliance?.qualityStandards || ""}
                onChange={(e) =>
                  setNestedField("qualityCompliance", "qualityStandards", e.target.value)
                }
                placeholder="e.g., ISO 9001, AS9100"
                disabled={readOnly}
              />
              <Input
                label="Welding Standards"
                value={formData.qualityCompliance?.weldingStandards || ""}
                onChange={(e) =>
                  setNestedField("qualityCompliance", "weldingStandards", e.target.value)
                }
                placeholder="e.g., AWS D1.1, EN 287"
                disabled={readOnly}
              />
            </FormRow>
          </div>

          {/* Surface & Material Compliance */}
          <div>
            <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">Material & Surface</h5>
            <FormRow cols={2}>
              <Input
                label="Surface Finish"
                value={formData.qualityCompliance?.surfaceFinish || ""}
                onChange={(e) =>
                  setNestedField("qualityCompliance", "surfaceFinish", e.target.value)
                }
                placeholder="e.g., Ra 1.6, Polished"
                disabled={readOnly}
              />
              <Input
                label="Mechanical Load Testing"
                value={formData.qualityCompliance?.mechanicalLoadTesting || ""}
                onChange={(e) =>
                  setNestedField("qualityCompliance", "mechanicalLoadTesting", e.target.value)
                }
                placeholder="e.g., 1.5x load capacity"
                disabled={readOnly}
              />
            </FormRow>
          </div>

          {/* Electrical & Documentation */}
          <div>
            <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">Compliance</h5>
            <FormRow cols={2}>
              <Input
                label="Electrical Compliance"
                value={formData.qualityCompliance?.electricalCompliance || ""}
                onChange={(e) =>
                  setNestedField("qualityCompliance", "electricalCompliance", e.target.value)
                }
                placeholder="e.g., IEC 61439, IP65"
                disabled={readOnly}
              />
              <Input
                label="Documents Required"
                value={formData.qualityCompliance?.documentsRequired || ""}
                onChange={(e) =>
                  setNestedField("qualityCompliance", "documentsRequired", e.target.value)
                }
                placeholder="e.g., QAP, FAT Report, CoC"
                disabled={readOnly}
              />
            </FormRow>
          </div>

          {/* Warranty & Support */}
          <div>
            <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">Warranty & Support</h5>
            <FormRow cols={2}>
              <Input
                label="Warranty Period"
                value={formData.warrantySupport?.warrantyPeriod || ""}
                onChange={(e) =>
                  setNestedField("warrantySupport", "warrantyPeriod", e.target.value)
                }
                placeholder="e.g., 2 years, 5 years"
                disabled={readOnly}
              />
              <Input
                label="Service Support"
                value={formData.warrantySupport?.serviceSupport || ""}
                onChange={(e) =>
                  setNestedField("warrantySupport", "serviceSupport", e.target.value)
                }
                placeholder="e.g., On-site support included"
                disabled={readOnly}
              />
            </FormRow>
          </div>

          {/* Assignee (for assign mode or editing) */}
          {(isAssignMode || !readOnly) && (
            <div className="border-t border-slate-200 pt-4">
              <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">Project Assignment</h5>
              <FormRow cols={1}>
                <Select
                  label="Assign to Employee"
                  options={(Array.isArray(state.employees) ? state.employees : []).map((emp) => ({
                    label: `${emp.firstName} ${emp.lastName} (${emp.designation})`,
                    value: emp.id.toString(),
                  }))}
                  value={formData.internalProjectOwner?.toString() || ""}
                  onChange={(e) => updateField("internalProjectOwner", e.target.value)}
                  placeholder="Select an employee..."
                  disabled={readOnly && !isAssignMode}
                />
              </FormRow>
            </div>
          )}
        </div>
      </FormSection>
    </div>
  );
}
