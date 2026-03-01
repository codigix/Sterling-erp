import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader, CheckCircle } from 'lucide-react';
import axios from '../../utils/api';

const InwardChallanForm = ({ operation, onChallanCreated }) => {
  const [formData, setFormData] = useState({
    quantityReceived: operation?.dispatched_qty || 0,
    acceptedQty: operation?.dispatched_qty || 0,
    rejectedQty: 0,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdateField = (field, value) => {
    const numValue = parseFloat(value) || 0;
    
    if (field === 'quantityReceived') {
      setFormData({
        ...formData,
        quantityReceived: numValue,
        acceptedQty: numValue,
        rejectedQty: 0
      });
    } else if (field === 'acceptedQty') {
      const rejected = Math.max(0, formData.quantityReceived - numValue);
      setFormData({
        ...formData,
        acceptedQty: numValue,
        rejectedQty: rejected
      });
    } else if (field === 'rejectedQty') {
      const accepted = Math.max(0, formData.quantityReceived - numValue);
      setFormData({
        ...formData,
        rejectedQty: numValue,
        acceptedQty: accepted
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.quantityReceived <= 0) {
      setError('Received quantity must be greater than zero');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await axios.post(`/production/outsourcing/job-card/${operation.id}/inward-challan`, {
        receivedQty: formData.quantityReceived,
        acceptedQty: formData.acceptedQty,
        rejectedQty: formData.rejectedQty,
        notes: formData.notes
      });

      setSuccess('Inward challan created successfully!');
      setTimeout(() => {
        if (onChallanCreated) onChallanCreated();
      }, 1500);
    } catch (err) {
      console.error('Error creating inward challan:', err);
      setError(err.response?.data?.message || 'Failed to create inward challan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-700 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dispatched</div>
          <div className="text-xl font-black text-slate-700">
            {parseFloat(operation?.dispatched_qty || 0).toFixed(6)} <span className="text-sm font-medium text-slate-400">units</span>
          </div>
        </div>
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
          <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-1 text-right">Pending Receipt</div>
          <div className="text-xl font-black text-indigo-600 text-right">
            {parseFloat(operation?.dispatched_qty || 0).toFixed(0)} <span className="text-sm font-medium text-indigo-400">units</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[12px] font-bold text-slate-600 uppercase mb-2">
            Quantity Received
          </label>
          <input
            type="number"
            step="any"
            value={formData.quantityReceived}
            onChange={(e) => handleUpdateField('quantityReceived', e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            placeholder="Enter quantity received..."
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-600 uppercase mb-2">
              <CheckCircle size={14} /> Accepted Qty
            </label>
            <input
              type="number"
              step="any"
              value={formData.acceptedQty}
              onChange={(e) => handleUpdateField('acceptedQty', e.target.value)}
              className="w-full px-4 py-3 bg-emerald-50/30 border border-emerald-100 rounded-xl text-emerald-700 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              disabled={loading}
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-[12px] font-bold text-rose-600 uppercase mb-2">
              <AlertCircle size={14} /> Rejected Qty
            </label>
            <input
              type="number"
              step="any"
              value={formData.rejectedQty}
              onChange={(e) => handleUpdateField('rejectedQty', e.target.value)}
              className="w-full px-4 py-3 bg-rose-50/30 border border-rose-100 rounded-xl text-rose-700 font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all outline-none"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-[12px] font-bold text-slate-600 uppercase mb-2">
            <FileText size={14} className="text-slate-400" /> Receipt Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleUpdateField('notes', e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
            placeholder="Notes about quality or delivery..."
            rows="3"
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
          Update Next Operation
        </button>
      </div>
    </form>
  );
};

// Simplified FileText icon replacement since lucide-react might not have it in the scope if I don't import it
const FileText = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

export default InwardChallanForm;
