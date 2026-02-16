import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Edit, 
  CheckCircle, 
  Clock, 
  Truck, 
  Package, 
  User, 
  Calendar, 
  DollarSign, 
  MapPin, 
  CreditCard, 
  FileText,
  ChevronRight,
  MoreVertical,
  Trash2,
  ExternalLink,
  Shield
} from "lucide-react";
import axios from "../../utils/api";
import Swal from "sweetalert2";
import toastUtils from "../../utils/toastUtils";

import CreatePurchaseOrderModal from "./CreatePurchaseOrderModal";
import CreateGRNRequestModal from "./CreateGRNRequestModal";

const PurchaseOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGRNModal, setShowGRNModal] = useState(false);

  const fetchPODetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/inventory/purchase-orders/${id}`);
      let data = response.data;
      
      if (!data) {
        throw new Error("No data received from server");
      }

      // Handle nested response if it exists
      if (data.purchaseOrder) {
        data = data.purchaseOrder;
      }
      
      // Handle items parsing if it's a string
      if (data && data.items && typeof data.items === 'string') {
        try {
          data.items = JSON.parse(data.items);
        } catch (e) {
          console.error("Error parsing items:", e);
          data.items = [];
        }
      } else if (data && !data.items) {
        data.items = [];
      }
      
      setPo(data);
    } catch (error) {
      console.error("Error fetching PO details:", error);
      toastUtils.error("Failed to load Purchase Order details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPODetails();
  }, [id, fetchPODetails]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await axios.patch(`/inventory/purchase-orders/${id}/status`, { status: newStatus });
      toastUtils.success(`PO status updated to ${newStatus}`);
      fetchPODetails();
    } catch (error) {
      console.error("Error updating PO status:", error);
      toastUtils.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!po) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Purchase Order not found</h2>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  const getStatusStep = (status) => {
    const s = status?.toLowerCase() || "draft";
    if (s === "draft") return 0;
    if (s === "submitted" || s === "pending" || s === "ordered" || s === "approved") return 1;
    if (s === "goods arrival" || s === "received" || s === "delivered") return 2;
    if (s === "fulfilled") return 3;
    return 0;
  };

  const currentStep = getStatusStep(po.status || "draft");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      {/* Breadcrumbs & Actions Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                <span>Buying</span>
                <ChevronRight size={12} />
                <span>Purchase Orders</span>
                <ChevronRight size={12} />
                <span className="text-blue-600">{po.po_number}</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                  {po.po_number}
                </h1>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  po.status === 'draft' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                  po.status === 'submitted' ? 'bg-blue-100 text-blue-600 border-blue-200' :
                  po.status === 'goods arrival' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                  'bg-emerald-100 text-emerald-600 border-emerald-200'
                }`}>
                  {po.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <button className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 border-r border-slate-200 dark:border-slate-700">
                <Printer size={18} />
              </button>
              <button className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50">
                <Download size={18} />
              </button>
            </div>
            {po.status === 'draft' && (
              <button 
                onClick={() => {
                  navigate(`/inventory-manager/purchase-orders/edit/${po.id}`);
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-blue-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 shadow-sm"
              >
                <Edit size={16} /> Edit
              </button>
            )}
            {po.status === 'draft' && (
              <button 
                onClick={() => handleStatusUpdate('submitted')}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-blue-700 shadow-lg shadow-blue-500/25"
              >
                <CheckCircle size={16} /> Submit Order
              </button>
            )}
            {po.status === 'submitted' && (
              <button 
                onClick={() => handleStatusUpdate('approved')}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 shadow-lg shadow-emerald-500/25"
              >
                <CheckCircle size={16} /> Approve Order
              </button>
            )}
            {(po.status === 'approved' || po.status === 'delivered' || po.status === 'received' || po.status === 'submitted') && (
              <button 
                onClick={() => setShowGRNModal(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-blue-700 shadow-lg shadow-blue-500/25"
              >
                <Package size={16} /> Receive Material
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Status Timeline Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
              <div className="relative flex justify-between">
                {/* Connector Line */}
                <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -z-0"></div>
                <div 
                  className="absolute top-5 left-0 h-0.5 bg-blue-500 transition-all duration-500 -z-0"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>

                {/* Steps */}
                {[
                  { label: "Draft", icon: Clock },
                  { label: "Submitted", icon: FileText },
                  { label: "Goods Arrival", icon: Truck },
                  { label: "Fulfilled", icon: CheckCircle }
                ].map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = idx < currentStep;
                  const isActive = idx === currentStep;
                  
                  return (
                    <div key={idx} className="relative z-10 flex flex-col items-center group">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted ? "bg-blue-500 text-white" : 
                        isActive ? "bg-white dark:bg-slate-800 border-2 border-blue-500 text-blue-500 shadow-lg shadow-blue-500/20" : 
                        "bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 text-slate-300"
                      }`}>
                        {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                      </div>
                      <span className={`mt-3 text-[10px] font-bold uppercase tracking-widest ${
                        isActive ? "text-blue-600" : "text-slate-400"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 text-slate-50 dark:text-slate-800/50 -mr-4 -mt-4 transform rotate-12 transition-transform group-hover:rotate-6">
                  <Package size={80} />
                </div>
                <div className="relative">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Supplier</p>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                      <Truck size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white leading-tight">
                        {po.vendor_name || "Active Vendor"}
                      </h3>
                      <p className="text-xs text-slate-500">Active Status</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg uppercase tracking-wider hover:bg-blue-100 transition-colors w-fit">
                      Ship to Main Warehouse
                    </button>
                    {po.material_request_id ? (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wider border border-purple-200 dark:border-purple-800">
                          From Material Request: #{po.mr_number}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800">
                          Quotation Flow
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 text-slate-50 dark:text-slate-800/50 -mr-4 -mt-4 transform rotate-12 transition-transform group-hover:rotate-6">
                  <DollarSign size={80} />
                </div>
                <div className="relative">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Value</p>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">
                    ₹{(po.total_amount || 0).toLocaleString()}
                  </h2>
                  <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                    <Shield size={12} /> incl. all taxes
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 text-slate-50 dark:text-slate-800/50 -mr-4 -mt-4 transform rotate-12 transition-transform group-hover:rotate-6">
                  <Calendar size={80} />
                </div>
                <div className="relative">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Expected By</p>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {po.expected_delivery_date ? new Date(po.expected_delivery_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "Not Specified"}
                  </h2>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-600 text-[10px] font-bold uppercase tracking-widest">
                    <Clock size={12} /> TBD
                  </div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-50 dark:border-slate-800">
                  <MapPin size={18} className="text-blue-500" />
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Shipping Details</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Address</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white text-right max-w-[200px]">
                      No address specified
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Incoterm</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-[10px] font-bold uppercase">EXW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Shipping Rule</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Standard</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-50 dark:border-slate-800">
                  <CreditCard size={18} className="text-blue-500" />
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payment & Others</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tax Category</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-[10px] font-bold uppercase">GST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Currency</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{po.currency || 'INR'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Notes</span>
                    <span className="text-xs font-medium text-slate-400 italic">No notes added</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items List Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-blue-500" />
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Items List</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {po.items?.length || 0} Items
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800">
                      <th className="px-6 py-4">Item</th>
                      <th className="px-6 py-4 text-center">Quantity</th>
                      <th className="px-6 py-4 text-center">Received</th>
                      <th className="px-6 py-4 text-center">Rate</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {po.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                              {item.material_name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {item.material_code || "No Code"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {Number(item.quantity || 0).toFixed(2)} {item.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-medium text-slate-400">0.00 {item.unit}</span>
                            <div className="w-20 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="w-0 h-full bg-emerald-500"></div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">0%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-xs font-bold text-slate-700 dark:text-slate-300">
                          ₹{(item.rate || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-xs font-bold text-slate-900 dark:text-white">
                          ₹{(item.amount || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Totals Section */}
              <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-50 dark:border-slate-800 flex justify-end">
                <div className="w-full max-w-[280px] space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-500 uppercase tracking-wider">Subtotal</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">₹{(po.subtotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-500 uppercase tracking-wider text-[10px]">Tax (18.00%)</span>
                    <span className="font-bold text-emerald-500 tracking-tight">+ ₹{(po.tax_amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-sm font-black text-blue-600 uppercase tracking-widest">Grand Total</span>
                    <span className="text-xl font-black text-blue-600 tracking-tighter">₹{(po.total_amount || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="h-2 bg-blue-600 w-full"></div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Document Info */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <FileText size={18} className="text-blue-500" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Document Info</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                    <User size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Created By</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">System Administrator</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                    <Calendar size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Creation Date</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                      {new Date(po.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-colors text-left group">
                  <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600">Supplier Profile</span>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-600" />
                </button>
                <button 
                  onClick={() => navigate('/inventory-manager/purchase-receipt', { state: { po_number: po.po_number } })}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-colors text-left group"
                >
                  <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600">Related Receipts</span>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-600" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-colors text-left group">
                  <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600">Purchase Invoices</span>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-600" />
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-6 rounded-2xl border border-red-50 dark:border-red-900/30 bg-red-50/20">
              <button className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-red-600 hover:bg-red-100/50 transition-colors text-left font-bold text-xs uppercase tracking-wider">
                <Trash2 size={16} /> Cancel Order
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit PO Modal */}
      <CreatePurchaseOrderModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        editData={po}
        onPOCreated={fetchPODetails}
      />

      {/* Create GRN Modal */}
      <CreateGRNRequestModal 
        isOpen={showGRNModal}
        onClose={() => setShowGRNModal(false)}
        po={po}
        onGRNCreated={() => {
          fetchPODetails();
          navigate('/inventory-manager/grn-processing');
        }}
      />
    </div>
  );
};

export default PurchaseOrderDetailPage;
