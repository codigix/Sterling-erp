import React, { useState, useEffect } from "react";
import { X, Package, Calendar, Trash2, Plus, LayoutGrid, Warehouse, ClipboardList, Info } from "lucide-react";
import axios from "../../utils/api";
import Swal from "sweetalert2";
import toastUtils from "../../utils/toastUtils";

const CreateStockEntryModal = ({ isOpen, onClose, onEntryCreated }) => {
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [grns, setGrns] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({
    grn_id: "",
    entry_date: new Date().toISOString().split('T')[0],
    entry_type: "Material Receipt",
    from_warehouse: "",
    to_warehouse: "",
    remarks: "",
    items: []
  });

  // Current Item Input State
  const [currentItem, setCurrentItem] = useState({
    material_id: "",
    item_code: "",
    item_name: "",
    quantity: 1,
    uom: "Kg",
    batch_no: "",
    valuation_rate: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [whRes, matRes, grnRes] = await Promise.all([
          axios.get("/inventory/warehouses"),
          axios.get("/inventory/materials"),
          axios.get("/inventory/grns?status=completed") // Or whatever status is relevant
        ]);
        setWarehouses(whRes.data || []);
        setMaterials(matRes.data.materials || matRes.data || []);
        setGrns(grnRes.data.grns || grnRes.data || []);
      } catch (error) {
        console.error("Error fetching data for Stock Entry modal:", error);
      }
    };
    if (isOpen) fetchData();
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCurrentItemChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "material_id") {
      const selectedMat = materials.find(m => m.id === parseInt(value));
      if (selectedMat) {
        setCurrentItem(prev => ({
          ...prev,
          material_id: value,
          item_code: selectedMat.itemCode || selectedMat.item_code || "",
          item_name: selectedMat.itemName || selectedMat.item_name || "",
          uom: selectedMat.unit || "Kg",
          valuation_rate: selectedMat.unit_cost || 0
        }));
      } else {
        setCurrentItem(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setCurrentItem(prev => ({ ...prev, [name]: value }));
    }
  };

  const addItem = () => {
    if (!currentItem.material_id || currentItem.quantity <= 0) {
      toastUtils.error("Please select an item and enter a valid quantity");
      return;
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { ...currentItem, id: Date.now() }]
    }));

    // Reset current item
    setCurrentItem({
      material_id: "",
      item_code: "",
      item_name: "",
      quantity: 1,
      uom: "Kg",
      batch_no: "",
      valuation_rate: 0
    });
  };

  const removeItem = (id) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleSubmit = async (isDraft = false) => {
    if (formData.items.length === 0) {
      toastUtils.error("Please add at least one item");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        status: isDraft ? 'draft' : 'submitted'
      };
      
      await axios.post("/inventory/stock-entries", payload);
      
      toastUtils.success(`Stock Entry ${isDraft ? 'Saved' : 'Created'} Successfully`);
      if (onEntryCreated) onEntryCreated();
      onClose();
    } catch (error) {
      console.error("Error creating stock entry:", error);
      toastUtils.error("Failed to create stock entry");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Package className="text-blue-600" size={28} />
              Create Stock Entry
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Record material movements between warehouses or adjust stock levels.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Step 1: Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">1</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Basic Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">SELECT GRN REQUEST (OPTIONAL)</label>
                <select 
                  name="grn_id"
                  value={formData.grn_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="">-- Manual Entry --</option>
                  {grns.map(grn => (
                    <option key={grn.id} value={grn.id}>{grn.grn_number}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1 ml-1">Available GRNs: {grns.length} | Processed: 0</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider text-xs">ENTRY DATE *</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="date"
                    name="entry_date"
                    value={formData.entry_date}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider text-xs">ENTRY TYPE *</label>
                <select 
                  name="entry_type"
                  value={formData.entry_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Material Receipt">Material Receipt</option>
                  <option value="Material Issue">Material Issue</option>
                  <option value="Material Transfer">Material Transfer</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider text-xs">FROM WAREHOUSE</label>
                <select 
                  name="from_warehouse"
                  value={formData.from_warehouse}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Source Warehouse</option>
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.name}>{wh.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider text-xs">TO WAREHOUSE</label>
                <select 
                  name="to_warehouse"
                  value={formData.to_warehouse}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Destination Warehouse</option>
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.name}>{wh.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-700" />

          {/* Step 2: Add Items */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">2</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Items</h3>
            </div>

            <div className="bg-slate-50/50 dark:bg-slate-900/30 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1 tracking-wider text-xs">ITEM CODE *</label>
                  <select 
                    name="material_id"
                    value={currentItem.material_id}
                    onChange={handleCurrentItemChange}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    <option value="">Select Item</option>
                    {materials.map(mat => (
                      <option key={mat.id} value={mat.id}>{mat.item_code} - {mat.item_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1 tracking-wider text-xs">QUANTITY *</label>
                  <input 
                    type="number"
                    name="quantity"
                    value={currentItem.quantity}
                    onChange={handleCurrentItemChange}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1 tracking-wider text-xs">UOM</label>
                  <input 
                    type="text"
                    name="uom"
                    value={currentItem.uom}
                    readOnly
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1 tracking-wider text-xs">BATCH NO</label>
                  <input 
                    type="text"
                    name="batch_no"
                    placeholder="Optional"
                    value={currentItem.batch_no}
                    onChange={handleCurrentItemChange}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1 tracking-wider text-xs">VALUATION RATE (₹)</label>
                  <input 
                    type="number"
                    name="valuation_rate"
                    value={currentItem.valuation_rate}
                    onChange={handleCurrentItemChange}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <button 
                  onClick={addItem}
                  className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-bold text-sm h-[40px] flex items-center justify-center gap-2"
                >
                  Add Item
                </button>
              </div>
            </div>

            {/* Added Items Table */}
            {formData.items.length > 0 && (
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Item</th>
                      <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-500 uppercase">Qty</th>
                      <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-500 uppercase">Rate</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-tight">Total</th>
                      <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {formData.items.map((item) => (
                      <tr key={item.id} className="text-sm">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{item.item_code}</p>
                          <p className="text-xs text-slate-500">{item.item_name}</p>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-xs">{item.quantity} {item.uom}</td>
                        <td className="px-4 py-3 text-center text-xs">₹{item.valuation_rate}</td>
                        <td className="px-4 py-3 text-right font-bold text-xs">₹{(item.quantity * item.valuation_rate).toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => removeItem(item.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
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

          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">REMARKS</label>
            <textarea 
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              placeholder="Additional notes..."
              rows="3"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            ></textarea>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-4">
            <button 
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 rounded-xl font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              Save as Draft
            </button>
            <button 
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all transform active:scale-95 shadow-lg shadow-blue-500/20"
            >
              {loading ? "Processing..." : "Create Entry"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStockEntryModal;
