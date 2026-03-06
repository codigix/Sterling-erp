import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Clock, CheckCircle, AlertCircle, Play, Pause, 
  Trash2, Plus, Calendar, User, Settings, Box, 
  TrendingUp, Activity, FileText, Download, Save, Loader2,
  ChevronRight, Info, ShieldCheck, Zap, ChevronLeft, MoreHorizontal,
  X, Search, Filter, Layers, Package, Truck, DownloadCloud,
  ArrowRightLeft
} from 'lucide-react';
import axios from '../../utils/api';
import { showSuccess, showError } from '../../utils/toastUtils';
import Swal from 'sweetalert2';
import { format, differenceInMinutes, parse } from 'date-fns';

const ProductionEntryPage = () => {
  const { id } = useParams(); // Operation ID
  const navigate = useNavigate();
  const location = useLocation();
  const [operation, setOperation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Master data for selects
  const [employees, setEmployees] = useState([]);
  const [workstations, setWorkstations] = useState([]);
  const [nextOperations, setNextOperations] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  // Form states
  const [timeLogForm, setTimeLogForm] = useState({
    day: 1,
    date: format(new Date(), 'yyyy-MM-dd'),
    operatorId: '',
    workstationId: '',
    shift: 'A',
    startTime: '08:00',
    startPeriod: 'AM',
    endTime: '08:00',
    endPeriod: 'PM',
    producedQty: 0,
    totalMins: 720,
    notes: ''
  });

  const [qualityForm, setQualityForm] = useState({
    day: 1,
    date: format(new Date(), 'yyyy-MM-dd'),
    shift: 'A',
    produceQty: 0,
    rejectionReason: '',
    acceptedQty: 0,
    rejectedQty: 0,
    scrapQty: 0,
    notes: ''
  });

  const [downtimeForm, setDowntimeForm] = useState({
    day: 1,
    date: format(new Date(), 'yyyy-MM-dd'),
    shift: 'A',
    downtimeType: '',
    startTime: '08:00',
    startPeriod: 'AM',
    endTime: '08:00',
    endPeriod: 'PM',
    notes: ''
  });

  const [nextStageForm, setNextStageForm] = useState({
    nextOperation: '',
    assignOperator: '',
    targetWarehouse: '',
    executionMode: 'in-house'
  });

  // Calculate total minutes whenever start/end time changes
  useEffect(() => {
    const calculateMinutes = () => {
      try {
        const startStr = `${timeLogForm.startTime} ${timeLogForm.startPeriod}`;
        const endStr = `${timeLogForm.endTime} ${timeLogForm.endPeriod}`;
        const startTime = parse(startStr, 'hh:mm a', new Date());
        let endTime = parse(endStr, 'hh:mm a', new Date());
        
        if (endTime < startTime) {
          endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);
        }
        
        const diff = differenceInMinutes(endTime, startTime);
        setTimeLogForm(prev => ({ ...prev, totalMins: diff }));
      } catch (e) {
        // Silent fail
      }
    };
    calculateMinutes();
  }, [timeLogForm.startTime, timeLogForm.startPeriod, timeLogForm.endTime, timeLogForm.endPeriod]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [opRes, empRes, wsRes, whRes] = await Promise.all([
        axios.get(`/production/work-orders/operations/${id}/details`),
        axios.get('/employee/portal/employees'),
        axios.get('/production/workstations'),
        axios.get('/inventory/warehouses')
      ]);
      
      setOperation(opRes.data);
      setEmployees(empRes.data || []);
      setWorkstations(wsRes.data.workstations || []);
      setWarehouses(whRes.data || []);
      
      // If we have work order id, we can fetch all operations for "Next Operation" list
      if (opRes.data.work_order_id) {
        const woRes = await axios.get(`/production/work-orders/${opRes.data.work_order_id}`);
        const allOps = woRes.data.operations || [];
        const currentOpIndex = allOps.findIndex(op => op.id === parseInt(id));
        if (currentOpIndex !== -1 && currentOpIndex < allOps.length - 1) {
          setNextOperations(allOps.slice(currentOpIndex + 1));
          // Set default next op
          setNextStageForm(prev => ({ ...prev, nextOperation: allOps[currentOpIndex + 1].id }));
        }
      }

      // Initialize forms with operation defaults
      setTimeLogForm(prev => ({
        ...prev,
        operatorId: opRes.data.operator_id || '',
        workstationId: opRes.data.workstation_id || '',
        producedQty: 0
      }));
      
      setQualityForm(prev => ({
        ...prev,
        produceQty: 0,
        acceptedQty: 0
      }));
      
      setError(null);
    } catch (err) {
      console.error('Error fetching production entry data:', err);
      setError('Failed to load production entry details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleNextShift = (formType) => {
    const setters = {
      timeLog: setTimeLogForm,
      quality: setQualityForm,
      downtime: setDowntimeForm
    };
    
    const forms = {
      timeLog: timeLogForm,
      quality: qualityForm,
      downtime: downtimeForm
    };

    const currentForm = forms[formType];
    const setForm = setters[formType];

    if (!currentForm || !setForm) return;

    if (currentForm.shift === 'A') {
      setForm(prev => ({ ...prev, shift: 'B' }));
    } else {
      // Move to next day
      const currentDate = new Date(currentForm.date);
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + 1);
      
      setForm(prev => ({
        ...prev,
        day: parseInt(prev.day) + 1,
        date: format(nextDate, 'yyyy-MM-dd'),
        shift: 'A'
      }));
    }
  };

  const handleAddTimeLog = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Combine time and period for backend
      const startTime = `${timeLogForm.startTime} ${timeLogForm.startPeriod}`;
      const endTime = `${timeLogForm.endTime} ${timeLogForm.endPeriod}`;
      
      await axios.post(`/production/work-orders/operations/${id}/time-logs`, {
        ...timeLogForm,
        startTime,
        endTime
      });
      showSuccess('Time log recorded successfully');
      fetchData();
    } catch {
      showError('Failed to record time log');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddQualityEntry = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`/production/work-orders/operations/${id}/quality-entries`, qualityForm);
      showSuccess('Quality entry saved successfully');
      fetchData();
    } catch {
      showError('Failed to save quality entry');
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
        showSuccess('The production entry has been finalized.');
        navigate('/department/production/job-cards');
      } catch (err) {
        console.error('Error completing production entry:', err);
        showError('Failed to complete production entry task');
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
          <p className="text-slate-600 font-medium font-black uppercase tracking-tighter">Loading production entry...</p>
        </div>
      </div>
    );
  }

  const stats = {
    planned: operation.quantity || 0,
    produced: operation.produced_qty || 0,
    accepted: operation.accepted_qty || 0,
    transferred: 0,
    balanceWip: (operation.quantity || 0) - (operation.accepted_qty || 0),
    efficiency: 0,
    qualityYield: operation.produced_qty > 0 ? Math.round((operation.accepted_qty / operation.produced_qty) * 100) : 0,
    productivity: 0
  };

  const renderPagination = () => (
    <div className="px-4 py-3 bg-white border-t border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 font-medium">Rows per page:</span>
        <select className="bg-transparent text-xs font-bold text-slate-700 outline-none">
          <option>10</option>
          <option>25</option>
          <option>50</option>
        </select>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-bold text-slate-500">Page 1 of 0 <span className="text-[10px] opacity-60">(0 total)</span></span>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-50" disabled>
            <ChevronLeft size={16} />
          </button>
          <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all">
            Next
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  Production Entry 
                  <span className="text-slate-300 font-normal">✨</span> 
                  <span className="text-amber-500 text-sm font-bold flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                    In-Progress
                  </span>
                </h1>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                JC - {operation.id} - {operation.work_order_no} 
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                {format(new Date(), 'd MMMM yyyy')}
              </div>
            </div>
            
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold transition-all"
            >
              <ChevronLeft size={18} />
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        {/* Main Stats Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                <Box size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Item</p>
                <h2 className="text-base font-black text-slate-900 leading-tight mb-0.5">{operation.item_name}</h2>
                <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-tighter">{operation.item_code}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-8 border-l border-slate-100 pl-8">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Planned</p>
                <p className="text-sm font-black text-slate-900">{stats.planned} <span className="text-[10px] text-slate-400 font-medium">Units</span></p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Produced</p>
                <p className="text-sm font-black text-slate-900">{stats.produced} <span className="text-[10px] text-slate-400 font-medium">Units</span></p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-emerald-500">Accepted</p>
                <p className="text-sm font-black text-emerald-600">{stats.accepted} <span className="text-[10px] text-emerald-400 font-medium">Units</span></p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-indigo-500">Transferred</p>
                <p className="text-sm font-black text-indigo-600">{stats.transferred} <span className="text-[10px] text-indigo-400 font-medium">Units</span></p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-amber-500">BALANCE WIP</p>
                <p className="text-sm font-black text-amber-600">{stats.balanceWip} <span className="text-[10px] text-amber-400 font-medium">Units</span></p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Op</p>
                <div className="flex items-center gap-1.5 text-blue-600">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <p className="text-[11px] font-black uppercase tracking-tight truncate max-w-[100px]">{operation.operation_name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-5">
            <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center border border-pink-100">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Efficiency</p>
              <h3 className="text-xl font-black text-slate-900">{stats.efficiency}% <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">0 / 0 MIN</span></h3>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-5">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center border border-amber-100">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Quality Yield</p>
              <h3 className="text-xl font-black text-slate-900">{stats.qualityYield}% <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">ACCEPTANCE RATE</span></h3>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-5">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center border border-blue-100">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Productivity</p>
              <h3 className="text-xl font-black text-slate-900">{stats.productivity} <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">UNITS PER HOUR</span></h3>
            </div>
          </div>
        </div>

        {/* Add Time Log */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
              <Plus size={18} />
            </div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Add Time Log</h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleAddTimeLog} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-4 items-end">
                <div className="md:col-span-3">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block tracking-widest">Day & Date <span className="text-red-500">*</span></label>
                  <div className="flex gap-1.5">
                    <input 
                      type="number" 
                      className="w-14 h-11 px-2 bg-white border border-slate-200 rounded-lg text-sm font-black text-center text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      value={timeLogForm.day}
                      onChange={(e) => setTimeLogForm({...timeLogForm, day: e.target.value})}
                    />
                    <div className="relative flex-1">
                      <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        type="date" 
                        className="w-full h-11 pl-8 pr-2 bg-white border border-slate-200 rounded-lg text-[11px] font-black text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        value={timeLogForm.date}
                        onChange={(e) => setTimeLogForm({...timeLogForm, date: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block tracking-widest">Operator <span className="text-red-500">*</span></label>
                  <select 
                    className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-sm font-black text-slate-700 appearance-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                    value={timeLogForm.operatorId}
                    onChange={(e) => setTimeLogForm({...timeLogForm, operatorId: e.target.value})}
                    required
                  >
                    <option value="">Select Operator</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block tracking-widest">Workstation <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select 
                      className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-sm font-black text-slate-700 appearance-none pr-8 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                      value={timeLogForm.workstationId}
                      onChange={(e) => setTimeLogForm({...timeLogForm, workstationId: e.target.value})}
                      required
                    >
                      <option value="">Select Workstation</option>
                      {workstations.map(ws => (
                        <option key={ws.id} value={ws.id}>{ws.display_name}</option>
                      ))}
                    </select>
                    <X size={14} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-red-500 transition-colors" />
                    <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block tracking-widest text-center">Shift <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-1.5 h-11">
                    <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden h-full flex-1 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                      <select 
                        className="flex-1 px-3 text-sm font-black text-slate-700 outline-none bg-transparent appearance-none cursor-pointer"
                        value={timeLogForm.shift}
                        onChange={(e) => setTimeLogForm({...timeLogForm, shift: e.target.value})}
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNextShift('timeLog')}
                      title="Next Shift"
                      className="h-full w-10 flex items-center justify-center bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg hover:bg-indigo-600 hover:text-white transition-all active:scale-95 group"
                    >
                      <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block tracking-widest text-center">Qty <span className="text-red-500">*</span></label>
                  <div className="flex focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 rounded-lg transition-all overflow-hidden border border-slate-200 h-11">
                    <input 
                      type="number" 
                      className="flex-1 px-2 bg-white text-sm font-black text-slate-900 border-none outline-none text-center"
                      value={timeLogForm.producedQty}
                      onChange={(e) => setTimeLogForm({...timeLogForm, producedQty: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-4 items-end pt-4 border-t border-slate-100">
                <div className="md:col-span-5">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block tracking-widest">Production Period <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-3">
                    <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden flex-1 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                      <input 
                        type="text" 
                        className="w-full px-2 py-2.5 text-sm font-black text-center border-none outline-none text-slate-900"
                        value={timeLogForm.startTime}
                        onChange={(e) => setTimeLogForm({...timeLogForm, startTime: e.target.value})}
                      />
                      <select 
                        className="px-2 py-2.5 text-[10px] font-bold border-l border-slate-100 outline-none bg-slate-50 text-slate-600 appearance-none pr-6"
                        value={timeLogForm.startPeriod}
                        onChange={(e) => setTimeLogForm({...timeLogForm, startPeriod: e.target.value})}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                      <div className="px-3 border-l border-slate-100 flex items-center text-slate-400 bg-slate-50/30">
                        <Clock size={16} />
                      </div>
                    </div>
                    <ArrowRightLeft size={16} className="text-slate-300" />
                    <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden flex-1 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                      <input 
                        type="text" 
                        className="w-full px-2 py-2.5 text-sm font-black text-center border-none outline-none text-slate-900"
                        value={timeLogForm.endTime}
                        onChange={(e) => setTimeLogForm({...timeLogForm, endTime: e.target.value})}
                      />
                      <select 
                        className="px-2 py-2.5 text-[10px] font-bold border-l border-slate-100 outline-none bg-slate-50 text-slate-600 appearance-none pr-6"
                        value={timeLogForm.endPeriod}
                        onChange={(e) => setTimeLogForm({...timeLogForm, endPeriod: e.target.value})}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                      <div className="px-3 border-l border-slate-100 flex items-center text-slate-400 bg-slate-50/30">
                        <Clock size={16} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block tracking-widest">Total Mins <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-black text-red-500 focus:outline-none"
                    value={timeLogForm.totalMins}
                    readOnly
                  />
                </div>

                <div className="md:col-span-4">
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full h-11 bg-indigo-600 text-white rounded-lg text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 disabled:opacity-50 active:scale-[0.98]"
                  >
                    <FileText size={18} />
                    Record Time
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-8 bg-white border border-slate-100 rounded-xl min-h-[150px] flex items-center justify-center">
              <p className="text-xs font-bold text-slate-400 italic">No data available</p>
            </div>
            {renderPagination()}
          </div>
        </div>

        {/* Quality & Rejection Entry */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
              <ShieldCheck size={18} />
            </div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Quality & Rejection Entry</h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleAddQualityEntry} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-4 items-end">
                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block tracking-widest text-center">Day <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    className="w-full h-11 px-2 bg-white border border-slate-200 rounded-lg text-sm font-black text-center text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    value={qualityForm.day}
                    onChange={(e) => setQualityForm({...qualityForm, day: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block tracking-widest">Date <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="date" 
                      className="w-full h-11 pl-8 pr-2 bg-white border border-slate-200 rounded-lg text-[11px] font-black text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      value={qualityForm.date}
                      onChange={(e) => setQualityForm({...qualityForm, date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block tracking-widest text-center">Shift <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-1.5 h-11">
                    <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden h-full flex-1 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                      <select 
                        className="flex-1 px-3 text-sm font-black text-slate-700 outline-none bg-transparent appearance-none cursor-pointer"
                        value={qualityForm.shift}
                        onChange={(e) => setQualityForm({...qualityForm, shift: e.target.value})}
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNextShift('quality')}
                      title="Next Shift"
                      className="h-full w-10 flex items-center justify-center bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg hover:bg-indigo-600 hover:text-white transition-all active:scale-95 group"
                    >
                      <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block text-center tracking-widest">Produce <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    className="w-full h-11 px-2 bg-blue-50/50 border border-blue-100 rounded-lg text-sm font-black text-blue-600 text-center focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={qualityForm.produceQty}
                    onChange={(e) => setQualityForm({...qualityForm, produceQty: e.target.value})}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block tracking-widest text-center">Reason</label>
                  <div className="relative">
                    <select 
                      className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-700 appearance-none pr-8 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                      value={qualityForm.rejectionReason}
                      onChange={(e) => setQualityForm({...qualityForm, rejectionReason: e.target.value})}
                    >
                      <option value="">Select</option>
                      <option value="Dimensional">Dimensional</option>
                      <option value="Welding">Welding</option>
                      <option value="Material">Material</option>
                    </select>
                    <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" />
                  </div>
                </div>
                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block text-center tracking-widest text-emerald-600">Accepted <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    className="w-full h-11 px-2 bg-emerald-50 border border-emerald-100 rounded-lg text-sm font-black text-emerald-600 text-center focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={qualityForm.acceptedQty}
                    onChange={(e) => setQualityForm({...qualityForm, acceptedQty: e.target.value})}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block text-center tracking-widest text-red-500">Rejected <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    className="w-full h-11 px-2 bg-red-50 border border-red-100 rounded-lg text-sm font-black text-red-600 text-center focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                    value={qualityForm.rejectedQty}
                    onChange={(e) => setQualityForm({...qualityForm, rejectedQty: e.target.value})}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block text-center tracking-widest text-amber-500">Scrap <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    className="w-full h-11 px-2 bg-amber-50 border border-amber-100 rounded-lg text-sm font-black text-amber-600 text-center focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    value={qualityForm.scrapQty}
                    onChange={(e) => setQualityForm({...qualityForm, scrapQty: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full h-11 bg-emerald-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 disabled:opacity-50 active:scale-[0.95] text-xs font-black uppercase tracking-widest"
                  >
                    <Save size={18} />
                    Save Entry
                  </button>
                </div>
              </div>
            </form>
            <div className="mt-6 bg-amber-50/50 border border-amber-100 rounded-xl p-3 flex gap-3">
              <div className="p-1.5 bg-white rounded-lg text-amber-500 h-fit shadow-sm">
                <Info size={16} />
              </div>
              <p className="text-[11px] font-medium text-amber-700 leading-normal">
                <span className="font-black uppercase tracking-widest mr-1">Quality Gate Active</span>
                Only <span className="font-black">Approved</span> quality inspection records contribute to the <span className="font-black">Accepted Quantity</span> of this job card. Pending records will block the progression to subsequent operations.
              </p>
            </div>

            <div className="mt-8 bg-white border border-slate-100 rounded-xl min-h-[150px] flex items-center justify-center">
              <p className="text-xs font-bold text-slate-400 italic">No data available</p>
            </div>
            {renderPagination()}
          </div>
        </div>

        {/* Operational Downtime */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
            <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
              <AlertCircle size={18} />
            </div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Operational Downtime</h2>
          </div>
          
          <div className="p-6">
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-4 items-end">
                <div className="md:col-span-3">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block tracking-widest">Day & Date <span className="text-red-500">*</span></label>
                  <div className="flex gap-1.5">
                    <input 
                      type="number" 
                      className="w-14 h-11 px-2 bg-white border border-slate-200 rounded-lg text-sm font-black text-center text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      value={downtimeForm.day}
                      onChange={(e) => setDowntimeForm({...downtimeForm, day: e.target.value})}
                    />
                    <div className="relative flex-1">
                      <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        type="date" 
                        className="w-full h-11 pl-8 pr-2 py-2.5 bg-white border border-slate-200 rounded-lg text-[11px] font-black text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        value={downtimeForm.date}
                        onChange={(e) => setDowntimeForm({...downtimeForm, date: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block tracking-widest text-center">Shift <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-1.5 h-11">
                    <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden h-full flex-1 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                      <select 
                        className="flex-1 px-1.5 text-sm font-black text-slate-700 outline-none bg-transparent appearance-none cursor-pointer"
                        value={downtimeForm.shift}
                        onChange={(e) => setDowntimeForm({...downtimeForm, shift: e.target.value})}
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNextShift('downtime')}
                      title="Next Shift"
                      className="h-full w-8 flex items-center justify-center bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg hover:bg-indigo-600 hover:text-white transition-all active:scale-95 group"
                    >
                      <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block tracking-widest">Downtime Type <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select 
                      className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-700 appearance-none pr-8 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                      value={downtimeForm.downtimeType}
                      onChange={(e) => setDowntimeForm({...downtimeForm, downtimeType: e.target.value})}
                    >
                      <option value="">Select Type</option>
                      <option value="Machine Breakdown">Machine Breakdown</option>
                      <option value="Power Failure">Power Failure</option>
                      <option value="Material Shortage">Material Shortage</option>
                    </select>
                    <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block tracking-widest">Start Time <span className="text-red-500">*</span></label>
                  <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden h-11 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                    <input 
                      type="text" 
                      className="flex-1 px-2 text-sm font-black text-center text-slate-900 border-none outline-none"
                      value={downtimeForm.startTime}
                      onChange={(e) => setDowntimeForm({...downtimeForm, startTime: e.target.value})}
                    />
                    <select 
                      className="px-2 text-[10px] font-bold bg-slate-50 border-l border-slate-100 outline-none appearance-none"
                      value={downtimeForm.startPeriod}
                      onChange={(e) => setDowntimeForm({...downtimeForm, startPeriod: e.target.value})}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block tracking-widest">End Time <span className="text-red-500">*</span></label>
                  <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden h-11 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                    <input 
                      type="text" 
                      className="flex-1 px-2 text-sm font-black text-center text-slate-900 border-none outline-none"
                      value={downtimeForm.endTime}
                      onChange={(e) => setDowntimeForm({...downtimeForm, endTime: e.target.value})}
                    />
                    <select 
                      className="px-2 text-[10px] font-bold bg-slate-50 border-l border-slate-100 outline-none appearance-none"
                      value={downtimeForm.endPeriod}
                      onChange={(e) => setDowntimeForm({...downtimeForm, endPeriod: e.target.value})}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <button 
                    type="button"
                    className="w-full h-11 bg-orange-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-md shadow-orange-200 active:scale-[0.95] text-xs font-black uppercase tracking-widest"
                  >
                    <FileText size={18} />
                    Record Downtime
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-8 bg-white border border-slate-100 rounded-xl min-h-[150px] flex items-center justify-center">
              <p className="text-xs font-bold text-slate-400 italic">No data available</p>
            </div>
            {renderPagination()}
          </div>
        </div>

        {/* Next Stage Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Next Stage Configuration</h2>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-widest">Active</span>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2 text-emerald-600">
                  <ShieldCheck size={18} />
                  <span className="text-[11px] font-black uppercase tracking-widest">Ready for Dispatch</span>
               </div>
               <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  <ArrowRightLeft size={14} className="inline mr-1 text-slate-400" />
                  Transferred so far: <span className="text-slate-900 font-black">0.00</span>
               </div>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Specify destination and operational parameters for the next manufacturing phase</p>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6 items-end">
              <div className="md:col-span-3">
                <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block tracking-widest">Next Operation <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select 
                    className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-sm font-black text-slate-700 appearance-none pr-8 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                    value={nextStageForm.nextOperation}
                    onChange={(e) => setNextStageForm({...nextStageForm, nextOperation: e.target.value})}
                  >
                    <option value="">Select Operation</option>
                    {nextOperations.map(op => (
                      <option key={op.id} value={op.id}>{op.operation_name}</option>
                    ))}
                  </select>
                  <X size={14} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-red-500" />
                  <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" />
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block tracking-widest">Assign Operator</label>
                <div className="relative">
                  <select 
                    className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-sm font-black text-slate-700 appearance-none pr-8 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                    value={nextStageForm.assignOperator}
                    onChange={(e) => setNextStageForm({...nextStageForm, assignOperator: e.target.value})}
                  >
                    <option value="">Search Operator...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                  <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" />
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="text-[10px] font-bold text-slate-600 uppercase mb-2 block tracking-widest">Target Warehouse <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select 
                    className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-sm font-black text-slate-700 appearance-none pr-8 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                    value={nextStageForm.targetWarehouse}
                    onChange={(e) => setNextStageForm({...nextStageForm, targetWarehouse: e.target.value})}
                  >
                    <option value="">Select Destination</option>
                    {warehouses.map(wh => (
                      <option key={wh.id} value={wh.id}>{wh.name}</option>
                    ))}
                  </select>
                  <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" />
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="text-[10px] font-bold text-slate-600 uppercase mb-3 block text-center tracking-widest">Execution Mode:</label>
                <div className="flex justify-center gap-6 pb-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${nextStageForm.executionMode === 'in-house' ? 'border-indigo-500 bg-indigo-500 shadow-md shadow-indigo-100' : 'border-slate-300 group-hover:border-slate-400'}`}>
                      {nextStageForm.executionMode === 'in-house' && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <input 
                      type="radio" 
                      className="hidden" 
                      name="execMode" 
                      value="in-house"
                      checked={nextStageForm.executionMode === 'in-house'}
                      onChange={() => setNextStageForm({...nextStageForm, executionMode: 'in-house'})}
                    />
                    <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${nextStageForm.executionMode === 'in-house' ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-700'}`}>In-house</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${nextStageForm.executionMode === 'outsource' ? 'border-indigo-500 bg-indigo-500 shadow-md shadow-indigo-100' : 'border-slate-300 group-hover:border-slate-400'}`}>
                      {nextStageForm.executionMode === 'outsource' && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <input 
                      type="radio" 
                      className="hidden" 
                      name="execMode" 
                      value="outsource"
                      checked={nextStageForm.executionMode === 'outsource'}
                      onChange={() => setNextStageForm({...nextStageForm, executionMode: 'outsource'})}
                    />
                    <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${nextStageForm.executionMode === 'outsource' ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-700'}`}>Outsource</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Production Report */}
        <div className="bg-[#FBFCFE] rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <FileText size={18} />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Daily Production Report</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Consolidated daily and shift-wise production metrics</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all">
              <DownloadCloud size={16} />
              Download CSV
            </button>
          </div>
          
          <div className="p-6">
            <div className="bg-white border border-slate-100 rounded-xl min-h-[200px] flex items-center justify-center">
              <p className="text-xs font-bold text-slate-400 italic">No data available</p>
            </div>
            {renderPagination()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionEntryPage;
