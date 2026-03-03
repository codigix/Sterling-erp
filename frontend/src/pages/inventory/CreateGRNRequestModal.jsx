import React, { useState, useEffect } from "react";
import { X, CheckCircle, Package, User, Calendar, Trash2, Plus, LayoutGrid, Truck } from "lucide-react";
import axios from "../../utils/api";
import Swal from "sweetalert2";
import toastUtils from "../../utils/toastUtils";

const CreateGRNRequestModal = ({ isOpen, onClose, po, onGRNCreated }) => {
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [allPOs, setAllPOs] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [formData, setFormData] = useState({
    po_id: null,
    po_number: "",
    receipt_date: new Date().toISOString().split('T')[0],
    transporter_notes: "",
    items: [],
    vendor_id: null,
    vendor_name: "No Supplier Linked"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [whRes, poRes, matRes] = await Promise.all([
          axios.get("/inventory/warehouses"),
          axios.get("/inventory/purchase-orders?status=approved"),
          axios.get("/inventory/materials")
        ]);
        setWarehouses(whRes.data);
        setAllPOs(poRes.data.purchaseOrders || poRes.data || []);
        setAllMaterials(matRes.data.materials || matRes.data || []);
      } catch (error) {
        console.error("Error fetching data for GRN modal:", error);
      }
    };
    if (isOpen) fetchData();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (po) {
        // Initialize from provided PO
        const initialItems = (po.items || []).map(item => ({
          ...item,
          received_quantity: item.quantity,
          warehouse: warehouses.length > 0 ? warehouses[0].name : "Main Warehouse",
          material_name: item.material_name || item.itemName || item.item_name || item.name || item.description,
          material_code: item.material_code || item.itemCode || item.item_code || item.code,
          rate: item.rate || item.unit_price || item.unitCost || 0,
          unit: item.unit || "Units",
          is_po_item: true
        }));
        
        setFormData({
          po_id: po.id,
          po_number: po.po_number,
          receipt_date: new Date().toISOString().split('T')[0],
          transporter_notes: "",
          items: initialItems,
          vendor_id: po.vendor_id,
          vendor_name: po.vendor_name || "Active Vendor"
        });
      } else {
        // Reset for manual entry
        setFormData({
          po_id: null,
          po_number: "",
          receipt_date: new Date().toISOString().split('T')[0],
          transporter_notes: "",
          items: [],
          vendor_id: null,
          vendor_name: "No Supplier Linked"
        });
      }
    }
  }, [isOpen, po, warehouses]);

  const handlePOChange = async (poId) => {
    if (!poId) {
      setFormData(prev => ({ ...prev, po_id: null, po_number: "", items: [], vendor_id: null, vendor_name: "No Supplier Linked" }));
      return;
    }

    try {
      const selectedPO = allPOs.find(p => p.id === parseInt(poId));
      if (selectedPO) {
        const response = await axios.get(`/inventory/purchase-orders/${selectedPO.id}`);
        const poDetails = response.data;
        
        const initialItems = (poDetails.items || []).map(item => ({
          ...item,
          received_quantity: item.quantity,
          warehouse: warehouses.length > 0 ? warehouses[0].name : "Main Warehouse",
          material_name: item.material_name || item.itemName || item.item_name || item.name || item.description,
          material_code: item.material_code || item.itemCode || item.item_code || item.code,
          rate: item.rate || item.unit_price || item.unitCost || 0,
          unit: item.unit || "Units",
          is_po_item: true
        }));

        setFormData(prev => ({
          ...prev,
          po_id: selectedPO.id,
          po_number: selectedPO.po_number,
          items: initialItems,
          vendor_id: selectedPO.vendor_id,
          vendor_name: selectedPO.vendor_name || "Active Vendor"
        }));
      }
    } catch (error) {
      console.error("Error loading PO details:", error);
    }
  };

  const handleAddLineItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          material_name: "",
          material_code: "",
          quantity: 0,
          received_quantity: 0,
          rate: 0,
          warehouse: warehouses.length > 0 ? warehouses[0].name : "Main Warehouse",
          unit: "Units"
        }
      ]
    }));
  };

  const handleItemSelect = (index, materialId) => {
    const selectedMat = allMaterials.find(m => m.id === parseInt(materialId));
    if (!selectedMat) return;

    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      material_id: selectedMat.id,
      material_name: selectedMat.itemName || selectedMat.name || selectedMat.description,
      material_code: selectedMat.itemCode || selectedMat.item_code || selectedMat.code,
      rate: selectedMat.unitCost || selectedMat.valuationRate || selectedMat.unit_price || 0,
      unit: selectedMat.unit || "Units"
    };
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      toastUtils.warning("Please add at least one item");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/inventory/grns", {
        po_id: formData.po_id,
        items: formData.items,
        receipt_date: formData.receipt_date,
        transporter_notes: formData.transporter_notes,
        vendor_id: formData.vendor_id,
        qc_status: "pending"
      });

      toastUtils.success("Purchase Receipt created successfully");
      if (onGRNCreated) onGRNCreated();
      onClose();
    } catch (error) {
      console.error("Error creating GRN:", error);
      toastUtils.error(error.response?.data?.message || "Failed to create receipt");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalQuantity = formData.items.reduce((sum, item) => sum + (Number(item.received_quantity) || 0), 0);
  const totalValuation = formData.items.reduce((sum, item) => sum + (Number(item.received_quantity) || 0) * (Number(item.rate) || 0), 0);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Create GRN Request
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row h-full">
            {/* Left Sidebar Info */}
            <div className="w-full md:w-80 bg-slate-50/50 dark:bg-slate-800/30 p-6 border-r border-slate-100 dark:border-slate-800 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Package size={18} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Receipt Context</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1"># GRN Number</label>
                    <input 
                      disabled 
                      className="w-full px-3 py-2 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-500"
                      value={`GRN-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Purchase Order</label>
                    <select
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.po_id || ""}
                      onChange={(e) => handlePOChange(e.target.value)}
                    >
                      <option value="">Select PO (Optional)</option>
                      {Array.isArray(allPOs) && allPOs.map(po => (
                        <option key={po.id} value={po.id}>{po.po_number} - {po.vendor_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Receipt Date</label>
                    <div className="relative">
                      <input 
                        type="date"
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.receipt_date}
                        onChange={(e) => setFormData({ ...formData, receipt_date: e.target.value })}
                      />
                      <Calendar className="absolute left-3 top-2.5 text-slate-400" size={14} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <User size={18} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Supplier Info</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Selected Supplier</p>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{formData.vendor_name}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">ID: {formData.vendor_id ? `SUP-${formData.vendor_id}` : 'N/A'}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-4">
                   <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Truck size={18} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Transporter Notes</span>
                </div>
                <textarea 
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Vehicle number, driver details etc..."
                  value={formData.transporter_notes}
                  onChange={(e) => setFormData({ ...formData, transporter_notes: e.target.value })}
                ></textarea>
              </div>
            </div>

            {/* Main Content - Items Table */}
            <div className="flex-1 p-6 flex flex-col min-h-0 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                    <LayoutGrid size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Receipt Items</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Verify received quantities against PO</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={handleAddLineItem}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-blue-100 transition-all active:scale-95 border border-blue-100 dark:border-blue-800"
                >
                  <Plus size={16} /> Add Line Item
                </button>
              </div>

              <div className="flex-1 overflow-auto border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead className="sticky top-0 z-20 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-md">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Item Details</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-center">Warehouse</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-center w-24">PO Qty</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-center w-24">Received</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-center w-24">Rate</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-center w-32">Total</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {formData.items.map((item, idx) => {
                      const itemName = item.material_name || item.itemName || item.item_name || item.name || item.description;
                      const itemCode = item.material_code || item.itemCode || item.item_code || item.code || "GENERIC";
                      const isPredefined = item.is_po_item || item.material_id || item.id || itemName;

                      return (
                      <tr key={idx} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-4 py-4 min-w-[250px]">
                          {isPredefined ? (
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
                                {itemName}
                              </h4>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-800 uppercase tracking-wider">
                                  {itemCode}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <select 
                              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                              value={item.material_id || ""}
                              onChange={(e) => handleItemSelect(idx, e.target.value)}
                            >
                              <option value="">Select Item</option>
                              {Array.isArray(allMaterials) && allMaterials.map(m => (
                                <option key={m.id} value={m.id}>{m.itemCode || m.item_code} - {m.itemName || m.name}</option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <select 
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                            value={item.warehouse}
                            onChange={(e) => handleItemChange(idx, "warehouse", e.target.value)}
                          >
                            {Array.isArray(warehouses) && warehouses.length > 0 ? (
                              warehouses.map(wh => (
                                <option key={wh.id} value={wh.name}>{wh.name}</option>
                              ))
                            ) : (
                              <option value="Main Warehouse">Main Warehouse</option>
                            )}
                          </select>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-xs font-bold text-slate-500">{item.quantity}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input 
                            type="number"
                            step="any"
                            className="w-20 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-black text-blue-600 text-center outline-none focus:ring-2 focus:ring-blue-500"
                            value={item.received_quantity}
                            onChange={(e) => handleItemChange(idx, "received_quantity", e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-4 text-center">
                           <input 
                            type="number"
                            step="any"
                            className="w-20 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-500 text-center outline-none focus:ring-2 focus:ring-blue-500"
                            value={item.rate}
                            onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            ₹{((Number(item.received_quantity) || 0) * (Number(item.rate) || 0)).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button 
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    )})}
                    {formData.items.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2 opacity-40">
                            <Package size={40} />
                            <p className="text-xs font-bold uppercase tracking-widest">No Items Added Yet</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 sticky bottom-0 z-20">
            <div className="flex items-center gap-12">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Quantity</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{totalQuantity.toLocaleString()} Units</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Valuation</span>
                <span className="text-lg font-black text-blue-600">₹{totalValuation.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 md:flex-none px-8 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading || formData.items.length === 0}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Plus size={18} />}
                Create GRN Request
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGRNRequestModal;
