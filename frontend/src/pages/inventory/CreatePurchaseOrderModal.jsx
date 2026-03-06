import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Plus, Trash2, CheckCircle, Calendar, DollarSign, User, Package, FileText, Save, Edit, RefreshCw } from "lucide-react";
import axios from "../../utils/api";
import Swal from "sweetalert2";
import toastUtils from "../../utils/toastUtils";
import { useRootCardInventoryTask } from "../../hooks/useRootCardInventoryTask";

const CreatePurchaseOrderModal = ({ isOpen, onClose, source, type, onPOCreated, editData, preFilledFromQuotation }) => {
  const navigate = useNavigate();
  const { completeCurrentTask, isFromDepartmentTasks } = useRootCardInventoryTask();
  const [vendors, setVendors] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [flowType, setFlowType] = useState("direct"); // direct, mr, quotation
  
  const [formData, setFormData] = useState({
    vendor_id: "",
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: "",
    currency: "INR",
    tax_template: "No Tax Template",
    notes: "",
    items: [],
    subtotal: 0,
    tax_amount: 0,
    total_amount: 0
  });

  useEffect(() => {
    if (isOpen) {
      fetchVendors();
      fetchMaterialRequests();
      fetchQuotations();
      
      if (editData) {
        // Edit Mode
        setFlowType(editData.material_request_id ? "mr" : (editData.quotation_id ? "quotation" : "direct"));
        setFormData({
          id: editData.id,
          vendor_id: editData.vendor_id,
          order_date: editData.order_date ? editData.order_date.split('T')[0] : new Date().toISOString().split('T')[0],
          expected_delivery_date: editData.expected_delivery_date ? editData.expected_delivery_date.split('T')[0] : "",
          currency: editData.currency || "INR",
          tax_template: editData.tax_template || "No Tax Template",
          notes: editData.notes || "",
          items: editData.items || [],
          subtotal: editData.subtotal || 0,
          tax_amount: editData.tax_amount || 0,
          total_amount: editData.total_amount || 0,
          material_request_id: editData.material_request_id,
          quotation_id: editData.quotation_id
        });
      } else if (preFilledFromQuotation) {
        // Create from Quotation (passed via prop)
        setFlowType("quotation");
        const initialItems = (preFilledFromQuotation.items || []).map(item => ({
          material_name: item.material_name || item.description,
          material_code: item.material_code || item.item_code,
          quantity: item.quantity,
          unit: item.unit || item.uom,
          rate: item.rate || item.unit_price,
          amount: item.amount || (item.quantity * (item.rate || item.unit_price))
        }));

        setFormData(prev => ({
          ...prev,
          quotation_id: preFilledFromQuotation.id,
          vendor_id: preFilledFromQuotation.vendor_id,
          items: initialItems,
          subtotal: preFilledFromQuotation.total_amount,
          total_amount: preFilledFromQuotation.total_amount,
          notes: `Created from Quotation: ${preFilledFromQuotation.quotation_number || preFilledFromQuotation.id}`,
          root_card_id: preFilledFromQuotation.root_card_id,
          material_request_id: preFilledFromQuotation.material_request_id
        }));
      } else if (source && type === 'material_request') {
        // Create from MR (triggered externally)
        setFlowType("mr");
        const initialItems = (source.items || []).map(item => ({
          material_name: item.material_name,
          material_code: item.material_code,
          quantity: item.quantity,
          unit: item.unit,
          rate: 0,
          amount: 0
        }));
        
        setFormData(prev => ({
          ...prev,
          material_request_id: source.id,
          items: initialItems,
          notes: `Created from Material Request: ${source.mr_number}`
        }));
      } else if (source && type === 'quotation') {
        // Create from Quotation (triggered externally)
        setFlowType("quotation");
        const initialItems = (source.items || []).map(item => ({
          material_name: item.material_name || item.description,
          material_code: item.material_code || item.item_code,
          quantity: item.quantity,
          unit: item.unit || item.uom,
          rate: item.rate || item.unit_price,
          amount: item.amount || (item.quantity * (item.rate || item.unit_price))
        }));

        setFormData(prev => ({
          ...prev,
          quotation_id: source.id,
          vendor_id: source.vendor_id,
          items: initialItems,
          subtotal: source.total_amount,
          total_amount: source.total_amount,
          notes: `Created from Quotation: ${source.quotation_number || source.id}`
        }));
      } else {
        // Fresh Creation
        setFlowType("direct");
        setFormData({
          vendor_id: "",
          order_date: new Date().toISOString().split('T')[0],
          expected_delivery_date: "",
          currency: "INR",
          tax_template: "No Tax Template",
          notes: "",
          items: [],
          subtotal: 0,
          tax_amount: 0,
          total_amount: 0
        });
      }
    }
  }, [isOpen, source, type, editData]);

  const fetchVendors = async () => {
    try {
      const response = await axios.get("/inventory/vendors");
      setVendors(response.data.vendors || response.data || []);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const fetchMaterialRequests = async () => {
    try {
      const response = await axios.get("/inventory/material-requests");
      // Filter for pending/approved but not fully ordered MRs
      const mrs = response.data.materialRequests || response.data || [];
      setMaterialRequests(mrs.filter(mr => mr.status !== 'ordered' && mr.status !== 'closed'));
    } catch (error) {
      console.error("Error fetching material requests:", error);
    }
  };

  const fetchQuotations = async () => {
    try {
      const response = await axios.get("/inventory/quotations");
      // Filter for approved quotations
      const qts = response.data.quotations || response.data || [];
      setQuotations(qts.filter(q => q.status === 'approved' || q.status === 'pending'));
    } catch (error) {
      console.error("Error fetching quotations:", error);
    }
  };

  const handleMRSelect = (mrId) => {
    if (!mrId) return;
    const selectedMR = materialRequests.find(mr => String(mr.id) === String(mrId));
    if (selectedMR) {
      const initialItems = (selectedMR.items || []).map(item => ({
        material_name: item.material_name,
        material_code: item.material_code,
        quantity: item.quantity,
        unit: item.unit,
        rate: 0,
        amount: 0
      }));
      
      setFormData(prev => ({
        ...prev,
        material_request_id: selectedMR.id,
        items: initialItems,
        notes: `Created from Material Request: ${selectedMR.mr_number}`
      }));
    }
  };

  const handleQuotationSelect = (quotationId) => {
    if (!quotationId) return;
    const selectedQt = quotations.find(q => String(q.id) === String(quotationId));
    if (selectedQt) {
      const initialItems = (selectedQt.items || []).map(item => ({
        material_name: item.material_name || item.description,
        material_code: item.material_code || item.item_code,
        quantity: item.quantity,
        unit: item.unit || item.uom,
        rate: item.rate || item.unit_price,
        amount: item.amount || (item.quantity * (item.rate || item.unit_price))
      }));

      setFormData(prev => ({
        ...prev,
        quotation_id: selectedQt.id,
        vendor_id: selectedQt.vendor_id,
        items: initialItems,
        subtotal: selectedQt.total_amount,
        total_amount: selectedQt.total_amount,
        notes: `Created from Quotation: ${selectedQt.quotation_number || selectedQt.id}`
      }));
    }
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { material_name: "", quantity: 1, unit: "Nos", rate: 0, amount: 0 }]
    }));
  };

  const handleRemoveItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    calculateTotals(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = (newItems[index].quantity || 0) * (newItems[index].rate || 0);
    }
    
    calculateTotals(newItems);
  };

  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const tax_amount = 0; // Simplified
    const total_amount = subtotal + tax_amount;
    
    setFormData(prev => ({
      ...prev,
      items,
      subtotal,
      tax_amount,
      total_amount
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vendor_id) {
      toastUtils.warning("Please select a supplier");
      return;
    }
    if (formData.items.length === 0) {
      toastUtils.warning("Please add at least one item");
      return;
    }

    setSubmitting(true);
    try {
      let response;
      if (editData) {
        // Update existing PO
        response = await axios.put(`/inventory/purchase-orders/${editData.id}`, formData);
        toastUtils.success("Purchase Order updated successfully");
      } else {
        // Create new PO
        response = await axios.post("/inventory/purchase-orders", formData);
        toastUtils.success("Purchase Order created successfully");

        // If we are coming from workflow tasks, complete the "Create Purchase Order" task
        if (isFromDepartmentTasks()) {
          try {
            await completeCurrentTask("Purchase Order created");
          } catch (taskError) {
            console.error("Error completing workflow task:", taskError);
          }
        }
      }
      
      if (onPOCreated) onPOCreated();
      onClose();
      
      if (!editData) {
        navigate(`/inventory-manager/purchase-orders/${response.data.id || response.data.po_number}`);
      }
    } catch (error) {
      console.error("Error saving PO:", error);
      toastUtils.error(error.response?.data?.message || "Failed to save purchase order");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {editData ? <Edit className="text-blue-600" size={24} /> : <Plus className="text-blue-600" size={24} />}
            {editData ? `Edit Purchase Order: ${editData.po_number}` : "Create New Purchase Order"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* PO Flow Selection - Only for New POs */}
            {!editData && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <RefreshCw size={18} className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Order Source Flow</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFlowType("direct");
                      setFormData(prev => ({ ...prev, material_request_id: null, quotation_id: null }));
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-left flex flex-col gap-2 ${
                      flowType === "direct" 
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20" 
                      : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                    }`}
                  >
                    <span className="font-bold text-sm">Direct Purchase</span>
                    <span className="text-[10px] text-slate-500">Create a PO from scratch</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlowType("mr")}
                    className={`p-4 rounded-xl border-2 transition-all text-left flex flex-col gap-2 ${
                      flowType === "mr" 
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20" 
                      : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                    }`}
                  >
                    <span className="font-bold text-sm">From Material Request</span>
                    <span className="text-[10px] text-slate-500">Import items from MR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlowType("quotation")}
                    className={`p-4 rounded-xl border-2 transition-all text-left flex flex-col gap-2 ${
                      flowType === "quotation" 
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20" 
                      : "border-slate-100 dark:border-slate-800 hover:border-slate-200"
                    }`}
                  >
                    <span className="font-bold text-sm">From Quotation</span>
                    <span className="text-[10px] text-slate-500">Import from approved quotation</span>
                  </button>
                </div>

                {flowType === "mr" && (
                  <div className="animate-in slide-in-from-top-2 duration-200">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Material Request</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      value={formData.material_request_id || ""}
                      onChange={(e) => handleMRSelect(e.target.value)}
                    >
                      <option value="">Select MR...</option>
                      {materialRequests.map(mr => (
                        <option key={mr.id} value={mr.id}>{mr.mr_number} - {mr.department_name || mr.type}</option>
                      ))}
                    </select>
                  </div>
                )}

                {flowType === "quotation" && (
                  <div className="animate-in slide-in-from-top-2 duration-200">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Quotation</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      value={formData.quotation_id || ""}
                      onChange={(e) => handleQuotationSelect(e.target.value)}
                    >
                      <option value="">Select Quotation...</option>
                      {quotations.map(q => (
                        <option key={q.id} value={q.id}>{q.quotation_number} - {q.vendor_name || `Vendor #${q.vendor_id}`}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <FileText size={18} className="text-slate-400" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Basic Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Supplier *</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    value={formData.vendor_id}
                    onChange={(e) => setFormData({...formData, vendor_id: e.target.value})}
                    required
                  >
                    <option value="">Select Supplier...</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Order Date *</label>
                  <input 
                    type="date"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    value={formData.order_date}
                    onChange={(e) => setFormData({...formData, order_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expected Delivery *</label>
                  <input 
                    type="date"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    value={formData.expected_delivery_date}
                    onChange={(e) => setFormData({...formData, expected_delivery_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              {formData.vendor_id && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Supplier Name</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {vendors.find(v => String(v.id) === String(formData.vendor_id))?.name || "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Supplier ID</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {vendors.find(v => String(v.id) === String(formData.vendor_id))?.vendor_code || formData.vendor_id}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Type</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Standard Vendor</p>
                  </div>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Purchase Order Items</h3>
                </div>
                <button 
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg hover:bg-blue-100 transition-all"
                >
                  <Plus size={14} /> Add Item
                </button>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      <th className="px-6 py-4 text-left">Item Details</th>
                      <th className="px-6 py-4 text-center w-24">Qty</th>
                      <th className="px-6 py-4 text-center w-24">UOM</th>
                      <th className="px-6 py-4 text-center w-32">Rate</th>
                      <th className="px-6 py-4 text-right w-32">Amount</th>
                      <th className="px-6 py-4 text-center w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                    {formData.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="px-6 py-4">
                          <input 
                            className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-900 dark:text-white"
                            placeholder="Enter item name..."
                            value={item.material_name}
                            onChange={(e) => handleItemChange(idx, 'material_name', e.target.value)}
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input 
                            type="number"
                            step="any"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg py-1 px-2 text-center text-sm font-bold"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input 
                            className="w-full bg-transparent border-none focus:ring-0 text-center text-sm text-slate-500"
                            value={item.unit}
                            onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                            <input 
                              type="number"
                              step="any"
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg py-1 pl-6 pr-2 text-right text-sm font-bold"
                              value={item.rate}
                              onChange={(e) => handleItemChange(idx, 'rate', Number(e.target.value))}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-slate-900 dark:text-white">₹{(item.amount || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                    <DollarSign size={18} className="text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tax & Currency</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Currency</label>
                      <select 
                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium"
                        value={formData.currency}
                        onChange={(e) => setFormData({...formData, currency: e.target.value})}
                      >
                        <option value="INR">INR (Indian Rupee)</option>
                        <option value="USD">USD (US Dollar)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tax Template</label>
                      <select 
                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium"
                        value={formData.tax_template}
                        onChange={(e) => setFormData({...formData, tax_template: e.target.value})}
                      >
                        <option value="No Tax Template">No Tax Template</option>
                        <option value="GST 18%">GST 18%</option>
                        <option value="GST 12%">GST 12%</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 space-y-4 self-start">
                <div className="flex justify-between items-center text-blue-100">
                  <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
                  <span className="font-bold">₹{formData.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-blue-100">
                  <span className="text-xs font-bold uppercase tracking-widest">Tax (Calculated)</span>
                  <span className="font-bold">₹{formData.tax_amount.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-blue-500 flex justify-between items-center text-white">
                  <span className="text-sm font-black uppercase tracking-[0.2em]">Grand Total</span>
                  <span className="text-2xl font-black tracking-tight">₹{formData.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notes & Terms</label>
              <textarea 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                rows={4}
                placeholder="Enter any specific notes or terms for this order..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 sticky bottom-0 z-10">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-slate-500 hover:text-slate-700 font-bold text-xs uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={submitting}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
            >
              {submitting ? <RefreshCw size={16} className="animate-spin" /> : (editData ? <Save size={16} /> : <CheckCircle size={16} />)}
              {submitting ? "Saving..." : (editData ? "Update PO" : "Create Purchase Order")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePurchaseOrderModal;
