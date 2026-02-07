const pool = require('../config/database');
const RootCardStep = require('./RootCardStep');

class EmployeeTask {
  static async findAll(filters = {}) {
    let query = `SELECT wt.*, COALESCE(CONCAT(e.first_name, ' ', e.last_name), u.username) as username, ms.stage_name, rc.title as root_card_title
                 FROM worker_tasks wt
                 LEFT JOIN users u ON wt.worker_id = u.id
                 LEFT JOIN employees e ON (u.email = e.email AND u.email IS NOT NULL)
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
      `SELECT wt.*, COALESCE(CONCAT(e.first_name, ' ', e.last_name), u.username) as username, ms.stage_name, rc.title as root_card_title
       FROM worker_tasks wt
       LEFT JOIN users u ON wt.worker_id = u.id
       LEFT JOIN employees e ON (u.email = e.email AND u.email IS NOT NULL)
       LEFT JOIN manufacturing_stages ms ON wt.stage_id = ms.id
       LEFT JOIN root_cards rc ON ms.root_card_id = rc.id
       WHERE wt.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByWorkerId(workerId) {
    const [rows] = await pool.execute(
      `SELECT wt.*, COALESCE(CONCAT(e.first_name, ' ', e.last_name), u.username) as username, ms.stage_name, rc.title as root_card_title
       FROM worker_tasks wt
       LEFT JOIN users u ON wt.worker_id = u.id
       LEFT JOIN employees e ON (u.email = e.email AND u.email IS NOT NULL)
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
                 LEFT JOIN users u ON wt.worker_id = u.id
                 LEFT JOIN employees e ON (u.email = e.email AND u.email IS NOT NULL)
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

  static async createAssignedTask(employeeId, data, connection = null) {
    const db = connection || pool;
    const [result] = await db.execute(
      `INSERT INTO employee_tasks (employee_id, title, description, type, production_plan_stage_id, work_order_operation_id, sales_order_id, priority, status, due_date, notes, assigned_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employeeId,
        data.title,
        data.description || null,
        data.type || 'general',
        data.productionPlanStageId || null,
        data.workOrderOperationId || null,
        data.salesOrderId || null,
        data.priority || 'medium',
        'pending',
        data.dueDate || null,
        data.notes || null,
        data.assignedBy || null
      ]
    );

    const taskId = result.insertId;
    
    if (data.productionPlanStageId) {
      try {
        const [stageRows] = await db.execute(
          'SELECT is_blocked FROM production_plan_stages WHERE id = ?',
          [data.productionPlanStageId]
        );
        
        const isStageBlocked = stageRows.length > 0 && stageRows[0].is_blocked;
        
        if (!isStageBlocked) {
          try {
            const [existingNotif] = await db.execute(
              `SELECT id FROM alerts_notifications 
               WHERE user_id = ? AND alert_type = 'task_assigned' AND related_id = ? AND is_read = FALSE
               LIMIT 1`,
              [employeeId, taskId]
            );
            
            if (existingNotif.length > 0) {
              console.log(`[EmployeeTask] ℹ️ Notification already exists for this task assignment (${taskId})`);
            } else {
              await db.execute(
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
                        et.created_at, et.updated_at, et.production_plan_stage_id, et.work_order_operation_id, et.sales_order_id,
                        pps.stage_name, woo.operation_name, wo.work_order_no, wo.item_name,
                        COALESCE(rc.title, so.project_name, so.po_number, wo.item_name) as root_card_title,
                        COALESCE(p.id, p2.id, p3.id) as project_id, 
                        COALESCE(p.name, p2.name, p3.name) as project_name, 
                        COALESCE(p.code, p2.code, p3.code) as project_code,
                        COALESCE(sod.product_details, so.items) as product_details,
                        COALESCE(so.customer, so2.customer) as customer_name,
                        COALESCE(so.po_number, so2.po_number) as po_number
                 FROM employee_tasks et
                 LEFT JOIN production_plan_stages pps ON et.production_plan_stage_id = pps.id
                 LEFT JOIN production_plans pp ON pps.production_plan_id = pp.id
                 LEFT JOIN root_cards rc ON pp.root_card_id = rc.id
                 LEFT JOIN projects p ON rc.project_id = p.id
                 LEFT JOIN sales_orders so ON et.sales_order_id = so.id
                 LEFT JOIN projects p2 ON so.id = p2.sales_order_id
                 LEFT JOIN sales_order_details sod ON sod.sales_order_id = pp.sales_order_id
                 LEFT JOIN work_order_operations woo ON et.work_order_operation_id = woo.id
                 LEFT JOIN work_orders wo ON woo.work_order_id = wo.id
                 LEFT JOIN sales_orders so2 ON wo.sales_order_id = so2.id
                 LEFT JOIN projects p3 ON wo.project_id = p3.id
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
      let product_name = row.project_name || row.item_name || null;
      if (row.product_details) {
        try {
          const details = typeof row.product_details === 'string' ? JSON.parse(row.product_details) : row.product_details;
          if (Array.isArray(details) && details.length > 0) {
            product_name = details[0].name || details[0].itemName || product_name;
          } else {
            product_name = details.itemName || details.name || product_name;
          }
        } catch (e) {
          console.warn('Error parsing product_details for task:', row.id);
        }
      }

      return { 
        ...row, 
        product_name,
        salesOrder: {
          customer: row.customer_name || 'N/A',
          poNumber: row.po_number || 'N/A'
        },
        rootCard: {
          title: row.root_card_title || 'N/A'
        }
      };
    });
  }

  static async getAssignedTaskById(taskId) {
    const [rows] = await pool.execute(
      `SELECT et.id, et.employee_id, et.title, et.description, et.type, et.priority, et.status, 
              et.assigned_by, et.due_date, et.notes, et.started_at, et.completed_at, 
              et.created_at, et.updated_at, et.production_plan_stage_id, et.work_order_operation_id, et.sales_order_id,
              pps.stage_name, woo.operation_name, wo.work_order_no, wo.item_name,
              COALESCE(rc.title, so.project_name, so.po_number, wo.item_name) as root_card_title,
              COALESCE(p.id, p2.id, p3.id) as project_id, 
              COALESCE(p.name, p2.name, p3.name) as project_name, 
              COALESCE(p.code, p2.code, p3.code) as project_code,
              COALESCE(sod.product_details, so.items) as product_details,
              COALESCE(so.customer, so2.customer) as customer_name,
              COALESCE(so.po_number, so2.po_number) as po_number
       FROM employee_tasks et
       LEFT JOIN production_plan_stages pps ON et.production_plan_stage_id = pps.id
       LEFT JOIN production_plans pp ON pps.production_plan_id = pp.id
       LEFT JOIN root_cards rc ON pp.root_card_id = rc.id
       LEFT JOIN projects p ON rc.project_id = p.id
       LEFT JOIN sales_orders so ON et.sales_order_id = so.id
       LEFT JOIN projects p2 ON so.id = p2.sales_order_id
       LEFT JOIN sales_order_details sod ON sod.sales_order_id = pp.sales_order_id
       LEFT JOIN work_order_operations woo ON et.work_order_operation_id = woo.id
       LEFT JOIN work_orders wo ON woo.work_order_id = wo.id
       LEFT JOIN sales_orders so2 ON wo.sales_order_id = so2.id
       LEFT JOIN projects p3 ON wo.project_id = p3.id
       WHERE et.id = ?`,
      [taskId]
    );
    
    if (rows[0]) {
      let product_name = rows[0].project_name || rows[0].item_name || null;
      if (rows[0].product_details) {
        try {
          const details = typeof rows[0].product_details === 'string' ? JSON.parse(rows[0].product_details) : rows[0].product_details;
          if (Array.isArray(details) && details.length > 0) {
            product_name = details[0].name || details[0].itemName || product_name;
          } else {
            product_name = details.itemName || details.name || product_name;
          }
        } catch (e) {
          console.warn('Error parsing product_details for task:', taskId);
        }
      }
      return { 
        ...rows[0], 
        product_name,
        salesOrder: {
          customer: rows[0].customer_name || 'N/A',
          poNumber: rows[0].po_number || 'N/A'
        },
        rootCard: {
          title: rows[0].root_card_title || 'N/A'
        }
      };
    }
    return null;
  }

  static async updateAssignedTaskStatus(taskId, status, notes = null) {
    const [taskRows] = await pool.execute(
      `SELECT * FROM employee_tasks WHERE id = ?`,
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

    // Synchronize with department_tasks if it's a workflow task
    // Workflow tasks are usually linked via title and related_id (root_card_id) OR sales_order_id
    try {
      const syncFields = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
      const syncValues = [status];
      
      let syncQuery = `UPDATE department_tasks SET ${syncFields.join(', ')} WHERE task_title = ? AND `;
      let syncParams = [...syncValues, task.title];

      const conditions = [];
      if (task.related_id && task.related_type === 'root_card') {
        conditions.push('root_card_id = ?');
        syncParams.push(task.related_id);
      }
      
      if (task.sales_order_id) {
        conditions.push('sales_order_id = ?');
        syncParams.push(task.sales_order_id);
      }

      if (conditions.length > 0) {
        syncQuery += `(${conditions.join(' OR ')})`;
        await pool.execute(syncQuery, syncParams);
        console.log(`[EmployeeTask] Synchronized status '${status}' with department_tasks for task: ${task.title}`);
      }
    } catch (syncError) {
      console.error('[EmployeeTask] Sync with department_tasks failed:', syncError.message);
      // Don't throw error, we want the main update to succeed
    }

    // Synchronize with RootCardStep workflow if applicable
    if (task.sales_order_id && task.type) {
      const stepDefinitions = RootCardStep.STEP_DEFINITIONS;
      const step = stepDefinitions.find(s => s.key === task.type);
      
      if (step) {
        console.log(`[EmployeeTask] Synchronizing workflow step ${step.id} (${step.key}) for SO ${task.sales_order_id}`);
        await RootCardStep.updateStatus(task.sales_order_id, step.id, status);
        
        if (status === 'in_progress') {
          await RootCardStep.startStep(task.sales_order_id, step.id);
        } else if (status === 'completed') {
          await RootCardStep.completeStep(task.sales_order_id, step.id);
        }
      }
    }

    if (task.work_order_operation_id) {
      await pool.execute(
        `UPDATE work_order_operations SET status = ? WHERE id = ?`,
        [status, task.work_order_operation_id]
      );
      console.log(`[EmployeeTask] ✓ Task ${taskId} status changed to '${status}' - Work Order Operation ${task.work_order_operation_id} updated`);
    }

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

  static async findByRelatedId(salesOrderId, type) {
    const [rows] = await pool.execute(
      'SELECT * FROM employee_tasks WHERE sales_order_id = ? AND type = ?',
      [salesOrderId, type]
    );
    return rows;
  }
}

module.exports = EmployeeTask;
