import React, { useState, useEffect, useCallback } from "react";
import {
  ClipboardList,
  Search,
  Plus,
  RefreshCw,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  LayoutGrid,
  List,
  Download,
  X,
  PlusCircle,
  ChevronDown,
  ArrowRight,
  Warehouse,
  ShieldCheck,
  FileText,
  XCircle,
  Trash2,
  Activity,
  User,
  Calendar,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../../utils/api";
import Swal from "sweetalert2";
import { showSuccess, showError } from "../../utils/toastUtils";
import CreatePurchaseOrderModal from "./CreatePurchaseOrderModal";

const MaterialRequestDetailModal = ({
  isOpen,
  onClose,
  request,
  warehouses,
  onStatusUpdate,
}) => {
  const navigate = useNavigate();
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [showPOModal, setShowPOModal] = useState(false);
  const [creatingPO, setCreatingPO] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [stockLevels, setStockLevels] = useState({});
  const [loadingStock, setLoadingStock] = useState(false);
  const [approving, setApproving] = useState(false);

  const fetchStockLevels = useCallback(async () => {
    if (!request || !request.items) return;

    setLoadingStock(true);
    try {
      const levels = {};

      // Get warehouse name if a specific warehouse is selected
      const warehouseObj = warehouses.find(
        (w) => String(w.id) === String(selectedWarehouse),
      );
      const warehouseName = warehouseObj ? warehouseObj.name : "";

      // Fetch each item's stock level
      await Promise.all(
        (request.items || []).map(async (item) => {
          try {
            // Use exact match for itemName to avoid partial matches
            let query = item.material_code
              ? `itemCode=${encodeURIComponent(item.material_code)}`
              : `itemName=${encodeURIComponent(item.material_name)}`;

            if (warehouseName) {
              query += `&warehouse=${encodeURIComponent(warehouseName)}`;
            }

            const response = await axios.get(`/inventory/materials?${query}`);
            const materials = response.data.materials || [];

            if (materials.length > 0) {
              // Find best match
              const match = item.material_code
                ? materials.find(
                    (m) =>
                      String(m.itemCode || m.item_code).toLowerCase() ===
                      String(item.material_code).toLowerCase(),
                  )
                : materials.find(
                    (m) =>
                      String(m.itemName || m.item_name).toLowerCase() ===
                      String(item.material_name).toLowerCase(),
                  );

              const bestMatch = match || materials[0];
              levels[item.id] = {
                quantity: bestMatch.total_stock || bestMatch.quantity || 0,
                warehouses: bestMatch.available_in_warehouses || "",
              };
            } else {
              levels[item.id] = { quantity: 0, warehouses: "" };
            }
          } catch (err) {
            console.error(
              `Error fetching stock for ${item.material_name}:`,
              err,
            );
            levels[item.id] = { quantity: 0, warehouses: "" };
          }
        }),
      );
      setStockLevels(levels);
    } catch (error) {
      console.error("Error fetching stock levels:", error);
    } finally {
      setLoadingStock(false);
    }
  }, [request, selectedWarehouse, warehouses]);

  useEffect(() => {
    if (isOpen && request) {
      fetchStockLevels();
    }
  }, [isOpen, request, fetchStockLevels]);

  if (!isOpen || !request) return null;

  const allInStock = (request.items || []).every((item) => {
    const stockInfo = stockLevels[item.id] || { quantity: 0 };
    return Number(stockInfo.quantity || 0) >= Number(item.quantity || 0);
  });

  const handleAutoCreatePO = async () => {
    try {
      setCreatingPO(true);

      // Filter for only out-of-stock items (insufficient stock)
      let itemsToOrder = (request.items || []).filter((item) => {
        const stockInfo = stockLevels[item.id] || { quantity: 0 };
        return Number(stockInfo.quantity || 0) < Number(item.quantity || 0);
      });

      if (itemsToOrder.length === 0) {
        showSuccess(
          "All Items in Stock: There are no items that require a Purchase Order as everything is in stock.",
        );
        setCreatingPO(false);
        return;
      }

      let items = itemsToOrder.map((item) => ({
        material_name: item.material_name,
        material_code: item.material_code,
        quantity: item.quantity,
        unit: item.unit,
        rate: 0,
        amount: 0,
      }));

      let vendorId = null;

      // If there's an approved quotation, use its rates and vendor
      if (request.approved_quotation_id) {
        const quoteResponse = await axios.get(
          `/inventory/quotations/${request.approved_quotation_id}`,
        );
        const quote = quoteResponse.data;
        vendorId = quote.vendor_id;

        let quoteItems = quote.items;
        if (typeof quoteItems === "string") quoteItems = JSON.parse(quoteItems);

        items = items.map((item) => {
          const quoteItem = quoteItems.find(
            (qi) =>
              qi.description === item.material_name ||
              qi.material_name === item.material_name,
          );
          if (quoteItem) {
            return {
              ...item,
              rate: quoteItem.unit_price || 0,
              amount: (quoteItem.unit_price || 0) * (item.quantity || 0),
            };
          }
          return item;
        });
      }

      const payload = {
        material_request_id: request.id,
        vendor_id: vendorId,
        items: items,
        notes: `Created from Material Request: ${request.mr_number}${request.approved_quotation_id ? ` and Approved Quotation` : ""}`,
      };

      const response = await axios.post("/inventory/purchase-orders", payload);

      // Update status to ordered
      await axios.patch(`/inventory/material-requests/${request.id}/status`, {
        status: "ordered",
      });

      showSuccess(
        `Purchase Order ${response.data.po_number} created successfully`,
      );
      onClose();
      if (onStatusUpdate) onStatusUpdate();
      navigate(`/inventory-manager/purchase-orders/${response.data.id}`);
    } catch (error) {
      console.error("Error auto-creating PO:", error);
      showError("Failed to create Purchase Order");
    } finally {
      setCreatingPO(false);
    }
  };

  const handleCreateQuotation = (direct = false) => {
    let rawItems = request.items || [];
    if (typeof rawItems === "string") {
      try {
        rawItems = JSON.parse(rawItems);
      } catch (e) {
        console.error("Error parsing items:", e);
        rawItems = [];
      }
    }

    // Filter for only out-of-stock items (insufficient stock)
    const itemsToQuote = rawItems.filter((item) => {
      const stockInfo = stockLevels[item.id] || { quantity: 0 };
      return Number(stockInfo.quantity || 0) < Number(item.quantity || 0);
    });

    if (itemsToQuote.length === 0) {
      showSuccess(
        "Stock Available: All items are currently in stock. No quotation process needed.",
      );
      return;
    }

    const performNavigation = () => {
      navigate("/inventory-manager/quotations/sent", {
        state: {
          openModal: true,
          preFilledMaterials: itemsToQuote.map((item) => ({
            item_code: item.item_code || item.material_code || "",
            description:
              item.item_name || item.material_name || item.description || "",
            quantity: item.quantity || 0,
            unit: item.unit || "",
            unit_price: 0,
          })),
          reference_id: null,
          material_request_id: request.id,
        },
      });
    };

    if (direct === true) {
      performNavigation();
      return;
    }

    Swal.fire({
      title: "Create Quotation?",
      text: "To create a Purchase Order, you must first create and approve a Quotation. Would you like to proceed to the Quotation page?",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Create Quotation",
      cancelButtonText: "Maybe later",
    }).then((result) => {
      if (result.isConfirmed) {
        performNavigation();
      }
    });
  };

  const handleApproveRequest = async () => {
    try {
      const result = await Swal.fire({
        title: "Approve Material Request?",
        text: "This will allow the request to be fulfilled or ordered.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3b82f6",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Yes, Approve",
      });

      if (result.isConfirmed) {
        setApproving(true);
        await axios.patch(`/inventory/material-requests/${request.id}/status`, {
          status: "approved",
        });

        showSuccess("Material request approved successfully");
        if (onStatusUpdate) onStatusUpdate();
        onClose();
      }
    } catch (error) {
      console.error("Error approving request:", error);
      showError("Failed to approve request");
    } finally {
      setApproving(false);
    }
  };

  const handleReleaseMaterial = async () => {
    try {
      const warehouseObj = warehouses.find(
        (w) => String(w.id) === String(selectedWarehouse),
      );
      const warehouseName = warehouseObj ? warehouseObj.name : "";

      const result = await Swal.fire({
        title: "Release Materials?",
        text: `This will deduct stock ${warehouseName ? `from ${warehouseName}` : "from available warehouses"} and mark the request as fulfilled.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Yes, Release",
      });

      if (result.isConfirmed) {
        setReleasing(true);
        const response = await axios.post(
          `/inventory/material-requests/${request.id}/release`,
          {
            warehouseName: warehouseName,
          },
        );

        showSuccess(response.data.message || "Materials released successfully");
        if (onStatusUpdate) onStatusUpdate();
        onClose();
      }
    } catch (error) {
      console.error("Error releasing materials:", error);
      showError(error.response?.data?.message || "Failed to release materials");
    } finally {
      setReleasing(false);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await axios.delete(`/inventory/material-requests/${request.id}`);
        showSuccess("Material request has been deleted.");
        if (onStatusUpdate) onStatusUpdate();
        onClose();
      }
    } catch (error) {
      console.error("Error deleting request:", error);
      showError("Failed to delete request");
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    const styles = {
      received: "bg-emerald-100 text-emerald-700 border-emerald-200",
      fulfilled: "bg-emerald-100 text-emerald-700 border-emerald-200",
      completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
      ordered: "bg-purple-100 text-purple-700 border-purple-200",
      approved: "bg-blue-100 text-blue-700 border-blue-200",
      pending: "bg-blue-100 text-blue-700 border-blue-200",
      submitted: "bg-amber-100 text-amber-700 border-amber-200",
      draft: "bg-slate-100 text-slate-700 border-slate-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
    };

    const displayNames = {
      received: "fulfilled",
      completed: "fulfilled",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[s] || styles.draft} uppercase tracking-wider`}
      >
        {displayNames[s] || s}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Material Request: {request.mr_number}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30 dark:bg-slate-900/50">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center">
              <Activity size={20} className="text-orange-500 mb-2" />
              <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                Status
              </span>
              {getStatusBadge(request.status)}
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center">
              <RefreshCw size={20} className="text-blue-500 mb-2" />
              <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                Purpose
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {request.purpose || "Material Issue"}
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center">
              <Warehouse size={20} className="text-purple-500 mb-2" />
              <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                Department
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {request.department || "Production"}
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center">
              <User size={20} className="text-green-500 mb-2" />
              <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                Requested By
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {request.requested_by_name || "System"}
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center">
              <PlusCircle size={20} className="text-indigo-500 mb-2" />
              <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                Linked PO
              </span>
              <p
                className={`text-sm font-bold ${request.po_number ? "text-blue-600" : "text-slate-400"}`}
              >
                {request.po_number || "None"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items Table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <List size={18} className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Line Items
                  </h3>
                </div>
                <button
                  onClick={fetchStockLevels}
                  disabled={loadingStock}
                  className="text-[10px] font-bold text-blue-600 flex items-center gap-1 uppercase tracking-widest hover:underline disabled:opacity-50"
                >
                  <RefreshCw
                    size={12}
                    className={loadingStock ? "animate-spin" : ""}
                  />{" "}
                  Refresh Stock
                </button>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      <th className="px-6 py-3 text-left">Item Details</th>
                      <th className="px-6 py-3 text-center">Quantity</th>
                      <th className="px-6 py-3 text-center">Stock Level</th>
                      <th className="px-6 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                    {request.items &&
                      request.items.map((item, idx) => {
                        const stockInfo = stockLevels[item.id] || {
                          quantity: 0,
                          warehouses: "",
                        };
                        const stockQty = stockInfo.quantity;

                        return (
                          <tr
                            key={idx}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white uppercase">
                                  {item.material_name}
                                </p>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                  {item.material_code || "No Code"}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {item.quantity} {item.unit}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex flex-col items-center">
                                <span
                                  className={`text-sm font-bold ${Number(stockQty || 0) >= Number(item.quantity || 0) && Number(stockQty || 0) > 0 ? "text-emerald-600" : Number(stockQty || 0) > 0 ? "text-amber-600" : "text-red-600"}`}
                                >
                                  {Number(stockQty || 0).toFixed(3)} {item.unit}
                                </span>
                                <div className="flex flex-col items-center gap-1 mt-1">
                                  {selectedWarehouse ? (
                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-bold text-slate-500 uppercase">
                                      <Warehouse size={10} />
                                      {warehouses.find(
                                        (w) =>
                                          String(w.id) ===
                                          String(selectedWarehouse),
                                      )?.name || "Selected Warehouse"}
                                    </div>
                                  ) : stockInfo.warehouses ? (
                                    stockInfo.warehouses
                                      .split(",")
                                      .map((wh, i) => (
                                        <div
                                          key={i}
                                          className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 rounded text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase"
                                        >
                                          <Warehouse size={10} />
                                          {wh.trim()}
                                        </div>
                                      ))
                                  ) : (
                                    <span className="text-[9px] text-slate-400 uppercase font-medium italic">
                                      Not in any warehouse
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {stockQty >= Number(item.quantity || 0) &&
                              stockQty > 0 ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-600 whitespace-nowrap">
                                  in stock
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-600 whitespace-nowrap">
                                  out of stock
                                </span>
                              )}
                              <p className="text-[10px] text-slate-400 mt-1 uppercase font-medium">
                                {item.status}
                              </p>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sidebar info */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Warehouse size={18} className="text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Fulfillment Source
                    </h3>
                  </div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">
                    Select Warehouse
                  </label>
                  <select
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium"
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                  >
                    <option value="">All Warehouses</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-lg flex gap-3">
                    <AlertCircle size={14} className="text-orange-600 mt-0.5" />
                    <p className="text-[10px] text-orange-700 dark:text-orange-400 font-medium leading-relaxed">
                      Changing the warehouse will trigger a real-time stock
                      verification for all line items.
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText size={18} className="text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Request Summary
                    </h3>
                  </div>
                  {!allInStock ? (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-xl space-y-3">
                      <div className="flex gap-3">
                        <AlertCircle
                          size={16}
                          className="text-amber-600 mt-0.5"
                        />
                        <p className="text-xs font-bold text-amber-800 dark:text-amber-400 leading-tight">
                          Insufficient Stock: Some items are not available in
                          the selected warehouse.
                        </p>
                      </div>
                      <p className="text-[10px] text-amber-700 dark:text-amber-500 font-medium pl-7">
                        You can create a Purchase Order for the out-of-stock
                        items.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl space-y-3">
                      <div className="flex gap-3">
                        <CheckCircle
                          size={16}
                          className="text-emerald-600 mt-0.5"
                        />
                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 leading-tight">
                          All Items In Stock: You can proceed to release all
                          materials.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-slate-500 uppercase">
                        Required By
                      </span>
                      <span className="text-slate-900 dark:text-white flex items-center gap-1">
                        <Calendar size={12} />{" "}
                        {request.required_date
                          ? new Date(request.required_date).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-slate-500 uppercase">
                        Created On
                      </span>
                      <span className="text-slate-900 dark:text-white">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-xs font-bold transition-all"
          >
            <Trash2 size={16} /> Remove Request
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-slate-500 hover:text-slate-700 text-xs font-bold uppercase tracking-wider"
            >
              Cancel
            </button>
            {request.status === "submitted" && (
              <button
                onClick={handleApproveRequest}
                disabled={approving}
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-lg transition-all text-xs uppercase flex items-center gap-2"
              >
                {approving ? "Approving..." : "Approve Request"} <CheckCircle size={16} />
              </button>
            )}
            {request.status !== "received" &&
              request.status !== "fulfilled" &&
              request.status !== "cancelled" &&
              request.status !== "submitted" && (
                <>
                  <button
                    onClick={handleReleaseMaterial}
                    disabled={releasing || !allInStock || request.status !== "approved"}
                    className={`px-6 py-2 ${!allInStock || request.status !== "approved" ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"} font-bold rounded-lg transition-all text-xs uppercase flex items-center gap-2 disabled:opacity-50`}
                  >
                    {releasing ? "Releasing..." : "Release Material"}{" "}
                    <ShieldCheck size={16} />
                  </button>
                  <button
                    onClick={
                      request.approved_quotation_count > 0
                        ? handleAutoCreatePO
                        : () => handleCreateQuotation(true)
                    }
                    disabled={creatingPO || request.po_count > 0 || allInStock || request.status !== "approved"}
                    className={`px-6 py-2 ${request.po_count > 0 || allInStock || request.status !== "approved" ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20"} font-bold rounded-lg transition-all text-xs uppercase flex items-center gap-2`}
                  >
                    {creatingPO
                      ? "Creating..."
                      : request.po_count > 0
                        ? "PO Created"
                        : allInStock
                          ? "In Stock"
                          : "Create Purchase Order"}{" "}
                    <PlusCircle size={16} />
                  </button>
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MaterialRequestsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("total");
  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rootCards, setRootCards] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const WorkflowStepper = ({ request }) => {
    const [localLoading, setLocalLoading] = useState(false);
    if (!request) return null;
    const status = request.status || "draft";

    // Determine if we are on the Procurement path or Direct path
    const isProcurementPath =
      request.po_count > 0 ||
      request.approved_quotation_count > 0 ||
      request.rfq_count > 0;

    const steps = [
      {
        id: "request",
        label: "Material Request",
        icon: ClipboardList,
        subLabel: "Request & Approval",
      },
      {
        id: "quotation",
        label: "Quotation",
        icon: FileText,
        subLabel: "RFQ & Approval",
        hidden: !isProcurementPath && status === "fulfilled",
      },
      {
        id: "po",
        label: "Purchase Order",
        icon: ShieldCheck,
        subLabel: "PO & Vendor Submission",
        hidden: !isProcurementPath && status === "fulfilled",
      },
      {
        id: "grn",
        label: "Goods Arrival",
        icon: Warehouse,
        subLabel: "GRN & Inspection",
        hidden: !isProcurementPath && status === "fulfilled",
      },
      {
        id: "fulfilled",
        label: "Fulfillment",
        icon: CheckCircle,
        subLabel: "Material Release",
      },
    ].filter((step) => !step.hidden);

    const getStepStatus = (stepId, index) => {
      const s = status.toLowerCase();

      if (stepId === "request") {
        if (s === "draft") return "current";
        return "completed";
      }

      if (stepId === "quotation") {
        if (request.approved_quotation_count > 0) return "completed";
        if (request.rfq_count > 0 || s === "approved") return "current";
        return "pending";
      }

      if (stepId === "po") {
        if (s === "ordered" || s === "received" || s === "fulfilled")
          return "completed";
        if (request.po_count > 0 || request.approved_quotation_count > 0)
          return "current";
        return "pending";
      }

      if (stepId === "grn") {
        if (s === "received" || s === "fulfilled") return "completed";
        if (s === "ordered") return "current";
        return "pending";
      }

      if (stepId === "fulfilled") {
        if (s === "fulfilled") return "completed";
        if (s === "received") return "current";
        return "pending";
      }

      return "pending";
    };

    const handleStepClick = async (stepId) => {
      if (stepId === "request") {
        fetchRequestDetails(request.id);
        return;
      }

      if (stepId === "fulfilled") {
        fetchRequestDetails(request.id); // Open modal to release
        return;
      }

      if (stepId === "quotation" || stepId === "po") {
        setLocalLoading(true);
        try {
          // 1. Get current stock levels to know what to order
          const items = request.items || [];
          const itemsToProcess = [];

          for (const item of items) {
            const query = item.material_code
              ? `itemCode=${encodeURIComponent(item.material_code)}`
              : `itemName=${encodeURIComponent(item.material_name)}`;

            const res = await axios.get(`/inventory/materials?${query}`);
            const materials = res.data.materials || [];
            const stockQty =
              materials.length > 0
                ? Number(materials[0].total_stock || materials[0].quantity || 0)
                : 0;

            if (stockQty < Number(item.quantity || 0)) {
              itemsToProcess.push(item);
            }
          }

          if (itemsToProcess.length === 0 && stepId === "quotation") {
            showSuccess(
              "All items are currently in stock. No quotation needed.",
            );
            setLocalLoading(false);
            return;
          }

          if (stepId === "quotation") {
            Swal.fire({
              title: "Create Quotation?",
              text: "Would you like to proceed to create a Quotation for out-of-stock items?",
              icon: "info",
              showCancelButton: true,
              confirmButtonText: "Yes, Proceed",
            }).then((result) => {
              if (result.isConfirmed) {
                navigate("/inventory-manager/quotations/sent", {
                  state: {
                    openModal: true,
                    preFilledMaterials: itemsToProcess.map((item) => ({
                      item_code: item.material_code || "",
                      description: item.material_name || "",
                      quantity: item.quantity || 0,
                      unit: item.unit || "",
                      unit_price: 0,
                    })),
                    material_request_id: request.id,
                  },
                });
              }
            });
          } else if (stepId === "po") {
            if (request.approved_quotation_count > 0) {
              // Redirect to detail modal to use handleAutoCreatePO logic
              fetchRequestDetails(request.id);
            } else {
              showError(
                "No approved quotation found. Please create and approve a quotation first.",
              );
              handleStepClick("quotation");
            }
          }
        } catch (err) {
          console.error("Error processing stepper action:", err);
          showError("Failed to process action");
        } finally {
          setLocalLoading(false);
        }
        return;
      }

      const routes = {
        grn: "/inventory-manager/grn-processing",
      };

      const route = routes[stepId];
      if (route) {
        navigate(route);
      }
    };

    return (
      <div className="py-10 px-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 my-4 mx-8 animate-in slide-in-from-top-4 duration-500 shadow-sm relative">
        {localLoading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 z-20 flex items-center justify-center rounded-2xl">
            <RefreshCw className="animate-spin text-blue-600" size={24} />
          </div>
        )}
        <div className="relative flex justify-between items-center w-full mx-auto p-4">
          {/* Progress Line */}
          <div className="absolute top-[20px] left-0 w-full h-1 bg-slate-100 dark:bg-slate-700 z-0 rounded-full" />

          {steps.map((step, idx) => {
            const stepStatus = getStepStatus(step.id, idx);
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-center group flex-1"
              >
                <button
                  onClick={() => handleStepClick(step.id)}
                  disabled={localLoading}
                  title={`Go to ${step.label}`}
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 z-10
                    ${
                      stepStatus === "completed"
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-110"
                        : stepStatus === "current"
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-110 hover:scale-125"
                          : "bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-100 dark:border-slate-700 hover:border-blue-300"
                    }
                    ${localLoading ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  <Icon size={20} />
                </button>

                <div className="mt-4 text-center">
                  <span
                    className={`
                    block text-[11px] font-bold uppercase tracking-widest transition-colors duration-500 whitespace-nowrap
                    ${
                      stepStatus === "completed"
                        ? "text-emerald-600"
                        : stepStatus === "current"
                          ? "text-blue-600"
                          : "text-slate-500"
                    }
                  `}
                  >
                    {step.label}
                  </span>
                  <span className="block text-[9px] font-medium text-slate-400 mt-0.5 uppercase tracking-tighter opacity-80">
                    {step.subLabel}
                  </span>
                </div>

                {/* Connector for completed steps */}
                {idx < steps.length - 1 &&
                  getStepStatus(steps[idx + 1]?.id, idx + 1) !== "pending" && (
                    <div className="absolute top-[20px] left-[calc(50%+20px)] w-[calc(100%-40px)] h-1 bg-emerald-500 z-0 animate-in fade-in zoom-in duration-700" />
                  )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const fetchWarehouses = useCallback(async () => {
    try {
      const response = await axios.get("/inventory/warehouses");
      setWarehouses(response.data || []);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  }, []);

  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    pending: 0,
    approved: 0,
    processing: 0,
    fulfilled: 0,
    cancelled: 0,
  });

  const [newRequest, setNewRequest] = useState({
    rootCardId: "",
    department: "",
    requestedBy: "",
    requiredBy: "",
    purpose: "Purchase Request",
    targetWarehouse: "",
    items: [],
    notes: "",
  });

  const [currentItem, setCurrentItem] = useState({
    item: "",
    quantity: 1,
    uom: "pcs",
  });

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingRequest, setViewingRequest] = useState(null);

  const fetchRequestDetails = async (id) => {
    try {
      const response = await axios.get(`/inventory/material-requests/${id}`);
      setViewingRequest(response.data.materialRequest);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching request details:", error);
      showError("Failed to fetch request details");
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await axios.delete(`/inventory/material-requests/${id}`);
        showSuccess("Material request has been deleted.");
        fetchMaterialRequests();
      }
    } catch (error) {
      console.error("Error deleting request:", error);
      showError(error.response?.data?.message || "Failed to delete request");
    }
  };

  const [requestAvailability, setRequestAvailability] = useState({});

  const checkAvailabilityForList = useCallback(async (requests) => {
    const availability = {};

    // Process in batches or one by one
    await Promise.all(
      requests.map(async (req) => {
        try {
          let items = req.items || [];
          if (typeof items === "string") items = JSON.parse(items);

          if (items.length === 0) {
            availability[req.id] = false;
            return;
          }

          let allInStock = true;
          for (const item of items) {
            const query = item.material_code
              ? `itemCode=${encodeURIComponent(item.material_code)}`
              : `itemName=${encodeURIComponent(item.material_name)}`;

            const response = await axios.get(`/inventory/materials?${query}`);
            const materials = response.data.materials || [];

            if (materials.length > 0) {
              const match = item.material_code
                ? materials.find(
                    (m) =>
                      String(m.itemCode || m.item_code).toLowerCase() ===
                      String(item.material_code).toLowerCase(),
                  )
                : materials.find(
                    (m) =>
                      String(m.itemName || m.item_name).toLowerCase() ===
                      String(item.material_name).toLowerCase(),
                  );

              const stockQty = Number(
                (match || materials[0]).quantity ||
                  (match || materials[0]).total_stock ||
                  0,
              );
              const reqQty = Number(item.quantity || 0);
              if (stockQty < reqQty) {
                allInStock = false;
                break;
              }
            } else {
              allInStock = false;
              break;
            }
          }
          availability[req.id] = allInStock;
        } catch (err) {
          console.error(`Error checking availability for MR ${req.id}:`, err);
          availability[req.id] = false;
        }
      }),
    );

    setRequestAvailability(availability);
  }, []);

  const fetchMaterialRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("/inventory/material-requests", {
        params: {
          search: searchQuery,
          status:
            statusFilter === "All Statuses"
              ? "all"
              : statusFilter.toLowerCase(),
        },
      });

      const requests = response.data.materialRequests || [];
      setMaterialRequests(requests);

      // Perform initial availability check for the list
      checkAvailabilityForList(requests);

      // Map backend stats to UI stats
      const backendStats = response.data.stats || {};
      setStats({
        total: backendStats.total || 0,
        draft: backendStats.draft || 0,
        approved: backendStats.approved || 0,
        processing: backendStats.ordered || 0,
        fulfilled: backendStats.received || 0,
        cancelled: 0,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching material requests:", error);
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  const fetchRootCards = useCallback(async () => {
    try {
      const response = await axios.get("/sales/management");
      setRootCards(response.data || []);
    } catch (error) {
      console.error("Error fetching sales orders:", error);
    }
  }, []);

  useEffect(() => {
    const mrId =
      searchParams.get("materialRequestId") || searchParams.get("mrId");
    if (mrId) {
      fetchRequestDetails(mrId);
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      fetchMaterialRequests();
      fetchRootCards();
      fetchWarehouses();
    }

    // Auto-refresh when window gets focus to ensure user sees latest requests
    const handleFocus = () => {
      if (isMounted) {
        fetchMaterialRequests();
      }
    };
    window.addEventListener("focus", handleFocus);

    // Background polling every 30 seconds to keep data fresh without manual refresh
    const pollingInterval = setInterval(() => {
      if (isMounted) {
        fetchMaterialRequests();
      }
    }, 30000);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleFocus);
      clearInterval(pollingInterval);
    };
  }, [fetchMaterialRequests, fetchRootCards, fetchWarehouses]);

  const handleAddItem = () => {
    if (currentItem.item && currentItem.quantity > 0) {
      setNewRequest((prev) => ({
        ...prev,
        items: [...prev.items, { ...currentItem, id: Date.now() }],
      }));
      setCurrentItem({ item: "", quantity: 1, uom: "pcs" });
    }
  };

  const handleRemoveItem = (id) => {
    setNewRequest((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newRequest.items.length === 0) {
      showError("Please add at least one item");
      return;
    }

    if (!newRequest.rootCardId) {
      showError("Please select a Sales Order / Root Card");
      return;
    }

    try {
      const payload = {
        rootCardId: Number(newRequest.rootCardId),
        department: newRequest.department,
        purpose: newRequest.purpose,
        requiredDate: newRequest.requiredBy,
        remarks: newRequest.notes,
        priority: "medium",
        items: newRequest.items.map((item) => ({
          materialName: item.item,
          quantity: item.quantity,
          unit: item.uom,
        })),
      };

      await axios.post("/inventory/material-requests", payload);

      showSuccess("Your material requests have been submitted successfully.");

      setShowNewRequestModal(false);
      setNewRequest({
        rootCardId: "",
        department: "",
        requestedBy: "",
        requiredBy: "",
        purpose: "Purchase Request",
        targetWarehouse: "",
        items: [],
        notes: "",
      });
      fetchMaterialRequests();
    } catch (error) {
      console.error("Error submitting material request:", error);
      showError(
        error.response?.data?.message || "Failed to submit material request",
      );
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    const styles = {
      received: "bg-emerald-100 text-emerald-700",
      fulfilled: "bg-emerald-100 text-emerald-700",
      completed: "bg-emerald-100 text-emerald-700",
      ordered: "bg-purple-100 text-purple-700",
      processing: "bg-purple-100 text-purple-700",
      approved: "bg-blue-100 text-blue-700",
      pending: "bg-blue-100 text-blue-700",
      submitted: "bg-amber-100 text-amber-700",
      draft: "bg-slate-100 text-slate-700",
      cancelled: "bg-red-100 text-red-700",
    };

    // Display name mapping
    const displayNames = {
      received: "fulfilled",
      completed: "fulfilled",
      ordered: "processing",
    };

    return (
      <span
        className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 w-fit ${styles[s] || styles.draft}`}
      >
        {(s === "fulfilled" || s === "received" || s === "completed") && (
          <CheckCircle size={12} />
        )}
        {displayNames[s] || s}
      </span>
    );
  };

  const getAvailabilityBadge = (requestId) => {
    const isAvailable = requestAvailability[requestId];

    // Show loading state if check haven't finished
    if (isAvailable === undefined) {
      return (
        <span className="px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-500 flex items-center gap-1 w-fit animate-pulse">
          <Clock size={12} />
          checking...
        </span>
      );
    }

    if (isAvailable) {
      return (
        <span className="px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700 flex items-center gap-1 w-fit">
          <CheckCircle size={12} />
          available
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1 w-fit">
        <XCircle size={12} />
        unavailable
      </span>
    );
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen dark:bg-slate-900">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <ClipboardList
              className="text-blue-600 dark:text-blue-400"
              size={24}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Material Requests
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock size={14} /> Updated {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? "bg-blue-50 text-blue-600" : "text-slate-400"}`}
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "text-slate-400"}`}
            >
              <LayoutGrid size={20} />
            </button>
          </div>
          <button
            onClick={fetchMaterialRequests}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            onClick={() => setShowNewRequestModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            New Request
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin text-blue-600" size={32} />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {[
              {
                label: "Total Requests",
                value: stats.total,
                icon: ClipboardList,
                color: "blue",
                active: activeTab === "total",
              },
              {
                label: "Draft",
                value: stats.draft,
                icon: FileText,
                color: "orange",
                active: activeTab === "draft",
              },
              {
                label: "Approved",
                value: stats.approved,
                icon: ShieldCheck,
                color: "blue",
                active: activeTab === "approved",
              },
              {
                label: "Processing",
                value: stats.processing,
                icon: RefreshCw,
                color: "purple",
                active: activeTab === "processing",
              },
              {
                label: "Fulfilled",
                value: stats.fulfilled,
                icon: CheckCircle,
                color: "emerald",
                active: activeTab === "fulfilled",
              },
              {
                label: "Cancelled",
                value: stats.cancelled,
                icon: XCircle,
                color: "red",
                active: activeTab === "cancelled",
              },
            ].map((stat, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveTab(stat.label.toLowerCase());
                  setStatusFilter(
                    stat.label === "Total Requests"
                      ? "All Statuses"
                      : stat.label,
                  );
                }}
                className={`p-4 rounded-xl border transition-all text-left bg-white dark:bg-slate-800 ${
                  activeTab === stat.label.toLowerCase()
                    ? "border-blue-500 ring-1 ring-blue-500 shadow-md"
                    : "border-slate-200 dark:border-slate-700 hover:border-blue-300"
                }`}
              >
                <div
                  className={`p-2 rounded-lg w-fit mb-3 bg-${stat.color}-50 dark:bg-${stat.color}-900/20`}
                >
                  <stat.icon
                    className={`text-${stat.color}-600 dark:text-${stat.color}-400`}
                    size={20}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </button>
            ))}
          </div>

          {/* Filters and Search */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by ID, requester or department..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <select
                  className="appearance-none pl-4 pr-10 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600 dark:text-slate-300"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>All Statuses</option>
                  <option>Draft</option>
                  <option>Submitted</option>
                  <option>Approved</option>
                  <option>Ordered</option>
                  <option>Received</option>
                  <option>Cancelled</option>
                </select>
                <Filter
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={16}
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50">
                <LayoutGrid size={18} />
                Columns
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50">
                <Download size={18} />
                Export
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 w-10"></th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Requester
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Required By
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {materialRequests.length > 0 ? (
                  materialRequests.map((req) => (
                    <React.Fragment key={req.id}>
                      <tr
                        className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${expandedRows.has(req.id) ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleRow(req.id)}
                            className={`p-1 rounded-lg transition-all ${expandedRows.has(req.id) ? "bg-blue-100 text-blue-600 rotate-180" : "text-slate-400 hover:bg-slate-100"}`}
                          >
                            <ChevronDown size={18} />
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                          {req.mr_number || `MR-${req.id}`}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {req.created_by_name || "System"}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(req.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" />
                          {req.required_date
                            ? new Date(req.required_date).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          {getAvailabilityBadge(req.id)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => fetchRequestDetails(req.id)}
                              className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(req.id)}
                              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                              title="Delete Request"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedRows.has(req.id) && (
                        <tr>
                          <td colSpan="7" className="px-0 py-0 border-none">
                            <WorkflowStepper request={req} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      No material requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* New Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh]">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col h-full overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Create Material Request
                </h2>
                <button
                  type="button"
                  onClick={() => setShowNewRequestModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Side - Details */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <ClipboardList className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">
                          Request Details
                        </h3>
                        <p className="text-xs text-slate-500">
                          Define MR basic parameters
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Sales Order / Root Card{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={newRequest.rootCardId}
                          onChange={(e) =>
                            setNewRequest({
                              ...newRequest,
                              rootCardId: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Select Sales Order</option>
                          {rootCards.map((so) => (
                            <option key={so.id} value={so.id}>
                              SO-{so.id} ({so.customer})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Department
                        </label>
                        <select
                          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={newRequest.department}
                          onChange={(e) =>
                            setNewRequest({
                              ...newRequest,
                              department: e.target.value,
                            })
                          }
                        >
                          <option value="">Select Department</option>
                          <option value="Production">Production</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Quality">Quality</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Required By <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={newRequest.requiredBy}
                            onChange={(e) =>
                              setNewRequest({
                                ...newRequest,
                                requiredBy: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Purpose
                        </label>
                        <div className="space-y-2">
                          {[
                            { id: "Purchase Request", icon: Warehouse },
                            { id: "Internal Transfer", icon: RefreshCw },
                            { id: "Material Issue", icon: PlusCircle },
                          ].map((purpose) => (
                            <button
                              type="button"
                              key={purpose.id}
                              onClick={() =>
                                setNewRequest({
                                  ...newRequest,
                                  purpose: purpose.id,
                                })
                              }
                              className={`w-full flex items-center gap-3 p-3 border rounded-xl transition-all ${
                                newRequest.purpose === purpose.id
                                  ? "bg-blue-50 border-blue-500 text-blue-700"
                                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300"
                              }`}
                            >
                              <div
                                className={`p-1.5 rounded-lg ${newRequest.purpose === purpose.id ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700"}`}
                              >
                                <purpose.icon size={16} />
                              </div>
                              <span className="text-sm font-medium">
                                {purpose.id}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Items */}
                  <div className="lg:col-span-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 h-fit">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          <Warehouse size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">
                            Requested Items
                          </h3>
                          <p className="text-xs text-slate-500">
                            {newRequest.items.length} items total
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 mb-6 items-end">
                      <div className="col-span-5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Item <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Search or enter item name"
                          className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={currentItem.item}
                          onChange={(e) =>
                            setCurrentItem({
                              ...currentItem,
                              item: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={currentItem.quantity}
                          onChange={(e) =>
                            setCurrentItem({
                              ...currentItem,
                              quantity: Number(e.target.value),
                            })
                          }
                          min="0.01"
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          UOM
                        </label>
                        <select
                          className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={currentItem.uom}
                          onChange={(e) =>
                            setCurrentItem({
                              ...currentItem,
                              uom: e.target.value,
                            })
                          }
                        >
                          <option value="pcs">pcs</option>
                          <option value="kg">kg</option>
                          <option value="meter">meter</option>
                          <option value="liter">liter</option>
                          <option value="Nos">Nos</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <button
                          type="button"
                          onClick={handleAddItem}
                          className="w-full h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                      <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                              Item Info
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">
                              Qty
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {newRequest.items.length > 0 ? (
                            newRequest.items.map((item) => (
                              <tr
                                key={item.id}
                                className="border-b border-slate-100 dark:border-slate-700 last:border-0"
                              >
                                <td className="px-4 py-3">
                                  <p className="font-medium text-slate-900 dark:text-white text-sm">
                                    {item.item}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {item.uom}
                                  </p>
                                </td>
                                <td className="px-4 py-3 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                                  {item.quantity}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="p-1 text-slate-400 hover:text-red-500"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="3"
                                className="px-4 py-12 text-center"
                              >
                                <div className="flex flex-col items-center gap-2 text-slate-400">
                                  <Warehouse size={48} className="opacity-20" />
                                  <p className="text-sm font-medium">
                                    No items added yet
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <FileText size={14} /> Notes & Special Instructions
                      </label>
                      <textarea
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Add any additional notes for this material request..."
                        value={newRequest.notes}
                        onChange={(e) =>
                          setNewRequest({
                            ...newRequest,
                            notes: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setShowNewRequestModal(false)}
                  className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Cancel
                </button>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <CheckCircle size={18} /> Create Request
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Material Request Detail Modal */}
      <MaterialRequestDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        request={viewingRequest}
        warehouses={warehouses}
        onStatusUpdate={fetchMaterialRequests}
      />
    </div>
  );
};

export default MaterialRequestsPage;
