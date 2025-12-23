import React, { useState } from "react";
import { FileText, Upload, X, File } from "lucide-react";
import FormSection from "../shared/FormSection";
import AssigneeField from "../shared/AssigneeField";
import { useSalesOrderContext } from "../hooks";

export default function Step3_DesignEngineering() {
  const { state, updateDeepNestedField, updateField } = useSalesOrderContext();
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
      [type]: [
        ...prev[type],
        ...files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
      ],
    }));
    updateDesignField("attachments", type, [
      ...(uploadedFiles[type] || []),
      ...files,
    ]);
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
      <AssigneeField
        stepType="design_engineering"
        formData={state.formData}
        updateField={updateField}
        employees={state.employees}
      />
      <FormSection
        title="Design Documentation"
        subtitle="Upload raw design and required technical documents"
        icon={FileText}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-900 text-left mb-3 text-left">
              Raw Design Drawings *
            </label>
            <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-lg p-6 text-center hover:border-purple-500 hover:bg-purple-50 transition cursor-pointer">
              <input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, "drawings")}
                className="hidden"
                id="drawingsUpload"
                accept=".pdf,.dwg,.dxf,.step,.igs,.png,.jpg,.jpeg"
              />
              <label htmlFor="drawingsUpload" className="cursor-pointer block">
                <Upload className="mx-auto mb-2 text-purple-500" size={32} />
                <p className="text-slate-900 font-medium">
                  Click to upload or drag design files
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  PDF, DWG, DXF, STEP, IGS, PNG, JPG
                </p>
              </label>
            </div>
            {uploadedFiles.drawings.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-slate-900 text-left">
                  Uploaded Drawings:
                </h4>
                {uploadedFiles.drawings.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center text-xs justify-between bg-purple-50 border border-purple-200 p-3 rounded-lg"
                  >
                    <div className="flex items-center text-xs gap-2">
                      <File size={16} className="text-purple-600" />
                      <span className="text-sm text-slate-900">
                        {file.name}
                      </span>
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
            <label className="block text-sm font-medium text-slate-900 text-left mb-3 text-left">
              Required Documents *
            </label>
            <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-lg p-6 text-center hover:border-purple-500 hover:bg-purple-50 transition cursor-pointer">
              <input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, "documents")}
                className="hidden"
                id="documentsUpload"
                accept=".pdf,.doc,.docx,.xlsx,.txt"
              />
              <label htmlFor="documentsUpload" className="cursor-pointer block">
                <Upload className="mx-auto mb-2 text-purple-500" size={32} />
                <p className="text-slate-900 font-medium">
                  Click to upload or drag documents
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  PDF, DOC, DOCX, XLSX, TXT
                </p>
              </label>
            </div>
            {uploadedFiles.documents.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-slate-900 text-left">
                  Uploaded Documents:
                </h4>
                {uploadedFiles.documents.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center text-xs justify-between bg-purple-50 border border-purple-200 p-3 rounded-lg"
                  >
                    <div className="flex items-center text-xs gap-2">
                      <File size={16} className="text-purple-600" />
                      <span className="text-sm text-slate-900">
                        {file.name}
                      </span>
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
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Complete project specifications, dimensions, materials requirements, and manufacturing details will be available in the Design Engineer Dashboard for detailed work.
          </p>
        </div>
      </FormSection>
    </div>
  );
}
