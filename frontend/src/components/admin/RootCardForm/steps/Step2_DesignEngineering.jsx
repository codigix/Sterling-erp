import React, { useState, useCallback } from "react";
import { FileText, Upload, X, File, Loader2 } from "lucide-react";
import FormSection from "../shared/FormSection";
import AssigneeField from "../shared/AssigneeField";
import { useRootCardContext } from "../hooks";
import axios from "../../../../utils/api";
import { showError } from "../../../../utils/toastUtils";

export default function Step2_DesignEngineering({ readOnly = false }) {
  const { state, updateDeepNestedField, updateField, initialData } = useRootCardContext();
  const rootCardId = initialData?.id || state.createdOrderId;
  const designEng = state.formData.designEngineering || {};
  
  const drawings = React.useMemo(() => designEng.attachments?.drawings || [], [designEng.attachments]);
  const documents = React.useMemo(() => designEng.attachments?.documents || [], [designEng.attachments]);
  
  const [uploading, setUploading] = useState(false);

  const updateDesignField = useCallback((subsection, field, value) => {
    updateDeepNestedField("designEngineering", subsection, field, value);
  }, [updateDeepNestedField]);

  const handleFileUpload = useCallback(async (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (!rootCardId) {
      const newFilesData = files.map((f) => ({ 
        name: f.name, 
        size: f.size, 
        type: f.type, 
        isLocal: true, 
        file: f 
      }));
      
      const currentFiles = type === "drawings" ? (designEng.attachments?.drawings || []) : (designEng.attachments?.documents || []);
      const updatedFiles = [...currentFiles, ...newFilesData];

      updateDesignField("attachments", type, updatedFiles);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('documents', file);
      });
      formData.append('type', type);

      const response = await axios.post(`/root-cards/steps/${rootCardId}/design-engineering/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log(`[Step2] Upload response for type "${type}":`, JSON.stringify(response.data, null, 2));

      if (response.data?.success) {
        const newlyUploaded = response.data.data.uploaded;
        console.log(`[Step2] Newly uploaded files (${type}):`, JSON.stringify(newlyUploaded, null, 2));
        
        const currentFiles = type === "drawings" ? (designEng.attachments?.drawings || []) : (designEng.attachments?.documents || []);
        console.log(`[Step2] Current files before update:`, JSON.stringify(currentFiles, null, 2));
        
        const updatedFiles = [...currentFiles, ...newlyUploaded];
        console.log(`[Step2] Updated files after merge:`, JSON.stringify(updatedFiles, null, 2));

        updateDesignField("attachments", type, updatedFiles);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      showError("Failed to upload files. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [rootCardId, designEng.attachments, updateDesignField]);

  const removeFile = useCallback((index, type) => {
    const currentFiles = type === "drawings" ? (designEng.attachments?.drawings || []) : (designEng.attachments?.documents || []);
    const updatedFiles = currentFiles.filter((_, i) => i !== index);
    updateDesignField("attachments", type, updatedFiles);
  }, [designEng.attachments, updateDesignField]);

  const content = React.useMemo(() => (
    <div className="space-y-6">
      <AssigneeField
        stepType="designEngineering"
        formData={state.formData}
        updateField={updateField}
        employees={state.employees}
        readOnly={readOnly}
      />
      <FormSection
        title="Design Documentation"
        subtitle="Upload raw design and required technical documents"
        icon={FileText}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-900 text-left mb-3">
              Raw Design Drawings *
            </label>
            <div className={`border-2 border-dashed border-slate-300 bg-slate-50 rounded-lg p-6 text-center hover:border-purple-500 hover:bg-purple-50 transition cursor-pointer relative ${uploading || readOnly ? 'opacity-50 pointer-events-none' : ''}`}>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, "drawings")}
                className="hidden"
                id="drawingsUpload"
                accept=".pdf,.dwg,.dxf,.step,.stp,.igs,.iges,.png,.jpg,.jpeg,.zip,.rar"
                disabled={uploading || readOnly}
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
                  PDF, DWG, DXF, STEP, IGS, PNG, JPG, ZIP, RAR
                </p>
              </label>
            </div>
            {drawings.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-slate-900 text-left">
                  Uploaded Drawings:
                </h4>
                {drawings.map((file, idx) => (
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
                    {!readOnly && (
                      <button
                        onClick={() => removeFile(idx, "drawings")}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 text-left mb-3">
              Required Documents *
            </label>
            <div className={`border-2 border-dashed border-slate-300 bg-slate-50 rounded-lg p-6 text-center hover:border-purple-500 hover:bg-purple-50 transition cursor-pointer relative ${uploading || readOnly ? 'opacity-50 pointer-events-none' : ''}`}>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, "documents")}
                className="hidden"
                id="documentsUpload"
                accept=".pdf,.doc,.docx,.xlsx,.xls,.txt,.csv,.zip,.rar,.ppt,.pptx"
                disabled={uploading || readOnly}
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
                  PDF, DOC, DOCX, XLSX, TXT, CSV, ZIP, PPTX
                </p>
              </label>
            </div>
            {documents.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-slate-900 text-left">
                  Uploaded Documents:
                </h4>
                {documents.map((file, idx) => (
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
                    {!readOnly && (
                      <button
                        onClick={() => removeFile(idx, "documents")}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    )}
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
  ), [
    state.formData, 
    state.employees, 
    readOnly, 
    uploading, 
    drawings, 
    documents, 
    handleFileUpload, 
    removeFile, 
    updateField
  ]);

  return content;
}
