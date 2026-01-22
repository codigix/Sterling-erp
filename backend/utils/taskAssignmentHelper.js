const pool = require('../config/database');

const STATUS_TO_TRIGGER_ASSIGNMENT = ['assigned', 'ready_to_start', 'in_progress', 'approved'];

const assignTasksFromRootCard = async (rootCardId, connection = null) => {
  const conn = connection || await pool.getConnection();
  const createdTasks = [];
  
  try {
    const [projects] = await conn.execute(
      'SELECT id FROM projects WHERE sales_order_id = ?',
      [rootCardId]
    );

    if (!projects.length) {
      console.log(`[TaskAssignment] No project found for root card ${rootCardId}`);
      return { success: true, tasksCreated: 0, details: 'No project found' };
    }

    const projectId = projects[0].id;

    const [rootCards] = await conn.execute(
      'SELECT id, title, priority FROM root_cards WHERE project_id = ?',
      [projectId]
    );

    if (!rootCards.length) {
      console.log(`[TaskAssignment] No root card found for project ${projectId}`);
      return { success: true, tasksCreated: 0, details: 'No root card found' };
    }

    const productionRootCardId = rootCards[0].id;
    const rootCardTitle = rootCards[0].title;
    const rootCardPriority = rootCards[0].priority || 'medium';

    const [stages] = await conn.execute(
      `SELECT id, stage_name, assigned_worker FROM manufacturing_stages 
       WHERE root_card_id = ? AND assigned_worker IS NOT NULL`,
      [productionRootCardId]
    );

    for (const stage of stages) {
      const taskDescription = `[${rootCardTitle}] ${stage.stage_name}`;
      
      try {
        const [result] = await conn.execute(
          `INSERT INTO worker_tasks (stage_id, worker_id, task, status, logs)
           VALUES (?, ?, ?, ?, ?)`,
          [stage.id, stage.assigned_worker, taskDescription, 'pending', JSON.stringify([])]
        );
        
        createdTasks.push({
          taskId: result.insertId,
          stageId: stage.id,
          stageName: stage.stage_name,
          workerId: stage.assigned_worker,
          taskDescription
        });

        console.log(`[TaskAssignment] Task created - Stage: ${stage.stage_name}, Worker: ${stage.assigned_worker}, Root Card: ${rootCardId}`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`[TaskAssignment] Task already exists for stage ${stage.id}`);
        } else {
          console.error(`[TaskAssignment] Failed to create task for stage ${stage.id}:`, err.message);
        }
      }
    }

    return {
      success: true,
      tasksCreated: createdTasks.length,
      tasks: createdTasks,
      rootCardId,
      projectId,
      productionRootCardId,
      rootCardTitle
    };
  } catch (error) {
    console.error('[TaskAssignment] Error assigning tasks from root card:', error);
    return {
      success: false,
      tasksCreated: 0,
      error: error.message,
      rootCardId
    };
  } finally {
    if (!connection) {
      conn.release();
    }
  }
};

const getTasksAssignmentStatus = async (rootCardId, connection = null) => {
  const conn = connection || await pool.getConnection();
  
  try {
    const [projects] = await conn.execute(
      'SELECT id FROM projects WHERE sales_order_id = ?',
      [rootCardId]
    );

    if (!projects.length) {
      return { tasksFound: 0, tasks: [] };
    }

    const projectId = projects[0].id;

    const [rootCards] = await conn.execute(
      'SELECT id FROM root_cards WHERE project_id = ?',
      [projectId]
    );

    if (!rootCards.length) {
      return { tasksFound: 0, tasks: [] };
    }

    const productionRootCardId = rootCards[0].id;

    const [tasks] = await conn.execute(
      `SELECT wt.id, wt.stage_id, wt.worker_id, wt.task, wt.status, ms.stage_name
       FROM worker_tasks wt
       INNER JOIN manufacturing_stages ms ON ms.id = wt.stage_id
       WHERE ms.root_card_id = ?
       ORDER BY wt.created_at DESC`,
      [productionRootCardId]
    );

    return {
      tasksFound: tasks.length,
      tasks: tasks,
      rootCardId,
      projectId,
      productionRootCardId
    };
  } catch (error) {
    console.error('[TaskAssignment] Error getting assignment status:', error);
    return {
      tasksFound: 0,
      tasks: [],
      error: error.message
    };
  } finally {
    if (!connection) {
      conn.release();
    }
  }
};

module.exports = {
  STATUS_TO_TRIGGER_ASSIGNMENT,
  assignTasksFromRootCard,
  getTasksAssignmentStatus
};
