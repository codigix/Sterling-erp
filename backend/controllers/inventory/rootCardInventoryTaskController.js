const pool = require('../../config/database');
const RootCardInventoryTask = require('../../models/RootCardInventoryTask');

exports.getRootCardInventoryTasks = async (req, res) => {
  try {
    const { rootCardId } = req.params;

    if (!rootCardId) {
      return res.status(400).json({ message: 'Root Card ID is required' });
    }

    const [rootCardRows] = await pool.execute(
      'SELECT id, project_id, project_name, po_number FROM root_cards WHERE id = ? LIMIT 1',
      [rootCardId]
    );

    if (!rootCardRows.length) {
      return res.status(404).json({ message: 'Root Card not found' });
    }

    const projectId = rootCardRows[0].project_id;
    const rc = rootCardRows[0];

    // If projectId is missing, we use rootCardId as fallback for tasks 
    // but ideally we should have a projectId.
    // Let's try to fetch tasks using projectId if available, otherwise rootCardId
    const taskQueryId = projectId || rootCardId;

    const [projectRows] = await pool.execute(
      'SELECT id, name, code FROM projects WHERE id = ? LIMIT 1',
      [projectId || -1] // -1 to ensure no match if projectId is null
    );

    const projectData = projectRows.length > 0 ? projectRows[0] : {
      id: projectId || rootCardId,
      name: rc.project_name || `RC-${rc.po_number || rc.id}`,
      code: rc.po_number || `RC-${rc.id}`
    };

    let tasks = await RootCardInventoryTask.getRootCardInventoryTasks(taskQueryId, true);
    
    const progress = await RootCardInventoryTask.getRootCardWorkflowProgress(taskQueryId);

    res.json({
      rootCard: projectData,
      tasks,
      progress,
      totalSteps: RootCardInventoryTask.WORKFLOW_STEPS.length
    });
  } catch (error) {
    console.error('Get root card inventory tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getMRInventoryTasks = async (req, res) => {
  try {
    const { mrId } = req.params;

    if (!mrId) {
      return res.status(400).json({ message: 'Material Request ID is required' });
    }

    const [mrRows] = await pool.execute(
      'SELECT id, mr_number, purpose, department FROM material_requests WHERE id = ? LIMIT 1',
      [mrId]
    );

    if (!mrRows.length) {
      return res.status(404).json({ message: 'Material Request not found' });
    }

    const mr = mrRows[0];

    // Auto-sync workflow with actual PO/GRN states
    await RootCardInventoryTask.syncMRWorkflow(mrId);

    let tasks = await RootCardInventoryTask.getTasksByMaterialRequestId(mrId, true);
    const progress = await RootCardInventoryTask.getMRWorkflowProgress(mrId);

    res.json({
      materialRequest: mr,
      tasks,
      progress,
      totalSteps: RootCardInventoryTask.WORKFLOW_STEPS.length
    });
  } catch (error) {
    console.error('Get MR inventory tasks error:', error);
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

    const [rootCardRows] = await pool.execute(
      'SELECT project_id FROM root_cards WHERE id = ? LIMIT 1',
      [rootCardId]
    );

    const projectId = rootCardRows.length ? rootCardRows[0].project_id : null;

    const [projectRows] = await pool.execute(
      'SELECT id, name, code FROM projects WHERE id = ? LIMIT 1',
      [projectId]
    );

    res.json({
      task,
      rootCard: projectRows[0] || null,
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

    // Check if task belongs to the root card
    // Use task.root_card_id directly as it refers to root_cards.id in this model
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
    const progress = await RootCardInventoryTask.getRootCardWorkflowProgress(projectId);

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

    // Check if task belongs to the root card
    if (task.root_card_id !== parseInt(rootCardId)) {
      return res.status(403).json({ message: 'Unauthorized: Root Card ID does not match' });
    }

    const result = await RootCardInventoryTask.updateTaskStatus(taskId, status, userId);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Failed to update task' });
    }

    const updatedTask = await RootCardInventoryTask.getTaskById(taskId);
    const progress = await RootCardInventoryTask.getRootCardWorkflowProgress(projectId);

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

    const [rootCardRows] = await pool.execute(
      'SELECT project_id FROM root_cards WHERE id = ? LIMIT 1',
      [rootCardId]
    );
    const projectId = rootCardRows.length ? rootCardRows[0].project_id : null;

    const progress = await RootCardInventoryTask.getRootCardWorkflowProgress(projectId);

    res.json(progress);
  } catch (error) {
    console.error('Get workflow progress error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getMRWorkflowProgress = async (req, res) => {
  try {
    const { mrId } = req.params;

    if (!mrId) {
      return res.status(400).json({ message: 'Material Request ID is required' });
    }

    const progress = await RootCardInventoryTask.getMRWorkflowProgress(mrId);

    res.json(progress);
  } catch (error) {
    console.error('Get MR workflow progress error:', error);
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

    const [rootCardRows] = await pool.execute(
      'SELECT project_id FROM root_cards WHERE id = ? LIMIT 1',
      [rootCardId]
    );
    const projectId = rootCardRows.length ? rootCardRows[0].project_id : null;

    if (task.root_card_id !== projectId) {
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

exports.initializeMRWorkflow = async (req, res) => {
  try {
    const { mrId } = req.params;
    const userId = req.user?.id;

    if (!mrId) {
      return res.status(400).json({ message: 'Material Request ID is required' });
    }

    const [mrRows] = await pool.execute(
      'SELECT id, sales_order_id FROM material_requests WHERE id = ? LIMIT 1',
      [mrId]
    );

    if (!mrRows.length) {
      return res.status(404).json({ message: 'Material Request not found' });
    }

    const mr = mrRows[0];
    const rootCardId = mr.sales_order_id;
    
    // Resolve project and production root card IDs
    let projectId = null;
    let productionRootCardId = null;

    if (rootCardId) {
      const [rcRows] = await pool.execute(
        'SELECT id, project_id FROM root_cards WHERE id = ? OR sales_order_id = ? LIMIT 1',
        [rootCardId, rootCardId]
      );
      if (rcRows.length > 0) {
        projectId = rcRows[0].project_id;
        productionRootCardId = rcRows[0].id;
      }
    }

    const result = await RootCardInventoryTask.initializeRootCardTasks(projectId, productionRootCardId, null, mrId);

    // Sync workflow with actual PO/GRN states immediately after initialization
    await RootCardInventoryTask.syncMRWorkflow(mrId);

    res.json({
      message: 'Workflow initialized successfully',
      tasksCreated: result.tasksCreated,
      tasks: result.tasks
    });
  } catch (error) {
    console.error('Initialize MR workflow error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
