import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import {
  ShoppingCart,
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Trash2,
  Calendar,
  DollarSign,
  Truck,
  X,
  Mail,
  Loader2,
  MessageSquare,
  Paperclip,
} from "lucide-react";
import taskService from "@/utils/taskService";

const PurchaseOrderPage = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [receivedQuotes, setReceivedQuotes] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedQuote, setSelectedQuote] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailData, setEmailData] = useState({
    poId: null,
    poNumber: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formData, setFormData] = useState({
    expected_delivery_date: "",
    notes: "",
  });
  const [taskId, setTaskId] = useState(null);

  // Communications State
  const [showCommsModal, setShowCommsModal] = useState(false);
  const [communications, setCommunications] = useState([]);
  const [loadingComms, setLoadingComms] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);

  useEffect(() => {
    const extractedTaskId = taskService.getTaskIdFromParams();
    if (extractedTaskId) {
      setTaskId(extractedTaskId);
    }
    fetchPurchaseOrders();
    fetchProjects();
    fetchStats();
  }, []);

  useEffect(() => {
    if (location.state?.quotation && projects.length > 0) {
      const { quotation } = location.state;
      // Pre-select project (sales order)
      if (quotation.sales_order_id) {
        setSelectedProject(quotation.sales_order_id);
      }
      setShowCreateModal(true);
    }
  }, [location.state, projects]);

  useEffect(() => {
    if (selectedProject) {
      fetchReceivedQuotes(selectedProject);
    } else {
      setReceivedQuotes([]);
      setSelectedQuote("");
    }
  }, [selectedProject]);

  useEffect(() => {
    // Select the quotation after receivedQuotes are loaded
    if (
      location.state?.quotation &&
      receivedQuotes.length > 0 &&
      showCreateModal
    ) {
      const { quotation } = location.state;
      const matchingQuote = receivedQuotes.find((q) => q.id === quotation.id);
      if (matchingQuote) {
        setSelectedQuote(matchingQuote.id);
      }
    }
  }, [receivedQuotes, location.state, showCreateModal]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/procurement/purchase-orders");
      const pos = (response.data.purchaseOrders || []).map((po) => ({
        ...po,
        items: typeof po.items === "string" ? JSON.parse(po.items) : po.items,
      }));
      setPurchaseOrders(pos);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get("/sales/requirements");
      setProjects(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchReceivedQuotes = async (projectId) => {
    try {
      const response = await axios.get(
        "/procurement/purchase-orders/quotes/received",
        {
          params: { sales_order_id: projectId },
        }
      );
      const quotes = (response.data || []).map((q) => ({
        ...q,
        items: typeof q.items === "string" ? JSON.parse(q.items) : q.items,
      }));
      setReceivedQuotes(quotes);
    } catch (error) {
      console.error("Error fetching received quotes:", error);
      setReceivedQuotes([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        "/procurement/purchase-orders/stats/all"
      );
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleViewComms = async (po) => {
    setSelectedPO(po);
    setShowCommsModal(true);
    setLoadingComms(true);
    try {
      const response = await axios.get(
        `/procurement/purchase-orders/${po.id}/communications`
      );
      setCommunications(response.data);
    } catch (error) {
      console.error("Error fetching communications:", error);
      Swal.fire("Error", "Failed to load communications", "error");
    } finally {
      setLoadingComms(false);
    }
  };

  const handleCloseComms = () => {
    setShowCommsModal(false);
    fetchPurchaseOrders(); // Refresh list to update read status badges
  };

  const handleDownloadAttachment = async (attachmentId, fileName) => {
    try {
      const response = await axios.get(
        `/procurement/purchase-orders/attachments/${attachmentId}/download`,
        {
          responseType: "blob",
        }
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
      Swal.fire("Error", "Failed to download attachment", "error");
    }
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();

    if (!selectedQuote) {
      Swal.fire("Warning", "Please select a quotation", "warning");
      return;
    }

    const quote = receivedQuotes.find((q) => q.id === parseInt(selectedQuote));
    if (!quote) {
      Swal.fire("Error", "Quotation not found", "error");
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = {
        quotation_id: quote.id,
        vendor_id: quote.vendor_id,
        items: quote.items || [],
        total_amount: quote.total_amount || 0,
        expected_delivery_date: formData.expected_delivery_date || null,
        notes: formData.notes || null,
      };

      const response = await axios.post(
        "/procurement/purchase-orders",
        payload
      );

      Swal.fire(
        "Success",
        "Purchase Order created successfully: " + response.data.po_number,
        "success"
      );

      if (taskId) {
        await taskService.autoCompleteTaskByAction(taskId, "create");
      }

      setShowCreateModal(false);
      setSelectedProject("");
      setSelectedQuote("");
      setFormData({
        expected_delivery_date: "",
        notes: "",
      });
      fetchPurchaseOrders();
      fetchStats();
    } catch (error) {
      console.error("Error creating PO:", error);
      Swal.fire(
        "Error",
        "Failed to create purchase order: " +
          (error.response?.data?.message || error.message),
        "error"
      );
    } finally {
      setFormSubmitting(false);
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

  const generatePDF = async (po) => {
    const doc = new jsPDF();

    try {
      const logo = await loadImage("/logo.png");
      doc.addImage(logo, "PNG", 14, 5, 50, 15); // 40mm width, 20mm height
    } catch (error) {
      console.warn("Logo not found or failed to load:", error);
    }

    // Header
    doc.setFontSize(20);
    doc.text("PURCHASE ORDER", 105, 30, { align: "center" });

    doc.setFontSize(10);
    doc.text(`PO Number: ${po.po_number}`, 14, 45);
    doc.text(
      `Date: ${new Date(po.created_at || Date.now()).toLocaleDateString()}`,
      14,
      50
    );
    doc.text(`Vendor: ${po.vendor_name || "N/A"}`, 14, 55);

    if (po.expected_delivery_date) {
      doc.text(
        `Expected Delivery: ${new Date(
          po.expected_delivery_date
        ).toLocaleDateString()}`,
        14,
        60
      );
    }

    // Items Table
    const tableColumn = [
      "Description",
      "Category",
      "Quantity",
      "Unit Price",
      "Total",
    ];
    const tableRows = (po.items || []).map((item) => [
      item.description,
      item.category || item.materialType || "",
      item.quantity,
      `INR ${item.unit_price || 0}`,
      `INR ${(item.quantity * (item.unit_price || 0)).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 70,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [66, 139, 202] },
    });

    // Total
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(
      `Total Amount: INR ${po.total_amount?.toLocaleString()}`,
      140,
      finalY
    );

    if (po.notes) {
      doc.setFontSize(10);
      doc.text("Notes:", 14, finalY + 10);
      doc.text(po.notes, 14, finalY + 15);
    }

    return doc;
  };

  const handleViewPO = async (po) => {
    const doc = await generatePDF(po);
    window.open(doc.output("bloburl"), "_blank");
  };

  const handleSendEmail = (po) => {
    setEmailData({
      poId: po.id,
      poNumber: po.po_number,
      email: po.vendor_email || "",
      subject: `Purchase Order ${po.po_number}`,
      message: `Dear ${
        po.vendor_name || "Vendor"
      },\n\nPlease find attached Purchase Order ${
        po.po_number
      }.\n\nBest regards,\nSterling ERP`,
    });
    setShowEmailModal(true);
  };

  const submitEmail = async (e) => {
    e.preventDefault();
    if (!emailData.email) {
      Swal.fire("Warning", "Please enter an email address", "warning");
      return;
    }

    setSendingEmail(true);
    try {
      const po = purchaseOrders.find((p) => p.id === emailData.poId);
      if (!po) throw new Error("PO not found");

      const doc = await generatePDF(po);
      const pdfBase64 = doc.output("datauristring");

      await axios.post(`/procurement/purchase-orders/${po.id}/email`, {
        email: emailData.email,
        subject: emailData.subject,
        message: emailData.message,
        pdfBase64,
      });

      Swal.fire("Success", "Email sent successfully!", "success");

      if (taskId) {
        await taskService.autoCompleteTaskByAction(taskId, "send");
      }

      setShowEmailModal(false);
    } catch (error) {
      console.error("Error sending email:", error);
      Swal.fire(
        "Error",
        "Failed to send email: " +
          (error.response?.data?.message || error.message),
        "error"
      );
    } finally {
      setSendingEmail(false);
    }
  };

  const handleUpdateStatus = async (po) => {
    const { value: newStatus } = await Swal.fire({
      title: "Update Status",
      input: "select",
      inputOptions: {
        pending: "Pending",
        approved: "Approved",
        delivered: "Delivered",
      },
      inputValue: po.status,
      showCancelButton: true,
      confirmButtonText: "Update",
      inputValidator: (value) => {
        if (!value) {
          return "You need to select a status!";
        }
      },
    });

    if (newStatus && newStatus !== po.status) {
      try {
        await axios.patch(`/procurement/purchase-orders/${po.id}/status`, {
          status: newStatus,
        });
        Swal.fire("Success", "Status updated successfully", "success");

        if (taskId && newStatus === "approved") {
          await taskService.autoCompleteTaskByAction(taskId, "approve");
        }

        fetchPurchaseOrders();
        fetchStats();
      } catch (error) {
        console.error("Error updating status:", error);
        Swal.fire("Error", "Failed to update status", "error");
      }
    }
  };

  const handleDeletePO = async (poId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`/procurement/purchase-orders/${poId}`);
      Swal.fire("Deleted!", "Purchase Order has been deleted.", "success");
      fetchPurchaseOrders();
      fetchStats();
    } catch (error) {
      console.error("Error deleting PO:", error);
      Swal.fire("Error", "Failed to delete purchase order", "error");
    }
  };

  const filteredData = purchaseOrders.filter((po) => {
    const matchesSearch =
      po.po_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || po.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "approved":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN");
  };

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
            <ShoppingCart size={28} />
            Purchase Orders
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs">
            Create and manage purchase orders from vendor quotations
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py- bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors font-medium"
          >
            <Plus size={18} />
            Create PO from Quote
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-xs:5001/api/sales/material-requirements/9:1  Failed to load resource: the server responded with a status of 404 (Not Found)Understand this error
CheckProjectMaterialRequirementsModal.jsx?t=1767173544562:44 Error fetching material requirements: AxiosError
fetchMaterialRequirements @ CheckProjectMaterialRequirementsModal.jsx?t=1767173544562:44Understand this error
:5001/api/auth/login:1  Failed to load resource: the server responded with a status of 401 (Unauthorized)Understand this error
ProjectDetailsPage.jsx:201 Sales orders response: Object
ProjectDetailsPage.jsx:201 Sales orders response: Object
ProjectDetailsPage.jsx:201 Sales orders response: Object
ProjectDetailsPage.jsx:201 Sales orders response: Object
:5001/api/auth/login:1  Failed to load resource: the server responded with a status of 401 (Unauthorized)Understand this error
status:1  Failed to load resource: the server responded with a status of 500 (Internal Server Error)Understand this error
QuotationsPage.jsx?t=1767175575292:463 Error sending email: AxiosError
submitEmail @ QuotationsPage.jsx?t=1767175575292:463Understand this error
QuotationsPage.jsx:520  PATCH http://localhost:5001/api/inventory/quotations/18/status 500 (Internal Server Error)
dispatchXhrRequest @ axios.js?v=5b1d54ee:1696
xhr @ axios.js?v=5b1d54ee:1573
dispatchRequest @ axios.js?v=5b1d54ee:2107
Promise.then
_request @ axios.js?v=5b1d54ee:2310
request @ axios.js?v=5b1d54ee:2219
httpMethod @ axios.js?v=5b1d54ee:2356
wrap @ axios.js?v=5b1d54ee:8
submitEmail @ QuotationsPage.jsx:520
await in submitEmail
executeDispatch @ react-dom_client.js?v=5b1d54ee:13622
runWithFiberInDEV @ react-dom_client.js?v=5b1d54ee:997
processDispatchQueue @ react-dom_client.js?v=5b1d54ee:13658
(anonymous) @ react-dom_client.js?v=5b1d54ee:14071
batchedUpdates$1 @ react-dom_client.js?v=5b1d54ee:2626
dispatchEventForPluginEventSystem @ react-dom_client.js?v=5b1d54ee:13763
dispatchEvent @ react-dom_client.js?v=5b1d54ee:16784
dispatchDiscreteEvent @ react-dom_client.js?v=5b1d54ee:16765
<form>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=5b1d54ee:247
QuotationsPage @ QuotationsPage.jsx:1703
react_stack_bottom_frame @ react-dom_client.js?v=5b1d54ee:18509
renderWithHooksAgain @ react-dom_client.js?v=5b1d54ee:5729
renderWithHooks @ react-dom_client.js?v=5b1d54ee:5665
updateFunctionComponent @ react-dom_client.js?v=5b1d54ee:7475
beginWork @ react-dom_client.js?v=5b1d54ee:8525
runWithFiberInDEV @ react-dom_client.js?v=5b1d54ee:997
performUnitOfWork @ react-dom_client.js?v=5b1d54ee:12561
workLoopSync @ react-dom_client.js?v=5b1d54ee:12424
renderRootSync @ react-dom_client.js?v=5b1d54ee:12408
performWorkOnRoot @ react-dom_client.js?v=5b1d54ee:11766
performSyncWorkOnRoot @ react-dom_client.js?v=5b1d54ee:13517
flushSyncWorkAcrossRoots_impl @ react-dom_client.js?v=5b1d54ee:13414
processRootScheduleInMicrotask @ react-dom_client.js?v=5b1d54ee:13437
(anonymous) @ react-dom_client.js?v=5b1d54ee:13531Understand this error
QuotationsPage.jsx:528 Error sending email: AxiosError {message: 'Request failed with status code 500', name: 'AxiosError', code: 'ERR_BAD_RESPONSE', config: {…}, request: XMLHttpRequest, …}
submitEmail @ QuotationsPage.jsx:528
await in submitEmail
executeDispatch @ react-dom_client.js?v=5b1d54ee:13622
runWithFiberInDEV @ react-dom_client.js?v=5b1d54ee:997
processDispatchQueue @ react-dom_client.js?v=5b1d54ee:13658
(anonymous) @ react-dom_client.js?v=5b1d54ee:14071
batchedUpdates$1 @ react-dom_client.js?v=5b1d54ee:2626
dispatchEventForPluginEventSystem @ react-dom_client.js?v=5b1d54ee:13763
dispatchEvent @ react-dom_client.js?v=5b1d54ee:16784
dispatchDiscreteEvent @ react-dom_client.js?v=5b1d54ee:16765
<form>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=5b1d54ee:247
QuotationsPage @ QuotationsPage.jsx:1703
react_stack_bottom_frame @ react-dom_client.js?v=5b1d54ee:18509
renderWithHooksAgain @ react-dom_client.js?v=5b1d54ee:5729
renderWithHooks @ react-dom_client.js?v=5b1d54ee:5665
updateFunctionComponent @ react-dom_client.js?v=5b1d54ee:7475
beginWork @ react-dom_client.js?v=5b1d54ee:8525
runWithFiberInDEV @ react-dom_client.js?v=5b1d54ee:997
performUnitOfWork @ react-dom_client.js?v=5b1d54ee:12561
workLoopSync @ react-dom_client.js?v=5b1d54ee:12424
renderRootSync @ react-dom_client.js?v=5b1d54ee:12408
performWorkOnRoot @ react-dom_client.js?v=5b1d54ee:11766
performSyncWorkOnRoot @ react-dom_client.js?v=5b1d54ee:13517
flushSyncWorkAcrossRoots_impl @ react-dom_client.js?v=5b1d54ee:13414
processRootScheduleInMicrotask @ react-dom_client.js?v=5b1d54ee:13437
(anonymous) @ react-dom_client.js?v=5b1d54ee:13531Understand this error
QuotationsPage.jsx:906 Uncaught ReferenceError: MessageSquare is not defined
    at QuotationsPage.jsx:906:30
    at Array.map (<anonymous>)
    at QuotationsPage (QuotationsPage.jsx:814:29)
    at Object.react_stack_bottom_frame (react-dom_client.js?v=5b1d54ee:18509:20)
    at renderWithHooks (react-dom_client.js?v=5b1d54ee:5654:24)
    at updateFunctionComponent (react-dom_client.js?v=5b1d54ee:7475:21)
    at beginWork (react-dom_client.js?v=5b1d54ee:8525:20)
    at runWithFiberInDEV (react-dom_client.js?v=5b1d54ee:997:72)
    at performUnitOfWork (react-dom_client.js?v=5b1d54ee:12561:98)
    at workLoopSync (react-dom_client.js?v=5b1d54ee:12424:43)
(anonymous) @ QuotationsPage.jsx:906
QuotationsPage @ QuotationsPage.jsx:814
react_stack_bottom_frame @ react-dom_client.js?v=5b1d54ee:18509
renderWithHooks @ react-dom_client.js?v=5b1d54ee:5654
updateFunctionComponent @ react-dom_client.js?v=5b1d54ee:7475
beginWork @ react-dom_client.js?v=5b1d54ee:8525
runWithFiberInDEV @ react-dom_client.js?v=5b1d54ee:997
performUnitOfWork @ react-dom_client.js?v=5b1d54ee:12561
workLoopSync @ react-dom_client.js?v=5b1d54ee:12424
renderRootSync @ react-dom_client.js?v=5b1d54ee:12408
performWorkOnRoot @ react-dom_client.js?v=5b1d54ee:11827
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b1d54ee:13505
performWorkUntilDeadline @ react-dom_client.js?v=5b1d54ee:36Understand this error
react-dom_client.js?v=5b1d54ee:6966 An error occurred in the <QuotationsPage> component.

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://react.dev/link/error-boundaries to learn more about error boundaries. bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search PO number or vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium text-xs"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="delivered">Delivered</option>
          </select>

          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs">
            <Filter size={18} />
            Advanced Filter
          </button>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">
                  PO Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">
                  Vendor
                </th>
                <th className="px-6 py-3 text-right text-xs text-sm font-semibold text-slate-900 dark:text-white">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">
                  Expected Delivery
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
                  Items
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Loading purchase orders...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No purchase orders found
                  </td>
                </tr>
              ) : (
                filteredData.map((po) => (
                  <tr
                    key={po.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <td className="px-6 py-3 text-slate-900 dark:text-white text-xs">
                      {po.po_number}
                    </td>
                    <td className="px-6 py-3 text-slate-700 dark:text-slate-300 text-xs">
                      {po.vendor_name || "N/A"}
                    </td>
                    <td className="px-6 py-3 text-right text-xs">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        ₹{formatCurrency(po.total_amount)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-700 dark:text-slate-300 text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {formatDate(po.expected_delivery_date)}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          po.status
                        )}`}
                      >
                        {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center text-xs text-slate-600 dark:text-slate-400 ">
                      {(po.items || []).length} items
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewPO(po)}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleSendEmail(po)}
                          className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors"
                          title="Send Email"
                        >
                          <Mail size={16} />
                        </button>
                        <button
                          onClick={() => handleViewComms(po)}
                          className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-lg transition-colors relative"
                          title="View Communications"
                        >
                          <MessageSquare size={16} />
                          {po.unread_communication_count > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(po)}
                          className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors"
                          title="Update Status"
                        >
                          <CheckCircle size={16} />
                        </button>
                        {po.status !== "delivered" && (
                          <button
                            onClick={() => handleDeletePO(po.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-blue-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Total POs
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white text-xs mt-2">
            {stats?.total || 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-yellow-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Pending
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white text-xs mt-2">
            {stats?.pending || 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-blue-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Approved
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white text-xs mt-2">
            {stats?.approved || 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-green-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Delivered
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white text-xs mt-2">
            {stats?.delivered || 0}
          </p>
        </div>
      </div>

      {/* Communications Modal */}
      {showCommsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white text-xs">
                  Communications
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  PO: {selectedPO?.po_number} - {selectedPO?.vendor_name}
                </p>
              </div>
              <button
                onClick={handleCloseComms}
                className="text-slate-400 hover:text-slate-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingComms ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
              ) : communications.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <MessageSquare
                    size={48}
                    className="mx-auto mb-4 opacity-20"
                  />
                  <p>No communications found for this Purchase Order.</p>
                  <p className="text-sm mt-2">
                    Replies to emails with subject "{selectedPO?.po_number}"
                    will appear here.
                  </p>
                </div>
              ) : (
                communications.map((comm) => (
                  <div
                    key={comm.id}
                    className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {comm.sender_email}
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(comm.received_at).toLocaleString()}
                        </p>
                      </div>
                      {comm.has_attachments && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          Attachments
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                      {comm.content_text || "No text content"}
                    </div>

                    {comm.attachments && comm.attachments.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {comm.attachments.map((att) => (
                          <button
                            key={att.id}
                            onClick={() =>
                              handleDownloadAttachment(att.id, att.file_name)
                            }
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors"
                          >
                            <Paperclip size={14} />
                            {att.file_name}
                            <span className="text-slate-400 dark:text-slate-400 ml-1">
                              ({Math.round(att.file_size / 1024)} KB)
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs text-center text-slate-500">
                The system automatically checks for replies every minute.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create PO Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus size={20} className="text-blue-500" />
                Create Purchase Order
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Select Project <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a project...</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.salesOrderId}>
                      {project.projectName} ({project.poNumber})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProject && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Select Quotation <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedQuote}
                    onChange={(e) => setSelectedQuote(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a quotation...</option>
                    {receivedQuotes.map((quote) => (
                      <option key={quote.id} value={quote.id}>
                        {quote.vendor_name} - ₹
                        {formatCurrency(quote.total_amount)} (
                        {new Date(quote.created_at).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={formData.expected_delivery_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expected_delivery_date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes for the vendor..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating PO...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create PO
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email PO Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail size={20} className="text-blue-500" />
                Send Purchase Order
              </h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitEmail} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  To (Email) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={emailData.email}
                  onChange={(e) =>
                    setEmailData({ ...emailData, email: e.target.value })
                  }
                  placeholder="vendor@example.com"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) =>
                    setEmailData({ ...emailData, subject: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Message
                </label>
                <textarea
                  value={emailData.message}
                  onChange={(e) =>
                    setEmailData({ ...emailData, message: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderPage;
