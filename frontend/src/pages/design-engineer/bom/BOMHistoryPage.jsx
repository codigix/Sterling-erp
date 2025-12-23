import React, { useState } from 'react';
import { History, Download, RotateCcw } from 'lucide-react';

const BOMHistoryPage = () => {
  const [selectedBOM, setSelectedBOM] = useState(1);

  const bomVersions = [
    { id: 1, version: 'v3.2', date: '2024-12-10', author: 'John Doe', changes: 'Updated part numbers' },
    { id: 2, version: 'v3.1', date: '2024-12-08', author: 'Jane Smith', changes: 'Added new components' },
    { id: 3, version: 'v3.0', date: '2024-12-05', author: 'John Doe', changes: 'Complete redesign' },
    { id: 4, version: 'v2.5', date: '2024-11-28', author: 'Mike Johnson', changes: 'Minor corrections' },
    { id: 5, version: 'v2.0', date: '2024-11-20', author: 'Jane Smith', changes: 'Initial version' },
  ];

  const boms = [
    { id: 1, name: 'Assembly A - Main Frame' },
    { id: 2, name: 'Sub-assembly B' },
    { id: 3, name: 'Electrical Module C' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">BOM History</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">View version history and rollback changes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* BOM List */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">BOMs</h3>
          <div className="space-y-2">
            {boms.map((bom) => (
              <button
                key={bom.id}
                onClick={() => setSelectedBOM(bom.id)}
                className={`w-full text-left p-1 rounded-lg transition-colors ${
                  selectedBOM === bom.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {bom.name}
              </button>
            ))}
          </div>
        </div>

        {/* Version History */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center text-xs gap-2">
            <History size={20} />
            Version History
          </h3>
          <div className="space-y-4">
            {bomVersions.map((version, index) => (
              <div key={version.id} className="border-l-4 border-blue-500 bg-slate-50 dark:bg-slate-700 p-4 rounded">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{version.version}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{version.date} by {version.author}</p>
                  </div>
                  {index > 0 && (
                    <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center text-xs gap-1">
                      <RotateCcw size={14} />
                      Restore
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{version.changes}</p>
                <div className="mt-3 flex gap-2">
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center text-xs gap-1">
                    <Download size={14} />
                    Download
                  </button>
                  <button className="text-sm text-slate-600 dark:text-slate-400 hover:underline">Compare</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BOMHistoryPage;
