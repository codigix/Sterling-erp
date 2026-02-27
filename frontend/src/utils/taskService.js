import axios from "@/utils/api";

export const taskService = {
  updateTaskStatus: async (taskId, status) => {
    try {
      if (!taskId) return null;
      const response = await axios.patch(
        `/department/portal/tasks/${taskId}`,
        { status }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating task status:", error);
      return null;
    }
  },

  completeTask: async (taskId) => {
    return taskService.updateTaskStatus(taskId, "completed");
  },

  markTaskInProgress: async (taskId) => {
    return taskService.updateTaskStatus(taskId, "in_progress");
  },

  markTaskOnHold: async (taskId) => {
    return taskService.updateTaskStatus(taskId, "on_hold");
  },

  getTaskIdFromParams: () => {
    const params = new URLSearchParams(window.location.search);
    const taskId = params.get("taskId");
    return taskId ? parseInt(taskId, 10) : null;
  },

  getTaskTitleFromParams: () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("taskTitle");
  },

  getGrnIdFromParams: () => {
    const params = new URLSearchParams(window.location.search);
    const grnId = params.get("grnId");
    return grnId ? parseInt(grnId, 10) : null;
  },

  getTaskDetailsFromParams: () => {
    const params = new URLSearchParams(window.location.search);
    return {
      taskId: params.get("taskId") ? parseInt(params.get("taskId"), 10) : null,
      taskTitle: params.get("taskTitle"),
      grnId: params.get("grnId") ? parseInt(params.get("grnId"), 10) : null,
      grnNo: params.get("grnNo"),
    };
  },

  getProjectIdFromParams: () => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("projectId") || params.get("rootCardId");
    return projectId ? parseInt(projectId, 10) : null;
  },

  getRootCardIdFromParams: () => {
    const params = new URLSearchParams(window.location.search);
    const rootCardId = params.get("rootCardId") || params.get("projectId");
    return rootCardId ? parseInt(rootCardId, 10) : null;
  },

  getRootCardInventoryTaskParams: () => {
    const params = new URLSearchParams(window.location.search);
    const rootCardId = params.get("rootCardId") || params.get("projectId");
    return {
      taskId: params.get("taskId") ? parseInt(params.get("taskId"), 10) : null,
      rootCardId: rootCardId ? parseInt(rootCardId, 10) : null,
      taskTitle: params.get("taskTitle"),
    };
  },

  completeRootCardInventoryTask: async (taskId, rootCardId, notes = "") => {
    try {
      if (!taskId || !rootCardId) {
        return null;
      }
      const response = await axios.patch(
        `/inventory/root-card-tasks/root-card/${rootCardId}/task/${taskId}/complete`,
        { notes }
      );
      return response.data;
    } catch (error) {
      console.error("Error completing root card inventory task:", error);
      throw error;
    }
  },

  updateRootCardInventoryTaskStatus: async (taskId, rootCardId, status) => {
    try {
      if (!taskId || !rootCardId) {
        return null;
      }
      if (!["pending", "in_progress", "completed"].includes(status)) {
        throw new Error("Invalid status value");
      }
      const response = await axios.patch(
        `/inventory/root-card-tasks/root-card/${rootCardId}/task/${taskId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating root card inventory task status:", error);
      throw error;
    }
  },

  completeRootCardTaskIfPresent: async (taskId, notes = "") => {
    const params = new URLSearchParams(window.location.search);
    const rootCardId = params.get("rootCardId") || params.get("projectId");
    const mrId = params.get("materialRequestId") || params.get("mrId");
    
    if (taskId) {
      try {
        let finalRootCardId = rootCardId;
        
        // If we have taskId but no rootCardId in URL, we might need to find it 
        // from the task details or MR if this is an MR-based workflow
        if (!finalRootCardId && mrId) {
          try {
            const response = await axios.get(`/inventory/material-requests/${mrId}`);
            const mr = response.data.materialRequest;
            finalRootCardId = mr?.sales_order_id || mr?.root_card_id;
          } catch (e) {
            console.error("Error resolving rootCardId from MR:", e);
          }
        }
        
        if (finalRootCardId) {
          return await taskService.completeRootCardInventoryTask(taskId, finalRootCardId, notes);
        } else {
          // Fallback to generic task completion if no root card is linked
          return await taskService.completeTask(taskId);
        }
      } catch (error) {
        console.error("Error completing root card task:", error);
        return null;
      }
    }
    return null;
  },

  isNavigatingFromDepartmentTasks: () => {
    const rootCardId = taskService.getRootCardIdFromParams();
    return rootCardId !== null;
  },

  autoCompleteTaskByAction: async (taskId, actionType) => {
    if (!taskId) return null;
    try {
      const rootCardId = taskService.getRootCardIdFromParams();
      const taskTitle = taskService.getTaskTitleFromParams() || "";
      const normalizedTitle = taskTitle.toLowerCase();
      const normalizedAction = (actionType || "").toLowerCase();

      const completionActions = [
        "create",
        "submit",
        "approve",
        "send",
        "receive",
        "save",
        "process",
        "complete",
      ];

      const shouldComplete =
        completionActions.some(
          (action) =>
            normalizedTitle.includes(action) ||
            normalizedAction.includes(action)
        ) ||
        normalizedTitle.includes(normalizedAction);

      if (shouldComplete) {
        if (rootCardId) {
          return await taskService.completeRootCardInventoryTask(taskId, rootCardId);
        }
        return await taskService.completeTask(taskId);
      } else {
        if (rootCardId) {
          return await taskService.updateRootCardInventoryTaskStatus(taskId, rootCardId, "in_progress");
        }
        return await taskService.markTaskInProgress(taskId);
      }
    } catch (error) {
      console.error("Error in autoCompleteTaskByAction:", error);
      return null;
    }
  },

  completeCurrentTaskAndNotify: async (taskId, successMessage = "") => {
    if (!taskId) return null;
    try {
      const result = await taskService.completeTask(taskId);
      if (result && successMessage) {
        console.log(`Task completed: ${successMessage}`);
      }
      return result;
    } catch (error) {
      console.error("Error completing task:", error);
      return null;
    }
  },

  deleteTask: async (taskId) => {
    try {
      if (!taskId) {
        throw new Error("Task ID is required");
      }
      const response = await axios.delete(`/department/portal/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete task";
      console.error("Error deleting task:", message);
      throw new Error(message);
    }
  },

  deleteTasks: async (taskIds) => {
    try {
      if (!Array.isArray(taskIds) || taskIds.length === 0) {
        throw new Error("Task IDs array is required");
      }
      const response = await axios.post("/department/portal/tasks/delete-bulk", {
        taskIds,
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete tasks";
      console.error("Error deleting tasks:", message);
      throw new Error(message);
    }
  },

  deleteRootCard: async (rootCardId) => {
    try {
      if (!rootCardId) {
        throw new Error("Root Card ID is required");
      }
      const response = await axios.delete(`/production/root-cards/${rootCardId}`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete root card";
      console.error("Error deleting root card:", message);
      throw new Error(message);
    }
  },

  initializeMRWorkflow: async (mrId) => {
    try {
      if (!mrId) {
        throw new Error("Material Request ID is required");
      }
      const response = await axios.post(
        `/inventory/root-card-tasks/mr/${mrId}/initialize`
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to initialize workflow";
      console.error("Error initializing MR workflow:", message);
      throw new Error(message);
    }
  },
};

export default taskService;
