import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Download,
  Eye,
  Trash2,
  Calendar,
  FileIcon,
  X,
  Loader2,
} from "lucide-react";
import axios from "../../../utils/api";

const TechnicalFilesPage = () => {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get("taskId");

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Documentation",
    description: "",
  });

  useEffect(() => {
    fetchTechnicalFiles();
  }, []);

  const fetchTechnicalFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/production/technical-files");
      const filesList = Array.isArray(response.data) ? response.data : response.data?.files || [];
      setFiles(filesList);
    } catch (err) {
      console.error("Failed to fetch technical files:", err);
      setError("Failed to load technical files");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleCreateFile = async () => {
    if (!formData.name.trim() || !uploadedFile) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setCreating(true);
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("category", formData.category);
      payload.append("description", formData.description);
      payload.append("file", uploadedFile);

      await axios.post("/production/technical-files", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (taskId) {
        try {
          await axios.patch(`/department/portal/tasks/${taskId}`, {
            status: "completed",
          });
          console.log(`Task ${taskId} marked as completed`);
        } catch (taskErr) {
          console.error("Error marking task as completed:", taskErr);
        }
      }

      alert(`File "${formData.name}" uploaded successfully!`);
      setShowUploadModal(false);
      setFormData({ name: "", category: "Documentation", description: "" });
      setUploadedFile(null);
      await fetchTechnicalFiles();
    } catch (err) {
      console.error("Failed to upload file:", err);
      alert("Failed to upload file. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleViewFile = (file) => {
    setSelectedFile(file);
    setShowViewModal(true);
  };

  const handleDownloadFile = async (file) => {
    try {
      const response = await axios.get(`/production/technical-files/${file.id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download file:', err);
      alert('Failed to download file. Please try again.');
    }
  };

  const handleDeleteClick = (file) => {
    setSelectedFile(file);
    setShowDeleteModal(true);
  };

  const confirmDeleteFile = async () => {
    if (!selectedFile) return;
    try {
      setDeleteLoading(true);
      await axios.delete(`/production/technical-files/${selectedFile.id}`);
      alert('File deleted successfully');
      setShowDeleteModal(false);
      setSelectedFile(null);
      await fetchTechnicalFiles();
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const categories = ["all", "Documentation", "Database", "Reports", "Models"];

  const filteredFiles = files.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filter === "all" || f.category === filter;
    return matchSearch && matchFilter;
  });

  const getFileIcon = (type) => {
    const ext = type?.toLowerCase() || "";
    if (ext.includes("pdf")) return "📄";
    if (ext.includes("xls") || ext.includes("excel")) return "📊";
    if (ext.includes("doc") || ext.includes("word")) return "📝";
    if (ext.includes("step") || ext.includes("cad")) return "🔧";
    if (ext.includes("dwg")) return "📐";
    return "📁";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-xs">
            Technical Files
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs">
            Manage technical documentation and files
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Upload File
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />
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
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-slate-800 rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
          <p className="text-slate-600 dark:text-slate-400">Loading files...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFileIcon(file.name || file.type)}</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {file.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {file.type || file.name.split('.').pop().toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {file.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {file.size}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      {new Date(file.createdAt || file.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <button
                      onClick={() => handleViewFile(file)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-blue-600 dark:text-blue-400 transition-colors"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleDownloadFile(file)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-green-600 dark:text-green-400 transition-colors"
                      title="Download"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(file)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-red-600 dark:text-red-400 transition-colors"
                      title="Delete"
                    >
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
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upload Technical File</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setFormData({ name: "", category: "Documentation", description: "" });
                  setUploadedFile(null);
                }}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  File Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Assembly Instructions"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.filter(c => c !== 'all').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description..."
                  rows="3"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Upload File *
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="w-full"
                />
                {uploadedFile && (
                  <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 flex items-center justify-between">
                    <span className="text-xs text-slate-700 dark:text-slate-300">{uploadedFile.name}</span>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setFormData({ name: "", category: "Documentation", description: "" });
                  setUploadedFile(null);
                }}
                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors font-medium text-sm"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFile}
                disabled={creating}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating && <Loader2 size={16} className="animate-spin" />}
                Upload File
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedFile && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{selectedFile.name}</h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedFile(null);
                }}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <p className="text-sm text-slate-900 dark:text-white">{selectedFile.type || selectedFile.name.split('.').pop().toUpperCase()}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <p className="text-sm text-slate-900 dark:text-white">{selectedFile.category}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Size</label>
                  <p className="text-sm text-slate-900 dark:text-white">{selectedFile.size}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <p className="text-sm text-slate-900 dark:text-white">{new Date(selectedFile.createdAt || selectedFile.date).toLocaleDateString()}</p>
                </div>
              </div>
              {selectedFile.description && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{selectedFile.description}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedFile(null);
                }}
                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors font-medium text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownloadFile(selectedFile);
                  setShowViewModal(false);
                  setSelectedFile(null);
                }}
                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedFile && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-sm shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete File</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Are you sure you want to delete "{selectedFile.name}"? This action cannot be undone.</p>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedFile(null);
                }}
                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors font-medium text-sm"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFile}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleteLoading && <Loader2 size={16} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicalFilesPage;
