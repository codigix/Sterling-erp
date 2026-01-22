import { useCallback } from 'react';
import taskService from '../utils/taskService';

export const useRootCardInventoryTask = () => {
  const isFromDepartmentTasks = useCallback(() => {
    return taskService.isNavigatingFromDepartmentTasks();
  }, []);

  const getTaskParams = useCallback(() => {
    return taskService.getRootCardInventoryTaskParams();
  }, []);

  const completeCurrentTask = useCallback(async (notes = '') => {
    const { taskId } = taskService.getRootCardInventoryTaskParams();
    if (!taskId) return null;
    return await taskService.completeRootCardTaskIfPresent(taskId, notes);
  }, []);

  const updateTaskStatus = useCallback(async (status) => {
    const { taskId, rootCardId } = taskService.getRootCardInventoryTaskParams();
    if (!taskId || !rootCardId) return null;
    return await taskService.updateRootCardInventoryTaskStatus(taskId, rootCardId, status);
  }, []);

  return {
    isFromDepartmentTasks,
    getTaskParams,
    completeCurrentTask,
    updateTaskStatus,
  };
};

export default useRootCardInventoryTask;
