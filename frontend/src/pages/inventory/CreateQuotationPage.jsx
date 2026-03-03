import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import toastUtils from "../../utils/toastUtils";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Calendar,
  DollarSign,
  FileText,
  Truck,
  Loader2,
  Briefcase,
} from "lucide-react";
import axios from "../../utils/api";
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import taskService from "../../utils/taskService";

const CreateQuotationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { materials, rootCardId, material_request_id } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [rootCards, setRootCards] = useState([]);
  const [rootCardMaterials, setRootCardMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [loadingRootCards, setLoadingRootCards] = useState(false);
  const [savingRequirements, setSavingRequirements] = useState(false);
  const [analysisMode, setAnalysisMode] = useState(false);
  const [taskId, setTaskId] = useState(null);

  const [formData, setFormData] = useState({
    vendor_id: "",
    root_card_id: rootCardId || "",
    material_request_id: material_request_id || "",
    valid_until: "",
    notes: "",
    items: [],
  });

  useEffect(() => {
    const extractedTaskId = taskService.getTaskIdFromParams();
    if (extractedTaskId) {
      setTaskId(extractedTaskId);
    }
    fetchVendors();
    fetchRootCards();
    if (materials) {
      initializeItemsFromMaterials(materials);
    }
  }, [materials]);

  const fetchVendors = async () => {
    try {
      const response = await axios.get("/inventory/vendors");
      setVendors(response.data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const fetchRootCards = async () => {
    try {
      setLoadingRootCards(true);
      const response = await axios.get("/root-cards/requirements");
      setRootCards(response.data.data || []);
    } catch (error) {
      console.error("Error fetching root cards:", error);
    } finally {
      setLoadingRootCards(false);
    }
  };

  const handleRootCardChange = async (e) => {
    const selectedRootCardId = e.target.value;

    setFormData((prev) => ({
      ...prev,
      root_card_id: selectedRootCardId,
    }));

    if (!selectedRootCardId) {
      setRootCardMaterials([]);
      setFormData((prev) => ({ ...prev, items: [] }));
      return;
    }

    try {
      setLoadingMaterials(true);
      const reqResponse = await axios.get(
        `/root-cards/requirements/${selectedRootCardId}`
      );
      const reqData = reqResponse.data.data;

      let parsedMaterials = reqData.materials || [];
      if (typeof parsedMaterials === "string") {
        parsedMaterials = JSON.parse(parsedMaterials);
      }

      // Initialize materials with selection state
      const initializedMaterials = parsedMaterials.map((m) => ({
        ...m,
        selected:
          (parseFloat(m.requiredQuantity) || 0) >
          (parseFloat(m.currentStock) || 0),
      }));

      setRootCardMaterials(initializedMaterials);

      // Auto-populate if shortages exist (optional behavior)
      const shortages = initializedMaterials.filter(
        (m) =>
          (parseFloat(m.requiredQuantity) || 0) >
          (parseFloat(m.currentStock) || 0)
      );
      // if (shortages.length > 0) {
      //   initializeItemsFromMaterials(shortages);
      // }

      setAnalysisMode(true);
    } catch (error) {
      console.error("Error fetching root card materials:", error);
      toastUtils.error("Failed to load root card requirements");
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleRequirementChange = (index, field, value) => {
    setRootCardMaterials((prev) => {
      const newMaterials = [...prev];
      newMaterials[index] = { ...newMaterials[index], [field]: value };

      // Update selected state based on shortage if required qty changed
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
        materials: rootCardMaterials.map(({ selected, ...m }) => m), // Exclude UI-only 'selected' field
        procurementStatus: "pending", // Or keep existing status
      });

      // Auto-proceed
      const selectedItems = rootCardMaterials.filter((m) => m.selected);
      initializeItemsFromMaterials(selectedItems);
      setAnalysisMode(false);

      // toastUtils.success('Requirements saved successfully');
    } catch (error) {
      console.error("Error saving requirements:", error);
      toastUtils.error("Failed to save requirements");
    } finally {
      setSavingRequirements(false);
    }
  };

  const generateQuoteItems = () => {
    const selectedItems = rootCardMaterials.filter((m) => m.selected);
    initializeItemsFromMaterials(selectedItems);
    setAnalysisMode(false);
  };

  const initializeItemsFromMaterials = (materialsList) => {
    const items = materialsList.map((m) => ({
      description: m.itemName || m.item_name || "Unnamed Material",
      quantity: Math.max(
        0,
        (parseFloat(m.requiredQuantity) || 0) -
          (parseFloat(m.currentStock) || 0)
      ),
      unit_price: 0,
      material_id: m._id || null,
    }));
    setFormData((prev) => ({ ...prev, items }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index][field] =
        field === "description" ? value : parseFloat(value) || 0;
      return { ...prev, items: newItems };
    });
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unit_price: 0 }],
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vendor_id) {
      toastUtils.warning("Please select a vendor");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        vendor_id: formData.vendor_id,
        total_amount: calculateTotal(),
        valid_until: formData.valid_until,
        items: formData.items,
        material_request_id: formData.material_request_id,
        notes: formData.root_card_id
          ? `Ref: Root Card ${formData.root_card_id}\n\n${formData.notes}`
          : formData.notes,
      };

      await axios.post("/inventory/quotations", payload);

      if (taskId) {
        await taskService.autoCompleteTaskByAction(taskId, "create");
      }

      toastUtils.success("Quotation created successfully");
      navigate("/inventory-manager/quotations/sent");
    } catch (error) {
      console.error("Error creating quotation:", error);
      toastUtils.error("Failed to create quotation");
    } finally {
      setSubmitting(false);
    }
  };

  if (analysisMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setAnalysisMode(false);
              setFormData((prev) => ({ ...prev, root_card_id: "" }));
              setRootCardMaterials([]);
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <ArrowLeft
              size={24}
              className="text-slate-600 dark:text-slate-400"
            />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-xs">
              Material Analysis
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Review stock availability and select items for quotation
            </p>
          </div>
        </div>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <Briefcase size={20} />
                Root Card Requirements
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleSaveRequirements}
                  disabled={savingRequirements}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {savingRequirements ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Save & Continue to Quotation
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingMaterials ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            ) : rootCardMaterials.length === 0 ? (
              <p className="text-center py-8 text-slate-500">
                No materials found for this root card.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white dark:bg-slate-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                        Include
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                        Material
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                        Current Stock
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                        Required Qty
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
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
                          className={
                            shortage > 0
                              ? "bg-red-50/50 dark:bg-red-900/10"
                              : ""
                          }
                        >
                          <td className="px-4 py-2">
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
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <div className="text-sm font-medium text-slate-900 dark:text-white text-xs">
                              {material.itemName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {material.category}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300">
                            {stock}
                          </td>
                          <td className="px-4 py-2">
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
                              className="w-24 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded"
                            />
                          </td>
                          <td className="px-4 py-2">
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
        >
          <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-xs">
            Create Quotation
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {rootCardId
              ? `For Root Card: ${rootCardId}`
              : "New Vendor Quotation"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                Quotation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Select Root Card (Optional)
                  </label>
                  <div className="relative">
                    <Briefcase
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <select
                      name="root_card_id"
                      value={formData.root_card_id}
                      onChange={handleRootCardChange}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">
                        Select Root Card to Load Requirements
                      </option>
                      {rootCards.map((p) => (
                        <option key={p.rootCardId} value={p.rootCardId}>
                          {p.projectName} ({p.poNumber})
                        </option>
                      ))}
                    </select>
                    {loadingRootCards && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2
                          className="animate-spin text-blue-500"
                          size={16}
                        />
                      </div>
                    )}
                  </div>
                  {formData.root_card_id && (
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        Root Card selected. Requirements loaded.
                      </p>
                      <button
                        type="button"
                        onClick={() => setAnalysisMode(true)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Analysis
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Vendor <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Truck
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <select
                      name="vendor_id"
                      value={formData.vendor_id}
                      onChange={handleFormChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Vendor</option>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Valid Until
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="date"
                      name="valid_until"
                      value={formData.valid_until}
                      onChange={handleFormChange}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign size={20} />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">
                    Total Items
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formData.items.length}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-lg font-bold text-slate-900 dark:text-white text-xs">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ₹
                    {calculateTotal().toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Save size={20} />
                  )}
                  Create Quotation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Material Analysis Section */}
        {formData.root_card_id && (
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <Briefcase size={20} />
                  Root Card Material Analysis
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSaveRequirements}
                    disabled={savingRequirements}
                    className="gap-2"
                  >
                    {savingRequirements ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    Save Requirements
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={generateQuoteItems}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus size={16} />
                    Update Quote Items
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingMaterials ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
              ) : rootCardMaterials.length === 0 ? (
                <p className="text-center py-8 text-slate-500">
                  No materials found for this root card.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white dark:bg-slate-800">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                          Include
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                          Material
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                          Current Stock
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                          Required Qty
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
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
                            className={
                              shortage > 0
                                ? "bg-red-50/50 dark:bg-red-900/10"
                                : ""
                            }
                          >
                            <td className="px-4 py-2">
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
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <div className="text-sm font-medium text-slate-900 dark:text-white text-xs">
                                {material.itemName}
                              </div>
                              <div className="text-xs text-slate-500">
                                {material.category}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300">
                              {stock}
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={material.requiredQuantity}
                                onChange={(e) =>
                                  handleRequirementChange(
                                    idx,
                                    "requiredQuantity",
                                    e.target.value
                                  )
                                }
                                className="w-24 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={`text-sm font-bold ${
                                  shortage > 0
                                    ? "text-red-600"
                                    : "text-green-600"
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
            </CardContent>
          </Card>
        )}

        {/* Items Table */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Items</CardTitle>
            <Button
              type="button"
              onClick={handleAddItem}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plus size={16} />
              Add Item
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-32">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-40">
                      Unit Price (₹)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase w-40">
                      Total (₹)
                    </th>
                    <th className="px-4 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {formData.items.map((item, index) => (
                    <tr key={index} className="bg-white dark:bg-slate-800">
                      <td className="px-4 py-3">
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
                          className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-transparent text-sm"
                          placeholder="Item description"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-transparent text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.unit_price}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "unit_price",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-transparent text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white text-xs">
                        ₹
                        {(item.quantity * item.unit_price).toLocaleString(
                          "en-IN",
                          { minimumFractionDigits: 2 }
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {formData.items.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-8 text-center text-slate-500 text-sm"
                      >
                        No items added. Click "Add Item" to begin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CreateQuotationPage;
