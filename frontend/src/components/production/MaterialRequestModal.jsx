import React, { useState, useMemo } from 'react';
import { Send, Activity, X, FileText, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/api';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';

const MaterialRequestModal = ({ isOpen, onClose, data, materials, planId, onSavePlan }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Consolidate materials: group by specification/itemCode and sum quantities
  const consolidatedMaterials = useMemo(() => {
    if (!materials || !Array.isArray(materials)) return [];

    const map = new Map();

    materials.forEach(item => {
      const key = item.itemCode || item.materialCode || item.specification || item.itemName;
      if (map.has(key)) {
        const existing = map.get(key);
        existing.requiredQty = Number(existing.requiredQty) + Number(item.requiredQty || 0);
        
        // Combine source names if they are different
        if (item.sourceAssembly && !existing.sourceAssembly.includes(item.sourceAssembly)) {
          existing.sourceAssembly += `, ${item.sourceAssembly}`;
        }
      } else {
        map.set(key, { ...item, requiredQty: Number(item.requiredQty || 0) });
      }
    });

    return Array.from(map.values());
  }, [materials]);

  if (!isOpen) return null;

  const handleProcessRequest = async () => {
    let currentPlanId = planId;

    if (!currentPlanId && typeof onSavePlan === 'function') {
      const savedPlanId = await onSavePlan();
      if (!savedPlanId) return;
      currentPlanId = savedPlanId;
    }

    // Try multiple possible property names for the Sales Order ID
    const finalRootCardId = data?.salesOrderId || data?.sales_order_id || data?.rootCardId || data?.root_card_id;
    
    if (!finalRootCardId || finalRootCardId === '0' || finalRootCardId === '') {
      Swal.fire({
        icon: 'error',
        title: 'Missing Source',
        text: 'A Sales Order must be linked to create Material Requests. (Source ID is missing)',
        confirmButtonColor: '#0f172a'
      });
      return;
    }

    if (!consolidatedMaterials || consolidatedMaterials.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'No Items',
        text: 'At least one material must be selected to create a request.',
        confirmButtonColor: '#0f172a'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('--- Material Request Payload Debug ---');
      const payload = {
        rootCardId: finalRootCardId,
        productionPlanId: currentPlanId,
        department: 'Production',
        purpose: 'Material Issue',
        requiredDate: data.estimatedCompletionDate,
        priority: 'medium',
        remarks: `Generated from Production Plan: ${data.planName}`,
        items: consolidatedMaterials.map(m => ({
          materialName: m.itemName || m.specification || 'Unknown Material',
          materialCode: m.itemCode || m.materialCode || m.specification || null,
          materialType: m.materialType || null,
          quantity: m.requiredQty || 0,
          unit: m.uom || 'Nos',
          specification: m.specification || null
        }))
      };
      console.log('Payload:', JSON.stringify(payload, null, 2));

      await axios.post('/inventory/material-requests', payload);
      
      Swal.fire({
        icon: 'success',
        title: 'Requests Generated',
        text: 'Material requests have been successfully sent to procurement.',
        confirmButtonColor: '#0f172a'
      }).then(() => {
        // Only redirect to inventory manager page if user is admin or inventory manager
        // Production users should stay on their current page (production plan)
        const isProductionUser = user?.role?.toLowerCase().includes('production');
        const canViewInventory = ['Admin', 'Inventory Manager', 'Inventory', 'Procurement'].includes(user?.role);
        
        if (canViewInventory && !isProductionUser) {
          navigate('/inventory-manager/material-requests');
        }
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


          {/* Components List */}
          <div>
            <div className="flex items-center gap-2 mb-4 px-1">
              <div className="w-1 h-4 bg-green-500 rounded-full" />
              <h3 className="text-xs font-bold text-black dark:text-slate-200 uppercase tracking-wider">Requested Components ({consolidatedMaterials?.length || 0})</h3>
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
                  {consolidatedMaterials && consolidatedMaterials.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">
                            {m.itemName || m.specification}
                            {(m.itemCode || m.materialCode) && (
                              <span className="ml-1 text-slate-400 font-medium">
                                ({m.itemCode || m.materialCode})
                              </span>
                            )}
                          </p>
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
            disabled={isSubmitting || !materials || materials.length === 0}
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

export default MaterialRequestModal;
