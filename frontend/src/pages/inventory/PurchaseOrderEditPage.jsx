import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Calendar, 
  Truck, 
  User, 
  Package, 
  CreditCard, 
  ChevronRight,
  Settings,
  Shield,
  Briefcase,
  MapPin,
  RefreshCw,
  Calculator
} from "lucide-react";
import axios from "../../utils/api";
import Swal from "sweetalert2";
import toastUtils from "../../utils/toastUtils";

const PurchaseOrderEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState("foundation");
  const [vendors, setVendors] = useState([]);
  
  const [formData, setFormData] = useState({
    po_number: "",
    order_date: "",
    expected_delivery_date: "",
    vendor_id: "",
    items: [],
    shipping_address: "",
    incoterm: "EXW - Ex Works",
    shipping_rule: "Standard",
    tax_category: "GST",
    payment_terms: "",
    payment_due_date: "",
    tax_rate: 18,
    advance_paid: 0,
    subtotal: 0,
    tax_amount: 0,
    total_amount: 0,
    payable_balance: 0,
    notes: ""
  });

  const calculateTotals = useCallback((items, taxRate, advance) => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const gstComponent = (subtotal * (Number(taxRate) || 0)) / 100;
    const total = subtotal + gstComponent;
    const balance = total - (Number(advance) || 0);

    setFormData(prev => ({
      ...prev,
      items,
      subtotal,
      tax_amount: gstComponent,
      total_amount: total,
      payable_balance: balance
    }));
  }, []);

  const fetchPODetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/inventory/purchase-orders/${id}`);
      let data = response.data.purchaseOrder || response.data;
      
      if (data.status !== 'draft') {
        toastUtils.warning("Cannot edit a submitted Purchase Order.");
        navigate(`/inventory-manager/purchase-orders/${id}`);
        return;
      }
      if (data.items && typeof data.items === 'string') {
        try {
            data.items = JSON.parse(data.items);
        } catch (e) {
            console.error("Error parsing items:", e);
            data.items = [];
        }
      }
      
      setFormData(prev => ({
        ...prev,
        ...data,
        order_date: data.order_date ? data.order_date.split('T')[0] : "",
        expected_delivery_date: data.expected_delivery_date ? data.expected_delivery_date.split('T')[0] : "",
        payment_due_date: data.payment_due_date ? data.payment_due_date.split('T')[0] : "",
        tax_rate: data.tax_rate || 18,
        advance_paid: data.advance_paid || 0,
        items: data.items || [],
        shipping_address: data.shipping_address || "",
        incoterm: data.incoterm || "EXW - Ex Works",
        shipping_rule: data.shipping_rule || "Standard",
        tax_category: data.tax_category || "GST",
        payment_terms: data.payment_terms || "",
        notes: data.notes || ""
      }));
      
      calculateTotals(data.items || [], data.tax_rate || 18, data.advance_paid || 0);
    } catch (error) {
      console.error("Error fetching PO details:", error);
      toastUtils.error("Failed to load Purchase Order details");
    } finally {
      setLoading(false);
    }
  }, [id, calculateTotals]);

  const fetchVendors = async () => {
    try {
      const response = await axios.get("/inventory/vendors");
      setVendors(response.data.vendors || response.data || []);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  useEffect(() => {
    fetchPODetails();
    fetchVendors();
  }, [fetchPODetails]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = (Number(newItems[index].quantity) || 0) * (Number(newItems[index].rate) || 0);
    }
    
    calculateTotals(newItems, formData.tax_rate, formData.advance_paid);
  };

  const handleAddItem = () => {
    const newItem = {
      material_name: "",
      material_code: "",
      quantity: 0,
      unit: "Nos",
      rate: 0,
      amount: 0
    };
    calculateTotals([...formData.items, newItem], formData.tax_rate, formData.advance_paid);
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    calculateTotals(newItems, formData.tax_rate, formData.advance_paid);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    try {
      await axios.put(`/inventory/purchase-orders/${id}`, formData);
      toastUtils.success("Purchase Order updated successfully");
      navigate(`/inventory-manager/purchase-orders/${id}`);
    } catch (error) {
      console.error("Error updating PO:", error);
      toastUtils.error(error.response?.data?.message || "Failed to update Purchase Order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <RefreshCw className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const sections = [
    { id: "foundation", label: "FOUNDATION", icon: Settings },
    { id: "vendor", label: "VENDOR", icon: User },
    { id: "items", label: "ORDER ITEMS", icon: Package },
    { id: "logistics", label: "LOGISTICS", icon: Truck },
    { id: "finance", label: "FINANCE & TERMS", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-6 flex flex-col sticky top-0 h-screen">
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Back</span>
          </button>
          <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            {formData.po_number}
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Edit Purchase Order</p>
        </div>

        <nav className="flex-1 space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeSection === section.id 
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20" 
                  : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">{section.label}</span>
                {activeSection === section.id && <div className="ml-auto w-1 h-1 rounded-full bg-blue-600"></div>}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Order Summary</p>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Items</span>
              <span className="text-xs font-black text-slate-900 dark:text-white">{formData.items.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Total</span>
              <span className="text-xs font-black text-blue-600">₹{formData.total_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto h-screen scroll-smooth">
        <div className="max-w-4xl mx-auto pb-20">
          <header className="flex items-center justify-between mb-8 bg-slate-50 dark:bg-slate-950 py-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                <Settings className="text-white" size={24} />
              </div>
              <div>
                <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">
                  <span>Buying</span>
                  <ChevronRight size={10} />
                  <span>Purchase Order</span>
                </nav>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formData.po_number}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <X size={16} /> Discard
              </button>
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
              >
                {submitting ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                {submitting ? "Updating..." : "Update Order"}
              </button>
            </div>
          </header>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* FOUNDATION Section */}
            <section id="foundation" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                    <Settings size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Foundation <span className="text-slate-400 ml-2 font-medium">SETTINGS</span></h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tight">Core order parameters and identification</p>
                  </div>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    Order Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="date"
                      value={formData.order_date}
                      onChange={(e) => setFormData({...formData, order_date: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Expected Delivery Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="date"
                      value={formData.expected_delivery_date}
                      onChange={(e) => setFormData({...formData, expected_delivery_date: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* VENDOR Section */}
            <section id="vendor" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Vendor <span className="text-slate-400 ml-2 font-medium">PARTNER</span></h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tight">Supplier selection and profile information</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  Select Supplier <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none cursor-pointer"
                  value={formData.vendor_id}
                  onChange={(e) => setFormData({...formData, vendor_id: e.target.value})}
                  required
                >
                  <option value="">Search by name or code...</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name} - {v.vendor_code || v.id}</option>
                  ))}
                </select>
                
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
            </section>

            {/* ORDER ITEMS Section */}
            <section id="items" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                    <Package size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Order <span className="text-slate-400 ml-2 font-medium">ITEMS</span></h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tight">Line items and technical specifications</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20"
                >
                  <Plus size={14} /> Add Item
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Rate</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Row Total</th>
                      <th className="px-6 py-4 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {formData.items.map((item, idx) => (
                      <tr key={idx} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <input 
                              type="text"
                              value={item.material_name}
                              onChange={(e) => handleItemChange(idx, 'material_name', e.target.value)}
                              placeholder="Item Name"
                              className="w-full bg-transparent border-none p-0 text-xs font-black text-slate-900 dark:text-white focus:ring-0 outline-none placeholder:text-slate-300"
                            />
                            <input 
                              type="text"
                              value={item.material_code}
                              onChange={(e) => handleItemChange(idx, 'material_code', e.target.value)}
                              placeholder="Item Code"
                              className="w-full bg-transparent border-none p-0 text-[10px] font-bold text-slate-400 focus:ring-0 outline-none placeholder:text-slate-300"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <input 
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                              className="w-20 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.unit}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">₹</span>
                            <input 
                              type="number"
                              value={item.rate}
                              onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                              className="w-32 pl-7 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[11px] font-black text-slate-900 dark:text-white tracking-tight">₹{(item.amount || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* LOGISTICS Section */}
            <section id="logistics" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-orange-50/30 dark:bg-orange-800/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 rounded-lg">
                    <Truck size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Shipping <span className="text-slate-400 ml-2 font-medium">LOGISTICS</span></h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tight">Delivery coordinates and trade conditions</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-50 dark:border-slate-800">
                      <MapPin size={16} className="text-orange-500" />
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shipping Address</h4>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Street Address</label>
                      <textarea 
                        value={formData.shipping_address}
                        onChange={(e) => setFormData({...formData, shipping_address: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                        rows={3}
                        placeholder="Unit / Street / Landmark"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-50 dark:border-slate-800">
                      <Briefcase size={16} className="text-orange-500" />
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trade Controls</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Incoterm</label>
                        <select 
                          value={formData.incoterm}
                          onChange={(e) => setFormData({...formData, incoterm: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
                        >
                          <option value="EXW - Ex Works">EXW - Ex Works</option>
                          <option value="FOB - Free On Board">FOB - Free On Board</option>
                          <option value="CIF - Cost, Insurance and Freight">CIF - Cost, Insurance and Freight</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Shipping Rule</label>
                        <input 
                          type="text"
                          value={formData.shipping_rule}
                          onChange={(e) => setFormData({...formData, shipping_rule: e.target.value})}
                          placeholder="e.g. Courier, Freight Forwarder"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FINANCE & TERMS Section */}
            <section id="finance" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-red-50/30 dark:bg-red-800/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-lg">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Revenue <span className="text-slate-400 ml-2 font-medium">FINANCE</span></h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tight">Taxation, payment terms and commercial summary</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    {/* Payment Strategy */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-50 dark:border-slate-800">
                        <Shield size={16} className="text-red-500" />
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Strategy</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Payment Terms</label>
                          <input 
                            type="text"
                            value={formData.payment_terms}
                            onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
                            placeholder="e.g. 100% Advance"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Payment Due Date</label>
                          <input 
                            type="date"
                            value={formData.payment_due_date}
                            onChange={(e) => setFormData({...formData, payment_due_date: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Financial Modifiers */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-50 dark:border-slate-800">
                        <Briefcase size={16} className="text-red-500" />
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Modifiers</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Tax Rate (%)</label>
                          <input 
                            type="number"
                            value={formData.tax_rate}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData(prev => ({...prev, tax_rate: val}));
                              calculateTotals(formData.items, val, formData.advance_paid);
                            }}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Advance Paid</label>
                          <input 
                            type="number"
                            value={formData.advance_paid}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData(prev => ({...prev, advance_paid: val}));
                              calculateTotals(formData.items, formData.tax_rate, val);
                            }}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Purchase Valuation Summary */}
                  <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full sticky top-24">
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Purchase Valuation</h4>
                      <Calculator size={16} className="text-white/20" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white/60">Subtotal</span>
                          <span className="text-xs font-black text-white">₹{formData.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white/60">GST Component</span>
                            <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[9px] font-bold uppercase">{formData.tax_rate}%</span>
                          </div>
                          <span className="text-xs font-black text-red-400">+ ₹{formData.tax_amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-emerald-400">Advance Deduction</span>
                          <span className="text-xs font-black text-emerald-400">- ₹{(Number(formData.advance_paid) || 0).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/5">
                        <div className="flex justify-between items-end mb-4">
                          <div>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Payable Balance</p>
                            <h3 className="text-3xl font-black text-white tracking-tighter">₹{formData.payable_balance.toLocaleString()}</h3>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Currency</p>
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">INR (₹)</p>
                          </div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl flex items-center gap-3">
                          <div className="p-2 bg-white/10 rounded-lg text-emerald-400">
                            <CreditCard size={18} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-white uppercase tracking-wider">Payment Channel</p>
                            <p className="text-[9px] text-white/50 uppercase tracking-widest font-medium">Bank Transfer / NEFT</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderEditPage;
