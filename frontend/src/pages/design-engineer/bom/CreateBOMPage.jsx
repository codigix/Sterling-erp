import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, AlertCircle, CheckCircle, ChevronLeft, Package, Grid3x3 } from 'lucide-react';
import axios from '../../../utils/api';

const CreateBOMPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const taskId = searchParams.get('taskId');
  const projectName = searchParams.get('projectName') || '';
  const poNumber = searchParams.get('poNumber') || '';
  const customer = searchParams.get('customer') || '';
  const salesOrderId = searchParams.get('salesOrderId');
  
  const [bomData, setBomData] = useState({
    projectName: projectName || '',
    description: '',
    salesOrderId: salesOrderId || null,
    items: [{ id: 1, partNumber: '', description: '', quantity: 1, unit: 'pcs', supplier: '', itemGroup: 'Raw Material' }]
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [filterGroup, setFilterGroup] = useState('All');
  const [saving, setSaving] = useState(false);

  const itemGroups = ['Finished Good', 'Sub-assembly', 'Raw Material', 'Component', 'Consumable'];
  
  const getCategoryColor = (category) => {
    const colors = {
      'Finished Good': 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700',
      'Sub-assembly': 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700',
      'Raw Material': 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700',
      'Component': 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700',
      'Consumable': 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'
    };
    return colors[category] || colors['Raw Material'];
  };

  const handleAddItem = () => {
    if (bomData.items.length >= 50) {
      setErrorMessage('Maximum 50 items per BOM');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    const newId = Math.max(...bomData.items.map(i => i.id), 0) + 1;
    setBomData({
      ...bomData,
      items: [...bomData.items, { id: newId, partNumber: '', description: '', quantity: 1, unit: 'pcs', supplier: '', itemGroup: 'Raw Material' }]
    });
  };

  const handleRemoveItem = (id) => {
    if (bomData.items.length === 1) {
      setErrorMessage('BOM must have at least one item');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    setBomData({
      ...bomData,
      items: bomData.items.filter(item => item.id !== id)
    });
  };

  const handleItemChange = (id, field, value) => {
    setBomData({
      ...bomData,
      items: bomData.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const handleSave = async () => {
    if (!bomData.projectName.trim()) {
      setErrorMessage('Project name is required');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const validItems = bomData.items.filter(item => item.partNumber && item.description);
    if (validItems.length === 0) {
      setErrorMessage('Add at least one valid item (part number and description)');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        salesOrderId: bomData.salesOrderId,
        projectName: bomData.projectName,
        description: bomData.description,
        items: validItems
      };
      
      await axios.post('/api/production/bom', payload);
      
      setSuccessMessage(`BOM "${bomData.projectName}" saved successfully with ${validItems.length} items!`);
      setTimeout(() => {
        navigate('/design-engineer/bom/view');
      }, 2000);
    } catch (error) {
      console.error('Failed to save BOM:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to save BOM. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const totalItems = bomData.items.length;
  const validItems = bomData.items.filter(item => item.partNumber && item.description);
  const itemsByCategory = itemGroups.reduce((acc, group) => {
    acc[group] = bomData.items.filter(item => item.itemGroup === group).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Top Navigation */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate('/design-engineer/dashboard')}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition text-slate-600 dark:text-slate-400"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Bill of Materials</h1>
        </div>

        {/* Project Context Card */}
        {(projectName || poNumber || customer) && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold tracking-wide">Project</p>
                <p className="text-md font-semibold text-slate-900 dark:text-white mt-1">{projectName}</p>
              </div>
              {poNumber && (
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold tracking-wide">PO Number</p>
                  <p className="text-md font-semibold text-slate-900 dark:text-white mt-1">{poNumber}</p>
                </div>
              )}
              {customer && (
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold tracking-wide">Customer</p>
                  <p className="text-md font-semibold text-slate-900 dark:text-white mt-1">{customer}</p>
                </div>
              )}
              {salesOrderId && (
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold tracking-wide">Sales Order</p>
                  <p className="text-md font-semibold text-slate-900 dark:text-white mt-1">#{salesOrderId}</p>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Messages */}
      {successMessage && (
        <div className="flex items-center text-xs gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
          <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
          <p className="text-sm font-medium text-green-800 dark:text-green-300">{successMessage}</p>
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center text-xs gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{errorMessage}</p>
        </div>
      )}

        {/* BOM Details Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">BOM Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                BOM Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={bomData.projectName}
                onChange={(e) => setBomData({ ...bomData, projectName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs"
                placeholder="e.g., Assembly Unit A1"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
              <input
                type="text"
                value={bomData.description}
                onChange={(e) => setBomData({ ...bomData, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs"
                placeholder="e.g., Main assembly for this project"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center shadow-sm">
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Total Items</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{totalItems}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center shadow-sm">
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Valid Items</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{validItems.length}</p>
          </div>
          {itemGroups.map(group => (
            <div key={group} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center shadow-sm">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold truncate">{group.split(' ')[0]}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{itemsByCategory[group] || 0}</p>
            </div>
          ))}
        </div>

        {/* BOM Items Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package size={20} />
                BOM Items
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{bomData.items.length} total items</p>
            </div>
            <button
              onClick={handleAddItem}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-medium text-sm"
            >
              <Plus size={18} />
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Part Number</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Supplier</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {bomData.items.map((item) => (
                  <tr key={item.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${getCategoryColor(item.itemGroup)}`}>
                    <td className="px-4 py-3">
                      <select
                        value={item.itemGroup || 'Raw Material'}
                        onChange={(e) => handleItemChange(item.id, 'itemGroup', e.target.value)}
                        className="w-full px-3 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {itemGroups.map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.partNumber}
                        onChange={(e) => handleItemChange(item.id, 'partNumber', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="PN-001"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Item description"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pcs">pcs</option>
                        <option value="kg">kg</option>
                        <option value="m">m</option>
                        <option value="l">l</option>
                        <option value="set">set</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.supplier}
                        onChange={(e) => handleItemChange(item.id, 'supplier', e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Supplier"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors text-red-600 dark:text-red-400"
                        title="Delete"
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

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 hover:shadow-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save BOM'}
          </button>
          <button
            onClick={() => navigate('/design-engineer/bom/view')}
            className="inline-flex items-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBOMPage;
