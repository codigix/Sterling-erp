import React, { useState, useEffect, useCallback } from "react";
import axios from "../../utils/api";
import Swal from "sweetalert2";
import { showSuccess, showError } from "../../utils/toastUtils";
import {
  Package,
  Search,
  Filter,
  CheckCircle,
  X,
  Eye,
  Clock,
  ShieldCheck,
  RefreshCw,
  Calendar,
  Warehouse,
  ClipboardCheck,
  FileText,
  Save,
  List,
  Printer,
} from "lucide-react";
import taskService from "../../utils/taskService";

const GRNProcessingPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [grnData, setGrnData] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [taskId, setTaskId] = useState(null);

  // QC Inspection Modal State
  const [showQCModal, setShowQCModal] = useState(false);
  const [qcForm, setQCForm] = useState({
    items: [],
    status: "pending",
    remarks: "",
  });

  const fetchGRNs = useCallback(async () => {
    try {
      const response = await axios.get("/inventory/grns");
      const formattedData = response.data.map((grn) => ({
        id: grn.id,
        grnNo: `GRN-${String(grn.id).padStart(3, "0")}-${new Date(grn.created_at).getFullYear()}`,
        poNo: grn.po_number,
        vendor: grn.vendor_name,
        inspectionStatus: grn.inspection_status || "pending",
        status: grn.qc_status,
        receivedDate: grn.created_at ? new Date(grn.created_at).toISOString().split("T")[0] : null,
        items: grn.items || [],
      }));
      setGrnData(formattedData);
    } catch (error) {
      console.error("Error fetching GRNs:", error);
    }
  }, []);

  useEffect(() => {
    const extractedTaskId = taskService.getTaskIdFromParams();
    if (extractedTaskId) setTaskId(extractedTaskId);
    fetchGRNs();
  }, [fetchGRNs]);

  const handleInspectClick = async (grn) => {
    try {
      let existingInspection = null;
      try {
        const inspectionRes = await axios.get(`/qc/portal/inspections/grn/${grn.id}`);
        existingInspection = inspectionRes.data;
      } catch (e) {}

      const grnRes = await axios.get(`/inventory/grns/${grn.id}`);
      const targetGRN = grnRes.data;
      const items = targetGRN.items || [];

      let formItems = items.map((item) => ({
        ...item,
        material_name: item.material_name || item.description || item.item_name || "N/A",
        material_code: item.material_code || item.item_code || "N/A",
        invoice_quantity: item.invoice_quantity || item.quantity || 0,
        accepted: Number(item.received_quantity || item.quantity || 0),
        overage: 0,
        notes: "",
      }));

      let formStatus = "pending";
      let formRemarks = "";

      if (existingInspection) {
        formStatus = existingInspection.status;
        formRemarks = existingInspection.remarks || "";
        if (existingInspection.items_results) {
          formItems = formItems.map((item) => {
            const savedResult = existingInspection.items_results.find(r => r.description === (item.material_name || item.description));
            // Ensure the ordered quantity always comes from the actual GRN record, not stale inspection results
            return savedResult ? { ...item, ...savedResult, quantity: item.quantity } : item;
          });
        }
      }

      setSelectedGRN({ ...grn, ...targetGRN });
      setQCForm({ items: formItems, status: formStatus, remarks: formRemarks });
      setShowQCModal(true);
    } catch (error) {
      console.error("Error preparing inspection:", error);
      toastUtils.error("Failed to prepare inspection form");
    }
  };

  const handleQCQuantityChange = (index, field, value) => {
    const newItems = [...qcForm.items];
    const val = value === "" ? 0 : (field === "notes" ? value : Math.max(0, Number(value)));
    newItems[index] = { ...newItems[index], [field]: val };
    
    // Auto-calculate Overage & Shortage
    const inv = Number(newItems[index].invoice_quantity) || 0;
    const rec = Number(newItems[index].accepted) || 0;
    newItems[index].overage = Math.max(0, rec - inv);
    newItems[index].shortage = Math.max(0, inv - rec);
    
    // Automatically determine overall status
    let newStatus = "passed";
    const hasShortage = newItems.some(i => (Number(i.invoice_quantity) || 0) > (Number(i.accepted) || 0));
    const hasOverage = newItems.some(i => (Number(i.accepted) || 0) > (Number(i.invoice_quantity) || 0));
    
    if (hasShortage) newStatus = "shortage";
    else if (hasOverage) newStatus = "overage";
    
    setQCForm({ ...qcForm, items: newItems, status: newStatus });
  };

  const handleSubmitQC = async () => {
    try {
      const payload = {
        grnId: selectedGRN.id,
        itemsResults: qcForm.items.map(item => ({
          description: item.material_name,
          item_code: item.material_code,
          quantity: item.quantity,
          invoice_quantity: item.invoice_quantity,
          unit: item.unit,
          accepted: item.accepted,
          shortage: item.shortage,
          overage: item.overage,
          notes: item.notes,
          warehouse: item.warehouse,
        })),
        status: qcForm.status,
        remarks: qcForm.remarks,
        inspectorId: 1,
      };

      await axios.post("/qc/portal/inspections", payload);
      if (taskId) await taskService.autoCompleteTaskByAction(taskId, "qc-save");
      
      showSuccess("QC Inspection saved successfully");
      setShowQCModal(false);
      fetchGRNs();
    } catch (error) {
      console.error("Error saving QC inspection:", error);
      showError("Failed to save QC inspection");
    }
  };

  const handleViewDetails = async (grn) => {
    try {
      const response = await axios.get(`/qc/portal/grn-details/${grn.id}`);
      setSelectedGRN(response.data);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error fetching detailed GRN:", error);
      toastUtils.error("Failed to load details");
    }
  };

  const [processingStock, setProcessingStock] = useState(null);
  const [approvingGRN, setApprovingGRN] = useState(null);

  const handleApproveGRN = async (grn) => {
    try {
      const result = await Swal.fire({
        title: "Approve GRN?",
        text: `Do you want to approve ${grn.grnNo} for quality inspection?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Approve",
        cancelButtonText: "No, Cancel",
        confirmButtonColor: "#10b981",
      });

      if (result.isConfirmed) {
        setApprovingGRN(grn.id);
        await axios.post(`/inventory/grns/${grn.id}/approve`);
        showSuccess("GRN approved successfully and moved to inspection phase!");
        fetchGRNs();
      }
    } catch (error) {
      console.error("Error approving GRN:", error);
      showError(error.response?.data?.message || "Failed to approve GRN");
    } finally {
      setApprovingGRN(null);
    }
  };

  const handleAddToStock = async (grn) => {
    try {
      if (processingStock === grn.id) return;
      const isShortage = grn.status === 'shortage';
      const isOverage = grn.status === 'overage';
      const isDiscrepancy = grn.status === 'discrepancy';

      const result = await Swal.fire({
        title: "Add to Warehouse?",
        text: "This will update your physical warehouse stock levels and create a stock entry record.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, add to stock",
        cancelButtonText: "Cancel",
        reverseButtons: true
      });

      if (result.isConfirmed) {
        setProcessingStock(grn.id);

        // Use the grn.status which reflects the QC result (shortage, overage, etc.)
        await axios.post(`/inventory/grns/${grn.id}/add-to-stock`, { status: grn.status });
        if (taskId) await taskService.autoCompleteTaskByAction(taskId, "add");
        
        showSuccess(isShortage ? "Vendor notified and items added to warehouse stock." : "Material added to inventory successfully!");
        fetchGRNs();
      }
    } catch (error) {
      console.error("Error adding to stock:", error);
      showError(error.response?.data?.message || "Failed to process stock entry");
    } finally {
      setProcessingStock(null);
    }
  };

  const stats = [
    { 
      label: "Total GRNs", 
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
      value: grnData.filter((g) => g.status === "qc_pending").length,
      icon: ShieldCheck,
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-100 dark:border-purple-800",
      description: "Quality check in progress"
    },
    {
      label: "Awaiting Storage",
      value: grnData.filter((g) => ["approved", "shortage", "overage"].includes(g.status)).length,
      icon: Warehouse,
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-100 dark:border-emerald-800",
      description: "Passed & pending entry"
    },
  ];

  const StatCard = ({ stat }) => {
    const Icon = stat.icon;
    return (
      <div className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-300 hover:shadow-md ${stat.bgColor} ${stat.borderColor}`}>
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm ${stat.iconColor}`}>
            <Icon size={20} />
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">{stat.label}</p>
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

  const filteredData = grnData.filter((grn) => {
    const matchesSearch = grn.grnNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (grn.vendor || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (grn.poNo || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || grn.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600 flex items-center justify-center text-white shadow-lg shadow-cyan-200 dark:shadow-none">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Inventory</span>
              <span className="text-slate-300 dark:text-slate-600">›</span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Quality Assurance</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              GRN Processing
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Quality Inspection & Inventory Entry Management
            </p>
          </div>
        </div>
        <button onClick={fetchGRNs} className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-blue-600 transition-all hover:shadow-md">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <StatCard key={idx} stat={stat} />
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search GRN, PO or Supplier..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filter Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ALL REQUESTS</option>
              <option value="pending">PENDING QC</option>
              <option value="qc_pending">QC REVIEW</option>
              <option value="approved">AWAITING STORAGE</option>
              <option value="shortage">SHORTAGE (READY)</option>
              <option value="overage">OVERAGE (READY)</option>
              <option value="completed">COMPLETED</option>
            </select>
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-3">GRN Info</th>
              <th className="px-6 py-3">Supplier</th>
              <th className="px-6 py-3 text-center">Date</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredData.map((grn) => (
              <tr key={grn.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-bold text-slate-900">{grn.grnNo}</span>
                  <p className="text-[10px] text-slate-500">PO: {grn.poNo}</p>
                </td>
                <td className="px-6 py-4 font-medium">{grn.vendor}</td>
                <td className="px-6 py-4 text-center text-xs">{grn.receivedDate}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    grn.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                    grn.status === 'pending_approval' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                    grn.status === 'pending' ? 'bg-slate-50 text-slate-600 border border-slate-100' :
                    grn.status === 'qc_pending' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 
                    grn.status === 'shortage' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    grn.status === 'overage' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                    'bg-cyan-50 text-cyan-600 border border-cyan-100'
                  }`}>
                    {grn.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {grn.status === 'pending_approval' && (
                      <button 
                        onClick={() => handleApproveGRN(grn)}
                        disabled={approvingGRN === grn.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                      >
                        {approvingGRN === grn.id ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        {approvingGRN === grn.id ? "Approving..." : "Approve GRN"}
                      </button>
                    )}
                    {(grn.status === 'qc_pending' || grn.status === 'pending') && (
                      <button 
                        onClick={() => handleInspectClick(grn)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold"
                      >
                        <ClipboardCheck size={14} /> Inspect
                      </button>
                    )}
                    {(grn.status === 'approved' || grn.status === 'shortage' || grn.status === 'overage') && (
                      <button 
                        onClick={() => handleAddToStock(grn)}
                        disabled={processingStock === grn.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                      >
                        {processingStock === grn.id ? <RefreshCw size={14} className="animate-spin" /> : <Package size={14} />}
                        {processingStock === grn.id ? "Adding..." : "Add to Stock"}
                      </button>
                    )}
                    <button 
                      onClick={() => handleViewDetails(grn)}
                      className="p-1.5 text-slate-400 hover:text-blue-600"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* QC Inspection Modal */}
      {showQCModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
             <div className="px-6 py-4 flex items-center justify-between border-b bg-slate-50">
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Quality Control Inspection</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">GRN: {selectedGRN?.grnNo} • PO: {selectedGRN?.poNo}</p>
                </div>
                <button onClick={() => setShowQCModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck size={12} /> Inspection Status
                      </label>
                      <select 
                        value={qcForm.status}
                        onChange={(e) => setQCForm({...qcForm, status: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      >
                        <option value="pending">In Progress</option>
                        <option value="passed">Passed (Approved)</option>
                        <option value="failed">Failed (Rejected)</option>
                        <option value="shortage">Shortage</option>
                        <option value="overage">Overage</option>
                      </select>
                   </div>
                   <div className="md:col-span-3 space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText size={12} /> Overall Remarks
                      </label>
                      <input 
                        type="text"
                        value={qcForm.remarks}
                        onChange={(e) => setQCForm({...qcForm, remarks: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="General inspection notes..."
                      />
                   </div>
                </div>

                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">Item Details</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b text-center w-24">Ordered</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b text-center w-24">Invoice</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b text-center w-24">Received Quantity</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b text-center w-24">Shortage</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b text-center w-24">Overage</th>
                          <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">Item Notes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {qcForm.items.map((item, idx) => {
                          const invQty = Number(item.invoice_quantity) || 0;
                          const recQty = Number(item.accepted) || 0;
                          const shortage = Math.max(0, invQty - recQty);
                          const overage = Math.max(0, recQty - invQty);
                          
                          return (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-4">
                              <div className="space-y-0.5">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">{item.material_name}</h4>
                                <p className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-fit">{item.material_code}</p>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="text-xs font-bold text-slate-400">{item.quantity}</span>
                            </td>
                            <td className="px-4 py-4">
                              <input 
                                type="number" 
                                value={item.invoice_quantity}
                                onChange={(e) => handleQCQuantityChange(idx, "invoice_quantity", e.target.value)}
                                className="w-full text-center px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <input 
                                type="number" 
                                value={item.accepted}
                                onChange={(e) => handleQCQuantityChange(idx, "accepted", e.target.value)}
                                className="w-full text-center px-2 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-black text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className={`text-xs font-black ${shortage > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                                {shortage}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className={`text-xs font-black ${overage > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                                {overage}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <input 
                                type="text" 
                                value={item.notes}
                                onChange={(e) => handleQCQuantityChange(idx, "notes", e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-medium outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Defects etc..."
                              />
                            </td>
                          </tr>
                        );})}
                    </tbody>
                  </table>
                </div>
             </div>
             
             <div className="px-6 py-4 border-t bg-slate-50 flex justify-between items-center">
                <div className="flex gap-8">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Received</span>
                    <span className="text-sm font-black text-blue-600">{qcForm.items.reduce((s, i) => s + (Number(i.accepted) || 0), 0)} Units</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowQCModal(false)} 
                    className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSubmitQC} 
                    className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Save size={16} /> Save Inspection Results
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* View Details Modal with Inspection Data */}
      {showViewModal && selectedGRN && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  GRN Details - GRN-{selectedGRN.grn?.id}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Comprehensive Receipt & Inspection Report</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-8">
              {/* Summary Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedGRN.grn?.qcStatus === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {selectedGRN.grn?.qcStatus === 'approved' ? <CheckCircle size={24} /> : <Clock size={24} />}
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">QC Status</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedGRN.grn?.qcStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {selectedGRN.grn?.qcStatus}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Received Date</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {new Date(selectedGRN.grn?.receivedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Package size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Net Received</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {selectedGRN.grn?.receivedQuantity} Units
                    </p>
                  </div>
                </div>
              </div>

              {/* Context Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Warehouse size={12} /> Logistics Context
                  </h3>
                  <div className="p-4 rounded-2xl border border-slate-100 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase">PO Reference</span>
                      <span className="text-xs font-black text-slate-900">{selectedGRN.grn?.poNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase">Supplier</span>
                      <span className="text-xs font-black text-slate-900">{selectedGRN.grn?.vendor}</span>
                    </div>
                  </div>
                </div>
                {selectedGRN.inspection && (
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <ClipboardCheck size={12} /> Inspection Record
                    </h3>
                    <div className="p-4 rounded-2xl border border-slate-100 space-y-4 bg-slate-50/30">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase">Decision</span>
                        <span className="text-xs font-black text-blue-600 uppercase">{selectedGRN.inspection.status}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Inspector Remarks</span>
                        <p className="text-xs font-medium text-slate-700 italic">"{selectedGRN.inspection.remarks || 'No specific remarks provided'}"</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Itemized Discrepancy Table */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <List size={12} /> Itemized Inspection Results
                </h3>
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Item Description</th>
                        <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Ordered</th>
                        <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Invoice</th>
                        <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Received Qty</th>
                        <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Shortage</th>
                        <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Overage</th>
                        <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {(selectedGRN.items || []).map((item, idx) => {
                        const shortage = Math.max(0, (Number(item.quantity) || 0) - (Number(item.received) || 0));
                        const overage = Number(item.overage) || 0;
                        return (
                          <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-4 py-4">
                              <div className="space-y-0.5">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">{item.material_name || item.description}</h4>
                                <p className="text-[9px] font-medium text-slate-400">{item.material_code}</p>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center text-xs font-bold text-slate-400">{item.quantity}</td>
                            <td className="px-4 py-4 text-center text-xs font-bold text-slate-900">{item.invoice_quantity}</td>
                            <td className="px-4 py-4 text-center text-xs font-black text-emerald-600">{item.received}</td>
                            <td className="px-4 py-4 text-center text-xs font-black text-amber-600">{shortage}</td>
                            <td className="px-4 py-4 text-center text-xs font-black text-blue-600">{overage}</td>
                            <td className="px-4 py-4 text-center">
                              {shortage > 0 ? (
                                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-red-50 text-red-600 uppercase">Shortage</span>
                              ) : overage > 0 ? (
                                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-blue-50 text-blue-600 uppercase">Overage</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-50 text-emerald-600 uppercase">Verified</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-end gap-4">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-md transition-all active:scale-95"
              >
                <Printer size={16} /> Print Inspection Report
              </button>
              <button 
                onClick={() => setShowViewModal(false)}
                className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-slate-800 transition-all active:scale-95"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GRNProcessingPage;
