import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle, Loader, CheckCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from '../../utils/api';

const OutwardChallanForm = ({ task, materials, vendors = [], onChallanCreated, type = 'outsourcing_task' }) => {
  const [formData, setFormData] = useState({
    vendorId: task?.selected_vendor_id || task?.vendor_id || '',
    materialSentDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
    notes: ''
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  };

  const generatePDF = async (challanData) => {
    const doc = new jsPDF();
    const vendor = vendors.find(v => v.id === parseInt(formData.vendorId));

    try {
      const logo = await loadImage("/logo.png");
      doc.addImage(logo, "PNG", 14, 5, 50, 15);
    } catch (error) {
      console.warn("Logo not found or failed to load:", error);
    }

    // Header
    doc.setFontSize(20);
    doc.text("OUTWARD CHALLAN", 105, 30, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 14, 45);
    doc.text(`Vendor: ${vendor?.name || 'N/A'}`, 14, 50);
    if (type === 'job_card') {
      doc.text(`Work Order: ${task?.work_order_no || 'N/A'}`, 14, 55);
      doc.text(`Operation: ${task?.operation_name || 'N/A'}`, 14, 60);
    } else {
      doc.text(`Project: ${task?.project_name || 'N/A'}`, 14, 55);
      doc.text(`Product: ${task?.product_name || 'N/A'}`, 14, 60);
      doc.text(`Task: ${task?.stage_name || 'N/A'}`, 14, 65);
    }
    doc.text(`Expected Return: ${new Date(formData.expectedReturnDate).toLocaleDateString('en-IN')}`, 14, 75);

    // Items Table
    const tableColumn = ["Item Code", "Material Name", "Quantity", "Unit", "Remarks"];
    const tableRows = selectedItems.map(item => [
      item.itemCode,
      item.itemName,
      item.quantity,
      item.unit,
      item.remarks || ""
    ]);

    autoTable(doc, {
      startY: 80,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] }, // Purple/Indigo color matching the theme
    });

    if (formData.notes) {
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.text("Notes:", 14, finalY);
      doc.text(formData.notes, 14, finalY + 5);
    }

    return doc;
  };

  const handleAddMaterialRow = () => {
    setSelectedItems([
      ...selectedItems,
      {
        materialId: null,
        itemCode: '',
        itemName: '',
        quantity: 1,
        unit: 'piece',
        remarks: ''
      }
    ]);
  };

  const handleSelectMaterial = (index, material) => {
    const updated = [...selectedItems];
    updated[index] = {
      materialId: material.id,
      itemCode: material.item_code,
      itemName: material.item_name,
      availableQuantity: material.quantity || 0,
      quantity: 0,
      unit: material.unit || 'piece',
      remarks: updated[index].remarks || ''
    };
    setSelectedItems(updated);
  };

  const handleRemoveMaterial = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index, field, value) => {
    const updated = [...selectedItems];
    updated[index][field] = value;
    setSelectedItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vendorId) {
      setError('Please select a vendor');
      return;
    }

    if (selectedItems.length === 0) {
      setError('Please select at least one material');
      return;
    }

    if (selectedItems.some(item => item.materialId === null)) {
      setError('Please select material for all rows');
      return;
    }

    if (!formData.expectedReturnDate) {
      setError('Expected return date is required');
      return;
    }

    // Removed inventory check as materials were already issued via MR
    /*
    if (selectedItems.some(item => item.quantity > item.availableQuantity)) {
      setError('One or more items exceed available inventory');
      return;
    }
    */

    try {
      setLoading(true);
      setError('');

      // Generate PDF
      const doc = await generatePDF();
      const pdfBase64 = doc.output('datauristring');

      const endpoint = type === 'job_card' 
        ? `/production/outsourcing/job-card/${task.id}/outward-challan`
        : `/production/outsourcing/tasks/${task.id}/outward-challan`;

      await axios.post(endpoint, {
        vendorId: parseInt(formData.vendorId),
        materialSentDate: formData.materialSentDate,
        expectedReturnDate: formData.expectedReturnDate,
        notes: formData.notes,
        items: selectedItems,
        pdfBase64: pdfBase64
      });

      setSuccess('Outward challan created successfully!');
      setTimeout(() => {
        if (onChallanCreated) onChallanCreated();
      }, 1500);
    } catch (err) {
      console.error('Error creating outward challan:', err);
      setError(err.response?.data?.message || 'Failed to create outward challan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-green-700 dark:text-green-400">
          {success}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
          Vendor *
        </label>
        <select
          value={formData.vendorId}
          onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          disabled={loading}
          required
        >
          <option value="">Select a vendor...</option>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.name}
            </option>
          ))}
        </select>
        {vendors.length === 0 && (
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
            No vendors available. Please create vendors in the Inventory module.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
            Material Sent Date
          </label>
          <input
            type="date"
            value={formData.materialSentDate}
            onChange={(e) => setFormData({ ...formData, materialSentDate: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
            Expected Return Date *
          </label>
          <input
            type="date"
            required
            value={formData.expectedReturnDate}
            onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          rows="2"
          disabled={loading}
        />
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Materials to Send</h4>
          <button
            type="button"
            onClick={handleAddMaterialRow}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
            disabled={loading}
          >
            <Plus className="w-4 h-4" /> Add Material
          </button>
        </div>

        {selectedItems.length === 0 ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-yellow-800 dark:text-yellow-200">
            <AlertCircle className="w-5 h-5 inline mr-2" />
            No materials selected. Click "Add Material" to add material rows.
          </div>
        ) : (
          <div className="space-y-3">
            {selectedItems.map((item, index) => (
              <div
                key={index}
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800"
              >
                {item.materialId === null ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
                        Select Material *
                      </label>
                      <select
                        value=""
                        onChange={(e) => {
                          const material = materials.find(m => m.id === parseInt(e.target.value));
                          if (material) {
                            handleSelectMaterial(index, material);
                          }
                        }}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 font-medium"
                        disabled={loading}
                      >
                        <option value="">Select material...</option>
                        {materials?.map((material) => (
                          <option key={material.id} value={material.id}>
                            {material.item_name} ({material.item_code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(index, 'quantity', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-bold"
                        disabled={loading}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
                        Unit
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={item.unit}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-500"
                        disabled={loading}
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
                        Remarks
                      </label>
                      <input
                        type="text"
                        placeholder="Optional remarks"
                        value={item.remarks}
                        onChange={(e) => handleUpdateItem(index, 'remarks', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
                        disabled={loading}
                      />
                    </div>

                    <div className="md:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(index)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        disabled={loading}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Material Details</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{item.itemName}</p>
                      <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{item.itemCode}</p>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 text-center">Released</p>
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800 text-center">
                        <span className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                          {item.availableQuantity} {item.unit}
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block text-center">
                        Issue Qty *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.quantity}
                        placeholder="0.00"
                        onChange={(e) => handleUpdateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-black text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                        disabled={loading}
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
                        Remarks
                      </label>
                      <input
                        type="text"
                        placeholder="Add internal notes..."
                        value={item.remarks}
                        onChange={(e) => handleUpdateItem(index, 'remarks', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        disabled={loading}
                      />
                    </div>

                    <div className="md:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(index)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        disabled={loading}
                        title="Remove material"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={loading || selectedItems.length === 0}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 group"
        >
          {loading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Create Outward Challan
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default OutwardChallanForm;
