import React, { useCallback, useMemo } from "react";
import { Check, Plus, Trash2, Shield, DollarSign } from "lucide-react";
import Input from "../../../ui/Input";
import Select from "../../../ui/Select";
import FormSection from "../shared/FormSection";
import FormRow from "../shared/FormRow";
import AssigneeField from "../shared/AssigneeField";
import Tabs from "../../../ui/Tabs";
import { useFormData, useRootCardContext } from "../hooks";
import { PRIORITY_LEVELS, STATUS_LEVELS } from "../constants";

export default function Step5_QualityCheck({ readOnly = false }) {
  const { formData, updateField } = useFormData();
  const { state, setNestedField } = useRootCardContext();

  const inspections = useMemo(() => formData.qualityCheck?.inspections || [], [formData.qualityCheck?.inspections]);

  const handleAddInspection = useCallback(() => {
    const newInspection = {
      type: "",
      date: new Date().toISOString().split('T')[0],
      inspector: "",
      result: "Pending"
    };

    setNestedField("qualityCheck", "inspections", [...inspections, newInspection]);
  }, [inspections, setNestedField]);

  const handleRemoveInspection = useCallback((index) => {
    const currentInspections = [...inspections];
    currentInspections.splice(index, 1);
    setNestedField("qualityCheck", "inspections", currentInspections);
  }, [inspections, setNestedField]);

  const handleUpdateInspection = useCallback((index, field, value) => {
    const currentInspections = [...inspections];
    currentInspections[index] = { ...currentInspections[index], [field]: value };
    setNestedField("qualityCheck", "inspections", currentInspections);
  }, [inspections, setNestedField]);

  const qualityRequirementsContent = useMemo(() => (
    <div className="space-y-3">
      <div>
        <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">Quality Standards</h5>
        <Input
          label="Quality Standards"
          value={formData.qualityCompliance?.qualityStandards || ""}
          onChange={(e) => setNestedField("qualityCompliance", "qualityStandards", e.target.value)}
          placeholder="e.g., ISO 9001:2015"
          disabled={readOnly}
        />
        <FormRow cols={2}>
          <Input
            label="Welding Standards"
            value={formData.qualityCompliance?.weldingStandards || ""}
            onChange={(e) => setNestedField("qualityCompliance", "weldingStandards", e.target.value)}
            placeholder="e.g., AWS D1.1"
            disabled={readOnly}
          />
          <Input
            label="Surface Finish"
            value={formData.qualityCompliance?.surfaceFinish || ""}
            onChange={(e) => setNestedField("qualityCompliance", "surfaceFinish", e.target.value)}
            placeholder="e.g., Ra 1.6"
            disabled={readOnly}
          />
        </FormRow>
        <FormRow cols={2}>
          <Input
            label="Mechanical Load Testing"
            value={formData.qualityCompliance?.mechanicalLoadTesting || ""}
            onChange={(e) => setNestedField("qualityCompliance", "mechanicalLoadTesting", e.target.value)}
            placeholder="e.g., 1.5x load"
            disabled={readOnly}
          />
          <Input
            label="Electrical Compliance"
            value={formData.qualityCompliance?.electricalCompliance || ""}
            onChange={(e) => setNestedField("qualityCompliance", "electricalCompliance", e.target.value)}
            placeholder="e.g., IP65"
            disabled={readOnly}
          />
        </FormRow>
        <Input
          label="Documents Required"
          value={formData.qualityCompliance?.documentsRequired || ""}
          onChange={(e) => setNestedField("qualityCompliance", "documentsRequired", e.target.value)}
          placeholder="e.g., QAP, FAT Report"
          disabled={readOnly}
        />
      </div>

      <div className="border-t border-slate-200 pt-3">
        <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">Warranty & Support</h5>
        <FormRow cols={2}>
          <Input
            label="Warranty Period"
            value={formData.warrantySupport?.warrantyPeriod || ""}
            onChange={(e) => setNestedField("warrantySupport", "warrantyPeriod", e.target.value)}
            placeholder="e.g., 12 Months"
            disabled={readOnly}
          />
          <Input
            label="Service Support"
            value={formData.warrantySupport?.serviceSupport || ""}
            onChange={(e) => setNestedField("warrantySupport", "serviceSupport", e.target.value)}
            placeholder="e.g., On-call support"
            disabled={readOnly}
          />
        </FormRow>
      </div>
    </div>
  ), [formData.qualityCompliance, formData.warrantySupport, setNestedField, readOnly]);

  const inspectionResultsContent = useMemo(() => (
    <div className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h5 className="text-sm font-semibold text-slate-900 mb-3 text-left">Overall QC Summary</h5>
        <FormRow cols={2}>
          <Input
            label="Inspection Type"
            value={formData.qualityCheck?.inspectionType || ""}
            onChange={(e) => setNestedField("qualityCheck", "inspectionType", e.target.value)}
            placeholder="e.g., Final Inspection"
            disabled={readOnly}
          />
          <Select
            label="Overall QC Status"
            options={[
              { label: "Pending", value: "pending" },
              { label: "Passed", value: "passed" },
              { label: "Failed", value: "failed" },
              { label: "Conditional Pass", value: "conditional" }
            ]}
            value={formData.qualityCheck?.qcStatus || "pending"}
            onChange={(e) => setNestedField("qualityCheck", "qcStatus", e.target.value)}
            disabled={readOnly}
          />
        </FormRow>
        <div className="mt-3">
          <label className="block text-sm font-medium text-slate-900 text-left mb-2">Detailed QC Report</label>
          <textarea
            value={formData.qualityCheck?.qcReport || ""}
            onChange={(e) => setNestedField("qualityCheck", "qcReport", e.target.value)}
            disabled={readOnly}
            rows="4"
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter detailed quality control report or findings"
          />
        </div>
        <div className="mt-3">
          <label className="block text-sm font-medium text-slate-900 text-left mb-2">Final Remarks</label>
          <textarea
            value={formData.qualityCheck?.remarks || ""}
            onChange={(e) => setNestedField("qualityCheck", "remarks", e.target.value)}
            disabled={readOnly}
            rows="3"
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter final QC remarks"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-sm font-semibold text-slate-900">Detailed Inspection Logs</h5>
          {!readOnly && (
            <button
              type="button"
              onClick={handleAddInspection}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors"
            >
              <Plus size={14} />
              Add Inspection
            </button>
          )}
        </div>

        <div className="space-y-4">
          {(inspections.length === 0) ? (
            <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
              <p className="text-sm text-slate-500">No inspection logs recorded yet.</p>
            </div>
          ) : (
            inspections.map((inspection, index) => (
              <div key={index} className="p-4 bg-white border border-slate-200 rounded-lg relative">
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleRemoveInspection(index)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <FormRow cols={2} className="mb-3">
                  <Input
                    label="Inspection / Test Name"
                    value={inspection.type || ""}
                    onChange={(e) => handleUpdateInspection(index, "type", e.target.value)}
                    placeholder="e.g., Dimensional Check"
                    disabled={readOnly}
                  />
                  <Input
                    label="Inspection Date"
                    type="date"
                    value={inspection.date || ""}
                    onChange={(e) => handleUpdateInspection(index, "date", e.target.value)}
                    disabled={readOnly}
                  />
                </FormRow>
                <FormRow cols={2}>
                  <Input
                    label="Inspector Name"
                    value={inspection.inspector || ""}
                    onChange={(e) => handleUpdateInspection(index, "inspector", e.target.value)}
                    placeholder="Name of inspector"
                    disabled={readOnly}
                  />
                  <Select
                    label="Result"
                    options={[
                      { label: "Passed", value: "Passed" },
                      { label: "Failed", value: "Failed" },
                      { label: "Observation", value: "Observation" }
                    ]}
                    value={inspection.result || "Passed"}
                    onChange={(e) => handleUpdateInspection(index, "result", e.target.value)}
                    disabled={readOnly}
                  />
                </FormRow>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  ), [formData.qualityCheck, inspections, handleAddInspection, handleRemoveInspection, handleUpdateInspection, setNestedField, readOnly]);

  const paymentAndInternalContent = useMemo(() => (
    <div className="space-y-3">
      <div>
        <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">Payment & Priority</h5>
        <FormRow cols={2}>
          <Input
            label="Payment Terms"
            value={formData.paymentTerms || ""}
            onChange={(e) => updateField("paymentTerms", e.target.value)}
            placeholder="e.g., 40% advance"
            disabled={readOnly}
          />
          <div>
            <label className="block text-sm font-medium text-slate-900 text-left mb-2">Project Priority</label>
            <select
              value={formData.projectPriority || "medium"}
              onChange={(e) => updateField("projectPriority", e.target.value)}
              disabled={readOnly}
              className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {PRIORITY_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
        </FormRow>
        <FormRow cols={2}>
          <Input
            label="Total Amount *"
            type="number"
            step="any"
            value={formData.totalAmount || ""}
            onChange={(e) => updateField("totalAmount", e.target.value)}
            placeholder="0.00"
            disabled={readOnly}
          />
          <div>
            <label className="block text-sm font-medium text-slate-900 text-left mb-2">Order Status</label>
            <select
              value={formData.status || "pending"}
              onChange={(e) => updateField("status", e.target.value)}
              disabled={readOnly}
              className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {STATUS_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
        </FormRow>
      </div>

      <div className="border-t border-slate-200 pt-3">
        <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">Internal Information</h5>
        <FormRow cols={2}>
          <Select
            label="Internal Project Owner"
            options={state.employees?.map(emp => ({ label: emp.full_name || emp.name, value: emp.id })) || []}
            value={formData.internalProjectOwner || ""}
            onChange={(e) => updateField("internalProjectOwner", e.target.value)}
            placeholder="Select Project Owner"
            disabled={readOnly}
          />
          <div className="hidden md:block"></div>
        </FormRow>
        <FormRow cols={2}>
          <Input
            label="Estimated Costing (₹)"
            type="number"
            step="any"
            value={formData.internalInfo?.estimatedCosting || ""}
            onChange={(e) => setNestedField("internalInfo", "estimatedCosting", e.target.value)}
            placeholder="0.00"
            disabled={readOnly}
          />
          <Input
            label="Estimated Profit (₹)"
            type="number"
            step="any"
            value={formData.internalInfo?.estimatedProfit || ""}
            onChange={(e) => setNestedField("internalInfo", "estimatedProfit", e.target.value)}
            placeholder="0.00"
            disabled={readOnly}
          />
        </FormRow>
        <Input
          label="Job Card Number"
          value={formData.internalInfo?.jobCardNo || ""}
          onChange={(e) => setNestedField("internalInfo", "jobCardNo", e.target.value)}
          placeholder="Enter job card number"
          disabled={readOnly}
        />
      </div>

      <div className="border-t border-slate-200 pt-3">
        <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">Special Instructions</h5>
        <textarea
          value={formData.specialInstructions || ""}
          onChange={(e) => updateField("specialInstructions", e.target.value)}
          disabled={readOnly}
          rows="4"
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Enter any special instructions"
        />
      </div>
    </div>
  ), [formData.paymentTerms, formData.projectPriority, formData.totalAmount, formData.status, formData.internalInfo, formData.specialInstructions, formData.internalProjectOwner, state.employees, updateField, setNestedField, readOnly]);

  const tabs = useMemo(() => [
    { label: "Requirements", content: qualityRequirementsContent },
    { label: "Inspections", content: inspectionResultsContent },
    { label: "Payment & Internal", content: paymentAndInternalContent },
  ], [qualityRequirementsContent, inspectionResultsContent, paymentAndInternalContent]);

  return (
    <div className="space-y-6">
      <AssigneeField
        stepType="qualityCheck"
        formData={state.formData}
        updateField={updateField}
        employees={state.employees}
        readOnly={readOnly}
      />
      
      <FormSection
        title="Quality & Compliance"
        subtitle="Manage quality standards, inspections, and project economics"
        icon={Shield}
      >
        <div className="space-y-6">
          <Tabs tabs={tabs} defaultTab={1} />
        </div>
      </FormSection>
    </div>
  );
}
