const pool = require('../../config/database');
const RootCardInventoryTask = require('../../models/RootCardInventoryTask');

exports.getRootCardInventoryTasks = async (req, res) => {
  try {
    const { rootCardId } = req.params;

    if (!rootCardId) {
      return res.status(400).json({ message: 'Root Card ID is required' });
    }

    const [rootCard] = await pool.execute(
      'SELECT id, name, code FROM projects WHERE id = ? LIMIT 1',
      [rootCardId]
    );

    if (!rootCard.length) {
      return res.status(404).json({ message: 'Root Card not found' });
    }

    let tasks = await RootCardInventoryTask.getRootCardInventoryTasks(rootCardId, true);
    
    if (tasks.length === 0) {
      console.log(`[getRootCardInventoryTasks] No tasks found for root card ${rootCardId}, auto-initializing...`);
      const result = await RootCardInventoryTask.initializeRootCardTasks(rootCardId, null);
      console.log(`[getRootCardInventoryTasks] Auto-initialization result:`, result);
      tasks = await RootCardInventoryTask.getRootCardInventoryTasks(rootCardId, true);
    }
    
    const progress = await RootCardInventoryTask.getRootCardWorkflowProgress(rootCardId);

    res.json({
      rootCard: rootCard[0],
      tasks,
      progress,
      totalSteps: RootCardInventoryTask.WORKFLOW_STEPS.length
    });
  } catch (error) {
    console.error('Get root card inventory tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const { taskId, rootCardId } = req.params;

    if (!taskId || !rootCardId) {
      return res.status(400).json({ message: 'Task ID and Root Card ID are required' });
    }

    const task = await RootCardInventoryTask.getTaskById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.root_card_id !== parseInt(rootCardId)) {
      return res.status(403).json({ message: 'Unauthorized: Root Card ID does not match' });
    }

    const [rootCard] = await pool.execute(
      'SELECT id, name, code FROM projects WHERE id = ? LIMIT 1',
      [rootCardId]
    );

    res.json({
      task,
      rootCard: rootCard[0],
      stepName: RootCardInventoryTask.WORKFLOW_STEPS.find(s => s.step === task.step_number)?.name
    });
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.completeTask = async (req, res) => {
  try {
    const { taskId, rootCardId } = req.params;
    const { notes } = req.body;
    const userId = req.user?.id;

    if (!taskId || !rootCardId) {
      return res.status(400).json({ message: 'Task ID and Root Card ID are required' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'User ID is required' });
    }

    const task = await RootCardInventoryTask.getTaskById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.root_card_id !== parseInt(rootCardId)) {
      return res.status(403).json({ message: 'Unauthorized: Root Card ID does not match' });
    }

    const result = await RootCardInventoryTask.completeTask(taskId, userId);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Failed to complete task' });
    }

    if (notes) {
      await pool.execute(
        'UPDATE root_card_inventory_tasks SET notes = ? WHERE id = ?',
        [notes, taskId]
      );
    }

    const updatedTask = await RootCardInventoryTask.getTaskById(taskId);
    const progress = await RootCardInventoryTask.getRootCardWorkflowProgress(rootCardId);

    res.json({
      message: 'Task completed successfully',
      task: updatedTask,
      progress
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId, rootCardId } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!taskId || !rootCardId) {
      return res.status(400).json({ message: 'Task ID and Root Card ID are required' });
    }

    if (!status || !['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const task = await RootCardInventoryTask.getTaskById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.root_card_id !== parseInt(rootCardId)) {
      return res.status(403).json({ message: 'Unauthorized: Root Card ID does not match' });
    }

    const result = await RootCardInventoryTask.updateTaskStatus(taskId, status, userId);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Failed to update task' });
    }

    const updatedTask = await RootCardInventoryTask.getTaskById(taskId);
    const progress = await RootCardInventoryTask.getRootCardWorkflowProgress(rootCardId);

    res.json({
      message: 'Task status updated successfully',
      task: updatedTask,
      progress
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getWorkflowProgress = async (req, res) => {
  try {
    const { rootCardId } = req.params;

    if (!rootCardId) {
      return res.status(400).json({ message: 'Root Card ID is required' });
    }

    const progress = await RootCardInventoryTask.getRootCardWorkflowProgress(rootCardId);

    res.json(progress);
  } catch (error) {
    console.error('Get workflow progress error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.linkReferenceToTask = async (req, res) => {
  try {
    const { taskId, rootCardId } = req.params;
    const { referenceId, referenceType } = req.body;

    if (!taskId || !rootCardId) {
      return res.status(400).json({ message: 'Task ID and Root Card ID are required' });
    }

    if (!referenceId || !referenceType) {
      return res.status(400).json({ message: 'Reference ID and Type are required' });
    }

    const task = await RootCardInventoryTask.getTaskById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.root_card_id !== parseInt(rootCardId)) {
      return res.status(403).json({ message: 'Unauthorized: Root Card ID does not match' });
    }

    const result = await RootCardInventoryTask.updateTaskWithReference(
      taskId,
      referenceId,
      referenceType,
      'in_progress'
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Failed to link reference' });
    }

    const updatedTask = await RootCardInventoryTask.getTaskById(taskId);

    res.json({
      message: 'Reference linked successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Link reference to task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
