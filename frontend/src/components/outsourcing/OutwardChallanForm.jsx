import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle, Loader } from 'lucide-react';
import axios from '../../utils/api';

const OutwardChallanForm = ({ task, materials, vendors = [], onChallanCreated }) => {
  const [formData, setFormData] = useState({
    vendorId: task?.selected_vendor_id || '',
    materialSentDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
    notes: ''
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      quantity: updated[index].quantity || 1,
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

    try {
      setLoading(true);
      setError('');

      await axios.post(`/production/outsourcing/tasks/${task.id}/outward-challan`, {
        vendorId: parseInt(formData.vendorId),
        materialSentDate: formData.materialSentDate,
        expectedReturnDate: formData.expectedReturnDate,
        notes: formData.notes,
        items: selectedItems
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase mb-1 block">
                        Material *
                      </label>
                      <select
                        value=""
                        onChange={(e) => {
                          const material = materials.find(m => m.id === parseInt(e.target.value));
                          if (material) {
                            handleSelectMaterial(index, material);
                          }
                        }}
                        className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700"
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

                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase mb-1 block">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(index, 'quantity', parseFloat(e.target.value))}
                        className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase mb-1 block">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleUpdateItem(index, 'unit', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm"
                        disabled={loading}
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <input
                        type="text"
                        placeholder="Remarks"
                        value={item.remarks}
                        onChange={(e) => handleUpdateItem(index, 'remarks', e.target.value)}
                        className="flex-1 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(index)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase mb-1">Material</p>
                      <p className="font-medium text-slate-900 dark:text-white">{item.itemName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.itemCode}</p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase mb-1 block">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(index, 'quantity', parseFloat(e.target.value))}
                        className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase mb-1 block">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleUpdateItem(index, 'unit', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm"
                        disabled={loading}
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <input
                        type="text"
                        placeholder="Remarks"
                        value={item.remarks}
                        onChange={(e) => handleUpdateItem(index, 'remarks', e.target.value)}
                        className="flex-1 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(index)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="submit"
          disabled={loading || selectedItems.length === 0}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader className="w-4 h-4 animate-spin" />}
          {loading ? 'Creating...' : 'Create Outward Challan'}
        </button>
      </div>
    </form>
  );
};

export default OutwardChallanForm;
