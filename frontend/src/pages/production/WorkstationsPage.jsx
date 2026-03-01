import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/api';
import { 
  Monitor, 
  Plus, 
  Search, 
  Grid, 
  List as ListIcon, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Settings,
  ArrowRight,
  Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from '../../utils/toastUtils';

const WorkstationsPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [workstations, setWorkstations] = useState([]);
  const [stats, setStats] = useState({ total_assets: 0, operational: 0, asset_classes: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchWorkstations();
  }, []);

  const fetchWorkstations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/production/workstations');
      setWorkstations(response.data.workstations || []);
      setStats(response.data.stats || { total_assets: 0, operational: 0, asset_classes: 0 });
    } catch (error) {
      console.error('Error fetching workstations:', error);
      toast.error('Failed to fetch workstations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/production/workstations/${id}`);
        toast.success('Workstation deleted successfully');
        fetchWorkstations();
      } catch (error) {
        console.error('Error deleting workstation:', error);
        toast.error('Failed to delete workstation');
      }
    }
  };

  const filteredWorkstations = workstations.filter(ws => 
    ws.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ws.workstation_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statsCards = [
    { label: 'Total Assets', value: stats.total_assets, icon: Monitor, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Operational', value: stats.operational, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Asset Classes', value: stats.asset_classes, icon: Grid, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Monitor size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Workstations</h1>
            <p className="text-sm text-slate-500 font-medium">Manage manufacturing assets and production nodes</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <ListIcon size={18} />
            </button>
          </div>
          <button 
            onClick={() => navigate('new')}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
          >
            <Plus size={20} />
            New Workstation
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statsCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-8 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search by name, ID, type or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <p className="text-slate-500 font-medium text-sm">Loading workstations...</p>
        </div>
      ) : filteredWorkstations.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkstations.map((ws) => (
              <div key={ws.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-blue-600 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                      <Settings size={20} />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => navigate(`edit/${ws.id}`)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(ws.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900">{ws.display_name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{ws.workstation_id}</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Class</span>
                      <span className="text-slate-900 font-bold">{ws.equipment_class || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Building</span>
                      <span className="text-slate-900 font-bold">{ws.building_area || 'N/A'}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Utilization</span>
                        <span className="text-slate-900">{ws.target_utilization}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${ws.target_utilization}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${ws.operational_status === 'Operational' ? 'bg-green-500' : 'bg-amber-500'}`} />
                      <span className="text-xs font-bold text-slate-600">{ws.operational_status}</span>
                    </div>
                    <button 
                      onClick={() => navigate(`edit/${ws.id}`)}
                      className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Config <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Workstation</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Building</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Utilization</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredWorkstations.map((ws) => (
                  <tr key={ws.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{ws.display_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{ws.workstation_id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">{ws.equipment_class || 'N/A'}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">{ws.building_area || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 w-32">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${ws.target_utilization}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-900">{ws.target_utilization}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${ws.operational_status === 'Operational' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {ws.operational_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`edit/${ws.id}`)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(ws.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <Monitor className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Workstations Found</h3>
          <p className="text-slate-500 mb-6 font-medium">Start by registering your first manufacturing asset</p>
          <button 
            onClick={() => navigate('new')}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
          >
            <Plus size={20} />
            Register Asset
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkstationsPage;
