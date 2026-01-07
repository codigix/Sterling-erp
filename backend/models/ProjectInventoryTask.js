const pool = require('../config/database');

class ProjectInventoryTask {
  static WORKFLOW_STEPS = [
    { step: 1, name: 'Create RFQ' },
    { step: 2, name: 'Send RFQ to Vendor' },
    { step: 3, name: 'Receive & Record Quotes' },
    { step: 4, name: 'Create PO' },
    { step: 5, name: 'Approve PO' },
    { step: 6, name: 'GRN Processing & QC' },
    { step: 7, name: 'Add to Stock' }
  ];

  static async getProjectInventoryTasks(projectId, withDetails = false) {
    const [tasks] = await pool.execute(
      `SELECT pit.*, u.username as completed_by_name
       FROM project_inventory_tasks pit
       LEFT JOIN users u ON u.id = pit.completed_by
       WHERE pit.project_id = ?
       ORDER BY pit.step_number ASC`,
      [projectId]
    );
    
    return withDetails ? tasks.map(task => ({
      ...task,
      stepName: ProjectInventoryTask.WORKFLOW_STEPS.find(s => s.step === task.step_number)?.name
    })) : tasks;
  }

  static async getTaskByProjectAndStep(projectId, stepNumber) {
    const [tasks] = await pool.execute(
      `SELECT pit.*, u.username as completed_by_name
       FROM project_inventory_tasks pit
       LEFT JOIN users u ON u.id = pit.completed_by
       WHERE pit.project_id = ? AND pit.step_number = ?
       LIMIT 1`,
      [projectId, stepNumber]
    );
    
    return tasks.length > 0 ? tasks[0] : null;
  }

  static async getTaskById(taskId) {
    const [tasks] = await pool.execute(
      `SELECT pit.*, u.username as completed_by_name
       FROM project_inventory_tasks pit
       LEFT JOIN users u ON u.id = pit.completed_by
       WHERE pit.id = ?
       LIMIT 1`,
      [taskId]
    );
    
    return tasks.length > 0 ? tasks[0] : null;
  }

  static async initializeProjectTasks(projectId, rootCardId = null, externalConnection = null) {
    console.log(`[ProjectInventoryTask] Initializing tasks for project ${projectId}, rootCard ${rootCardId}`);
    const conn = externalConnection || (await pool.getConnection());
    const createdTasks = [];
    const shouldRelease = !externalConnection;
    
    try {
      for (const step of ProjectInventoryTask.WORKFLOW_STEPS) {
        const [existingTasks] = await conn.execute(
          `SELECT id FROM project_inventory_tasks 
           WHERE project_id = ? AND step_number = ? LIMIT 1`,
          [projectId, step.step]
        );
        
        if (existingTasks.length === 0) {
          const [result] = await conn.execute(
            `INSERT INTO project_inventory_tasks 
             (project_id, root_card_id, step_number, step_name, status)
             VALUES (?, ?, ?, ?, 'pending')`,
            [projectId, rootCardId, step.step, step.name]
          );
          
          console.log(`[ProjectInventoryTask] Created task: step ${step.step} (${step.name}), taskId=${result.insertId}`);
          
          createdTasks.push({
            id: result.insertId,
            projectId,
            stepNumber: step.step,
            stepName: step.name,
            status: 'pending'
          });
        }
      }
      
      console.log(`[ProjectInventoryTask] Initialization complete: ${createdTasks.length} tasks created`);
      return {
        success: true,
        tasksCreated: createdTasks.length,
        tasks: createdTasks
      };
    } catch (error) {
      console.error(`[ProjectInventoryTask] Error initializing tasks:`, error);
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
      `UPDATE project_inventory_tasks 
       SET status = ?, completed_by = ?, completed_at = ?
       WHERE id = ?`,
      [status, completedBy, completedAt, taskId]
    );
    
    return result;
  }

  static async updateTaskWithReference(taskId, referenceId, referenceType, status = 'in_progress') {
    const [result] = await pool.execute(
      `UPDATE project_inventory_tasks 
       SET reference_id = ?, reference_type = ?, status = ?
       WHERE id = ?`,
      [referenceId, referenceType, status, taskId]
    );
    
    return result;
  }

  static async getProjectWorkflowProgress(projectId) {
    const tasks = await ProjectInventoryTask.getProjectInventoryTasks(projectId);
    
    const progress = {
      projectId,
      totalSteps: ProjectInventoryTask.WORKFLOW_STEPS.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      completionPercentage: Math.round((tasks.filter(t => t.status === 'completed').length / ProjectInventoryTask.WORKFLOW_STEPS.length) * 100),
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
      `UPDATE project_inventory_tasks 
       SET status = 'completed', completed_by = ?, completed_at = NOW()
       WHERE id = ?`,
      [completedBy, taskId]
    );
    
    return result;
  }

  static async setTaskInProgress(taskId, completedBy = null) {
    const [result] = await pool.execute(
      `UPDATE project_inventory_tasks 
       SET status = 'in_progress', completed_by = ?
       WHERE id = ?`,
      [completedBy, taskId]
    );
    
    return result;
  }
}

module.exports = ProjectInventoryTask;
