import React from "react";
import { FileText } from "lucide-react";
import Input from "../../../ui/Input";
import FormSection from "../shared/FormSection";
import FormRow from "../shared/FormRow";
import { useFormData, useSalesOrderContext } from "../hooks";

export default function Step1_ClientPO() {
  const { formData, updateField } = useFormData();
  const { state, setNestedField } = useSalesOrderContext();

  return (
    <div className="space-y-6">
      <FormSection
        title="Client PO & Project Details"
        subtitle="Enter the client purchase order and project information"
        icon={FileText}
      >
        <div className="space-y-4">
          <div>
            <h5 className="text-sm font-semibold text-slate-300 mb-3">PO Information</h5>
            <FormRow cols={2}>
              <Input
                label="PO Number"
                value={formData.poNumber}
                onChange={(e) => updateField("poNumber", e.target.value)}
                placeholder="Enter PO number"
              />
              <Input
                label="PO Date"
                type="date"
                value={formData.poDate}
                onChange={(e) => updateField("poDate", e.target.value)}
              />
            </FormRow>
          </div>

          <div className="border-t border-slate-700 pt-4">
            <h5 className="text-sm font-semibold text-slate-300 mb-3">Client Information</h5>
            <FormRow cols={2}>
              <Input
                label="Client Name"
                value={formData.clientName}
                onChange={(e) => updateField("clientName", e.target.value)}
                placeholder="Enter client name"
              />
              <Input
                label="Contact Person"
                value={formData.customerContact}
                onChange={(e) => updateField("customerContact", e.target.value)}
                placeholder="Enter contact person name"
              />
            </FormRow>
            <Input
              label="Client Address"
              value={formData.clientAddress}
              onChange={(e) => updateField("clientAddress", e.target.value)}
              placeholder="Enter full address"
            />
            <FormRow cols={2}>
              <Input
                label="Client Email"
                type="email"
                value={formData.clientEmail}
                onChange={(e) => updateField("clientEmail", e.target.value)}
                placeholder="Enter email address"
              />
              <Input
                label="Client Phone"
                value={formData.clientPhone}
                onChange={(e) => updateField("clientPhone", e.target.value)}
                placeholder="Enter 10-digit phone number"
              />
            </FormRow>
          </div>

          <div className="border-t border-slate-700 pt-4">
            <h5 className="text-sm font-semibold text-slate-300 mb-3">Project Details</h5>
            <FormRow cols={2}>
              <Input
                label="Project Name"
                value={formData.projectName}
                onChange={(e) => updateField("projectName", e.target.value)}
                placeholder="Enter project name"
              />
              <Input
                label="Project Code"
                value={formData.projectCode || ""}
                disabled
                placeholder="Auto-generated"
              />
            </FormRow>
            <FormRow cols={2}>
              <Input
                label="Billing Address"
                value={formData.billingAddress}
                onChange={(e) => updateField("billingAddress", e.target.value)}
                placeholder="Enter billing address"
              />
              <Input
                label="Shipping Address"
                value={formData.shippingAddress}
                onChange={(e) => updateField("shippingAddress", e.target.value)}
                placeholder="Enter shipping address"
              />
            </FormRow>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Project Requirements"
        subtitle="Detailed requirements and specifications for the project"
        icon={FileText}
      >
        <div className="space-y-4">
          <FormRow cols={2}>
            <Input
              label="Application / Use Case"
              value={state.formData.projectRequirements.application}
              onChange={(e) => setNestedField("projectRequirements", "application", e.target.value)}
              placeholder="e.g., Container handling, Material lifting"
            />
            <Input
              label="Number of Units"
              type="number"
              value={state.formData.projectRequirements.numberOfUnits}
              onChange={(e) => setNestedField("projectRequirements", "numberOfUnits", e.target.value)}
              placeholder="e.g., 2"
            />
          </FormRow>
          <Input
            label="Dimensions (L x W x H)"
            value={state.formData.projectRequirements.dimensions}
            onChange={(e) => setNestedField("projectRequirements", "dimensions", e.target.value)}
            placeholder="e.g., 3000mm x 2000mm x 1500mm"
          />
          <FormRow cols={2}>
            <Input
              label="Load Capacity"
              value={state.formData.projectRequirements.loadCapacity}
              onChange={(e) => setNestedField("projectRequirements", "loadCapacity", e.target.value)}
              placeholder="e.g., 5000 kg"
            />
            <Input
              label="Specifications"
              value={state.formData.projectRequirements.specifications}
              onChange={(e) => setNestedField("projectRequirements", "specifications", e.target.value)}
              placeholder="e.g., High precision, Low vibration"
            />
          </FormRow>
          <FormRow cols={2}>
            <Input
              label="Material Grade"
              value={state.formData.projectRequirements.materialGrade}
              onChange={(e) => setNestedField("projectRequirements", "materialGrade", e.target.value)}
              placeholder="e.g., EN8, ASTM A36"
            />
            <Input
              label="Finish & Coatings"
              value={state.formData.projectRequirements.finishCoatings}
              onChange={(e) => setNestedField("projectRequirements", "finishCoatings", e.target.value)}
              placeholder="e.g., Powder coated, Painted"
            />
          </FormRow>
          <FormRow cols={2}>
            <Input
              label="Accessories Required"
              value={state.formData.projectRequirements.accessories}
              onChange={(e) => setNestedField("projectRequirements", "accessories", e.target.value)}
              placeholder="e.g., Safety guards, Warning labels"
            />
            <Input
              label="Installation Requirement"
              value={state.formData.projectRequirements.installationRequirement}
              onChange={(e) => setNestedField("projectRequirements", "installationRequirement", e.target.value)}
              placeholder="e.g., On-site assembly, Factory assembled"
            />
          </FormRow>
          <FormRow cols={2}>
            <Input
              label="Testing Standards"
              value={state.formData.projectRequirements.testingStandards}
              onChange={(e) => setNestedField("projectRequirements", "testingStandards", e.target.value)}
              placeholder="e.g., IS 1566, EN 13849"
            />
            <Input
              label="Documentation Requirement"
              value={state.formData.projectRequirements.documentationRequirement}
              onChange={(e) => setNestedField("projectRequirements", "documentationRequirement", e.target.value)}
              placeholder="e.g., Complete with drawings"
            />
          </FormRow>
          <FormRow cols={2}>
            <Input
              label="Warranty Terms"
              value={state.formData.projectRequirements.warrantTerms}
              onChange={(e) => setNestedField("projectRequirements", "warrantTerms", e.target.value)}
              placeholder="e.g., 12 months"
            />
            <Input
              label="Penalty Clauses"
              value={state.formData.projectRequirements.penaltyClauses}
              onChange={(e) => setNestedField("projectRequirements", "penaltyClauses", e.target.value)}
              placeholder="e.g., 1% per week delay"
            />
          </FormRow>
          <FormRow cols={2}>
            <Input
              label="Confidentiality Clauses"
              value={state.formData.projectRequirements.confidentialityClauses}
              onChange={(e) => setNestedField("projectRequirements", "confidentialityClauses", e.target.value)}
              placeholder="e.g., Yes / No"
            />
            <Input
              label="Acceptance Criteria"
              value={state.formData.projectRequirements.acceptanceCriteria}
              onChange={(e) => setNestedField("projectRequirements", "acceptanceCriteria", e.target.value)}
              placeholder="e.g., Function test, Load test 150%"
            />
          </FormRow>
        </div>
      </FormSection>
    </div>
  );
}
