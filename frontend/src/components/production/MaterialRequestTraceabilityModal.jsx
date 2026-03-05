import React, { useState, useEffect } from "react";
import { X, Bell, Package, Calendar, User, Clock, CheckCircle, AlertCircle, Loader2, ClipboardList, Info } from "lucide-react";
import axios from "../../utils/api";

const MaterialRequestTraceabilityModal = ({ isOpen, onClose, planId, planName }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && planId) {
      fetchMaterialRequests();
    }
  }, [isOpen, planId]);

  const fetchMaterialRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/inventory/material-requests/production-plan/${planId}`);
      setRequests(response.data.materialRequests || []);
    } catch (err) {
      console.error("Error fetching material requests for plan:", err);
      setError("Failed to load material requests history.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "received":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      case "approved":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "pending":
      case "submitted":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "draft":
        return "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200 dark:border-slate-800";
      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    }
  };

  const activeRequests = requests.filter(r => r.status !== 'completed' && r.status !== 'received' && r.status !== 'cancelled' && r.status !== 'rejected');
  const completedRequests = requests.filter(r => r.status === 'completed' || r.status === 'received');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <ClipboardList size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Request Traceability History</h2>
              <div className="flex items-center gap-2">
                <Info size={12} className="text-purple-500" />
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Linked Material Requests for Plan: {planName || `PP-${planId}`}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={40} className="text-purple-500 animate-spin mb-4" />
              <p className="text-sm font-medium text-slate-500">Loading traceability data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <p className="text-slate-900 dark:text-white font-bold">{error}</p>
              <button 
                onClick={fetchMaterialRequests}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold"
              >
                Retry
              </button>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Package size={40} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Material Requests</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                No material requests have been initiated for this production plan yet.
              </p>
            </div>
          ) : (
            <>
              {/* Active Requests Section */}
              {activeRequests.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-amber-500" />
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Active Requests</h3>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-full">
                      {activeRequests.length}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {activeRequests.map((req) => (
                      <RequestCard key={req.id} request={req} getStatusColor={getStatusColor} />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Archive Section */}
              {completedRequests.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-500" />
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">Completed Archive</h3>
                    </div>
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-bold rounded-full">
                      {completedRequests.length}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {completedRequests.map((req) => (
                      <RequestCard key={req.id} request={req} getStatusColor={getStatusColor} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-black transition-all text-xs border border-slate-800 shadow-lg shadow-slate-900/20"
          >
            Close Archive
          </button>
        </div>
      </div>
    </div>
  );
};

const RequestCard = ({ request, getStatusColor }) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-400">
            {request.id}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              {request.mr_number}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              Requested: {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${getStatusColor(request.status)}`}>
          {request.status}
        </span>
      </div>
      
      <div className="p-4 bg-white/50 dark:bg-slate-800/20">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item Details</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requested Qty</span>
        </div>
        
        <div className="space-y-3">
          {request.items && request.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between group">
              <div>
                <p className="text-[13px] font-bold text-slate-900 dark:text-white flex items-center flex-wrap">
                  {item.material_name || item.materialName || item.itemName || item.specification || 'Item Details Not Set'}
                  {(item.material_code || item.materialCode || item.item_code || item.itemCode) && (
                    <span className="ml-2 text-slate-500 font-medium text-[11px]">
                      ({item.material_code || item.materialCode || item.item_code || item.itemCode})
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {parseFloat(item.quantity).toLocaleString()} {item.unit}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MaterialRequestTraceabilityModal;
