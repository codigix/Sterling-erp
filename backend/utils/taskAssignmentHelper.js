const pool = require('../config/database');

const STATUS_TO_TRIGGER_ASSIGNMENT = ['assigned', 'ready_to_start', 'in_progress', 'approved'];

const DEPARTMENT_ROLES = ['design_engineer', 'inventory', 'production'];

const assignTasksFromRootCard = async (salesOrderId, connection = null) => {
  const conn = connection || await pool.getConnection();
  const createdTasks = [];
  const createdDepartmentTasks = [];
  
  try {
    const [projects] = await conn.execute(
      'SELECT id FROM projects WHERE sales_order_id = ?',
      [salesOrderId]
    );

    if (!projects.length) {
      console.log(`[TaskAssignment] No project found for sales order ${salesOrderId}`);
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

    const rootCardId = rootCards[0].id;
    const rootCardTitle = rootCards[0].title;
    const rootCardPriority = rootCards[0].priority || 'medium';

    const [stages] = await conn.execute(
      `SELECT id, stage_name, assigned_worker FROM manufacturing_stages 
       WHERE root_card_id = ? AND assigned_worker IS NOT NULL`,
      [rootCardId]
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

        console.log(`[TaskAssignment] Task created - Stage: ${stage.stage_name}, Worker: ${stage.assigned_worker}, Sales Order: ${salesOrderId}`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`[TaskAssignment] Task already exists for stage ${stage.id}`);
        } else {
          console.error(`[TaskAssignment] Failed to create task for stage ${stage.id}:`, err.message);
        }
      }
    }

    const departmentTaskResult = await assignDepartmentTasks(rootCardId, rootCardTitle, rootCardPriority, conn);
    createdDepartmentTasks.push(...(departmentTaskResult.tasks || []));

    return {
      success: true,
      tasksCreated: createdTasks.length,
      tasks: createdTasks,
      departmentTasksCreated: departmentTaskResult.tasksCreated,
      departmentTasks: createdDepartmentTasks,
      salesOrderId,
      projectId,
      rootCardId,
      rootCardTitle
    };
  } catch (error) {
    console.error('[TaskAssignment] Error assigning tasks from root card:', error);
    return {
      success: false,
      tasksCreated: 0,
      departmentTasksCreated: 0,
      error: error.message,
      salesOrderId
    };
  } finally {
    if (!connection) {
      conn.release();
    }
  }
};

const assignDepartmentTasks = async (rootCardId, rootCardTitle, priority = 'medium', connection = null) => {
  const conn = connection || await pool.getConnection();
  const createdDepartmentTasks = [];

  try {
    for (const roleId of DEPARTMENT_ROLES) {
      try {
        const [roleResult] = await conn.execute(
          'SELECT id FROM roles WHERE name = ?',
          [roleId]
        );

        if (!roleResult.length) {
          console.log(`[DepartmentTask] Role ${roleId} not found`);
          continue;
        }

        const roleId_value = roleResult[0].id;

        await conn.execute(
          `INSERT IGNORE INTO root_card_departments (root_card_id, role_id, assignment_type)
           VALUES (?, ?, 'auto')`,
          [rootCardId, roleId_value]
        );

        const taskTitle = `[${rootCardTitle}] - ${roleId.replace('_', ' ')} Review & Approval`;
        const taskDescription = `Review and prepare the root card "${rootCardTitle}" for ${roleId.replace('_', ' ')} department processing`;

        const [result] = await conn.execute(
          `INSERT INTO department_tasks (root_card_id, role_id, task_title, task_description, priority)
           VALUES (?, ?, ?, ?, ?)`,
          [rootCardId, roleId_value, taskTitle, taskDescription, priority]
        );

        createdDepartmentTasks.push({
          taskId: result.insertId,
          rootCardId,
          roleId: roleId_value,
          taskTitle,
          roleName: roleId
        });

        console.log(`[DepartmentTask] Task created for ${roleId} - Root Card: ${rootCardTitle}`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`[DepartmentTask] Task already exists for ${roleId} and root card ${rootCardId}`);
        } else {
          console.error(`[DepartmentTask] Failed to create task for ${roleId}:`, err.message);
        }
      }
    }

    return {
      success: true,
      tasksCreated: createdDepartmentTasks.length,
      tasks: createdDepartmentTasks
    };
  } catch (error) {
    console.error('[DepartmentTask] Error assigning department tasks:', error);
    return {
      success: false,
      tasksCreated: 0,
      error: error.message
    };
  } finally {
    if (!connection) {
      conn.release();
    }
  }
};

const getTasksAssignmentStatus = async (salesOrderId, connection = null) => {
  const conn = connection || await pool.getConnection();
  
  try {
    const [projects] = await conn.execute(
      'SELECT id FROM projects WHERE sales_order_id = ?',
      [salesOrderId]
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

    const rootCardId = rootCards[0].id;

    const [tasks] = await conn.execute(
      `SELECT wt.id, wt.stage_id, wt.worker_id, wt.task, wt.status, ms.stage_name
       FROM worker_tasks wt
       INNER JOIN manufacturing_stages ms ON ms.id = wt.stage_id
       WHERE ms.root_card_id = ?
       ORDER BY wt.created_at DESC`,
      [rootCardId]
    );

    return {
      tasksFound: tasks.length,
      tasks: tasks,
      salesOrderId,
      projectId,
      rootCardId
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
  DEPARTMENT_ROLES,
  assignTasksFromRootCard,
  assignDepartmentTasks,
  getTasksAssignmentStatus
};
