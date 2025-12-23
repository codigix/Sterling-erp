import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Edit2, Eye, CheckCircle, Clock, AlertCircle, Trash2, Filter } from 'lucide-react';
import axios from '../../utils/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import '../../styles/TaskPage.css';

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

const MaterialRequestPage = () => {
  const [materialRequests, setMaterialRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [showNewForm, setShowNewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showVendorModal, setShowVendorModal] = useState(false);

  const [formData, setFormData] = useState({
    salesOrderId: '',
    materialName: '',
    materialCode: '',
    quantity: '',
    unit: 'Nos',
    specification: '',
    requiredDate: '',
    priority: 'medium',
    remarks: ''
  });

  const [vendorData, setVendorData] = useState({
    vendorId: '',
    quotedPrice: '',
    deliveryDays: '',
    notes: ''
  });

  const fetchMaterialRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/procurement/material-requests', { __sessionGuard: true });
      setMaterialRequests(response.data.materialRequests || []);
      setStats(response.data.stats || {});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load material requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaterialRequests();
  }, [fetchMaterialRequests]);

  const filteredRequests = useMemo(() => {
    if (activeTab === 'all') {
      return materialRequests;
    }
    return materialRequests.filter((req) => req.status === activeTab);
  }, [materialRequests, activeTab]);

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      ordered: 'bg-indigo-100 text-indigo-800',
      received: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVendorChange = (e) => {
    const { name, value } = e.target;
    setVendorData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();

    if (!formData.salesOrderId || !formData.materialName || !formData.quantity) {
      setError('Sales Order ID, material name, and quantity are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post(
        '/api/procurement/material-requests',
        {
          salesOrderId: Number(formData.salesOrderId),
          materialName: formData.materialName.trim(),
          materialCode: formData.materialCode || null,
          quantity: Number(formData.quantity),
          unit: formData.unit,
          specification: formData.specification || null,
          requiredDate: formData.requiredDate || null,
          priority: formData.priority,
          remarks: formData.remarks || null
        },
        { __sessionGuard: true }
      );

      setFormData({
        salesOrderId: '',
        materialName: '',
        materialCode: '',
        quantity: '',
        unit: 'Nos',
        specification: '',
        requiredDate: '',
        priority: 'medium',
        remarks: ''
      });
      setShowNewForm(false);
      fetchMaterialRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create material request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddVendor = async (requestId) => {
    if (!vendorData.vendorId) {
      setError('Vendor is required');
      return;
    }

    try {
      await axios.post(
        `/api/procurement/material-requests/${requestId}/vendors`,
        {
          vendorId: Number(vendorData.vendorId),
          quotedPrice: vendorData.quotedPrice ? Number(vendorData.quotedPrice) : null,
          deliveryDays: vendorData.deliveryDays ? Number(vendorData.deliveryDays) : null,
          notes: vendorData.notes || null
        },
        { __sessionGuard: true }
      );

      setVendorData({
        vendorId: '',
        quotedPrice: '',
        deliveryDays: '',
        notes: ''
      });
      setShowVendorModal(false);
      fetchMaterialRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vendor quote');
    }
  };

  const handleDeleteRequest = async (id) => {
    if (window.confirm('Are you sure you want to delete this material request?')) {
      try {
        await axios.delete(`/api/procurement/material-requests/${id}`, { __sessionGuard: true });
        fetchMaterialRequests();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete material request');
      }
    }
  };

  return (
    <div className="task-page-container">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Requests</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stats.total || 0}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Draft</p>
            <p className="text-2xl font-bold text-gray-600 mt-1">{stats.draft || 0}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Approved</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved || 0}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Ordered</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.ordered || 0}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Received</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.received || 0}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">Submitted</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.submitted || 0}</p>
          </div>
        </Card>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-2">
          {['all', 'draft', 'submitted', 'approved', 'ordered', 'received'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700  dark: hover:'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center text-xs gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          New Request
        </button>
      </div>

      {showNewForm && (
        <Card className="mb-6">
          <div className="p-6 border-b">
            <h3 className="text-md font-semibold  dark:">Create Material Request</h3>
          </div>
          <form onSubmit={handleCreateRequest} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sales Order ID</label>
                <input
                  type="number"
                  name="salesOrderId"
                  value={formData.salesOrderId}
                  onChange={handleFormChange}
                  placeholder="Enter sales order ID"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Material Name</label>
                <input
                  type="text"
                  name="materialName"
                  value={formData.materialName}
                  onChange={handleFormChange}
                  placeholder="Enter material name"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Code</label>
                <input
                  type="text"
                  name="materialCode"
                  value={formData.materialCode}
                  onChange={handleFormChange}
                  placeholder="Material code"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleFormChange}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                >
                  <option value="Nos">Nos</option>
                  <option value="Kg">Kg</option>
                  <option value="Meter">Meter</option>
                  <option value="Liter">Liter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Specification</label>
              <textarea
                name="specification"
                value={formData.specification}
                onChange={handleFormChange}
                placeholder="Material specifications"
                rows="3"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Required Date</label>
                <input
                  type="date"
                  name="requiredDate"
                  value={formData.requiredDate}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Remarks</label>
                <input
                  type="text"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleFormChange}
                  placeholder="Additional remarks"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700  dark: hover: transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Request'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">Loading material requests...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Material</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Code</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Quantity</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Priority</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50 dark:hover: transition-colors">
                  <td className="p-1 text-sm text-slate-700 dark:text-slate-300">{request.material_name}</td>
                  <td className="p-1 text-sm text-slate-700 dark:text-slate-300">{request.material_code || '-'}</td>
                  <td className="p-1 text-sm text-slate-700 dark:text-slate-300">
                    {request.quantity} {request.unit}
                  </td>
                  <td className="p-1 text-sm">
                    <Badge className={request.priority === 'urgent' ? 'bg-red-100 text-red-800' : request.priority === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}>
                      {request.priority}
                    </Badge>
                  </td>
                  <td className="p-1 text-sm">
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </td>
                  <td className="p-1 text-sm flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowVendorModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Add vendor quote"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(request.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRequests.length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              No material requests found
            </div>
          )}
        </div>
      )}

      {showVendorModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center text-xs justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-md font-semibold  dark:">
                Add Vendor Quote - {selectedRequest.material_name}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vendor ID</label>
                <input
                  type="number"
                  name="vendorId"
                  value={vendorData.vendorId}
                  onChange={handleVendorChange}
                  placeholder="Enter vendor ID"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quoted Price</label>
                <input
                  type="number"
                  step="0.01"
                  name="quotedPrice"
                  value={vendorData.quotedPrice}
                  onChange={handleVendorChange}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Delivery Days</label>
                <input
                  type="number"
                  name="deliveryDays"
                  value={vendorData.deliveryDays}
                  onChange={handleVendorChange}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={vendorData.notes}
                  onChange={handleVendorChange}
                  placeholder="Additional notes"
                  rows="2"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  onClick={() => {
                    setShowVendorModal(false);
                    setSelectedRequest(null);
                    setVendorData({ vendorId: '', quotedPrice: '', deliveryDays: '', notes: '' });
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700  dark:"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAddVendor(selectedRequest.id)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add Quote
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MaterialRequestPage;
