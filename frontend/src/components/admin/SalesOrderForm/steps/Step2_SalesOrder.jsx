import React from "react";
import { Zap, User, Shield, DollarSign, FileText } from "lucide-react";
import Input from "../../../ui/Input";
import FormSection from "../shared/FormSection";
import FormRow from "../shared/FormRow";
import Tabs from "../../../ui/Tabs";
import { useFormData } from "../hooks";
import { PRIORITY_LEVELS } from "../constants";

export default function Step2_SalesOrder({ readOnly = false }) {
  const { formData, updateField, setNestedField } = useFormData();

  const salesAndProductContent = (
    <FormSection
      title="Sales & Product Details"
      subtitle="Contact information and product specifications"
      icon={User}
    >
      <div className="space-y-4">
        {/* Sales & Contact Details */}
        <div>
          <h5 className="text-sm font-semibold text-slate-300 mb-3">
            Sales & Contact Details
          </h5>
          <Input
            label="Client Email *"
            type="email"
            value={formData.clientEmail}
            onChange={(e) => updateField("clientEmail", e.target.value)}
            placeholder="Enter email address"
          />
          <FormRow cols={2}>
            <Input
              label="Client Phone *"
              value={formData.clientPhone}
              onChange={(e) => updateField("clientPhone", e.target.value)}
              placeholder="Enter phone number"
            />
            <Input
              label="Estimated End Date *"
              type="date"
              value={formData.estimatedEndDate}
              onChange={(e) => updateField("estimatedEndDate", e.target.value)}
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

        {/* Product/Item Details */}
        <div className="border-t border-slate-700 pt-4">
          <h5 className="text-sm font-semibold text-slate-300 mb-3">
            Product / Item Details
          </h5>
          <FormRow cols={2}>
            <Input
              label="Item Name"
              value={formData.productDetails?.itemName || ""}
              onChange={(e) =>
                setNestedField("productDetails", "itemName", e.target.value)
              }
              placeholder="e.g., CCIS – Container Canister Integration Stand"
            />
            <Input
              label="Item Description"
              value={formData.productDetails?.itemDescription || ""}
              onChange={(e) =>
                setNestedField(
                  "productDetails",
                  "itemDescription",
                  e.target.value
                )
              }
              placeholder="Brief description of the item"
            />
            <Input
              label="Components Included"
              value={formData.productDetails?.componentsList || ""}
              onChange={(e) =>
                setNestedField(
                  "productDetails",
                  "componentsList",
                  e.target.value
                )
              }
              placeholder="e.g., Long Base Frame, Roller Saddle Assemblies"
            />
            <Input
              label="Certification/Testing Requirements"
              value={formData.productDetails?.certification || ""}
              onChange={(e) =>
                setNestedField(
                  "productDetails",
                  "certification",
                  e.target.value
                )
              }
              placeholder="e.g., QAP, FAT Report, CoC"
            />
          </FormRow>
        </div>
      </div>
    </FormSection>
  );

  const qualityAndComplianceContent = (
    <FormSection
      title="Quality & Compliance"
      subtitle="Standards, testing, and warranty information"
      icon={Shield}
    >
      <div className="space-y-4">
        {/* Quality & Compliance */}
        <div>
          <h5 className="text-sm font-semibold text-slate-300 mb-3">
            Quality & Compliance
          </h5>
          <Input
            label="Quality Standards"
            value={formData.qualityCompliance?.qualityStandards || ""}
            onChange={(e) =>
              setNestedField(
                "qualityCompliance",
                "qualityStandards",
                e.target.value
              )
            }
            placeholder="e.g., ISO 9001:2015, DRDO standards"
          />
          <FormRow cols={2}>
            <Input
              label="Welding Standards"
              value={formData.qualityCompliance?.weldingStandards || ""}
              onChange={(e) =>
                setNestedField(
                  "qualityCompliance",
                  "weldingStandards",
                  e.target.value
                )
              }
              placeholder="e.g., AWS D1.1"
            />
            <Input
              label="Surface Finish"
              value={formData.qualityCompliance?.surfaceFinish || ""}
              onChange={(e) =>
                setNestedField(
                  "qualityCompliance",
                  "surfaceFinish",
                  e.target.value
                )
              }
              placeholder="e.g., Blasting + Epoxy primer + PU coat"
            />
          </FormRow>
          <FormRow cols={2}>
            <Input
              label="Mechanical Load Testing"
              value={formData.qualityCompliance?.mechanicalLoadTesting || ""}
              onChange={(e) =>
                setNestedField(
                  "qualityCompliance",
                  "mechanicalLoadTesting",
                  e.target.value
                )
              }
              placeholder="e.g., 6000 kg load test"
            />
            <Input
              label="Electrical Compliance"
              value={formData.qualityCompliance?.electricalCompliance || ""}
              onChange={(e) =>
                setNestedField(
                  "qualityCompliance",
                  "electricalCompliance",
                  e.target.value
                )
              }
              placeholder="e.g., IEC 61010, Safety compliance"
            />
          </FormRow>
          <Input
            label="Documents Required"
            value={formData.qualityCompliance?.documentsRequired || ""}
            onChange={(e) =>
              setNestedField(
                "qualityCompliance",
                "documentsRequired",
                e.target.value
              )
            }
            placeholder="e.g., QAP, FAT Report, Installation Manual, Warranty Certificate"
          />
        </div>

        {/* Warranty & Support */}
        <div className="border-t border-slate-700 pt-4">
          <h5 className="text-sm font-semibold text-slate-300 mb-3">
            Warranty & Support
          </h5>
          <FormRow cols={2}>
            <Input
              label="Warranty Period"
              value={formData.warrantySupport?.warrantyPeriod || ""}
              onChange={(e) =>
                setNestedField(
                  "warrantySupport",
                  "warrantyPeriod",
                  e.target.value
                )
              }
              placeholder="e.g., 12 Months from installation"
            />
            <Input
              label="Service Support"
              value={formData.warrantySupport?.serviceSupport || ""}
              onChange={(e) =>
                setNestedField(
                  "warrantySupport",
                  "serviceSupport",
                  e.target.value
                )
              }
              placeholder="e.g., AMC available / On-call support"
            />
          </FormRow>
        </div>
      </div>
    </FormSection>
  );

  const paymentAndInternalContent = (
    <FormSection
      title="Payment & Internal Information"
      subtitle="Payment terms, costing, and special instructions"
      icon={DollarSign}
    >
      <div className="space-y-4">
        {/* Payment & Priority */}
        <div>
          <h5 className="text-sm font-semibold text-slate-300 mb-3">
            Payment & Priority
          </h5>
          <FormRow cols={2}>
            <Input
              label="Payment Terms"
              value={formData.paymentTerms}
              onChange={(e) => updateField("paymentTerms", e.target.value)}
              placeholder="e.g., 40% advance, 40% before dispatch, 20% after installation"
            />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Project Priority
              </label>
              <select
                value={formData.projectPriority}
                onChange={(e) => updateField("projectPriority", e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
              >
                {PRIORITY_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </FormRow>
        </div>

        {/* Internal Information */}
        <div className="border-t border-slate-700 pt-4">
          <h5 className="text-sm font-semibold text-slate-300 mb-3">
            Internal Information (For ERP)
          </h5>
          <FormRow cols={2}>
            <Input
              label="Total Amount *"
              type="number"
              step="0.01"
              value={formData.totalAmount}
              onChange={(e) => updateField("totalAmount", e.target.value)}
              placeholder="0.00"
            />
            <Input
              label="Project Code"
              value={formData.projectCode}
              onChange={(e) => updateField("projectCode", e.target.value)}
              placeholder="Enter project code"
            />
          </FormRow>
          <FormRow cols={2}>
            <Input
              label="Estimated Costing (₹)"
              type="number"
              step="0.01"
              value={formData.internalInfo?.estimatedCosting || ""}
              onChange={(e) =>
                setNestedField(
                  "internalInfo",
                  "estimatedCosting",
                  e.target.value
                )
              }
              placeholder="Enter estimated costing"
            />
            <Input
              label="Estimated Profit (₹)"
              type="number"
              step="0.01"
              value={formData.internalInfo?.estimatedProfit || ""}
              onChange={(e) =>
                setNestedField(
                  "internalInfo",
                  "estimatedProfit",
                  e.target.value
                )
              }
              placeholder="Enter estimated profit"
            />
          </FormRow>
          <Input
            label="Job Card Number"
            value={formData.internalInfo?.jobCardNo || ""}
            onChange={(e) =>
              setNestedField("internalInfo", "jobCardNo", e.target.value)
            }
            placeholder="Auto-generated or enter manual number"
          />
        </div>

        {/* Special Instructions */}
        <div className="border-t border-slate-700 pt-4">
          <h5 className="text-sm font-semibold text-slate-300 mb-3">
            Special Instructions
          </h5>
          <textarea
            value={formData.specialInstructions}
            onChange={(e) => updateField("specialInstructions", e.target.value)}
            rows="4"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter any special instructions or notes"
          />
        </div>
      </div>
    </FormSection>
  );

  const tabs = [
    {
      label: "Sales & Product",
      content: salesAndProductContent,
    },
    {
      label: "Quality & Compliance",
      content: qualityAndComplianceContent,
    },
    {
      label: "Payment & Internal",
      content: paymentAndInternalContent,
    },
  ];

  return (
    <div className="space-y-6">
      <FormSection
        title="Sales Order & Order Information"
        subtitle="Enter order specifications, pricing, and delivery terms"
        icon={Zap}
      >
        <Tabs tabs={tabs} defaultTab={0} />
      </FormSection>
    </div>
  );
}
