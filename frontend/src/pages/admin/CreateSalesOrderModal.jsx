import React, { useState, useEffect } from 'react';
import axios from '../../utils/api';
import { X, Loader2, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const CreateSalesOrderModal = ({ onCancel, onSuccess, editData, preSelectedRootCardId }) => {
  const [loading, setLoading] = useState(false);
  const [boms, setBoms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [rootCards, setRootCards] = useState([]);
  const [formData, setFormData] = useState({
    rootCardId: editData?.root_card_id || preSelectedRootCardId || '',
    bomId: editData?.bom_id || '',
    soNumber: editData?.so_number || '',
    customerId: editData?.customer_id || '',
    customerName: editData?.customer_name || '',
    warehouseId: editData?.warehouse_id || '',
    quantity: Number(editData?.quantity) || 1,
    orderDate: editData?.order_date ? new Date(editData.order_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    deliveryDate: editData?.delivery_date ? new Date(editData.delivery_date).toISOString().split('T')[0] : '',
    notes: editData?.notes || '',
    unitPrice: Number(editData?.unit_price) || 0,
    profitMargin: 20,
    taxPercent: Number(editData?.tax_percent) || 18,
    discountPercent: editData ? (Number(editData.discount) / (Number(editData.quantity) * Number(editData.unit_price)) * 100) || 0 : 0,
    status: editData?.status || 'Pending'
  });

  const [selectedBOMData, setSelectedBOMData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [customerRes, warehouseRes, rootCardRes, nextSoRes] = await Promise.all([
        axios.get('sales/customers'),
        axios.get('inventory/warehouses'),
        axios.get('sales/management/root-cards'),
        !editData ? axios.get('sales/management/next-so-number') : Promise.resolve({ data: { nextNumber: '' } })
      ]);
      setCustomers(customerRes.data);
      setWarehouses(warehouseRes.data);
      setRootCards(rootCardRes.data);

      if (!editData && nextSoRes.data.nextNumber) {
        setFormData(prev => ({ ...prev, soNumber: nextSoRes.data.nextNumber }));
      }

      if (editData?.root_card_id) {
        const bomsRes = await axios.get(`sales/management/root-cards/${editData.root_card_id}/boms`);
        setBoms(bomsRes.data);
        const currentBOM = bomsRes.data.find(b => b.id === editData.bom_id);
        if (currentBOM) {
          setSelectedBOMData(currentBOM);
          // Recalculate profit margin from editData unitPrice and BOM cost
          const cost = currentBOM.totalCost || 0;
          if (cost > 0) {
            const margin = ((editData.unit_price - cost) / cost) * 100;
            setFormData(prev => ({ ...prev, profitMargin: margin }));
          }
        }
      } else if (preSelectedRootCardId) {
        // Trigger root card change logic for pre-selected ID
        handleRootCardChange({ target: { value: preSelectedRootCardId } }, customerRes.data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch required data');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = name === 'quantity' || name === 'unitPrice' || name === 'discountPercent' || name === 'taxPercent' || name === 'profitMargin'
      ? parseFloat(value) || 0 
      : value;

    setFormData(prev => {
      const newData = { ...prev, [name]: val };
      
      // If profit margin or unit price (when BOM is selected) changes, update the other
      if (name === 'profitMargin' && selectedBOMData) {
        const cost = selectedBOMData.totalCost || 0;
        newData.unitPrice = cost * (1 + val / 100);
      } else if (name === 'unitPrice' && selectedBOMData) {
        const cost = selectedBOMData.totalCost || 0;
        if (cost > 0) {
          newData.profitMargin = ((val - cost) / cost) * 100;
        }
      }
      
      return newData;
    });
  };

  const handleRootCardChange = async (e, customerList = null) => {
    const rootCardId = e.target.value;
    const currentCustomers = customerList || customers;
    
    if (!rootCardId) {
      setBoms([]);
      setSelectedBOMData(null);
      setFormData(prev => ({ ...prev, rootCardId: '', bomId: '', customerId: '' }));
      return;
    }

    setLoading(true);
    try {
      const [detailsRes, bomsRes] = await Promise.all([
        axios.get(`sales/management/root-cards/${rootCardId}`),
        axios.get(`sales/management/root-cards/${rootCardId}/boms`)
      ]);

      const details = detailsRes.data;
      const filteredBoms = bomsRes.data;
      
      setBoms(filteredBoms);

      // Try to find matching customer by name from PO details
      let suggestedCustomerId = '';
      const clientName = details.poDetails?.clientName || details.customer;
      
      if (clientName) {
        const matchedCustomer = currentCustomers.find(c => 
          c.name.toLowerCase().includes(clientName.toLowerCase()) ||
          clientName.toLowerCase().includes(c.name.toLowerCase())
        );
        if (matchedCustomer) suggestedCustomerId = matchedCustomer.id;
      }

      const selectedBOM = filteredBoms.length === 1 ? filteredBoms[0] : null;
      if (selectedBOM) setSelectedBOMData(selectedBOM);

      setFormData(prev => ({ 
        ...prev, 
        rootCardId,
        customerId: suggestedCustomerId || prev.customerId,
        customerName: clientName || prev.customerName,
        bomId: selectedBOM ? selectedBOM.id : '',
        quantity: details.poDetails?.productDetails?.quantity || details.items?.[0]?.quantity || prev.quantity,
        orderDate: details.poDetails?.poDate ? new Date(details.poDetails.poDate).toISOString().split('T')[0] : (details.order_date ? new Date(details.order_date).toISOString().split('T')[0] : prev.orderDate),
        deliveryDate: details.designDetails?.estimatedEndDate 
          ? new Date(details.designDetails.estimatedEndDate).toISOString().split('T')[0] 
          : (details.poDetails?.productDetails?.estimatedEndDate 
            ? new Date(details.poDetails.productDetails.estimatedEndDate).toISOString().split('T')[0] 
            : (details.due_date ? new Date(details.due_date).toISOString().split('T')[0] : '')),
        unitPrice: selectedBOM ? (selectedBOM.totalCost || 0) * (1 + prev.profitMargin / 100) : prev.unitPrice
      }));

    } catch (error) {
      console.error('Error fetching root card details:', error);
      toast.error('Failed to fetch root card details');
    } finally {
      setLoading(false);
    }
  };

  const handleBOMChange = (e) => {
    const bomId = e.target.value;
    const selectedBOM = boms.find(b => b.id === parseInt(bomId));
    setSelectedBOMData(selectedBOM);
    
    setFormData(prev => ({ 
      ...prev, 
      bomId,
      unitPrice: selectedBOM ? (selectedBOM.totalCost || 0) * (1 + prev.profitMargin / 100) : prev.unitPrice
    }));
  };

  const calculateTotal = () => {
    const subtotal = formData.quantity * formData.unitPrice;
    const discountAmount = (subtotal * formData.discountPercent) / 100;
    const discounted = subtotal - discountAmount;
    const tax = (discounted * formData.taxPercent) / 100;
    return discounted + tax;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.bomId || !formData.soNumber || (!formData.customerId && !formData.customerName) || !formData.orderDate || !formData.deliveryDate) {
      toast.warning('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        discount: (formData.quantity * formData.unitPrice * formData.discountPercent) / 100
      };

      if (editData) {
        await axios.put(`sales/management/${editData.id}`, submitData);
        toast.success('Sales Order updated successfully');
      } else {
        await axios.post('sales/management', submitData);
        toast.success('Sales Order created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || `Failed to ${editData ? 'update' : 'create'} sales order`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editData ? 'Edit' : 'Create'} Sales Order</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{editData ? 'Modify existing' : 'Configure'} order details, taxes and cost breakdown</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8 overflow-y-auto flex-1 dark:bg-slate-900">
          {/* Section 1: Order Information & Customer Details */}
          <div className="grid grid-cols-2 gap-6">
            {/* Order Information */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-primary-600 rounded-full"></div>
                <h3 className="font-bold text-slate-700 dark:text-slate-200 uppercase text-sm tracking-wider">Order Information</h3>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Select Root Card *</label>
                  <select
                    name="rootCardId"
                    value={formData.rootCardId}
                    onChange={handleRootCardChange}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-slate-200"
                    required
                  >
                    <option value="">Select a Root Card</option>
                    {rootCards.map(rc => (
                      <option key={rc.id} value={rc.id}>
                        {rc.po_number} - {rc.customer} {rc.project_name ? `(${rc.project_name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">SO Number *</label>
                  <input
                    type="text"
                    name="soNumber"
                    value={formData.soNumber}
                    onChange={handleChange}
                    placeholder="e.g. SO-2026-001"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-slate-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Order Date *</label>
                    <input
                      type="date"
                      name="orderDate"
                      value={formData.orderDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:text-slate-200"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Delivery Date *</label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={formData.deliveryDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:text-slate-200"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                <h3 className="font-bold text-slate-700 dark:text-slate-200 uppercase text-sm tracking-wider">Customer Details</h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Customer Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="Customer Name"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-slate-200"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Target Warehouse</label>
                  <select
                    name="warehouseId"
                    value={formData.warehouseId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:text-slate-200"
                  >
                    <option value="">Select Warehouse (Optional)</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name} - {w.code}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Order Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any special instructions..."
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none min-h-[85px] resize-none dark:text-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: BOM & Inventory */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-emerald-600 rounded-full"></div>
              <h3 className="font-bold text-slate-700 dark:text-slate-200 uppercase text-sm tracking-wider">BOM & Inventory</h3>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Approved BOM *</label>
                <select
                  name="bomId"
                  value={formData.bomId}
                  onChange={handleBOMChange}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:text-slate-200"
                  required
                >
                  <option value="">Select a BOM</option>
                  {boms.map(bom => (
                    <option key={bom.id} value={bom.id}>
                      {bom.productName} ({bom.itemCode}) - Rev {bom.revision}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Order Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-bold text-primary-600 dark:text-primary-400"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">UOM</label>
                <input
                  type="text"
                  value={selectedBOMData?.uom || 'Nos'}
                  disabled
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 italic"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Order Status & Taxes (Pricing) */}
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-amber-600 rounded-full"></div>
                <h3 className="font-bold text-slate-700 dark:text-slate-200 uppercase text-sm tracking-wider">Order Status & Taxes</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase">Current Status:</span>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 text-amber-800 dark:text-amber-300 rounded-full text-xs font-bold outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Base Cost (₹)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={selectedBOMData?.totalCost || 0}
                    disabled
                    className="w-full pl-8 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 font-mono"
                  />
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                </div>
                <p className="text-[10px] text-slate-400 italic">Auto-filled from BOM</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Profit Margin (%)</label>
                <input
                  type="number"
                  name="profitMargin"
                  value={formData.profitMargin}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Unit Price (₹)</label>
                <div className="relative">
                  <input
                    type="number"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-bold dark:text-slate-100"
                  />
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Discount (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    name="discountPercent"
                    value={formData.discountPercent}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-bold text-red-600 dark:text-red-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Tax (%)</label>
                <select
                  name="taxPercent"
                  value={formData.taxPercent}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:text-slate-200"
                >
                  <option value="0">0% (GST)</option>
                  <option value="5">5% (GST)</option>
                  <option value="12">12% (GST)</option>
                  <option value="18">18% (GST)</option>
                  <option value="28">28% (GST)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Value Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Subtotal ({formData.quantity} × ₹{(Number(formData.unitPrice) || 0).toFixed(2)})</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">₹{(formData.quantity * formData.unitPrice).toLocaleString()}</span>
                  </div>
                  {formData.discountPercent > 0 && (
                    <div className="flex justify-between text-red-600 dark:text-red-400">
                      <span>Total Discount ({formData.discountPercent}%)</span>
                      <span>- ₹{((formData.quantity * formData.unitPrice * formData.discountPercent) / 100).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Taxable Value</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">₹{(formData.quantity * formData.unitPrice - (formData.quantity * formData.unitPrice * formData.discountPercent / 100)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Applicable Tax ({formData.taxPercent}%)</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">₹{((formData.quantity * formData.unitPrice - (formData.quantity * formData.unitPrice * formData.discountPercent / 100)) * formData.taxPercent / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Net Payable Amount</span>
                    <span className="font-bold text-primary-600 dark:text-primary-400 text-lg">₹{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800/50 flex flex-col justify-center text-center">
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">Projected Net Profit</p>
                <h4 className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                  ₹{((formData.unitPrice - (selectedBOMData?.totalCost || 0)) * formData.quantity).toLocaleString()}
                </h4>
                <p className="text-[10px] text-emerald-500 dark:text-emerald-400 mt-1 font-medium">
                  Based on current margin: {(Number(formData.profitMargin) || 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: BOM Details Summary */}
          {/* {selectedBOMData && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800 px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">BOM Details Summary</h4>
                <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-[10px] font-bold uppercase">
                  Rev {selectedBOMData.revision}
                </span>
              </div>
              <div className="p-5 grid grid-cols-4 gap-6 bg-white dark:bg-slate-900/50">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Product</label>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{selectedBOMData.productName}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Item Code</label>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedBOMData.itemCode}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Material Cost</label>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">₹{(selectedBOMData.materialCost || 0).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Process Cost</label>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">₹{(selectedBOMData.processCost || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )} */}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-400 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 shadow-lg shadow-primary-200 dark:shadow-none transition-all active:scale-95 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                editData ? 'Save Changes' : 'Create Sales Order'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSalesOrderModal;
