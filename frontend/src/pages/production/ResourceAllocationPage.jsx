import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Activity,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  Box,
  ArrowUpRight
} from "lucide-react";

const ResourceAllocationPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncing(true);
      setTimeout(() => setSyncing(false), 1000);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const resources = [
    {
      id: 1,
      department: "Cutting & Preparation",
      totalWorkers: 8,
      allocated: 8,
      available: 0,
      activeProjects: 2,
      utilization: 100,
      efficiency: 94,
    },
    {
      id: 2,
      department: "Welding & Assembly",
      totalWorkers: 6,
      allocated: 5,
      available: 1,
      activeProjects: 2,
      utilization: 83,
      efficiency: 89,
    },
    {
      id: 3,
      department: "Finishing",
      totalWorkers: 5,
      allocated: 4,
      available: 1,
      activeProjects: 1,
      utilization: 80,
      efficiency: 91,
    },
    {
      id: 4,
      department: "Final Inspection",
      totalWorkers: 3,
      allocated: 2,
      available: 1,
      activeProjects: 1,
      utilization: 67,
      efficiency: 96,
    },
    {
      id: 5,
      department: "Painting & Coating",
      totalWorkers: 4,
      allocated: 3,
      available: 1,
      activeProjects: 2,
      utilization: 75,
      efficiency: 88,
    },
    {
      id: 6,
      department: "Quality Control",
      totalWorkers: 5,
      allocated: 4,
      available: 1,
      activeProjects: 3,
      utilization: 80,
      efficiency: 92,
    },
  ];

  const filteredResources = resources.filter(
    (resource) =>
      resource.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUtilizationStyle = (utilization) => {
    if (utilization >= 90) return "text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-900/20";
    if (utilization >= 75) return "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20";
    return "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20";
  };

  const stats = [
    { label: "Active Nodes", value: resources.length, icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Load", value: resources.reduce((sum, r) => sum + r.totalWorkers, 0), icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Allocated Pulse", value: resources.reduce((sum, r) => sum + r.allocated, 0), icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Success Matrix", value: "92.4%", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Intelligence Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-600 rounded-lg shadow-lg shadow-purple-200">
                <Cpu size={24} className="text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase italic">
                Resource <span className="text-purple-600">Allocation</span>
              </h1>
            </div>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium">
              <ShieldCheck size={14} className="text-emerald-500" />
              Strategic Workforce Deployment & Departmental Efficiency
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
              <div className={`w-2 h-2 rounded-full ${syncing ? 'bg-purple-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                {syncing ? 'Syncing...' : 'Live Data Stream'}
              </span>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md shadow-purple-200 transition-all font-bold text-[10px] uppercase tracking-widest">
              <Plus size={18} />
              Inject Resource
            </button>
          </div>
        </div>

        {/* Strategic Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`p-3 ${stat.bg} dark:bg-opacity-10 rounded-xl ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={`text-2xl font-mono font-extrabold ${stat.color} dark:text-white`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by Department or Strategic Node..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredResources.map((resource) => (
                <div
                  key={resource.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:border-purple-200 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50/50 dark:bg-purple-900/10 blur-2xl rounded-full -mt-12 -mr-12" />
                  
                  <div className="relative flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-tight italic">
                        {resource.department}
                      </h3>
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {resource.activeProjects} Active Strategy Nodes
                      </p>
                    </div>
                    <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-purple-600 hover:border-purple-200 rounded-xl transition-all shadow-sm">
                      <Edit size={18} />
                    </button>
                  </div>

                  <div className="relative space-y-5 mb-6">
                    <div className="space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span>Worker Distribution</span>
                          <span className="text-slate-900 dark:text-white font-mono">{resource.allocated}/{resource.totalWorkers}</span>
                       </div>
                       <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${(resource.allocated / resource.totalWorkers) * 100}%` }}
                          />
                       </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Utilization Index</span>
                       <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-extrabold uppercase ${getUtilizationStyle(resource.utilization)}`}>
                          {resource.utilization}%
                       </span>
                    </div>
                  </div>

                  <div className="relative grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Free</p>
                      <p className="text-sm font-mono font-extrabold text-slate-900 dark:text-white">{resource.available}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Load</p>
                      <p className="text-sm font-mono font-extrabold text-slate-900 dark:text-white">{resource.allocated}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-xl border border-emerald-100 dark:border-emerald-800 text-center">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Eff.</p>
                      <p className="text-sm font-mono font-extrabold text-emerald-600">{resource.efficiency}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase italic tracking-tight">Allocation <span className="text-purple-600">Brief</span></h3>
               </div>
               <div className="p-6 space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>Total Ecosystem Utilization</span>
                      <span className="text-slate-900 dark:text-white font-mono">
                        {Math.round(
                          (resources.reduce((sum, r) => sum + r.allocated, 0) /
                            resources.reduce((sum, r) => sum + r.totalWorkers, 0)) *
                            100
                        )}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-4 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full shadow-lg"
                        style={{
                          width: `${Math.round(
                            (resources.reduce((sum, r) => sum + r.allocated, 0) /
                              resources.reduce((sum, r) => sum + r.totalWorkers, 0)) *
                              100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-slate-100 dark:border-slate-700 pt-6">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Node Health Matrix</h4>
                    <div className="space-y-3">
                      {resources.map((resource) => (
                        <div key={resource.id} className="group flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase group-hover:text-purple-600 transition-colors">
                            {resource.department.split(" ")[0]}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="w-16 bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                                style={{ width: `${resource.efficiency}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] font-mono font-extrabold text-slate-900 dark:text-white">
                              {resource.efficiency}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button className="w-full py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl shadow-lg hover:bg-black transition-all text-[10px] font-bold uppercase tracking-widest mt-4">
                    Download Full Audit
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceAllocationPage;
