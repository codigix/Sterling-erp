import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
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
  PlusCircle,
  ChevronDown,
} from "lucide-react";
import axios from "../../utils/api";
import useRootCardInventoryTask from "../../hooks/useRootCardInventoryTask";
import CreateQuotationModal from "../../components/inventory/CreateQuotationModal";

const QuotationsPage = ({ defaultTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { completeCurrentTask, isFromDepartmentTasks } = useRootCardInventoryTask();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState(defaultTab || location.state?.activeTab || "outbound");

  // Sync tab state when defaultTab prop changes (navigation between routes)
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  useEffect(() => {
    if (location.state?.openModal && location.state?.preFilledMaterials) {
      setShowAddModal(true);
    } else {
      const mrId = searchParams.get("materialRequestId") || searchParams.get("mrId");
      const action = searchParams.get("action");
      
      if (mrId && activeTab === "outbound" && action !== "record") {
        if (action === "send") {
          // Find existing quotation for this MR and open send modal
          axios.get(`/inventory/quotations?material_request_id=${mrId}&type=outbound`).then(response => {
            const existingQuotes = response.data;
            if (existingQuotes && existingQuotes.length > 0) {
              const quote = existingQuotes[0]; // Take the latest or first
              handleSendEmail(quote);
            } else {
              // No quote found, fallback to add mode
              fetchMRAndOpenAddModal(mrId, "outbound");
            }
          }).catch(err => console.error("Error finding quote for send action:", err));
        } else if (action === "create") {
          fetchMRAndOpenAddModal(mrId, "outbound");
        }
      } else if (mrId && activeTab === "inbound" && action === "record") {
        // Find existing quotation for this MR and open record response modal
        // We filter for outbound (RFQs) that are either 'pending' or 'sent'
        axios.get(`/inventory/quotations?material_request_id=${mrId}&type=outbound`).then(response => {
          const existingQuotes = response.data;
          if (existingQuotes && existingQuotes.length > 0) {
            // Try to find the first one that is 'sent', otherwise take the latest
            const quote = existingQuotes.find(q => q.status === "sent") || existingQuotes[0];
            handleRecordResponse(quote);
          } else {
            // No quote found, fallback to record mode directly from MR
            fetchMRAndOpenAddModal(mrId, "inbound");
          }
        }).catch(err => console.error("Error finding quote for record action:", err));
      }
    }
  }, [location.state, searchParams, activeTab]);

  const fetchMRAndOpenAddModal = (mrId, type = "outbound") => {
    axios.get(`/inventory/material-requests/${mrId}`).then(response => {
      const mr = response.data.materialRequest;
      if (mr && mr.items) {
        const items = Array.isArray(mr.items) ? mr.items : JSON.parse(mr.items || "[]");
        
        const preFilled = items.map(item => ({
          item_code: item.item_code || item.material_code || "",
          description: item.item_name || item.material_name || item.description || "",
          quantity: item.quantity || 0,
          unit: item.unit || "",
          unit_price: 0,
        }));

        setInitialData({
          material_request_id: mr.id,
          root_card_id: mr.sales_order_id || mr.root_card_id || "",
          items: preFilled,
          type: type
        });
        setShowAddModal(true);
      }
    }).catch(err => console.error("Error fetching MR for Quotation:", err));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const searchString = location.search;
    if (tab === "outbound") {
      navigate(`/inventory-manager/quotations/sent${searchString}`);
    } else {
      navigate(`/inventory-manager/quotations/received${searchString}`);
    }
  };
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [rootCards, setRootCards] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [initialData, setInitialData] = useState(null);
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

  const fetchQuotations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);
      
      const mrId = searchParams.get("materialRequestId") || searchParams.get("mrId");
      if (mrId) params.append("material_request_id", mrId);
      
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
  }, [searchQuery, statusFilter, activeTab, searchParams]);

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

  const fetchRootCards = useCallback(async () => {
    try {
      const response = await axios.get("/root-cards/requirements");
      setRootCards(response.data.data || []);
    } catch (err) {
      console.error("Error fetching rootCards:", err);
    }
  }, []);

  const fetchMaterialRequests = useCallback(async () => {
    try {
      const response = await axios.get("/inventory/material-requests");
      setMaterialRequests(response.data.materialRequests || response.data || []);
    } catch (err) {
      console.error("Error fetching material requests:", err);
    }
  }, []);

  useEffect(() => {
    fetchQuotations();
    fetchStats();
    fetchVendors();
    fetchRootCards();
    fetchMaterialRequests();
  }, [fetchQuotations, fetchStats, fetchVendors, fetchRootCards, fetchMaterialRequests]);

  // Auto-refresh notifications and stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // We only refresh quotations and stats to check for new replies/updates
      // without showing the full loader to avoid flickering
      const silentFetch = async () => {
        try {
          const params = new URLSearchParams();
          if (searchQuery) params.append("search", searchQuery);
          if (statusFilter !== "all") params.append("status", statusFilter);
          
          const mrId = searchParams.get("materialRequestId") || searchParams.get("mrId");
          if (mrId) params.append("material_request_id", mrId);
          
          params.append("type", activeTab);

          const [qRes, sRes] = await Promise.all([
            axios.get(`/inventory/quotations?${params}`),
            axios.get("/inventory/quotations/stats")
          ]);
          setQuotations(qRes.data);
          setStats(sRes.data);
        } catch (err) {
          console.error("Silent refresh failed:", err);
        }
      };
      silentFetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [searchQuery, statusFilter, activeTab, searchParams]);

  // Auto-refresh communications when modal is open
  useEffect(() => {
    let interval;
    if (showCommunicationsModal && selectedQuotationForComms) {
      interval = setInterval(async () => {
        try {
          const response = await axios.get(
            `/inventory/quotations/${selectedQuotationForComms.id}/communications`
          );
          setCommunications(response.data || []);
        } catch (error) {
          console.error("Error refreshing communications:", error);
        }
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showCommunicationsModal, selectedQuotationForComms]);

  const handleQuotationCreated = () => {
    fetchQuotations();
    fetchStats();
    
    // Complete task based on active tab
    if (activeTab === "outbound") {
      completeCurrentTask("RFQ quotation created");
    } else if (activeTab === "inbound") {
      completeCurrentTask("Vendor quotation received and recorded");
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

    if (quotation.mr_number) {
      doc.text(`Material Request: ${quotation.mr_number}`, 14, 60);
    }

    if (quotation.valid_until) {
      doc.text(
        `Valid Until: ${new Date(quotation.valid_until).toLocaleDateString()}`,
        14,
        quotation.mr_number ? 65 : 60
      );
    }

    const tableColumn = ["Item Code", "Description", "Category", "Quantity", "Unit"];
    if (quotation.type === "inbound") {
      tableColumn.push("Unit Price", "Total");
    }

    const tableRows = (quotation.items || []).map((item) => {
      const row = [
        item.item_code || item.material_code || "N/A",
        item.description,
        item.category || item.materialType || "",
        item.quantity,
        item.unit || "N/A",
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
      startY: quotation.valid_until || quotation.mr_number ? 75 : 70,
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

  const handleInlineStatusUpdate = async (quoteId, newStatus) => {
    try {
      setUpdatingStatusId(quoteId);
      await axios.patch(`/inventory/quotations/${quoteId}/status`, {
        status: newStatus,
      });
      
      // Update local state immediately for better UX
      setQuotations(prev => prev.map(q => q.id === quoteId ? { ...q, status: newStatus } : q));
      
      // Refresh stats in background
      fetchStats();
      
      if (newStatus === "approved") {
        Swal.fire({
          icon: "success",
          title: "Quotation Approved",
          text: "The quotation has been approved successfully.",
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      Swal.fire("Error", "Failed to update status", "error");
      fetchQuotations(); // Revert on error
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleCreatePOFromQuote = async (quote) => {
    try {
      const result = await Swal.fire({
        title: "Create Purchase Order?",
        text: `This will create a draft PO for ${quote.vendor_name} based on quote ${quote.quotation_number}.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#2563eb",
        confirmButtonText: "Yes, Create PO",
      });

      if (!result.isConfirmed) return;

      // Parse items if they are a string
      let items = quote.items || [];
      if (typeof items === "string") {
        try {
          items = JSON.parse(items);
        } catch (e) {
          console.error("Error parsing quote items:", e);
          items = [];
        }
      }

      const payload = {
        quotation_id: quote.id,
        material_request_id: quote.material_request_id || null,
        vendor_id: quote.vendor_id,
        items: items.map((item) => ({
          material_name: item.description || item.material_name || "Unknown",
          material_code: item.item_code || item.material_code || "",
          quantity: item.quantity || 0,
          unit: item.unit || "Nos",
          rate: item.unit_price || 0,
          amount: (item.quantity || 0) * (item.unit_price || 0),
        })),
        subtotal: quote.total_amount || 0,
        total_amount: quote.total_amount || 0,
        notes: `Created from Quotation: ${quote.quotation_number}`,
      };

      const response = await axios.post("/inventory/purchase-orders", payload);

      // If we are coming from workflow tasks, complete the "Create Purchase Order" task
      if (isFromDepartmentTasks()) {
        try {
          await completeCurrentTask("Purchase Order created from approved quotation");
        } catch (taskError) {
          console.error("Error completing workflow task:", taskError);
          // Don't fail the whole process if task completion fails
        }
      }

      Swal.fire({
        icon: "success",
        title: "PO Created",
        text: `Purchase Order ${response.data.po_number} has been created successfully.`,
        confirmButtonColor: "#2563eb",
      }).then(() => {
        navigate(`/inventory-manager/purchase-orders/${response.data.id}${location.search}`);
      });
    } catch (error) {
      console.error("Error creating PO from quote:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to create Purchase Order",
        "error"
      );
    }
  };

  const handleRecordResponse = (quote) => {
    setInitialData({
      vendor_id: quote.vendor_id,
      root_card_id: quote.root_card_id || "",
      material_request_id: quote.material_request_id || null,
      total_amount: 0,
      valid_until: "",
      items: (quote.items || []).map((item) => ({
        item_code: item.item_code || item.material_code || "",
        description: item.description,
        category: item.category || item.materialType || "",
        quantity: item.quantity,
        unit: item.unit || "",
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
      case "sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "responded":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
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
              setInitialData({
                vendor_id: "",
                root_card_id: "",
                total_amount: 0,
                valid_until: "",
                items: [],
                notes: "",
                type: activeTab,
                reference_id: null,
              });
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
          onClick={() => handleTabChange("outbound")}
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
          onClick={() => handleTabChange("inbound")}
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
                      <p className="font-bold text-slate-900 dark:text-white">
                        {quote.quotation_number}
                      </p>
                      {quote.reference_id && (
                        <p className="text-xs text-slate-500">
                          Ref: {quote.reference_number}
                        </p>
                      )}
                      {quote.mr_number && (
                        <p className="text-xs text-blue-600 font-bold uppercase mt-0.5">
                          MR: {quote.mr_number}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                      {quote.vendor_name}
                    </td>
                    {activeTab === "inbound" && (
                      <td className="px-6 py-4 text-right">
                        <p className="font-bold text-slate-900 dark:text-white flex items-center justify-end gap-1">
                          <DollarSign size={14} />
                          {quote.total_amount
                            ? quote.total_amount.toLocaleString()
                            : "0"}
                        </p>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
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
                      {activeTab === "inbound" ? (
                        <div className="relative inline-block">
                          <select
                            value={quote.status}
                            disabled={updatingStatusId === quote.id}
                            onChange={(e) => handleInlineStatusUpdate(quote.id, e.target.value)}
                            className={`appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer border-none ${getStatusColor(
                              quote.status
                            )}`}
                          >
                            <option value="pending" className="bg-white text-slate-900">Pending</option>
                            <option value="approved" className="bg-white text-slate-900">Approved</option>
                            <option value="rejected" className="bg-white text-slate-900">Rejected</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                            {updatingStatusId === quote.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                          </div>
                        </div>
                      ) : (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            quote.status
                          )}`}
                        >
                          {quote.status.charAt(0).toUpperCase() +
                            quote.status.slice(1)}
                        </span>
                      )}
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
                            className={`p-2 rounded-lg transition-colors relative ${
                              quote.unread_communication_count > 0 
                                ? "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 animate-pulse" 
                                : "hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-600 dark:text-purple-400"
                            }`}
                            title="View Communications"
                          >
                            <MessageSquare size={16} />
                            {quote.unread_communication_count > 0 && (
                              <>
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 animate-ping rounded-full bg-red-400 opacity-75"></span>
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white dark:border-slate-800 shadow-sm">
                                  {quote.unread_communication_count}
                                </span>
                              </>
                            )}
                          </button>
                        )}
                        {activeTab === "inbound" && quote.status === "pending" && (
                          <button
                            onClick={() => handleInlineStatusUpdate(quote.id, "approved")}
                            className="p-2 hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                            title="Quick Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {activeTab === "inbound" && (
                          <>
                            {quote.status === "approved" && (
                              <button
                                onClick={() => handleCreatePOFromQuote(quote)}
                                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                                title="Create Purchase Order"
                              >
                                <PlusCircle size={16} />
                              </button>
                            )}
                          </>
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
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {stats.total || 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-yellow-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Pending Quotes
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {stats.pending_count || 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-green-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Approved Quotes
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {stats.approved_count || 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-purple-200 dark:border-slate-600">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Total Value
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {formatCurrency(stats.total_value)}
          </p>
        </div>
      </div>

      {/* Add Quotation Modal */}
      <CreateQuotationModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setInitialData(null);
          // Clear action param but keep others (like taskId)
          const params = new URLSearchParams(window.location.search);
          params.delete('action');
          const newSearch = params.toString();
          window.history.replaceState(null, '', window.location.pathname + (newSearch ? '?' + newSearch : ''));
        }}
        onQuotationCreated={handleQuotationCreated}
        preFilledMaterials={location.state?.preFilledMaterials}
        vendors={vendors}
        rootCards={rootCards}
        materialRequests={materialRequests}
        initialData={initialData || {
          type: activeTab,
          reference_id: location.state?.reference_id,
          material_request_id: location.state?.material_request_id
        }}
      />

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
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedQuotation.quotation_number}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {selectedQuotation.vendor_name}
                  {selectedQuotation.mr_number && (
                    <span className="ml-2 text-blue-600 font-bold">
                      | MR: {selectedQuotation.mr_number}
                    </span>
                  )}
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
                    navigate(`/inventory-manager/purchase-orders${location.search}`, {
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
                  <p className="text-[10px] mt-4 opacity-75 italic">
                    Note: The system checks for new vendor replies every 30 seconds.
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
                The system automatically checks for replies every 30 seconds.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationsPage;
