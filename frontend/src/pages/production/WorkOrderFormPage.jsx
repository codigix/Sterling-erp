import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  Save, 
  X, 
  Settings, 
  Calendar, 
  Activity, 
  Package, 
  ChevronRight,
  Info,
  Clock,
  Zap,
  CheckCircle,
  Box,
  Truck,
  TrendingUp,
  Cpu,
  Workflow,
  Filter,
  FileText
} from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from '../../utils/api';
import toast from '../../utils/toastUtils';

const WorkOrderFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [boms, setBoms] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [formData, setFormData] = useState({
    workOrderNo: '',
    salesOrderId: '',
    projectId: '',
    itemCode: '',
    itemName: '',
    bomId: '',
    quantity: 1,
    unit: 'Nos',
    priority: 'medium',
    status: 'draft',
    plannedStartDate: new Date().toISOString().split('T')[0],
    plannedEndDate: '',
    notes: '',
    operations: [],
    inventory: []
  });

  const [activeTab, setActiveTab] = useState('foundation');

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [itemsRes, bomsRes, salesOrdersRes] = await Promise.all([
        axios.get('/inventory/materials'),
        axios.get('/engineering/bom/comprehensive'),
        axios.get('/sales/management')
      ]);
      setItems(itemsRes.data.materials || []);
      setBoms(bomsRes.data.boms || bomsRes.data || []);
      setSalesOrders(salesOrdersRes.data || []);

      if (isEdit) {
        const woRes = await axios.get(`/production/work-orders/${id}`);
        const wo = woRes.data;
        setFormData({
          workOrderNo: wo.work_order_no || '',
          salesOrderId: wo.sales_order_id || '',
          projectId: wo.project_id || '',
          itemCode: wo.item_code || '',
          itemName: wo.item_name || '',
          bomId: wo.bom_id || '',
          quantity: wo.quantity || 1,
          unit: wo.unit || 'Nos',
          priority: wo.priority || 'medium',
          status: wo.status || 'draft',
          plannedStartDate: wo.planned_start_date ? wo.planned_start_date.split('T')[0] : '',
          plannedEndDate: wo.planned_end_date ? wo.planned_end_date.split('T')[0] : '',
          notes: wo.notes || '',
          operations: wo.operations || [],
          inventory: wo.inventory || []
        });
      } else {
        // Handle query params for auto-population
        const params = new URLSearchParams(location.search);
        const querySalesOrderId = params.get('salesOrderId');
        const queryRootCardId = params.get('rootCardId');

        if (querySalesOrderId) {
          const matchedSO = (salesOrdersRes.data || []).find(so => so.id == querySalesOrderId);
          if (matchedSO) {
            setFormData(prev => ({
              ...prev,
              salesOrderId: matchedSO.id,
              itemCode: matchedSO.item_code || '',
              itemName: matchedSO.product_name || '',
              bomId: matchedSO.bom_id || '',
              quantity: matchedSO.quantity || 1
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [id, isEdit, location.search]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (status) => {
    if (!formData.itemName || !formData.itemCode) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        status: status || formData.status || 'draft'
      };
      
      if (isEdit) {
        await axios.put(`/production/work-orders/${id}`, payload);
        toast.success('Work order updated successfully');
      } else {
        await axios.post('/production/work-orders', payload);
        toast.success('Work order created successfully');
      }
      navigate('/department/production/work-orders');
    } catch (error) {
      console.error('Error saving work order:', error);
      toast.error('Failed to save work order');
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (e) => {
    const itemCode = e.target.value;
    const item = items.find(i => i.itemCode === itemCode);
    setFormData(prev => ({
      ...prev,
      itemCode: itemCode,
      itemName: item ? item.itemName : prev.itemName
    }));
  };

  const sections = [
    { id: 'foundation', label: 'Foundation', icon: Settings, step: '01' },
    { id: 'timeline', label: 'Timeline', icon: Calendar, step: '02' },
    { id: 'operations', label: 'Operations', icon: Cpu, step: '03' },
    { id: 'inventory', label: 'Inventory', icon: Package, step: '04' },
  ];

  const FormSection = ({ id, title, icon: Icon, step, children }) => (
    <section id={id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden scroll-mt-24 transition-all hover:shadow-md">
       <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100/50">
              <Icon size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Section {step}</p>
            </div>
          </div>
       </div>
       <div className="p-8">
          {children}
       </div>
    </section>
  );


  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/department/production/work-orders')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Manufacturing Order' : 'Create Manufacturing Order'}</h1>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-full border border-blue-100">{formData.status || 'Draft'}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{isEdit ? `Order #${id}` : 'New Work Order'} • {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/department/production/work-orders')}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Discard
            </button>
            <button 
              onClick={() => handleSubmit('in_progress')}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 text-sm disabled:opacity-50"
            >
              <Zap size={18} />
              {loading ? 'Processing...' : 'Release to Production'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-9 space-y-8">
            {/* Horizontal Sticky Tabbed Navigator */}
            <div className="sticky top-[72px] bg-white/95 backdrop-blur-md z-30 border border-slate-200 rounded-2xl px-4 mb-8 shadow-sm shadow-slate-200/50">
              <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeTab === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveTab(section.id)}
                      className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
                        isActive 
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100" 
                          : "text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 border-transparent hover:border-blue-100 group"
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg transition-colors ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-50 text-slate-400 group-hover:text-blue-600"
                      }`}>
                        <Icon size={16} />
                      </div>
                      <span className="uppercase tracking-wider text-[11px]">{section.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-8">
              {/* 01 Foundation Parameters */}
              {activeTab === 'foundation' && (
              <FormSection id="foundation" title="Foundation Parameters" icon={Settings} step="01">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Item Name <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text"
                        name="itemName"
                        value={formData.itemName}
                        onChange={handleInputChange}
                        placeholder="Item Name"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      />
                  </div>
                  <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Work Order Number
                      </label>
                      <input 
                        type="text"
                        name="workOrderNo"
                        value={formData.workOrderNo}
                        onChange={handleInputChange}
                        placeholder="WO-AUTO"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      />
                  </div>
                  <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Target Item <span className="text-red-500">*</span>
                      </label>
                      <select 
                        name="itemCode"
                        value={formData.itemCode}
                        onChange={handleItemChange}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      >
                          <option value="">Select Item...</option>
                          {items.map(item => (
                            <option key={item.id} value={item.itemCode}>{item.itemName} ({item.itemCode})</option>
                          ))}
                      </select>
                  </div>
                  <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Bill of Materials (BOM) <span className="text-red-500">*</span>
                      </label>
                      <select 
                        name="bomId"
                        value={formData.bomId}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      >
                          <option value="">Select BOM...</option>
                          {boms.map(bom => (
                            <option key={bom.id} value={bom.id}>
                              {bom.productName || bom.item_name || bom.itemName || bom.product_name || 'BOM'} ({bom.bomNumber || bom.bom_number || bom.id})
                            </option>
                          ))}
                      </select>
                  </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Quantity to Produce <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input 
                          type="number" 
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all" 
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">{formData.unit}</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Priority Level
                    </label>
                    <select 
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700"
                    >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                    </select>
                </div>
              </div>
            </FormSection>
            )}

            {/* 02 Production Timeline */}
            {activeTab === 'timeline' && (
            <FormSection id="timeline" title="Production Timeline" icon={Calendar} step="02">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Planned Start Date <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="date" 
                      name="plannedStartDate"
                      value={formData.plannedStartDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Planned Completion Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input 
                          type="date" 
                          name="plannedEndDate"
                          value={formData.plannedEndDate}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all" 
                        />
                    </div>
                </div>
              </div>
            </FormSection>
            )}

            {/* 03 Operation Sequence */}
            {activeTab === 'operations' && (
            <FormSection id="operations" title="Operation Sequence" icon={Cpu} step="03">
              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-100">
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Seq</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Operation</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Workstation</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Timeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {formData.operations.length > 0 ? formData.operations.map((op, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-slate-400">{op.sequence}</td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-900">{op.operation_name}</td>
                        <td className="px-6 py-4 text-xs text-slate-600">{op.workstation || 'N/A'}</td>
                        <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase border border-slate-200">
                              {op.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-[10px] text-slate-500">
                            {op.planned_start_date ? new Date(op.planned_start_date).toLocaleDateString() : 'TBD'} - 
                            {op.planned_end_date ? new Date(op.planned_end_date).toLocaleDateString() : 'TBD'}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm font-medium">
                          No operations defined. Select a BOM to generate sequence.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </FormSection>
            )}

            {/* 04 Required Inventory */}
            {activeTab === 'inventory' && (
            <FormSection id="inventory" title="Required Inventory" icon={Package} step="04">
              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-100">
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Item Code</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Item Name</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Req Qty</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {formData.inventory.length > 0 ? formData.inventory.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-slate-900">{inv.item_code}</td>
                        <td className="px-6 py-4 text-xs text-slate-600">{inv.item_name}</td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-900">{inv.required_qty} {inv.unit}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{inv.source_warehouse || 'Main Warehouse'}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-slate-400 text-sm font-medium">
                          No inventory requirements defined.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </FormSection>
            )}
          </div>
        </div>

        {/* Right Sidebar - Info Panels */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Efficiency Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-blue-600" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Performance Metrics</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Projected Efficiency</p>
                      <p className="text-4xl font-bold text-slate-900">0%</p>
                   </div>
                   <div className="flex gap-1 items-end h-12">
                      <div className="w-2 h-[20%] bg-blue-100 rounded-full" />
                      <div className="w-2 h-[40%] bg-blue-100 rounded-full" />
                      <div className="w-2 h-[30%] bg-blue-100 rounded-full" />
                      <div className="w-2 h-[50%] bg-blue-100 rounded-full" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Target Yield</p>
                    <p className="text-lg font-bold text-slate-900">0%</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Machine Hrs</p>
                    <p className="text-lg font-bold text-slate-900">0.0h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Operational Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                   <Zap size={16} className="text-blue-600" />
                   <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Operations</span>
                </div>
                
                <button 
                  onClick={() => handleSubmit('planning')}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 transition-all border border-slate-200 font-bold text-sm group disabled:opacity-50"
                >
                   <div className="flex items-center gap-3">
                      <Save size={18} className="text-slate-400" />
                      Save as Draft
                   </div>
                   <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderFormPage;
