const pool = require('../config/database');

class EmployeeTask {
  static async findAll(filters = {}) {
    let query = `SELECT wt.*, CONCAT(e.first_name, ' ', e.last_name) as username, ms.stage_name, rc.title as root_card_title
                 FROM worker_tasks wt
                 LEFT JOIN employees e ON wt.worker_id = e.id
                 LEFT JOIN manufacturing_stages ms ON wt.stage_id = ms.id
                 LEFT JOIN root_cards rc ON ms.root_card_id = rc.id
                 WHERE 1=1`;
    const params = [];

    if (filters.workerId) {
      query += ' AND wt.worker_id = ?';
      params.push(filters.workerId);
    }

    if (filters.status) {
      query += ' AND wt.status = ?';
      params.push(filters.status);
    }

    if (filters.stageId) {
      query += ' AND wt.stage_id = ?';
      params.push(filters.stageId);
    }

    if (filters.date) {
      query += ' AND DATE(wt.created_at) = ?';
      params.push(filters.date);
    }

    query += ' ORDER BY wt.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows || [];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT wt.*, CONCAT(e.first_name, ' ', e.last_name) as username, ms.stage_name, rc.title as root_card_title
       FROM worker_tasks wt
       LEFT JOIN employees e ON wt.worker_id = e.id
       LEFT JOIN manufacturing_stages ms ON wt.stage_id = ms.id
       LEFT JOIN root_cards rc ON ms.root_card_id = rc.id
       WHERE wt.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByWorkerId(workerId) {
    const [rows] = await pool.execute(
      `SELECT wt.*, CONCAT(e.first_name, ' ', e.last_name) as username, ms.stage_name, rc.title as root_card_title
       FROM worker_tasks wt
       LEFT JOIN employees e ON wt.worker_id = e.id
       LEFT JOIN manufacturing_stages ms ON wt.stage_id = ms.id
       LEFT JOIN root_cards rc ON ms.root_card_id = rc.id
       WHERE wt.worker_id = ?
       ORDER BY wt.created_at DESC`,
      [workerId]
    );
    return rows || [];
  }

  static async create(stageId, workerId, task) {
    const [result] = await pool.execute(
      `INSERT INTO worker_tasks (stage_id, worker_id, task, status, logs)
       VALUES (?, ?, ?, ?, ?)`,
      [stageId, workerId, task, 'pending', JSON.stringify([])]
    );
    return result.insertId;
  }

  static async updateStatus(id, status) {
    await pool.execute(
      'UPDATE worker_tasks SET status = ? WHERE id = ?',
      [status, id]
    );
  }

  static async addLog(id, log) {
    const task = await this.findById(id);
    let logs = [];
    if (task.logs) {
      logs = typeof task.logs === 'string' ? JSON.parse(task.logs) : task.logs;
    }
    logs.push({ timestamp: new Date().toISOString(), ...log });
    
    await pool.execute(
      'UPDATE worker_tasks SET logs = ? WHERE id = ?',
      [JSON.stringify(logs), id]
    );
  }

  static async getEmployeeTasks(employeeId, dateFilter = null) {
    let query = `SELECT 
                    wt.*, 
                    ms.stage_name, 
                    ms.root_card_id,
                    rc.title as root_card_title, 
                    rc.priority,
                    rc.project_id,
                    p.name as project_name,
                    p.code as project_code,
                    so.id as sales_order_id,
                    so.po_number,
                    so.customer,
                    so.total,
                    so.order_date,
                    so.due_date,
                    e.first_name,
                    e.last_name,
                    e.email
                 FROM worker_tasks wt
                 LEFT JOIN manufacturing_stages ms ON wt.stage_id = ms.id
                 LEFT JOIN root_cards rc ON ms.root_card_id = rc.id
                 LEFT JOIN projects p ON rc.project_id = p.id
                 LEFT JOIN sales_orders so ON p.sales_order_id = so.id
                 LEFT JOIN employees e ON wt.worker_id = e.id
                 WHERE wt.worker_id = ?`;
    const params = [employeeId];

    if (dateFilter) {
      query += ' AND DATE(wt.created_at) = ?';
      params.push(dateFilter);
    }

    query += ' ORDER BY rc.priority DESC, wt.created_at DESC';
    const [rows] = await pool.execute(query, params);
    return rows || [];
  }

  static async getStatsByEmployee(employeeId) {
    const [rows] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
       FROM worker_tasks
       WHERE worker_id = ?`,
      [employeeId]
    );
    return rows[0];
  }

  static async createAssignedTask(employeeId, data) {
    const [result] = await pool.execute(
      `INSERT INTO employee_tasks (employee_id, title, description, type, production_plan_stage_id, priority, status, due_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employeeId,
        data.title,
        data.description || null,
        data.type || 'general',
        data.productionPlanStageId || null,
        data.priority || 'medium',
        'pending',
        data.dueDate || null,
        data.notes || null
      ]
    );

    const taskId = result.insertId;
    
    if (data.productionPlanStageId) {
      try {
        const [stageRows] = await pool.execute(
          'SELECT is_blocked FROM production_plan_stages WHERE id = ?',
          [data.productionPlanStageId]
        );
        
        const isStageBlocked = stageRows.length > 0 && stageRows[0].is_blocked;
        
        if (!isStageBlocked) {
          try {
            const [existingNotif] = await pool.execute(
              `SELECT id FROM alerts_notifications 
               WHERE user_id = ? AND alert_type = 'task_assigned' AND related_id = ? AND is_read = FALSE
               LIMIT 1`,
              [employeeId, taskId]
            );
            
            if (existingNotif.length > 0) {
              console.log(`[EmployeeTask] ℹ️ Notification already exists for this task assignment (${taskId})`);
            } else {
              await pool.execute(
                `INSERT INTO alerts_notifications (user_id, alert_type, message, related_table, related_id, priority)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                  employeeId,
                  'task_assigned',
                  `You have been assigned a new task: ${data.title}`,
                  'employee_tasks',
                  taskId,
                  'high'
                ]
              );
              console.log(`[EmployeeTask] ✓ Notification created for employee ${employeeId} (task assignment)`);
            }
          } catch (createError) {
            console.error(`[EmployeeTask] Error creating task_assigned notification:`, createError.message);
          }
        } else {
          console.log(`[EmployeeTask] ℹ️ Task created for employee ${employeeId} but stage is blocked, no notification sent`);
        }
      } catch (notifError) {
        console.error(`[EmployeeTask] Error checking stage or sending notification:`, notifError.message);
      }
    }

    return taskId;
  }

  static async getAssignedTasks(employeeId, filters = {}) {
    let query = `SELECT et.id, et.employee_id, et.title, et.description, et.type, et.priority, et.status, 
                        et.assigned_by, et.due_date, et.notes, et.started_at, et.completed_at, 
                        et.created_at, et.updated_at, et.production_plan_stage_id,
                        pps.stage_name, rc.title as root_card_title,
                        p.id as project_id, p.name as project_name, p.code as project_code,
                        sod.product_details
                 FROM employee_tasks et
                 LEFT JOIN production_plan_stages pps ON et.production_plan_stage_id = pps.id
                 LEFT JOIN production_plans pp ON pps.production_plan_id = pp.id
                 LEFT JOIN root_cards rc ON pp.root_card_id = rc.id
                 LEFT JOIN projects p ON rc.project_id = p.id
                 LEFT JOIN sales_order_details sod ON sod.sales_order_id = pp.sales_order_id
                 WHERE et.employee_id = ? AND (pps.id IS NULL OR pps.is_blocked = FALSE)`;
    const params = [employeeId];

    if (filters.status && filters.status !== 'all') {
      query += ' AND et.status = ?';
      params.push(filters.status);
    }

    if (filters.type && filters.type !== 'all') {
      query += ' AND et.type = ?';
      params.push(filters.type);
    }

    if (filters.priority && filters.priority !== 'all') {
      query += ' AND et.priority = ?';
      params.push(filters.priority);
    }

    query += ' ORDER BY et.priority DESC, et.due_date ASC, et.created_at DESC';
    const [rows] = await pool.execute(query, params);
    
    return (rows || []).map(row => {
      let product_name = null;
      if (row.product_details) {
        try {
          const details = typeof row.product_details === 'string' ? JSON.parse(row.product_details) : row.product_details;
          product_name = details.itemName || null;
        } catch (e) {
          console.warn('Error parsing product_details for task:', row.id);
        }
      }
      return { ...row, product_name };
    });
  }

  static async getAssignedTaskById(taskId) {
    const [rows] = await pool.execute(
      `SELECT et.id, et.employee_id, et.title, et.description, et.type, et.priority, et.status, 
              et.assigned_by, et.due_date, et.notes, et.started_at, et.completed_at, 
              et.created_at, et.updated_at, et.production_plan_stage_id,
              pps.stage_name, rc.title as root_card_title,
              p.id as project_id, p.name as project_name, p.code as project_code,
              sod.product_details
       FROM employee_tasks et
       LEFT JOIN production_plan_stages pps ON et.production_plan_stage_id = pps.id
       LEFT JOIN production_plans pp ON pps.production_plan_id = pp.id
       LEFT JOIN root_cards rc ON pp.root_card_id = rc.id
       LEFT JOIN projects p ON rc.project_id = p.id
       LEFT JOIN sales_order_details sod ON sod.sales_order_id = pp.sales_order_id
       WHERE et.id = ?`,
      [taskId]
    );
    
    if (rows[0]) {
      let product_name = null;
      if (rows[0].product_details) {
        try {
          const details = typeof rows[0].product_details === 'string' ? JSON.parse(rows[0].product_details) : rows[0].product_details;
          product_name = details.itemName || null;
        } catch (e) {
          console.warn('Error parsing product_details for task:', taskId);
        }
      }
      return { ...rows[0], product_name };
    }
    return null;
  }

  static async updateAssignedTaskStatus(taskId, status, notes = null) {
    const [taskRows] = await pool.execute(
      `SELECT id, production_plan_stage_id FROM employee_tasks WHERE id = ?`,
      [taskId]
    );
    
    if (taskRows.length === 0) {
      throw new Error('Task not found');
    }

    const task = taskRows[0];
    
    const updateFields = ['status = ?'];
    const values = [status];

    if (notes) {
      updateFields.push('notes = ?');
      values.push(notes);
    }

    if (status === 'in_progress' && notes !== false) {
      updateFields.push('started_at = CASE WHEN started_at IS NULL THEN NOW() ELSE started_at END');
    }

    if (status === 'completed') {
      updateFields.push('completed_at = NOW()');
    }

    values.push(taskId);

    await pool.execute(
      `UPDATE employee_tasks SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    if (task.production_plan_stage_id) {
      await pool.execute(
        `UPDATE production_plan_stages SET status = ? WHERE id = ?`,
        [status, task.production_plan_stage_id]
      );
      console.log(`[EmployeeTask] ✓ Task ${taskId} status changed to '${status}' - Stage ${task.production_plan_stage_id} updated`);
      
      if (status === 'completed') {
        const [nextStages] = await pool.execute(
          `SELECT pps.id, pps.stage_name, pps.stage_type, pps.assigned_employee_id, pps.production_plan_id,
                  sod.product_details
           FROM production_plan_stages pps
           JOIN production_plans pp ON pps.production_plan_id = pp.id
           LEFT JOIN sales_order_details sod ON sod.sales_order_id = pp.sales_order_id
           WHERE pps.blocked_by_stage_id = ? LIMIT 1`,
          [task.production_plan_stage_id]
        );
        
        if (nextStages.length > 0) {
          const nextStageId = nextStages[0].id;
          const nextStageName = nextStages[0].stage_name;
          const nextStageType = nextStages[0].stage_type;
          const nextStageEmployeeId = nextStages[0].assigned_employee_id;
          const planId = nextStages[0].production_plan_id;
          
          let productName = null;
          if (nextStages[0].product_details) {
            try {
              const details = typeof nextStages[0].product_details === 'string' 
                ? JSON.parse(nextStages[0].product_details) 
                : nextStages[0].product_details;
              productName = details.itemName || null;
            } catch (e) {
              console.warn('Error parsing product_details for next stage');
            }
          }
          
          console.log(`[EmployeeTask] Stage completion detected. Next stage: ${nextStageId}, Type: ${nextStageType}, Employee: ${nextStageEmployeeId}`);
          
          await pool.execute(
            `UPDATE production_plan_stages SET is_blocked = FALSE WHERE id = ?`,
            [nextStageId]
          );
          console.log(`[EmployeeTask] ✓ Stage ${nextStageId} unlocked`);
          
          // Create task for the unlocked stage
          if (nextStageType === 'outsource') {
            // Outsource stage - notify Production Department
            try {
              const AlertsNotification = require('./AlertsNotification');
              
              // Get all employees in Production Department
              const [deptMembers] = await pool.execute(`
                SELECT DISTINCT e.id 
                FROM employees e
                WHERE e.department = 'Production' OR e.department_name = 'Production'
                LIMIT 20
              `);
              
              const notifMessage = productName 
                ? `Outsource task "${nextStageName}" for ${productName} is now ready for production.`
                : `Outsource task "${nextStageName}" is now ready for production. Previous stage completed!`;

              // Send notification to each department member
              for (const member of deptMembers) {
                try {
                  await AlertsNotification.create({
                    userId: member.id,
                    alertType: 'outsource_task_created',
                    message: notifMessage,
                    relatedTable: 'production_plan_stages',
                    relatedId: nextStageId,
                    priority: 'high'
                  });
                  console.log(`[EmployeeTask] ✓ Outsource notification sent to employee ${member.id}`);
                } catch (notifErr) {
                  console.warn(`[EmployeeTask] Warning - could not send notification to employee ${member.id}:`, notifErr.message);
                }
              }
            } catch (outsourceError) {
              console.error(`[EmployeeTask] Error handling outsource stage unlocking:`, outsourceError.message);
            }
          } else if (nextStageEmployeeId) {
            // In-house stage - create task for employee
            try {
              const taskTitle = productName 
                ? `Task for ${productName}: ${nextStageName}`
                : `Production Stage: ${nextStageName}`;

              const newTaskId = await this.createAssignedTask(nextStageEmployeeId, {
                title: taskTitle,
                description: `Assigned to production plan stage`,
                type: 'production_stage',
                priority: 'medium',
                dueDate: null,
                notes: `Production Plan ID: ${planId}`,
                productionPlanStageId: nextStageId
              });
              console.log(`[EmployeeTask] ✓ New task ${newTaskId} created for employee ${nextStageEmployeeId} for stage ${nextStageName}`);
            } catch (createTaskError) {
              console.error(`[EmployeeTask] Error creating task for next stage:`, createTaskError.message);
            }
          }
        } else {
          console.log(`[EmployeeTask] No dependent stages found for stage ${task.production_plan_stage_id}`);
        }
      }
    }
  }

  static async getAssignedTasksStats(employeeId) {
    const [rows] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'on_hold' THEN 1 ELSE 0 END) as on_hold,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
       FROM employee_tasks
       WHERE employee_id = ?`,
      [employeeId]
    );
    return rows[0];
  }

  static async deleteAssignedTask(taskId) {
    await pool.execute('DELETE FROM employee_tasks WHERE id = ?', [taskId]);
  }

  static async deleteWorkerTask(taskId) {
    await pool.execute('DELETE FROM worker_tasks WHERE id = ?', [taskId]);
  }
}

module.exports = EmployeeTask;
