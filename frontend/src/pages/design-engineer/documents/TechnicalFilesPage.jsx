import React, { useState } from 'react';
import { Plus, Search, Download, Eye, Trash2, Calendar, FileIcon } from 'lucide-react';

const TechnicalFilesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const files = [
    { id: 1, name: 'Assembly Instructions.pdf', type: 'PDF', size: '5.2 MB', date: '2024-12-10', category: 'Documentation' },
    { id: 2, name: 'Material Database.xlsx', type: 'Excel', size: '2.1 MB', date: '2024-12-08', category: 'Database' },
    { id: 3, name: 'Testing Report.docx', type: 'Word', size: '1.8 MB', date: '2024-12-05', category: 'Reports' },
    { id: 4, name: '3D_Model_v2.step', type: 'CAD', size: '45.5 MB', date: '2024-12-01', category: 'Models' },
    { id: 5, name: 'Performance Analysis.pdf', type: 'PDF', size: '3.7 MB', date: '2024-11-28', category: 'Reports' },
  ];

  const categories = ['all', 'Documentation', 'Database', 'Reports', 'Models'];

  const filteredFiles = files.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filter === 'all' || f.category === filter;
    return matchSearch && matchFilter;
  });

  const getFileIcon = (type) => {
    switch(type) {
      case 'PDF': return '📄';
      case 'Excel': return '📊';
      case 'Word': return '📝';
      case 'CAD': return '🔧';
      default: return '📁';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Technical Files</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage technical documentation and files</p>
        </div>
        <button className="inline-flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          Upload File
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">File Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Size</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredFiles.map((file) => (
              <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                <td className="p-1">
                  <div className="flex items-center text-xs gap-3">
                    <span className="text-2xl">{getFileIcon(file.type)}</span>
                    <span className="text-sm font-medium text-slate-900 text-left dark:text-white">{file.name}</span>
                  </div>
                </td>
                <td className="p-1 text-sm text-slate-600 dark:text-slate-400">{file.type}</td>
                <td className="p-1 text-sm text-slate-600 dark:text-slate-400">{file.category}</td>
                <td className="p-1 text-sm text-slate-600 dark:text-slate-400">{file.size}</td>
                <td className="p-1 text-sm text-slate-600 dark:text-slate-400 flex items-center text-xs gap-1">
                  <Calendar size={16} />
                  {file.date}
                </td>
                <td className="p-1 flex gap-2">
                  <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-blue-600 dark:text-blue-400">
                    <Eye size={18} />
                  </button>
                  <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-green-600 dark:text-green-400">
                    <Download size={18} />
                  </button>
                  <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-red-600 dark:text-red-400">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredFiles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">No files found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicalFilesPage;
