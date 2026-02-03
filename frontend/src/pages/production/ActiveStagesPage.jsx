import React, { useState } from "react";
import {
  Factory,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  Layers,
  Activity,
  Users,
  Target,
  ArrowLeft,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ActiveStagesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const activeStages = [
    {
      id: 1,
      stageNo: "STG-001-2025",
      planNo: "PP-001-2025",
      stageName: "Cutting & Preparation",
      assignedWorkers: 8,
      startDate: "2025-12-16",
      progress: 60,
      completedUnits: 300,
      totalUnits: 500,
      quality: 98,
      efficiency: 94,
    },
    {
      id: 2,
      stageNo: "STG-002-2025",
      planNo: "PP-002-2025",
      stageName: "Welding & Assembly",
      assignedWorkers: 6,
      startDate: "2025-12-15",
      progress: 40,
      completedUnits: 120,
      totalUnits: 300,
      quality: 96,
      efficiency: 89,
    },
    {
      id: 3,
      stageNo: "STG-003-2025",
      planNo: "PP-004-2025",
      stageName: "Finishing",
      assignedWorkers: 5,
      startDate: "2025-12-18",
      progress: 25,
      completedUnits: 100,
      totalUnits: 400,
      quality: 99,
      efficiency: 91,
    },
    {
      id: 4,
      stageNo: "STG-004-2025",
      planNo: "PP-002-2025",
      stageName: "Final Inspection",
      assignedWorkers: 3,
      startDate: "2025-12-19",
      progress: 45,
      completedUnits: 135,
      totalUnits: 300,
      quality: 97,
      efficiency: 96,
    },
  ];

  const filteredStages = activeStages.filter(
    (stage) =>
      stage.stageNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stage.planNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stage.stageName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    {
      label: "Active Stages",
      value: activeStages.length,
      icon: <Layers size={20} />,
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Total Workers",
      value: activeStages.reduce((sum, s) => sum + s.assignedWorkers, 0),
      icon: <Users size={20} />,
      color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    },
    {
      label: "Avg Quality",
      value:
        Math.round(
          activeStages.reduce((sum, s) => sum + s.quality, 0) /
            activeStages.length
        ) + "%",
      icon: <CheckCircle size={20} />,
      color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Avg Progress",
      value:
        Math.round(
          activeStages.reduce((sum, s) => sum + s.progress, 0) /
            activeStages.length
        ) + "%",
      icon: <Activity size={20} />,
      color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
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
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wider rounded">
                  Intelligence Module
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Execution Tracking
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Active Production Stages
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-white dark:hover:bg-slate-800 transition-all text-sm">
              <Download size={16} />
              Export Data
            </button>
            <button className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-lg shadow-purple-600/20 transition-all text-sm">
              <Plus size={18} />
              Initialize Stage
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm group">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pipeline Controls */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by stage, plan, or designation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-purple-600 transition-all">
            <Filter size={18} />
            <span className="text-sm font-bold">Filters</span>
          </button>
        </div>

        {/* Stages Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filteredStages.map((stage) => (
            <div
              key={stage.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center">
                    <Factory size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {stage.stageName}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {stage.stageNo} <span className="mx-2 text-slate-300">•</span> Plan: {stage.planNo}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl transition-all">
                    <Eye size={18} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition-all">
                    <Edit size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Personnel</p>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-slate-400" />
                      <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{stage.assignedWorkers} <span className="text-xs font-medium text-slate-500">Active</span></p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Deployment</p>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-slate-400" />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{stage.startDate}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Quality Assurance</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-500" />
                      <p className="text-xl font-bold text-emerald-600">{stage.quality}%</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">OEE Efficiency</p>
                    <div className="flex items-center gap-2">
                      <Target size={16} className="text-blue-500" />
                      <p className="text-xl font-bold text-blue-600">{stage.efficiency}%</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Operational Progress</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">{stage.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(147,51,234,0.3)]"
                        style={{ width: `${stage.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Output Volume</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {stage.completedUnits} <span className="text-slate-400 font-medium">/ {stage.totalUnits} Units</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        style={{
                          width: `${(stage.completedUnits / stage.totalUnits) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Telemetry Active</p>
                </div>
                <button className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest hover:underline flex items-center gap-1">
                  View Full Analytics <ChevronRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActiveStagesPage;
