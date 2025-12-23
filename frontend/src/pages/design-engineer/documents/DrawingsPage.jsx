import React, { useState, useEffect } from 'react';
import { Plus, Search, Download, Eye, Trash2, Calendar, Grid, List, Loader2, X } from 'lucide-react';
import axios from '../../../utils/api';

const DrawingsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [drawings, setDrawings] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [designSearch, setDesignSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDesignDropdown, setShowDesignDropdown] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    designName: '',
    drawingName: '',
    drawingNumber: '',
    drawingType: '2D',
    version: 'V1.0',
    drawingStatus: 'Draft',
    remarks: '',
    file: null
  });

  useEffect(() => {
    fetchDrawings();
    fetchDesigns();
  }, []);

  const fetchDrawings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/production/drawings');
      setDrawings(response.data.drawings || []);
    } catch (err) {
      console.error('Failed to fetch drawings:', err);
      setDrawings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDesigns = async () => {
    try {
      const response = await axios.get('/api/production/root-cards');
      const rootCards = response.data.rootCards || [];
      const designsList = rootCards.map(card => ({
        id: card.id,
        title: card.title,
        code: card.code
      }));
      setDesigns(designsList);
    } catch (error) {
      console.error('Failed to fetch designs:', error);
      setDesigns([]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFormData(prev => ({
        ...prev,
        file
      }));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFormData.designName || !uploadFormData.drawingName.trim() || !uploadFormData.drawingNumber.trim() || !uploadFormData.file) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('designName', uploadFormData.designName);
      formData.append('drawingName', uploadFormData.drawingName);
      formData.append('drawingNumber', uploadFormData.drawingNumber);
      formData.append('drawingType', uploadFormData.drawingType);
      formData.append('version', uploadFormData.version);
      formData.append('drawingStatus', uploadFormData.drawingStatus);
      formData.append('remarks', uploadFormData.remarks);
      formData.append('file', uploadFormData.file);

      const response = await axios.post('/api/production/drawings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Drawing uploaded successfully!');
      setShowUploadModal(false);
      setUploadFormData({
        designName: '',
        drawingName: '',
        drawingNumber: '',
        drawingType: '2D',
        version: 'V1.0',
        drawingStatus: 'Draft',
        remarks: '',
        file: null
      });
      setDesignSearch('');
      await fetchDrawings();
    } catch (error) {
      console.error('Failed to upload drawing:', error);
      alert('Failed to upload drawing. Please try again.');
    }
  };

  const filteredDesigns = designs.filter(design =>
    design.title.toLowerCase().includes(designSearch.toLowerCase())
  );

  const filteredDrawings = drawings.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Technical Drawings</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">View and manage technical drawings</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Upload Drawing
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search drawings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              <Grid size={20} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
          <p className="text-slate-600 dark:text-slate-400">Loading drawings...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : filteredDrawings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">No drawings found</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Format</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Size</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredDrawings.map((drawing) => (
                <tr key={drawing.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="p-1 text-sm font-medium text-slate-900 text-left dark:text-white">{drawing.name}</td>
                  <td className="p-1 text-sm text-slate-600 dark:text-slate-400">{drawing.format}</td>
                  <td className="p-1 text-sm text-slate-600 dark:text-slate-400">{drawing.size}</td>
                  <td className="p-1 text-sm text-slate-600 dark:text-slate-400">{drawing.date}</td>
                  <td className="p-1">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      drawing.status === 'Final' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {drawing.status}
                    </span>
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrawings.map((drawing) => (
            <div key={drawing.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-shadow">
              <div className="mb-4 h-32 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center text-xs justify-center">
                <span className="text-4xl">📄</span>
              </div>
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">{drawing.name}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{drawing.size}</p>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded text-sm hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">View</button>
                <button className="flex-1 px-3 py-2 bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400 rounded text-sm hover:bg-green-100 dark:hover:bg-green-800 transition-colors">Download</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upload Technical Drawing</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              {/* Design Name (Searchable Select) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Design Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search and select a design..."
                    value={uploadFormData.designName || designSearch}
                    onChange={(e) => {
                      if (uploadFormData.designName) {
                        setUploadFormData({...uploadFormData, designName: ''});
                      }
                      setDesignSearch(e.target.value);
                      setShowDesignDropdown(true);
                    }}
                    onFocus={() => setShowDesignDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDesignDropdown(false), 200)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {showDesignDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                      {designs.length === 0 ? (
                        <div className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">
                          No designs available
                        </div>
                      ) : filteredDesigns.length === 0 ? (
                        <div className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">
                          No matching designs found
                        </div>
                      ) : (
                        filteredDesigns.map(design => (
                          <button
                            key={design.id}
                            type="button"
                            onClick={() => {
                              setUploadFormData({...uploadFormData, designName: design.title});
                              setDesignSearch('');
                              setShowDesignDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 text-sm border-b border-slate-100 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-600 transition-colors ${
                              uploadFormData.designName === design.title
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{design.title}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{design.code}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {uploadFormData.designName && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                    <span>✓ Selected:</span> {uploadFormData.designName}
                  </p>
                )}
              </div>

              {/* Drawing Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Drawing Name *</label>
                <input
                  type="text"
                  value={uploadFormData.drawingName}
                  onChange={(e) => setUploadFormData({...uploadFormData, drawingName: e.target.value})}
                  placeholder="e.g., Gearbox Housing – GA Drawing"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Drawing Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Drawing Number *</label>
                <input
                  type="text"
                  value={uploadFormData.drawingNumber}
                  onChange={(e) => setUploadFormData({...uploadFormData, drawingNumber: e.target.value})}
                  placeholder="e.g., DRG-GX120-001"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Drawing Type and Version */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Drawing Type</label>
                  <select
                    value={uploadFormData.drawingType}
                    onChange={(e) => setUploadFormData({...uploadFormData, drawingType: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="Assembly">Assembly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Version / Revision</label>
                  <input
                    type="text"
                    value={uploadFormData.version}
                    onChange={(e) => setUploadFormData({...uploadFormData, version: e.target.value})}
                    placeholder="e.g., V1.0 or R0"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Drawing Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Drawing Status</label>
                <select
                  value={uploadFormData.drawingStatus}
                  onChange={(e) => setUploadFormData({...uploadFormData, drawingStatus: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Draft">Draft</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Remarks</label>
                <textarea
                  value={uploadFormData.remarks}
                  onChange={(e) => setUploadFormData({...uploadFormData, remarks: e.target.value})}
                  placeholder="Optional notes or additional details..."
                  rows="2"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Upload Drawing File * (PDF / DWG / STEP)</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.dwg,.dxf,.step,.stp,.iges,.igs"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {uploadFormData.file && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    ✓ {uploadFormData.file.name} selected
                  </p>
                )}
              </div>
            </form>

            <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 sticky bottom-0">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSubmit}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
              >
                Upload Drawing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawingsPage;
