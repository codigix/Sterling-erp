import React, { useState, useEffect, useCallback } from "react";
import axios from "@/utils/api";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  Plus,
  Loader2,
  AlertCircle,
  X,
  Truck,
  Package,
  Zap,
  Mail,
  Eye,
  TrendingDown,
  Boxes,
  RefreshCw,
  FileText,
  Trash2,
  Play,
} from "lucide-react";
import Button from "@/components/ui/Button";
import {
  INVENTORY_WORKFLOW,
  generateWorkflowTasks,
} from "@/constants/inventoryWorkflow";
import { taskService } from "@/utils/taskService";
import CheckProjectMaterialRequirementsModal from "@/components/inventory/CheckProjectMaterialRequirementsModal";

const InventoryTasksPage = () => {
  const navigate = useNavigate();
  const [rootCards, setRootCards] = useState([]);
  const [selectedRootCard, setSelectedRootCard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);
  const [workflowProgress, setWorkflowProgress] = useState(0);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [workflowJustCreated, setWorkflowJustCreated] = useState(false);
  const [isInitiatingWorkflow, setIsInitiatingWorkflow] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isDeletingRootCard, setIsDeletingRootCard] = useState(false);
  const [showMaterialCheckModal, setShowMaterialCheckModal] = useState(false);
  const [currentTaskForModal, setCurrentTaskForModal] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
  });

  useEffect(() => {
    fetchRoleId();
  }, []);

  useEffect(() => {
    if (roleId) {
      fetchRootCards();
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

  const fetchRootCards = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/production/root-cards");
      const data = (response.data?.rootCards || response.data || []).filter(
        (card) => card.department === "inventory" || !card.department
      );
      setRootCards(data);
      if (data && data.length > 0) {
        setSelectedRootCard(data[0]);
      }
    } catch {
      console.error("Error fetching root cards");
      setError("Error loading root cards");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksForRootCard = useCallback(
    async (rootCard) => {
      try {
        if (!roleId) return;
        const response = await axios.get(`/department/portal/tasks/${roleId}`);
        const rootCardIdNum = Number(rootCard.id);
        const filtered = response.data.filter((t) => {
          return (
            Number(t.rootCard?.id) === rootCardIdNum ||
            Number(t.rootCardId) === rootCardIdNum
          );
        });
        setTasks(filtered);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setTasks([]);
      }
    },
    [roleId]
  );

  useEffect(() => {
    if (selectedRootCard && roleId) {
      fetchTasksForRootCard(selectedRootCard);
    }
  }, [selectedRootCard, roleId, fetchTasksForRootCard]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Task title is required");
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
        rootCardId: selectedRootCard?.id,
        project: selectedRootCard?.project || {},
      };

      const response = await axios.post("/department/portal/tasks", payload);

      if (response.status === 201) {
        setShowCreateModal(false);
        setFormData({
          title: "",
          description: "",
          priority: "medium",
          status: "pending",
        });
        await fetchTasksForRootCard(selectedRootCard);
        handleTaskNavigation(response.data);
      }
    } catch (err) {
      console.error("Error creating task:", err);
      alert(
        "Failed to create task: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleTaskNavigation = (task) => {
    const taskTitle = (task.title || "").toLowerCase();
    const baseParams = `taskId=${task.id}&taskTitle=${encodeURIComponent(
      task.title
    )}&rootCardId=${selectedRootCard?.id}`;

    if (taskTitle.includes("material") && taskTitle.includes("requirement")) {
      setCurrentTaskForModal(task);
      setShowMaterialCheckModal(true);
    } else if (
      taskTitle.includes("rfq") ||
      (taskTitle.includes("quotation") && taskTitle.includes("create"))
    ) {
      navigate(`/inventory-manager/vendors/quotations?${baseParams}`);
    } else if (taskTitle.includes("send") && taskTitle.includes("quotation")) {
      navigate(`/inventory-manager/vendors/quotations?${baseParams}`);
    } else if (
      taskTitle.includes("receive") &&
      taskTitle.includes("quotation")
    ) {
      navigate(`/inventory-manager/vendors/quotations?${baseParams}`);
    } else if (
      taskTitle.includes("create") &&
      taskTitle.includes("purchase order")
    ) {
      navigate(`/inventory-manager/vendors/po?${baseParams}`);
    } else if (taskTitle.includes("send") && taskTitle.includes("po")) {
      navigate(`/inventory-manager/vendors/po?${baseParams}`);
    } else if (
      taskTitle.includes("receive") &&
      taskTitle.includes("material")
    ) {
      navigate(`/inventory-manager/qc/grn?${baseParams}`);
    } else if (
      taskTitle.includes("approve") &&
      taskTitle.includes("purchase order")
    ) {
      navigate(`/inventory-manager/vendors/po?${baseParams}`);
    } else if (taskTitle.includes("grn") || taskTitle.includes("processing")) {
      navigate(`/inventory-manager/qc/grn?${baseParams}`);
    } else if (taskTitle.includes("qc") || taskTitle.includes("inspection")) {
      navigate(`/inventory-manager/qc/inspections?${baseParams}`);
    } else if (taskTitle.includes("stock") && taskTitle.includes("add")) {
      navigate(`/inventory-manager/stock/view?${baseParams}`);
    } else if (taskTitle.includes("batch") || taskTitle.includes("location")) {
      navigate(`/inventory-manager/tracking/batches?${baseParams}`);
    } else if (taskTitle.includes("view") && taskTitle.includes("stock")) {
      navigate(`/inventory-manager/stock/view?${baseParams}`);
    } else if (taskTitle.includes("stock") && taskTitle.includes("movement")) {
      navigate(`/inventory-manager/stock/movements?${baseParams}`);
    } else if (taskTitle.includes("reorder")) {
      navigate(`/inventory-manager/stock/reorder?${baseParams}`);
    } else {
      navigate(`/inventory-manager/qc/grn?${baseParams}`);
    }
  };

  const handleCreateWorkflowTasks = async () => {
    if (!selectedRootCard) {
      alert("Please select a root card");
      return;
    }

    setIsCreatingWorkflow(true);
    setWorkflowProgress(0);

    try {
      const workflowTasks = generateWorkflowTasks(selectedRootCard, roleId);
      const totalTasks = workflowTasks.length;

      for (let i = 0; i < workflowTasks.length; i++) {
        await axios.post("/department/portal/tasks", workflowTasks[i]);
        setWorkflowProgress(Math.round(((i + 1) / totalTasks) * 100));
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      alert(
        `Successfully created ${totalTasks} inventory workflow tasks for ${selectedRootCard.project?.name || "this project"}!`
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      await fetchTasksForRootCard(selectedRootCard);
      setWorkflowProgress(0);
      setWorkflowJustCreated(true);
      setCurrentTaskIndex(0);
    } catch (err) {
      console.error("Error creating workflow tasks:", err);
      alert(
        "Workflow task creation failed: " +
          (err.response?.data?.message || err.message)
      );
      setWorkflowProgress(0);
    } finally {
      setIsCreatingWorkflow(false);
    }
  };

  const handleInitiateWorkflow = async () => {
    const sortedTasks = [...tasks].sort((a, b) => {
      const stepA = INVENTORY_WORKFLOW.steps.find(
        (s) => s.title === a.title
      );
      const stepB = INVENTORY_WORKFLOW.steps.find(
        (s) => s.title === b.title
      );
      return (stepA?.order || 0) - (stepB?.order || 0);
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
        await fetchTasksForRootCard(selectedRootCard);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        handleTaskNavigation(task);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      setWorkflowJustCreated(false);
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

  const handleDeleteRootCard = async (rootCardId, rootCardName) => {
    if (
      !confirm(
        `Delete root card "${rootCardName}"? This will also delete all associated tasks. This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeletingRootCard(true);
    try {
      await taskService.deleteRootCard(rootCardId);
      await fetchRootCards();
      alert("Root card and all associated tasks deleted successfully");
    } catch (err) {
      const errorMessage =
        err.message || "Failed to delete root card. Please try again.";
      console.error("Error deleting root card:", err);
      alert(errorMessage);
    } finally {
      setIsDeletingRootCard(false);
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
      await fetchTasksForRootCard(selectedRootCard);
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
      await fetchTasksForRootCard(selectedRootCard);
      setSelectedTasks(new Set());
      setShowBulkDeleteConfirm(false);
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

  const getRootCardInfo = (rootCard) => {
    if (rootCard.code) return rootCard.code;
    return `RC-${String(rootCard.id).padStart(4, "0")}`;
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
      grouped[phase.id] = tasks.filter((task) => {
        const stepInfo = INVENTORY_WORKFLOW.steps.find(
          (step) => step.title === task.title
        );
        return stepInfo?.phase === phase.id;
      });
    });
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
          Create and manage tasks for GRN root cards
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Package size={18} />
            Root Cards
          </h3>
          <div className="space-y-2">
            {rootCards.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No root cards available
              </p>
            ) : (
              rootCards.map((card) => (
                <div
                  key={card.id}
                  className={`group flex items-start gap-2 p-3 rounded-lg transition-colors text-sm ${
                    selectedRootCard?.id === card.id
                      ? "bg-blue-100 dark:bg-blue-900 border border-blue-300"
                      : "hover:bg-slate-100 dark:hover:bg-slate-700 border border-transparent"
                  }`}
                >
                  <button
                    onClick={() => setSelectedRootCard(card)}
                    className={`flex-1 text-left ${
                      selectedRootCard?.id === card.id
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <p className="font-medium">{card.project?.name || getRootCardInfo(card)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {getRootCardInfo(card)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {card.project?.code || "No code"}
                    </p>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRootCard(
                        card.id,
                        card.project?.name || getRootCardInfo(card)
                      );
                    }}
                    disabled={isDeletingRootCard}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors flex-shrink-0 disabled:opacity-50 opacity-0 group-hover:opacity-100"
                    title="Delete root card and all tasks"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {selectedRootCard ? (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedRootCard.project?.name || getRootCardInfo(selectedRootCard)}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {selectedRootCard.project?.code || "N/A"}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {!workflowJustCreated ? (
                      <>
                        <Button
                          onClick={handleCreateWorkflowTasks}
                          disabled={isCreatingWorkflow}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                            isCreatingWorkflow
                              ? "bg-amber-500 text-white opacity-75"
                              : "bg-amber-500 hover:bg-amber-600 text-white"
                          }`}
                        >
                          {isCreatingWorkflow ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Creating... ({workflowProgress}%)
                            </>
                          ) : (
                            <>
                              <Zap size={16} />
                              Create Workflow
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => setShowCreateModal(true)}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                        >
                          <Plus size={16} />
                          Custom Task
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={handleInitiateWorkflow}
                        disabled={isInitiatingWorkflow}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                          isInitiatingWorkflow
                            ? "bg-green-500 text-white opacity-75"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                      >
                        {isInitiatingWorkflow ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Starting... (Task {currentTaskIndex + 1}/{tasks.length})
                          </>
                        ) : (
                          <>
                            <Play size={16} />
                            Start Workflow
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Root Card ID
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white text-xs mt-1">
                      {getRootCardInfo(selectedRootCard)}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Department
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white text-xs mt-1">
                      {selectedRootCard.department || "Inventory"}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Tasks Created
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white text-xs mt-1">
                      {tasks.length}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Status
                    </p>
                    <p
                      className={`text-xs font-bold mt-1 capitalize ${
                        tasks.every((t) => t.status === "completed")
                          ? "text-green-600"
                          : tasks.some((t) => t.status === "in_progress")
                          ? "text-blue-600"
                          : "text-yellow-600"
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

                {selectedRootCard.project && (
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg border border-blue-200 dark:border-blue-700 p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                          {selectedRootCard.project.name}
                        </h3>
                        {selectedRootCard.project?.code && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {selectedRootCard.project.code}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                          Project
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {tasks.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                      Workflow Progress ({tasks.length} tasks)
                    </h4>

                    <div className="mb-4 flex gap-2 flex-wrap justify-between items-center">
                      <div className="flex gap-2 flex-wrap">
                        {INVENTORY_WORKFLOW.phases.map((phase) => {
                          const phaseTasks = getTasksByPhase()[phase.id] || [];
                          const isSelected =
                            selectedPhase === null || selectedPhase === phase.id;
                          return (
                            <button
                              key={phase.id}
                              onClick={() =>
                                setSelectedPhase(
                                  selectedPhase === phase.id ? null : phase.id
                                )
                              }
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                                isSelected
                                  ? getPhaseColor(phase.id) +
                                    " border " +
                                    getPhaseTextColor(phase.id)
                                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-transparent"
                              }`}
                            >
                              {phase.name.split(" ")[0]} ({phaseTasks.length})
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setSelectedPhase(null)}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600 transition-all"
                        >
                          All Phases
                        </button>
                      </div>
                      {selectedTasks.size > 0 && (
                        <button
                          onClick={handleBulkDelete}
                          disabled={isDeleting}
                          className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-600 hover:bg-red-200 dark:hover:bg-red-900 transition-all disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          Delete ({selectedTasks.size})
                        </button>
                      )}
                    </div>

                    <div className="space-y-6">
                      {INVENTORY_WORKFLOW.phases.map((phase) => {
                        if (selectedPhase && selectedPhase !== phase.id) {
                          return null;
                        }

                        const phaseTasks = getTasksByPhase()[phase.id] || [];
                        if (phaseTasks.length === 0) return null;

                        return (
                          <div
                            key={phase.id}
                            className={`rounded-lg border p-4 ${getPhaseColor(
                              phase.id
                            )}`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h5
                                className={`font-bold text-sm ${getPhaseTextColor(
                                  phase.id
                                )}`}
                              >
                                {phase.name}
                              </h5>
                              {phaseTasks.length > 0 && (
                                <input
                                  type="checkbox"
                                  checked={
                                    phaseTasks.length > 0 &&
                                    phaseTasks.every((t) =>
                                      selectedTasks.has(t.id)
                                    )
                                  }
                                  onChange={() =>
                                    toggleSelectAll(phaseTasks.map((t) => t.id))
                                  }
                                  className="w-4 h-4 cursor-pointer"
                                  title="Select all tasks in this phase"
                                />
                              )}
                            </div>
                            <div className="space-y-2">
                              {phaseTasks
                                .sort((a, b) => {
                                  const stepA = INVENTORY_WORKFLOW.steps.find(
                                    (s) => s.title === a.title
                                  );
                                  const stepB = INVENTORY_WORKFLOW.steps.find(
                                    (s) => s.title === b.title
                                  );
                                  return (
                                    (stepA?.order || 0) - (stepB?.order || 0)
                                  );
                                })
                                .map((task) => (
                                  <div
                                    key={task.id}
                                    className={`rounded-lg p-3 hover:shadow-md dark:hover:shadow-slate-900/50 transition-all border ${
                                      selectedTasks.has(task.id)
                                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600"
                                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <input
                                        type="checkbox"
                                        checked={selectedTasks.has(task.id)}
                                        onChange={() =>
                                          toggleTaskSelection(task.id)
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-4 h-4 mt-1 cursor-pointer flex-shrink-0"
                                      />
                                      <div
                                        className="flex-1 cursor-pointer"
                                        onClick={() =>
                                          handleTaskNavigation(task)
                                        }
                                      >
                                        <div className="flex items-start justify-between mb-1">
                                          <div className="flex-1">
                                            <h6 className="font-semibold text-slate-900 dark:text-white text-xs">
                                              {task.title}
                                            </h6>
                                            {task.description && (
                                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                                {task.description}
                                              </p>
                                            )}
                                          </div>
                                          <span
                                            className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getStatusColor(
                                              task.status
                                            )}`}
                                          >
                                            {task.status}
                                          </span>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                          <span
                                            className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityBadge(
                                              task.priority
                                            )}`}
                                          >
                                            {task.priority}
                                          </span>
                                        </div>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteTask(task.id);
                                        }}
                                        disabled={isDeleting}
                                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors flex-shrink-0 disabled:opacity-50"
                                        title="Delete task"
                                      >
                                        <Trash2 size={16} />
                                      </button>
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
                  <div className="text-center py-8">
                    <AlertCircle
                      size={32}
                      className="text-slate-400 mx-auto mb-2"
                    />
                    <p className="text-slate-600 dark:text-slate-400">
                      No tasks created for this GRN yet
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Click "Create Task" to get started
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <Package size={40} className="text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400">
                Select a root card to view and create inventory workflow tasks
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
                Create Task
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

      {/* Material Requirements Check Modal */}
      <CheckProjectMaterialRequirementsModal
        isOpen={showMaterialCheckModal}
        onClose={() => {
          setShowMaterialCheckModal(false);
          setCurrentTaskForModal(null);
        }}
        projectId={selectedRootCard?.project?.id || selectedRootCard?.id}
        taskId={currentTaskForModal?.id}
        rootCardId={selectedRootCard?.id}
        rootCard={selectedRootCard}
      />
    </div>
  );
};

export default InventoryTasksPage;
