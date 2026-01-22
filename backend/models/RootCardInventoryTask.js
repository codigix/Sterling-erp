const pool = require('../config/database');

class RootCardInventoryTask {
  static WORKFLOW_STEPS = [
    { step: 1, name: 'Create RFQ' },
    { step: 2, name: 'Send RFQ to Vendor' },
    { step: 3, name: 'Receive & Record Quotes' },
    { step: 4, name: 'Create PO' },
    { step: 5, name: 'Approve PO' },
    { step: 6, name: 'GRN Processing & QC' },
    { step: 7, name: 'Add to Stock' }
  ];

  static async getRootCardInventoryTasks(rootCardId, withDetails = false) {
    const [tasks] = await pool.execute(
      `SELECT pit.*, u.username as completed_by_name
       FROM root_card_inventory_tasks pit
       LEFT JOIN users u ON u.id = pit.completed_by
       WHERE pit.root_card_id = ?
       ORDER BY pit.step_number ASC`,
      [rootCardId]
    );
    
    return withDetails ? tasks.map(task => ({
      ...task,
      stepName: RootCardInventoryTask.WORKFLOW_STEPS.find(s => s.step === task.step_number)?.name
    })) : tasks;
  }

  static async getTaskByRootCardAndStep(rootCardId, stepNumber) {
    const [tasks] = await pool.execute(
      `SELECT pit.*, u.username as completed_by_name
       FROM root_card_inventory_tasks pit
       LEFT JOIN users u ON u.id = pit.completed_by
       WHERE pit.root_card_id = ? AND pit.step_number = ?
       LIMIT 1`,
      [rootCardId, stepNumber]
    );
    
    return tasks.length > 0 ? tasks[0] : null;
  }

  static async getTaskById(taskId) {
    const [tasks] = await pool.execute(
      `SELECT pit.*, u.username as completed_by_name
       FROM root_card_inventory_tasks pit
       LEFT JOIN users u ON u.id = pit.completed_by
       WHERE pit.id = ?
       LIMIT 1`,
      [taskId]
    );
    
    return tasks.length > 0 ? tasks[0] : null;
  }

  static async initializeRootCardTasks(rootCardId, productionRootCardId = null, externalConnection = null) {
    console.log(`[RootCardInventoryTask] Initializing tasks for rootCard ${rootCardId}, productionRootCard ${productionRootCardId}`);
    const conn = externalConnection || (await pool.getConnection());
    const createdTasks = [];
    const shouldRelease = !externalConnection;
    
    try {
      for (const step of RootCardInventoryTask.WORKFLOW_STEPS) {
        const [existingTasks] = await conn.execute(
          `SELECT id FROM root_card_inventory_tasks 
           WHERE root_card_id = ? AND step_number = ? LIMIT 1`,
          [rootCardId, step.step]
        );
        
        if (existingTasks.length === 0) {
          const [result] = await conn.execute(
            `INSERT INTO root_card_inventory_tasks 
             (root_card_id, production_root_card_id, step_number, step_name, status)
             VALUES (?, ?, ?, ?, 'pending')`,
            [rootCardId, productionRootCardId, step.step, step.name]
          );
          
          console.log(`[RootCardInventoryTask] Created task: step ${step.step} (${step.name}), taskId=${result.insertId}`);
          
          createdTasks.push({
            id: result.insertId,
            rootCardId,
            stepNumber: step.step,
            stepName: step.name,
            status: 'pending'
          });
        }
      }
      
      console.log(`[RootCardInventoryTask] Initialization complete: ${createdTasks.length} tasks created`);
      return {
        success: true,
        tasksCreated: createdTasks.length,
        tasks: createdTasks
      };
    } catch (error) {
      console.error(`[RootCardInventoryTask] Error initializing tasks:`, error);
      throw error;
    } finally {
      if (shouldRelease) {
        await conn.release();
      }
    }
  }

  static async updateTaskStatus(taskId, status, completedBy = null) {
    const completedAt = status === 'completed' ? new Date() : null;
    
    const [result] = await pool.execute(
      `UPDATE root_card_inventory_tasks 
       SET status = ?, completed_by = ?, completed_at = ?
       WHERE id = ?`,
      [status, completedBy, completedAt, taskId]
    );
    
    return result;
  }

  static async updateTaskWithReference(taskId, referenceId, referenceType, status = 'in_progress') {
    const [result] = await pool.execute(
      `UPDATE root_card_inventory_tasks 
       SET reference_id = ?, reference_type = ?, status = ?
       WHERE id = ?`,
      [referenceId, referenceType, status, taskId]
    );
    
    return result;
  }

  static async getRootCardWorkflowProgress(rootCardId) {
    const tasks = await RootCardInventoryTask.getRootCardInventoryTasks(rootCardId);
    
    const progress = {
      rootCardId,
      totalSteps: RootCardInventoryTask.WORKFLOW_STEPS.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      completionPercentage: Math.round((tasks.filter(t => t.status === 'completed').length / RootCardInventoryTask.WORKFLOW_STEPS.length) * 100),
      steps: tasks.map(task => ({
        id: task.id,
        stepNumber: task.step_number,
        stepName: task.step_name,
        status: task.status,
        referenceId: task.reference_id,
        referenceType: task.reference_type,
        completedBy: task.completed_by_name,
        completedAt: task.completed_at
      }))
    };
    
    return progress;
  }

  static async completeTask(taskId, completedBy) {
    const [result] = await pool.execute(
      `UPDATE root_card_inventory_tasks 
       SET status = 'completed', completed_by = ?, completed_at = NOW()
       WHERE id = ?`,
      [completedBy, taskId]
    );
    
    return result;
  }

  static async setTaskInProgress(taskId, completedBy = null) {
    const [result] = await pool.execute(
      `UPDATE root_card_inventory_tasks 
       SET status = 'in_progress', completed_by = ?
       WHERE id = ?`,
      [completedBy, taskId]
    );
    
    return result;
  }
}

module.exports = RootCardInventoryTask;
