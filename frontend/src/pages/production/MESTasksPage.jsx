import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  CheckCircle,
  Eye,
  Clock,
  AlertCircle,
  Filter,
  Zap,
  Activity,
  Cpu,
  Layers,
  Timer,
  ShieldCheck,
  Search,
  ArrowUpRight,
  MoreVertical,
  ChevronRight
} from "lucide-react";
import Badge from "../../components/ui/Badge";

const MESTasksPage = () => {
  const [syncing, setSyncing] = useState(false);
  const [workerTasks] = useState([
    {
      id: "TASK-001",
      stage: "Assembly Stage 1",
      operation: "Component Assembly",
      status: "in-progress",
      startTime: "2025-01-29 09:00",
      pauseTime: null,
      totalPauseDuration: "15 mins",
      priority: "CRITICAL",
      efficiency: 94,
      logs: [
        { time: "09:00", action: "STARTED", notes: "Task started" },
        { time: "10:15", action: "PAUSED", notes: "Operator break" },
        { time: "10:30", action: "RESUMED", notes: "Break over" },
      ],
    },
    {
      id: "TASK-002",
      stage: "Assembly Stage 1",
      operation: "Quality Check",
      status: "pending",
      startTime: null,
      pauseTime: null,
      totalPauseDuration: "0 mins",
      priority: "HIGH",
      efficiency: 0,
      logs: [],
    },
    {
      id: "TASK-003",
      stage: "Assembly Stage 1",
      operation: "Component Assembly",
      status: "completed",
      startTime: "2025-01-28 08:00",
      pauseTime: null,
      totalPauseDuration: "10 mins",
      completionTime: "2025-01-28 16:30",
      priority: "NORMAL",
      efficiency: 98,
      logs: [
        { time: "08:00", action: "STARTED", notes: "Task started" },
        { time: "09:15", action: "PAUSED", notes: "Lunch break" },
        { time: "10:00", action: "RESUMED", notes: "Resumed after lunch" },
        {
          time: "16:30",
          action: "COMPLETED",
          notes: "Task completed successfully",
        },
      ],
    },
  ]);

  const [activeTab, setActiveTab] = useState("assigned");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskLogs, setShowTaskLogs] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncing(true);
      setTimeout(() => setSyncing(false), 1000);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-100 dark:border-amber-800";
      case "in-progress":
        return "bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-100 dark:border-blue-800";
      case "completed":
        return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-800";
      default:
        return "bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700";
    }
  };

  const filteredTasks =
    activeTab === "assigned"
      ? workerTasks
      : workerTasks.filter((t) => t.status === activeTab);

  const stats = [
    { label: "Strategic Load", value: workerTasks.length, icon: Layers, color: "text-slate-600", bg: "bg-slate-100" },
    { label: "Active Pulse", value: workerTasks.filter((t) => t.status === "in-progress").length, icon: Activity, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Success Matrix", value: workerTasks.filter((t) => t.status === "completed").length, icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Node Backlog", value: workerTasks.filter((t) => t.status === "pending").length, icon: Timer, color: "text-amber-600", bg: "bg-amber-100" },
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
                Execution <span className="text-purple-600">Hub</span>
              </h1>
            </div>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium">
              <Zap size={14} className="text-purple-500" />
              Real-time Manufacturing Execution System [MES] Interface
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
              <div className={`w-2 h-2 rounded-full ${syncing ? 'bg-purple-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                {syncing ? 'Syncing...' : 'Live Data Stream'}
              </span>
            </div>
          </div>
        </div>

        {/* Strategic Pulse */}
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

        {/* Tab & Filter Matrix */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto w-full md:w-auto">
            {["assigned", "in-progress", "completed", "pending"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                {tab === "in-progress" ? "Active" : tab}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter Nodes..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>

        {/* Execution Matrix */}
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
                      <Zap size={18} className="text-purple-600" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                      {task.operation}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-900 text-slate-500 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 uppercase">
                      {task.id}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getStatusStyle(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="text-right mr-2 hidden sm:block">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Efficiency</p>
                      <p className="text-sm font-mono font-extrabold text-purple-600">{task.efficiency}%</p>
                   </div>
                   <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400">
                      <MoreVertical size={18} />
                   </button>
                </div>
              </div>

              <div className="relative grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stage Node</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{task.stage}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</p>
                  <p className={`text-[10px] font-bold ${task.priority === 'CRITICAL' ? 'text-red-500' : 'text-blue-500'}`}>{task.priority}</p>
                </div>
                {task.startTime && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initialization</p>
                    <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">{task.startTime.split(' ')[1]}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Down-time</p>
                  <p className="text-xs font-mono font-bold text-amber-600">{task.totalPauseDuration}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                {task.status === "pending" && (
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-200 hover:bg-blue-700 transition-all text-[10px] font-bold uppercase tracking-widest">
                    <Play size={14} />
                    Initiate Node
                  </button>
                )}
                {task.status === "in-progress" && (
                  <>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl shadow-md shadow-amber-200 hover:bg-amber-700 transition-all text-[10px] font-bold uppercase tracking-widest">
                      <Pause size={14} />
                      Suspend
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl shadow-md shadow-purple-200 hover:bg-purple-700 transition-all text-[10px] font-bold uppercase tracking-widest">
                      <CheckCircle size={14} />
                      Complete
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setShowTaskLogs(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-[10px] font-bold uppercase tracking-widest"
                >
                  <Eye size={14} />
                  Trace Logs
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Task Logs Modal */}
        {showTaskLogs && selectedTask && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase italic tracking-tight">Node <span className="text-purple-600">Trace</span></h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {selectedTask.id} • {selectedTask.operation}
                  </p>
                </div>
                <button
                  onClick={() => setShowTaskLogs(false)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400"
                >
                  <span className="text-2xl leading-none">×</span>
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {selectedTask.logs.length > 0 ? (
                  <div className="space-y-4">
                    {selectedTask.logs.map((log, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-2xl relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                            <Clock size={18} className="text-purple-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">
                              {log.action}
                            </p>
                            <span className="text-[10px] font-mono font-bold text-slate-400">{log.time}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {log.notes}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                      Zero Activity Logs Detected
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => setShowTaskLogs(false)}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all text-[10px] font-bold uppercase tracking-widest"
                >
                  Terminate Trace
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MESTasksPage;
