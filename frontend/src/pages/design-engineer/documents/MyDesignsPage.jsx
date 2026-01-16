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
} from "lucide-react";
import axios from "../../../utils/api";
import DataTable from "../../../components/ui/DataTable/DataTable";
import SearchableSelect from "../../../components/ui/SearchableSelect";
import { generateDesignId } from "../../../utils/idGenerator";

const MyDesignsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get("projectId");

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
    salesOrderId: null,
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
      const response = await axios.get("/sales/orders");
      const orders = Array.isArray(response.data)
        ? response.data
        : response.data?.orders || [];
      const projectsList = orders.map((order) => ({
        value: String(order.id),
        id: String(order.id),
        label: `${order.project_name} - ${order.po_number}`,
        projectName: order.project_name,
        productName: order.po_number,
        customer: order.customer,
        salesOrderId: String(order.id),
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
            salesOrderId: selected.salesOrderId,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch projects from sales orders:", error);
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
        uploads: design.details?.referenceDocuments
          ? Array.isArray(design.details.referenceDocuments)
            ? design.details.referenceDocuments.join(", ")
            : design.details.referenceDocuments
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

  const handleDownload = async (design) => {
    try {
      const downloadUrl = `/production/designs/${design.id}/download`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${design.designId}-${design.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download design:", error);
      alert("Failed to download design. The file may not be available.");
    }
  };

  const handleEdit = async (design) => {
    navigate(
      `/design-engineer/project-details?projectId=${design.rootCardId}&mode=edit&designId=${design.id}`
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
    if (!formData.designName.trim() || !formData.jobNo.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setCreating(true);
      const finalDesignId =
        formData.designId || generateDesignId(formData.designName);

      const payload = {
        designId: finalDesignId,
        designName: formData.designName,
        projectName: formData.jobNo,
        productName: formData.productAssemblyName || formData.designName,
        designStatus: "planning",
        designType: formData.designType,
        designCategory: formData.designCategory,
        priority: formData.priority,
        designEngineerName: "Current User",
        additionalNotes: formData.description,
        salesOrderId: formData.salesOrderId,
        referenceDocuments: uploadedFiles,
      };

      await axios.post("/production/design-projects", payload);

      await fetchDesigns();
      alert(
        `Design "${formData.designName}" created successfully!\nDesign ID: ${finalDesignId}`
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
        salesOrderId: null,
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

  const handleJobNoChange = (selectedRootCardId) => {
    const selectedProject = projects.find(
      (p) => p.value === String(selectedRootCardId)
    );
    if (selectedProject) {
      setFormData((prev) => ({
        ...prev,
        selectedRootCardId: String(selectedRootCardId),
        jobNo: selectedProject.projectName || "",
        productAssemblyName: selectedProject.productName || "",
        salesOrderId: selectedProject.salesOrderId,
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
      label: "Design ID",
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
              onClick={() => navigate("/design-engineer/project-details")}
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

              {/* Project / Job No. and Customer Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <SearchableSelect
                    label="Project / Job No. *"
                    options={projects}
                    value={String(formData.selectedRootCardId || "")}
                    onChange={handleJobNoChange}
                    placeholder="Select Project..."
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDesignsPage;
