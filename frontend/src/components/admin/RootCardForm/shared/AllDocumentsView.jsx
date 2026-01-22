import React, { useMemo } from "react";
import { File, Upload, ExternalLink } from "lucide-react";
import { useRootCardContext } from "../hooks";

export default function AllDocumentsView({ readOnly = false, onUploadPO }) {
  const { state } = useRootCardContext();
  const { formData, poDocuments } = state;

  const allFiles = useMemo(() => {
    const files = [];

    // Step 1: Client PO Documents
    if (Array.isArray(poDocuments)) {
      poDocuments.forEach(doc => {
        files.push({ ...doc, step: "Step 1", category: "Client PO", source: "poDocuments" });
      });
    }

    // Step 2: Design Engineering
    const design = formData.designEngineering || {};
    if (design.attachments) {
      if (Array.isArray(design.attachments.drawings)) {
        design.attachments.drawings.forEach(doc => {
          files.push({ ...doc, step: "Step 2", category: "Design Drawings", source: "designEngineering.drawings" });
        });
      }
      if (Array.isArray(design.attachments.documents)) {
        design.attachments.documents.forEach(doc => {
          files.push({ ...doc, step: "Step 2", category: "Technical Docs", source: "designEngineering.documents" });
        });
      }
    }

    // Future steps can be added here as they get upload capabilities
    // Step 5: Quality Check (if added later)
    // Step 6: Shipment (if added later)
    // Step 7: Delivery (if added later)

    return files;
  }, [formData, poDocuments]);

  return (
    <div className="space-y-6">
      {!readOnly && (
        <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-lg p-6 text-center hover:border-purple-500 hover:bg-purple-50 transition cursor-pointer relative">
          <input
            type="file"
            multiple
            onChange={onUploadPO}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="poDocumentsUploadAll"
          />
          <Upload className="mx-auto mb-2 text-purple-500" size={32} />
          <p className="text-slate-900 font-medium">Click to upload new PO files</p>
          <p className="text-slate-500 text-xs mt-1">Files will be added to Step 1: Client PO</p>
        </div>
      )}

      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-900">
            All Project Documents ({allFiles.length})
          </h4>
        </div>

        {allFiles.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p className="text-sm text-slate-500 italic">No documents uploaded in any step yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allFiles.map((file, idx) => (
              <div
                key={`${file.step}-${file.category}-${idx}`}
                className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <File size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 truncate max-w-[200px]">
                      {file.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">
                        {file.step}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">
                        {file.category}
                      </span>
                      {file.size && (
                        <span className="text-[10px] text-slate-400">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {file.path && (
                    <a 
                      href={file.path} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View File"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                  {/* We don't provide delete here to maintain step-specific control, 
                      or we could add it if desired */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Note:</strong> This view aggregates all files uploaded across the 7-step process. 
          To manage or remove specific files, please go to the respective step where they were uploaded.
        </p>
      </div>
    </div>
  );
}
