import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  X,
  ChevronLeft,
  Loader2,
  Send,
} from "lucide-react";
import axios from "../../../utils/api";
import DataTable from "../../../components/ui/DataTable/DataTable";
import SearchableSelect from "../../../components/ui/SearchableSelect";
import { generateDesignId } from "../../../utils/idGenerator";

const MyDesignsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get("projectId");
  const taskId = searchParams.get("taskId");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    designId: "",
    designName: "",
    jobNo: "",
    customerName: "",
    productAssemblyName: "",
    designType: "New Design",
    designCategory: "Part",
    priority: "Normal",
    description: "",
    rootCardId: null,
    selectedRootCardId: null,
  });

  const [designs, setDesigns] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    fetchProjects();
    fetchDesigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get("/root-cards", {
        params: { assignedOnly: true }
      });
      const orders = Array.isArray(response.data)
        ? response.data
        : response.data?.rootCards || [];
      const projectsList = orders.map((order) => ({
        value: String(order.id),
        id: String(order.id),
        label: `${order.po_number} - ${order.project_name}`,
        projectName: order.project_name,
        productName: order.po_number,
        customer: order.customer,
        rootCardId: String(order.id),
      }));
      setProjects(projectsList);

      if (projectId) {
        const selected = projectsList.find(
          (p) => p.value === String(projectId) || p.id === String(projectId)
        );
        if (selected) {
          setSelectedProject(selected);
          setFormData((prev) => ({
            ...prev,
            selectedRootCardId: selected.value,
            jobNo: selected.projectName || "",
            productAssemblyName: selected.productName || "",
            customerName: selected.customer || "",
            rootCardId: selected.rootCardId,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch projects from root cards:", error);
    }
  };

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/production/designs");
      const designs = Array.isArray(response.data) ? response.data : response.data?.designs || [];
      
      let designsList = designs.map((design) => ({
        id: design.id,
        rootCardId: design.id,
        designId: design.code || `DES-${design.id}`,
        name: design.title || "Untitled Design",
        designType: design.details?.designType || "New Design",
        designCategory: design.details?.designCategory || design.category || "Part",
        project: design.projectName || "N/A",
        customer: design.customerName || "N/A",
        status:
          design.status === "planning"
            ? "In Progress"
            : design.status === "completed"
            ? "Completed"
            : design.status === "in_review"
            ? "Under Review"
            : "In Progress",
        author: design.assignedSupervisor || "Unknown",
        version: design.details?.version || "v1.0",
        date: design.createdAt ? new Date(design.createdAt).toISOString().split("T")[0] : "N/A",
        category: design.details?.designCategory || design.category || "Part",
        documents: design.documents || [],
        uploads: design.documents?.length > 0
          ? design.documents.map(doc => doc.name).join(", ")
          : "No uploads",
      }));

      if (projectId) {
        designsList = designsList.filter((d) => d.rootCardId === String(projectId));
      }

      setDesigns(designsList);
    } catch (error) {
      console.error("Failed to fetch designs:", error);
      setError("Failed to load designs. Please try again.");
      setDesigns([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDesigns = designs.filter((design) => {
    const matchesSearch =
      design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      design.project.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleViewDesign = (design) => {
    setSelectedDesign(design);
  };

  const handleDeleteDesign = (design) => {
    setSelectedDesign(design);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/production/designs/${selectedDesign.id}`);
      setDesigns(designs.filter((d) => d.id !== selectedDesign.id));
      alert(`Design "${selectedDesign.name}" has been deleted successfully!`);
      setShowDeleteModal(false);
      setSelectedDesign(null);
    } catch (error) {
      console.error("Failed to delete design:", error);
      alert("Failed to delete design. Please try again.");
    }
  };

  const handleSubmitForReview = async (design) => {
    if (
      !window.confirm(
        `Are you sure you want to submit "${design.name}" for review?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await axios.patch(`/production/designs/${design.id}/status`, {
        status: "in_review",
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

      alert(`Design "${design.name}" has been submitted for review!`);
      await fetchDesigns();
    } catch (error) {
      console.error("Failed to submit design for review:", error);
      alert("Failed to submit design for review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (design) => {
    if (!design.documents || design.documents.length === 0) {
      alert("No documents available for download.");
      return;
    }
    // If only one document, download it directly
    if (design.documents.length === 1) {
      handleDownloadDocument(design.id, design.documents[0]);
    } else {
      // If multiple, show the view modal so they can choose
      setSelectedDesign(design);
    }
  };

  const handleDownloadDocument = async (designId, document) => {
    try {
      const response = await axios.get(`/production/designs/${designId}/download`, {
        params: { documentId: document.id },
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.name);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download document:", error);
      alert("Failed to download document. Please try again.");
    }
  };

  const handleEdit = async (design) => {
    navigate(
      `/design-engineer/root-cards?projectId=${design.rootCardId}&mode=edit&designId=${design.id}`
    );
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles((prev) => [
      ...prev,
      ...files.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        file: f,
      })),
    ]);
  };

  const removeUploadedFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDesignNameChange = (e) => {
    const name = e.target.value;
    const generatedId = generateDesignId(name);
    setFormData((prev) => ({
      ...prev,
      designName: name,
      designId: generatedId,
    }));
  };

  const handleCreateDesign = async () => {
    if (!formData.designName.trim() || !formData.rootCardId) {
      alert("Please fill in all required fields and select a Root Card");
      return;
    }

    try {
      setCreating(true);
      const finalDesignId =
        formData.designId || generateDesignId(formData.designName);

      const submitData = new FormData();
      submitData.append("designId", finalDesignId);
      submitData.append("designName", formData.designName);
      submitData.append("designType", formData.designType);
      submitData.append("designCategory", formData.designCategory);
      submitData.append("priority", formData.priority);
      submitData.append("additionalNotes", formData.description);
      submitData.append("rootCardId", formData.rootCardId);

      // Append files
      uploadedFiles.forEach((fileObj) => {
        if (fileObj.file) {
          submitData.append("documents", fileObj.file);
        }
      });

      await axios.post("/production/design-projects", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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

      await fetchDesigns();
      alert(
        `Design "${formData.designName}" created successfully for Root Card ${formData.selectedRootCardId}!\nDesign ID: ${finalDesignId}`
      );
      setShowCreateForm(false);
      setUploadedFiles([]);
      setFormData({
        designId: "",
        designName: "",
        jobNo: "",
        customerName: "",
        productAssemblyName: "",
        designType: "New Design",
        designCategory: "Part",
        priority: "Normal",
        description: "",
        rootCardId: null,
        selectedRootCardId: null,
      });
    } catch (error) {
      console.error("Failed to create design:", error);
      alert(
        "Failed to create design. " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setCreating(false);
    }
  };

  const handleRootCardChange = (selectedRootCardId) => {
    const selectedProject = projects.find(
      (p) => p.value === String(selectedRootCardId)
    );
    if (selectedProject) {
      setFormData((prev) => ({
        ...prev,
        selectedRootCardId: String(selectedRootCardId),
        jobNo: selectedProject.projectName || "",
        productAssemblyName: selectedProject.productName || "",
        rootCardId: selectedProject.rootCardId,
        customerName: selectedProject.customer || "",
      }));
    }
  };

  const columns = [
    {
      key: "name",
      label: "Design Name",
      sortable: true,
      render: (value) => (
        <span className="font-medium text-slate-900 dark:text-white text-xs">
          {value}
        </span>
      ),
    },
    {
      key: "designId",
      label: "Root Card ID",
      sortable: true,
      render: (value) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
          {value}
        </span>
      ),
    },
    {
      key: "designType",
      label: "Design Type",
      sortable: true,
      render: (value) => (
        <span className="text-slate-700 dark:text-slate-300">{value}</span>
      ),
    },
    {
      key: "designCategory",
      label: "Design Category",
      sortable: true,
      render: (value) => (
        <span className="text-slate-700 dark:text-slate-300">{value}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      filterable: false,
      render: (_, design) => (
        <div className="flex gap-1 justify-center">
          <button
            onClick={() => handleViewDesign(design)}
            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-blue-600 dark:text-blue-400"
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleDownload(design)}
            className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors text-green-600 dark:text-green-400"
            title="Download"
          >
            <Download size={16} />
          </button>
          {design.status === "In Progress" && (
            <button
              onClick={() => handleSubmitForReview(design)}
              className="p-1 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors text-purple-600 dark:text-purple-400"
              title="Submit for Review"
            >
              <Send size={16} />
            </button>
          )}
          <button
            onClick={() => handleEdit(design)}
            className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors text-amber-600 dark:text-amber-400"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDeleteDesign(design)}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600 dark:text-red-400"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {projectId && (
            <button
              onClick={() => navigate("/design-engineer/root-cards")}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition"
              title="Back to Projects"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white text-xs">
              {selectedProject
                ? `${selectedProject.projectName} - Designs`
                : "My Designs"}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 text-xs">
              {selectedProject
                ? `${designs.length} design documents for ${selectedProject.productName}`
                : `Manage ${designs.length} design documents`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center justify-center gap-2 py-2 px-4  bg-blue-600 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors font-medium shadow-md text-xs"
        >
          <Plus size={18} />
          New Design
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by name, project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* DataTable with Column Filters */}
      <div className="bg-white dark:bg-slate-800  border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Loading designs...
              </p>
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredDesigns}
            emptyMessage={
              designs.length === 0
                ? "No designs yet. Create your first design!"
                : "No designs match your search."
            }
            sortable={true}
            hover={true}
            striped={true}
          />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 max-w-md z-50">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Create Design Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center text-xs justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white text-xs">
                Create New Design
              </h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Design Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Design Name *
                </label>
                <input
                  type="text"
                  value={formData.designName}
                  onChange={handleDesignNameChange}
                  placeholder="e.g., Component Assembly Drawing"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Root Card selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <SearchableSelect
                    label="Select Root Card *"
                    options={projects}
                    value={String(formData.selectedRootCardId || "")}
                    onChange={handleRootCardChange}
                    placeholder="Select Root Card..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Customer Name (Auto)
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    disabled
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-sm opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Product / Assembly Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Product / Assembly Name
                </label>
                <input
                  type="text"
                  value={formData.productAssemblyName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      productAssemblyName: e.target.value,
                    })
                  }
                  placeholder="e.g., Heavy Duty Conveyor Assembly"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Design Type and Design Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Design Type
                  </label>
                  <select
                    value={formData.designType}
                    onChange={(e) =>
                      setFormData({ ...formData, designType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="New Design">New Design</option>
                    <option value="Modification">Modification</option>
                    <option value="Reverse Engineering">
                      Reverse Engineering
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Design Category
                  </label>
                  <select
                    value={formData.designCategory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        designCategory: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Part">Part</option>
                    <option value="Sub-Assembly">Sub-Assembly</option>
                    <option value="Assembly">Assembly</option>
                  </select>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Reference Documents Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Reference Documents
                </label>
                <div className="border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="w-full text-sm"
                  />
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Uploaded Files:
                      </p>
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 p-2 rounded text-xs"
                        >
                          <span className="text-slate-700 dark:text-slate-300">
                            {file.name}
                          </span>
                          <button
                            onClick={() => removeUploadedFile(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Add design details..."
                  rows="3"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 sticky bottom-0">
              <button
                onClick={() => setShowCreateForm(false)}
                disabled={creating}
                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors font-medium text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDesign}
                disabled={creating}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating && <Loader2 size={16} className="animate-spin" />}
                {creating ? "Creating..." : "Create Design"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDesign && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center text-xs justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="p-6">
              <div className="flex items-center text-xs justify-center w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 mb-4">
                <AlertCircle
                  size={24}
                  className="text-red-600 dark:text-red-400"
                />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white text-xs mb-2">
                Delete Design?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">"{selectedDesign.name}"</span>?
                This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Design Modal */}
      {selectedDesign && !showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center text-xs justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center text-xs justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white text-xs">
                {selectedDesign.name}
              </h3>
              <button
                onClick={() => setSelectedDesign(null)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                    Project
                  </p>
                  <p className="text-sm font-medium text-slate-900 text-left dark:text-white mt-1">
                    {selectedDesign.project}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                    Status
                  </p>
                  <p className="text-sm font-medium text-slate-900 text-left dark:text-white mt-1">
                    {selectedDesign.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                    Author
                  </p>
                  <p className="text-sm font-medium text-slate-900 text-left dark:text-white mt-1">
                    {selectedDesign.author}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                    Version
                  </p>
                  <p className="text-sm font-medium text-slate-900 text-left dark:text-white mt-1">
                    {selectedDesign.version}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                    Date
                  </p>
                  <p className="text-sm font-medium text-slate-900 text-left dark:text-white mt-1">
                    {selectedDesign.date}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                    Category
                  </p>
                  <p className="text-sm font-medium text-slate-900 text-left dark:text-white mt-1">
                    {selectedDesign.category}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-3">
                  Design Documents
                </p>
                {selectedDesign.documents && selectedDesign.documents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDesign.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                            <Download size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {doc.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadDocument(selectedDesign.id, doc)}
                          className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                    No documents uploaded for this design.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDesignsPage;
