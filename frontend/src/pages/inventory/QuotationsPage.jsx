import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FileText,
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Check,
  CheckCircle,
  X,
  Calendar,
  DollarSign,
  Trash2,
  Briefcase,
  Loader2,
  Save,
  ArrowLeft,
  Send,
  Mail,
  MessageSquare,
  Paperclip,
} from "lucide-react";
import axios from "../../utils/api";
import useProjectInventoryTask from "../../hooks/useProjectInventoryTask";

const QuotationsPage = () => {
  const navigate = useNavigate();
  const { completeCurrentTask, isFromDepartmentTasks } = useProjectInventoryTask();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("outbound");
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [projects, setProjects] = useState([]); // Added projects state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [analysisMode, setAnalysisMode] = useState(false);
  const [projectMaterials, setProjectMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [savingRequirements, setSavingRequirements] = useState(false);
  const [projectQuotations, setProjectQuotations] = useState([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailData, setEmailData] = useState({
    quotationId: null,
    quotationNumber: "",
    email: "",
    subject: "",
    message: "",
  });
  const [showCommunicationsModal, setShowCommunicationsModal] = useState(false);
  const [selectedQuotationForComms, setSelectedQuotationForComms] = useState(null);
  const [communications, setCommunications] = useState([]);
  const [loadingCommunications, setLoadingCommunications] = useState(false);
  const [formData, setFormData] = useState({
    vendor_id: "",
    sales_order_id: "", // Added sales_order_id
    total_amount: 0,
    valid_until: "",
    items: [],
    notes: "",
    type: "outbound",
    reference_id: null,
  });

  const fetchQuotations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);
      params.append("type", activeTab);

      const response = await axios.get(`/inventory/quotations?${params}`);
      setQuotations(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching quotations:", err);
      setError("Failed to fetch quotations");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, activeTab]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get("/inventory/quotations/stats");
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching quotation stats:", err);
    }
  }, []);

  const fetchVendors = useCallback(async () => {
    try {
      const response = await axios.get("/inventory/vendors");
      setVendors(response.data);
    } catch (err) {
      console.error("Error fetching vendors:", err);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await axios.get("/sales/requirements");
      setProjects(response.data.data || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  }, []);

  useEffect(() => {
    fetchQuotations();
    fetchStats();
    fetchVendors();
    fetchProjects();
  }, [fetchQuotations, fetchStats, fetchVendors, fetchProjects]);

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
      items: [...prev.items, { description: "", quantity: "", unit_price: "" }],
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
              field === "description"
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

  const handleAddQuotation = async (e) => {
    e.preventDefault();

    if (!formData.vendor_id) {
      Swal.fire("Warning", "Please select a vendor", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const notesWithRef = formData.sales_order_id
        ? `Ref: Sales Order ${formData.sales_order_id}\n\n${formData.notes}`
        : formData.notes;

      const payload = {
        ...formData,
        sales_order_id: formData.sales_order_id
          ? parseInt(formData.sales_order_id)
          : null,
        notes: notesWithRef,
        total_amount: formData.total_amount || 0,
        items: formData.items || [],
      };

      await axios.post("/inventory/quotations", payload);

      setShowAddModal(false);
      setFormData({
        vendor_id: "",
        sales_order_id: "",
        total_amount: 0,
        valid_until: "",
        items: [],
        notes: "",
        type: activeTab,
        reference_id: null,
      });

      fetchQuotations();
      fetchStats();
      
      if (activeTab === "outbound") {
        await completeCurrentTask("RFQ quotation created");
      } else if (activeTab === "inbound") {
        await completeCurrentTask("Vendor quotation received and recorded");
      }
      
      Swal.fire("Success", "Quotation created successfully", "success");
    } catch (err) {
      console.error("Error creating quotation:", err);
      Swal.fire("Error", "Failed to create quotation", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProjectChange = async (e) => {
    const selectedSalesOrderId = e.target.value;

    setFormData((prev) => ({
      ...prev,
      sales_order_id: selectedSalesOrderId,
      reference_id: null, // Reset reference_id when project changes
      items: [], // Reset items
    }));

    if (!selectedSalesOrderId) {
      setFormData((prev) => ({ ...prev, items: [] }));
      setProjectMaterials([]);
      setProjectQuotations([]);
      setAnalysisMode(false);
      return;
    }

    try {
      if (formData.type === "outbound") {
        // Existing logic for Outbound - load materials
        setLoadingMaterials(true);
        const reqResponse = await axios.get(
          `/sales/requirements/${selectedSalesOrderId}`
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

        setProjectMaterials(initializedMaterials);
        setAnalysisMode(true);
      } else {
        // Logic for Inbound - load outbound quotations for this project
        const quotesResponse = await axios.get(
          `/inventory/quotations/project/${selectedSalesOrderId}`
        );
        setProjectQuotations(quotesResponse.data);
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
      Swal.fire("Error", "Failed to load project details", "error");
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleOutboundQuotationSelect = (e) => {
    const quoteId = e.target.value;
    if (!quoteId) return;

    const selectedQuote = projectQuotations.find(
      (q) => q.id.toString() === quoteId
    );
    if (selectedQuote) {
      setFormData((prev) => ({
        ...prev,
        reference_id: selectedQuote.id,
        vendor_id: selectedQuote.vendor_id,
        items: (selectedQuote.items || []).map((item) => ({
          description: item.description,
          category: item.category || item.materialType || "",
          quantity: item.quantity,
          unit_price: 0,
        })),
        notes: `Response to ${selectedQuote.quotation_number}`,
      }));
    }
  };

  const handleRequirementChange = (index, field, value) => {
    setProjectMaterials((prev) => {
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
    if (!formData.sales_order_id) return;

    try {
      setSavingRequirements(true);
      await axios.post(`/sales/requirements/${formData.sales_order_id}`, {
        materials: projectMaterials.map((m) => {
          const rest = { ...m };
          delete rest.selected;
          return rest;
        }),
        procurementStatus: "pending",
      });

      // Auto-proceed to quote
      const selectedItems = projectMaterials.filter((m) => m.selected);
      const items = selectedItems.map((m) => ({
        description: m.itemName || m.item_name || "Unnamed Material",
        category: m.category || m.materialType || "",
        quantity: Math.max(
          0,
          (parseFloat(m.requiredQuantity) || 0) -
            (parseFloat(m.currentStock) || 0)
        ),
        unit_price: 0,
      }));

      setFormData((prev) => ({ ...prev, items }));
      setAnalysisMode(false);

      if (isFromDepartmentTasks()) {
        await completeCurrentTask("Material requirements reviewed and quotation created");
      }
    } catch (error) {
      console.error("Error saving requirements:", error);
      Swal.fire("Error", "Failed to save requirements", "error");
    } finally {
      setSavingRequirements(false);
    }
  };

  const handleViewQuotation = async (quotation) => {
    try {
      const response = await axios.get(`/inventory/quotations/${quotation.id}`);
      const doc = await generateQuotationPDF(response.data);
      window.open(doc.output("bloburl"), "_blank");
    } catch (err) {
      console.error("Error viewing quotation PDF:", err);
      Swal.fire("Error", "Failed to generate quotation PDF", "error");
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

  const generateQuotationPDF = async (quotation) => {
    const doc = new jsPDF();

    try {
      const logo = await loadImage("/logo.png");
      doc.addImage(logo, "PNG", 14, 5, 50, 15);
    } catch (error) {
      console.warn("Logo not found or failed to load:", error);
    }

    doc.setFontSize(20);
    doc.text("QUOTATION REQUEST", 105, 30, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Quotation No: ${quotation.quotation_number}`, 14, 45);
    doc.text(
      `Date: ${new Date(quotation.created_at || Date.now()).toLocaleDateString()}`,
      14,
      50
    );
    doc.text(`Vendor: ${quotation.vendor_name || "N/A"}`, 14, 55);

    if (quotation.valid_until) {
      doc.text(
        `Valid Until: ${new Date(quotation.valid_until).toLocaleDateString()}`,
        14,
        60
      );
    }

    const tableColumn = ["Description", "Category", "Quantity"];
    if (quotation.type === "inbound") {
      tableColumn.push("Unit Price", "Total");
    }

    const tableRows = (quotation.items || []).map((item) => {
      const row = [
        item.description,
        item.category || item.materialType || "",
        item.quantity,
      ];
      if (quotation.type === "inbound") {
        row.push(
          `INR ${item.unit_price || 0}`,
          `INR ${(item.quantity * (item.unit_price || 0)).toFixed(2)}`
        );
      }
      return row;
    });

    autoTable(doc, {
      startY: 70,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [66, 139, 202] },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    if (quotation.type === "inbound" && quotation.total_amount) {
      doc.setFontSize(12);
      doc.text(
        `Total Amount: INR ${quotation.total_amount?.toLocaleString()}`,
        140,
        finalY
      );
    }

    if (quotation.notes) {
      doc.setFontSize(10);
      doc.text("Notes:", 14, finalY + (quotation.type === "inbound" ? 10 : 0));
      doc.text(quotation.notes, 14, finalY + (quotation.type === "inbound" ? 15 : 5));
    }

    return doc;
  };

  const handleViewQuotationPDF = async (quotation) => {
    try {
      const doc = await generateQuotationPDF(quotation);
      window.open(doc.output("bloburl"), "_blank");
    } catch (error) {
      console.error("Error generating PDF:", error);
      Swal.fire("Error", "Failed to generate quotation PDF", "error");
    }
  };

  const handleSendEmail = (quotation) => {
    const vendor = vendors.find((v) => v.id === quotation.vendor_id);
    setEmailData({
      quotationId: quotation.id,
      quotationNumber: quotation.quotation_number,
      email: vendor?.email || "",
      subject: `Quotation Request ${quotation.quotation_number}`,
      message: `Dear ${
        vendor?.name || "Vendor"
      },\n\nPlease find attached quotation request ${
        quotation.quotation_number
      }.\n\nBest regards,\nSterling ERP`,
    });
    setShowEmailModal(true);
  };

  const handleViewCommunications = async (quotation) => {
    setSelectedQuotationForComms(quotation);
    setShowCommunicationsModal(true);
    setLoadingCommunications(true);
    try {
      const response = await axios.get(
        `/inventory/quotations/${quotation.id}/communications`
      );
      setCommunications(response.data || []);
    } catch (error) {
      console.error("Error fetching communications:", error);
      setCommunications([]);
    } finally {
      setLoadingCommunications(false);
    }
  };

  const handleCloseCommunications = () => {
    setShowCommunicationsModal(false);
    fetchQuotations();
  };

  const handleDownloadAttachment = async (attachmentId, fileName) => {
    try {
      const response = await axios.get(
        `/inventory/quotations/attachments/${attachmentId}/download`,
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
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading attachment:", error);
      Swal.fire("Error", "Failed to download attachment", "error");
    }
  };

  const submitEmail = async (e) => {
    e.preventDefault();
    if (!emailData.email) {
      Swal.fire("Warning", "Please enter an email address", "warning");
      return;
    }

    setSendingEmail(true);
    try {
      const quotation = quotations.find((q) => q.id === emailData.quotationId);
      if (!quotation) throw new Error("Quotation not found");

      const doc = await generateQuotationPDF(quotation);
      const pdfBase64 = doc.output("datauristring");

      await axios.post(`/inventory/quotations/${quotation.id}/email`, {
        email: emailData.email,
        subject: emailData.subject,
        message: emailData.message,
        pdfBase64,
      });

      await axios.patch(`/inventory/quotations/${quotation.id}/status`, {
        status: "sent",
      });

      await completeCurrentTask("Quotation sent to vendor via email");

      Swal.fire("Success", "Quotation sent successfully!", "success");
      setShowEmailModal(false);
      fetchQuotations();
    } catch (error) {
      console.error("Error sending email:", error);
      Swal.fire(
        "Error",
        "Failed to send quotation: " +
          (error.response?.data?.message || error.message),
        "error"
      );
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDeleteQuotation = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`/inventory/quotations/${id}`);
      fetchQuotations();
      fetchStats();
      Swal.fire("Deleted!", "Quotation deleted successfully.", "success");
    } catch (err) {
      console.error("Error deleting quotation:", err);
      Swal.fire("Error", "Failed to delete quotation", "error");
    }
  };

  const handleUpdateStatus = async (quote) => {
    const { value: newStatus } = await Swal.fire({
      title: "Update Status",
      input: "select",
      inputOptions: {
        pending: "Pending",
        approved: "Approved",
        rejected: "Rejected",
      },
      inputValue: quote.status,
      showCancelButton: true,
      confirmButtonText: "Update",
      inputValidator: (value) => {
        if (!value) {
          return "You need to select a status!";
        }
      },
    });

    if (newStatus && newStatus !== quote.status) {
      try {
        await axios.patch(`/inventory/quotations/${quote.id}/status`, {
          status: newStatus,
        });
        Swal.fire("Success", "Status updated successfully", "success");
        fetchQuotations();
        fetchStats();
      } catch (error) {
        console.error("Error updating status:", error);
        Swal.fire("Error", "Failed to update status", "error");
      }
    }
  };

  const handleRecordResponse = (quote) => {
    setFormData({
      vendor_id: quote.vendor_id,
      sales_order_id: "",
      total_amount: 0,
      valid_until: "",
      items: (quote.items || []).map((item) => ({
        description: item.description,
        category: item.category || item.materialType || "",
        quantity: item.quantity,
        unit_price: 0,
      })),
      notes: `Response to ${quote.quotation_number}`,
      type: "inbound",
      reference_id: quote.id,
    });
    setShowAddModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const isExpired = (validUntil) => {
    if (!validUntil) return false;
    const today = new Date();
    const expiry = new Date(validUntil);
    return expiry < today;
  };

  const getDaysValid = (validUntil) => {
    if (!validUntil) return "N/A";
    const today = new Date();
    const expiry = new Date(validUntil);
    const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const formatCurrency = (value) => {
    if (!value) return "₹0";
    return `₹${(value / 100000).toFixed(2)}L`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-md font-bold text-slate-900 dark:text-white  flex items-center gap-2">
            <FileText size={24} />
            Vendor Quotations
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs">
            Manage and compare vendor quotes
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => {
              setFormData({
                vendor_id: "",
                sales_order_id: "",
                total_amount: 0,
                valid_until: "",
                items: [],
                notes: "",
                type: activeTab,
                reference_id: null,
              });
              setProjectMaterials([]);
              setProjectQuotations([]);
              setAnalysisMode(false);
              setShowAddModal(true);
            }}
            className={`flex items-center text-xs gap-2 px-4 py-2 text-white rounded-lg transition-colors font-medium ${
              activeTab === "outbound"
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {activeTab === "outbound" ? <Send size={18} /> : <Plus size={18} />}
            {activeTab === "outbound" ? "Request Quote" : "Record Quote"}
          </button>
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {isFromDepartmentTasks() && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
              📋 Inventory Task Context
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-400 mt-1">
              You're working on a task from the Department Tasks workflow. When you complete actions here, the task status will be automatically updated.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          className={`px-4 py-2 font-medium text-sm transition-colors relative ${
            activeTab === "outbound"
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
          onClick={() => setActiveTab("outbound")}
        >
          Sent Requests (RFQ)
          {activeTab === "outbound" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400" />
          )}
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm transition-colors relative ${
            activeTab === "inbound"
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
          onClick={() => setActiveTab("inbound")}
        >
          Received Quotes
          {activeTab === "inbound" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400" />
          )}
        </button>
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
              placeholder="Search quote, vendor..."
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
            <option value="all">All Quotations</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <button className="flex items-center text-xs justify-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Filter size={18} />
            Advanced Filter
          </button>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                Loading quotations...
              </p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : quotations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                No quotations found
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">
                    Quote No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">
                    Vendor
                  </th>
                  {activeTab === "inbound" && (
                    <th className="px-6 py-3 text-right text-xs text-sm font-semibold text-slate-900 dark:text-white">
                      Total Amount
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">
                    Valid Till
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                {quotations.map((quote) => (
                  <tr
                    key={quote.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                      isExpired(quote.valid_until)
                        ? "bg-red-50 dark:bg-red-900/20"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white text-xs">
                        {quote.quotation_number}
                      </p>
                      {quote.reference_id && (
                        <p className="text-xs text-slate-500">
                          Ref: {quote.reference_number}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      {quote.vendor_name}
                    </td>
                    {activeTab === "inbound" && (
                      <td className="px-6 py-4 text-right">
                        <p className="font-bold text-slate-900 dark:text-white text-xs flex items-center justify-end gap-1">
                          <DollarSign size={14} />
                          {quote.total_amount
                            ? quote.total_amount.toLocaleString()
                            : "0"}
                        </p>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center text-xs gap-2">
                        <Calendar size={14} className="text-slate-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white text-xs">
                            {formatDate(quote.valid_until)}
                          </p>
                          <p
                            className={`text-xs ${
                              isExpired(quote.valid_until)
                                ? "text-red-600 font-semibold"
                                : getDaysValid(quote.valid_until) <= 3
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {isExpired(quote.valid_until)
                              ? "Expired"
                              : getDaysValid(quote.valid_until) + " days valid"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          quote.status
                        )}`}
                      >
                        {quote.status.charAt(0).toUpperCase() +
                          quote.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        {activeTab === "outbound" && (
                          <button
                            onClick={() => handleRecordResponse(quote)}
                            className="p-2 hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                            title="Record Vendor Quote"
                          >
                            <Plus size={16} />
                          </button>
                        )}
                        {activeTab === "outbound" && quote.status !== "sent" && (
                          <button
                            onClick={() => handleSendEmail(quote)}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                            title="Send to Vendor"
                          >
                            <Mail size={16} />
                          </button>
                        )}
                        {activeTab === "outbound" && quote.status === "sent" && (
                          <button
                            onClick={() => handleViewCommunications(quote)}
                            className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-lg transition-colors relative"
                            title="View Communications"
                          >
                            <MessageSquare size={16} />
                          </button>
                        )}
                        {activeTab === "inbound" && (
                          <button
                            onClick={() => handleUpdateStatus(quote)}
                            className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors"
                            title="Update Status"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}

                        <button
                          onClick={() => handleViewQuotation(quote)}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteQuotation(quote.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quotation Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-blue-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Total Quotations
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-white text-xs mt-1">
            {stats.total || 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-yellow-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Pending Quotes
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-white text-xs mt-1">
            {stats.pending_count || 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-green-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Approved Quotes
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-white text-xs mt-1">
            {stats.approved_count || 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-purple-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Total Value
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-white text-xs mt-1">
            {formatCurrency(stats.total_value)}
          </p>
        </div>
      </div>

      {/* Add Quotation Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col"
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
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-xs">
                    {analysisMode
                      ? "Material Analysis"
                      : formData.type === "inbound"
                      ? "Record Vendor Quote"
                      : "Create Quote Request (RFQ)"}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 text-xs">
                    {analysisMode
                      ? "Review project stock availability"
                      : formData.type === "inbound"
                      ? "Record details from vendor response"
                      : "Create a new vendor quotation request"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAnalysisMode(false);
                  setProjectMaterials([]);
                }}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {analysisMode ? (
              // Analysis View
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto px-8 py-6">
                  {loadingMaterials ? (
                    <div className="flex justify-center py-8">
                      <Loader2
                        className="animate-spin text-blue-600"
                        size={32}
                      />
                    </div>
                  ) : projectMaterials.length === 0 ? (
                    <p className="text-center py-8 text-slate-500">
                      No materials found for this project.
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
                          {projectMaterials.map((material, idx) => {
                            const required =
                              parseFloat(material.requiredQuantity) || 0;
                            const stock =
                              parseFloat(material.currentStock) || 0;
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
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-8 py-4 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setAnalysisMode(false);
                      setFormData((prev) => ({ ...prev, sales_order_id: "" }));
                    }}
                    className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveRequirements}
                    disabled={savingRequirements}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:bg-blue-400"
                  >
                    {savingRequirements ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    Update Quote Items
                  </button>
                </div>
              </div>
            ) : (
              // Standard Form View
              <>
                <form
                  onSubmit={handleAddQuotation}
                  className="overflow-y-auto flex-1 px-8 py-6 space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {formData.type === "outbound"
                        ? "Select Project (Optional)"
                        : "Select Project"}
                    </label>
                    <div className="relative">
                      <Briefcase
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <select
                        name="sales_order_id"
                        value={formData.sales_order_id}
                        onChange={handleProjectChange}
                        className="w-full px-4 py-3 pl-11 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      >
                        <option value="">
                          {formData.type === "outbound"
                            ? "Select Project to Load Requirements"
                            : "Select Project to Filter Quotes"}
                        </option>
                        {projects.map((p) => (
                          <option key={p.salesOrderId} value={p.salesOrderId}>
                            {p.projectName} ({p.poNumber})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {formData.type === "inbound" && formData.sales_order_id && (
                    <div>
                      {projectQuotations.length > 0 ? (
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
                            {projectQuotations.map((q) => (
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
                            ℹ️ No RFQs found for this project. Create an RFQ
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
                        disabled={formData.reference_id}
                        className={`w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                          formData.reference_id
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
                  </div>

                  {formData.sales_order_id && (
                    <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                      <span className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                        <Check size={16} />
                        Materials loaded from project analysis
                      </span>
                      <button
                        type="button"
                        onClick={() => setAnalysisMode(true)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 underline"
                      >
                        Re-Analyze
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {formData.type === "inbound" && (
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
                    )}
                    <div
                      className={
                        formData.type === "outbound" ? "col-span-2" : ""
                      }
                    >
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

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Line Items
                      </label>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium whitespace-nowrap"
                      >
                        <Plus size={14} />
                        Add Item
                      </button>
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
                              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-700">
                                Description
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-700 w-24">
                                Qty
                              </th>
                              {formData.type === "inbound" && (
                                <>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-700 w-32">
                                    Price
                                  </th>
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-700 w-32">
                                    Total
                                  </th>
                                </>
                              )}
                              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-700 w-16"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                            {formData.items.map((item, index) => (
                              <tr
                                key={index}
                                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                              >
                                <td className="px-4 py-2">
                                  <div>
                                    <input
                                      type="text"
                                      placeholder="Item name"
                                      value={item.description}
                                      onChange={(e) =>
                                        handleItemChange(
                                          index,
                                          "description",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    />
                                    {item.category && (
                                      <div className="mt-1">
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                          {item.category}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="number"
                                    placeholder="1"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      handleItemChange(
                                        index,
                                        "quantity",
                                        e.target.value
                                      )
                                    }
                                    min="1"
                                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                  />
                                </td>
                                {formData.type === "inbound" && (
                                  <>
                                    <td className="px-4 py-2">
                                      <input
                                        type="number"
                                        placeholder="0"
                                        value={item.unit_price}
                                        onChange={(e) =>
                                          handleItemChange(
                                            index,
                                            "unit_price",
                                            e.target.value
                                          )
                                        }
                                        step="0.01"
                                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                      />
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                      <span className="font-semibold text-slate-900 dark:text-white">
                                        ₹
                                        {(
                                          item.quantity * item.unit_price
                                        ).toLocaleString("en-IN", {
                                          minimumFractionDigits: 2,
                                        })}
                                      </span>
                                    </td>
                                  </>
                                )}
                                <td className="px-4 py-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                                    title="Remove item"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {formData.type === "inbound" && (
                    <div className="bg-blue-50 dark:bg-slate-700/50 rounded-lg p-4 border border-blue-200 dark:border-slate-600">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Quotation Total
                        </span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          ₹
                          {formData.total_amount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Notes{" "}
                      <span className="text-slate-500 dark:text-slate-400">
                        (Optional)
                      </span>
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleFormChange}
                      placeholder="Add any notes"
                      rows="3"
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    />
                  </div>
                </form>

                <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-8 py-4 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleAddQuotation}
                    disabled={submitting}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                  >
                    {submitting ? "Creating..." : "Create Quotation"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* View Quotation Modal */}
      {showViewModal && selectedQuotation && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowViewModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-slate-700 dark:to-slate-800 flex justify-between items-center px-8 py-6 border-b border-slate-200 dark:border-slate-600">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-xs">
                  {selectedQuotation.quotation_number}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 text-xs">
                  {selectedQuotation.vendor_name}
                </p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <div className="px-8 py-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {selectedQuotation.type !== "outbound" && (
                  <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Total Amount
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white text-xs mt-1">
                      ₹{selectedQuotation.total_amount?.toLocaleString()}
                    </p>
                  </div>
                )}
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Valid Until
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white text-xs mt-1">
                    {formatDate(selectedQuotation.valid_until)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Status
                </p>
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                    selectedQuotation.status
                  )}`}
                >
                  {selectedQuotation.status.charAt(0).toUpperCase() +
                    selectedQuotation.status.slice(1)}
                </span>
              </div>

              {selectedQuotation.items &&
                Array.isArray(selectedQuotation.items) &&
                selectedQuotation.items.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      Line Items
                    </p>
                    <div className="space-y-2">
                      {selectedQuotation.items.map((item, index) => (
                        <div
                          key={index}
                          className="border border-slate-300 dark:border-slate-600 rounded-lg p-3 bg-slate-50 dark:bg-slate-700/50"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-medium text-slate-900 dark:text-white text-xs block">
                                {item.description || "Item " + (index + 1)}
                              </span>
                              {(item.category || item.materialType) && (
                                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                                  {item.category || item.materialType}
                                </span>
                              )}
                            </div>
                            <span className="text-slate-600 dark:text-slate-400 text-xs">
                              Qty: {item.quantity}
                            </span>
                          </div>
                          {selectedQuotation.type !== "outbound" && (
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                Unit Price: ₹
                                {(item.unit_price || 0).toLocaleString(
                                  "en-IN",
                                  { minimumFractionDigits: 2 }
                                )}
                              </span>
                              <span className="font-semibold text-slate-900 dark:text-white">
                                ₹
                                {(
                                  (item.quantity || 0) * (item.unit_price || 0)
                                ).toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {selectedQuotation.notes && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Notes
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    {selectedQuotation.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-8 py-4 flex justify-end gap-3">
              {selectedQuotation.type !== "outbound" && (
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    navigate("/inventory-manager/vendors/po", {
                      state: { quotation: selectedQuotation },
                    });
                  }}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  Create PO
                </button>
              )}
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowEmailModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-slate-700 dark:to-slate-800 flex justify-between items-center px-8 py-6 border-b border-slate-200 dark:border-slate-600">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-sm">
                  Send Quotation
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 text-xs">
                  Email quotation {emailData.quotationNumber} to vendor
                </p>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={24} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <form onSubmit={submitEmail} className="px-8 py-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Vendor Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={emailData.email}
                  onChange={(e) =>
                    setEmailData({ ...emailData, email: e.target.value })
                  }
                  placeholder="vendor@example.com"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) =>
                    setEmailData({ ...emailData, subject: e.target.value })
                  }
                  placeholder="Email subject"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={emailData.message}
                  onChange={(e) =>
                    setEmailData({ ...emailData, message: e.target.value })
                  }
                  placeholder="Email message"
                  rows="5"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium"
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

      {showCommunicationsModal && selectedQuotationForComms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Communications
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  RFQ: {selectedQuotationForComms?.quotation_number}
                </p>
              </div>
              <button
                onClick={handleCloseCommunications}
                className="text-slate-400 hover:text-slate-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingCommunications ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
              ) : communications.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <MessageSquare
                    size={48}
                    className="mx-auto mb-4 opacity-20"
                  />
                  <p>No communications found for this quotation.</p>
                  <p className="text-sm mt-2">
                    Replies to emails with subject "{selectedQuotationForComms?.quotation_number}"
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
                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded">
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
    </div>
  );
};

export default QuotationsPage;
