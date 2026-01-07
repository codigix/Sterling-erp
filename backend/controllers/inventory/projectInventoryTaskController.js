const pool = require('../../config/database');
const ProjectInventoryTask = require('../../models/ProjectInventoryTask');

exports.getProjectInventoryTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const [project] = await pool.execute(
      'SELECT id, name, code FROM projects WHERE id = ? LIMIT 1',
      [projectId]
    );

    if (!project.length) {
      return res.status(404).json({ message: 'Project not found' });
    }

    let tasks = await ProjectInventoryTask.getProjectInventoryTasks(projectId, true);
    
    if (tasks.length === 0) {
      console.log(`[getProjectInventoryTasks] No tasks found for project ${projectId}, auto-initializing...`);
      const result = await ProjectInventoryTask.initializeProjectTasks(projectId, null);
      console.log(`[getProjectInventoryTasks] Auto-initialization result:`, result);
      tasks = await ProjectInventoryTask.getProjectInventoryTasks(projectId, true);
    }
    
    const progress = await ProjectInventoryTask.getProjectWorkflowProgress(projectId);

    res.json({
      project: project[0],
      tasks,
      progress,
      totalSteps: ProjectInventoryTask.WORKFLOW_STEPS.length
    });
  } catch (error) {
    console.error('Get project inventory tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const { taskId, projectId } = req.params;

    if (!taskId || !projectId) {
      return res.status(400).json({ message: 'Task ID and Project ID are required' });
    }

    const task = await ProjectInventoryTask.getTaskById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.project_id !== parseInt(projectId)) {
      return res.status(403).json({ message: 'Unauthorized: Project ID does not match' });
    }

    const [project] = await pool.execute(
      'SELECT id, name, code FROM projects WHERE id = ? LIMIT 1',
      [projectId]
    );

    res.json({
      task,
      project: project[0],
      stepName: ProjectInventoryTask.WORKFLOW_STEPS.find(s => s.step === task.step_number)?.name
    });
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.completeTask = async (req, res) => {
  try {
    const { taskId, projectId } = req.params;
    const { notes } = req.body;
    const userId = req.user?.id;

    if (!taskId || !projectId) {
      return res.status(400).json({ message: 'Task ID and Project ID are required' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'User ID is required' });
    }

    const task = await ProjectInventoryTask.getTaskById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.project_id !== parseInt(projectId)) {
      return res.status(403).json({ message: 'Unauthorized: Project ID does not match' });
    }

    const result = await ProjectInventoryTask.completeTask(taskId, userId);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Failed to complete task' });
    }

    if (notes) {
      await pool.execute(
        'UPDATE project_inventory_tasks SET notes = ? WHERE id = ?',
        [notes, taskId]
      );
    }

    const updatedTask = await ProjectInventoryTask.getTaskById(taskId);
    const progress = await ProjectInventoryTask.getProjectWorkflowProgress(projectId);

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
    const { taskId, projectId } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!taskId || !projectId) {
      return res.status(400).json({ message: 'Task ID and Project ID are required' });
    }

    if (!status || !['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const task = await ProjectInventoryTask.getTaskById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.project_id !== parseInt(projectId)) {
      return res.status(403).json({ message: 'Unauthorized: Project ID does not match' });
    }

    const result = await ProjectInventoryTask.updateTaskStatus(taskId, status, userId);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Failed to update task' });
    }

    const updatedTask = await ProjectInventoryTask.getTaskById(taskId);
    const progress = await ProjectInventoryTask.getProjectWorkflowProgress(projectId);

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
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const progress = await ProjectInventoryTask.getProjectWorkflowProgress(projectId);

    res.json(progress);
  } catch (error) {
    console.error('Get workflow progress error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.linkReferenceToTask = async (req, res) => {
  try {
    const { taskId, projectId } = req.params;
    const { referenceId, referenceType } = req.body;

    if (!taskId || !projectId) {
      return res.status(400).json({ message: 'Task ID and Project ID are required' });
    }

    if (!referenceId || !referenceType) {
      return res.status(400).json({ message: 'Reference ID and Type are required' });
    }

    const task = await ProjectInventoryTask.getTaskById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.project_id !== parseInt(projectId)) {
      return res.status(403).json({ message: 'Unauthorized: Project ID does not match' });
    }

    const result = await ProjectInventoryTask.updateTaskWithReference(
      taskId,
      referenceId,
      referenceType,
      'in_progress'
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Failed to link reference' });
    }

    const updatedTask = await ProjectInventoryTask.getTaskById(taskId);

    res.json({
      message: 'Reference linked successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Link reference to task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
