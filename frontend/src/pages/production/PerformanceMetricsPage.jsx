import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
} from 'lucide-react';

const PerformanceMetricsPage = () => {
  const [dateRange, setDateRange] = useState('month');

  const metrics = [
    { label: 'Total Production Orders', value: 8, change: '+2', color: 'text-blue-600' },
    { label: 'On-Time Delivery Rate', value: '96%', change: '+3%', color: 'text-green-600' },
    { label: 'Average Quality Score', value: '95%', change: '+2%', color: 'text-emerald-600' },
    { label: 'Production Efficiency', value: '92%', change: '+4%', color: 'text-purple-600' },
    { label: 'Defect Rate', value: '1.2%', change: '-0.3%', color: 'text-orange-600' },
    { label: 'Resource Utilization', value: '88%', change: '+5%', color: 'text-cyan-600' },
  ];

  const stageMetrics = [
    { stage: 'Cutting & Preparation', units: 450, avgQuality: 98, avgTime: '4.2 days', efficiency: 94 },
    { stage: 'Welding & Assembly', units: 380, avgQuality: 96, avgTime: '5.1 days', efficiency: 89 },
    { stage: 'Finishing', units: 320, avgQuality: 94, avgTime: '3.8 days', efficiency: 91 },
    { stage: 'Final Inspection', units: 300, avgQuality: 97, avgTime: '1.5 days', efficiency: 96 },
    { stage: 'Painting & Coating', units: 250, avgQuality: 95, avgTime: '2.3 days', efficiency: 88 },
  ];

  const monthlyTrends = [
    { month: 'Oct', planned: 10, actual: 9, quality: 94 },
    { month: 'Nov', planned: 12, actual: 11, quality: 95 },
    { month: 'Dec', planned: 15, actual: 14, quality: 96 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Performance Metrics</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Comprehensive production and quality metrics dashboard</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium"
          >
            <option value="week">Last Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="flex items-center text-xs gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors font-medium">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{metric.label}</p>
            <div className="flex items-end justify-between">
              <p className={`text-3xl font-bold ${metric.color}`}>{metric.value}</p>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">{metric.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-left mb-6 flex items-center text-xs gap-2">
            <BarChart3 size={24} />
            Stage Performance
          </h2>
          <div className="space-y-4">
            {stageMetrics.map((stage, idx) => (
              <div key={idx} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{stage.stage}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{stage.units} units processed</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                    {stage.efficiency}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Quality</p>
                    <p className="font-bold text-slate-900 dark:text-white">{stage.avgQuality}%</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Avg Time</p>
                    <p className="font-bold text-slate-900 dark:text-white">{stage.avgTime}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Efficiency</p>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded h-1.5 mt-1">
                      <div className="bg-green-600 h-1.5 rounded" style={{ width: `${stage.efficiency}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-left mb-6 flex items-center text-xs gap-2">
            <TrendingUp size={24} />
            Monthly Trends
          </h2>
          <div className="space-y-4">
            {monthlyTrends.map((trend, idx) => (
              <div key={idx} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-b-0">
                <div className="flex items-center text-xs justify-between mb-3">
                  <h4 className="font-semibold text-slate-900 dark:text-white">{trend.month}</h4>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded font-medium">
                      {trend.actual}/{trend.planned}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">Orders Completed</span>
                      <span className="text-slate-900 dark:text-white font-medium">
                        {Math.round((trend.actual / trend.planned) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(trend.actual / trend.planned) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">Quality Score</span>
                      <span className="text-slate-900 dark:text-white font-medium">{trend.quality}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${trend.quality}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white text-left mb-4">Key Insights & Recommendations</h2>
        <div className="space-y-3">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              <strong>Positive:</strong> On-time delivery rate improved by 3% this month. Maintain current scheduling practices.
            </p>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
            <p className="text-sm text-orange-700 dark:text-orange-300">
              <strong>Alert:</strong> Welding & Assembly stage efficiency dropped to 89%. Review resource allocation.
            </p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Recommendation:</strong> Increase quality inspections in Finishing stage to maintain 95%+ quality scores.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetricsPage;
