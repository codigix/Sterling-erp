import React, { useState } from "react";
import { FileText, Upload, X, File } from "lucide-react";
import Input from "../../../ui/Input";
import FormSection from "../shared/FormSection";
import FormRow from "../shared/FormRow";
import { useFormData, useSalesOrderContext } from "../hooks";

export default function Step3_DesignEngineering() {
  const { formData } = useFormData();
  const { state, updateDeepNestedField } = useSalesOrderContext();
  const designEng = state.formData.designEngineering || {};
  const [uploadedFiles, setUploadedFiles] = useState({
    drawings: designEng.attachments?.drawings || [],
    documents: designEng.attachments?.documents || [],
  });

  const updateDesignField = (subsection, field, value) => {
    updateDeepNestedField("designEngineering", subsection, field, value);
  };

  const handleFileUpload = (e, type) => {
    const files = Array.from(e.target.files);
    setUploadedFiles((prev) => ({
      ...prev,
      [type]: [...prev[type], ...files.map((f) => ({ name: f.name, size: f.size, type: f.type }))],
    }));
    updateDesignField("attachments", type, [...(uploadedFiles[type] || []), ...files]);
  };

  const removeFile = (index, type) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
    const updatedFiles = uploadedFiles[type].filter((_, i) => i !== index);
    updateDesignField("attachments", type, updatedFiles);
  };

  return (
    <div className="space-y-6">
      <FormSection
        title="Design Overview"
        subtitle="Basic design information and details"
        icon={FileText}
      >
        <FormRow cols={2}>
          <Input
            label="Design ID"
            value={designEng.generalDesignInfo?.designId || ""}
            onChange={(e) => updateDesignField("generalDesignInfo", "designId", e.target.value)}
            placeholder="e.g., DES-2024-001"
          />
          <Input
            label="Product Name *"
            value={designEng.productSpecification?.productName || ""}
            onChange={(e) => updateDesignField("productSpecification", "productName", e.target.value)}
            placeholder="e.g., CCIS Container Stand"
            required
          />
        </FormRow>
        <FormRow cols={2}>
          <Input
            label="Design Status"
            value={designEng.generalDesignInfo?.designStatus || "Pending"}
            onChange={(e) => updateDesignField("generalDesignInfo", "designStatus", e.target.value)}
            placeholder="Pending / In Progress / Completed"
          />
          <Input
            label="Design Engineer Name"
            value={designEng.generalDesignInfo?.designEngineerName || ""}
            onChange={(e) => updateDesignField("generalDesignInfo", "designEngineerName", e.target.value)}
            placeholder="Enter engineer name"
          />
        </FormRow>
      </FormSection>

      <FormSection
        title="Product Dimensions & Specifications"
        subtitle="Key specifications and operational parameters"
        icon={FileText}
      >
        <FormRow cols={3}>
          <Input
            label="Length (mm)"
            value={designEng.productSpecification?.systemLength || ""}
            onChange={(e) => updateDesignField("productSpecification", "systemLength", e.target.value)}
            placeholder="e.g., 3000"
          />
          <Input
            label="Width (mm)"
            value={designEng.productSpecification?.systemWidth || ""}
            onChange={(e) => updateDesignField("productSpecification", "systemWidth", e.target.value)}
            placeholder="e.g., 2000"
          />
          <Input
            label="Height (mm)"
            value={designEng.productSpecification?.systemHeight || ""}
            onChange={(e) => updateDesignField("productSpecification", "systemHeight", e.target.value)}
            placeholder="e.g., 1500"
          />
        </FormRow>
        <FormRow cols={2}>
          <Input
            label="Load Capacity (kg)"
            value={designEng.productSpecification?.loadCapacity || ""}
            onChange={(e) => updateDesignField("productSpecification", "loadCapacity", e.target.value)}
            placeholder="e.g., 6000"
          />
          <Input
            label="Operating Environment"
            value={designEng.productSpecification?.operatingEnvironment || ""}
            onChange={(e) => updateDesignField("productSpecification", "operatingEnvironment", e.target.value)}
            placeholder="e.g., Indoor, Outdoor, Humid"
          />
        </FormRow>
        <FormRow cols={2}>
          <Input
            label="Material Grade"
            value={designEng.productSpecification?.materialGrade || ""}
            onChange={(e) => updateDesignField("productSpecification", "materialGrade", e.target.value)}
            placeholder="e.g., EN8, ASTM A36"
          />
          <Input
            label="Surface Finish"
            value={designEng.productSpecification?.surfaceFinish || ""}
            onChange={(e) => updateDesignField("productSpecification", "surfaceFinish", e.target.value)}
            placeholder="e.g., Painted, Powder coated"
          />
        </FormRow>
      </FormSection>

      <FormSection
        title="Materials Required for Production"
        subtitle="Specify all material types needed to produce this design"
        icon={FileText}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 text-left">
              Steel Sections Required
            </label>
            <Input
              value={designEng.materialsRequired?.steelSections || ""}
              onChange={(e) => updateDesignField("materialsRequired", "steelSections", e.target.value)}
              placeholder="e.g., ISMB 100-500mm, ISA angles, Channels, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 text-left">
              Plates Required
            </label>
            <Input
              value={designEng.materialsRequired?.plates || ""}
              onChange={(e) => updateDesignField("materialsRequired", "plates", e.target.value)}
              placeholder="e.g., MS plates 10mm, 12mm, Stainless steel plates, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 text-left">
              Fasteners & Hardware
            </label>
            <Input
              value={designEng.materialsRequired?.fasteners || ""}
              onChange={(e) => updateDesignField("materialsRequired", "fasteners", e.target.value)}
              placeholder="e.g., M16 bolts, M10 screws, Lock nuts, Washers, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 text-left">
              Mechanical Components
            </label>
            <Input
              value={designEng.materialsRequired?.components || ""}
              onChange={(e) => updateDesignField("materialsRequired", "components", e.target.value)}
              placeholder="e.g., Roller wheels, Bearings, Gear boxes, Motors, Cables, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 text-left">
              Electrical & Automation
            </label>
            <Input
              value={designEng.materialsRequired?.electrical || ""}
              onChange={(e) => updateDesignField("materialsRequired", "electrical", e.target.value)}
              placeholder="e.g., Control panels, Sensors, PLC, Limit switches, VFD, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 text-left">
              Consumables & Paint
            </label>
            <Input
              value={designEng.materialsRequired?.consumables || ""}
              onChange={(e) => updateDesignField("materialsRequired", "consumables", e.target.value)}
              placeholder="e.g., Welding consumables, Primer, Paint, Grease, etc."
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Design Specifications & Documentation"
        subtitle="Upload technical drawings and design documents"
        icon={FileText}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3 text-left">
              Design Drawings *
            </label>
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer bg-slate-900/50">
              <input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, "drawings")}
                className="hidden"
                id="drawingsUpload"
                accept=".pdf,.dwg,.dxf,.step,.igs,.png,.jpg,.jpeg"
              />
              <label htmlFor="drawingsUpload" className="cursor-pointer block">
                <Upload className="mx-auto mb-2 text-slate-400" size={32} />
                <p className="text-slate-300 font-medium">Click to upload or drag drawings</p>
                <p className="text-slate-500 text-xs mt-1">PDF, DWG, DXF, STEP, IGS, PNG, JPG</p>
              </label>
            </div>
            {uploadedFiles.drawings.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-slate-300">Uploaded Drawings:</h4>
                {uploadedFiles.drawings.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-800 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <File size={16} className="text-blue-400" />
                      <span className="text-sm text-slate-300">{file.name}</span>
                    </div>
                    <button
                      onClick={() => removeFile(idx, "drawings")}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3 text-left">
              Supporting Documents
            </label>
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer bg-slate-900/50">
              <input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, "documents")}
                className="hidden"
                id="documentsUpload"
                accept=".pdf,.doc,.docx,.xlsx,.txt"
              />
              <label htmlFor="documentsUpload" className="cursor-pointer block">
                <Upload className="mx-auto mb-2 text-slate-400" size={32} />
                <p className="text-slate-300 font-medium">Click to upload or drag documents</p>
                <p className="text-slate-500 text-xs mt-1">PDF, DOC, DOCX, XLSX, TXT</p>
              </label>
            </div>
            {uploadedFiles.documents.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-slate-300">Uploaded Documents:</h4>
                {uploadedFiles.documents.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-800 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <File size={16} className="text-green-400" />
                      <span className="text-sm text-slate-300">{file.name}</span>
                    </div>
                    <button
                      onClick={() => removeFile(idx, "documents")}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Design Notes & Special Requirements"
        subtitle="Additional specifications and manufacturing notes"
        icon={FileText}
      >
        <Input
          label="Design Specifications Summary"
          value={designEng.commentsNotes?.designSpecifications || ""}
          onChange={(e) => updateDesignField("commentsNotes", "designSpecifications", e.target.value)}
          placeholder="Detailed technical specifications and design features"
        />
        <Input
          label="Manufacturing Instructions"
          value={designEng.commentsNotes?.manufacturingInstructions || ""}
          onChange={(e) => updateDesignField("commentsNotes", "manufacturingInstructions", e.target.value)}
          placeholder="Special instructions for fabrication, assembly, and testing"
        />
        <Input
          label="Quality & Safety Requirements"
          value={designEng.commentsNotes?.qualitySafety || ""}
          onChange={(e) => updateDesignField("commentsNotes", "qualitySafety", e.target.value)}
          placeholder="QC checkpoints, safety standards, and testing requirements"
        />
        <Input
          label="Additional Notes"
          value={designEng.commentsNotes?.additionalNotes || ""}
          onChange={(e) => updateDesignField("commentsNotes", "additionalNotes", e.target.value)}
          placeholder="Any other relevant information or special requirements"
        />
      </FormSection>
    </div>
  );
}
