import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, Edit, Download, Trash2, FileText, X, Loader2 } from "lucide-react";
import axios from "../../../utils/api";

const SpecificationsPage = () => {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get("taskId");
  const rootCardId = searchParams.get("rootCardId");

  const [searchTerm, setSearchTerm] = useState("");
  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    version: "v1.0",
    specificationFile: null,
  });

  useEffect(() => {
    fetchSpecifications();
  }, []);

  const fetchSpecifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/production/specifications", {
        params: rootCardId ? { rootCardId } : {}
      });
      let specList = Array.isArray(response.data) ? response.data : response.data?.specifications || [];
      
      setSpecs(specList);
    } catch (err) {
      console.error("Failed to fetch specifications:", err);
      setError("Failed to load specifications");
      setSpecs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setFormData((prev) => ({
        ...prev,
        specificationFile: file,
      }));
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setFormData((prev) => ({
      ...prev,
      specificationFile: null,
    }));
  };

  const handleCreateSpecification = async () => {
    if (!formData.title.trim() || !uploadedFile) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setCreating(true);
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("version", formData.version);
      payload.append("file", uploadedFile);

      await axios.post("/production/specifications", payload, {
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

      alert(`Specification "${formData.title}" created successfully!`);
      setShowCreateModal(false);
      setFormData({ title: "", description: "", version: "v1.0", specificationFile: null });
      setUploadedFile(null);
      await fetchSpecifications();
    } catch (err) {
      console.error("Failed to create specification:", err);
      alert("Failed to create specification. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleViewSpecification = (spec) => {
    setSelectedSpec(spec);
    setShowViewModal(true);
  };

  const handleDownloadSpecification = async (spec) => {
    try {
      const response = await axios.get(`/production/specifications/${spec.id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${spec.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download specification:', err);
      alert('Failed to download specification. Please try again.');
    }
  };

  const handleDeleteClick = (spec) => {
    setSelectedSpec(spec);
    setShowDeleteModal(true);
  };

  const confirmDeleteSpecification = async () => {
    if (!selectedSpec) return;
    try {
      setDeleteLoading(true);
      await axios.delete(`/production/specifications/${selectedSpec.id}`);
      alert('Specification deleted successfully');
      setShowDeleteModal(false);
      setSelectedSpec(null);
      await fetchSpecifications();
    } catch (error) {
      console.error('Failed to delete specification:', error);
      alert('Failed to delete specification. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditSpecification = (spec) => {
    setFormData({
      title: spec.title,
      description: spec.description || "",
      version: spec.version,
      specificationFile: null,
    });
    setSelectedSpec(spec);
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!isEditing && !uploadedFile) {
      alert("Please upload a file");
      return;
    }

    try {
      setCreating(true);
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("version", formData.version);
      if (rootCardId) {
        payload.append("rootCardId", rootCardId);
      }
      if (uploadedFile) {
        payload.append("file", uploadedFile);
      }

      if (isEditing) {
        await axios.patch(`/production/specifications/${selectedSpec.id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert(`Specification "${formData.title}" updated successfully!`);
      } else {
        await axios.post("/production/specifications", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (taskId) {
          try {
            await axios.patch(`/department/portal/tasks/${taskId}`, {
              status: "completed",
            });
          } catch (taskErr) {
            console.error("Error marking task as completed:", taskErr);
          }
        }
        alert(`Specification "${formData.title}" created successfully!`);
      }

      setShowCreateModal(false);
      setFormData({ title: "", description: "", version: "v1.0", specificationFile: null });
      setUploadedFile(null);
      setIsEditing(false);
      setSelectedSpec(null);
      await fetchSpecifications();
    } catch (err) {
      console.error("Failed to save specification:", err);
      alert("Failed to save specification. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const filteredSpecs = specs.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white text-xs">
            Technical Specifications
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs">
            Manage design specifications
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
          <p className="text-slate-600 dark:text-slate-400">
            Loading specifications...
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : filteredSpecs.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
          <p className="text-slate-500 dark:text-slate-400">
            No specifications found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSpecs.map((spec) => (
            <div
              key={spec.id}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText
                    size={32}
                    className="text-blue-600 dark:text-blue-400 mt-1"
                  />
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {spec.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Version {spec.version}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-4">
                <span>{new Date(spec.createdAt || spec.date).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewSpecification(spec)}
                  className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded text-sm hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors flex items-center text-xs justify-center gap-2"
                >
                  <FileText size={16} />
                  View
                </button>
                <button
                  onClick={() => handleEditSpecification(spec)}
                  className="px-3 py-2 bg-amber-50 dark:bg-amber-900 text-amber-600 dark:text-amber-400 rounded text-sm hover:bg-amber-100 dark:hover:bg-amber-800 transition-colors flex items-center justify-center"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDownloadSpecification(spec)}
                  className="px-3 py-2 bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400 rounded text-sm hover:bg-green-100 dark:hover:bg-green-800 transition-colors flex items-center justify-center"
                  title="Download"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={() => handleDeleteClick(spec)}
                  className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-red-600 dark:text-red-400 transition-colors flex items-center justify-center"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? "Edit Specification" : "Create New Specification"}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ title: "", description: "", version: "v1.0", specificationFile: null });
                  setUploadedFile(null);
                  setIsEditing(false);
                  setSelectedSpec(null);
                }}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Material Specification"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description..."
                  rows="4"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Version
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="e.g., v1.0"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {isEditing ? "Update File (Optional)" : "Upload File *"}
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="w-full"
                  accept=".pdf,.doc,.docx"
                />
                {uploadedFile && (
                  <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 flex items-center justify-between">
                    <span className="text-xs text-slate-700 dark:text-slate-300">{uploadedFile.name}</span>
                    <button
                      onClick={removeUploadedFile}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                {isEditing && !uploadedFile && selectedSpec?.fileName && (
                   <p className="text-xs text-slate-500 mt-1">Current file: {selectedSpec.fileName}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 sticky bottom-0">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ title: "", description: "", version: "v1.0", specificationFile: null });
                  setUploadedFile(null);
                  setIsEditing(false);
                  setSelectedSpec(null);
                }}
                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors font-medium text-sm"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={creating}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating && <Loader2 size={16} className="animate-spin" />}
                {isEditing ? "Update Specification" : "Create Specification"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedSpec && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {selectedSpec.title}
              </h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedSpec(null);
                }}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Version
                  </label>
                  <p className="text-sm text-slate-900 dark:text-white">
                    {selectedSpec.version}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <p className="text-sm text-slate-900 dark:text-white">
                    {new Date(selectedSpec.createdAt || selectedSpec.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {selectedSpec.description && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {selectedSpec.description}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 sticky bottom-0">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedSpec(null);
                }}
                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors font-medium text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownloadSpecification(selectedSpec);
                  setShowViewModal(false);
                  setSelectedSpec(null);
                }}
                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedSpec && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-sm shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Delete Specification
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Are you sure you want to delete "{selectedSpec.title}"? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedSpec(null);
                }}
                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors font-medium text-sm"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSpecification}
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

export default SpecificationsPage;
