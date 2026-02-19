import React, { useEffect, useMemo, useState } from "react";
import { FileText, User, FolderOpen, FileCheck, Paperclip, Loader2 } from "lucide-react";
import Input from "../../../ui/Input";
import FormSection from "../shared/FormSection";
import FormRow from "../shared/FormRow";
import Tabs from "../../../ui/Tabs";
import { useFormData, useRootCardContext } from "../hooks";
import AllDocumentsView from "../shared/AllDocumentsView";
import axios from "../../../../utils/api";
import { showError } from "../../../../utils/toastUtils";

export default function Step1_ClientPO({ readOnly = false }) {
  const { formData, updateField } = useFormData();
  const { setNestedField, state, setPoDocuments, initialData } = useRootCardContext();
  const [uploading, setUploading] = useState(false);
  const rootCardId = initialData?.id || state.createdOrderId;
  
  useEffect(() => {
    if (!readOnly && formData.projectName && !formData.projectCode) {
      const codePrefix = formData.projectName.substring(0, 3).toUpperCase();
      const generatedCode = `${codePrefix}-${Date.now().toString().slice(-6)}`;
      updateField("projectCode", generatedCode);
    }
  }, [formData.projectName, formData.projectCode, updateField, readOnly]);

  useEffect(() => {
    if (!readOnly && formData.projectName && !formData.poNumber) {
      const poPrefix = formData.projectName.substring(0, 3).toUpperCase();
      const timestamp = Date.now().toString().slice(-6);
      const generatedPO = `PO-${poPrefix}-${timestamp}`;
      updateField("poNumber", generatedPO);
    }
  }, [formData.projectName, formData.poNumber, updateField, readOnly]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (!rootCardId) {
      showError("Please save the basic details first before uploading documents.");
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      files.forEach(file => {
        uploadFormData.append('documents', file);
      });

      const response = await axios.post(`/root-cards/steps/${rootCardId}/client-po/upload`, uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data?.success) {
        const newlyUploaded = response.data.data.uploaded;
        setPoDocuments([...(state.poDocuments || []), ...newlyUploaded]);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      showError("Failed to upload files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const clientInfoContent = useMemo(() => (
    <FormSection
      title="Client Information"
      subtitle="Enter the client details and PO information"
      icon={User}
    >
      <div className="space-y-3">
        <div>
          <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">
            PO Information
          </h5>
          <FormRow cols={2}>
            <Input
              label="PO Number"
              value={formData.poNumber}
              onChange={(e) => updateField("poNumber", e.target.value)}
              placeholder="Enter PO number"
              disabled={readOnly}
            />
            <Input
              label="PO Date"
              type="date"
              value={formData.poDate}
              onChange={(e) => updateField("poDate", e.target.value)}
              disabled={readOnly}
            />
          </FormRow>
        </div>

        <div className="border-t border-slate-200 pt-3">
          <h5 className="text-sm font-semibold text-slate-900 mb-3 text-left">
            Client Details
          </h5>

          <FormRow cols={3} className="mb-3">
            <Input
              label="Client Name"
              value={formData.clientName}
              onChange={(e) => updateField("clientName", e.target.value)}
              placeholder="Enter client name"
              disabled={readOnly}
            />
            <Input
              label="Client Email"
              type="email"
              value={formData.clientEmail}
              onChange={(e) => updateField("clientEmail", e.target.value)}
              placeholder="Enter email address"
              disabled={readOnly}
            />
            <Input
              label="Client Phone"
              value={formData.clientPhone}
              onChange={(e) => updateField("clientPhone", e.target.value)}
              placeholder="Enter 10-digit phone number"
              disabled={readOnly}
            />
          </FormRow>
        </div>
      </div>
    </FormSection>
  ), [formData.poNumber, formData.poDate, formData.clientName, formData.clientEmail, formData.clientPhone, updateField, readOnly]);

  const projectDetailsContent = useMemo(() => (
    <FormSection
      title="Project Details"
      subtitle="Enter project information and delivery addresses"
      icon={FolderOpen}
    >
      <div className="space-y-4">
        <FormRow cols={2}>
          <Input
            label="Project Name"
            value={formData.projectName}
            onChange={(e) => updateField("projectName", e.target.value)}
            placeholder="Enter project name"
            disabled={readOnly}
          />
          <Input
            label="Project Code"
            value={formData.projectCode || ""}
            disabled
            placeholder="Auto-generated from project name"
          />
        </FormRow>
        <FormRow cols={2}>
          <Input
            label="Billing Address"
            value={formData.billingAddress}
            onChange={(e) => updateField("billingAddress", e.target.value)}
            placeholder="Enter billing address"
            disabled={readOnly}
          />
          <Input
            label="Shipping Address"
            value={formData.shippingAddress}
            onChange={(e) => updateField("shippingAddress", e.target.value)}
            placeholder="Enter shipping address"
            disabled={readOnly}
          />
        </FormRow>

        {/* Product/Item Details */}
        <div className="border-t border-slate-200 pt-3">
          <h5 className="text-sm font-semibold text-slate-900 mb-3 text-left">
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
              disabled={readOnly}
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
              disabled={readOnly}
            />
          </FormRow>
          <FormRow cols={2}>
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
              disabled={readOnly}
            />
            <Input
              label="Estimated End Date *"
              type="date"
              value={formData.estimatedEndDate}
              onChange={(e) => updateField("estimatedEndDate", e.target.value)}
              disabled={readOnly}
            />
          </FormRow>
        </div>
      </div>
    </FormSection>
  ), [formData.projectName, formData.projectCode, formData.billingAddress, formData.shippingAddress, formData.productDetails, formData.estimatedEndDate, updateField, setNestedField, readOnly]);

  const projectRequirementsContent = useMemo(() => (
    <FormSection
      title="Project Requirements"
      subtitle="Detailed requirements and specifications for the project"
      icon={FileCheck}
    >
      <div className="space-y-4">
        <div>
          <h5 className="text-sm font-semibold text-slate-900 mb-3 text-left">Basic Specifications</h5>
          <FormRow cols={2}>
            <Input
              label="Application / Use Case"
              value={formData.projectRequirements?.application || ""}
              onChange={(e) =>
                setNestedField(
                  "projectRequirements",
                  "application",
                  e.target.value
                )
              }
              placeholder="e.g., Container handling, Material lifting"
              disabled={readOnly}
            />
            <Input
              label="Number of Units"
              type="number"
              value={formData.projectRequirements?.numberOfUnits || ""}
              onChange={(e) =>
                setNestedField(
                  "projectRequirements",
                  "numberOfUnits",
                  e.target.value
                )
              }
              placeholder="e.g., 2"
              disabled={readOnly}
            />
          </FormRow>
          <Input
            label="Dimensions (L x W x H)"
            value={formData.projectRequirements?.dimensions || ""}
            onChange={(e) =>
              setNestedField("projectRequirements", "dimensions", e.target.value)
            }
            placeholder="e.g., 3000mm x 2000mm x 1500mm"
            disabled={readOnly}
          />
          <Input
            label="Load Capacity"
            value={formData.projectRequirements?.loadCapacity || ""}
            onChange={(e) =>
              setNestedField(
                "projectRequirements",
                "loadCapacity",
                e.target.value
              )
            }
            placeholder="e.g., 5000 kg"
            disabled={readOnly}
          />
        </div>

        <div className="border-t border-slate-200 pt-3">
          <h5 className="text-sm font-semibold text-slate-900 mb-3 text-left">Material & Manufacturing</h5>
          <FormRow cols={2}>
            <Input
              label="Material Grade"
              value={formData.projectRequirements?.materialGrade || ""}
              onChange={(e) =>
                setNestedField(
                  "projectRequirements",
                  "materialGrade",
                  e.target.value
                )
              }
              placeholder="e.g., EN8, ASTM A36"
              disabled={readOnly}
            />
            <Input
              label="Finish & Coatings"
              value={formData.projectRequirements?.finishCoatings || ""}
              onChange={(e) =>
                setNestedField(
                  "projectRequirements",
                  "finishCoatings",
                  e.target.value
                )
              }
              placeholder="e.g., Powder coated, Painted"
              disabled={readOnly}
            />
          </FormRow>
          <Input
            label="Installation Requirement"
            value={formData.projectRequirements?.installationRequirement || ""}
            onChange={(e) =>
              setNestedField(
                "projectRequirements",
                "installationRequirement",
                e.target.value
              )
            }
            placeholder="e.g., On-site assembly, Factory assembled"
            disabled={readOnly}
          />
        </div>
      </div>
    </FormSection>
  ), [formData.projectRequirements, setNestedField, readOnly]);

  const attachmentsContent = useMemo(() => (
    <FormSection
      title="Project Attachments"
      subtitle="View all uploaded documents for this project"
      icon={Paperclip}
    >
      {uploading && (
        <div className="flex items-center justify-center py-4 text-blue-600">
          <Loader2 className="animate-spin mr-2" size={20} />
          <span>Uploading documents...</span>
        </div>
      )}
      <AllDocumentsView 
        readOnly={readOnly} 
        onUploadPO={handleFileUpload} 
      />
    </FormSection>
  ), [readOnly, uploading, handleFileUpload]);

  const tabs = useMemo(() => [
    {
      label: "Client Info",
      content: clientInfoContent,
    },
    {
      label: "Project Details",
      content: projectDetailsContent,
    },
    {
      label: "Project Requirements",
      content: projectRequirementsContent,
    }
  ], [clientInfoContent, projectDetailsContent, projectRequirementsContent]);

  return (
    <div className="space-y-6">
      <FormSection
        title="Client PO"
        subtitle="Enter the purchase order and client details"
        icon={FileText}
      >
        <Tabs tabs={tabs} defaultTab={0} />
      </FormSection>
    </div>
  );
}
