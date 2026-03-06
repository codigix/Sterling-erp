import React, { useState, useEffect, useCallback } from "react";
import axios from "@/utils/api";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Loader2,
  X,
  Package,
  Zap,
  RefreshCw,
  FileText,
  Trash2,
  Play,
} from "lucide-react";
import Button from "@/components/ui/Button";
import {
  INVENTORY_WORKFLOW,
} from "@/constants/inventoryWorkflow";
import { taskService } from "@/utils/taskService";

const InventoryTasksPage = () => {
  const navigate = useNavigate();
  const [materialRequests, setMaterialRequests] = useState([]);
  const [selectedMR, setSelectedMR] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInitiatingWorkflow, setIsInitiatingWorkflow] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isDeletingMR, setIsDeletingMR] = useState(false);
  const [currentTaskForModal, setCurrentTaskForModal] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
  });

  useEffect(() => {
    fetchMaterialRequests();
  }, []);

  const fetchMaterialRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/inventory/material-requests");
      const data = response.data?.materialRequests || response.data || [];
      setMaterialRequests(data);
      if (data && data.length > 0) {
        setSelectedMR(data[0]);
      }
    } catch (err) {
      console.error("Error fetching material requests:", err);
      setError("Error loading material requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksForMR = useCallback(
    async (mr) => {
      try {
        if (!mr?.id) {
          setTasks([]);
          return;
        }
        const response = await axios.get(`/inventory/root-card-tasks/mr/${mr.id}/tasks`);
        setTasks(response.data.tasks || []);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setTasks([]);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedMR) {
      fetchTasksForMR(selectedMR);
    }
  }, [selectedMR, fetchTasksForMR]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      alert("Workflow tasks are auto-initialized for each Material Request.");
    } finally {
      setIsCreating(false);
      setShowCreateModal(false);
    }
  };

  const handleTaskNavigation = (task) => {
    const taskTitle = (task.title || task.step_name || "").toLowerCase();
    const taskIdForUrl = task.backend_id || task.id;
    const baseParams = `taskId=${taskIdForUrl}&taskTitle=${encodeURIComponent(
      task.title || task.step_name
    )}&materialRequestId=${selectedMR?.id}&projectId=${selectedMR?.project_id || selectedMR?.sales_order_id || selectedMR?.root_card_id || selectedMR?.root_card?.project_id}`;

    if (taskTitle.includes("material") && taskTitle.includes("requirement")) {
      navigate(`/inventory-manager/material-requests?${baseParams}`);
    } else if (
      taskTitle.includes("rfq") ||
      (taskTitle.includes("quotation") && taskTitle.includes("create"))
    ) {
      navigate(`/inventory-manager/quotations/sent?${baseParams}&action=create`);
    } else if (taskTitle.includes("send") && taskTitle.includes("quotation")) {
      navigate(`/inventory-manager/quotations/sent?${baseParams}`);
    } else if (
      taskTitle.includes("receive") &&
      taskTitle.includes("quotation")
    ) {
      navigate(`/inventory-manager/quotations/received?${baseParams}&action=record`);
    } else if (
      taskTitle.includes("create") &&
      taskTitle.includes("purchase order")
    ) {
      navigate(`/inventory-manager/quotations/received?${baseParams}`);
    } else if (taskTitle.includes("send") && taskTitle.includes("po")) {
      if (task.reference_id && task.reference_type === 'purchase_order') {
        navigate(`/inventory-manager/purchase-orders/${task.reference_id}?${baseParams}`);
      } else {
        navigate(`/inventory-manager/purchase-orders?${baseParams}`);
      }
    } else if (
      taskTitle.includes("receive") &&
      taskTitle.includes("material")
    ) {
      if (task.reference_id && task.reference_type === 'purchase_order') {
        navigate(`/inventory-manager/purchase-orders/${task.reference_id}?${baseParams}`);
      } else {
        // Fallback to purchase orders list
        navigate(`/inventory-manager/purchase-orders?${baseParams}`);
      }
    } else if (
      taskTitle.includes("approve") &&
      taskTitle.includes("purchase order")
    ) {
      if (task.reference_id && task.reference_type === 'purchase_order') {
        navigate(`/inventory-manager/purchase-orders/${task.reference_id}?${baseParams}`);
      } else {
        navigate(`/inventory-manager/purchase-orders?${baseParams}`);
      }
    } else if (taskTitle.includes("grn") || taskTitle.includes("processing")) {
      navigate(`/inventory-manager/grn-processing?${baseParams}`);
    } else if (taskTitle.includes("qc") || taskTitle.includes("inspection")) {
      navigate(`/inventory-manager/grn-processing?${baseParams}`);
    } else if (taskTitle.includes("stock") && taskTitle.includes("add")) {
      navigate(`/inventory-manager/grn-processing?${baseParams}`);
    } else if (taskTitle.includes("batch") || taskTitle.includes("location")) {
      navigate(`/inventory-manager/tracking/batches?${baseParams}`);
    } else if (taskTitle.includes("view") && taskTitle.includes("stock")) {
      navigate(`/inventory-manager/stock/view?${baseParams}`);
    } else if (taskTitle.includes("stock") && taskTitle.includes("movement")) {
      navigate(`/inventory-manager/stock/movements?${baseParams}`);
    } else if (taskTitle.includes("release") && taskTitle.includes("material")) {
      navigate(`/inventory-manager/material-requests?${baseParams}`);
    } else if (taskTitle.includes("reorder")) {
      navigate(`/inventory-manager/stock/reorder?${baseParams}`);
    } else {
      navigate(`/inventory-manager/grn-processing?${baseParams}`);
    }
  };

  const handleInitiateWorkflow = async () => {
    const sortedTasks = [...tasks].sort((a, b) => {
      const taskTitleA = a.title || a.step_name;
      const taskTitleB = b.title || b.step_name;
      const stepA = INVENTORY_WORKFLOW.steps.find(
        (s) => s.title === taskTitleA
      );
      const stepB = INVENTORY_WORKFLOW.steps.find(
        (s) => s.title === taskTitleB
      );
      return (stepA?.order || a.step_number || 0) - (stepB?.order || b.step_number || 0);
    });

    if (sortedTasks.length === 0) {
      alert("No tasks available to initiate");
      return;
    }

    setIsInitiatingWorkflow(true);
    try {
      for (let i = 0; i < sortedTasks.length; i++) {
        const task = sortedTasks[i];
        setCurrentTaskIndex(i);

        await taskService.markTaskInProgress(task.id);
        await fetchTasksForMR(selectedMR);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        handleTaskNavigation(task);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      alert("Workflow initiation completed!");
    } catch (err) {
      console.error("Error initiating workflow:", err);
      alert(
        "Error during workflow initiation: " +
          (err.message || "Please try again")
      );
    } finally {
      setIsInitiatingWorkflow(false);
      setCurrentTaskIndex(0);
    }
  };

  const handleDeleteMR = async (mrId, mrNumber) => {
    if (
      !confirm(
        `Delete material request "${mrNumber}"? This will also delete all associated tasks. This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeletingMR(true);
    try {
      await axios.delete(`/inventory/material-requests/${mrId}`);
      await fetchMaterialRequests();
      alert("Material request and all associated tasks deleted successfully");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to delete material request. Please try again.";
      console.error("Error deleting material request:", err);
      alert(errorMessage);
    } finally {
      setIsDeletingMR(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleTaskSelection = (taskId) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const toggleSelectAll = (allTaskIds) => {
    if (selectedTasks.size === allTaskIds.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(allTaskIds));
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await taskService.deleteTask(taskId);
      await fetchTasksForMR(selectedMR);
      const newSelected = new Set(selectedTasks);
      newSelected.delete(taskId);
      setSelectedTasks(newSelected);
    } catch (err) {
      const errorMessage =
        err.message || "Failed to delete task. Please try again.";
      console.error("Error deleting task:", err);
      alert(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.size === 0) {
      alert("Please select tasks to delete");
      return;
    }

    if (
      !confirm(
        `Delete ${selectedTasks.size} selected task(s)? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const taskIds = Array.from(selectedTasks);
      const result = await taskService.deleteTasks(taskIds);
      await fetchTasksForMR(selectedMR);
      setSelectedTasks(new Set());
      alert(
        result.message ||
          `Successfully deleted ${taskIds.length} task(s)`
      );
    } catch (err) {
      const errorMessage =
        err.message || "Failed to delete tasks. Please try again.";
      console.error("Error deleting tasks:", err);
      alert(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInitializeWorkflow = async () => {
    if (!selectedMR) return;

    setIsInitiatingWorkflow(true);
    try {
      const result = await taskService.initializeMRWorkflow(selectedMR.id);
      await fetchTasksForMR(selectedMR);
      alert(result.message || "Workflow initialized successfully");
    } catch (err) {
      const errorMessage =
        err.message || "Failed to initialize workflow. Please try again.";
      console.error("Error initiating workflow:", err);
      alert(errorMessage);
    } finally {
      setIsInitiatingWorkflow(false);
    }
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

  const getPhaseColor = (phaseId) => {
    const colors = {
      quotation:
        "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700",
      purchase:
        "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700",
      receipt:
        "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700",
      quality:
        "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700",
      storage:
        "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700",
      usage:
        "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-700",
    };
    return colors[phaseId] || "bg-slate-50 dark:bg-slate-900/20";
  };

  const getPhaseTextColor = (phaseId) => {
    const colors = {
      quotation: "text-blue-700 dark:text-blue-300",
      purchase: "text-purple-700 dark:text-purple-300",
      receipt: "text-indigo-700 dark:text-indigo-300",
      quality: "text-amber-700 dark:text-amber-300",
      storage: "text-green-700 dark:text-green-300",
      usage: "text-cyan-700 dark:text-cyan-300",
    };
    return colors[phaseId] || "text-slate-700 dark:text-slate-300";
  };

  const getTasksByPhase = () => {
    const grouped = {};
    
    INVENTORY_WORKFLOW.phases.forEach((phase) => {
      grouped[phase.id] = [];
    });
    
    if (tasks && tasks.length > 0) {
      tasks.forEach((task) => {
        const stepName = task.step_name || task.title;
        // Find the matching step from INVENTORY_WORKFLOW
        const workflowStep = INVENTORY_WORKFLOW.steps.find(s => s.title === stepName);
        
        if (workflowStep) {
          const phaseGroup = grouped[workflowStep.phase];
          if (phaseGroup) {
            phaseGroup.push({
              ...workflowStep,
              backend_id: task.id,
              backend_status: task.status,
              backend_step_number: task.step_number,
              step_name: stepName
            });
          }
        } else {
          // Fallback mapping for older task names if any
          const legacyMapping = {
            'Create RFQ': 'Create RFQ Quotation',
            'Send RFQ to Vendor': 'Send Quotation to Vendor',
            'Receive & Record Quotes': 'Receive Vendor Quotation',
            'Create PO': 'Create Purchase Order',
            'Approve PO': 'Approve Purchase Order',
            'GRN Processing & QC': 'GRN Processing',
            'Add to Stock': 'Stock Addition'
          };
          
          const mappedName = legacyMapping[stepName];
          if (mappedName) {
            const legacyStep = INVENTORY_WORKFLOW.steps.find(s => s.title === mappedName);
            if (legacyStep) {
              const phaseGroup = grouped[legacyStep.phase];
              if (phaseGroup) {
                phaseGroup.push({
                  ...legacyStep,
                  backend_id: task.id,
                  backend_status: task.status,
                  backend_step_number: task.step_number,
                  step_name: stepName
                });
              }
            }
          }
        }
      });
    } else {
      INVENTORY_WORKFLOW.phases.forEach((phase) => {
        grouped[phase.id] = INVENTORY_WORKFLOW.steps.filter(s => s.phase === phase.id);
      });
    }
    
    return grouped;
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
        <h2 className="text-md font-bold text-slate-900 dark:text-white text-xs">
          Inventory Task Management
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
          Create and manage tasks for Material Requests
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Material Requests */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[calc(100vh-200px)]">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
              <Package size={18} className="text-blue-600" />
              Material Requests
            </h2>
            <button
              onClick={fetchMaterialRequests}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Refresh requests"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {materialRequests.length > 0 ? (
              materialRequests.map((mr) => (
                <div
                  key={mr.id}
                  onClick={() => setSelectedMR(mr)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedMR?.id === mr.id
                      ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 shadow-sm"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {mr.mr_number}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMR(mr.id, mr.mr_number);
                      }}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                    {mr.purpose || "Material Request"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-tight bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                      {mr.department}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(mr.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Package className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-xs text-slate-500">No requests found</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Tasks */}
        <div className="lg:col-span-3">
          {selectedMR ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <FileText size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                          {selectedMR.mr_number}
                        </h2>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                          selectedMR.priority === 'critical' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {selectedMR.priority}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                        {selectedMR.purpose} • {selectedMR.department} Department
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center gap-2 font-bold text-xs uppercase"
                    >
                      <Plus size={16} />
                      Add Task
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      Request Date
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {new Date(selectedMR.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      Workflow Steps
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {tasks.length} Created
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      Completion
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      Workflow Status
                    </p>
                    <p
                      className={`text-sm font-bold mt-1 uppercase ${
                        tasks.every((t) => t.status === "completed") && tasks.length > 0
                          ? "text-green-600"
                          : tasks.some((t) => t.status === "in_progress")
                          ? "text-blue-600"
                          : "text-amber-600"
                      }`}
                    >
                      {tasks.length === 0
                        ? "pending"
                        : tasks.every((t) => t.status === "completed")
                        ? "completed"
                        : "in progress"}
                    </p>
                  </div>
                </div>

                {tasks.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Zap size={18} className="text-amber-500" />
                        Execution Workflow
                      </h4>
                      <div className="flex gap-2">
                        <button
                          onClick={handleInitializeWorkflow}
                          disabled={isInitiatingWorkflow}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100 transition-all disabled:opacity-50"
                          title="Initialize or missing workflow tasks"
                        >
                          <RefreshCw size={12} className={isInitiatingWorkflow ? "animate-spin" : ""} />
                          Sync Workflow
                        </button>
                        {selectedTasks.size > 0 && (
                          <button
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all disabled:opacity-50"
                          >
                            <Trash2 size={12} />
                            Delete ({selectedTasks.size})
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      {INVENTORY_WORKFLOW.phases.map((phase) => {
                        const phaseTasks = getTasksByPhase()[phase.id] || [];
                        if (phaseTasks.length === 0) return null;

                        return (
                          <div
                            key={phase.id}
                            className="space-y-3"
                          >
                            <div className="flex items-center justify-between px-1">
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${getPhaseColor(phase.id).replace('bg-', 'bg-').split(' ')[0]}`} />
                                <h5 className={`font-bold text-[10px] uppercase tracking-wider ${getPhaseTextColor(phase.id)}`}>
                                  {phase.name}
                                </h5>
                              </div>
                              <input
                                type="checkbox"
                                checked={phaseTasks.every((t) => selectedTasks.has(t.id))}
                                onChange={() => toggleSelectAll(phaseTasks.map((t) => t.id))}
                                className="w-3.5 h-3.5 rounded border-slate-300"
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                              {phaseTasks
                                .sort((a, b) => (a.step_number || 0) - (b.step_number || 0))
                                .map((task) => (
                                  <div
                                    key={task.id}
                                    className={`group rounded-xl p-4 transition-all border ${
                                      selectedTasks.has(task.id)
                                        ? "bg-blue-50/50 dark:bg-blue-900/20 border-blue-300"
                                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-sm"
                                    }`}
                                  >
                                    <div className="flex items-start gap-4">
                                      <input
                                        type="checkbox"
                                        checked={selectedTasks.has(task.id)}
                                        onChange={() => toggleTaskSelection(task.id)}
                                        className="w-4 h-4 mt-1 rounded border-slate-300"
                                      />
                                      <div
                                        className="flex-1 cursor-pointer"
                                        onClick={() => handleTaskNavigation(task)}
                                      >
                                        <div className="flex items-start justify-between">
                                          <div>
                                            <h6 className="font-bold text-slate-900 dark:text-white text-sm">
                                              {task.title || task.step_name}
                                            </h6>
                                            <div className="flex items-center gap-3 mt-1.5">
                                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(task.backend_status || task.status)}`}>
                                                {task.backend_status || task.status}
                                              </span>
                                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getPriorityBadge(task.priority)}`}>
                                                {task.priority}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteTask(task.id);
                                              }}
                                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                            <div className="p-1.5 text-blue-600 bg-blue-50 rounded-lg">
                                              <Play size={14} />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {tasks.length === 0 && (
                  <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Zap size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Initialize Workflow</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                      No active workflow tasks found for this request. Click the button below to automatically generate all required inventory workflow steps.
                    </p>
                    <div className="mt-6">
                      <Button
                        onClick={handleInitializeWorkflow}
                        loading={isInitiatingWorkflow}
                        icon={Play}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95"
                      >
                        {isInitiatingWorkflow ? "Initializing..." : "Initialize Workflow Tasks"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 p-12">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mb-6">
                <Package size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Workflow Management</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center max-w-sm">
                Select a material request from the left panel to manage its acquisition and fulfillment workflow tasks.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Custom Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Create Custom Task</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g., GRN Processing, QC Inspection, Stock Addition"
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
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Task"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTasksPage;
