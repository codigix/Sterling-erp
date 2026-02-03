import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Activity,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  Filter,
  ArrowUpRight,
  MoreVertical
} from "lucide-react";

const AssignTasksPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncing(true);
      setTimeout(() => setSyncing(false), 1000);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  const taskAssignments = [
    {
      id: 1,
      taskNo: "TSK-001-2025",
      stageName: "Cutting & Preparation",
      assignedWorkers: 8,
      taskDescription: "Material cutting and preparation",
      dueDate: "2025-12-20",
      priority: "high",
      status: "in-progress",
    },
    {
      id: 2,
      taskNo: "TSK-002-2025",
      stageName: "Welding & Assembly",
      assignedWorkers: 6,
      taskDescription: "Main welding operations",
      dueDate: "2025-12-18",
      priority: "high",
      status: "in-progress",
    },
    {
      id: 3,
      taskNo: "TSK-003-2025",
      stageName: "Finishing",
      assignedWorkers: 5,
      taskDescription: "Surface finishing and polishing",
      dueDate: "2025-12-24",
      priority: "medium",
      status: "scheduled",
    },
    {
      id: 4,
      taskNo: "TSK-004-2025",
      stageName: "Final Inspection",
      assignedWorkers: 3,
      taskDescription: "Quality inspection",
      dueDate: "2025-12-22",
      priority: "medium",
      status: "in-progress",
    },
  ];

  const filteredTasks = taskAssignments.filter(
    (task) =>
      task.taskNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.stageName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "high":
        return "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800";
      case "medium":
        return "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800";
      case "low":
        return "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800";
      default:
        return "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900 dark:border-slate-700";
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "in-progress":
        return "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800";
      case "scheduled":
        return "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800";
      case "completed":
        return "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800";
      default:
        return "bg-slate-50 text-slate-500 border-slate-200";
    }
  };

  const stats = [
    { label: "Active Nodes", value: taskAssignments.length, icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Worker Load", value: taskAssignments.reduce((sum, t) => sum + t.assignedWorkers, 0), icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Success Matrix", value: "94.2%", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Node Velocity", value: "88.5%", icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Intelligence Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-600 rounded-lg shadow-lg shadow-purple-200">
                <Layers size={24} className="text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase italic">
                Task <span className="text-purple-600">Distribution</span>
              </h1>
            </div>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium">
              <ShieldCheck size={14} className="text-emerald-500" />
              Strategic Workforce Deployment & Node Assignment
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
              <div className={`w-2 h-2 rounded-full ${syncing ? 'bg-purple-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                {syncing ? 'Syncing...' : 'Live Stream'}
              </span>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md shadow-purple-200 transition-all font-bold text-[10px] uppercase tracking-widest">
              <Plus size={18} />
              Inject Node
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

        {/* Filters Matrix */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by Task ID or Stage Node..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm font-medium"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
             <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                <Filter size={18} className="text-slate-500" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Filters</span>
             </button>
             <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                <Download size={18} className="text-slate-500" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Snapshot</span>
             </button>
          </div>
        </div>

        {/* Execution Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:border-purple-200 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50/50 dark:bg-purple-900/10 blur-3xl rounded-full -mt-16 -mr-16" />
              
              <div className="relative flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                      <Cpu size={20} className="text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight uppercase">
                      {task.taskNo}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-900 text-slate-500 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 uppercase">
                      {task.stageName}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getPriorityStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-purple-600 hover:border-purple-200 rounded-xl transition-all shadow-sm">
                    <Edit size={18} />
                  </button>
                  <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-xl transition-all shadow-sm">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="relative mb-6">
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                  "{task.taskDescription}"
                </p>
              </div>

              <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resources</p>
                  <p className="text-lg font-mono font-extrabold text-slate-900 dark:text-white">{task.assignedWorkers}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deadline</p>
                  <p className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">{new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()}</p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Node</p>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-3 py-1 rounded-full uppercase ${getStatusStyle(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                        U{i}
                     </div>
                   ))}
                   <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-bold">
                      +{task.assignedWorkers - 3}
                   </div>
                </div>
                <button className="flex items-center gap-1 text-[10px] font-bold text-purple-600 uppercase hover:underline tracking-widest">
                  Node Audit <ArrowUpRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssignTasksPage;
