import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Zap, Calendar, User, FileText, Plus, Trash2, Loader2, Edit2, Save, Settings, Package, Layers, ChevronDown, ChevronUp, Activity, ArrowLeft, AlertCircle, CheckCircle, X, Send } from 'lucide-react';
import axios from '../../utils/api';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Swal from 'sweetalert2';

const MaterialRequestModal = ({ isOpen, onClose, data, materials, planId, onSavePlan }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleProcessRequest = async () => {
    let currentPlanId = planId;

    if (!currentPlanId) {
      const savedPlanId = await onSavePlan();
      if (!savedPlanId) return;
      currentPlanId = savedPlanId;
    }

    if (!data.salesOrderId) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Source',
        text: 'A Sales Order must be linked to create Material Requests.',
        confirmButtonColor: '#0f172a'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const requests = materials.map(m => ({
        rootCardId: data.salesOrderId,
        productionPlanId: currentPlanId,
        materialName: m.specification,
        quantity: m.requiredQty,
        unit: m.uom || 'Nos',
        specification: m.specification,
        requiredDate: data.estimatedCompletionDate,
        priority: 'medium',
        remarks: `Generated from Production Plan: ${data.planName}`
      }));

      await axios.post('/procurement/material-requests/bulk', { requests });
      
      Swal.fire({
        icon: 'success',
        title: 'Requests Generated',
        text: 'Material requests have been successfully sent to procurement.',
        confirmButtonColor: '#0f172a'
      });
      
      onClose();
    } catch (err) {
      console.error('Error creating material requests:', err);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err.response?.data?.message || 'Failed to process material requests.',
        confirmButtonColor: '#0f172a'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Send size={20} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Material Request</h2>
              <div className="flex items-center gap-2">
                <Activity size={12} className="text-green-500" />
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Resource Acquisition Phase</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-slate-900 dark:text-slate-100">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400">Request Identifier</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 uppercase">
                {planId ? `PP-MR-${planId}` : 'PENDING SAVE'}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400">Originating Dept</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 uppercase">Production</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <span className="text-[10px] uppercase font-bold text-slate-400">SLA Target Date</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{data.estimatedCompletionDate || 'Not set'}</p>
            </div>
          </div>

          {/* Strategy Notes */}
          <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl flex gap-4">
            <div className="mt-1">
              <FileText size={16} className="text-blue-600" />
            </div>
            <div className="space-y-1 text-xs text-blue-700 dark:text-blue-400 leading-relaxed font-medium">
              <p className="font-bold">Intelligence Strategy Notes</p>
              <p>Material Request for Production Plan: {data.planName || 'N/A'}</p>
              <p>BOM Reference: {materials[0]?.bomRef || 'Consolidated'}</p>
              <p>Includes raw materials from all sub-assemblies calculated for procurement cycle.</p>
            </div>
          </div>

          {/* Components List */}
          <div>
            <div className="flex items-center gap-2 mb-4 px-1">
              <div className="w-1 h-4 bg-green-500 rounded-full" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Requested Components ({materials.length})</h3>
            </div>
            <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="px-6 py-3 text-left">Component Intelligence</th>
                    <th className="px-6 py-3 text-center">Required</th>
                    <th className="px-6 py-3 text-center">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {materials.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white uppercase text-xs">{m.specification}</p>
                          <p className="text-[10px] text-slate-500 font-medium mt-0.5 uppercase">Source: {m.sourceAssembly || 'Production Inventory'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-slate-900 dark:text-white">{m.requiredQty}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{m.uom || 'KG'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="px-5 py-2 text-slate-600 dark:text-slate-400 text-xs font-bold hover:text-slate-900 transition-colors"
          >
            Abort Request
          </button>
          <button 
            onClick={handleProcessRequest}
            disabled={isSubmitting || materials.length === 0}
            className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded font-bold hover:bg-black transition-all text-xs border border-slate-800 disabled:bg-slate-400"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Process Request
          </button>
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ title, subtitle, section, isExpanded, onToggle, icon: Icon, number, colorClass, badge }) => (
  <div 
    onClick={() => onToggle(section)}
    className={`flex items-center justify-between p-3 cursor-pointer transition-all ${
      isExpanded 
        ? 'bg-white dark:bg-slate-800/50' 
        : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
    }`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded flex items-center justify-center text-white ${colorClass || 'bg-indigo-600'}`}>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold leading-none">{number}</span>
          {Icon && <Icon size={16} className="mt-0.5" />}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[11px] text-slate-500 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        {badge && (
          <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase rounded border border-blue-100 dark:border-blue-800">
            {badge}
          </span>
        )}
      </div>
    </div>
    {isExpanded ? (
      <ChevronUp size={20} className="text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-full p-1" />
    ) : (
      <ChevronDown size={20} className="text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-full p-1" />
    )}
  </div>
);

const ProductionPlanFormPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [salesOrders, setSalesOrders] = useState([]);
  const [isViewMode, setIsViewMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    strategic: true,
    finishedGoods: true,
    materials: true,
    subAssemblies: true,
    phases: true
  });
  const [showMaterialRequestModal, setShowMaterialRequestModal] = useState(false);
  const [generatingWorkOrders, setGeneratingWorkOrders] = useState(false);
  const [planId, setPlanId] = useState(null);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderStrategicSection = () => (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden mb-6 transition-all duration-300">
      <SectionHeader 
        title="STRATEGIC PARAMETERS" 
        subtitle="Core planning identities and source selection"
        section="strategic" 
        isExpanded={expandedSections.strategic} 
        onToggle={toggleSection} 
        icon={Settings} 
        number="01" 
        colorClass="bg-indigo-600"
      />
      
      {expandedSections.strategic && (
        <div className="p-6 border-t border-slate-100 dark:border-slate-700/50 space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Plan Identity <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="planName"
                value={formData.planName}
                readOnly
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed transition-all outline-none text-sm font-mono"
                placeholder="Auto Generated"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Naming Series
              </label>
              <input
                type="text"
                name="namingSeries"
                value={formData.namingSeries}
                onChange={handleInputChange}
                disabled={isViewMode}
                className={`w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-sm ${isViewMode ? 'cursor-not-allowed opacity-75' : ''}`}
                placeholder="e.g. PP"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Operational Status
              </label>
              <select
                name="procurementStatus"
                value={formData.procurementStatus}
                onChange={handleInputChange}
                disabled={isViewMode}
                className={`w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-sm ${isViewMode ? 'cursor-not-allowed opacity-75' : ''}`}
              >
                <option value="Draft">Draft</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                Source Sales Order <span className="text-red-500">*</span>
              </label>
              <select
                name="salesOrderId"
                value={formData.salesOrderId}
                onChange={handleInputChange}
                disabled={isViewMode || id}
                className={`w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-sm ${(isViewMode || id) ? 'cursor-not-allowed opacity-75' : ''}`}
              >
                <option value="">Select Sales Order</option>
                {salesOrders.map(so => (
                  <option key={so.id} value={so.id}>
                    {so.so_number} - {so.product_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Target Quantity <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  name="targetQuantity"
                  value={formData.targetQuantity}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  className={`w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-l bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-sm ${isViewMode ? 'cursor-not-allowed opacity-75' : ''}`}
                  placeholder="1"
                />
                <span className="px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-l-0 border-slate-200 dark:border-slate-600 rounded-r text-xs font-bold text-slate-500 uppercase">
                  UNIT
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700/30">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Calendar size={14} className="text-blue-500" />
                Production Start Date
              </label>
              <input
                type="date"
                name="productionStartDate"
                value={formData.productionStartDate}
                onChange={handleInputChange}
                disabled={isViewMode}
                className={`w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-sm ${isViewMode ? 'cursor-not-allowed opacity-75' : ''}`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Calendar size={14} className="text-orange-500" />
                Estimated Completion
              </label>
              <input
                type="date"
                name="estimatedCompletionDate"
                value={formData.estimatedCompletionDate}
                onChange={handleInputChange}
                disabled={isViewMode}
                className={`w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-sm ${isViewMode ? 'cursor-not-allowed opacity-75' : ''}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <User size={14} className="text-green-500" />
                Supervisor
              </label>
              <select
                name="supervisorId"
                value={formData.supervisorId}
                onChange={handleInputChange}
                disabled={isViewMode}
                className={`w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-sm ${isViewMode ? 'cursor-not-allowed opacity-75' : ''}`}
              >
                <option value="">Select Supervisor (Optional)</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.username}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                disabled={isViewMode}
                className={`w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-sm ${isViewMode ? 'cursor-not-allowed opacity-75' : ''}`}
                placeholder="Additional notes"
                rows="1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderFinishedGoodsSection = () => (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden mb-6 transition-all duration-300">
      <SectionHeader 
        title="Finished Goods" 
        subtitle="Finished goods and target fulfillment"
        section="finishedGoods" 
        isExpanded={expandedSections.finishedGoods} 
        onToggle={toggleSection} 
        icon={Package} 
        number="02" 
        colorClass="bg-blue-600"
        badge={`${finishedGoods.length} ITEMS`}
      />
      
      {expandedSections.finishedGoods && (
        <div className="border-t border-slate-100 dark:border-slate-700/50 animate-in slide-in-from-top-4 duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                  <th className="px-6 py-4">No.</th>
                  <th className="px-6 py-4">Item Code</th>
                  <th className="px-6 py-4">Bom No.</th>
                  <th className="px-6 py-4 text-center">Planned Qty</th>
                  <th className="px-6 py-4 text-center">Uom</th>
                  <th className="px-6 py-4">Finished Goods Warehouse</th>
                  <th className="px-6 py-4">Planned Start Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {finishedGoods.map((fg, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                          <Package size={14} className="text-blue-500" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors uppercase">
                            {fg.itemCode}
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase font-medium">
                            {fg.productName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <div className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded flex items-center gap-1 border border-blue-100 dark:border-blue-800">
                          <Settings size={10} />
                          {fg.bomNo}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                        {fg.plannedQty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase">
                      {fg.uom || 'Nos'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs font-medium">
                        <Package size={14} className="text-slate-400" />
                        {fg.warehouse}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs font-medium">
                        <Calendar size={14} className="text-slate-400" />
                        {fg.startDate}
                      </div>
                    </td>
                  </tr>
                ))}
                {finishedGoods.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <Package size={32} />
                        <p className="text-sm italic">No finished goods data available. Please select a Sales Order first.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderMaterialsSection = () => (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden mb-6 transition-all duration-300">
      <SectionHeader 
        title="Materials" 
        subtitle="Consolidated material explosion across all levels"
        section="materials" 
        isExpanded={expandedSections.materials} 
        onToggle={toggleSection} 
        icon={Layers} 
        number="03" 
        colorClass="bg-orange-500"
        badge={`${materials.length} ITEMS`}
      />
      
      {expandedSections.materials && (
        <div className="border-t border-slate-100 dark:border-slate-700/50 animate-in slide-in-from-top-4 duration-300">
          <div className="px-6 py-4 bg-slate-50/30 dark:bg-slate-900/10 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <h4 className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Exploded Components</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                  <th className="px-6 py-4">No.</th>
                  <th className="px-6 py-4">Component Specification</th>
                  <th className="px-6 py-4 text-center">Required Qty</th>
                  <th className="px-6 py-4 text-center">Uom</th>
                  <th className="px-6 py-4">Source Assembly</th>
                  <th className="px-6 py-4">Bom Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {materials.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase text-xs">
                        {m.specification}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">
                        {m.requiredQty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase">
                      {m.uom || 'KG'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 w-fit">
                        <Activity size={10} className="text-red-400" />
                        {m.sourceAssembly}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50/50 dark:bg-blue-900/10 rounded text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-800/50 w-fit">
                        <FileText size={10} className="text-blue-400" />
                        {m.bomRef}
                      </div>
                    </td>
                  </tr>
                ))}
                {materials.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <Layers size={32} />
                        <p className="text-sm italic">No material explosion data available.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderSubAssembliesSection = () => (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden mb-6 transition-all duration-300">
      <SectionHeader 
        title="Sub Assemblies" 
        subtitle="Manufacturing breakdown of intermediate components"
        section="subAssemblies" 
        isExpanded={expandedSections.subAssemblies} 
        onToggle={toggleSection} 
        icon={Activity} 
        number="04" 
        colorClass="bg-pink-600"
        badge={`${subAssemblies.length} ITEMS`}
      />
      
      {expandedSections.subAssemblies && (
        <div className="border-t border-slate-100 dark:border-slate-700/50 animate-in slide-in-from-top-4 duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                  <th className="px-6 py-4">No.</th>
                  <th className="px-6 py-4">Sub Assembly Item Code</th>
                  <th className="px-6 py-4">Target Warehouse</th>
                  <th className="px-6 py-4">Scheduled Date</th>
                  <th className="px-6 py-4 text-center">Required Qty</th>
                  <th className="px-6 py-4">Bom No</th>
                  <th className="px-6 py-4 text-center">Manufacturing Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {subAssemblies.map((sa, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                          <Package size={14} className="text-red-500" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                            {sa.itemCode}
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase font-medium">
                            {sa.itemName || 'Sub Assembly'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Package size={14} className="text-slate-400" />
                        <span className="font-medium">{sa.targetWarehouse}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="font-medium">{sa.scheduledDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-md font-bold text-slate-900 dark:text-white">
                          {sa.requiredQty}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">
                          {sa.uom}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-red-400" />
                        {sa.bomNo}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-[10px] font-bold uppercase tracking-wider border border-red-100 dark:border-red-800">
                        {sa.manufacturingType || 'In House'}
                      </span>
                    </td>
                  </tr>
                ))}
                {subAssemblies.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <Layers size={32} />
                        <p className="text-sm italic">No sub-assemblies required for this plan.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderManufacturingFlowSection = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6 transition-all duration-300">
      <SectionHeader 
        title="Manufacturing Flow & Production Phases" 
        section="phases" 
        isExpanded={expandedSections.phases} 
        onToggle={toggleSection} 
        icon={Activity} 
        number="05" 
      />
      
      {expandedSections.phases && (
        <div className="p-6 border-t border-slate-100 dark:border-slate-700/50 space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Active Production Phases</h4>
              <p className="text-xs text-slate-500 mt-1">Define sequence of operations and resource allocation</p>
            </div>
            {!showStageForm && (
              <button
                type="button"
                onClick={() => setShowStageForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-all text-xs shadow-sm hover:shadow-purple-500/20"
              >
                <Plus size={16} />
                Add Phase
              </button>
            )}
          </div>

          {/* New Phase Form */}
          {showStageForm && (
            <div className="p-5 border-2 border-dashed border-purple-200 dark:border-purple-900/50 bg-purple-50/30 dark:bg-purple-900/10 rounded-xl space-y-4 animate-in zoom-in-95 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Phase Name</label>
                  <input
                    type="text"
                    name="stageName"
                    value={newStage.stageName}
                    onChange={handleStageInputChange}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 outline-none"
                    placeholder="e.g., Machining, Assembly"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                  <select
                    name="stageType"
                    value={newStage.stageType}
                    onChange={handleStageInputChange}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 outline-none"
                  >
                    <option value="in_house">🏭 In House</option>
                    <option value="outsource">🚚 Outsource</option>
                  </select>
                </div>
              </div>

              {newStage.stageType === 'in_house' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Employee</label>
                    <select
                      name="assignedEmployeeId"
                      value={newStage.assignedEmployeeId}
                      onChange={handleStageInputChange}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 outline-none"
                    >
                      <option value="">Select Employee</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.username}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Facility</label>
                    <select
                      name="facilityId"
                      value={newStage.facilityId}
                      onChange={handleStageInputChange}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 outline-none"
                    >
                      <option value="">Select Facility</option>
                      {facilities.map(fac => (
                        <option key={fac.id} value={fac.id}>{fac.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Target Warehouse</label>
                    <select
                      name="targetWarehouse"
                      value={newStage.targetWarehouse}
                      onChange={handleStageInputChange}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 outline-none"
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map(wh => (
                        <option key={wh} value={wh}>{wh}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Timeline</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      name="plannedStartDate"
                      value={newStage.plannedStartDate}
                      onChange={handleStageInputChange}
                      className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 outline-none"
                    />
                    <span className="text-slate-400">→</span>
                    <input
                      type="date"
                      name="plannedEndDate"
                      value={newStage.plannedEndDate}
                      onChange={handleStageInputChange}
                      className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Notes</label>
                  <input
                    type="text"
                    name="notes"
                    value={newStage.notes}
                    onChange={handleStageInputChange}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 outline-none"
                    placeholder="Operation notes..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={addStage}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm hover:bg-purple-700 transition-colors"
                >
                  Confirm Phase
                </button>
                <button
                  type="button"
                  onClick={() => setShowStageForm(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Stages List */}
          <div className="space-y-4">
            {formData.stages.map((stage, index) => {
              const isEditing = editingStageId === stage.id;
              const isAuto = stage.notes?.includes('Auto-populated');

              return (
                <div 
                  key={stage.id} 
                  className={`relative p-5 rounded-xl border-2 transition-all ${
                    isEditing 
                      ? 'border-purple-500 bg-purple-50/10' 
                      : isAuto
                        ? 'border-blue-100 dark:border-blue-900/30 bg-blue-50/20 dark:bg-blue-900/5'
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20'
                  }`}
                >
                  {!isEditing ? (
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 min-w-[240px]">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                            isAuto ? 'bg-blue-500 text-white' : 'bg-slate-900 dark:bg-slate-700 text-white'
                          }`}>
                            {index + 1}
                          </span>
                          <h5 className="font-bold text-slate-900 dark:text-white">{stage.stageName}</h5>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            stage.stageType === 'in_house' 
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          }`}>
                            {stage.stageType === 'in_house' ? 'In House' : 'Outsource'}
                          </span>
                          {isAuto && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                              <Zap size={10} fill="currentColor" />
                              Auto
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px]">
                          <div className="space-y-1">
                            <span className="text-slate-400 uppercase font-bold">Resources</span>
                            <p className="font-medium text-slate-700 dark:text-slate-300">
                              {stage.assignedEmployeeId ? getEmployeeName(stage.assignedEmployeeId) : 'Unassigned'}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 uppercase font-bold">Facility</span>
                            <p className="font-medium text-slate-700 dark:text-slate-300">
                              {stage.facilityId ? getFacilityName(stage.facilityId) : 'N/A'}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 uppercase font-bold">Timeline</span>
                            <p className="font-medium text-slate-700 dark:text-slate-300">
                              {stage.plannedStartDate} → {stage.plannedEndDate}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 uppercase font-bold">Target</span>
                            <p className="font-medium text-slate-700 dark:text-slate-300">
                              {stage.targetWarehouse || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditStage(stage)}
                          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStage(stage.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Inline Edit UI */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={editedStage.stageName}
                          onChange={(e) => setEditedStage({...editedStage, stageName: e.target.value})}
                          className="px-4 py-2 border border-purple-300 dark:border-purple-700 rounded-lg bg-white dark:bg-slate-900 text-sm"
                        />
                        <select
                          value={editedStage.stageType}
                          onChange={(e) => setEditedStage({...editedStage, stageType: e.target.value})}
                          className="px-4 py-2 border border-purple-300 dark:border-purple-700 rounded-lg bg-white dark:bg-slate-900 text-sm"
                        >
                          <option value="in_house">In House</option>
                          <option value="outsource">Outsource</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={saveEditedStage}
                          className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditStage}
                          className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {formData.stages.length === 0 && (
              <div className="py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 gap-3">
                <Activity size={32} strokeWidth={1.5} />
                <p className="text-sm font-medium">No production phases defined yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const [formData, setFormData] = useState({
    rootCardId: '',
    salesOrderId: '',
    namingSeries: 'PP',
    planName: '', // Will be auto-generated
    productionStartDate: '',
    estimatedCompletionDate: '',
    procurementStatus: 'Draft',
    supervisorId: '',
    productName: '',
    itemCode: '',
    targetQuantity: 1,
    notes: '',
    stages: []
  });

  // Auto-generate plan identity on mount and when naming series changes
  useEffect(() => {
    if (!planId && !id) {
      setFormData(prev => {
        const currentSeries = prev.namingSeries || 'PP';
        // Only generate if planName is empty, "Auto Generated", or starts with a different prefix
        const needsNewName = !prev.planName || 
                             prev.planName === 'Auto Generated' || 
                             (prev.planName.includes('-') && !prev.planName.startsWith(`${currentSeries}-`));
        
        if (needsNewName) {
          const timestamp = Date.now();
          // Use a shorter timestamp or more readable format if possible
          // For now, sticking with namingSeries-timestamp for uniqueness
          return { ...prev, planName: `${currentSeries}-${timestamp}` };
        }
        return prev;
      });
    }
  }, [planId, id, formData.namingSeries]);
  const [finishedGoods, setFinishedGoods] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [subAssemblies, setSubAssemblies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [newStage, setNewStage] = useState({
    stageName: '',
    stageType: 'in_house',
    plannedStartDate: '',
    plannedEndDate: '',
    assignedEmployeeId: '',
    facilityId: '',
    targetWarehouse: '',
    notes: ''
  });
  const [productionPhases, setProductionPhases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showStageForm, setShowStageForm] = useState(false);
  const [editingStageId, setEditingStageId] = useState(null);
  const [editedStage, setEditedStage] = useState(null);

  const fetchPlanDetails = async (planId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/production/plans/${planId}/with-stages`);
      const plan = response.data.plan || response.data;
      
      if (plan) {
        const formatDate = (dateStr) => {
          if (!dateStr) return '';
          try {
            return new Date(dateStr).toISOString().split('T')[0];
          } catch (e) {
            return dateStr || '';
          }
        };

        setFormData({
          id: plan.id,
          rootCardId: plan.root_card_id || plan.rootCardId,
          salesOrderId: (plan.sales_order_id || plan.salesOrderId) ? (plan.sales_order_id || plan.salesOrderId).toString() : '',
          namingSeries: (plan.plan_name || plan.planName)?.split('-')[0] || 'PP',
          planName: plan.plan_name || plan.planName,
          productionStartDate: formatDate(plan.planned_start_date || plan.productionStartDate || plan.plannedStartDate),
          estimatedCompletionDate: formatDate(plan.planned_end_date || plan.estimatedCompletionDate || plan.plannedEndDate),
          procurementStatus: plan.status || plan.procurementStatus || 'Draft',
          supervisorId: plan.supervisor_id || plan.supervisorId || '',
          productName: plan.product_name || plan.productName,
          itemCode: plan.item_code || plan.itemCode,
          targetQuantity: plan.target_quantity || plan.targetQuantity || 1,
          notes: plan.production_notes || plan.notes || plan.productionNotes || '',
          stages: plan.stages || []
        });
        
        setPlanId(plan.id);
        
        setFinishedGoods(plan.finished_goods || plan.finishedGoods || []);
        setMaterials(plan.materials || []);
        setSubAssemblies(plan.sub_assemblies || plan.subAssemblies || []);
      }
    } catch (err) {
      console.error('Failed to fetch plan details:', err);
      setError('Failed to load production plan details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesOrders = async () => {
    try {
      const response = await axios.get('/sales/management', { __sessionGuard: true });
      setSalesOrders(response.data || []);
      console.log('Fetched sales orders:', response.data?.length || 0);
    } catch (err) {
      console.error('Failed to fetch sales orders:', err);
      setSalesOrders([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/production/portal/employees', { __sessionGuard: true });
      setEmployees(response.data);
    } catch (err) {
      console.error('Failed to fetch employees - this is optional:', err);
      setEmployees([]);
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await axios.get('/inventory/facilities/available', { __sessionGuard: true });
      setFacilities(response.data);
    } catch (err) {
      console.error('Failed to fetch facilities - this is optional:', err);
      setFacilities([]);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get('/inventory/materials', { __sessionGuard: true });
      const fetchedMaterials = response.data.materials || [];
      const uniqueWarehouses = [...new Set(fetchedMaterials.map(m => m.location).filter(loc => loc && loc.trim() !== ""))];
      setWarehouses(uniqueWarehouses.length > 0 ? uniqueWarehouses : ["Main Warehouse", "Secondary Warehouse"]);
    } catch (err) {
      console.error('Failed to fetch warehouses:', err);
      setWarehouses(["Main Warehouse", "Secondary Warehouse"]);
    }
  };

  const handleSalesOrderSelect = useCallback(async (salesOrderId) => {
    if (!salesOrderId) {
      setProductionPhases([]);
      setFinishedGoods([]);
      setMaterials([]);
      setSubAssemblies([]);
      setFormData(prev => ({
        ...prev,
        salesOrderId: '',
        rootCardId: '',
        planName: prev.planName,
        productName: '',
        itemCode: '',
        targetQuantity: 1,
        productionStartDate: '',
        estimatedCompletionDate: '',
        stages: []
      }));
      return;
    }

    const selectedSO = salesOrders.find(so => so.id == salesOrderId);
    if (!selectedSO) return;

    try {
      setLoading(true);
      const rootCardId = selectedSO.root_card_id;
      
      // Fetch Root Card Details (to get steps data etc.)
      const response = await axios.get(`/production/portal/root-cards/${rootCardId}?all=true`, { __sessionGuard: true });
      const rootCard = response.data;
      
      console.log('Fetched root card for SO:', rootCard);
      
      // Try to get the planId from the rootCard or fetch it
      try {
        const planResponse = await axios.get(`/production/plans?rootCardId=${rootCardId}`, { __sessionGuard: true });
        if (planResponse.data.plans && planResponse.data.plans.length > 0) {
          // Find the plan that matches this rootCardId (which is actually salesOrderId)
          const plan = planResponse.data.plans.find(p => p.sales_order_id == rootCardId || p.root_card_id == rootCardId);
          if (plan) {
            console.log('Found associated production plan:', plan.id);
            setPlanId(plan.id);
          }
        }
      } catch (planErr) {
        console.warn('Could not fetch associated production plan:', planErr.message);
      }

      const step4 = rootCard.stepData?.step4_productionPlan || rootCard.steps?.step4_production || {};
      
      // Fetch BOM Details
      const bomId = selectedSO.bom_id;
      let activeBOM = null;
      if (bomId) {
        const bomResponse = await axios.get(`/engineering/bom/comprehensive/${bomId}`, { __sessionGuard: true });
        activeBOM = bomResponse.data;
      }

      // 1. Process Finished Goods
      const fgItem = {
        itemCode: selectedSO.item_code,
        productName: selectedSO.product_name,
        bomNo: activeBOM?.bomNumber || 'N/A',
        plannedQty: selectedSO.quantity,
        uom: selectedSO.uom || 'Nos',
        warehouse: selectedSO.warehouse_name || 'Finished Goods - NC',
        startDate: step4?.timeline?.startDate || new Date().toISOString().split('T')[0]
      };
      setFinishedGoods([fgItem]);

      // 2. Process Materials and Sub-assemblies recursively
      const explodeBOM = (bom, multiplier, sourceName, bomRef, sourceCode) => {
        let mats = [];
        let subAssys = [];

        // Direct materials
        if (bom.materials) {
          bom.materials.forEach(m => {
            mats.push({
              specification: m.itemName,
              requiredQty: m.quantity * multiplier,
              uom: m.uom,
              sourceAssembly: sourceName,
              sourceAssemblyCode: sourceCode,
              bomRef: bomRef
            });
          });
        }

        // Scrap/Loss materials
        if (bom.scrapLoss) {
          bom.scrapLoss.forEach(s => {
            mats.push({
              specification: s.name,
              requiredQty: (s.inputQty || 0) * multiplier,
              uom: bom.uom || 'Nos',
              sourceAssembly: sourceName,
              sourceAssemblyCode: sourceCode,
              bomRef: bomRef
            });
          });
        }

        // Components (Sub-assemblies)
        if (bom.components) {
          bom.components.forEach(comp => {
            const compMultiplier = comp.quantity * multiplier;
            const compBomRef = comp.subAssemblyDetails?.bomNumber || `BOM-${comp.subAssemblyDetails?.id || 'N/A'}`;
            
            subAssys.push({
              itemCode: comp.componentCode,
              itemName: comp.componentName,
              parentItemCode: sourceCode,
              parentItemName: sourceName,
              targetWarehouse: 'Work In Progress - NC',
              scheduledDate: step4?.timeline?.startDate || new Date().toISOString().split('T')[0],
              requiredQty: compMultiplier,
              uom: comp.uom || 'Nos',
              bomNo: compBomRef,
              manufacturingType: 'In House'
            });

            if (comp.subAssemblyDetails) {
              const { mats: childMats, subAssys: childSubAssys } = explodeBOM(
                comp.subAssemblyDetails,
                compMultiplier,
                comp.componentCode,
                compBomRef,
                comp.componentCode
              );
              mats = [...mats, ...childMats];
              subAssys = [...subAssys, ...childSubAssys];
            }
          });
        }

        return { mats, subAssys };
      };

      if (activeBOM) {
        const { mats, subAssys } = explodeBOM(
          activeBOM,
          selectedSO.quantity,
          selectedSO.product_name,
          activeBOM.bomNumber,
          selectedSO.item_code
        );
        setMaterials(mats);
        setSubAssemblies(subAssys);
      } else {
        setMaterials([]);
        setSubAssemblies([]);
      }

      // 4. Process Stages
      const bomOperations = activeBOM?.operations || [];
      let autoCreatedStages = [];

      if (bomOperations.length > 0) {
        autoCreatedStages = bomOperations.map((op, index) => ({
          id: `bom_${op.id || index}_${Date.now()}`,
          stageName: op.operationName,
          stageType: op.type === 'outsource' ? 'outsource' : 'in_house',
          plannedStartDate: step4?.timeline?.startDate || '',
          plannedEndDate: step4?.timeline?.endDate || '',
          assignedEmployeeId: null,
          facilityId: null,
          targetWarehouse: op.target_warehouse || op.targetWarehouse || '',
          notes: `Auto-populated from BOM Operation: ${op.operationName}`
        }));
        setProductionPhases(bomOperations.map(op => op.operationName));
      }

      setFormData(prev => ({
        ...prev,
        salesOrderId: salesOrderId,
        rootCardId: rootCardId,
        productName: selectedSO.product_name,
        itemCode: selectedSO.item_code,
        targetQuantity: selectedSO.quantity,
        planName: prev.planName,
        productionStartDate: step4?.timeline?.startDate || '',
        estimatedCompletionDate: step4?.timeline?.endDate || '',
        procurementStatus: step4?.timeline?.procurementStatus || 'Draft',
        stages: autoCreatedStages
      }));

      setSuccess(`✓ Successfully loaded data for Sales Order ${selectedSO.so_number}`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Failed to fetch sales order details:', err);
      setError('Failed to load sales order details');
    } finally {
      setLoading(false);
    }
  }, [salesOrders]);

  const handleRootCardSelect = useCallback(async (rootCardId) => {
    if (!rootCardId) {
      setProductionPhases([]);
      setFinishedGoods([]);
      setMaterials([]);
      setSubAssemblies([]);
      setFormData(prev => ({ ...prev, rootCardId: '', stages: [] }));
      return;
    }

    try {
      setLoading(true);
      
      // Try to find if there's a sales order for this root card
      const linkedSO = salesOrders.find(so => so.root_card_id == rootCardId);
      if (linkedSO) {
        handleSalesOrderSelect(linkedSO.id.toString());
        return;
      }

      const response = await axios.get(`/production/portal/root-cards/${rootCardId}?all=true`, { __sessionGuard: true });
      const rootCard = response.data;

      // Try to get the planId from the rootCard or fetch it
      try {
        const planResponse = await axios.get(`/production/plans?rootCardId=${rootCardId}`, { __sessionGuard: true });
        if (planResponse.data.plans && planResponse.data.plans.length > 0) {
          const plan = planResponse.data.plans.find(p => p.sales_order_id == rootCardId || p.root_card_id == rootCardId);
          if (plan) {
            console.log('Found associated production plan:', plan.id);
            setPlanId(plan.id);
          }
        }
      } catch (planErr) {
        console.warn('Could not fetch associated production plan:', planErr.message);
      }

      const step4 = rootCard.stepData?.step4_productionPlan || rootCard.steps?.step4_production || {};
      const step1 = rootCard.stepData?.step1_clientPO || rootCard.steps?.step1_clientPO || {};
      const activeBOM = rootCard.stepData?.activeBOM || rootCard.bom_details;
      
      // Populate items from BOM if available
      if (activeBOM) {
        const explodeBOM = (bom, multiplier, sourceName, bomRef, sourceCode) => {
          let mats = [];
          let subAssys = [];
          if (bom.materials) {
            bom.materials.forEach(m => {
              mats.push({
                specification: m.itemName,
                requiredQty: m.quantity * multiplier,
                uom: m.uom,
                sourceAssembly: sourceName,
                sourceAssemblyCode: sourceCode,
                bomRef: bomRef
              });
            });
          }
          if (bom.components) {
            bom.components.forEach(comp => {
              const compMultiplier = comp.quantity * multiplier;
              const compBomRef = comp.subAssemblyDetails?.bomNumber || `BOM-${comp.subAssemblyDetails?.id || 'N/A'}`;
              subAssys.push({
                itemCode: comp.componentCode,
                itemName: comp.componentName,
                parentItemCode: sourceCode,
                parentItemName: sourceName,
                targetWarehouse: 'Work In Progress - NC',
                scheduledDate: step4?.timeline?.startDate || new Date().toISOString().split('T')[0],
                requiredQty: compMultiplier,
                uom: comp.uom || 'Nos',
                bomNo: compBomRef,
                manufacturingType: 'In House'
              });
              if (comp.subAssemblyDetails) {
                const { mats: childMats, subAssys: childSubAssys } = explodeBOM(comp.subAssemblyDetails, compMultiplier, comp.componentCode, compBomRef, comp.componentCode);
                mats = [...mats, ...childMats];
                subAssys = [...subAssys, ...childSubAssys];
              }
            });
          }
          return { mats, subAssys };
        };

        const targetQty = step1.productDetails?.quantity || 1;
        const prodName = step1.productDetails?.itemName || rootCard.product_name || 'Product';
        const itemCode = step1.productDetails?.itemCode || rootCard.item_code || 'ITEM';

        const { mats, subAssys } = explodeBOM(
          activeBOM,
          targetQty,
          prodName,
          activeBOM.bomNumber || 'N/A',
          itemCode
        );
        setMaterials(mats);
        setSubAssemblies(subAssys);
        
        setFinishedGoods([{
          itemCode: itemCode,
          productName: prodName,
          bomNo: activeBOM.bomNumber || 'N/A',
          plannedQty: targetQty,
          uom: 'Nos',
          warehouse: 'Finished Goods - NC',
          startDate: step4?.timeline?.startDate || new Date().toISOString().split('T')[0]
        }]);
      }

      const bomOperations = activeBOM?.operations || [];
      let autoCreatedStages = [];
      if (bomOperations.length > 0) {
        autoCreatedStages = bomOperations.map((op, index) => ({
          id: `bom_${op.id || index}_${Date.now()}`,
          stageName: op.operationName,
          stageType: op.type === 'outsource' ? 'outsource' : 'in_house',
          plannedStartDate: step4?.timeline?.startDate || '',
          plannedEndDate: step4?.timeline?.endDate || '',
          targetWarehouse: op.target_warehouse || op.targetWarehouse || '',
          notes: `Auto-populated from BOM Operation: ${op.operationName}`
        }));
        setProductionPhases(bomOperations.map(op => op.operationName));
      } else {
        const phasesArray = step4?.selectedPhases ? Object.keys(step4.selectedPhases) : [];
        setProductionPhases(phasesArray);
        autoCreatedStages = phasesArray.map((phase, index) => ({
          id: `auto_${Date.now()}_${index}`,
          stageName: phase,
          stageType: 'in_house',
          plannedStartDate: step4?.timeline?.startDate || '',
          plannedEndDate: step4?.timeline?.endDate || '',
          targetWarehouse: '',
          notes: `Auto-created from Phase: ${phase}`
        }));
      }

      setFormData(prev => ({
        ...prev,
        rootCardId: rootCardId,
        productName: step1.productDetails?.itemName || rootCard.product_name || '',
        planName: prev.planName,
        productionStartDate: step4?.timeline?.startDate || '',
        estimatedCompletionDate: step4?.timeline?.endDate || '',
        procurementStatus: step4?.timeline?.procurementStatus || '',
        stages: autoCreatedStages
      }));
    } catch (err) {
      console.error('Failed to load root card details:', err);
    } finally {
      setLoading(false);
    }
  }, [salesOrders, handleSalesOrderSelect]);

  useEffect(() => {
    fetchSalesOrders();
    fetchEmployees();
    fetchFacilities();
    fetchWarehouses();

    if (id) {
      fetchPlanDetails(id);
      // Default to view mode if ID exists, unless explicitly specified in state
      if (location.state?.viewMode === false) {
        setIsViewMode(false);
      } else {
        setIsViewMode(true);
      }
    }
  }, [id, location.state]);

  useEffect(() => {
    if (location.state?.viewMode) {
      setIsViewMode(true);
    }
    
    // Only handle state-based selection if we're not editing an existing plan (no id)
    if (!id) {
      if (location.state?.order?.id) {
        handleSalesOrderSelect(location.state.order.id.toString());
      } else if (location.state?.rootCardId) {
        // Find SO for this root card if possible
        const so = salesOrders.find(s => s.root_card_id == location.state.rootCardId);
        if (so) {
          handleSalesOrderSelect(so.id.toString());
        } else {
          handleRootCardSelect(location.state.rootCardId.toString());
        }
      }
    }
  }, [id, location.state, salesOrders, handleSalesOrderSelect, handleRootCardSelect]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newState = {
        ...prev,
        [name]: value
      };

      return newState;
    });

    if (name === 'salesOrderId') {
      handleSalesOrderSelect(value);
    }
  };

  const handleStageInputChange = (e) => {
    const { name, value } = e.target;
    setNewStage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addStage = () => {
    if (!newStage.stageName) {
      setError('Phase name is required');
      return;
    }

    const stage = { ...newStage, id: Date.now() };
    setFormData(prev => ({
      ...prev,
      stages: [...prev.stages, stage]
    }));

    setNewStage({
      stageName: '',
      stageType: 'in_house',
      plannedStartDate: '',
      plannedEndDate: '',
      assignedEmployeeId: '',
      facilityId: '',
      targetWarehouse: '',
      notes: ''
    });

    setError('');
    setShowStageForm(false);
  };

  const removeStage = (stageId) => {
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.filter(s => s.id !== stageId)
    }));
  };

  const startEditStage = (stage) => {
    setEditingStageId(stage.id);
    setEditedStage({ ...stage });
  };

  const saveEditedStage = async () => {
    if (!editedStage.stageName.trim()) {
      setError('Phase name is required');
      return;
    }

    try {
      setFormData(prev => ({
        ...prev,
        stages: prev.stages.map(s => s.id === editingStageId ? editedStage : s)
      }));

      setEditingStageId(null);
      setEditedStage(null);
      setError('');
      setSuccess('✓ Phase updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving phase:', err);
      setError('Failed to save phase: ' + (err.response?.data?.message || err.message));
    }
  };

  const cancelEditStage = () => {
    setEditingStageId(null);
    setEditedStage(null);
  };

  const handleSubmit = async (e, shouldNavigate = true) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('='.repeat(80));
    console.log('[handleSubmit] *** FORM SUBMISSION STARTED ***');
    console.log('[handleSubmit] Current formData:', formData);
    console.log('[handleSubmit] Production phases:', productionPhases);
    console.log('='.repeat(80));

    // Validation
    if (!formData.rootCardId) {
      console.warn('[handleSubmit] Root Card ID is missing');
      setError('Please select a root card/project');
      setLoading(false);
      return null;
    }

    if (!formData.planName) {
      console.warn('[handleSubmit] Plan name is missing');
      setError('Plan name is required');
      setLoading(false);
      return null;
    }

    if (!formData.stages || formData.stages.length === 0) {
      console.warn('[handleSubmit] No manufacturing stages added');
      setError('Please add at least one manufacturing stage');
      setLoading(false);
      return null;
    }

    console.log('[handleSubmit] ✓ All validations passed');
    console.log(`[handleSubmit] Making ${id ? 'PUT' : 'POST'} to: ${id ? `/production/plans/${id}` : `/root-cards/steps/${formData.rootCardId}/production-plan`}`);
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        rootCardId: formData.rootCardId || null,
        salesOrderId: formData.salesOrderId || null,
        planName: formData.planName || 'Production Plan',
        supervisorId: formData.supervisorId || null,
        targetQuantity: formData.targetQuantity || 1,
        timeline: {
          startDate: formData.productionStartDate || null,
          endDate: formData.estimatedCompletionDate || null,
          procurementStatus: formData.procurementStatus || 'Draft'
        },
        selectedPhases: productionPhases.length > 0 ? Object.fromEntries(productionPhases.map(p => [p, true])) : {},
        estimatedCompletionDate: formData.estimatedCompletionDate || null,
        productionNotes: formData.notes || '',
        materials: materials || [],
        subAssemblies: subAssemblies || [],
        finishedGoods: finishedGoods || [],
        stages: formData.stages || []
      };

      console.log('[handleSubmit] Payload to send:', JSON.stringify(payload, null, 2));

      let response;
      if (id) {
        response = await axios.put(`/production/plans/${id}`, payload);
      } else {
        response = await axios.post(`/root-cards/steps/${formData.rootCardId}/production-plan`, payload);
      }

      console.log('[handleSubmit] ✓✓✓ SUCCESS! Response:', response.data);
      const newPlanId = id || response.data.data?.planId;
      console.log('[handleSubmit] Production plan processed with ID:', newPlanId);
      setPlanId(newPlanId);

      // Success - reset form and navigate
      setSuccess(`✓ Production plan ${id ? 'updated' : 'saved'} successfully!`);
      
      if (shouldNavigate) {
        console.log('[handleSubmit] Navigating to /department/production/plans/' + newPlanId);
        setTimeout(() => {
          if (id) {
            setIsViewMode(true);
            setSuccess('');
          } else {
            navigate(`/department/production/plans/${newPlanId}`);
          }
        }, 2000);
      }
      
      return newPlanId;
      
    } catch (err) {
      console.error('='.repeat(80));
      console.error('[handleSubmit] *** ERROR OCCURRED ***');
      console.error('[handleSubmit] Error object:', err);
      console.error('[handleSubmit] Response status:', err.response?.status);
      console.error('[handleSubmit] Response data:', err.response?.data);
      console.error('[handleSubmit] Error message:', err.response?.data?.message || err.message);
      console.error('='.repeat(80));
      
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error occurred';
      setError('Failed to create production plan: ' + errorMsg);
      setLoading(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkOrderAction = async () => {
    let currentPlanId = planId;
    
    if (!currentPlanId) {
      console.log('[handleCreateWorkOrderAction] No planId, saving plan first...');
      currentPlanId = await handleSubmit(null, false);
      if (!currentPlanId) {
        console.error('[handleCreateWorkOrderAction] Failed to save plan, aborting work order generation');
        return;
      }
    }

    setGeneratingWorkOrders(true);
    try {
      console.log('[handleCreateWorkOrderAction] Generating work orders for plan:', currentPlanId);
      const response = await axios.post(`/production/plans/${currentPlanId}/generate-work-orders`);
      setSuccess(`✓ ${response.data.message}`);
      
      // Navigate to work orders list after a short delay so user can see the success message
      setTimeout(() => {
        setSuccess('');
        navigate('/department/production/work-orders');
      }, 1500);
    } catch (err) {
      console.error('Error generating work orders:', err);
      setError('Failed to generate work orders: ' + (err.response?.data?.message || err.message));
    } finally {
      setGeneratingWorkOrders(false);
    }
  };

  const getEmployeeName = (id) => {
    const employee = employees.find(e => e.id == id);
    return employee ? employee.username : 'Unknown';
  };

  const getFacilityName = (id) => {
    const facility = facilities.find(f => f.id == id);
    return facility ? facility.name : 'Not assigned';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
            >
              <ArrowLeft size={20} className="text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded border border-blue-100 dark:border-blue-800">
                    PP
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">/</span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {id ? (isViewMode ? 'View Production Plan' : 'Edit Production Plan') : 'New Production Plan'}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded border border-slate-200 dark:border-slate-700">
                  {formData.procurementStatus?.toLowerCase() || 'draft'}
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                {id ? (isViewMode ? `Production Plan: ${formData.planName}` : `Edit Plan: ${formData.planName}`) : 'New Production Plan'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isViewMode ? (
              <button
                type="button"
                onClick={() => setIsViewMode(false)}
                className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-lg shadow-purple-600/20 transition-all text-sm"
              >
                <Edit2 size={18} />
                Edit Plan
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => id ? setIsViewMode(true) : navigate(-1)}
                  className="text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white transition-all text-sm px-2"
                >
                  {id ? 'Cancel Editing' : 'Discard Changes'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-slate-900 dark:bg-slate-700 text-white font-bold hover:bg-black dark:hover:bg-slate-800 disabled:bg-slate-400 transition-all text-xs border border-slate-800 dark:border-slate-600 shadow-sm"
                >
                  {loading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  {id ? 'Update Strategic Plan' : 'Save Strategic Plan'}
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle size={18} />
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-slate-700 pb-1">
          <div className="flex items-center gap-1">
            {[
              { id: 'strategic', label: 'Basic Info', icon: Settings },
              { id: 'finishedGoods', label: 'Finished Goods', icon: Package },
              { id: 'materials', label: 'Materials', icon: Layers },
              { id: 'subAssemblies', label: 'Sub Assemblies', icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  const el = document.getElementById(`section-${tab.id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all border-b-2 border-transparent hover:text-purple-600 text-slate-500"
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-md hover:bg-indigo-700 transition-all uppercase tracking-wider shadow-sm">
            <Activity size={14} />
            Production Progress
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-8">
          <div id="section-strategic">{renderStrategicSection()}</div>
          <div id="section-finishedGoods">{renderFinishedGoodsSection()}</div>
          <div id="section-materials">{renderMaterialsSection()}</div>
          <div id="section-subAssemblies">{renderSubAssembliesSection()}</div>
        </div>

        <MaterialRequestModal 
          isOpen={showMaterialRequestModal} 
          onClose={() => setShowMaterialRequestModal(false)}
          data={formData}
          materials={materials}
          planId={planId}
          onSavePlan={() => handleSubmit(null, false)}
        />

        {/* Footer Bar */}
        <div className="mt-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-2">
            <div className="flex items-center gap-8 w-full md:w-auto">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Plan Status</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded border border-slate-200 dark:border-slate-700">
                    {formData.procurementStatus || 'Draft'}
                  </span>
                  <span className="text-slate-400 text-xs font-medium">{formData.procurementStatus || 'Draft'}</span>
                </div>
              </div>
              <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Materials</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {materials?.length || 0} Items Calculated
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
              <button 
                onClick={handleCreateWorkOrderAction}
                disabled={loading || generatingWorkOrders || (!formData.salesOrderId && !formData.rootCardId)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded text-xs font-bold hover:bg-black transition-all shadow-md disabled:bg-slate-400"
              >
                {generatingWorkOrders ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Zap size={14} className="text-yellow-400" />
                )}
                Work Orders
              </button>
              <button 
                onClick={() => setShowMaterialRequestModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 text-xs font-bold  transition-all shadow-sm"
              >
                <Package size={14} className="text-blue-500" />
                Material Request
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 text-xs font-bold  transition-all shadow-sm">
                <FileText size={14} className="text-orange-500" />
                Purchase Order
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded font-bold  transition-all text-xs border border-slate-800 hover:bg-black dark:border-slate-600 shadow-md"
                
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Strategic Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionPlanFormPage;
