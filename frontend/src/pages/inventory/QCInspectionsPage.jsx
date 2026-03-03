import React, { useState, useEffect } from "react";
import axios from "../../utils/api";
import Swal from "sweetalert2";
import {
  CheckCircle,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  AlertTriangle,
  Clock,
  User,
  FileText,
  X,
  Save,
} from "lucide-react";
import taskService from "../../utils/taskService";

const QCInspectionsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskId, setTaskId] = useState(null);

  // Modal State
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [inspectionForm, setInspectionForm] = useState({
    items: [],
    status: "pending",
    remarks: "",
    inspectorId: null, // Should be current user
  });

  useEffect(() => {
    const extractedTaskId = taskService.getTaskIdFromParams();
    if (extractedTaskId) {
      setTaskId(extractedTaskId);
    }
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/qc/portal/grn-inspections");
      setInspections(response.data.grnInspections);
    } catch (error) {
      console.error("Error fetching inspections:", error);
      toastUtils.error("Failed to load inspections");
    } finally {
      setLoading(false);
    }
  };

  const handleInspectClick = async (grn) => {
    try {
      let items = [];
      let existingInspection = null;

      // Try to get existing inspection details first
      try {
        const inspectionRes = await axios.get(
          `/qc/portal/inspections/grn/${grn.dbId}`
        );
        existingInspection = inspectionRes.data;
      } catch {
        // No inspection yet, ignore 404
      }

      if (existingInspection) {
        // If inspection exists, use its items_results combined with GRN items if possible,
        // or just use items_results if it captures everything.
        // But items_results might not have descriptions.
        // We need GRN items for descriptions.
      }

      // Fetch GRN details using the single GRN endpoint
      const grnRes = await axios.get(`/inventory/grns/${grn.dbId}`);
      const targetGRN = grnRes.data;

      if (!targetGRN) {
        toastUtils.error("GRN details not found");
        return;
      }

      items = targetGRN.items || [];

      // Prepare form data
      let formItems = items.map((item) => ({
        ...item,
        invoice_quantity: item.invoice_quantity || 0,
        accepted: Number(
          item.received_quantity !== undefined
            ? item.received_quantity
            : item.quantity
        ),
        rejected: 0,
        overage: 0,
        notes: "",
      }));

      let formStatus = "pending";
      let formRemarks = "";

      if (existingInspection) {
        formStatus = existingInspection.status;
        formRemarks = existingInspection.remarks || "";
        if (
          existingInspection.items_results &&
          Array.isArray(existingInspection.items_results)
        ) {
          // Merge results
          formItems = formItems.map((item) => {
            // find result for this item. Assuming matching by index or item code if available.
            // For now assuming index matching or we need unique ID.
            // GRN items usually have item_code or just order.
            // Let's match by description or item_code if available.
            const savedResult = existingInspection.items_results.find(
              (r) => r.description === item.description
            );
            if (savedResult) {
              // Ensure the ordered quantity always comes from the actual GRN record, not stale inspection results
              return { ...item, ...savedResult, quantity: item.quantity };
            }
            return item;
          });
        }
      }

      // Ensure UI helper fields are set
      formItems = formItems.map((item) => ({
        ...item,
        total_received_val:
          (Number(item.accepted) || 0) + (Number(item.overage) || 0),
      }));

      setSelectedGRN(grn);
      setInspectionForm({
        items: formItems,
        status: formStatus,
        remarks: formRemarks,
        inspectorId: null,
      });
      setShowInspectModal(true);
    } catch (error) {
      console.error("Error preparing inspection:", error);
      toastUtils.error("Failed to prepare inspection form");
    }
  };

  const handleQuantityChange = (index, field, value) => {
    const newItems = [...inspectionForm.items];
    newItems[index] = { ...newItems[index] }; // Clone item to avoid direct mutation

    // Allow empty string for better UX (deleting 0)
    const val = value === "" ? "" : Math.max(0, Number(value));
    const safeVal = (v) =>
      v === "" || v === undefined || v === null || isNaN(v) ? 0 : Number(v);

    const invoiceQty =
      field === "invoice_quantity"
        ? safeVal(val)
        : safeVal(newItems[index].invoice_quantity);
    const expectedQty = safeVal(newItems[index].quantity);

    if (field === "invoice_quantity") {
      newItems[index].invoice_quantity = val;
      // Re-calculate Rejected if Invoice Qty changes
      const totalReceived =
        safeVal(newItems[index].accepted) + safeVal(newItems[index].overage);
      newItems[index].rejected = Math.max(0, safeVal(val) - totalReceived);
    } else if (field === "total_received") {
      // "Received" Input Field Logic:
      newItems[index].total_received_val = val;

      const totalGood = safeVal(val);

      // 1. Calculate Accepted and Overage
      if (totalGood > expectedQty) {
        newItems[index].accepted = expectedQty;
        newItems[index].overage = totalGood - expectedQty;
      } else {
        newItems[index].accepted = totalGood;
        newItems[index].overage = 0;
      }

      // 2. Calculate Rejected
      newItems[index].rejected = Math.max(0, invoiceQty - totalGood);
    } else if (field === "overage") {
      newItems[index].overage = val;
      // Update total_received_val and rejected if overage changes
      const totalRec = safeVal(newItems[index].accepted) + safeVal(val);
      newItems[index].total_received_val = totalRec;
      newItems[index].rejected = Math.max(0, invoiceQty - totalRec);
    } else {
      newItems[index][field] = val;
    }

    // Auto-calculate Status
    const totalShortage = newItems.reduce(
      (sum, item) => sum + safeVal(item.rejected),
      0
    );
    const totalOverage = newItems.reduce(
      (sum, item) => sum + safeVal(item.overage),
      0
    );

    let newStatus = "pending";

    if (totalShortage > 0) {
      newStatus = "shortage";
    } else if (totalOverage > 0) {
      newStatus = "overage";
    } else {
      newStatus = "passed";
    }

    setInspectionForm({
      ...inspectionForm,
      items: newItems,
      status: newStatus,
    });
  };

  const handleSubmitInspection = async () => {
    try {
      // Validate
      const totalInvoice = inspectionForm.items.reduce(
        (sum, item) => sum + Number(item.invoice_quantity),
        0
      );
      const totalRecorded = inspectionForm.items.reduce(
        (sum, item) =>
          sum +
          Number(item.accepted) +
          Number(item.rejected) +
          Number(item.overage),
        0
      );

      if (totalInvoice !== totalRecorded) {
        const result = await Swal.fire({
          title: "Quantity Mismatch",
          text: `Total recorded quantity (Accepted + Rejected + Overage = ${totalRecorded}) does not match Invoice quantity (${totalInvoice}). Continue?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, save anyway",
        });
        if (!result.isConfirmed) return;
      }

      const payload = {
        grnId: selectedGRN.dbId,
        itemsResults: inspectionForm.items.map((item) => ({
          description: item.description, // Identifier
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          invoice_quantity: item.invoice_quantity,
          accepted: item.accepted,
          rejected: item.rejected,
          overage: item.overage,
          notes: item.notes,
        })),
        status: inspectionForm.status,
        remarks: inspectionForm.remarks,
        inspectorId: 1, // TODO: Get from auth context
      };

      await axios.post("/qc/portal/inspections", payload);

      if (taskId) {
        await taskService.autoCompleteTaskByAction(taskId, "save");
      }

      toastUtils.success("Inspection saved successfully");
      setShowInspectModal(false);
      fetchInspections();
    } catch (error) {
      console.error("Error saving inspection:", error);
      toastUtils.error("Failed to save inspection");
    }
  };

  const filteredData = inspections.filter(
    (inspection) =>
      (inspection.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inspection.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inspection.vendor.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === "all" || inspection.qcStatus === statusFilter)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
      case "passed":
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "overage":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "shortage":
      case "failed":
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white text-xs">
            QC Inspections
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Quality control inspection records and reports
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {/* <button className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <Plus size={18} />
            New Inspection
          </button> */}
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors font-medium">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search inspection, GRN or vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium text-xs"
          >
            <option value="all">All Status</option>
            <option value="passed">Approved</option>
            <option value="shortage">Shortage</option>
            <option value="overage">Overage</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  GRN ID
                </th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  PO No.
                </th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Vendor
                </th>
                <th className="p-2 text-center text-sm font-semibold text-slate-900 dark:text-white">
                  Items
                </th>
                <th className="p-2 text-center text-sm font-semibold text-slate-900 dark:text-white">
                  Accepted
                </th>
                <th className="p-2 text-center text-sm font-semibold text-slate-900 dark:text-white">
                  Shortage
                </th>
                <th className="p-2 text-center text-sm font-semibold text-slate-900 dark:text-white">
                  Overage
                </th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Status
                </th>
                <th className="p-2 text-center text-sm font-semibold text-slate-900 dark:text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-4 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-4 text-center text-slate-500">
                    No inspections found
                  </td>
                </tr>
              ) : (
                filteredData.map((inspection) => (
                  <tr
                    key={inspection.id}
                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="p-2 text-sm font-medium text-slate-900 text-left dark:text-white">
                      {inspection.id}
                    </td>
                    <td className="p-2 text-sm text-slate-600 dark:text-slate-400">
                      {inspection.poNumber}
                    </td>
                    <td className="p-2 text-sm text-slate-600 dark:text-slate-400">
                      {inspection.vendor}
                    </td>
                    <td className="p-2 text-sm text-center text-slate-600 dark:text-slate-400">
                      {inspection.items}
                    </td>
                    <td className="p-2 text-sm text-center text-green-600">
                      {inspection.acceptedItems}
                    </td>
                    <td className="p-2 text-sm text-center text-red-600">
                      {inspection.rejectedItems}
                    </td>
                    <td className="p-2 text-sm text-center text-orange-600">
                      {inspection.overageItems || 0}
                    </td>
                    <td className="p-2 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          inspection.qcStatus
                        )}`}
                      >
                        {inspection.qcStatus === "passed" ||
                        inspection.qcStatus === "approved"
                          ? "Approved"
                          : inspection.qcStatus === "completed"
                          ? "Approved"
                          : inspection.qcStatus.charAt(0).toUpperCase() +
                            inspection.qcStatus.slice(1)}
                      </span>
                    </td>
                    <td className="p-2 text-center text-sm">
                      <button
                        onClick={() => handleInspectClick(inspection)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                        title="Inspect"
                      >
                        <FileText
                          size={16}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Modal */}
      {showInspectModal && selectedGRN && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                QC Inspection - {selectedGRN.id}
              </h2>
              <button
                onClick={() => setShowInspectModal(false)}
                className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium mb-1">
                    PO Number
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white text-lg">
                    {selectedGRN.poNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium mb-1">
                    Vendor
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white text-lg">
                    {selectedGRN.vendor}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <CheckCircle size={18} className="text-blue-600" />
                  Items Inspection
                </h3>
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                        <th className="p-3 text-left font-semibold text-slate-900 dark:text-white">
                          Item Details
                        </th>
                        <th className="p-3 text-center font-semibold text-slate-900 dark:text-white w-24">
                          Expected
                        </th>
                        <th className="p-3 text-center font-semibold text-slate-900 dark:text-white w-32">
                          Invoice Quantity
                        </th>
                        <th className="p-3 text-center font-semibold text-slate-900 dark:text-white w-32">
                          Received
                        </th>
                        <th className="p-3 text-center font-semibold text-slate-900 dark:text-white w-32">
                          Shortage
                        </th>
                        <th className="p-3 text-center font-semibold text-slate-900 dark:text-white w-32">
                          Overage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {inspectionForm.items.map((item, idx) => (
                        <tr
                          key={idx}
                          className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <td className="p-3">
                            <p className="font-medium text-slate-900 dark:text-white text-xs">
                              {item.description}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {item.category}
                            </p>
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 font-medium text-slate-700 dark:text-slate-300">
                              {item.quantity} {item.unit}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex justify-center">
                              <input
                                type="number"
                                className="w-24 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-center font-medium transition-all shadow-sm"
                                value={item.invoice_quantity}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    idx,
                                    "invoice_quantity",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex justify-center">
                              <input
                                type="number"
                                className="w-24 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-center font-medium transition-all shadow-sm"
                                value={
                                  item.total_received_val !== undefined
                                    ? item.total_received_val
                                    : ""
                                }
                                onChange={(e) =>
                                  handleQuantityChange(
                                    idx,
                                    "total_received",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex justify-center">
                              <input
                                type="number"
                                className="w-24 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-center font-medium cursor-not-allowed"
                                value={item.rejected}
                                readOnly
                              />
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex justify-center">
                              <input
                                type="number"
                                className="w-24 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-center font-medium cursor-not-allowed"
                                value={item.overage}
                                readOnly
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-700/30 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Overall Status
                  </label>
                  <div className="relative">
                    <select
                      className="w-full pl-4 pr-10 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none shadow-sm font-medium"
                      value={inspectionForm.status}
                      onChange={(e) =>
                        setInspectionForm({
                          ...inspectionForm,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="pending">Pending Review</option>
                      <option value="passed">Approved</option>
                      <option value="shortage">Shortage</option>
                      <option value="overage">Overage</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    General Remarks
                  </label>
                  <textarea
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                    rows="2"
                    placeholder="Enter any overall comments or observations..."
                    value={inspectionForm.remarks}
                    onChange={(e) =>
                      setInspectionForm({
                        ...inspectionForm,
                        remarks: e.target.value,
                      })
                    }
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
              <button
                onClick={() => setShowInspectModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitInspection}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-all"
              >
                <Save size={18} />
                Save Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QCInspectionsPage;
