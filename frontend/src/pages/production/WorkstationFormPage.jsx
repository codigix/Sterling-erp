import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../utils/api';
import { 
  ArrowLeft, 
  Monitor, 
  Save, 
  X,
  Info,
  Cpu,
  MapPin,
  Settings,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from '../../utils/toastUtils';

const WorkstationFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    workstation_id: '',
    display_name: '',
    building_area: '',
    responsible_dept: '',
    equipment_class: '',
    equipment_code: '',
    units_per_hour: 0,
    target_utilization: 80,
    technical_description: '',
    is_active: true,
    maintenance_schedule: 'Monthly',
    last_maintenance_date: ''
  });

  useEffect(() => {
    fetchDepartments();
    if (isEdit) {
      fetchWorkstation();
    }
  }, [id]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/department/portal/departments');
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchWorkstation = async () => {
    try {
      setFetching(true);
      const response = await axios.get(`/production/workstations/${id}`);
      const data = response.data;
      // Convert dates to YYYY-MM-DD for input[type="date"]
      if (data.last_maintenance_date) {
        data.last_maintenance_date = new Date(data.last_maintenance_date).toISOString().split('T')[0];
      }
      setFormData(data);
    } catch (error) {
      console.error('Error fetching workstation:', error);
      toast.error('Failed to fetch workstation details');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEdit) {
        await axios.put(`/production/workstations/${id}`, formData);
        toast.success('Workstation updated successfully');
      } else {
        await axios.post('/production/workstations', formData);
        toast.success('Workstation registered successfully');
      }
      navigate('/department/production/workstations');
    } catch (error) {
      console.error('Error saving workstation:', error);
      toast.error('Failed to save workstation');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium">Fetching details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/department/production/workstations')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {isEdit ? 'Edit Workstation' : 'New Workstation'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {isEdit ? `Modifying asset ${formData.workstation_id}` : 'Register a new manufacturing asset'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/department/production/workstations')}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 text-sm disabled:opacity-50"
            >
              <ShieldCheck size={18} />
              {loading ? (isEdit ? 'Updating...' : 'Registering...') : (isEdit ? 'Update Asset' : 'Register Asset')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-8">
            
            {/* Identity & Localization */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100/50">
                  <Info size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Identity & Localization</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Basic Information</p>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Workstation ID</label>
                    <input 
                      type="text"
                      name="workstation_id"
                      value={formData.workstation_id}
                      onChange={handleInputChange}
                      placeholder="e.g. WS-001"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Display Name</label>
                    <input 
                      type="text"
                      name="display_name"
                      value={formData.display_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Precision Assembly Line"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Building / Area</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text"
                        name="building_area"
                        value={formData.building_area}
                        onChange={handleInputChange}
                        placeholder="e.g. Shop Floor - Zone A"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Responsible Dept</label>
                    <select 
                      name="responsible_dept"
                      value={formData.responsible_dept}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 border border-purple-100/50">
                  <Cpu size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Technical Specifications</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Asset Capabilities</p>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Equipment Class</label>
                    <select 
                      name="equipment_class"
                      value={formData.equipment_class}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    >
                      <option value="">Select Class</option>
                      <option value="CNC">CNC Machine</option>
                      <option value="Manual">Manual Station</option>
                      <option value="Assembly">Assembly Line</option>
                      <option value="Testing">Testing Station</option>
                      <option value="Packaging">Packaging Unit</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Equipment Code</label>
                    <input 
                      type="text"
                      name="equipment_code"
                      value={formData.equipment_code}
                      onChange={handleInputChange}
                      placeholder="Asset Tag / Serial No."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Units / Hour</label>
                    <input 
                      type="number"
                      name="units_per_hour"
                      value={formData.units_per_hour}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Target Utilization %</label>
                    <input 
                      type="number"
                      name="target_utilization"
                      value={formData.target_utilization}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Technical Description</label>
                  <textarea 
                    name="technical_description"
                    value={formData.technical_description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Provide technical specs, machine capabilities, or safety guidelines..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            {/* Operational Status */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Operational Status</h3>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Active Node</p>
                  <p className="text-[10px] text-slate-500 font-medium">Determines if work orders can be scheduled to this asset.</p>
                </div>
              </div>
            </div>

            {/* Maintenance */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100/50">
                  <Settings size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Maintenance</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Service Schedule</p>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Schedule Frequency</label>
                  <select 
                    name="maintenance_schedule"
                    value={formData.maintenance_schedule}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Last Maintenance Date</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="date"
                      name="last_maintenance_date"
                      value={formData.last_maintenance_date}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkstationFormPage;
