import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, X, Loader } from 'lucide-react';
import axios from '../../utils/api';
import Badge from '../ui/Badge';

const InwardChallanForm = ({ task, onChallanCreated }) => {
  const [formData, setFormData] = useState({
    receivedDate: new Date().toISOString().split('T')[0],
    qualityStatus: 'pending_inspection',
    inspectionNotes: '',
    notes: ''
  });
  const [outwardChallan, setOutwardChallan] = useState(null);
  const [outwardItems, setOutwardItems] = useState([]);
  const [inwardItems, setInwardItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchOutwardChallanDetails();
  }, [task]);

  const fetchOutwardChallanDetails = async () => {
    try {
      setLoading(true);
      const challanResponse = await axios.get(
        `/production/outsourcing/tasks/${task.id}`
      );

      if (challanResponse.data.data.outwardChallans && challanResponse.data.data.outwardChallans.length > 0) {
        const challan = challanResponse.data.data.outwardChallans[0];
        setOutwardChallan(challan);

        const itemsResponse = await axios.get(
          `/production/outsourcing/outward-challan/${challan.id}`
        );
        setOutwardItems(itemsResponse.data.data.items || []);

        const initialInwardItems = (itemsResponse.data.data.items || []).map(item => ({
          outwardChallanItemId: item.id,
          materialId: item.material_id,
          itemName: item.item_name,
          itemCode: item.item_code,
          expectedQuantity: item.quantity,
          quantityReceived: item.quantity,
          quantityRejected: 0,
          quantityScrap: 0,
          unit: item.unit,
          qualityStatus: 'pending_inspection',
          remarks: ''
        }));
        setInwardItems(initialInwardItems);
        setError('');
      } else {
        setError('No outward challan found for this task');
      }
    } catch (err) {
      console.error('Error fetching outward challan:', err);
      setError('Failed to load outward challan details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = (index, field, value) => {
    const updated = [...inwardItems];
    updated[index][field] = value;
    setInwardItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!outwardChallan) {
      setError('No outward challan found');
      return;
    }

    if (inwardItems.length === 0) {
      setError('Please add at least one material receipt');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await axios.post(
        `/production/outsourcing/outward-challan/${outwardChallan.id}/inward-challan`,
        {
          receivedDate: formData.receivedDate,
          qualityStatus: formData.qualityStatus,
          inspectionNotes: formData.inspectionNotes,
          notes: formData.notes,
          items: inwardItems
        }
      );

      setSuccess('Inward challan created successfully!');
      setTimeout(() => {
        if (onChallanCreated) onChallanCreated();
      }, 1500);
    } catch (err) {
      console.error('Error creating inward challan:', err);
      setError(err.response?.data?.message || 'Failed to create inward challan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-slate-600 dark:text-slate-400">Loading outward challan details...</p>
      </div>
    );
  }

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

      {outwardChallan && (
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Outward Challan Reference</p>
          <p className="font-semibold text-slate-900 dark:text-white">{outwardChallan.challan_number}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Sent to: {outwardChallan.vendor_name}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
            Received Date *
          </label>
          <input
            type="date"
            required
            value={formData.receivedDate}
            onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            disabled={submitting}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
            Overall Quality Status
          </label>
          <select
            value={formData.qualityStatus}
            onChange={(e) => setFormData({ ...formData, qualityStatus: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            disabled={submitting}
          >
            <option value="pending_inspection">Pending Inspection</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
          Inspection Notes
        </label>
        <textarea
          value={formData.inspectionNotes}
          onChange={(e) => setFormData({ ...formData, inspectionNotes: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          rows="2"
          placeholder="Any inspection observations..."
          disabled={submitting}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
          Additional Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          rows="2"
          disabled={submitting}
        />
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">Materials Received</h4>

        {inwardItems.length === 0 ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-yellow-800 dark:text-yellow-200">
            <AlertCircle className="w-5 h-5 inline mr-2" />
            No materials to receive.
          </div>
        ) : (
          <div className="space-y-3">
            {inwardItems.map((item, index) => (
              <div
                key={index}
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800"
              >
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  <div className="md:col-span-1">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase mb-1">Material</p>
                    <p className="font-medium text-slate-900 dark:text-white">{item.itemName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.itemCode}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase mb-1">Issued</p>
                    <p className="text-slate-900 dark:text-white font-medium">
                      {item.expectedQuantity} {item.unit}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase mb-1 block">
                      Received *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={item.quantityReceived}
                      onChange={(e) => handleUpdateItem(index, 'quantityReceived', parseFloat(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase mb-1 block">
                      Rejected
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={item.quantityRejected}
                      onChange={(e) => handleUpdateItem(index, 'quantityRejected', parseFloat(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase mb-1 block">
                      Scrap
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={item.quantityScrap}
                      onChange={(e) => handleUpdateItem(index, 'quantityScrap', parseFloat(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase mb-1 block">
                      Quality
                    </label>
                    <select
                      value={item.qualityStatus}
                      onChange={(e) => handleUpdateItem(index, 'qualityStatus', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm"
                      disabled={submitting}
                    >
                      <option value="pending_inspection">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase mb-1 block">
                    Remarks
                  </label>
                  <input
                    type="text"
                    value={item.remarks}
                    onChange={(e) => handleUpdateItem(index, 'remarks', e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm"
                    placeholder="Add any remarks..."
                    disabled={submitting}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="submit"
          disabled={submitting || inwardItems.length === 0}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting && <Loader className="w-4 h-4 animate-spin" />}
          {submitting ? 'Creating...' : 'Create Inward Challan'}
        </button>
      </div>
    </form>
  );
};

export default InwardChallanForm;
