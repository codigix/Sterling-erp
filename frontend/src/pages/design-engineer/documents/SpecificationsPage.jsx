import React, { useState } from 'react';
import { Plus, Search, Edit, Download, Trash2, FileText } from 'lucide-react';

const SpecificationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const specs = [
    { id: 1, title: 'Material Specification - Steel Grade', version: 'v1.2', date: '2024-12-10', pages: 8 },
    { id: 2, title: 'Tolerance and Finish Specification', version: 'v2.0', date: '2024-12-08', pages: 12 },
    { id: 3, title: 'Assembly Process Specification', version: 'v1.5', date: '2024-12-05', pages: 6 },
    { id: 4, title: 'Quality Control Specification', version: 'v3.1', date: '2024-12-01', pages: 15 },
  ];

  const filteredSpecs = specs.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Technical Specifications</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage design specifications</p>
        </div>
        <button className="inline-flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          New Specification
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search specifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSpecs.map((spec) => (
          <div key={spec.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText size={32} className="text-blue-600 dark:text-blue-400 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{spec.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Version {spec.version}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-4">
              <span>{spec.pages} pages</span>
              <span>{spec.date}</span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded text-sm hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors flex items-center text-xs justify-center gap-2">
                <Download size={16} />
                Download
              </button>
              <button className="flex-1 px-3 py-2 bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400 rounded text-sm hover:bg-green-100 dark:hover:bg-green-800 transition-colors flex items-center text-xs justify-center gap-2">
                <Edit size={16} />
                Edit
              </button>
              <button className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-red-600 dark:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSpecs.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
          <p className="text-slate-500 dark:text-slate-400">No specifications found</p>
        </div>
      )}
    </div>
  );
};

export default SpecificationsPage;
