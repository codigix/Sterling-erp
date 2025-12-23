import React, { useState } from 'react';
import { Search, Eye, Download, Trash2 } from 'lucide-react';

const ViewBOMsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const boms = [
    { id: 1, name: 'Assembly A - Main Frame', project: 'Project Alpha', items: 24, created: '2024-12-10', status: 'Final' },
    { id: 2, name: 'Sub-assembly B', project: 'Project Beta', items: 18, created: '2024-12-08', status: 'Draft' },
    { id: 3, name: 'Electrical Module C', project: 'Project Gamma', items: 32, created: '2024-12-05', status: 'Final' },
    { id: 4, name: 'Hardware Package', project: 'Project Alpha', items: 42, created: '2024-12-01', status: 'Final' },
  ];

  const filteredBOMs = boms.filter(bom =>
    bom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bom.project.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">View BOMs</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Browse and manage existing bills of materials</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search BOMs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBOMs.map((bom) => (
          <div key={bom.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{bom.name}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{bom.project}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                bom.status === 'Final' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {bom.status}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 rounded p-3 mb-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-white">{bom.items}</span> items
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Created: {bom.created}</p>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded text-sm hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors flex items-center text-xs justify-center gap-2">
                <Eye size={16} />
                View
              </button>
              <button className="flex-1 px-3 py-2 bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400 rounded text-sm hover:bg-green-100 dark:hover:bg-green-800 transition-colors flex items-center text-xs justify-center gap-2">
                <Download size={16} />
                Export
              </button>
              <button className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-red-600 dark:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBOMs.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
          <p className="text-slate-500 dark:text-slate-400">No BOMs found</p>
        </div>
      )}
    </div>
  );
};

export default ViewBOMsPage;
