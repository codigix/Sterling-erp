import React from "react";
import { Check } from "lucide-react";
import Input from "../../../ui/Input";
import FormSection from "../shared/FormSection";
import FormRow from "../shared/FormRow";
import { useFormData } from "../hooks";

export default function Step6_QualityCheck() {
  const { formData, setNestedField } = useFormData();

  return (
    <div className="space-y-6">
      <FormSection
        title="Quality Check & Compliance"
        subtitle="Define quality standards and compliance requirements"
        icon={Check}
      >
        <div className="space-y-6">
          {/* Quality Standards */}
          <div>
            <h5 className="text-sm font-semibold text-slate-300 mb-3">Quality Standards</h5>
            <FormRow cols={2}>
              <Input
                label="Quality Standards"
                value={formData.qualityCompliance?.qualityStandards || ""}
                onChange={(e) =>
                  setNestedField("qualityCompliance", "qualityStandards", e.target.value)
                }
                placeholder="e.g., ISO 9001, AS9100"
              />
              <Input
                label="Welding Standards"
                value={formData.qualityCompliance?.weldingStandards || ""}
                onChange={(e) =>
                  setNestedField("qualityCompliance", "weldingStandards", e.target.value)
                }
                placeholder="e.g., AWS D1.1, EN 287"
              />
            </FormRow>
          </div>

          {/* Surface & Material Compliance */}
          <div>
            <h5 className="text-sm font-semibold text-slate-300 mb-3">Material & Surface</h5>
            <FormRow cols={2}>
              <Input
                label="Surface Finish"
                value={formData.qualityCompliance?.surfaceFinish || ""}
                onChange={(e) =>
                  setNestedField("qualityCompliance", "surfaceFinish", e.target.value)
                }
                placeholder="e.g., Ra 1.6, Polished"
              />
              <Input
                label="Mechanical Load Testing"
                value={formData.qualityCompliance?.mechanicalLoadTesting || ""}
                onChange={(e) =>
                  setNestedField("qualityCompliance", "mechanicalLoadTesting", e.target.value)
                }
                placeholder="e.g., 1.5x load capacity"
              />
            </FormRow>
          </div>

          {/* Electrical & Documentation */}
          <div>
            <h5 className="text-sm font-semibold text-slate-300 mb-3">Compliance</h5>
            <FormRow cols={2}>
              <Input
                label="Electrical Compliance"
                value={formData.qualityCompliance?.electricalCompliance || ""}
                onChange={(e) =>
                  setNestedField("qualityCompliance", "electricalCompliance", e.target.value)
                }
                placeholder="e.g., IEC 61439, IP65"
              />
              <Input
                label="Documents Required"
                value={formData.qualityCompliance?.documentsRequired || ""}
                onChange={(e) =>
                  setNestedField("qualityCompliance", "documentsRequired", e.target.value)
                }
                placeholder="e.g., QAP, FAT Report, CoC"
              />
            </FormRow>
          </div>

          {/* Warranty & Support */}
          <div>
            <h5 className="text-sm font-semibold text-slate-300 mb-3">Warranty & Support</h5>
            <FormRow cols={2}>
              <Input
                label="Warranty Period"
                value={formData.warrantySupport?.warrantyPeriod || ""}
                onChange={(e) =>
                  setNestedField("warrantySupport", "warrantyPeriod", e.target.value)
                }
                placeholder="e.g., 2 years, 5 years"
              />
              <Input
                label="Service Support"
                value={formData.warrantySupport?.serviceSupport || ""}
                onChange={(e) =>
                  setNestedField("warrantySupport", "serviceSupport", e.target.value)
                }
                placeholder="e.g., On-site support included"
              />
            </FormRow>
          </div>
        </div>
      </FormSection>
    </div>
  );
}
