import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Activity, 
  Clock, 
  TrendingUp, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  Layers
} from 'lucide-react';
import axios from '../../../utils/api';
import { format } from 'date-fns';

const JobCardDetailsModal = ({ isOpen, onClose, operation }) => {
  const [loading, setLoading] = useState(false);
  const [intelData, setIntelData] = useState(null);

  const fetchIntelligence = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/production/work-orders/operations/${operation.id}/details`);
      const opDetails = response.data;
      const logs = opDetails.logs || {};
      
      const totalProduced = opDetails.produced_qty || 0;
      const totalAccepted = logs.qualityEntries?.reduce((sum, entry) => sum + (parseFloat(entry.accepted_qty) || 0), 0) || 0;
      const totalRejected = logs.qualityEntries?.reduce((sum, entry) => sum + (parseFloat(entry.rejected_qty) || 0), 0) || 0;
      const totalScrap = logs.qualityEntries?.reduce((sum, entry) => sum + (parseFloat(entry.scrap_qty) || 0), 0) || 0;
      
      const yieldRate = totalProduced > 0 ? (totalAccepted / totalProduced) * 100 : 100;
      
      // Process logs into shifts for the Production Intelligence Feed
      const shiftMap = {};
      
      // Combine info from time logs and quality entries
      (logs.timeLogs || []).forEach(log => {
        const date = format(new Date(log.start_time), 'yyyy-MM-dd');
        const shift = log.shift || 'A';
        const key = `${date}-${shift}`;
        
        if (!shiftMap[key]) {
          shiftMap[key] = {
            date: format(new Date(log.start_time), 'dd MMM'),
            day: format(new Date(log.start_time), 'EEEE'),
            shift: shift,
            grossOutput: 0,
            validatedYield: 0,
            rejection: 0,
            scrap: 0,
            downtimeMinutes: 0
          };
        }
        shiftMap[key].grossOutput += parseFloat(log.produced_qty) || 0;
      });

      (logs.qualityEntries || []).forEach(entry => {
        const date = format(new Date(entry.inspection_date), 'yyyy-MM-dd');
        const shift = entry.shift || 'A';
        const key = `${date}-${shift}`;
        
        if (!shiftMap[key]) {
          shiftMap[key] = {
            date: format(new Date(entry.inspection_date), 'dd MMM'),
            day: format(new Date(entry.inspection_date), 'EEEE'),
            shift: shift,
            grossOutput: 0,
            validatedYield: 0,
            rejection: 0,
            scrap: 0,
            downtimeMinutes: 0
          };
        }
        shiftMap[key].validatedYield += parseFloat(entry.accepted_qty) || 0;
        shiftMap[key].rejection += parseFloat(entry.rejected_qty) || 0;
        shiftMap[key].scrap += parseFloat(entry.scrap_qty) || 0;
      });

      (logs.downtimeLogs || []).forEach(log => {
        const date = format(new Date(log.start_time), 'yyyy-MM-dd');
        const shift = log.shift || 'A';
        const key = `${date}-${shift}`;
        
        if (!shiftMap[key]) {
          shiftMap[key] = {
            date: format(new Date(log.start_time), 'dd MMM'),
            day: format(new Date(log.start_time), 'EEEE'),
            shift: shift,
            grossOutput: 0,
            validatedYield: 0,
            rejection: 0,
            scrap: 0,
            downtimeMinutes: 0
          };
        }
        
        if (log.start_time && log.end_time) {
          const diff = (new Date(log.end_time) - new Date(log.start_time)) / (1000 * 60);
          shiftMap[key].downtimeMinutes += Math.round(diff);
        }
      });

      const shiftsArray = Object.values(shiftMap).sort((a, b) => new Date(a.date) - new Date(b.date));

      setIntelData({
        yield: Math.round(yieldRate),
        plannedCapacity: opDetails.target_qty || operation.work_order_qty || 0,
        acceptedOutput: totalAccepted,
        transferred: 0, // Not available in current API
        available: (opDetails.target_qty || 0) - totalAccepted,
        progress: Math.round(((opDetails.produced_qty || 0) / (opDetails.target_qty || 1)) * 100),
        
        timeline: {
          scheduledStart: opDetails.planned_start_date ? format(new Date(opDetails.planned_start_date), 'dd/MM/yy') : 'N/A',
          estimatedEnd: opDetails.planned_end_date ? format(new Date(opDetails.planned_end_date), 'dd/MM/yy') : 'N/A'
        },
        costing: {
          hourlyRate: 0, // Mock for now
          actualCost: 0  // Mock for now
        },
        assignment: {
          assignedUnit: opDetails.workstation_name || 'N/A',
          operatorVendor: opDetails.operator_name || opDetails.vendor_name || 'Unassigned'
        },
        
        shifts: shiftsArray.map(s => ({
          day: s.day,
          date: s.date,
          shift: s.shift,
          grossOutput: s.grossOutput,
          validatedYield: s.validatedYield,
          rejection: s.rejection,
          scrap: s.scrap,
          downtimeIndex: `${s.downtimeMinutes}m`
        })),
        
        aggregateSummary: {
          grossOutput: totalProduced,
          validatedYield: totalAccepted,
          rejection: totalRejected,
          scrap: totalScrap,
          downtimeIndex: `${shiftsArray.reduce((acc, curr) => acc + curr.downtimeMinutes, 0)}m`
        },
        
        temporalLogs: (logs.timeLogs || []).map(log => ({
          phaseDay: format(new Date(log.start_time), 'dd/MM'),
          durationWindow: `${format(new Date(log.start_time), 'hh:mm a')} - ${log.end_time ? format(new Date(log.end_time), 'hh:mm a') : '...' }`,
          shift: log.shift,
          yield: log.produced_qty
        })),
        
        deficiencyReport: (logs.qualityEntries || []).filter(e => e.rejected_qty > 0 || e.scrap_qty > 0).map(e => ({
          incident: format(new Date(e.inspection_date), 'dd/MM'),
          defectReason: e.rejection_reason || 'N/A',
          rejection: e.rejected_qty,
          scrap: e.scrap_qty
        }))
      });
    } catch (error) {
      console.error('Error fetching intelligence data', error);
    } finally {
      setLoading(false);
    }
  }, [operation]);

  useEffect(() => {
    if (isOpen && operation) {
      fetchIntelligence();
    }
  }, [isOpen, operation, fetchIntelligence]);

  if (!isOpen || !operation) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <h3 className="text-lg font-bold text-slate-900">Operational Intelligence</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 relative">
          {loading ? (
             <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
             </div>
          ) : null}
          
          {/* Top Dark Card Map */}
          <div className="bg-slate-900 rounded-2xl p-6 mb-6 text-white shadow-xl relative overflow-hidden shadow-indigo-900/20">
             {/* Decorative background glow */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             
             <div className="relative z-10 flex flex-col gap-6">
                 {/* Top row with badges */}
                 <div className="flex justify-between items-start">
                     <div className="flex gap-3 items-center">
                         <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-bold text-slate-300 border border-slate-700">
                             ID: JC-{operation.work_order_no?.split('-')?.pop() || operation.work_order_id}-{operation.id}
                         </span>
                         <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                             operation.status === 'in_progress' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                             operation.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                             'bg-blue-500/10 text-blue-500 border-blue-500/20'
                         }`}>
                             {operation.status === 'in_progress' ? 'in progress' : operation.status?.replace('_', ' ')}
                         </span>
                     </div>
                     <div className="text-right">
                         <p className="text-xs text-slate-400 font-medium">Quality Yield</p>
                         <h4 className="text-xl font-black text-indigo-400">{intelData?.yield || 0}%</h4>
                     </div>
                 </div>

                 {/* Title & Ref */}
                 <div>
                     <h2 className="text-2xl font-black mb-1">{operation.operation_name}</h2>
                     <p className="text-sm text-slate-400 font-medium tracking-wide">Work Order: {operation.work_order_no}</p>
                 </div>

                 {/* Stats & Progress Row */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end mt-2">
                     <div>
                         <p className="text-xs text-slate-400 font-medium mb-1">Planned Capacity</p>
                         <p className="font-bold">{parseFloat(intelData?.plannedCapacity || 0).toFixed(2)} Units</p>
                     </div>
                     <div>
                         <p className="text-xs text-slate-400 font-medium mb-1">Accepted Output</p>
                         <p className="font-bold text-emerald-400">{parseFloat(intelData?.acceptedOutput || 0).toFixed(2)} Units</p>
                         <p className="text-[10px] text-slate-500 font-medium mt-0.5">Total Produced: {parseFloat(operation?.produced_qty || intelData?.acceptedOutput || 0).toFixed(2)}</p>
                     </div>
                     <div>
                         <p className="text-xs text-slate-400 font-medium mb-1">Transferred</p>
                         <p className="font-bold text-indigo-400">{parseFloat(intelData?.transferred || 0).toFixed(2)} Units</p>
                         <p className="text-[10px] text-slate-500 font-medium mt-0.5">Available: {parseFloat(intelData?.available || 0).toFixed(2)}</p>
                     </div>
                     <div className="pt-2">
                         <div className="flex justify-between items-center mb-2">
                            <p className="text-xs text-slate-400 font-medium">Production Progress</p>
                            <p className="text-xs font-bold text-indigo-400">{intelData?.progress || 0}%</p>
                         </div>
                         <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full relative" 
                              style={{ width: `${intelData?.progress || 0}%` }}
                            >
                                <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse" />
                            </div>
                         </div>
                     </div>
                 </div>
             </div>
          </div>

          {/* Three Middle Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Timeline */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                          <Clock size={16} />
                      </div>
                      <h4 className="font-bold text-slate-700 text-sm">Operational Timeline</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <p className="text-xs text-slate-400 font-medium mb-1">Scheduled Start</p>
                          <p className="font-bold text-slate-900">{intelData?.timeline?.scheduledStart}</p>
                      </div>
                      <div>
                          <p className="text-xs text-slate-400 font-medium mb-1">Estimated End</p>
                          <p className="font-bold text-slate-900">{intelData?.timeline?.estimatedEnd}</p>
                      </div>
                  </div>
              </div>

              {/* Costing */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
                          <TrendingUp size={16} />
                      </div>
                      <h4 className="font-bold text-slate-700 text-sm">Costing Details</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <p className="text-xs text-slate-400 font-medium mb-1">Hourly Rate</p>
                          <p className="font-bold text-slate-900">₹{parseFloat(intelData?.costing?.hourlyRate || 0).toFixed(2)}</p>
                      </div>
                      <div>
                          <p className="text-xs text-slate-400 font-medium mb-1">Actual Cost</p>
                          <p className="font-bold text-slate-900">₹{parseFloat(intelData?.costing?.actualCost || 0).toFixed(2)}</p>
                      </div>
                  </div>
              </div>

              {/* Assignment */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-purple-50 text-purple-600 rounded-md">
                          <User size={16} />
                      </div>
                      <h4 className="font-bold text-slate-700 text-sm">Assignment Data</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <p className="text-xs text-slate-400 font-medium mb-1">Assigned Unit</p>
                          <p className="font-bold text-slate-900">{intelData?.assignment?.assignedUnit}</p>
                      </div>
                      <div>
                          <p className="text-xs text-slate-400 font-medium mb-1">Operator / Vendor</p>
                          <p className="font-bold text-slate-900 truncate" title={intelData?.assignment?.operatorVendor}>
                              {intelData?.assignment?.operatorVendor}
                          </p>
                      </div>
                  </div>
              </div>
          </div>

          {/* Intelligence Sections Wrapper */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
              
              {/* 1. Production Feed */}
              <div className="p-5 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                          <Activity size={16} className="text-indigo-500" />
                          <h4 className="font-bold text-sm text-slate-700">Production Intelligence Feed</h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Real-time Data Sync</span>
                      </div>
                  </div>

                  <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                          <thead>
                              <tr className="text-left text-xs font-bold text-slate-400 border-b border-slate-100">
                                  <th className="pb-3 pl-2">Timeline Sequence</th>
                                  <th className="pb-3 text-center">Operational Shift</th>
                                  <th className="pb-3 text-right">Gross Output</th>
                                  <th className="pb-3 text-right text-emerald-500">Validated Yield</th>
                                  <th className="pb-3 text-right text-red-500">Rejection</th>
                                  <th className="pb-3 text-right text-amber-500">Scrap</th>
                                  <th className="pb-3 text-right text-indigo-500 pr-2">Downtime Index</th>
                              </tr>
                          </thead>
                          <tbody>
                              {intelData?.shifts?.map((shift, i) => (
                                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                      <td className="py-3 pl-2">
                                          <p className="font-bold text-slate-700">{shift.day}</p>
                                          <p className="text-[11px] text-slate-400">{shift.date}</p>
                                      </td>
                                      <td className="py-3 text-center">
                                          <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-bold border border-purple-100">
                                              {shift.shift}
                                          </span>
                                      </td>
                                      <td className="py-3 text-right font-bold text-slate-800">{parseFloat(shift.grossOutput).toFixed(2)}</td>
                                      <td className="py-3 text-right font-bold text-emerald-500">{parseFloat(shift.validatedYield).toFixed(2)}</td>
                                      <td className="py-3 text-right font-bold text-red-500">{parseFloat(shift.rejection).toFixed(2)}</td>
                                      <td className="py-3 text-right font-bold text-amber-500">{parseFloat(shift.scrap).toFixed(2)}</td>
                                      <td className="py-3 text-right font-bold text-indigo-500 pr-2">{shift.downtimeIndex}</td>
                                  </tr>
                              ))}
                              {/* Aggregate row matching screenshot */}
                              <tr className="bg-slate-900 text-white overflow-hidden">
                                  <td colSpan={2} className="py-4 pl-4 font-bold text-sm rounded-l-xl">Aggregate Yield Matrix</td>
                                  <td className="py-4 text-right font-bold text-slate-300">{parseFloat(intelData?.aggregateSummary?.grossOutput || 0).toFixed(2)}</td>
                                  <td className="py-4 text-right font-bold text-emerald-400">{parseFloat(intelData?.aggregateSummary?.validatedYield || 0).toFixed(2)}</td>
                                  <td className="py-4 text-right font-bold text-red-400">{parseFloat(intelData?.aggregateSummary?.rejection || 0).toFixed(2)}</td>
                                  <td className="py-4 text-right font-bold text-amber-400">{parseFloat(intelData?.aggregateSummary?.scrap || 0).toFixed(2)}</td>
                                  <td className="py-4 text-right font-bold text-indigo-400 pr-4 rounded-r-xl">{intelData?.aggregateSummary?.downtimeIndex}</td>
                              </tr>
                          </tbody>
                      </table>
                  </div>
              </div>

              {/* 2. Temporal Logs */}
              <div className="p-5 border-b border-slate-100">
                   <div className="flex items-center gap-2 mb-4">
                      <Clock size={16} className="text-blue-500" />
                      <h4 className="font-bold text-sm text-slate-700">Temporal Intelligence Logs</h4>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                          <thead>
                              <tr className="text-left text-[11px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">
                                  <th className="pb-3 pl-2">Phase Day</th>
                                  <th className="pb-3">Duration Window</th>
                                  <th className="pb-3 text-center">Shift</th>
                                  <th className="pb-3 text-right pr-2">Yield</th>
                              </tr>
                          </thead>
                          <tbody>
                              {intelData?.temporalLogs?.map((log, i) => (
                                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                                      <td className="py-3 pl-2 font-bold text-slate-700">{log.phaseDay}</td>
                                      <td className="py-3 text-slate-500 text-xs">
                                          {log.durationWindow.split('-')[0]} <span className="text-slate-300 mx-1">{'>'}</span> {log.durationWindow.split('-')[1]}
                                      </td>
                                      <td className="py-3 text-center font-bold text-slate-600">
                                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px]">{log.shift}</span>
                                      </td>
                                      <td className="py-3 text-right font-bold text-slate-800 pr-2">{parseFloat(log.yield).toFixed(2)}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>

              {/* 3. Deficiency Report */}
              <div className="p-5">
                   <div className="flex items-center gap-2 mb-4">
                      <AlertCircle size={16} className="text-red-500" />
                      <h4 className="font-bold text-sm text-red-500">Quality Deficiency Report</h4>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                          <thead>
                              <tr className="text-left text-[11px] font-bold text-red-500 border-b border-slate-100 uppercase tracking-wider">
                                  <th className="pb-3 pl-2">Incident</th>
                                  <th className="pb-3">Defect Reason</th>
                                  <th className="pb-3 text-right">Rejection</th>
                                  <th className="pb-3 text-right pr-2 text-amber-500">Scrap</th>
                              </tr>
                          </thead>
                          <tbody>
                              {intelData?.deficiencyReport?.map((report, i) => (
                                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                                      <td className="py-3 pl-2 font-bold text-slate-700">{report.incident}</td>
                                      <td className="py-3 text-slate-500 font-bold">"{report.defectReason}"</td>
                                      <td className="py-3 text-right font-bold text-red-500">{parseFloat(report.rejection).toFixed(2)}</td>
                                      <td className="py-3 text-right font-bold text-amber-500 pr-2">{parseFloat(report.scrap).toFixed(2)}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>

          <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-4 flex items-center gap-3">
              <Layers className="text-amber-500 w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium text-amber-700">No supplemental operational data recorded for this phase.</p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-between items-center gap-3">
           <button
             onClick={onClose}
             className="px-4 py-2 font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-sm"
           >
             <X size={16} /> Terminate View
           </button>
           <button
             onClick={onClose}
             className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
           >
             <Zap size={16} className="text-indigo-400" />
             Transition to completed
           </button>
        </div>
      </div>
    </div>
  );
};

export default JobCardDetailsModal;
