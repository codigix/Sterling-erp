import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Clock, CheckCircle, AlertCircle, Play, Pause, 
  Trash2, Plus, Calendar, User, Settings, Box, 
  TrendingUp, Activity, FileText, Download, Save, Loader2,
  ChevronRight, Info, ShieldCheck, Zap
} from 'lucide-react';
import axios from '../../utils/api';
import Swal from 'sweetalert2';
import { format } from 'date-fns';

const ProductionEntryPage = () => {
  const { id } = useParams(); // Operation ID
  const navigate = useNavigate();
  const location = useLocation();
  const [operation, setOperation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Section Refs for scrolling
  const timeLogsRef = useRef(null);
  const qualityRef = useRef(null);
  const downtimeRef = useRef(null);
  const nextOpRef = useRef(null);
  const reportRef = useRef(null);

  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Form states
  const [timeLogForm, setTimeLogForm] = useState({
    operatorId: '',
    workstationId: '',
    shift: 'A',
    startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    producedQty: 0,
    notes: ''
  });

  const [qualityForm, setQualityForm] = useState({
    operatorId: '',
    shift: 'A',
    inspectionDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    acceptedQty: 0,
    rejectedQty: 0,
    scrapQty: 0,
    rejectionReason: '',
    notes: ''
  });

  const [downtimeForm, setDowntimeForm] = useState({
    downtimeType: '',
    shift: 'A',
    startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    notes: ''
  });

  // Master data for selects
  const [employees, setEmployees] = useState([]);
  const [workstations, setWorkstations] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [opRes, empRes, wsRes] = await Promise.all([
        axios.get(`/production/work-orders/operations/${id}/details`),
        axios.get('/employee/portal/employees'), // Adjust path based on your API
        axios.get('/production/workstations')
      ]);
      
      setOperation(opRes.data);
      setEmployees(empRes.data || []);
      setWorkstations(wsRes.data.workstations || []);
      
      // Get query parameters for auto-filling
      const queryParams = new URLSearchParams(location.search);
      const qOperatorId = queryParams.get('operatorId');
      const qStartTime = queryParams.get('startTime');
      const qEndTime = queryParams.get('endTime');
      const qNotes = queryParams.get('notes');
      const qProducedQty = parseInt(queryParams.get('producedQty')) || 0;
      const qRejectedQty = parseInt(queryParams.get('rejectedQty')) || 0;
      const qScrapQty = parseInt(queryParams.get('scrapQty')) || 0;

      // Initialize forms with operation defaults and query params
      setTimeLogForm(prev => ({
        ...prev,
        operatorId: qOperatorId || opRes.data.operator_id || '',
        workstationId: opRes.data.workstation_id || '',
        startTime: qStartTime ? format(new Date(qStartTime), "yyyy-MM-dd'T'HH:mm") : prev.startTime,
        endTime: qEndTime ? format(new Date(qEndTime), "yyyy-MM-dd'T'HH:mm") : prev.endTime,
        producedQty: qProducedQty || prev.producedQty,
        notes: qNotes || prev.notes
      }));
      setQualityForm(prev => ({
        ...prev,
        operatorId: qOperatorId || opRes.data.operator_id || '',
        inspectionDate: qEndTime ? format(new Date(qEndTime), "yyyy-MM-dd'T'HH:mm") : prev.inspectionDate,
        acceptedQty: qProducedQty ? (qProducedQty - qRejectedQty - qScrapQty) : prev.acceptedQty,
        rejectedQty: qRejectedQty || prev.rejectedQty,
        scrapQty: qScrapQty || prev.scrapQty
      }));
      
      setError(null);
    } catch (err) {
      console.error('Error fetching production entry data:', err);
      setError('Failed to load production entry details');
    } finally {
      setLoading(false);
    }
  }, [id, location.search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddTimeLog = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`/production/work-orders/operations/${id}/time-logs`, timeLogForm);
      Swal.fire({
        title: 'Success',
        text: 'Time log recorded successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      fetchData(); // Refresh logs
    } catch {
      Swal.fire('Error', 'Failed to record time log', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddQualityEntry = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`/production/work-orders/operations/${id}/quality-entries`, qualityForm);
      Swal.fire({
        title: 'Success',
        text: 'Quality entry saved successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      fetchData(); // Refresh logs
    } catch {
      Swal.fire('Error', 'Failed to save quality entry', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddDowntimeLog = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`/production/work-orders/operations/${id}/downtime-logs`, downtimeForm);
      Swal.fire({
        title: 'Success',
        text: 'Downtime log recorded successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      fetchData(); // Refresh logs
    } catch {
      Swal.fire('Error', 'Failed to record downtime log', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteProductionEntry = async () => {
    const result = await Swal.fire({
      title: 'Complete Production Entry?',
      text: "This will mark the production entry task as finished and close this operation.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, complete it!'
    });

    if (result.isConfirmed) {
      setSubmitting(true);
      try {
        await axios.post(`/production/work-orders/operations/${id}/complete-entry`);
        await Swal.fire({
          title: 'Task Completed!',
          text: 'The production entry has been finalized.',
          icon: 'success',
          timer: 2000
        });
        navigate('/department/production/job-cards');
      } catch (err) {
        console.error('Error completing production entry:', err);
        Swal.fire('Error', 'Failed to complete production entry task', 'error');
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={40} />
          <p className="text-slate-600 font-medium">Loading production entry...</p>
        </div>
      </div>
    );
  }

  if (error || !operation) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-2xl mx-auto">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Error</h2>
          <p className="text-slate-600 mb-6">{error || 'Operation not found'}</p>
          <button onClick={() => navigate(-1)} className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ArrowLeft size={20} className="text-slate-600" />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-slate-900">Production Entry</h1>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    operation.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {operation.status?.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="font-medium text-slate-700">{operation.work_order_no}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>{format(new Date(), 'd MMMM yyyy')}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleCompleteProductionEntry}
                disabled={submitting || operation?.status === 'completed'}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50"
              >
                <CheckCircle size={18} />
                Complete Production Entry
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <Download size={18} />
                Download CSV
              </button>
              <button onClick={() => navigate(-1)} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-all shadow-sm">
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        {/* Operation Header Info */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Box size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Target Item</p>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{operation.item_name}</h3>
              <p className="text-[11px] text-slate-500">{operation.operation_name}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <TrendingUp size={24} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Production Progress</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900">{operation.produced_qty || 0} / {operation.target_qty}</span>
                <span className="text-xs font-bold text-blue-600">{Math.round(((operation.produced_qty || 0) / operation.target_qty) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, ((operation.produced_qty || 0) / operation.target_qty) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Quality Yield</p>
              <h3 className="text-sm font-bold text-slate-900">
                {operation.logs?.qualityEntries?.reduce((acc, curr) => acc + (curr.accepted_qty || 0), 0) || 0} Units
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium">98.5% Quality Rate</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Productivity</p>
              <h3 className="text-sm font-bold text-slate-900">0 Units/hr</h3>
              <p className="text-[11px] text-slate-500 font-medium">Below Target</p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons (Scroll to Section) */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 w-fit sticky top-[84px] z-20 shadow-sm">
          <button 
            onClick={() => scrollToSection(timeLogsRef)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Clock size={18} />
            Time Logs
          </button>
          <button 
            onClick={() => scrollToSection(qualityRef)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <ShieldCheck size={18} />
            Quality Check
          </button>
          <button 
            onClick={() => scrollToSection(downtimeRef)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <AlertCircle size={18} />
            Downtime Logs
          </button>
          <button 
            onClick={() => scrollToSection(nextOpRef)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <ChevronRight size={18} />
            Next Operation
          </button>
          <button 
            onClick={() => scrollToSection(reportRef)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <FileText size={18} />
            Daily Report
          </button>
        </div>

        {/* Form and Data Section */}
        <div className="space-y-12 pb-20">
          {/* Time Logs Section */}
          <div ref={timeLogsRef} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden scroll-mt-32">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Clock size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Add Time Log</h2>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleAddTimeLog} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Day & Date <span className="text-red-500">*</span></label>
                  <input 
                    type="datetime-local" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                    value={timeLogForm.startTime}
                    onChange={(e) => setTimeLogForm({...timeLogForm, startTime: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Operator <span className="text-red-500">*</span></label>
                  <select 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                    value={timeLogForm.operatorId}
                    onChange={(e) => setTimeLogForm({...timeLogForm, operatorId: e.target.value})}
                    required
                  >
                    <option value="">Select Operator</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Workstation <span className="text-red-500">*</span></label>
                  <select 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                    value={timeLogForm.workstationId}
                    onChange={(e) => setTimeLogForm({...timeLogForm, workstationId: e.target.value})}
                    required
                  >
                    <option value="">Select Machine</option>
                    {workstations.map(ws => <option key={ws.id} value={ws.id}>{ws.display_name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Shift <span className="text-red-500">*</span></label>
                  <select 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                    value={timeLogForm.shift}
                    onChange={(e) => setTimeLogForm({...timeLogForm, shift: e.target.value})}
                  >
                    <option value="A">Shift A</option>
                    <option value="B">Shift B</option>
                    <option value="C">Shift C</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Produce Qty <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                      value={timeLogForm.producedQty}
                      onChange={(e) => setTimeLogForm({...timeLogForm, producedQty: e.target.value})}
                      required
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-bold text-slate-400">UNITS</span>
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50"
                >
                  <Play size={16} fill="white" />
                  Record Time
                </button>
              </form>
            </div>
            
            <div className="border-t border-slate-100">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Day & Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Operator</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Time Interval</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Produced Qty</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {operation.logs?.timeLogs?.length > 0 ? (
                    operation.logs.timeLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-600">{format(new Date(log.start_time), 'dd-MM-yyyy')}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">{log.operator_name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {format(new Date(log.start_time), 'hh:mm a')} → {log.end_time ? format(new Date(log.end_time), 'hh:mm a') : '--:--'}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{log.produced_qty}</td>
                        <td className="px-6 py-4">
                          <button className="p-1.5 text-slate-400 hover:text-red-600 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500 italic">No production time recorded for this job card yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quality Check Section */}
          <div ref={qualityRef} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden scroll-mt-32">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Quality & Rejection Entry</h2>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleAddQualityEntry} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Day & Date <span className="text-red-500">*</span></label>
                  <input 
                    type="datetime-local" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                    value={qualityForm.inspectionDate}
                    onChange={(e) => setQualityForm({...qualityForm, inspectionDate: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Shift <span className="text-red-500">*</span></label>
                  <select 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                    value={qualityForm.shift}
                    onChange={(e) => setQualityForm({...qualityForm, shift: e.target.value})}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Produce Qty</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                    value={qualityForm.acceptedQty + qualityForm.rejectedQty + qualityForm.scrapQty}
                    readOnly
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Rejection Reason</label>
                  <select 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                    value={qualityForm.rejectionReason}
                    onChange={(e) => setQualityForm({...qualityForm, rejectionReason: e.target.value})}
                  >
                    <option value="">Select Reason</option>
                    <option value="Dimensional Error">Dimensional Error</option>
                    <option value="Surface Defect">Surface Defect</option>
                    <option value="Material Flaw">Material Flaw</option>
                  </select>
                </div>
                <div className="lg:col-span-1 grid grid-cols-3 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-emerald-500 uppercase">Accepted</label>
                    <input 
                      type="number" 
                      className="w-full px-2 py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-sm font-bold text-emerald-600 outline-none"
                      value={qualityForm.acceptedQty}
                      onChange={(e) => setQualityForm({...qualityForm, acceptedQty: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-red-500 uppercase">Rejected</label>
                    <input 
                      type="number" 
                      className="w-full px-2 py-2 bg-red-50 border border-red-100 rounded-lg text-sm font-bold text-red-600 outline-none"
                      value={qualityForm.rejectedQty}
                      onChange={(e) => setQualityForm({...qualityForm, rejectedQty: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Scrap</label>
                    <input 
                      type="number" 
                      className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 outline-none"
                      value={qualityForm.scrapQty}
                      onChange={(e) => setQualityForm({...qualityForm, scrapQty: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50"
                >
                  <Save size={16} />
                  Save Entry
                </button>
              </form>
            </div>

            <div className="border-t border-slate-100">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Day & Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status / Reason</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Accepted</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Rejected</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Scrap</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {operation.logs?.qualityEntries?.length > 0 ? (
                    operation.logs.qualityEntries.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-600">{format(new Date(log.inspection_date), 'dd-MM-yyyy')}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{log.rejection_reason || 'Normal Production'}</td>
                        <td className="px-6 py-4 text-sm font-bold text-emerald-600">{log.accepted_qty}</td>
                        <td className="px-6 py-4 text-sm font-bold text-red-600">{log.rejected_qty}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-600">{log.scrap_qty}</td>
                        <td className="px-6 py-4">
                          <button className="p-1.5 text-slate-400 hover:text-red-600 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500 italic">No quality data recorded yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Downtime Section */}
          <div ref={downtimeRef} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden scroll-mt-32">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-50 text-red-600">
                  <AlertCircle size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Operational Downtime</h2>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleAddDowntimeLog} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Day & Date <span className="text-red-500">*</span></label>
                  <input 
                    type="datetime-local" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                    value={downtimeForm.startTime}
                    onChange={(e) => setDowntimeForm({...downtimeForm, startTime: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Shift <span className="text-red-500">*</span></label>
                  <select 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                    value={downtimeForm.shift}
                    onChange={(e) => setDowntimeForm({...downtimeForm, shift: e.target.value})}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Downtime Type <span className="text-red-500">*</span></label>
                  <select 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                    value={downtimeForm.downtimeType}
                    onChange={(e) => setDowntimeForm({...downtimeForm, downtimeType: e.target.value})}
                    required
                  >
                    <option value="">Select Reason</option>
                    <option value="Machine Breakdown">Machine Breakdown</option>
                    <option value="Material Shortage">Material Shortage</option>
                    <option value="Power Failure">Power Failure</option>
                    <option value="Planned Maintenance">Planned Maintenance</option>
                    <option value="Setup/Changeover">Setup/Changeover</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">End Time</label>
                  <input 
                    type="datetime-local" 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                    value={downtimeForm.endTime}
                    onChange={(e) => setDowntimeForm({...downtimeForm, endTime: e.target.value})}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 bg-amber-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-amber-700 transition-all shadow-md disabled:opacity-50"
                >
                  <Pause size={16} fill="white" />
                  Record Downtime
                </button>
              </form>
            </div>

            <div className="border-t border-slate-100">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Day & Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Category / Reason</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Interval</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Duration</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {operation.logs?.downtimeLogs?.length > 0 ? (
                    operation.logs.downtimeLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-600">{format(new Date(log.start_time), 'dd-MM-yyyy')}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">{log.downtime_type}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {format(new Date(log.start_time), 'hh:mm a')} → {log.end_time ? format(new Date(log.end_time), 'hh:mm a') : '--:--'}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{log.duration_minutes || 0} min</td>
                        <td className="px-6 py-4">
                          <button className="p-1.5 text-slate-400 hover:text-red-600 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500 italic">No downtime recorded yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Next Operation Section */}
          <div ref={nextOpRef} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden scroll-mt-32">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <ChevronRight size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Next Operation Details</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm">
                    <Settings size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase">Sequence #{operation.sequence_no + 1}</span>
                      <h3 className="text-lg font-bold text-slate-900">{operation.next_operation_name || 'Final Inspection / Packing'}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">{operation.next_operation_description || 'After completing this operation, the item will move to the next stage of production.'}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Target Workstation</p>
                        <p className="text-sm font-semibold text-slate-700">CNC Workshop B</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Estimated Start</p>
                        <p className="text-sm font-semibold text-slate-700">{format(new Date(), 'dd-MM-yyyy')}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">Pending</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Daily Report Section placeholder */}
          <div ref={reportRef} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden scroll-mt-32">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <FileText size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Daily Production Report</h2>
              </div>
            </div>
            <div className="p-12 text-center text-slate-500">
              <Activity className="mx-auto mb-4 opacity-20" size={48} />
              <p>Production summary and analytics will be generated here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionEntryPage;
