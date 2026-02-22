import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Download,
  Eye,
  Trash2,
  Loader2,
  X,
  ChevronDown,
} from "lucide-react";
import axios from "../../../utils/api";

const DocumentsPage = ({ defaultTab = "raw-designs" }) => {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get("taskId");

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [rootCardId, setRootCardId] = useState(searchParams.get("rootCardId") || "");
  const [rootCards, setRootCards] = useState([]);
  const [showRootCardDropdown, setShowRootCardDropdown] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [designs, setDesigns] = useState([]);
  const [drawings, setDrawings] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [technicalFiles, setTechnicalFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [approving, setApproving] = useState(false);

  const [uploadFormData, setUploadFormData] = useState({
    designName: "",
    drawingName: "",
    drawingNumber: "",
    drawingType: "2D",
    version: "V1.0",
    status: "Draft",
    remarks: "",
    file: null,
    contentType: "",
  });

  useEffect(() => {
    fetchRootCards();
  }, []);

  useEffect(() => {
    fetchAllDocuments();
  }, [rootCardId]);

  const fetchRootCards = async () => {
    try {
      const response = await axios.get("/production/root-cards");
      const rootCards = (Array.isArray(response.data) ? response.data : response.data.rootCards || []).map(rc => ({
        ...rc,
        filteringId: rc.id || rc.rootCardId
      }));
      setRootCards(rootCards);
      
      // If no root card is selected, auto-select the first one
      if (!rootCardId && rootCards.length > 0) {
        setRootCardId(rootCards[0].filteringId);
      }
    } catch (error) {
      console.error("Failed to fetch root cards:", error);
    }
  };

  const fetchAllDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!rootCardId) {
        setDesigns([]);
        setDrawings([]);
        setSpecs([]);
        setTechnicalFiles([]);
        setLoading(false);
        return;
      }

      const [rawDesignsRes, requiredDocsRes] = await Promise.all([
        axios.get(`/root-cards/steps/${rootCardId}/design-engineering/raw-designs`).catch(() => ({ data: [] })),
        axios.get(`/root-cards/steps/${rootCardId}/design-engineering/required-documents`).catch(() => ({ data: [] })),
      ]);

      // Process raw design drawings
      const rawDesignsList = (rawDesignsRes.data.data || rawDesignsRes.data || []).map(design => ({
        ...design,
        id: design.id || `design-${Date.now()}-${Math.random()}`,
        name: design.name || design.title || 'Untitled Design',
        version: design.version || "V1.0",
        status: design.status || "Draft",
        createdAt: design.uploadedAt || new Date().toISOString(),
        rootCardId: rootCardId,
        type: 'raw-design'
      }));

      // Process required documents
      const requiredDocsList = (requiredDocsRes.data.data || requiredDocsRes.data || []).map(doc => ({
        ...doc,
        id: doc.id || `doc-${Date.now()}-${Math.random()}`,
        name: doc.name || doc.title || 'Untitled Document',
        version: doc.version || "V1.0",
        status: doc.status || "Draft",
        createdAt: doc.uploadedAt || new Date().toISOString(),
        rootCardId: rootCardId,
        type: 'required-doc'
      }));

      setDesigns(rawDesignsList);
      setSpecs(requiredDocsList);
      setDrawings([]);
      setTechnicalFiles([]);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFormData((prev) => ({
        ...prev,
        file,
      }));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!uploadFormData.file) {
      alert("Please select a file");
      return;
    }

    if (!rootCardId) {
      alert("Please select a root card first");
      return;
    }

    if (activeTab === "raw-designs" && !uploadFormData.designName) {
      alert("Please fill in required fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("documents", uploadFormData.file);
      formData.append("type", activeTab === "raw-designs" ? "drawings" : "documents");

      await axios.post(`/root-cards/steps/${rootCardId}/design-engineering/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (taskId) {
        try {
          await axios.patch(`/department/portal/tasks/${taskId}`, {
            status: "completed",
          });
        } catch (err) {
          console.error("Error marking task as completed:", err);
        }
      }

      alert("Document uploaded successfully!");
      setShowUploadModal(false);
      setUploadFormData({
        designName: "",
        drawingName: "",
        drawingNumber: "",
        drawingType: "2D",
        version: "V1.0",
        status: "Draft",
        remarks: "",
        file: null,
        contentType: "",
      });
      await fetchAllDocuments();
    } catch (error) {
      console.error("Failed to upload document:", error);
      alert("Failed to upload document. Please try again.");
    }
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem || !rootCardId) return;
    try {
      setDeleteLoading(true);
      if (activeTab === "raw-designs") {
        await axios.delete(`/root-cards/steps/${rootCardId}/design-engineering/raw-designs/${selectedItem.id}`);
      } else {
        await axios.delete(`/root-cards/steps/${rootCardId}/design-engineering/required-documents/${selectedItem.id}`);
      }
      alert("Document deleted successfully");
      setShowDeleteModal(false);
      setSelectedItem(null);
      await fetchAllDocuments();
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Failed to delete document. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownload = async (item) => {
    try {
      // For design engineering documents, we'll use the file path if available
      if (!item.path && !item.filePath) {
        alert("Download URL not available for this document");
        return;
      }

      const filePath = item.path || item.filePath;
      const response = await axios.get(filePath, {
        responseType: "blob",
      });

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", `${item.name || item.title}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to download document:", err);
      alert("Failed to download document. The file may no longer be available.");
    }
  };

  const handleApproveClick = (item) => {
    setSelectedItem(item);
    setApprovalNotes("");
    setShowApprovalModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedItem || !rootCardId) return;
    try {
      setApproving(true);
      // Approve the entire design engineering step, not individual documents
      await axios.post(`/root-cards/steps/${rootCardId}/design-engineering/approve`, {
        reviewedBy: 1, // TODO: Get current user ID from context
        comments: approvalNotes
      });

      alert("Design Engineering approved successfully");
      setShowApprovalModal(false);
      setSelectedItem(null);
      setApprovalNotes("");
      await fetchAllDocuments();
    } catch (error) {
      console.error("Failed to approve design engineering:", error);
      alert("Failed to approve design engineering. Please try again.");
    } finally {
      setApproving(false);
    }
  };

  const getTabContent = () => {
    const items = activeTab === "raw-designs" ? designs : specs;

    const filteredItems = items.filter((item) =>
      (item.name || item.title || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filteredItems;
  };

  const selectedRootCard = rootCards.find((rc) => String(rc.filteringId || rc.id) === String(rootCardId));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Design Documents
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage design drawings and project documentation
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Upload Document
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Select Root Card
          </label>
          <div className="relative">
            <button
              onClick={() => setShowRootCardDropdown(!showRootCardDropdown)}
              className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white flex items-center justify-between hover:border-slate-400"
            >
              <span>
                {selectedRootCard ? (selectedRootCard.title || selectedRootCard.project_name || selectedRootCard.po_number || `Root Card ${selectedRootCard.id}`) : "Select a root card"}
              </span>
              <ChevronDown size={18} />
            </button>

            {showRootCardDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-10">
                {rootCards.length === 0 ? (
                  <div className="px-4 py-2 text-slate-600 dark:text-slate-400">
                    No root cards available
                  </div>
                ) : (
                  rootCards.map((rc) => (
                    <button
                      key={rc.id}
                      onClick={() => {
                        setRootCardId(rc.filteringId);
                        setShowRootCardDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-600 first:border-t-0"
                    >
                      {rc.title || rc.project_name || rc.po_number || `Root Card ${rc.id}`}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 dark:border-slate-700 flex">
          <button
            onClick={() => {
              setActiveTab("raw-designs");
              setSearchTerm("");
            }}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "raw-designs"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
            }`}
          >
            Raw Design Drawings
          </button>
          <button
            onClick={() => {
              setActiveTab("required-docs");
              setSearchTerm("");
            }}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "required-docs"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
            }`}
          >
            Required Documents
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 relative">
            <Search
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-slate-600 dark:text-slate-400">
                Loading documents...
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : getTabContent().length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                No documents found for the selected root card
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {activeTab === "raw-designs" ? "No raw design drawings have been uploaded yet." : "No required documents have been uploaded yet."}
                {rootCards.length > 1 && " Try selecting a different root card above."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                      Version
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                      Status
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
                  {getTabContent().map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                        {item.name || item.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {item.version}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            item.status === "Final" || item.status === "Approved"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          {item.status || "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(item.createdAt || item.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(item)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-blue-600 dark:text-blue-400 transition-colors"
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                        {item.status !== "Approved" && item.status !== "Final" && (
                          <button
                            onClick={() => handleApproveClick(item)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-green-600 dark:text-green-400 transition-colors"
                            title="Approve"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-red-600 dark:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Upload Document
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {activeTab === "raw-designs" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Design Name *
                    </label>
                    <input
                      type="text"
                      value={uploadFormData.designName}
                      onChange={(e) =>
                        setUploadFormData((prev) => ({
                          ...prev,
                          designName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Drawing Name
                    </label>
                    <input
                      type="text"
                      value={uploadFormData.drawingName}
                      onChange={(e) =>
                        setUploadFormData((prev) => ({
                          ...prev,
                          drawingName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Drawing Number
                    </label>
                    <input
                      type="text"
                      value={uploadFormData.drawingNumber}
                      onChange={(e) =>
                        setUploadFormData((prev) => ({
                          ...prev,
                          drawingNumber: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Type
                    </label>
                    <select
                      value={uploadFormData.drawingType}
                      onChange={(e) =>
                        setUploadFormData((prev) => ({
                          ...prev,
                          drawingType: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>2D</option>
                      <option>3D</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === "required-docs" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    value={uploadFormData.designName}
                    onChange={(e) =>
                      setUploadFormData((prev) => ({
                        ...prev,
                        designName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Version
                </label>
                <input
                  type="text"
                  value={uploadFormData.version}
                  onChange={(e) =>
                    setUploadFormData((prev) => ({
                      ...prev,
                      version: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  File *
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Delete Document
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin inline" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Approve Document
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Document: <strong>{selectedItem?.name || selectedItem?.title}</strong>
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add approval notes..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="3"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                disabled={approving}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {approving ? (
                  <Loader2 className="w-4 h-4 animate-spin inline" />
                ) : (
                  "Approve"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
