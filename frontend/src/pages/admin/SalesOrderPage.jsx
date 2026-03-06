import React, { useState, useEffect } from 'react';
import axios from '../../utils/api';
import { 
  Plus, 
  Trash2, 
  Edit,
  Download,
  AlertCircle,
  Loader2,
  X,
  ClipboardList,
  Eye,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Send
} from 'lucide-react';
import CreateSalesOrderModal from './CreateSalesOrderModal';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate, useLocation } from 'react-router-dom';

const SalesOrderPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [preSelectedRootCardId, setPreSelectedRootCardId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('sales/management');
      setData(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch sales orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Handle deep link from notification
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    const rootCardId = params.get('rootCardId');
    
    if (action === 'create' && rootCardId) {
      setPreSelectedRootCardId(rootCardId);
      setIsModalVisible(true);
      // Clear URL params
      navigate('/admin/sales-order', { replace: true });
    }
  }, [location]);

  const handleEdit = (order) => {
    setEditingOrder(order);
    setIsModalVisible(true);
  };

  const handleDownloadPDF = (order) => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(22);
    doc.setTextColor(40, 44, 52);
    doc.text('SALES ORDER', 105, 20, { align: 'center' });
    
    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 25, 196, 25);
    
    // Order Info
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('SO Number:', 14, 35);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(order.so_number, 40, 35);
    
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Order Date:', 14, 40);
    doc.setTextColor(0, 0, 0);
    doc.text(new Date(order.order_date).toLocaleDateString(), 40, 40);
    
    doc.setTextColor(100, 100, 100);
    doc.text('Delivery Date:', 14, 45);
    doc.setTextColor(0, 0, 0);
    doc.text(new Date(order.delivery_date).toLocaleDateString(), 40, 45);
    
    // Customer Info
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('CUSTOMER DETAILS', 14, 55);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(order.customer_name, 14, 62);
    
    // Product Table
    const subtotal = Number(order.quantity) * Number(order.unit_price);
    const taxableValue = subtotal - Number(order.discount || 0);
    const taxAmount = (taxableValue * Number(order.tax_percent || 18)) / 100;
    const totalAmount = taxableValue + taxAmount;

    autoTable(doc, {
      startY: 75,
      head: [['Product Description', 'Qty', 'Unit Price', 'Subtotal']],
      body: [
        [
          { content: `${order.product_name}\nCode: ${order.item_code}`, styles: { fontStyle: 'bold' } },
          order.quantity,
          `INR ${Number(order.unit_price).toLocaleString()}`,
          `INR ${subtotal.toLocaleString()}`
        ]
      ],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] }
    });

    // Summary
    const finalY = doc.lastAutoTable.finalY + 10;
    
    doc.setFontSize(10);
    doc.text('Notes:', 14, finalY);
    doc.setFont(undefined, 'italic');
    doc.text(order.notes || 'No special instructions.', 14, finalY + 5, { maxWidth: 100 });

    doc.setFont(undefined, 'normal');
    const summaryX = 140;
    doc.text('Subtotal:', summaryX, finalY);
    doc.text(`INR ${subtotal.toLocaleString()}`, 196, finalY, { align: 'right' });
    
    if (order.discount > 0) {
      doc.setTextColor(220, 38, 38);
      doc.text('Discount:', summaryX, finalY + 5);
      doc.text(`- INR ${Number(order.discount).toLocaleString()}`, 196, finalY + 5, { align: 'right' });
      doc.setTextColor(0, 0, 0);
    }
    
    doc.text(`Tax (${order.tax_percent}%):`, summaryX, finalY + 10);
    doc.text(`INR ${taxAmount.toLocaleString()}`, 196, finalY + 10, { align: 'right' });
    
    doc.setLineWidth(0.5);
    doc.line(summaryX, finalY + 13, 196, finalY + 13);
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('Total Amount:', summaryX, finalY + 20);
    doc.setTextColor(79, 70, 229);
    doc.text(`INR ${totalAmount.toLocaleString()}`, 196, finalY + 20, { align: 'right' });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by Sterling ERP System', 105, 285, { align: 'center' });

    doc.save(`Sales_Order_${order.so_number}.pdf`);
    toast.success('PDF Downloaded Successfully');
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`sales/management/${id}`);
        toast.success('Sales Order has been deleted');
        fetchData();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete sales order');
      }
    }
  };

  const handleSendToProduction = async (order) => {
    try {
      const result = await Swal.fire({
        title: 'Send to Production?',
        text: `This will send Sales Order ${order.so_number} to the Production Department.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, send it!'
      });

      if (result.isConfirmed) {
        await axios.patch(`sales/management/${order.id}/status`, { status: 'Sent to Production' });
        toast.success('Sales Order has been sent to production');
        fetchData();
      }
    } catch (error) {
      console.error('Send to production error:', error);
      toast.error('Failed to send sales order to production');
    }
  };

  const handleApprove = async (order) => {
    try {
      const result = await Swal.fire({
        title: 'Approve Sales Order?',
        text: `Are you sure you want to approve Sales Order ${order.so_number}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, approve it!'
      });

      if (result.isConfirmed) {
        await axios.patch(`sales/management/${order.id}/status`, { status: 'Approved' });
        toast.success('Sales Order has been approved');
        fetchData();
      }
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('Failed to approve sales order');
    }
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'in progress': 
      case 'in_progress': 
      case 'sent to production':
      case 'sent_to_production': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="px-6 py-0">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sales Orders</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage sales orders and track their progress</p>
          </div>
          <button 
            onClick={() => {
              setEditingOrder(null);
              setIsModalVisible(true);
            }}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Plus size={20} />
            Create Sales Order
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              <p className="mt-2 text-slate-500">Loading sales orders...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <AlertCircle className="w-12 h-12 mb-2 opacity-20" />
              <p>No sales orders found</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
  <th className="px-6 py-3">SO Number</th>
  <th className="px-6 py-3">Customer</th>
  <th className="px-6 py-3">Total Value</th>
  <th className="px-6 py-3">Delivery Date</th>
  <th className="px-6 py-3">Status</th>
  <th className="px-6 py-3 text-right">Actions</th>
</tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr 
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${expandedOrderId === order.id ? 'bg-slate-50/80 dark:bg-slate-800/80' : ''}`}
                      onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="text-slate-400">
                            {expandedOrderId === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-slate-200 text-sm">{order.so_number}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{order.root_card_code}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-slate-600 dark:text-slate-400 text-sm font-medium">{order.customer_name}</td>
                      <td className="px-6 py-3">
                        <span className="text-slate-900 dark:text-slate-200 font-bold text-sm">
                          ₹{((Number(order.quantity || 0) * Number(order.unit_price || 0) - Number(order.discount || 0)) * (1 + Number(order.tax_percent || 0) / 100)).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-600 dark:text-slate-400 text-sm">
                        {new Date(order.delivery_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${getStatusColor(order.status)} uppercase shadow-sm border border-black/5`}>
                          {order.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          {order.status?.toLowerCase() === 'pending' && (
                            <button 
                              onClick={() => handleApprove(order)}
                              className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                              title="Approve Order"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                          )}
                          {order.status?.toLowerCase() === 'approved' && (
                            <button 
                              onClick={() => handleSendToProduction(order)}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Send to Production"
                            >
                              <Send size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDownloadPDF(order)}
                            className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Download size={18} />
                          </button>
                          <button 
                            onClick={() => handleEdit(order)}
                            className="p-1.5 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                            title="Edit Order"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(order.id)}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedOrderId === order.id && (
                      <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                        <td colSpan="6" className="px-12 py-4">
                          <div className="grid grid-cols-4 gap-6 text-sm">
                            <div>
                              <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Product Details</p>
                              <p className="font-medium text-slate-700 dark:text-slate-300">{order.product_name}</p>
                              <p className="text-[11px] text-slate-400">{order.item_code}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Pricing</p>
                              <div className="space-y-1">
                                <div className="flex justify-between max-w-[150px]">
                                  <span className="text-slate-500">Qty:</span>
                                  <span className="font-bold text-primary-600">{order.quantity}</span>
                                </div>
                                <div className="flex justify-between max-w-[150px]">
                                  <span className="text-slate-500">Unit Price:</span>
                                  <span className="italic">₹{Number(order.unit_price).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Dates</p>
                              <div className="space-y-1">
                                <div className="flex justify-between max-w-[180px]">
                                  <span className="text-slate-500">Ordered:</span>
                                  <span>{new Date(order.order_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between max-w-[180px]">
                                  <span className="text-slate-500">Delivery:</span>
                                  <span className="font-bold text-primary-600">{new Date(order.delivery_date).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Financials</p>
                              <div className="space-y-1">
                                <div className="flex justify-between max-w-[180px]">
                                  <span className="text-slate-500">Discount:</span>
                                  <span className="text-red-500">₹{Number(order.discount || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between max-w-[180px]">
                                  <span className="text-slate-500">Tax ({order.tax_percent}%):</span>
                                  <span>₹{((Number(order.quantity || 0) * Number(order.unit_price || 0) - Number(order.discount || 0)) * (Number(order.tax_percent || 0) / 100)).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalVisible && (
        <CreateSalesOrderModal 
          editData={editingOrder}
          preSelectedRootCardId={preSelectedRootCardId}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingOrder(null);
            setPreSelectedRootCardId(null);
          }}
          onSuccess={() => {
            setIsModalVisible(false);
            setEditingOrder(null);
            setPreSelectedRootCardId(null);
            fetchData();
          }}
        />
      )}

      {/* Sales Order Detail Drawer */}
      {isDrawerVisible && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsDrawerVisible(false)} 
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sales Order Details</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-mono text-primary-600 dark:text-primary-400 font-bold">{selectedOrder.so_number}</span>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">{selectedOrder.root_card_code}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsDrawerVisible(false)} 
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Customer Information</h3>
                  <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="font-bold text-xl text-slate-900 dark:text-white mb-1">{selectedOrder.customer_name}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                      {selectedOrder.customer_id || 'Premium Client'}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Current Status</h3>
                  <div className="flex flex-col gap-3">
                    <div className={`inline-flex px-4 py-2 rounded-xl text-xs font-bold border self-start shadow-sm ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status?.toUpperCase() || 'PENDING'}
                    </div>
                    <p className="text-[11px] text-slate-400 italic">Last updated: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Order Items</h3>
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-5 py-4 text-left font-bold text-slate-600 dark:text-slate-400">Description</th>
                        <th className="px-5 py-4 text-right font-bold text-slate-600 dark:text-slate-400">Qty</th>
                        <th className="px-5 py-4 text-right font-bold text-slate-600 dark:text-slate-400">Unit Price</th>
                        <th className="px-5 py-4 text-right font-bold text-slate-600 dark:text-slate-400">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr className="bg-white dark:bg-slate-900/50">
                        <td className="px-5 py-5">
                          <p className="font-bold text-slate-900 dark:text-white text-base">{selectedOrder.product_name}</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-1 uppercase">{selectedOrder.item_code}</p>
                        </td>
                        <td className="px-5 py-5 text-right font-bold text-primary-600 text-base">{selectedOrder.quantity}</td>
                        <td className="px-5 py-5 text-right font-medium text-slate-600 dark:text-slate-400 italic">₹{Number(selectedOrder.unit_price).toLocaleString()}</td>
                        <td className="px-5 py-5 text-right font-bold text-slate-900 dark:text-white text-base">₹{(Number(selectedOrder.quantity) * Number(selectedOrder.unit_price)).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10 mb-10">
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <Plus size={16} />
                        </div>
                        <span className="text-sm font-medium text-slate-500">Order Created</span>
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{new Date(selectedOrder.order_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500">
                          <Download size={16} />
                        </div>
                        <span className="text-sm font-medium text-slate-500">Target Delivery</span>
                      </div>
                      <span className="text-sm font-bold text-primary-600">{new Date(selectedOrder.delivery_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Billing Summary</h3>
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Subtotal</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">₹{(Number(selectedOrder.quantity) * Number(selectedOrder.unit_price)).toLocaleString()}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Trade Discount</span>
                        <span className="font-bold text-red-500">- ₹{Number(selectedOrder.discount).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">GST ({selectedOrder.tax_percent}%)</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">₹{((Number(selectedOrder.quantity * selectedOrder.unit_price) - Number(selectedOrder.discount)) * (selectedOrder.tax_percent / 100)).toLocaleString()}</span>
                    </div>
                    <div className="pt-3 mt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                      <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Grand Total</span>
                      <span className="font-black text-2xl text-primary-600">₹{((Number(selectedOrder.quantity * selectedOrder.unit_price) - Number(selectedOrder.discount)) * (1 + selectedOrder.tax_percent / 100)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="mb-8">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Special Instructions</h3>
                  <div className="p-5 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                    "{selectedOrder.notes}"
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex gap-4 bg-slate-50 dark:bg-slate-800/50">
              <button 
                onClick={() => handleDownloadPDF(selectedOrder)}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-[0.98]"
              >
                <Download size={20} />
                Download PDF
              </button>
              <button 
                onClick={() => {
                  setIsDrawerVisible(false);
                  handleEdit(selectedOrder);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary-200 dark:shadow-none active:scale-[0.98]"
              >
                <Edit size={20} />
                Edit Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesOrderPage;
