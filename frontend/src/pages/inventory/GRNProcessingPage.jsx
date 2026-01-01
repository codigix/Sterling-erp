import React, { useState, useEffect } from "react";
import axios from "../../utils/api";
import Swal from "sweetalert2";
import {
  Package,
  Search,
  Filter,
  Download,
  Check,
  CheckCircle,
  X,
  Plus,
  Eye,
  AlertTriangle,
  Clock,
  Truck,
} from "lucide-react";
import GRNEmailModal from "../../components/GRNEmailModal";
import taskService from "../../utils/taskService";

const GRNProcessingPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [grnData, setGrnData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewGRNModal, setShowNewGRNModal] = useState(false);
  const [approvedPOs, setApprovedPOs] = useState([]);
  const [selectedPO, setSelectedPO] = useState("");
  const [poItems, setPoItems] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [taskId, setTaskId] = useState(null);

  useEffect(() => {
    const extractedTaskId = taskService.getTaskIdFromParams();
    if (extractedTaskId) {
      setTaskId(extractedTaskId);
    }
    fetchGRNs();
  }, []);

  const fetchGRNs = async () => {
    try {
      const response = await axios.get("/inventory/grns");
      const formattedData = response.data.map((grn) => {
        const firstItem = grn.items && grn.items.length > 0 ? grn.items[0] : {};
        const totalQty = grn.items
          ? grn.items.reduce(
              (acc, item) => acc + (Number(item.quantity) || 0),
              0
            )
          : 0;
        const totalReceived = grn.items
          ? grn.items.reduce(
              (acc, item) =>
                acc +
                (Number(
                  item.received_quantity !== undefined
                    ? item.received_quantity
                    : item.quantity
                ) || 0),
              0
            )
          : 0;

        return {
          id: grn.id,
          grnNo: `GRN-${String(grn.id).padStart(3, "0")}-${new Date(
            grn.created_at
          ).getFullYear()}`,
          poNo: grn.po_number,
          vendor: grn.vendor_name,
          item:
            grn.items && grn.items.length > 1
              ? `${firstItem.description || firstItem.item_name} + ${
                  grn.items.length - 1
                } more`
              : firstItem.description || firstItem.item_name || "N/A",
          expectedQty: totalQty,
          receivedQty: totalReceived,
          unit: firstItem.unit || "units",
          expectedDate: grn.created_at, // Using creation date as expected for now
          receivedDate: grn.created_at
            ? new Date(grn.created_at).toISOString().split("T")[0]
            : null,
          inspectionStatus: grn.inspection_status || "pending",
          rawStatus: grn.qc_status, // Store raw status for logic checks
          status:
            grn.qc_status === "completed"
              ? "completed"
              : grn.qc_status === "approved" || grn.qc_status === "passed"
              ? "pending" // Ready for stock
              : "pending",
          items: grn.items || [],
        };
      });
      setGrnData(formattedData);
    } catch (error) {
      console.error("Error fetching GRNs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewGRNClick = async () => {
    try {
      // Fetch approved POs
      const response = await axios.get(
        "/procurement/purchase-orders?status=approved"
      );
      if (response.data && response.data.purchaseOrders) {
        setApprovedPOs(response.data.purchaseOrders);
      }
      setShowNewGRNModal(true);
    } catch (error) {
      console.error("Error fetching approved POs:", error);
    }
  };

  const handlePOChange = async (e) => {
    const poId = e.target.value;
    setSelectedPO(poId);
    setPoItems([]);

    if (poId) {
      try {
        const response = await axios.get(
          `/procurement/purchase-orders/${poId}`
        );
        const items = response.data.items || [];
        // Initialize received_quantity with ordered quantity
        const initialItems = items.map((item) => ({
          ...item,
          received_quantity: item.quantity,
        }));
        setPoItems(initialItems);
      } catch (error) {
        console.error("Error fetching PO items:", error);
      }
    }
  };

  const handleQuantityChange = (index, value) => {
    const newItems = [...poItems];
    newItems[index].received_quantity = Math.max(0, Number(value) || 0);
    setPoItems(newItems);
  };

  const handleCreateGRN = async () => {
    if (!selectedPO) return;

    try {
      await axios.post("/inventory/grns", {
        po_id: selectedPO,
        items: poItems,
      });

      if (taskId) {
        await taskService.autoCompleteTaskByAction(taskId, "create");
      }

      setShowNewGRNModal(false);
      setSelectedPO("");
      setPoItems([]);
      fetchGRNs();
    } catch (error) {
      console.error("Error creating GRN:", error);
      alert(error.response?.data?.message || "Failed to create GRN");
    }
  };

  const handleViewGRN = async (grn) => {
    try {
      const response = await axios.get(`/qc/portal/grn-details/${grn.id}`);
      const detailedGRN = {
        ...grn,
        detailedItems: response.data.items,
        inspection: response.data.inspection,
      };
      setSelectedGRN(detailedGRN);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error fetching GRN details:", error);
      Swal.fire("Error", "Failed to load GRN details", "error");
    }
  };

  // New Modal for Add to Inventory
  const [showAddToInventoryModal, setShowAddToInventoryModal] = useState(false);
  const [inventoryForm, setInventoryForm] = useState(null);
  const [verificationData, setVerificationData] = useState({
    issues: {
      qtyMismatch: false,
      weightMismatch: false,
      qualityIssue: false,
    },
    notes: "",
  });
  const [emailModal, setEmailModal] = useState({
    show: false,
    type: "",
    data: null,
  });

  // ... existing code ...

  const handleAddToInventoryClick = async (grn) => {
    // Only allow if Inspection is Approved/Passed, Shortage, or Overage.
    /* 
    if (grn.inspectionStatus === "pending") {
      Swal.fire(
        "Info",
        "Please complete QC Inspection before adding to inventory.",
        "info"
      );
      return;
    }
    */
    // Assuming Check Button (GRN Process Approval) is done, we can proceed.
    // Or if we want to enforce it:
    /*
   if (!["approved", "passed"].includes(grn.rawStatus)) {
      Swal.fire("Info", "Please approve the GRN process first.", "info");
      return;
   }
   */

    try {
      // Show loading state if needed or just wait
      const response = await axios.get(`/qc/portal/grn-details/${grn.id}`);
      const detailedData = {
        ...grn,
        ...response.data,
        items: response.data.items || [],
      };

      setInventoryForm(detailedData);
      setVerificationData({
        issues: {
          qtyMismatch: false,
          weightMismatch: false,
          qualityIssue: false,
        },
        notes: "",
      });
      setShowAddToInventoryModal(true);
    } catch (error) {
      console.error("Error fetching GRN details for inventory:", error);
      Swal.fire("Error", "Failed to load GRN details", "error");
    }
  };

  const processInventoryAddition = async () => {
    if (!inventoryForm) return;

    // Use the fetched detailed items for discrepancy check
    const detailedItems = inventoryForm.items;

    const hasShortage = detailedItems.some((item) => Number(item.rejected) > 0);
    const hasOverage = detailedItems.some((item) => Number(item.overage) > 0);
    const userReportedIssues = Object.values(verificationData.issues).some(
      (v) => v
    );

    if (!hasShortage && !hasOverage && !userReportedIssues) {
      // Perfect match - Add directly
      await addToInventory(inventoryForm.id, "completed");
    } else {
      // Discrepancy Found (System or User Reported)
      let status = "completed";
      if (hasShortage && hasOverage) status = "discrepancy";
      else if (hasShortage) status = "shortage";
      else if (hasOverage) status = "overage";
      else if (userReportedIssues) status = "flagged";

      // Show Email Modal for vendor notification
      setEmailModal({
        show: true,
        type: status,
        data: {
          grnId: inventoryForm.id,
          grnNo: inventoryForm.grnNo,
          poNo: inventoryForm.poNo,
          vendor: inventoryForm.vendor,
          items: detailedItems,
          userNotes: verificationData.notes,
        },
      });
      setShowAddToInventoryModal(false);
    }
  };

  const addToInventory = async (grnId, status) => {
    try {
      await axios.post(`/inventory/grns/${grnId}/add-to-stock`, { status });
      Swal.fire(
        "Success",
        "Material added to inventory successfully!",
        "success"
      );
      setShowAddToInventoryModal(false);
      setEmailModal({ show: false, type: "", data: null });
      fetchGRNs();
    } catch (error) {
      console.error("Error adding to inventory:", error);
      Swal.fire("Error", "Failed to add material to inventory", "error");
    }
  };

  const handleSendEmailAndAdd = async () => {
    // 1. Send Email (Mocked or Real)
    try {
      // await axios.post('/api/email/vendor-discrepancy', { ...emailModal.data });
      // For now, assume email sent

      Swal.fire({
        title: "Sending Email...",
        timer: 1000,
        didOpen: () => Swal.showLoading(),
      }).then(async () => {
        // 2. Add to Inventory with the specific status
        await addToInventory(emailModal.data.grnId, emailModal.type);
      });
    } catch (error) {
      console.error("Error sending email:", error);
      Swal.fire("Error", "Failed to send email", "error");
    }
  };

  const handleApproveGRN = async (grn) => {
    // This allows toggling or re-approving the GRN PROCESSING status (qc_status)
    // independent of the inspection_status
    if (grn.status === "completed") return;

    const result = await Swal.fire({
      title: "Approve GRN Processing?",
      text: `This will mark the GRN as processed and ready for inventory.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Approve",
    });

    if (result.isConfirmed) {
      try {
        await axios.patch(`/inventory/grns/${grn.id}/status`, {
          status: "approved",
        });

        if (taskId) {
          await taskService.autoCompleteTaskByAction(taskId, "approve");
        }

        Swal.fire("Approved!", "GRN processing has been approved.", "success");
        fetchGRNs();
      } catch (error) {
        console.error("Error approving GRN:", error);
        Swal.fire("Error!", "Failed to approve GRN.", "error");
      }
    }
  };

  const filteredData = grnData.filter(
    (grn) =>
      (grn.grnNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grn.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grn.item.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === "all" || grn.status === statusFilter)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getInspectionColor = (status) => {
    switch (status) {
      case "passed":
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "hold":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "failed":
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getQtyVarianceColor = (expected, received) => {
    if (received === expected) return "text-green-600";
    if (received < expected) return "text-red-600";
    return "text-orange-600";
  };

  const stats = [
    { label: "Total GRNs", value: grnData.length, color: "text-blue-600" },
    {
      label: "Completed",
      value: grnData.filter((g) => g.status === "completed").length,
      color: "text-green-600",
    },
    {
      label: "Pending",
      value: grnData.filter((g) => g.status === "pending").length,
      color: "text-yellow-600",
    },
    {
      label: "Passed",
      value: grnData.filter((g) =>
        ["passed", "approved"].includes(g.inspectionStatus)
      ).length,
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white text-xs">
            GRN Processing
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage goods received notes and inspections
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleNewGRNClick}
            className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <Plus size={18} />
            New GRN
          </button>
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors font-medium">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
          >
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {stat.label}
            </p>
            <p className={`text-2xl font-bold mt-2 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
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
              placeholder="Search GRN, PO, vendor or item..."
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
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  GRN No.
                </th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  PO No.
                </th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Vendor
                </th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Item
                </th>
                <th className="p-2 text-center text-sm font-semibold text-slate-900 dark:text-white">
                  Qty Variance
                </th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Status
                </th>
                <th className="p-2 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Inspection
                </th>
                <th className="p-2 text-center text-sm font-semibold text-slate-900 dark:text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((grn) => (
                <tr
                  key={grn.id}
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <td className="p-2 text-sm font-medium text-slate-900 text-left dark:text-white">
                    {grn.grnNo}
                  </td>
                  <td className="p-2 text-sm text-slate-600 dark:text-slate-400">
                    {grn.poNo}
                  </td>
                  <td className="p-2 text-sm text-slate-600 dark:text-slate-400">
                    {grn.vendor}
                  </td>
                  <td className="p-2 text-sm text-slate-600 dark:text-slate-400">
                    {grn.item}
                  </td>
                  <td
                    className={`p-2 text-sm font-medium text-center ${getQtyVarianceColor(
                      grn.expectedQty,
                      grn.receivedQty
                    )}`}
                  >
                    {grn.receivedQty}/{grn.expectedQty}
                  </td>
                  <td className="p-2 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        grn.status
                      )}`}
                    >
                      {grn.status.charAt(0).toUpperCase() + grn.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-2 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getInspectionColor(
                        grn.inspectionStatus
                      )}`}
                    >
                      {grn.inspectionStatus.charAt(0).toUpperCase() +
                        grn.inspectionStatus.slice(1)}
                    </span>
                  </td>
                  <td className="p-2 text-center text-sm">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleViewGRN(grn)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye
                          size={16}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </button>
                      <button
                        onClick={() => handleApproveGRN(grn)}
                        className={`p-2 rounded-lg transition-colors ${
                          ["approved", "passed"].includes(grn.rawStatus)
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400"
                            : "hover:bg-gray-100 text-gray-400 dark:hover:bg-gray-700"
                        }`}
                        title={
                          ["approved", "passed"].includes(grn.rawStatus)
                            ? "GRN Process Approved"
                            : "Approve GRN Process"
                        }
                      >
                        <Check
                          size={16}
                          className={
                            ["approved", "passed"].includes(grn.rawStatus)
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-gray-400 dark:text-gray-500"
                          }
                        />
                      </button>
                      <button
                        onClick={() => handleAddToInventoryClick(grn)}
                        className={`p-2 rounded-lg transition-colors ${
                          grn.status === "completed"
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-green-100 dark:hover:bg-green-900"
                        }`}
                        disabled={grn.status === "completed"}
                        title={
                          grn.status === "completed"
                            ? "Inventory Added"
                            : "Add to Inventory"
                        }
                      >
                        <Package
                          size={16}
                          className="text-green-600 dark:text-green-400"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showNewGRNModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Create New GRN
              </h2>
              <button
                onClick={() => setShowNewGRNModal(false)}
                className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Select Purchase Order
                </label>
                <select
                  value={selectedPO}
                  onChange={handlePOChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Select an approved PO...</option>
                  {approvedPOs.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.po_number} - {po.vendor_name || "Unknown Vendor"} (
                      {new Date(po.created_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                {approvedPOs.length === 0 && (
                  <p className="text-xs text-orange-500 mt-1">
                    No approved purchase orders available.
                  </p>
                )}

                {poItems.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white text-xs mb-2">
                      Verify Received Quantities
                    </h3>
                    <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
                          <tr>
                            <th className="p-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                              Item
                            </th>
                            <th className="p-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                              Ordered
                            </th>
                            <th className="p-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                              Received
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {poItems.map((item, idx) => (
                            <tr
                              key={idx}
                              className="border-t border-slate-200 dark:border-slate-700"
                            >
                              <td className="p-2 text-slate-900 dark:text-white">
                                {item.description || item.item_name}
                              </td>
                              <td className="p-2 text-center text-slate-600 dark:text-slate-400">
                                {item.quantity}
                              </td>
                              <td className="p-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  value={item.received_quantity}
                                  onChange={(e) =>
                                    handleQuantityChange(idx, e.target.value)
                                  }
                                  className="w-20 px-2 py-1 text-center border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
              <button
                onClick={() => setShowNewGRNModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGRN}
                disabled={!selectedPO}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Create GRN
              </button>
            </div>
          </div>
        </div>
      )}
      {showViewModal && selectedGRN && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                GRN Details - {selectedGRN.grnNo}
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    PO Number
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white text-xs">
                    {selectedGRN.poNo}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Vendor
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white text-xs">
                    {selectedGRN.vendor}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Created Date
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white text-xs">
                    {new Date(selectedGRN.expectedDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Status
                  </p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      selectedGRN.status
                    )}`}
                  >
                    {selectedGRN.status.charAt(0).toUpperCase() +
                      selectedGRN.status.slice(1)}
                  </span>
                </div>
              </div>

              <h3 className="text-md font-semibold text-slate-900 dark:text-white mb-3">
                Items Inspection Details
              </h3>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-700/50">
                    <tr>
                      <th className="p-3 text-left font-semibold text-slate-900 dark:text-white">
                        Description
                      </th>
                      <th className="p-3 text-left font-semibold text-slate-900 dark:text-white">
                        Category
                      </th>
                      <th className="p-3 text-center font-semibold text-slate-900 dark:text-white">
                        Ordered Qty
                      </th>
                      <th className="p-3 text-center font-semibold text-slate-900 dark:text-white">
                        Invoice Qty
                      </th>
                      <th className="p-3 text-center font-semibold text-slate-900 dark:text-white">
                        Received
                      </th>
                      <th className="p-3 text-center font-semibold text-slate-900 dark:text-white">
                        Shortage
                      </th>
                      <th className="p-3 text-center font-semibold text-slate-900 dark:text-white">
                        Overage
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGRN.detailedItems &&
                    selectedGRN.detailedItems.length > 0 ? (
                      selectedGRN.detailedItems.map((item, idx) => (
                        <tr
                          key={idx}
                          className="border-t border-slate-200 dark:border-slate-700"
                        >
                          <td className="p-3 text-slate-900 dark:text-white">
                            {item.description || item.item_name || "N/A"}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">
                            {item.category || item.materialType || "-"}
                          </td>
                          <td className="p-3 text-center text-slate-900 dark:text-white">
                            {item.quantity}
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 font-medium text-blue-700 dark:text-blue-300 text-xs">
                              {item.invoice_quantity || 0}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-900/30 font-medium text-green-700 dark:text-green-300 text-xs">
                              {item.received || 0}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-900/30 font-medium text-red-700 dark:text-red-300 text-xs">
                              {item.rejected || 0}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-orange-50 dark:bg-orange-900/30 font-medium text-orange-700 dark:text-orange-300 text-xs">
                              {item.overage || 0}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="p-4 text-center text-slate-500 dark:text-slate-400"
                        >
                          No items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {selectedGRN.inspection && (
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Inspection Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">
                        Status
                      </p>
                      <p className="font-medium text-slate-900 dark:text-white text-xs">
                        {selectedGRN.inspection.status.charAt(0).toUpperCase() +
                          selectedGRN.inspection.status.slice(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">
                        Inspection Date
                      </p>
                      <p className="font-medium text-slate-900 dark:text-white text-xs">
                        {new Date(
                          selectedGRN.inspection.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    {selectedGRN.inspection.remarks && (
                      <div className="col-span-2">
                        <p className="text-slate-500 dark:text-slate-400">
                          Remarks
                        </p>
                        <p className="font-medium text-slate-900 dark:text-white text-xs">
                          {selectedGRN.inspection.remarks}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddToInventoryModal && inventoryForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col my-8">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <div className="flex items-center gap-3">
                <Package className="text-blue-600" size={24} />
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Verify & Add to Inventory
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    GRN: {inventoryForm.grnNo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddToInventoryModal(false)}
                className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* GRN Information */}
              <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                      PO Number
                    </p>
                    <p className="font-medium text-slate-900 dark:text-white text-xs mt-1">
                      {inventoryForm.poNo || inventoryForm.po_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                      Vendor
                    </p>
                    <p className="font-medium text-slate-900 dark:text-white text-xs mt-1">
                      {inventoryForm.vendor}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                      Received Date
                    </p>
                    <p className="font-medium text-slate-900 dark:text-white text-xs mt-1">
                      {inventoryForm.receivedDate
                        ? new Date(
                            inventoryForm.receivedDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                      Items
                    </p>
                    <p className="font-medium text-slate-900 dark:text-white text-xs mt-1">
                      {inventoryForm.items?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Received Items Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                        Item Details
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">
                        Ordered
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">
                        Received
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">
                        Variance
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                    {inventoryForm.items &&
                      inventoryForm.items.map((item, idx) => {
                        const ordered = Number(item.quantity) || 0;
                        const received =
                          Number(item.received_quantity) ||
                          (item.accepted
                            ? Number(item.accepted) + Number(item.rejected || 0)
                            : ordered);

                        const variance =
                          ordered > 0
                            ? ((received - ordered) / ordered) * 100
                            : 0;
                        const varianceText = `${
                          received - ordered > 0 ? "+" : ""
                        }${received - ordered}`;
                        const varianceColor =
                          received === ordered
                            ? "text-green-600"
                            : received < ordered
                            ? "text-red-600"
                            : "text-orange-600";

                        return (
                          <tr
                            key={idx}
                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-900 dark:text-white text-xs">
                                {item.description || item.item_name}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {item.category || "-"} • {item.unit || "Units"}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">
                              {ordered}
                            </td>
                            <td className="px-4 py-3 text-center font-medium text-slate-900 dark:text-white text-xs">
                              {received}
                            </td>
                            <td
                              className={`px-4 py-3 text-center font-medium ${varianceColor}`}
                            >
                              {variance !== 0 ? varianceText : "-"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {received === ordered ? (
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                  <CheckCircle size={16} />
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  title="Check Quantity"
                                >
                                  <AlertTriangle size={16} />
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Verification Decision */}
              <div className="bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Final Verification
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Check Issues
                    </p>
                    <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={verificationData.issues.qtyMismatch}
                        onChange={(e) =>
                          setVerificationData((prev) => ({
                            ...prev,
                            issues: {
                              ...prev.issues,
                              qtyMismatch: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        Quantity Mismatch Found
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={verificationData.issues.weightMismatch}
                        onChange={(e) =>
                          setVerificationData((prev) => ({
                            ...prev,
                            issues: {
                              ...prev.issues,
                              weightMismatch: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        Weight / Spec Mismatch
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={verificationData.issues.qualityIssue}
                        onChange={(e) =>
                          setVerificationData((prev) => ({
                            ...prev,
                            issues: {
                              ...prev.issues,
                              qualityIssue: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        Quality Issue (Damage/Defect)
                      </span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Remarks
                    </p>
                    <textarea
                      value={verificationData.notes}
                      onChange={(e) =>
                        setVerificationData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="Add notes about any discrepancies or observations..."
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white h-32 resize-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Guidelines */}
              <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400 bg-blue-50/50 dark:bg-slate-800 p-3 rounded border border-blue-100 dark:border-slate-700">
                <Search size={16} className="text-blue-500 shrink-0" />
                <p>
                  By clicking "Verify & Add", you confirm that the physical
                  stock matches the received quantities. Any marked
                  discrepancies will trigger a vendor notification workflow.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg shrink-0">
              <button
                onClick={() => setShowAddToInventoryModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={processInventoryAddition}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                <CheckCircle size={16} />
                Verify & Add to Stock
              </button>
            </div>
          </div>
        </div>
      )}

      <GRNEmailModal
        emailModal={emailModal}
        setEmailModal={setEmailModal}
        handleSendEmailAndAdd={handleSendEmailAndAdd}
        selectedGRN={selectedGRN}
      />
    </div>
  );
};

export default GRNProcessingPage;
