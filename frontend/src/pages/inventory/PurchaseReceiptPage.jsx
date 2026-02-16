import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "../../utils/api";
import Swal from "sweetalert2";
import toastUtils from "../../utils/toastUtils";
import {
  Package,
  Search,
  Filter,
  Download,
  CheckCircle,
  X,
  Plus,
  Eye,
  AlertTriangle,
  Clock,
  Truck,
  Check,
  Save,
  FileText,
  Printer,
  ShieldCheck,
  LayoutGrid,
  List,
  RefreshCw,
  Calendar,
  Warehouse,
  User,
} from "lucide-react";
import taskService from "../../utils/taskService";
import CreateGRNRequestModal from "./CreateGRNRequestModal";

const PurchaseReceiptPage = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [grnData, setGrnData] = useState([]);
  const [showNewGRNModal, setShowNewGRNModal] = useState(false);
  const [approvedPOs, setApprovedPOs] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [poItems, setPoItems] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState("grn_request"); // grn_request, available_stocks
  const [viewMode, setViewMode] = useState("list"); // kanban, list
  const [availableStocks, setAvailableStocks] = useState([]);
  const [loadingStocks, setLoadingStocks] = useState(false);

  const fetchStocks = useCallback(async () => {
    setLoadingStocks(true);
    try {
      const response = await axios.get("/inventory/materials");
      setAvailableStocks(response.data.materials || []);
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } finally {
      setLoadingStocks(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "available_stocks") {
      fetchStocks();
    }
  }, [activeTab, fetchStocks]);

  const capitalize = (str) => {
    if (!str) return "Pending";
    const stringVal = String(str);
    if (!stringVal || stringVal === "undefined" || stringVal === "null") return "Pending";
    return stringVal.charAt(0).toUpperCase() + stringVal.slice(1);
  };

  const fetchGRNs = useCallback(async () => {
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
          expectedQty: totalQty,
          receivedQty: totalReceived,
          unit: firstItem.unit || "units",
          expectedDate: grn.created_at,
          receivedDate: grn.created_at
            ? new Date(grn.created_at).toISOString().split("T")[0]
            : null,
          inspectionStatus: grn.inspection_status || "pending",
          rawStatus: grn.qc_status,
          status: grn.qc_status,
          items: grn.items || [],
        };
      });
      setGrnData(formattedData);
    } catch (error) {
      console.error("Error fetching GRNs:", error);
    }
  }, []);

  const handleNewGRNClickFromState = async (poNumber) => {
    try {
      const response = await axios.get(
        "/inventory/purchase-orders?status=approved"
      );
      const pos = response.data.purchaseOrders || response.data || [];
      setApprovedPOs(pos);
      
      const targetPO = pos.find(p => p.po_number === poNumber);
      if (targetPO) {
        setSelectedPO(targetPO);
        const itemsResponse = await axios.get(`/inventory/purchase-orders/${targetPO.id}`);
        const items = itemsResponse.data.items || [];
        setPoItems(items.map(item => ({ ...item, received_quantity: item.quantity })));
        setShowNewGRNModal(true);
      }
    } catch (error) {
      console.error("Error setting PO from state:", error);
    }
  };

  useEffect(() => {
    const extractedTaskId = taskService.getTaskIdFromParams();
    if (extractedTaskId) {
      setTaskId(extractedTaskId);
    }
    fetchGRNs();

    if (location.state?.po_number) {
      handleNewGRNClickFromState(location.state.po_number);
    }
  }, [location.state, fetchGRNs]);

  const handleNewGRNClick = async () => {
    try {
      const response = await axios.get(
        "/inventory/purchase-orders?status=approved"
      );
      const pos = response.data.purchaseOrders || response.data || [];
      setApprovedPOs(pos);
      setSelectedPO(null);
      setShowNewGRNModal(true);
    } catch (error) {
      console.error("Error fetching approved POs:", error);
    }
  };

  const handleViewGRN = async (grn) => {
    try {
      const response = await axios.get(`/inventory/grns/${grn.id}`);
      const data = response.data;
      
      const mappedGRN = {
        ...data,
        grnNo: grn.grnNo,
        poNo: grn.poNo,
        vendor: grn.vendor,
        expectedDate: data.created_at,
        inspectionStatus: data.inspection_status || "pending",
        status: data.qc_status,
        receivedDate: data.receipt_date || data.created_at
      };
      
      setSelectedGRN(mappedGRN);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error fetching GRN details:", error);
      toastUtils.error("Failed to load GRN details");
    }
  };

  const handleProcessToQC = async (grn) => {
    try {
      const result = await Swal.fire({
        title: "Submit for QC?",
        text: "This will move the receipt to GRN Processing for quality inspection.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Submit",
      });

      if (result.isConfirmed) {
        await axios.patch(`/inventory/grns/${grn.id}/status`, {
          status: "qc_pending",
        });
        toastUtils.success("Receipt sent for QC inspection.");
        fetchGRNs();
      }
    } catch (error) {
      console.error("Error submitting for QC:", error);
      toastUtils.error("Failed to submit for QC");
    }
  };

  const filteredData = grnData.filter((grn) => {
    const matchesSearch =
      grn.grnNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (grn.vendor || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (grn.poNo || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || grn.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { 
      label: "Total Receipts", 
      value: grnData.length, 
      icon: Package,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-100 dark:border-blue-800",
      description: "Total processing requests"
    },
    {
      label: "Pending QC",
      value: grnData.filter((g) => g.inspectionStatus === "pending").length,
      icon: Clock,
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-100 dark:border-amber-800",
      description: "Awaiting initial check"
    },
    {
      label: "QC Review",
      value: grnData.filter((g) => g.inspectionStatus === "qc_review").length,
      icon: ShieldCheck,
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-100 dark:border-purple-800",
      description: "Quality check in progress"
    },
    {
      label: "Awaiting Storage",
      value: grnData.filter((g) => g.status === "pending" && g.inspectionStatus === "passed").length,
      icon: Package,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-100 dark:border-blue-800",
      description: "Pending warehouse entry"
    },
    {
      label: "Completed",
      value: grnData.filter((g) => g.status === "completed").length,
      icon: CheckCircle,
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-100 dark:border-emerald-800",
      description: "Successfully stored"
    },
    {
      label: "Rejected",
      value: grnData.filter((g) => g.inspectionStatus === "rejected" || g.inspectionStatus === "failed").length,
      icon: X,
      bgColor: "bg-red-50 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400",
      borderColor: "border-red-100 dark:border-red-800",
      description: "Failed quality criteria"
    },
  ];

  const StatCard = ({ stat, isActive }) => {
    const Icon = stat.icon;
    return (
      <div className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-300 ${isActive ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'} ${stat.bgColor} ${stat.borderColor}`}>
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm ${stat.iconColor}`}>
            <Icon size={20} />
          </div>
          {isActive && (
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">{stat.label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{stat.value}</span>
          </div>
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-500 mt-2 uppercase tracking-wider">{stat.description}</p>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <Icon size={80} />
        </div>
      </div>
    );
  };

  const handlePrintGRN = (grn) => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none">
            <Truck size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Buying</span>
              <span className="text-slate-300 dark:text-slate-600">›</span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Procurement</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Purchase Receipts
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Receive material shipments against approved purchase orders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-xl shadow-sm">
            <button 
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "kanban" ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700"}`}
            >
              <LayoutGrid size={14} /> KANBAN
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "list" ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700"}`}
            >
              <List size={14} /> LIST
            </button>
          </div>
          
          <button 
            onClick={fetchGRNs}
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-blue-600 transition-all hover:shadow-md"
          >
            <RefreshCw size={18} />
          </button>
          
          <button
            onClick={handleNewGRNClick}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:-translate-y-0.5 font-bold text-xs uppercase tracking-wider"
          >
            <Plus size={18} />
            CREATE GRN
          </button>
        </div>
      </div>

      {/* Stats section */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, idx) => (
          <StatCard 
            key={idx} 
            stat={stat} 
            isActive={idx === 0} 
          />
        ))}
      </div>

      {/* Tabs and Content Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-1">
            <button 
              onClick={() => setActiveTab("grn_request")}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${activeTab === "grn_request" ? "border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/20" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              <FileText size={16} /> GRN Request
            </button>
            <button 
              onClick={() => setActiveTab("available_stocks")}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${activeTab === "available_stocks" ? "border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/20" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              <Package size={16} /> Available Stocks
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative group">
              <Search
                size={18}
                className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              />
              <input
                type="text"
                placeholder={activeTab === "grn_request" ? "Search by GRN #, PO #, or Supplier..." : "Search by Material Name or Code..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-3">
              {activeTab === "grn_request" && (
                <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-700 dark:text-white focus:outline-none uppercase tracking-wide cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}
              
              <button className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors">
                <Filter size={18} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === "grn_request" ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50">
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                      GRN Number
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                      Supplier
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-center">
                      Receipt Date
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-center">
                      Status
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredData.map((grn) => (
                    <tr
                      key={grn.id}
                      className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
                            {grn.grnNo}
                          </h4>
                          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                            PO: {grn.poNo}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                            <Warehouse size={14} />
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {grn.vendor}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                          <Calendar size={12} className="text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                            {grn.receivedDate ? new Date(grn.receivedDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            grn.status === "completed" ? "bg-green-100 text-green-700" :
                            grn.status === "pending" ? "bg-slate-100 text-slate-700" :
                            grn.status === "qc_pending" ? "bg-purple-100 text-purple-700" :
                            grn.status === "approved" ? "bg-blue-100 text-blue-700" :
                            grn.status === "rejected" ? "bg-red-100 text-red-700" :
                            grn.status === "shortage" ? "bg-amber-100 text-amber-700" :
                            grn.status === "overage" ? "bg-cyan-100 text-cyan-700" :
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {grn.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewGRN(grn)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-100 transition-colors"
                          >
                            <Eye size={14} /> View Details
                          </button>
                          <button 
                            onClick={() => handlePrintGRN(grn)}
                            className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            <Printer size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50">
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                      Material Name
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-center">
                      In Stock
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-center">
                      Unit
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-center">
                      Warehouse
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {availableStocks
                    .filter(m => 
                      m.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      m.itemCode.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((stock) => (
                    <tr
                      key={stock.id}
                      className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
                            {stock.itemName}
                          </h4>
                          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                            {stock.itemCode}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-xs font-black ${stock.quantity <= (stock.reorderLevel || 0) ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                          {Number(stock.quantity).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {stock.unit}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                          <Warehouse size={12} className="text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                            {stock.warehouse || 'Main Warehouse'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <CreateGRNRequestModal 
        isOpen={showNewGRNModal}
        onClose={() => setShowNewGRNModal(false)}
        po={selectedPO}
        onGRNCreated={fetchGRNs}
      />

      {showViewModal && selectedGRN && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                GRN Details - {selectedGRN.grnNo}
              </h2>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedGRN.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    {selectedGRN.status === 'completed' ? <CheckCircle size={24} /> : <Clock size={24} />}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedGRN.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {selectedGRN.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Receipt Date</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedGRN.receivedDate ? new Date(selectedGRN.receivedDate).toLocaleDateString() : new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Truck size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">PO Reference</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <LayoutGrid size={14} className="text-blue-500" />
                    {selectedGRN.poNo}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <User size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Supplier</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Warehouse size={14} className="text-blue-500" />
                    {selectedGRN.vendor}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Package size={18} className="text-blue-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Received Items</h3>
                </div>
                <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Received Qty</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {(selectedGRN.items || []).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                {item.material_name || item.description || "N/A"}
                              </h4>
                              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                                {item.material_code || item.item_code || "N/A"}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {Number(item.received_quantity !== undefined ? item.received_quantity : item.quantity).toFixed(4)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              {item.unit || 'Units'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center justify-between gap-4">
              <button 
                onClick={() => handlePrintGRN(selectedGRN)}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-md transition-all active:scale-95"
              >
                <Printer size={16} /> Print GRN
              </button>
              <button 
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseReceiptPage;
