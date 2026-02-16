import React, { useState, useEffect, useCallback } from "react";
import axios from "../../utils/api";
import { useNavigate } from "react-router-dom";
import toastUtils from "../../utils/toastUtils";
import {
  Clock,
  CheckCircle,
  Plus,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import Button from "../../components/ui/Button";

const GRNTasksPage = () => {
  const navigate = useNavigate();
  const [grns, setGrns] = useState([]);
  const [selectedGrn, setSelectedGrn] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
    linkToRootCard: true,
  });

  useEffect(() => {
    fetchRoleId();
  }, []);

  useEffect(() => {
    if (roleId) {
      fetchGRNs();
    }
  }, [roleId]);

  const fetchRoleId = async () => {
    try {
      const response = await axios.get("/department/portal/role/inventory");
      setRoleId(response.data.roleId);
    } catch {
      console.warn("Inventory role not found, using default role ID");
      setRoleId(2);
    }
  };

  const fetchGRNs = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/inventory/grns");
      const data = response.data || [];
      setGrns(data);
      if (data && data.length > 0) {
        setSelectedGrn(data[0]);
      }
    } catch {
      console.error("Error fetching GRNs");
      setError("Error loading GRNs");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksForGRN = useCallback(
    async (grn) => {
      try {
        if (!roleId) return;
        const response = await axios.get(`/department/portal/tasks/${roleId}`);
        const filtered = response.data.filter((t) => {
          return (
            t.rootCard?.id === grn.id ||
            t.grnId === grn.id ||
            t.title.includes(grn.grnNo || `GRN-${grn.id}`)
          );
        });
        setTasks(filtered);
      } catch {
        console.error("Error fetching tasks");
        setTasks([]);
      }
    },
    [roleId]
  );

  useEffect(() => {
    if (selectedGrn && roleId) {
      fetchTasksForGRN(selectedGrn);
    }
  }, [selectedGrn, roleId, fetchTasksForGRN]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toastUtils.warning("Task title is required");
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        roleId: roleId,
        grnId: selectedGrn?.id,
        rootCardId: null,
      };

      const response = await axios.post("/department/portal/tasks", payload);

      if (response.status === 201) {
        setShowCreateModal(false);
        setFormData({
          title: "",
          description: "",
          priority: "medium",
          status: "pending",
          linkToRootCard: true,
        });
        await fetchTasksForGRN(selectedGrn);
        handleTaskNavigation(response.data);
        toastUtils.success("Task created successfully");
      }
    } catch (err) {
      console.error("Error creating task:", err);
      toastUtils.error(
        "Failed to create task: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleTaskNavigation = (task) => {
    const taskTitle = (task.title || "").toLowerCase();
    const grnNo = selectedGrn?.grnNo || selectedGrn?.id;
    const baseParams = `taskId=${task.id}&taskTitle=${encodeURIComponent(
      task.title
    )}&grnId=${selectedGrn?.id}&grnNo=${encodeURIComponent(grnNo)}`;

    if (
      taskTitle.includes("grn") ||
      taskTitle.includes("processing") ||
      taskTitle.includes("receiving")
    ) {
      navigate(`/inventory-manager/grn-processing?${baseParams}`);
    } else if (
      taskTitle.includes("qc") ||
      taskTitle.includes("inspection") ||
      taskTitle.includes("inspect")
    ) {
      navigate(`/inventory-manager/grn-processing?${baseParams}`);
    } else if (
      taskTitle.includes("stock") ||
      taskTitle.includes("add") ||
      taskTitle.includes("inventory")
    ) {
      navigate(`/inventory-manager/stock/view?${baseParams}`);
    } else if (
      taskTitle.includes("batch") ||
      taskTitle.includes("management")
    ) {
      navigate(`/inventory-manager/tracking/batches?${baseParams}`);
    } else if (
      taskTitle.includes("location") ||
      taskTitle.includes("rack") ||
      taskTitle.includes("shelf")
    ) {
      navigate(`/inventory-manager/tracking/location?${baseParams}`);
    } else if (
      taskTitle.includes("vendor") ||
      taskTitle.includes("po") ||
      taskTitle.includes("order")
    ) {
      navigate(`/inventory-manager/purchase-orders?${baseParams}`);
    } else {
      navigate(`/inventory-manager/grn-processing?${baseParams}`);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getGrnNumber = (grn) => {
    return (
      grn.grnNo ||
      `GRN-${String(grn.id).padStart(3, "0")}-${new Date(
        grn.createdAt || grn.created_at
      ).getFullYear()}`
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      completed:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      in_progress:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      on_hold: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      medium:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white text-xs">
          Inventory GRN Management
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs">
          View GRNs and create inventory tasks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
            GRNs
          </h3>
          <div className="space-y-2">
            {grns.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No GRNs available
              </p>
            ) : (
              grns.map((grn) => (
                <button
                  key={grn.id}
                  onClick={() => setSelectedGrn(grn)}
                  className={`w-full text-left p-3 rounded-lg transition-colors text-sm ${
                    selectedGrn?.id === grn.id
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <p className="font-medium">{getGrnNumber(grn)}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    PO: {grn.po_number || grn.poNo || "N/A"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Vendor: {grn.vendor_name || grn.vendor || "N/A"}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {selectedGrn ? (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white text-xs">
                      {getGrnNumber(selectedGrn)}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 text-xs">
                      {selectedGrn.vendor_name ||
                        selectedGrn.vendor ||
                        "Unknown Vendor"}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus size={16} />
                    New Task
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      PO Number
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white text-xs mt-1">
                      {selectedGrn.po_number || selectedGrn.poNo || "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Expected Qty
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white text-xs mt-1">
                      {selectedGrn.expectedQty || selectedGrn.total_qty || "0"}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Received Qty
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white text-xs mt-1">
                      {selectedGrn.receivedQty ||
                        selectedGrn.received_qty ||
                        "0"}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Status
                    </p>
                    <p
                      className={`text-xs font-bold mt-1 capitalize ${
                        selectedGrn.status === "completed"
                          ? "text-green-600"
                          : selectedGrn.status === "pending"
                          ? "text-yellow-600"
                          : "text-slate-600"
                      }`}
                    >
                      {selectedGrn.status || "pending"}
                    </p>
                  </div>
                </div>

                {tasks.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                      Associated Tasks ({tasks.length})
                    </h4>
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                          onClick={() => handleTaskNavigation(task)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-semibold text-slate-900 dark:text-white text-sm">
                              {task.title}
                            </h5>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                task.status
                              )}`}
                            >
                              {task.status}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${getPriorityBadge(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tasks.length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle
                      size={32}
                      className="text-slate-400 mx-auto mb-2"
                    />
                    <p className="text-slate-600 dark:text-slate-400">
                      No tasks created for this GRN yet
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Click "New Task" to get started
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-400">
                Select a GRN to view tasks
              </p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Create New Task
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g., GRN Processing, QC Inspection"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Enter task description"
                  rows="3"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isCreating}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isCreating}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create Task
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GRNTasksPage;
