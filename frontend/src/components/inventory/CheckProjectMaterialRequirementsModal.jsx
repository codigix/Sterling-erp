import React, { useState, useEffect } from "react";
import { X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import axios from "@/utils/api";
import Swal from "sweetalert2";
import taskService from "@/utils/taskService";
import { useNavigate } from "react-router-dom";

const CheckProjectMaterialRequirementsModal = ({
  isOpen,
  onClose,
  projectId,
  taskId,
  materialRequestId,
  materialRequest,
}) => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [projectDetails, setProjectDetails] = useState(null);

  useEffect(() => {
    if (isOpen && (projectId || materialRequestId)) {
      fetchMaterialRequirements();
    }
  }, [isOpen, projectId, materialRequestId]);

  const fetchMaterialRequirements = async () => {
    setLoading(true);
    try {
      let response;
      const effectiveMRId = materialRequest?.id || materialRequestId;
      const effectiveRootCardId = materialRequest?.root_card_id || materialRequest?.rootCardId;
      
      const attempts = [
        () => effectiveMRId ? axios.get(`/inventory/material-requests/${effectiveMRId}/items`) : Promise.reject(),
        () => effectiveRootCardId ? axios.get(`/root-cards/requirements/${effectiveRootCardId}`) : Promise.reject(),
        () => projectId ? axios.get(`/root-cards/requirements/${projectId}`) : Promise.reject(),
      ];

      let lastError;
      for (const attempt of attempts) {
        try {
          response = await attempt();
          break;
        } catch (err) {
          lastError = err;
          continue;
        }
      }

      if (!response) {
        throw lastError || new Error('Could not fetch material requirements');
      }

      const data = response.data?.data || response.data;
      
      if (data.materials && Array.isArray(data.materials)) {
        setMaterials(data.materials);
      } else if (data.detail && data.detail.materials) {
        setMaterials(data.detail.materials);
      } else if (Array.isArray(data) && data.length > 0 && data[0].itemName) {
        setMaterials(data);
      } else {
        setMaterials([]);
      }
      
      setProjectDetails(data);
    } catch (error) {
      console.error("Error fetching material requirements:", error);
      Swal.fire(
        "Warning",
        "No material requirements found for this root card yet. You can create them from the root card details.",
        "info"
      );
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMaterialSelection = (materialId) => {
    const newSelection = new Set(selectedMaterials);
    if (newSelection.has(materialId)) {
      newSelection.delete(materialId);
    } else {
      newSelection.add(materialId);
    }
    setSelectedMaterials(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedMaterials.size === materials.length && materials.length > 0) {
      setSelectedMaterials(new Set());
    } else {
      setSelectedMaterials(new Set(materials.map((_, idx) => idx)));
    }
  };

  const handleCreateRFQ = async () => {
    if (selectedMaterials.size === 0) {
      Swal.fire("Warning", "Please select at least one material", "warning");
      return;
    }

    setIsCreating(true);
    try {
      const selectedMaterialsList = Array.from(selectedMaterials).map(
        (idx) => materials[idx]
      );

      const currentTaskId = taskService.getTaskIdFromParams();
      const rootId = new URLSearchParams(window.location.search).get(
        "materialRequestId"
      );

      if (currentTaskId) {
        await taskService.completeTask(currentTaskId);
      }

      const navigationParams = new URLSearchParams();
      if (projectId) navigationParams.append("projectId", projectId);
      if (effectiveMRId) navigationParams.append("materialRequestId", effectiveMRId);
      navigationParams.append("fromMaterialCheck", "true");

      Swal.fire(
        "Success",
        `Selected ${selectedMaterialsList.length} material(s) for RFQ. Proceeding to quotation creation...`,
        "success"
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));

      navigate(
        `/inventory-manager/quotations/sent?${navigationParams.toString()}`,
        {
          state: {
            selectedMaterials: selectedMaterialsList,
            projectId,
            materialRequestId: effectiveMRId,
            fromMaterialCheck: true,
          },
        }
      );

      onClose();
    } catch (error) {
      console.error("Error in RFQ creation process:", error);
      Swal.fire(
        "Error",
        "Failed to proceed with RFQ: " +
          (error.response?.data?.message || error.message),
        "error"
      );
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Check Material Request Requirements
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Review and select materials for RFQ quotation
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isCreating}
            className="text-slate-400 hover:text-slate-500 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : materials.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <AlertCircle size={40} className="text-blue-600 mb-3" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                No material requirements found yet
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Material requirements should be created from the project details first
              </p>
            </div>
          ) : (
            <>
              {/* Project Details Summary */}
              {projectDetails && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-slate-700 rounded-lg border border-blue-200 dark:border-slate-600">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Material Request Details
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">
                        Request ID
                      </p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {materialRequest?.mr_number || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">
                        Total Materials
                      </p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {materials.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">
                        Selected
                      </p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {selectedMaterials.size}/{materials.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">
                        Total Cost
                      </p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        ₹{(projectDetails.totalMaterialCost || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Select All Checkbox */}
              <div className="mb-4 flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={
                    selectedMaterials.size === materials.length &&
                    materials.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label
                  htmlFor="selectAll"
                  className="text-sm font-semibold text-slate-900 dark:text-white cursor-pointer flex-1"
                >
                  Select All Materials
                </label>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {materials.length} materials
                </span>
              </div>

              {/* Materials List */}
              <div className="space-y-2">
                {materials.map((material, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMaterials.has(idx)}
                      onChange={() => toggleMaterialSelection(idx)}
                      className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {material.itemName || material.description || "N/A"}
                        </h4>
                        {material.itemCode && (
                          <span className="text-xs bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">
                            {material.itemCode}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm mt-2">
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">
                            Quantity
                          </p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {material.quantity || 0} {material.unit || "Nos"}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">
                            Unit Price
                          </p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            ₹{(material.unitPrice || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">
                            Total
                          </p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            ₹
                            {(
                              (material.quantity || 0) *
                              (material.unitPrice || 0)
                            ).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">
                            Current Stock
                          </p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {material.currentStock || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">
                            Status
                          </p>
                          <p
                            className={`font-medium flex items-center gap-1 ${
                              (material.currentStock || 0) >= (material.quantity || 0)
                                ? "text-green-600"
                                : "text-orange-600"
                            }`}
                          >
                            {(material.currentStock || 0) >=
                            (material.quantity || 0) ? (
                              <>
                                <CheckCircle size={14} />
                                In Stock
                              </>
                            ) : (
                              <>
                                <AlertCircle size={14} />
                                Need to Order
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {material.specification && (
                        <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                          <p className="text-slate-600 dark:text-slate-400">
                            <strong>Specification:</strong> {material.specification}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isCreating}
            className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateRFQ}
            disabled={isCreating || selectedMaterials.size === 0 || loading || materials.length === 0}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            title={materials.length === 0 ? "No materials to select" : selectedMaterials.size === 0 ? "Select at least one material" : "Create RFQ with selected materials"}
          >
            {isCreating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating RFQ...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Create RFQ Quotation ({selectedMaterials.size})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckProjectMaterialRequirementsModal;
