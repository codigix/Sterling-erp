import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Briefcase,
  FileText,
  Loader2,
  ArrowLeft,
  Check,
  Send,
  Calendar,
  Upload,
  FileCheck,
  File,
  Search,
} from "lucide-react";
import axios from "../../utils/api";
import Swal from "sweetalert2";
import { useRootCardInventoryTask } from "../../hooks/useRootCardInventoryTask";

const CreateQuotationModal = ({
  isOpen,
  onClose,
  onQuotationCreated,
  initialData = null,
  preFilledMaterials = null,
  vendors = [],
  rootCards = [],
  materialRequests = [],
}) => {
  const { completeCurrentTask } = useRootCardInventoryTask();
  const [submitting, setSubmitting] = useState(false);
  const [analysisMode, setAnalysisMode] = useState(false);
  const [rootCardMaterials, setRootCardMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [savingRequirements, setSavingRequirements] = useState(false);
  const [rootCardQuotations, setRootCardQuotations] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const [formData, setFormData] = useState({
    vendor_id: "",
    root_card_id: "",
    total_amount: 0,
    valid_until: "",
    items: [],
    notes: "",
    type: "outbound",
    reference_id: null,
    material_request_id: null,
    document_path: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData((prev) => ({
          ...prev,
          ...initialData,
        }));

        // If material_request_id is provided, automatically load its items
        if (initialData.material_request_id && (!initialData.items || initialData.items.length === 0)) {
          handleMaterialRequestChange({ target: { value: initialData.material_request_id } });
        }
      }

      if (preFilledMaterials) {
        setFormData((prev) => ({
          ...prev,
          items: preFilledMaterials.map((m) => ({
            description: m.description || m.item_name || m.material_name || m.itemName || "",
            item_code: m.item_code || m.material_code || "",
            material_id: m._id || m.id,
            quantity: m.quantity || m.requiredQuantity || 0,
            unit_price: 0,
            unit: m.unit || "",
          })),
          root_card_id: preFilledMaterials[0]?.rootCardId || prev.root_card_id,
          material_request_id: preFilledMaterials[0]?.material_request_id || prev.material_request_id,
        }));
      }
    }
  }, [isOpen, initialData, preFilledMaterials]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { item_code: "", description: "", quantity: "", unit: "", unit_price: "" }],
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const newItems = prev.items.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            [field]:
              field === "description" || field === "item_code" || field === "unit"
                ? value
                : value === ""
                ? ""
                : parseFloat(value) || 0,
          };
        }
        return item;
      });

      const newTotal = newItems.reduce(
        (sum, item) => sum + (item.quantity * item.unit_price || 0),
        0
      );
      return {
        ...prev,
        items: newItems,
        total_amount: newTotal,
      };
    });
  };

  const handleAnalyzeFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFileName(file.name);

    const analysisFormData = new FormData();
    analysisFormData.append("file", file);
    analysisFormData.append("items", JSON.stringify(formData.items));

    try {
      setAnalyzing(true);
      const response = await axios.post("/inventory/quotations/analyze", analysisFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setFormData((prev) => ({
        ...prev,
        items: response.data.items,
        total_amount: response.data.total_amount,
        // We don't set document_path because we aren't storing the file permanently 
        // until the user actually records the quote, but since the user said 
        // "dont store the uploaded file", we might skip storing it entirely if requested.
        // For now, we just fill the prices.
      }));

      const missingPrices = response.data.items.filter(item => item.unit_price === 0).length;
      if (missingPrices > 0) {
        Swal.fire({
          title: "Analysis Complete",
          text: `Prices extracted for most items, but ${missingPrices} items could not be automatically matched. Please enter them manually.`,
          icon: "info",
          confirmButtonText: "Ok"
        });
      } else {
        Swal.fire("Success", "Prices fetched successfully from the document!", "success");
      }
    } catch (error) {
      console.error("Error analyzing quotation:", error);
      Swal.fire("Error", error.response?.data?.message || "Failed to analyze document", "error");
    } finally {
      setAnalyzing(false);
      // e.target.value = ''; // Keep it if we want to show it's "selected"
    }
  };

  const handleRootCardChange = async (e) => {
    const selectedRootCardId = e.target.value;

    setFormData((prev) => ({
      ...prev,
      root_card_id: selectedRootCardId,
      reference_id: null,
      items: [],
    }));

    if (!selectedRootCardId) {
      setRootCardMaterials([]);
      setRootCardQuotations([]);
      setAnalysisMode(false);
      return;
    }

    try {
      if (formData.type === "outbound") {
        setLoadingMaterials(true);
        const reqResponse = await axios.get(
          `/root-cards/requirements/${selectedRootCardId}`
        );
        const reqData = reqResponse.data.data;

        let parsedMaterials = reqData.materials || [];
        if (typeof parsedMaterials === "string") {
          parsedMaterials = JSON.parse(parsedMaterials);
        }

        const initializedMaterials = parsedMaterials.map((m) => ({
          ...m,
          selected:
            (parseFloat(m.requiredQuantity) || 0) >
            (parseFloat(m.currentStock) || 0),
        }));

        setRootCardMaterials(initializedMaterials);
        setAnalysisMode(true);
      } else {
        const quotesResponse = await axios.get(
          `/inventory/quotations/root-card/${selectedRootCardId}`
        );
        setRootCardQuotations(quotesResponse.data);
      }
    } catch (error) {
      console.error("Error fetching root card data:", error);
      Swal.fire("Error", "Failed to load root card details", "error");
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleMaterialRequestChange = async (e) => {
    const mrId = e.target.value;
    if (!mrId) {
      setFormData((prev) => ({
        ...prev,
        reference_id: null,
        material_request_id: null,
        items: [],
      }));
      return;
    }

    try {
      setLoadingMaterials(true);
      const response = await axios.get(`/inventory/material-requests/${mrId}`);
      const mr = response.data.materialRequest;

      if (mr) {
        let items = mr.items || [];
        if (typeof items === "string") {
          try {
            items = JSON.parse(items);
          } catch (e) {
            console.error("Error parsing MR items:", e);
            items = [];
          }
        }

        setFormData((prev) => ({
          ...prev,
          reference_id: null,
          material_request_id: mr.id,
          root_card_id: mr.sales_order_id || prev.root_card_id,
          items: (Array.isArray(items) ? items : []).map((item) => ({
            item_code: item.item_code || item.material_code || "",
            description: item.item_name || item.material_name || item.description || item.itemName || "",
            quantity: item.quantity || 0,
            unit: item.unit || "",
            unit_price: 0,
          })),
        }));
      }
    } catch (error) {
      console.error("Error fetching material request details:", error);
      Swal.fire("Error", "Failed to load material request details", "error");
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleOutboundQuotationSelect = (e) => {
    const quoteId = e.target.value;
    if (!quoteId) return;

    const selectedQuote = rootCardQuotations.find(
      (q) => q.id.toString() === quoteId
    );
    if (selectedQuote) {
      setFormData((prev) => ({
        ...prev,
        reference_id: selectedQuote.id,
        vendor_id: selectedQuote.vendor_id,
        material_request_id: selectedQuote.material_request_id,
        items: (selectedQuote.items || []).map((item) => ({
          item_code: item.item_code || item.material_code || "",
          description: item.description,
          category: item.category || item.materialType || "",
          quantity: item.quantity,
          unit: item.unit || "",
          unit_price: 0,
        })),
        notes: `Response to ${selectedQuote.quotation_number}`,
      }));
    }
  };

  const handleRequirementChange = (index, field, value) => {
    setRootCardMaterials((prev) => {
      const newMaterials = [...prev];
      newMaterials[index] = { ...newMaterials[index], [field]: value };

      if (field === "requiredQuantity") {
        const required = parseFloat(value) || 0;
        const stock = parseFloat(newMaterials[index].currentStock) || 0;
        newMaterials[index].selected = required > stock;
      }

      return newMaterials;
    });
  };

  const handleSaveRequirements = async () => {
    if (!formData.root_card_id) return;

    try {
      setSavingRequirements(true);
      await axios.post(`/root-cards/requirements/${formData.root_card_id}`, {
        materials: rootCardMaterials.map((m) => {
          const rest = { ...m };
          delete rest.selected;
          return rest;
        }),
        procurementStatus: "pending",
      });

      const selectedItems = rootCardMaterials.filter((m) => m.selected);
      const items = selectedItems.map((m) => ({
        item_code: m.itemCode || m.material_code || "",
        description: m.itemName || m.item_name || "Unnamed Material",
        category: m.category || m.materialType || "",
        quantity: Math.max(
          0,
          (parseFloat(m.requiredQuantity) || 0) -
            (parseFloat(m.currentStock) || 0)
        ),
        unit: m.unit || "",
        unit_price: 0,
      }));

      setFormData((prev) => ({ ...prev, items }));
      setAnalysisMode(false);
    } catch (error) {
      console.error("Error saving requirements:", error);
      Swal.fire("Error", "Failed to save requirements", "error");
    } finally {
      setSavingRequirements(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vendor_id) {
      Swal.fire("Warning", "Please select a vendor", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const notesWithRef = formData.root_card_id
        ? `Ref: Root Card ${formData.root_card_id}\n\n${formData.notes}`
        : formData.notes;

      const payload = {
        ...formData,
        root_card_id: formData.root_card_id
          ? parseInt(formData.root_card_id)
          : null,
        reference_id: (formData.type === "inbound" && formData.reference_id && !isNaN(formData.reference_id))
          ? parseInt(formData.reference_id)
          : null,
        notes: notesWithRef,
        total_amount: formData.total_amount || 0,
        items: formData.items || [],
      };

      await axios.post("/inventory/quotations", payload);

      if (formData.type === "inbound") {
        await completeCurrentTask("Vendor quotation response recorded");
      } else if (formData.type === "outbound") {
        await completeCurrentTask("RFQ Quotation (RFQ) created");
      }

      if (onQuotationCreated) {
        onQuotationCreated();
      }
      
      onClose();
      Swal.fire("Success", "Quotation created successfully", "success");
    } catch (err) {
      console.error("Error creating quotation:", err);
      Swal.fire("Error", "Failed to create quotation", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "₹0";
    return `₹${value.toLocaleString("en-IN")}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-slate-700 dark:to-slate-800 flex justify-between items-center px-8 py-6 border-b border-slate-200 dark:border-slate-600">
          <div className="flex items-center gap-3">
            {analysisMode && (
              <button
                onClick={() => setAnalysisMode(false)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition"
              >
                <ArrowLeft
                  size={20}
                  className="text-slate-600 dark:text-slate-400"
                />
              </button>
            )}
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {analysisMode
                  ? "Material Analysis"
                  : formData.type === "inbound"
                  ? "Record Vendor Quote"
                  : "Create Quote Request (RFQ)"}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {analysisMode
                  ? "Review root card stock availability"
                  : formData.type === "inbound"
                  ? "Record details from vendor response"
                  : "Create a new vendor quotation request"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {analysisMode ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {loadingMaterials ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
              ) : rootCardMaterials.length === 0 ? (
                <p className="text-center py-8 text-slate-500">
                  No materials found for this root card.
                </p>
              ) : (
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                          Include
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                          Material
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                          Current Stock
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                          Required Qty
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                          Shortage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {rootCardMaterials.map((material, idx) => {
                        const required =
                          parseFloat(material.requiredQuantity) || 0;
                        const stock = parseFloat(material.currentStock) || 0;
                        const shortage = Math.max(0, required - stock);

                        return (
                          <tr
                            key={idx}
                            className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition ${
                              shortage > 0
                                ? "bg-red-50/30 dark:bg-red-900/10"
                                : ""
                            }`}
                          >
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={material.selected || false}
                                onChange={(e) =>
                                  handleRequirementChange(
                                    idx,
                                    "selected",
                                    e.target.checked
                                  )
                                }
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-slate-900 dark:text-white text-xs">
                                {material.itemName}
                              </div>
                              <div className="text-xs text-slate-500">
                                {material.category || material.materialType}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                              {stock}
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="0"
                                value={material.requiredQuantity}
                                onChange={(e) =>
                                  handleRequirementChange(
                                    idx,
                                    "requiredQuantity",
                                    e.target.value
                                  )
                                }
                                className="w-24 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-sm font-bold ${
                                  shortage > 0 ? "text-red-600" : "text-green-600"
                                }`}
                              >
                                {shortage}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="px-8 py-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button
                onClick={() => setAnalysisMode(false)}
                className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors font-medium"
              >
                Skip Analysis
              </button>
              <button
                onClick={handleSaveRequirements}
                disabled={savingRequirements || rootCardMaterials.length === 0}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {savingRequirements ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Check size={18} />
                )}
                Save & Continue
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-hidden flex flex-col"
          >
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              <div className="space-y-4">
                {!preFilledMaterials && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Select Material Request (Optional)
                    </label>
                    <div className="relative">
                      {loadingMaterials ? (
                        <Loader2
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 animate-spin"
                          size={18}
                        />
                      ) : (
                        <FileText
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          size={18}
                        />
                      )}
                      <select
                        value={formData.material_request_id || ""}
                        onChange={handleMaterialRequestChange}
                        disabled={loadingMaterials}
                        className="w-full px-4 py-3 pl-11 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      >
                        <option value="">
                          Select Material Request to Load Items
                        </option>
                        {materialRequests.map((mr) => (
                          <option key={mr.id} value={mr.id}>
                            {mr.mr_number} - {mr.department} (
                            {formatDate(mr.created_at)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {formData.type === "inbound" && formData.root_card_id && (
                  <div>
                    {rootCardQuotations.length > 0 ? (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Select Outbound Quotation (RFQ){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          onChange={handleOutboundQuotationSelect}
                          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        >
                          <option value="">-- Select Quotation --</option>
                          {rootCardQuotations.map((q) => (
                            <option key={q.id} value={q.id}>
                              {q.quotation_number} ({q.vendor_name}) -{" "}
                              {formatDate(q.created_at)}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          ℹ️ No RFQs found for this root card. Create an RFQ
                          from the "Sent Requests" tab first.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Vendor <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="vendor_id"
                      value={formData.vendor_id}
                      onChange={handleFormChange}
                      required
                      disabled={formData.type === "inbound" && formData.reference_id}
                      className={`w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                        formData.type === "inbound" && formData.reference_id
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <option value="">-- Select a Vendor --</option>
                      {vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name}{" "}
                          {vendor.vendor_type
                            ? `(${vendor.vendor_type
                                .replace("_", " ")
                                .toUpperCase()})`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Valid Until
                    </label>
                    <input
                      type="date"
                      name="valid_until"
                      value={formData.valid_until}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* {formData.root_card_id && !preFilledMaterials && (
                  <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                    <span className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                      <Check size={16} />
                      Materials loaded from root card analysis
                    </span>
                    <button
                      type="button"
                      onClick={() => setAnalysisMode(true)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 underline"
                    >
                      Re-Analyze
                    </button>
                  </div>
                )} */}

                {formData.type === "inbound" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Total Amount (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-slate-500 dark:text-slate-400 font-medium">
                          ₹
                        </span>
                        <input
                          type="number"
                          name="total_amount"
                          value={formData.total_amount}
                          onChange={handleFormChange}
                          placeholder="0.00"
                          step="0.01"
                          disabled
                          className="w-full pl-8 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition opacity-75 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Quotation Document (PDF/Image)
                      </label>
                      <div className="relative w-full h-full">
                        <input
                          type="file"
                          id="quotation-upload"
                          className="hidden"
                          accept=".pdf,image/*"
                          onChange={handleAnalyzeFile}
                          disabled={analyzing}
                        />
                        <label
                          htmlFor="quotation-upload"
                          className={`flex items-center justify-center gap-3 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all w-full h-[50px] ${
                            uploadedFileName
                              ? "border-green-500 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400"
                              : "border-slate-300 dark:border-slate-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {analyzing ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              <span className="text-xs font-medium">Analyzing...</span>
                            </>
                          ) : uploadedFileName ? (
                            <>
                              <FileCheck size={18} />
                              <span className="text-xs font-medium truncate max-w-[200px]">
                                {uploadedFileName}
                              </span>
                            </>
                          ) : (
                            <>
                              <Upload size={18} />
                              <span className="text-xs font-medium">Click to upload for auto-fill</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Line Items
                    </label>
                    {!preFilledMaterials && (
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium whitespace-nowrap"
                      >
                        <Plus size={14} />
                        Add Item
                      </button>
                    )}
                  </div>

                  {formData.items.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
                      No items added yet. Click "Add Item" to include line
                      items in this quotation.
                    </p>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                      <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-[11px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200 dark:border-slate-700 w-64">
                              Item Code
                            </th>
                            <th className="px-4 py-3 text-left text-[11px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200 dark:border-slate-700">
                              Description
                            </th>
                            <th className="px-4 py-3 text-center text-[11px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200 dark:border-slate-700 w-32">
                              Qty
                            </th>
                            <th className="px-4 py-3 text-center text-[11px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200 dark:border-slate-700 w-28">
                              Unit
                            </th>
                            {formData.type === "inbound" && (
                              <>
                                <th className="px-4 py-3 text-right text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200 dark:border-slate-700 w-32">
                                  Price
                                </th>
                                <th className="px-4 py-3 text-right text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200 dark:border-slate-700 w-32">
                                  Total
                                </th>
                              </>
                            )}
                            {!preFilledMaterials && (
                              <th className="px-4 py-3 text-center text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200 dark:border-slate-700 w-16"></th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                          {formData.items.map((item, index) => (
                            <tr
                              key={index}
                              className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition group"
                            >
                              <td className="px-4 py-2 w-64">
                                <input
                                  type="text"
                                  value={item.item_code}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "item_code",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Item Code"
                                  disabled={preFilledMaterials}
                                  className="w-full px-2 py-1.5 text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded bg-white dark:bg-slate-900 transition-all uppercase disabled:opacity-80"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Item name/details"
                                  disabled={preFilledMaterials}
                                  className="w-full px-2 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded bg-white dark:bg-slate-900 transition-all disabled:opacity-80"
                                />
                              </td>
                              <td className="px-4 py-2 w-32">
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "quantity",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                  min="0"
                                  step="any"
                                  disabled={preFilledMaterials}
                                  className="w-full px-2 py-1.5 text-xs font-bold text-center text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded bg-white dark:bg-slate-900 transition-all disabled:opacity-80"
                                />
                              </td>
                              <td className="px-4 py-2 w-28">
                                <input
                                  type="text"
                                  value={item.unit}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "unit",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Unit"
                                  disabled={preFilledMaterials}
                                  className="w-full px-2 py-1.5 text-xs font-bold text-center text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded bg-white dark:bg-slate-900 transition-all disabled:opacity-80"
                                />
                              </td>
                              {formData.type === "inbound" && (
                                <>
                                  <td className="px-4 py-2">
                                    <input
                                      type="number"
                                      value={item.unit_price}
                                      onChange={(e) =>
                                        handleItemChange(
                                          index,
                                          "unit_price",
                                          e.target.value
                                        )
                                      }
                                      placeholder="0.00"
                                      min="0"
                                      step="0.01"
                                      className="w-full px-2 py-1.5 text-xs font-bold text-right text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded bg-transparent transition-all"
                                    />
                                  </td>
                                  <td className="px-4 py-2 text-right">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                                      {formatCurrency(
                                        item.quantity * item.unit_price
                                      )}
                                    </span>
                                  </td>
                                </>
                              )}
                              {!preFilledMaterials && (
                                <td className="px-4 py-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                        {formData.type === "inbound" && (
                          <tfoot className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                              <td
                                colSpan="5"
                                className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase"
                              >
                                Grand Total
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                                  {formatCurrency(formData.total_amount)}
                                </span>
                              </td>
                              {!preFilledMaterials && <td></td>}
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows="3"
                    placeholder="Add any additional notes or terms..."
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || formData.items.length === 0}
                className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-bold shadow-lg shadow-green-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
                {formData.type === "inbound"
                  ? "Record Quote"
                  : "Create Quotation"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateQuotationModal;
