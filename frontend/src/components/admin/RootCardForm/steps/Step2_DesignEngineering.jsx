import React, { useState, useEffect } from "react";
import { FileText, Upload, X, File, Loader2 } from "lucide-react";
import FormSection from "../shared/FormSection";
import AssigneeField from "../shared/AssigneeField";
import { useRootCardContext } from "../hooks";
import axios from "../../../../utils/api";

export default function Step2_DesignEngineering() {
  const { state, updateDeepNestedField, updateField, initialData } = useRootCardContext();
  const rootCardId = initialData?.id || state.createdOrderId;
  const designEng = state.formData.designEngineering || {};
  
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    drawings: designEng.attachments?.drawings || [],
    documents: designEng.attachments?.documents || [],
  });

  useEffect(() => {
    if (designEng.attachments) {
      setUploadedFiles({
        drawings: designEng.attachments.drawings || [],
        documents: designEng.attachments.documents || [],
      });
    }
  }, [designEng.attachments]);

  const updateDesignField = (subsection, field, value) => {
    updateDeepNestedField("designEngineering", subsection, field, value);
  };

  const handleFileUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (!rootCardId) {
      // If no rootCardId yet (still a draft), we can't upload to the design-engineering endpoint
      // We'll just keep them as File objects for now, but this is why we need a better strategy
      const newFilesData = files.map((f) => ({ name: f.name, size: f.size, type: f.type, isLocal: true, file: f }));
      
      setUploadedFiles((prev) => ({
        ...prev,
        [type]: [...(prev[type] || []), ...newFilesData],
      }));

      updateDesignField("attachments", type, [
        ...(designEng.attachments?.[type] || []),
        ...files,
      ]);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('documents', file);
      });

      const response = await axios.post(`/root-cards/steps/${rootCardId}/design-engineering/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data?.success) {
        const newlyUploaded = response.data.data.uploaded;
        // In the backend, uploadDesignDocuments adds to 'documents' JSON field.
        // But our frontend distinguishes between drawings and documents.
        // For now, we'll just add them to the requested type.
        
        const updatedFiles = [
          ...(designEng.attachments?.[type] || []),
          ...newlyUploaded
        ];

        updateDesignField("attachments", type, updatedFiles);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index, type) => {
    const updatedContextFiles = (designEng.attachments?.[type] || []).filter((_, i) => i !== index);
    updateDesignField("attachments", type, updatedContextFiles);
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
            <div className={`border-2 border-dashed border-slate-300 bg-slate-50 rounded-lg p-6 text-center hover:border-purple-500 hover:bg-purple-50 transition cursor-pointer relative ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, "drawings")}
                className="hidden"
                id="drawingsUpload"
                accept=".pdf,.dwg,.dxf,.step,.igs,.png,.jpg,.jpeg"
                disabled={uploading}
              />
              <label htmlFor="drawingsUpload" className="cursor-pointer block">
                {uploading ? (
                  <Loader2 className="mx-auto mb-2 text-purple-500 animate-spin" size={32} />
                ) : (
                  <Upload className="mx-auto mb-2 text-purple-500" size={32} />
                )}
                <p className="text-slate-900 font-medium">
                  {uploading ? "Uploading..." : "Click to upload or drag design files"}
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
            <div className={`border-2 border-dashed border-slate-300 bg-slate-50 rounded-lg p-6 text-center hover:border-purple-500 hover:bg-purple-50 transition cursor-pointer relative ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, "documents")}
                className="hidden"
                id="documentsUpload"
                accept=".pdf,.doc,.docx,.xlsx,.txt"
                disabled={uploading}
              />
              <label htmlFor="documentsUpload" className="cursor-pointer block">
                {uploading ? (
                  <Loader2 className="mx-auto mb-2 text-purple-500 animate-spin" size={32} />
                ) : (
                  <Upload className="mx-auto mb-2 text-purple-500" size={32} />
                )}
                <p className="text-slate-900 font-medium">
                  {uploading ? "Uploading..." : "Click to upload or drag documents"}
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
