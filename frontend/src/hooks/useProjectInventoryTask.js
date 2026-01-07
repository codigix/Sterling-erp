import { useCallback } from 'react';
import taskService from '../utils/taskService';

export const useProjectInventoryTask = () => {
  const isFromDepartmentTasks = useCallback(() => {
    return taskService.isNavigatingFromDepartmentTasks();
  }, []);

  const getTaskParams = useCallback(() => {
    return taskService.getProjectInventoryTaskParams();
  }, []);

  const completeCurrentTask = useCallback(async (notes = '') => {
    const { taskId } = taskService.getProjectInventoryTaskParams();
    if (!taskId) return null;
    return await taskService.completeProjectTaskIfPresent(taskId, notes);
  }, []);

  const updateTaskStatus = useCallback(async (status) => {
    const { taskId, projectId } = taskService.getProjectInventoryTaskParams();
    if (!taskId || !projectId) return null;
    return await taskService.updateProjectInventoryTaskStatus(taskId, projectId, status);
  }, []);

  return {
    isFromDepartmentTasks,
    getTaskParams,
    completeCurrentTask,
    updateTaskStatus,
  };
};

export default useProjectInventoryTask;
