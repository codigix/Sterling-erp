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
    const projectId = params.get("projectId");
    return projectId ? parseInt(projectId, 10) : null;
  },

  getProjectInventoryTaskParams: () => {
    const params = new URLSearchParams(window.location.search);
    return {
      taskId: params.get("taskId") ? parseInt(params.get("taskId"), 10) : null,
      projectId: params.get("projectId") ? parseInt(params.get("projectId"), 10) : null,
      rootCardId: params.get("rootCardId") ? parseInt(params.get("rootCardId"), 10) : null,
      taskTitle: params.get("taskTitle"),
    };
  },

  completeProjectInventoryTask: async (taskId, projectId, notes = "") => {
    try {
      if (!taskId || !projectId) {
        return null;
      }
      const response = await axios.patch(
        `/inventory/project-tasks/project/${projectId}/task/${taskId}/complete`,
        { notes }
      );
      return response.data;
    } catch (error) {
      console.error("Error completing project inventory task:", error);
      throw error;
    }
  },

  updateProjectInventoryTaskStatus: async (taskId, projectId, status) => {
    try {
      if (!taskId || !projectId) {
        return null;
      }
      if (!["pending", "in_progress", "completed"].includes(status)) {
        throw new Error("Invalid status value");
      }
      const response = await axios.patch(
        `/inventory/project-tasks/project/${projectId}/task/${taskId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating project inventory task status:", error);
      throw error;
    }
  },

  completeProjectTaskIfPresent: async (taskId, notes = "") => {
    const projectId = taskService.getProjectIdFromParams();
    if (projectId && taskId) {
      try {
        return await taskService.completeProjectInventoryTask(taskId, projectId, notes);
      } catch (error) {
        console.error("Error completing project task:", error);
        return null;
      }
    }
    return null;
  },

  isNavigatingFromDepartmentTasks: () => {
    const projectId = taskService.getProjectIdFromParams();
    return projectId !== null;
  },

  autoCompleteTaskByAction: async (taskId, actionType) => {
    if (!taskId) return null;
    try {
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
        return await taskService.completeTask(taskId);
      } else {
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
};

export default taskService;
