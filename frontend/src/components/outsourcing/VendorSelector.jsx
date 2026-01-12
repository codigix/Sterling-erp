import React, { useState } from 'react';
import { AlertCircle, Check, Loader } from 'lucide-react';
import axios from '../../utils/api';
import Badge from '../ui/Badge';

const VendorSelector = ({ task, vendors, onVendorSelected }) => {
  const [selectedVendor, setSelectedVendor] = useState(task.selected_vendor_id || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectVendor = async (vendorId) => {
    try {
      setLoading(true);
      setError('');
      await axios.post(`/production/outsourcing/tasks/${task.id}/select-vendor`, {
        vendorId
      });
      setSelectedVendor(vendorId);
      if (onVendorSelected) onVendorSelected();
    } catch (err) {
      console.error('Error selecting vendor:', err);
      setError('Failed to select vendor');
    } finally {
      setLoading(false);
    }
  };

  if (!vendors || vendors.length === 0) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-yellow-800 dark:text-yellow-200">
        <AlertCircle className="w-5 h-5 inline mr-2" />
        No vendors available. Please add vendors first.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          Select a Vendor for Outsourcing
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Choose the vendor who will handle this production phase.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {vendors.map((vendor) => (
          <button
            key={vendor.id}
            onClick={() => handleSelectVendor(vendor.id)}
            disabled={loading}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedVendor === vendor.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-white">{vendor.name}</h4>
                <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  {vendor.contact && <p>Contact: {vendor.contact}</p>}
                  {vendor.email && <p>Email: {vendor.email}</p>}
                  {vendor.category && <p>Category: {vendor.category}</p>}
                </div>
                {vendor.rating && (
                  <div className="mt-2">
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      ★ {vendor.rating.toFixed(1)}
                    </Badge>
                  </div>
                )}
              </div>
              {selectedVendor === vendor.id && (
                <Check className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              )}
            </div>
          </button>
        ))}
      </div>

      {selectedVendor && (
        <button
          onClick={() => handleSelectVendor(selectedVendor)}
          disabled={loading}
          className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader className="w-4 h-4 animate-spin" />}
          {loading ? 'Confirming...' : 'Confirm Vendor Selection'}
        </button>
      )}
    </div>
  );
};

export default VendorSelector;
