import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../utils/api";
import Swal from "sweetalert2";
import toastUtils from "../../utils/toastUtils";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import CreatePurchaseOrderModal from "./CreatePurchaseOrderModal";
import {
  ShoppingCart,
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  CheckCircle,
  FileText,
  Calendar,
  X,
  Mail,
  MessageSquare,
  RefreshCw,
  ChevronRight,
  Clock,
  Send,
  User,
  Package,
  Edit,
  Paperclip,
} from "lucide-react";

const KanbanView = ({
  data,
  navigate,
  handleEditPO,
  handleMonitorPO,
  handleSendPO,
  handleDownloadPO,
  formatCurrency,
}) => {
  const columns = [
    { id: "draft", title: "Draft", color: "orange" },
    { id: "submitted", title: "Submitted", color: "blue" },
    { id: "approved", title: "Approved", color: "emerald" },
    { id: "goods arrival", title: "Goods Arrival", color: "amber" },
    { id: "fulfilled", title: "Fulfilled", color: "emerald" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-orange-500";
      case "submitted":
        return "bg-blue-500";
      case "approved":
        return "bg-emerald-500";
      case "goods arrival":
        return "bg-amber-500";
      case "fulfilled":
        return "bg-emerald-600";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar min-h-[600px]">
      {columns.map((col) => (
        <div
          key={col.id}
          className="min-w-[320px] max-w-[320px] flex flex-col gap-4"
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${getStatusColor(col.id)}`}
              />
              <h3 className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                {col.title}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">
                {data.filter((po) => po.status === col.id).length}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 flex-1">
            {data.filter((po) => po.status === col.id).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/50">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  No orders
                </p>
              </div>
            ) : (
              data
                .filter((po) => po.status === col.id)
                .map((po) => {
                  const items = po.items || [];
                  const totalQty = items.reduce(
                    (sum, item) => sum + (Number(item.quantity) || 0),
                    0,
                  );
                  const receivedQty = items.reduce(
                    (sum, item) => sum + (Number(item.received) || 0),
                    0,
                  );
                  const fulfillmentPercent =
                    totalQty > 0
                      ? Math.round((receivedQty / totalQty) * 100)
                      : 0;

                  return (
                    <div
                      key={po.id}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-blue-500"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <button
                          onClick={() =>
                            navigate(
                              `/inventory-manager/purchase-orders/${po.id}`,
                            )
                          }
                          className="text-[11px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-tight"
                        >
                          {po.po_number}
                        </button>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() =>
                              navigate(
                                `/inventory-manager/purchase-orders/${po.id}`,
                              )
                            }
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-all"
                            title="View"
                          >
                            <Eye size={14} />
                          </button>
                          {po.status === "draft" && (
                            <button
                              onClick={() => handleEditPO(po)}
                              className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-all"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleMonitorPO(po)}
                            className="p-1 text-slate-400 hover:text-purple-600 rounded transition-all relative group/msg"
                            title="Monitor"
                          >
                            <MessageSquare
                              size={14}
                              className={
                                po.unread_communication_count > 0
                                  ? "text-purple-600 animate-pulse"
                                  : ""
                              }
                            />
                            {po.unread_communication_count > 0 && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 font-bold">
                                {po.unread_communication_count}
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => handleSendPO(po)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-all"
                            title="Send Email"
                          >
                            <Mail size={14} />
                          </button>
                          <button
                            onClick={() => handleDownloadPO(po)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-all"
                            title="Download"
                          >
                            <Download size={14} />
                          </button>
                          {(po.status === "approved" ||
                            po.status === "delivered") && (
                            <button
                              onClick={() =>
                                navigate("/inventory-manager/grn-processing", {
                                  state: { po_number: po.po_number },
                                })
                              }
                              className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-all"
                              title="Process GRN"
                            >
                              <Package size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-tight truncate">
                        {po.vendor_name || "N/A"}
                      </h4>

                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar size={10} className="text-slate-400" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            {new Date(
                              po.order_date || po.created_at,
                            ).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText size={10} className="text-slate-400" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            #{po.mr_number || po.quotation_id || "Direct"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                            ₹{formatCurrency(po.total_amount)}
                          </p>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                            Total Value
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-[10px] font-black ${fulfillmentPercent === 100 ? "text-emerald-500" : "text-blue-600"}`}
                          >
                            {fulfillmentPercent}%
                          </p>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                            Received
                          </p>
                        </div>
                      </div>

                      <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${fulfillmentPercent === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                          style={{ width: `${fulfillmentPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const PurchaseOrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [editPO, setEditPO] = useState(null);
  const [preFilledFromQuotation, setPreFilledFromQuotation] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (location.state?.quotation) {
      setPreFilledFromQuotation(location.state.quotation);
      setShowCreateModal(true);
    }
  }, [location.state]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showMonitorModal, setShowMonitorModal] = useState(false);
  const [selectedPOForMonitor, setSelectedPOForMonitor] = useState(null);
  const [communications, setCommunications] = useState([]);
  const [fetchingCommunications, setFetchingCommunications] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailData, setEmailData] = useState({
    poId: null,
    poNumber: "",
    email: "",
    subject: "",
    message: "",
  });
  const [showCreateOptions, setShowCreateOptions] = useState(false);

  useEffect(() => {
    fetchPurchaseOrders();
    fetchStats();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/inventory/purchase-orders");
      setPurchaseOrders(response.data.purchaseOrders || response.data);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      toastUtils.error("Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        "/inventory/purchase-orders/stats/summary",
      );
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  };

  const generatePOPDF = async (po) => {
    const doc = new jsPDF();

    try {
      const logo = await loadImage("/logo.png");
      doc.addImage(logo, "PNG", 14, 5, 50, 15);
    } catch (error) {
      console.warn("Logo not found or failed to load:", error);
    }

    doc.setFontSize(20);
    doc.text("PURCHASE ORDER", 105, 30, { align: "center" });

    doc.setFontSize(10);
    doc.text(`PO Number: ${po.po_number}`, 14, 45);
    doc.text(
      `Date: ${new Date(po.order_date || po.created_at).toLocaleDateString("en-GB")}`,
      14,
      50,
    );
    doc.text(`Vendor: ${po.vendor_name || "N/A"}`, 14, 55);

    if (po.expected_delivery_date) {
      doc.text(
        `Expected Delivery: ${new Date(po.expected_delivery_date).toLocaleDateString("en-GB")}`,
        14,
        60,
      );
    }

    const tableColumn = [
      "#",
      "Item Details",
      "Item Code",
      "Quantity",
      "Unit",
      "Rate",
      "Amount",
    ];
    const tableRows = (po.items || []).map((item, index) => [
      index + 1,
      item.material_name || item.description || "N/A",
      item.material_code || item.item_code || "N/A",
      item.quantity,
      item.unit || "N/A",
      `INR ${item.rate || 0}`,
      `INR ${(item.amount || item.quantity * (item.rate || 0)).toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: 70,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] }, // blue-600
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(11);
    doc.text(`Subtotal: INR ${po.subtotal?.toLocaleString()}`, 140, finalY);
    doc.text(
      `Tax Amount: INR ${po.tax_amount?.toLocaleString()}`,
      140,
      finalY + 7,
    );

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Total Amount: INR ${po.total_amount?.toLocaleString()}`,
      140,
      finalY + 15,
    );
    doc.setFont("helvetica", "normal");

    if (po.notes) {
      doc.setFontSize(10);
      doc.text("Notes:", 14, finalY + 25);
      doc.text(po.notes, 14, finalY + 30);
    }

    return doc;
  };

  const handleSendEmail = (po) => {
    setEmailData({
      poId: po.id,
      poNumber: po.po_number,
      email: po.vendor_email || "",
      subject: `Purchase Order ${po.po_number} from Sterling`,
      message: `Dear ${po.vendor_name || "Vendor"},\n\nPlease find attached the Purchase Order ${po.po_number}.\n\nBest regards,\nNobal Casting`,
      po: po, // Store the whole po object to generate PDF later
    });
    setShowEmailModal(true);
  };

  const handleMonitorReplies = async (po) => {
    setSelectedPOForMonitor(po);
    setCommunications([]); // Clear previous communications
    setShowMonitorModal(true);
    fetchCommunications(po.id);
  };

  const closeMonitorModal = () => {
    setShowMonitorModal(false);
    setSelectedPOForMonitor(null);
    fetchPurchaseOrders(); // Refresh to update unread counts
    fetchStats();
  };

  const fetchCommunications = async (poId) => {
    try {
      setFetchingCommunications(true);
      const response = await axios.get(
        `/inventory/purchase-orders/${poId}/communications`,
      );
      setCommunications(response.data);
    } catch (error) {
      console.error("Error fetching communications:", error);
    } finally {
      setFetchingCommunications(false);
    }
  };

  const downloadAttachment = async (attachmentId, fileName) => {
    try {
      const response = await axios.get(
        `/inventory/purchase-orders/attachments/${attachmentId}/download`,
        {
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading attachment:", error);
      toastUtils.error("Failed to download attachment");
    }
  };

  const submitEmail = async (e) => {
    e.preventDefault();
    setSendingEmail(true);
    try {
      // Generate PDF
      const doc = await generatePOPDF(emailData.po);
      const pdfBase64 = doc.output("datauristring");

      await axios.post(`/inventory/purchase-orders/${emailData.poId}/email`, {
        ...emailData,
        pdfBase64,
      });

      // Update status to submitted if it was draft
      if (emailData.po.status === "draft") {
        await axios.patch(
          `/inventory/purchase-orders/${emailData.poId}/status`,
          { status: "submitted" },
        );
      }

      setShowEmailModal(false);
      toastUtils.success("Purchase Order sent successfully");
      fetchPurchaseOrders();
    } catch (error) {
      console.error("Error sending email:", error);
      toastUtils.error("Failed to send Purchase Order");
    } finally {
      setSendingEmail(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN").format(amount || 0);
  };

  const filteredData = purchaseOrders.filter((po) => {
    const matchesSearch =
      (po.po_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (po.vendor_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEditPO = (po) => {
    navigate(`/inventory-manager/purchase-orders/edit/${po.id}`);
  };

  const handleApprovePO = async (po) => {
    const result = await Swal.fire({
      title: "Approve Purchase Order?",
      text: `Are you sure you want to approve PO: ${po.po_number}? This will automatically create a GRN processing record.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Approve",
    });

    if (result.isConfirmed) {
      try {
        await axios.patch(`/inventory/purchase-orders/${po.id}/status`, {
          status: "approved",
        });
        toastUtils.success("Purchase order has been approved and GRN created.");
        fetchPurchaseOrders();
        fetchStats();
      } catch (error) {
        console.error("Error approving PO:", error);
        toastUtils.error("Failed to approve purchase order");
      }
    }
  };

  return (
    <div className="p-6 bg-slate-50/50 dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
              <ShoppingCart className="text-white" size={24} />
            </div>
            <div>
              <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">
                <span>Buying</span>
                <ChevronRight size={10} />
                <span className="text-blue-600">Procurement</span>
              </nav>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Purchase Orders
              </h1>
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            Manage procurement cycles and supplier orders
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${
                viewMode === "kanban"
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 shadow-sm border border-blue-100 dark:border-blue-800/50"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 shadow-sm border border-blue-100 dark:border-blue-800/50"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              List
            </button>
          </div>
          <button
            onClick={fetchPurchaseOrders}
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 shadow-sm transition-all"
          >
            <RefreshCw size={18} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowCreateOptions(!showCreateOptions)}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all"
            >
              <Plus size={16} /> Create Order
            </button>

            {showCreateOptions && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-800 mb-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Select PO Type
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditPO(null);
                    setShowCreateModal(true);
                    setShowCreateOptions(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-3 uppercase tracking-wider transition-colors"
                >
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/50 text-blue-600 rounded-md">
                    <FileText size={14} />
                  </div>
                  From Quotation
                </button>
                <button
                  onClick={() => {
                    toastUtils.info("Redirecting to Material Requests page...");
                    setTimeout(() => {
                      navigate("/inventory-manager/material-requests");
                    }, 1500);
                    setShowCreateOptions(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 flex items-center gap-3 uppercase tracking-wider transition-colors"
                >
                  <div className="p-1.5 bg-purple-50 dark:bg-purple-900/50 text-purple-600 rounded-md">
                    <Package size={14} />
                  </div>
                  From Material Request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        {[
          {
            label: "Total Orders",
            value: stats?.total || 0,
            subValue: `Total: ₹${formatCurrency(stats?.total_amount)}`,
            icon: FileText,
            color: "blue",
            active: true,
          },
          {
            label: "Draft",
            value: stats?.draft || 0,
            subValue: "Pending submission",
            icon: FileText,
            color: "orange",
          },
          {
            label: "Submitted",
            value: stats?.submitted || 0,
            subValue: "Active orders",
            icon: Mail,
            color: "blue",
          },
          {
            label: "To Receive",
            value: stats?.to_receive || 0,
            subValue: "Awaiting delivery",
            icon: Download,
            color: "indigo",
          },
          {
            label: "Partial",
            value: stats?.partial || 0,
            subValue: "Incomplete receipts",
            icon: CheckCircle,
            color: "red",
          },
          {
            label: "Fulfilled",
            value: stats?.fulfilled || 0,
            subValue: "Fully received",
            icon: CheckCircle,
            color: "emerald",
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          const colors = {
            blue: "border-blue-200 bg-blue-50 text-blue-600",
            orange: "border-orange-200 bg-orange-50 text-orange-600",
            indigo: "border-indigo-200 bg-indigo-50 text-indigo-600",
            red: "border-red-200 bg-red-50 text-red-600",
            emerald: "border-emerald-200 bg-emerald-50 text-emerald-600",
          };

          return (
            <div
              key={idx}
              className={`bg-white dark:bg-slate-900 p-4 rounded-xl border ${card.active ? "border-blue-500 ring-2 ring-blue-500/10 shadow-lg shadow-blue-500/5" : "border-slate-100 dark:border-slate-800 shadow-sm"} relative overflow-hidden group transition-all hover:shadow-md`}
            >
              <div
                className={`absolute top-0 right-0 p-4 opacity-5 transform rotate-12 transition-transform group-hover:rotate-6`}
              >
                <Icon size={48} />
              </div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {card.label}
                  </p>
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center border ${colors[card.color]}`}
                  >
                    <Icon size={12} />
                  </div>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-0.5 tracking-tight">
                  {card.value}
                </h2>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tight italic">
                  {card.subValue}
                </p>
              </div>
              {card.active && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by PO # or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 shadow-sm">
            <Filter size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-[10px] font-bold uppercase tracking-wider text-blue-600 focus:ring-0 cursor-pointer"
            >
              <option value="all">All Orders</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="delivered">Delivered</option>
              <option value="fulfilled">Fulfilled</option>
            </select>
          </div>
          <button className="p-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  PO Details
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Supplier
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Order -- Expected
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Amount
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Fulfillment
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Loading orders...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <ShoppingCart size={48} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        No orders found
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((po) => {
                  const items = po.items || [];
                  const totalQty = items.reduce(
                    (sum, item) => sum + (Number(item.quantity) || 0),
                    0,
                  );
                  const receivedQty = items.reduce(
                    (sum, item) => sum + (Number(item.received) || 0),
                    0,
                  );
                  const fulfillmentPercent =
                    totalQty > 0
                      ? Math.round((receivedQty / totalQty) * 100)
                      : 0;

                  return (
                    <tr
                      key={po.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            navigate(
                              `/inventory-manager/purchase-orders/${po.id}`,
                            )
                          }
                          className="text-[11px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-tight block mb-0.5"
                        >
                          {po.po_number}
                        </button>
                        <div className="flex items-center gap-2">
                          <FileText size={10} className="text-slate-400" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            #{po.mr_number || po.quotation_id || "Direct PO"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5 uppercase tracking-tight">
                          {po.vendor_name || "N/A"}
                        </p>
                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-emerald-500"></span>{" "}
                          Active Vendor
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-700">
                            <Calendar size={10} />
                            <span className="text-[9px] font-bold uppercase">
                              {new Date(
                                po.order_date || po.created_at,
                              ).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                          <ChevronRight size={10} className="text-slate-300" />
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-orange-50 dark:bg-orange-900/30 text-orange-600 border border-orange-100 dark:border-orange-800/30">
                            <Clock size={10} />
                            <span className="text-[9px] font-bold uppercase">
                              {po.expected_delivery_date
                                ? new Date(
                                    po.expected_delivery_date,
                                  ).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                  })
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[11px] font-bold text-slate-900 dark:text-white mb-0.5 tracking-tight">
                          ₹{formatCurrency(po.total_amount)}
                        </p>
                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                          Net Value
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider min-w-[50px]">
                            {receivedQty}/{totalQty}
                          </span>
                          <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden min-w-[80px]">
                            <div
                              className={`h-full transition-all duration-500 ${fulfillmentPercent === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                              style={{ width: `${fulfillmentPercent}%` }}
                            ></div>
                          </div>
                          <span
                            className={`text-[10px] font-black tracking-widest min-w-[30px] ${fulfillmentPercent === 100 ? "text-emerald-500" : "text-blue-600"}`}
                          >
                            {fulfillmentPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                            po.status === "draft"
                              ? "bg-orange-50 text-orange-600 border-orange-100"
                              : po.status === "submitted"
                                ? "bg-blue-50 text-blue-600 border-blue-100"
                                : po.status === "approved"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  : po.status === "goods arrival"
                                    ? "bg-amber-50 text-amber-600 border-amber-100"
                                    : po.status === "fulfilled" ||
                                        po.status === "delivered"
                                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                      : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}
                        >
                          <div
                            className={`w-1 h-1 rounded-full ${
                              po.status === "draft"
                                ? "bg-orange-500"
                                : po.status === "submitted"
                                  ? "bg-blue-500"
                                  : po.status === "goods arrival"
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                            }`}
                          ></div>
                          {po.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() =>
                              navigate(
                                `/inventory-manager/purchase-orders/${po.id}`,
                              )
                            }
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all"
                            title="View"
                          >
                            <Eye size={14} />
                          </button>
                          {po.status === "draft" && (
                            <button
                              onClick={() => handleEditPO(po)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded transition-all"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleSendEmail(po)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-all"
                            title="Send"
                          >
                            <Send size={14} />
                          </button>
                          {po.status === "submitted" && (
                            <button
                              onClick={() => handleApprovePO(po)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded transition-all"
                              title="Approve PO"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleMonitorReplies(po)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all relative group/msg"
                            title="Monitor Replies"
                          >
                            <MessageSquare
                              size={14}
                              className={
                                po.unread_communication_count > 0
                                  ? "text-blue-600 animate-pulse"
                                  : ""
                              }
                            />
                            {po.unread_communication_count > 0 && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 font-bold">
                                {po.unread_communication_count}
                              </span>
                            )}
                          </button>
                          {(po.status === "approved" ||
                            po.status === "delivered") && (
                            <button
                              onClick={() =>
                                navigate("/inventory-manager/grn-processing", {
                                  state: { po_number: po.po_number },
                                })
                              }
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded transition-all"
                              title="Process GRN / Purchase Receipt"
                            >
                              <Package size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email PO Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <Mail className="text-blue-600" size={20} />
                  Send Purchase Order
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  PO: {emailData.poNumber}
                </p>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={submitEmail} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Recipient Email
                </label>
                <input
                  type="email"
                  required
                  value={emailData.email}
                  onChange={(e) =>
                    setEmailData({ ...emailData, email: e.target.value })
                  }
                  placeholder="vendor@example.com"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) =>
                    setEmailData({ ...emailData, subject: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Message
                </label>
                <textarea
                  value={emailData.message}
                  onChange={(e) =>
                    setEmailData({ ...emailData, message: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {sendingEmail ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {sendingEmail ? "Sending..." : "Send PO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Monitor Replies Modal */}
      {showMonitorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <MessageSquare className="text-blue-600" size={20} />
                  Email Communications
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  PO: {selectedPOForMonitor?.po_number}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchCommunications(selectedPOForMonitor?.id)}
                  className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm text-slate-400 hover:text-blue-600"
                  title="Refresh"
                >
                  <RefreshCw
                    size={18}
                    className={fetchingCommunications ? "animate-spin" : ""}
                  />
                </button>
                <button
                  onClick={closeMonitorModal}
                  className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-slate-950/30 custom-scrollbar">
              {fetchingCommunications ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Fetching replies...
                  </p>
                </div>
              ) : communications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                    <Mail size={40} className="text-slate-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    No communications found
                  </h4>
                  <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-widest">
                    Replies to PO emails will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {communications.map((comm) => (
                    <div
                      key={comm.id}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${comm.is_outgoing ? "bg-indigo-100 text-indigo-600" : "bg-blue-100 text-blue-600"}`}
                          >
                            <User size={16} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                {comm.sender_email}
                              </p>
                              {comm.is_outgoing && (
                                <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[8px] font-bold uppercase tracking-widest border border-indigo-100">
                                  SENT
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Clock size={10} className="text-slate-400" />
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                {new Date(
                                  comm.created_at || comm.received_at,
                                ).toLocaleString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        {comm.has_attachments > 0 && (
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded text-[9px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/30">
                            <Paperclip size={10} />
                            {comm.attachments?.length || "Attached"}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-tight italic opacity-60">
                          Subject: {comm.subject}
                        </h4>
                        <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap font-medium">
                          {comm.content_text}
                        </div>

                        {comm.attachments && comm.attachments.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <Paperclip size={10} /> Attachments
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {comm.attachments.map((file) => (
                                <button
                                  key={file.id}
                                  onClick={() =>
                                    downloadAttachment(file.id, file.file_name)
                                  }
                                  className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg group hover:border-blue-200 dark:hover:border-blue-800 transition-all text-left"
                                >
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <FileText
                                      size={14}
                                      className="text-blue-500 shrink-0"
                                    />
                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate uppercase tracking-tight">
                                      {file.file_name}
                                    </span>
                                  </div>
                                  <Download
                                    size={14}
                                    className="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0"
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end">
              <button
                onClick={closeMonitorModal}
                className="px-8 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit PO Modal Component */}
      <CreatePurchaseOrderModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditPO(null);
          setPreFilledFromQuotation(null);
        }}
        editData={editPO}
        preFilledFromQuotation={preFilledFromQuotation}
        onPOCreated={() => {
          fetchPurchaseOrders();
          fetchStats();
        }}
      />
    </div>
  );
};

export default PurchaseOrderPage;
