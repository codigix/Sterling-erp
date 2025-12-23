import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Upload, Download, CheckCircle, Clock, AlertCircle, Eye, Edit2, Trash2 } from 'lucide-react';
import axios from '../../utils/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import '../../styles/TaskPage.css';

const EngineeringTasksPage = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('documents');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showBOMForm, setShowBOMForm] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    documentType: 'qap',
    documentName: '',
    file: null
  });

  const [bomForm, setBomForm] = useState({
    bomName: '',
    description: '',
    lineItems: [{ itemCode: '', itemDescription: '', quantity: 1, unit: 'Nos', unitCost: 0, partType: 'raw_material' }]
  });

  const fetchSalesOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/sales/orders', { __sessionGuard: true });
      setSalesOrders(response.data.orders || []);
      if (response.data.orders && response.data.orders.length > 0) {
        setSelectedSalesOrder(response.data.orders[0].id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load sales orders');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    if (!selectedSalesOrder) return;
    try {
      const response = await axios.get('/api/engineering/documents', {
        params: { salesOrderId: selectedSalesOrder },
        __sessionGuard: true
      });
      setDocuments(response.data || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  }, [selectedSalesOrder]);

  const fetchBOMs = useCallback(async () => {
    if (!selectedSalesOrder) return;
    try {
      const response = await axios.get('/api/engineering/bom', {
        params: { salesOrderId: selectedSalesOrder },
        __sessionGuard: true
      });
      setBoms(response.data || []);
    } catch (err) {
      console.error('Failed to fetch BOMs:', err);
    }
  }, [selectedSalesOrder]);

  useEffect(() => {
    fetchSalesOrders();
  }, [fetchSalesOrders]);

  useEffect(() => {
    fetchDocuments();
    fetchBOMs();
  }, [selectedSalesOrder, fetchDocuments, fetchBOMs]);

  const handleUploadChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      setUploadForm(prev => ({ ...prev, file: e.target.files[0] }));
    } else {
      setUploadForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) {
      setError('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('salesOrderId', selectedSalesOrder);
    formData.append('documentType', uploadForm.documentType);
    formData.append('documentName', uploadForm.documentName || uploadForm.file.name);
    formData.append('document', uploadForm.file);

    try {
      await axios.post('/api/engineering/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        __sessionGuard: true
      });
      setUploadForm({ documentType: 'qap', documentName: '', file: null });
      setShowUploadForm(false);
      fetchDocuments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document');
    }
  };

  const handleBOMLineChange = (index, field, value) => {
    setBomForm(prev => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addLineItem = () => {
    setBomForm(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { itemCode: '', itemDescription: '', quantity: 1, unit: 'Nos', unitCost: 0, partType: 'raw_material' }]
    }));
  };

  const removeBOMLineItem = (index) => {
    if (bomForm.lineItems.length === 1) return;
    setBomForm(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  };

  const handleGenerateBOM = async (e) => {
    e.preventDefault();
    if (!bomForm.bomName || bomForm.lineItems.length === 0) {
      setError('Please provide BOM name and at least one line item');
      return;
    }

    try {
      await axios.post('/api/engineering/bom/generate', {
        salesOrderId: selectedSalesOrder,
        bomName: bomForm.bomName,
        description: bomForm.description,
        lineItems: bomForm.lineItems.filter(item => item.itemCode && item.itemDescription)
      }, { __sessionGuard: true });

      setBomForm({ bomName: '', description: '', lineItems: [{ itemCode: '', itemDescription: '', quantity: 1, unit: 'Nos', unitCost: 0, partType: 'raw_material' }] });
      setShowBOMForm(false);
      fetchBOMs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate BOM');
    }
  };

  const getDocumentTypeLabel = (type) => {
    const labels = {
      qap: 'QAP/ATP',
      pd: 'PD Document',
      drawing: 'Drawing',
      fea: 'FEA Analysis',
      other: 'Other'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft':
      case 'pending_approval':
        return <Clock size={16} />;
      case 'approved':
        return <CheckCircle size={16} />;
      case 'rejected':
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="task-page-container">
        <div className="text-center py-12">Loading engineering tasks...</div>
      </div>
    );
  }

  return (
    <div className="task-page-container">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-4 text-red-600 hover:text-red-700">×</button>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium  dark: mb-2">
          Select Sales Order
        </label>
        <select
          value={selectedSalesOrder || ''}
          onChange={(e) => setSelectedSalesOrder(Number(e.target.value))}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:"
        >
          {salesOrders.map(order => (
            <option key={order.id} value={order.id}>
              SO-{String(order.id).padStart(4, '0')} - {order.customer}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('documents')}
          className={`p-2 font-medium border-b-2 transition-colors ${
            activeTab === 'documents'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:'
          }`}
        >
          Documents
        </button>
        <button
          onClick={() => setActiveTab('bom')}
          className={`p-2 font-medium border-b-2 transition-colors ${
            activeTab === 'bom'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:'
          }`}
        >
          Bill of Materials
        </button>
      </div>

      {activeTab === 'documents' && (
        <div className="space-y-6">
          {!showUploadForm && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="flex items-center text-xs gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Upload size={18} />
              Upload Document
            </button>
          )}

          {showUploadForm && (
            <Card className="mb-6 p-6">
              <h3 className="text-lg font-bold  dark: mb-4">Upload Engineering Document</h3>
              <form onSubmit={handleUploadDocument} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Document Type
                    </label>
                    <select
                      name="documentType"
                      value={uploadForm.documentType}
                      onChange={handleUploadChange}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:"
                    >
                      <option value="qap">QAP/ATP</option>
                      <option value="pd">PD Document</option>
                      <option value="drawing">Drawing</option>
                      <option value="fea">FEA Analysis</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Document Name
                    </label>
                    <input
                      type="text"
                      name="documentName"
                      value={uploadForm.documentName}
                      onChange={handleUploadChange}
                      placeholder="Optional - defaults to filename"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Select File
                  </label>
                  <input
                    type="file"
                    onChange={handleUploadChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="px-4 py-2 rounded-lg  dark:bg-slate-600  dark: hover:bg-slate-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Card>
          )}

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">Document Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">Uploaded By</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-6 text-center text-sm text-slate-500">
                        No documents uploaded for this sales order
                      </td>
                    </tr>
                  )}
                  {documents.map(doc => (
                    <tr key={doc.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition-colors">
                      <td className="p-1 text-sm font-medium  dark:">{doc.document_name}</td>
                      <td className="p-1 text-sm text-slate-700 dark:text-slate-300">{getDocumentTypeLabel(doc.document_type)}</td>
                      <td className="p-1 text-sm text-slate-700 dark:text-slate-300">{doc.uploaded_by_name}</td>
                      <td className="p-1">
                        <Badge className={`flex items-center text-xs gap-1 w-fit ${getStatusColor(doc.status)}`}>
                          {getStatusIcon(doc.status)}
                          {doc.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="p-1">
                        <div className="flex gap-2">
                          <button className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700  dark: hover: transition-colors">
                            <Download size={16} />
                          </button>
                          <button className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 transition-colors">
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'bom' && (
        <div className="space-y-6">
          {!showBOMForm && (
            <button
              onClick={() => setShowBOMForm(true)}
              className="flex items-center text-xs gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Generate BOM
            </button>
          )}

          {showBOMForm && (
            <Card className="mb-6 p-6">
              <h3 className="text-lg font-bold  dark: mb-4">Generate Bill of Materials</h3>
              <form onSubmit={handleGenerateBOM} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      BOM Name
                    </label>
                    <input
                      type="text"
                      value={bomForm.bomName}
                      onChange={(e) => setBomForm(prev => ({ ...prev, bomName: e.target.value }))}
                      placeholder="e.g., Assembly - Main Unit"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={bomForm.description}
                    onChange={(e) => setBomForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional BOM description"
                    rows="3"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700  dark:"
                  />
                </div>

                <div>
                  <div className="flex items-center text-xs justify-between mb-3">
                    <h4 className="text-md font-semibold  dark:">Line Items</h4>
                    <button
                      type="button"
                      onClick={addLineItem}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      + Add Line
                    </button>
                  </div>
                  <div className="space-y-3">
                    {bomForm.lineItems.map((item, index) => (
                      <div key={`line-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end p-3 border border-slate-200 dark:border-slate-600 rounded-lg">
                        <div className="md:col-span-3">
                          <label className="text-xs text-slate-500">Item Code</label>
                          <input
                            type="text"
                            value={item.itemCode}
                            onChange={(e) => handleBOMLineChange(index, 'itemCode', e.target.value)}
                            placeholder="Item code"
                            className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700  dark: text-sm"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="text-xs text-slate-500">Description</label>
                          <input
                            type="text"
                            value={item.itemDescription}
                            onChange={(e) => handleBOMLineChange(index, 'itemDescription', e.target.value)}
                            placeholder="Item description"
                            className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700  dark: text-sm"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <label className="text-xs text-slate-500">Qty</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleBOMLineChange(index, 'quantity', Number(e.target.value))}
                            min="1"
                            className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700  dark: text-sm"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs text-slate-500">Unit Cost</label>
                          <input
                            type="number"
                            value={item.unitCost}
                            onChange={(e) => handleBOMLineChange(index, 'unitCost', Number(e.target.value))}
                            step="0.01"
                            className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700  dark: text-sm"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs text-slate-500">Type</label>
                          <select
                            value={item.partType}
                            onChange={(e) => handleBOMLineChange(index, 'partType', e.target.value)}
                            className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700  dark: text-sm"
                          >
                            <option value="raw_material">Raw Material</option>
                            <option value="component">Component</option>
                            <option value="assembly">Assembly</option>
                          </select>
                        </div>
                        <div className="md:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeBOMLineItem(index)}
                            disabled={bomForm.lineItems.length === 1}
                            className="p-1 text-red-600 disabled:text-slate-400 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Generate BOM
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBOMForm(false)}
                    className="px-4 py-2 rounded-lg  dark:bg-slate-600  dark: hover:bg-slate-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Card>
          )}

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">BOM Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">Items</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold  dark:">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {boms.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-6 text-center text-sm text-slate-500">
                        No BOMs generated for this sales order
                      </td>
                    </tr>
                  )}
                  {boms.map(bom => (
                    <tr key={bom.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition-colors">
                      <td className="p-1 text-sm font-medium  dark:">{bom.bom_name}</td>
                      <td className="p-1 text-sm text-slate-700 dark:text-slate-300">View Details</td>
                      <td className="p-1">
                        <Badge className={`flex items-center text-xs gap-1 w-fit ${getStatusColor(bom.status)}`}>
                          {bom.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="p-1">
                        <div className="flex gap-2">
                          <button className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700  dark: hover: transition-colors">
                            <Eye size={16} />
                          </button>
                          <button className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 transition-colors">
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EngineeringTasksPage;
