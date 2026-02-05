import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Timer, 
  ArrowUpRight,
  Filter,
  Layers,
  Box
} from "lucide-react";

const PerformanceMetricsPage = () => {
  const [dateRange, setDateRange] = useState("month");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncing(true);
      setTimeout(() => setSyncing(false), 1000);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    {
      label: "Strategic Orders",
      value: 8,
      change: "+2",
      icon: Layers,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      label: "Delivery Pulse",
      value: "96%",
      change: "+3%",
      icon: Timer,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      label: "Quality Matrix",
      value: "95%",
      change: "+2%",
      icon: ShieldCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      label: "Node Efficiency",
      value: "92%",
      change: "+4%",
      icon: Zap,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      label: "Defect Variance",
      value: "1.2%",
      change: "-0.3%",
      icon: Activity,
      color: "text-rose-600",
      bg: "bg-rose-50"
    },
    {
      label: "Resource Load",
      value: "88%",
      change: "+5%",
      icon: Cpu,
      color: "text-cyan-600",
      bg: "bg-cyan-50"
    },
  ];

  const stageMetrics = [
    {
      stage: "Cutting & Preparation",
      units: 450,
      avgQuality: 98,
      avgTime: "4.2 days",
      efficiency: 94,
    },
    {
      stage: "Welding & Assembly",
      units: 380,
      avgQuality: 96,
      avgTime: "5.1 days",
      efficiency: 89,
    },
    {
      stage: "Finishing",
      units: 320,
      avgQuality: 94,
      avgTime: "3.8 days",
      efficiency: 91,
    },
    {
      stage: "Final Inspection",
      units: 300,
      avgQuality: 97,
      avgTime: "1.5 days",
      efficiency: 96,
    },
    {
      stage: "Painting & Coating",
      units: 250,
      avgQuality: 95,
      avgTime: "2.3 days",
      efficiency: 88,
    },
  ];

  const monthlyTrends = [
    { month: "OCT", planned: 10, actual: 9, quality: 94 },
    { month: "NOV", planned: 12, actual: 11, quality: 95 },
    { month: "DEC", planned: 15, actual: 14, quality: 96 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Intelligence Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-600 rounded-lg shadow-lg shadow-purple-200">
                <BarChart3 size={24} className="text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase italic">
                Performance <span className="text-purple-600">Intelligence</span>
              </h1>
            </div>
            <p className="text-slate-500 flex items-center gap-2 text-sm font-medium">
              <ShieldCheck size={14} className="text-emerald-500" />
              Strategic Analytics & Operational Efficiency Matrix
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
              <div className={`w-2 h-2 rounded-full ${syncing ? 'bg-purple-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                {syncing ? 'Syncing Matrix...' : 'Static Snapshot'}
              </span>
            </div>
            <div className="flex gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="week">W01 - Last Week</option>
                <option value="month">M01 - This Month</option>
                <option value="quarter">Q01 - This Quarter</option>
                <option value="year">Y01 - This Year</option>
              </select>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-xl shadow-md hover:bg-black transition-all font-bold text-[10px] uppercase tracking-widest">
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Strategic Pulse Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 dark:bg-slate-900/50 blur-2xl rounded-full -mt-12 -mr-12 group-hover:bg-purple-50 transition-colors" />
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${metric.bg} dark:bg-opacity-10 rounded-xl ${metric.color}`}>
                  <metric.icon size={20} />
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">
                  {metric.change}
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{metric.label}</p>
              <p className={`text-3xl font-mono font-extrabold ${metric.color} dark:text-white`}>{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stage Performance Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase italic tracking-tight flex items-center gap-2">
                <Cpu size={20} className="text-purple-600" />
                Node <span className="text-purple-600">Efficiency</span>
              </h2>
              <button className="text-[10px] font-bold text-purple-600 uppercase hover:underline">Full Analytics</button>
            </div>
            <div className="p-6 space-y-6">
              {stageMetrics.map((stage, idx) => (
                <div key={idx} className="group">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-purple-600 transition-colors">
                        {stage.stage}
                      </h4>
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        {stage.units} Units Processed • {stage.avgTime} Avg
                      </p>
                    </div>
                    <span className="text-xs font-mono font-extrabold text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-100">
                      {stage.efficiency}%
                    </span>
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Quality Index</span>
                        <span className="text-slate-900 dark:text-white font-mono">{stage.avgQuality}%</span>
                     </div>
                     <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${stage.efficiency}%` }}
                        />
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trends Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
             <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase italic tracking-tight flex items-center gap-2">
                <TrendingUp size={20} className="text-purple-600" />
                Strategic <span className="text-purple-600">Velocity</span>
              </h2>
            </div>
            <div className="p-6 space-y-8">
              {monthlyTrends.map((trend, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-mono font-extrabold text-slate-900 dark:text-white italic">
                      {trend.month}
                    </h4>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 uppercase">
                        LOAD: {trend.actual}/{trend.planned}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Execution Rate</span>
                        <span className="text-slate-900 dark:text-white font-mono">{Math.round((trend.actual / trend.planned) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
                          style={{ width: `${(trend.actual / trend.planned) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Quality Matrix</span>
                        <span className="text-slate-900 dark:text-white font-mono">{trend.quality}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full"
                          style={{ width: `${trend.quality}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Intelligence Briefing */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-purple-600" />
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase italic tracking-tight mb-6">
            Strategic <span className="text-purple-600">Briefing</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                 <ShieldCheck size={16} className="text-emerald-600" />
                 <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Positive Variance</p>
              </div>
              <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300 leading-relaxed">
                On-time delivery rate improved by 3% this month. Maintain current scheduling practices.
              </p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl">
               <div className="flex items-center gap-2 mb-2">
                 <Activity size={16} className="text-amber-600" />
                 <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Operational Alert</p>
              </div>
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
                Welding & Assembly stage efficiency dropped to 89%. Review resource allocation.
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
               <div className="flex items-center gap-2 mb-2">
                 <Zap size={16} className="text-blue-600" />
                 <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Tactical Recommendation</p>
              </div>
              <p className="text-xs font-medium text-blue-800 dark:text-blue-300 leading-relaxed">
                Increase quality inspections in Finishing stage to maintain 95%+ quality scores.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetricsPage;
