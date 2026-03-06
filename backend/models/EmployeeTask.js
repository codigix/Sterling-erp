const pool = require('../config/database');
const RootCardStep = require('./RootCardStep');

class EmployeeTask {
  static async findAll(filters = {}) {
    let query = `SELECT wt.*, COALESCE(CONCAT(e.first_name, ' ', e.last_name), u.username) as username, ms.stage_name, rc.id as root_card_id, rc.title as root_card_title
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
      `SELECT wt.*, COALESCE(CONCAT(e.first_name, ' ', e.last_name), u.username) as username, ms.stage_name, rc.id as root_card_id, rc.title as root_card_title
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
      `SELECT wt.*, COALESCE(CONCAT(e.first_name, ' ', e.last_name), u.username) as username, ms.stage_name, rc.id as root_card_id, rc.title as root_card_title
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
                    rc.id as root_card_id_direct,
                    rc.code as root_card_code,
                    rc.title as root_card_name,
                    COALESCE(qcd_so_rc.job_card_no, qcd_so_p.job_card_no, qcd_rc.job_card_no, rc.code, so_rc.po_number, so_p.po_number, 'N/A') as root_card_title, 
                    rc.priority,
                    rc.project_id,
                    p.code as project_code,
                    COALESCE(so_rc.id, so_p.id) as sales_order_id,
                    COALESCE(so_rc.po_number, so_p.po_number) as po_number,
                    COALESCE(so_rc.total, so_p.total) as total,
                    COALESCE(so_rc.order_date, so_p.order_date) as order_date,
                    COALESCE(so_rc.due_date, so_p.due_date) as due_date,
                    e.first_name,
                    e.last_name,
                    e.email,
                    COALESCE(qcd_so_rc.job_card_no, qcd_so_p.job_card_no, qcd_rc.job_card_no) as job_card_no
                 FROM worker_tasks wt
                 LEFT JOIN manufacturing_stages ms ON wt.stage_id = ms.id
                 LEFT JOIN root_cards rc ON ms.root_card_id = rc.id
                 LEFT JOIN projects p ON rc.project_id = p.id
                 -- Optimized joins (removing OR conditions)
                 LEFT JOIN sales_orders so_p ON p.sales_order_id = so_p.id
                 LEFT JOIN sales_orders so_rc ON rc.sales_order_id = so_rc.id
                 LEFT JOIN quality_check_details qcd_so_p ON so_p.id = qcd_so_p.sales_order_id
                 LEFT JOIN quality_check_details qcd_so_rc ON so_rc.id = qcd_so_rc.sales_order_id
                 LEFT JOIN quality_check_details qcd_rc ON rc.sales_order_id = qcd_rc.sales_order_id
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
    
    // Resolve employeeId if it's actually a userId
    let finalEmployeeId = employeeId;
    try {
      // First check if this ID exists in employees table
      const [empExists] = await db.execute('SELECT id FROM employees WHERE id = ?', [employeeId]);
      if (empExists.length === 0) {
        // If not, it might be a user_id, try to find the linked employee
        const [linkedEmp] = await db.execute(
          'SELECT e.id FROM employees e JOIN users u ON e.email = u.email WHERE u.id = ?',
          [employeeId]
        );
        if (linkedEmp.length > 0) {
          finalEmployeeId = linkedEmp[0].id;
          console.log(`[EmployeeTask] Resolved userId ${employeeId} to employeeId ${finalEmployeeId}`);
        }
      }
    } catch (resolveErr) {
      console.warn('[EmployeeTask] Error resolving IDs:', resolveErr.message);
    }

    // Validate salesOrderId if provided to avoid FK constraint failures
    let validatedSalesOrderId = data.salesOrderId || null;
    if (validatedSalesOrderId) {
      try {
        const [soRows] = await db.execute('SELECT id FROM sales_orders WHERE id = ?', [validatedSalesOrderId]);
        if (soRows.length === 0) {
          console.warn(`[EmployeeTask] ⚠️ Sales Order ID ${validatedSalesOrderId} does not exist. Setting to null for task.`);
          validatedSalesOrderId = null;
        }
      } catch (err) {
        console.warn(`[EmployeeTask] ⚠️ Error validating Sales Order ID:`, err.message);
        validatedSalesOrderId = null;
      }
    }

    // Resolve assignedBy if it's a userId (it usually is from req.user.id)
    let finalAssignedBy = data.assignedBy || null;
    if (finalAssignedBy) {
      try {
        const [assignerEmp] = await db.execute(
          'SELECT e.id FROM employees e JOIN users u ON e.email = u.email WHERE u.id = ?',
          [data.assignedBy]
        );
        if (assignerEmp.length > 0) {
          finalAssignedBy = assignerEmp[0].id;
        } else {
          // If the assigner doesn't have an employee record, we might need to set to null 
          // to avoid FK constraint failure since assigned_by REFERENCES employees(id)
          const [directEmp] = await db.execute('SELECT id FROM employees WHERE id = ?', [data.assignedBy]);
          if (directEmp.length === 0) {
            console.warn(`[EmployeeTask] ⚠️ Assigner ID ${data.assignedBy} not found in employees table. Setting to null.`);
            finalAssignedBy = null;
          }
        }
      } catch (err) {
        console.warn(`[EmployeeTask] ⚠️ Error resolving assigner ID:`, err.message);
        finalAssignedBy = null;
      }
    }

    const [result] = await db.execute(
      `INSERT INTO employee_tasks (employee_id, title, description, type, production_plan_stage_id, work_order_operation_id, sales_order_id, priority, status, due_date, notes, assigned_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        finalEmployeeId,
        data.title,
        data.description || null,
        data.type || 'general',
        data.productionPlanStageId || null,
        data.workOrderOperationId || null,
        validatedSalesOrderId,
        data.priority || 'medium',
        'pending',
        data.dueDate || null,
        data.notes || null,
        finalAssignedBy
      ]
    );

    const taskId = result.insertId;
    
    // Automatic notification logic
    try {
      let shouldNotify = true;
      
      // If linked to a production plan stage, check if it's blocked
      if (data.productionPlanStageId) {
        const [stageRows] = await db.execute(
          'SELECT is_blocked FROM production_plan_stages WHERE id = ?',
          [data.productionPlanStageId]
        );
        if (stageRows.length > 0 && stageRows[0].is_blocked) {
          shouldNotify = false;
          console.log(`[EmployeeTask] ℹ️ Task created for employee ${finalEmployeeId} but stage is blocked, no notification sent`);
        }
      }
      
      if (shouldNotify) {
        // Find user_id from employee_id for notification
        let userId = finalEmployeeId;
        const [users] = await db.execute(
          "SELECT u.id FROM users u JOIN employees e ON u.email = e.email WHERE e.id = ?", 
          [finalEmployeeId]
        );
        if (users.length > 0) {
          userId = users[0].id;
          
          // Check for existing notification to avoid duplicates
          const [existingNotif] = await db.execute(
            `SELECT id FROM alerts_notifications 
             WHERE user_id = ? AND alert_type = 'task_assigned' AND related_id = ? AND is_read = FALSE
             LIMIT 1`,
            [userId, taskId]
          );
          
          if (existingNotif.length > 0) {
            console.log(`[EmployeeTask] ℹ️ Notification already exists for this task assignment (${taskId})`);
          } else {
            // Find user_id for the assigner (from_user_id)
            let fromUserId = null;
            if (data.assignedBy) {
              // data.assignedBy is usually already a user_id from req.user.id
              // Let's verify if it's a valid user_id first
              const [userCheck] = await db.execute("SELECT id FROM users WHERE id = ?", [data.assignedBy]);
              if (userCheck.length > 0) {
                fromUserId = userCheck[0].id;
              } else {
                // If not found in users, it might be an employee_id
                const [assignerUsers] = await db.execute(
                  "SELECT u.id FROM users u JOIN employees e ON u.email = e.email WHERE e.id = ?", 
                  [data.assignedBy]
                );
                if (assignerUsers.length > 0) fromUserId = assignerUsers[0].id;
              }
            }

            await db.execute(
              `INSERT INTO alerts_notifications (user_id, from_user_id, alert_type, message, related_table, related_id, priority, link)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                userId,
                fromUserId,
                'task_assigned',
                `You have been assigned a new task: ${data.title}`,
                'employee_tasks',
                taskId,
                data.priority || 'medium',
                data.link || '/employee/tasks'
              ]
            );
            console.log(`[EmployeeTask] ✓ Notification created for user ${userId} (task assignment)`);
          }
        }
      }
    } catch (notifError) {
      console.error(`[EmployeeTask] Error creating task notification:`, notifError.message);
    }

    return taskId;
  }

  static async getAssignedTasks(employeeId, filters = {}) {
    let query = `SELECT et.id, et.employee_id, et.title, et.description, et.type, et.priority, et.status, 
                        et.assigned_by, et.due_date, et.notes, et.started_at, et.completed_at, 
                        et.created_at, et.updated_at, et.production_plan_stage_id, et.work_order_operation_id, et.sales_order_id,
                        pps.stage_name, woo.operation_name, woo.created_at as operation_created_at, wo.work_order_no, wo.item_name,
                        COALESCE(rc1.id, rc2.id, rc3.id) as root_card_id,
                        COALESCE(qcd1.job_card_no, qcd2.job_card_no, qcd_rc1.job_card_no, qcd_rc2.job_card_no, qcd_rc3.job_card_no, rc1.code, rc2.code, rc3.code, so.po_number, wo.work_order_no, 'N/A') as root_card_title,
                        COALESCE(rc1.code, rc2.code, rc3.code) as root_card_code,
                        COALESCE(rc1.title, rc2.title, rc3.title) as root_card_name,
                        COALESCE(p.id, p2.id, p3.id) as project_id, 
                        COALESCE(p.code, p2.code, p3.code) as project_code,
                        COALESCE(qcd1.job_card_no, qcd2.job_card_no, qcd_rc1.job_card_no, qcd_rc2.job_card_no, qcd_rc3.job_card_no) as job_card_no
                 FROM employee_tasks et
                 LEFT JOIN production_plan_stages pps ON et.production_plan_stage_id = pps.id
                 LEFT JOIN production_plans pp ON pps.production_plan_id = pp.id
                 LEFT JOIN work_order_operations woo ON et.work_order_operation_id = woo.id
                 LEFT JOIN work_orders wo ON woo.work_order_id = wo.id
                 
                 -- Optimized root card joins
                 LEFT JOIN root_cards rc1 ON pp.root_card_id = rc1.id
                 LEFT JOIN root_cards rc2 ON wo.root_card_id = rc2.id
                 LEFT JOIN root_cards rc3 ON et.root_card_id = rc3.id
                 
                 LEFT JOIN projects p ON rc1.project_id = p.id
                 LEFT JOIN sales_orders so ON et.sales_order_id = so.id
                 LEFT JOIN projects p2 ON so.id = p2.sales_order_id
                 LEFT JOIN sales_orders so2 ON wo.sales_order_id = so2.id
                 LEFT JOIN projects p3 ON wo.project_id = p3.id
                 
                 -- Optimized QC details joins (fully removing OR conditions)
                 LEFT JOIN quality_check_details qcd1 ON so.id = qcd1.sales_order_id
                 LEFT JOIN quality_check_details qcd2 ON so2.id = qcd2.sales_order_id
                 LEFT JOIN quality_check_details qcd_rc1 ON rc1.sales_order_id = qcd_rc1.sales_order_id
                 LEFT JOIN quality_check_details qcd_rc2 ON rc2.sales_order_id = qcd_rc2.sales_order_id
                 LEFT JOIN quality_check_details qcd_rc3 ON rc3.sales_order_id = qcd_rc3.sales_order_id
                 
                 WHERE et.employee_id = ? AND (pps.id IS NULL OR pps.is_blocked = FALSE)`;
    const params = [employeeId];

    if (filters.status && filters.status !== 'all') {
      query += ' AND et.status = ?';
      params.push(filters.status);
    }

    if (filters.type && filters.type !== 'all') {
      if (Array.isArray(filters.type)) {
        query += ` AND et.type IN (${filters.type.map(() => '?').join(',')})`;
        params.push(...filters.type);
      } else {
        query += ' AND et.type = ?';
        params.push(filters.type);
      }
    }

    if (filters.priority && filters.priority !== 'all') {
      query += ' AND et.priority = ?';
      params.push(filters.priority);
    }

    query += ' ORDER BY et.priority DESC, et.due_date ASC, et.created_at DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(Number(filters.limit));
    }
    
    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(Number(filters.offset));
    }

    const [rows] = await pool.execute(query, params);
    
    return (rows || []).map(row => {
      return { 
        ...row, 
        product_name: row.item_name || null,
        salesOrder: {
          customer: 'Confidential',
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
              pps.stage_name, woo.operation_name, woo.created_at as operation_created_at, wo.work_order_no, wo.item_name,
              COALESCE(rc_pp.id, rc_wo.id, rc_et.id) as root_card_id,
              COALESCE(qcd_pp.job_card_no, qcd_wo.job_card_no, qcd_et.job_card_no, rc_pp.code, rc_wo.code, rc_et.code, so.po_number, wo.work_order_no, 'N/A') as root_card_title,
              COALESCE(rc_pp.code, rc_wo.code, rc_et.code) as root_card_code,
              COALESCE(rc_pp.title, rc_wo.title, rc_et.title) as root_card_name,
              COALESCE(p.id, p2.id, p3.id) as project_id, 
              COALESCE(p.code, p2.code, p3.code) as project_code,
              COALESCE(qcd_pp.job_card_no, qcd_wo.job_card_no, qcd_et.job_card_no) as job_card_no
       FROM employee_tasks et
       LEFT JOIN production_plan_stages pps ON et.production_plan_stage_id = pps.id
       LEFT JOIN production_plans pp ON pps.production_plan_id = pp.id
       LEFT JOIN work_order_operations woo ON et.work_order_operation_id = woo.id
       LEFT JOIN work_orders wo ON woo.work_order_id = wo.id
       
       -- Optimized joins (removing OR conditions)
       LEFT JOIN root_cards rc_pp ON pp.root_card_id = rc_pp.id
       LEFT JOIN root_cards rc_wo ON wo.root_card_id = rc_wo.id
       LEFT JOIN root_cards rc_et ON et.root_card_id = rc_et.id
       
       LEFT JOIN quality_check_details qcd_pp ON rc_pp.sales_order_id = qcd_pp.sales_order_id
       LEFT JOIN quality_check_details qcd_wo ON rc_wo.sales_order_id = qcd_wo.sales_order_id
       LEFT JOIN quality_check_details qcd_et ON rc_et.sales_order_id = qcd_et.sales_order_id
       
       LEFT JOIN projects p ON rc_pp.project_id = p.id
       LEFT JOIN sales_orders so ON et.sales_order_id = so.id
       LEFT JOIN projects p2 ON so.id = p2.sales_order_id
       LEFT JOIN sales_orders so2 ON wo.sales_order_id = so2.id
       LEFT JOIN projects p3 ON wo.project_id = p3.id
       WHERE et.id = ?`,
      [taskId]
    );
    
    if (rows[0]) {
      return { 
        ...rows[0], 
        product_name: rows[0].item_name || null,
        salesOrder: {
          customer: 'Confidential',
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
      // If completing from employee side, we keep it 'in_progress' for production entry
      // The final completion happens in DepartmentTask model after production entry
      const newOpStatus = (status === 'completed') ? 'in_progress' : status;
      await pool.execute(
        `UPDATE work_order_operations SET status = ? WHERE id = ?`,
        [newOpStatus, task.work_order_operation_id]
      );
      console.log(`[EmployeeTask] ✓ Task ${taskId} status changed to '${status}' - Work Order Operation ${task.work_order_operation_id} updated to '${newOpStatus}'`);
    }

    if (task.production_plan_stage_id) {
      // If completing from employee side, we keep it 'in_progress' for production entry
      // The final completion happens in DepartmentTask model after production entry
      const newStageStatus = (status === 'completed' && task.work_order_operation_id) ? 'in_progress' : status;
      await pool.execute(
        `UPDATE production_plan_stages SET status = ? WHERE id = ?`,
        [newStageStatus, task.production_plan_stage_id]
      );
      console.log(`[EmployeeTask] ✓ Task ${taskId} status changed to '${status}' - Stage ${task.production_plan_stage_id} updated to '${newStageStatus}'`);
      
      // Only unlock next stage if this stage is ACTUALLY completed (no production entry pending)
      if (status === 'completed' && !task.work_order_operation_id) {
        await EmployeeTask.unlockNextStages(task.production_plan_stage_id);
      }
    }

    return { affectedRows: 1 };
  }

  static async unlockNextStages(currentStageId) {
    try {
      const [nextStages] = await pool.execute(
        `SELECT pps.id, pps.stage_name, pps.stage_type, pps.assigned_employee_id, pps.production_plan_id,
                sod.product_details
         FROM production_plan_stages pps
         JOIN production_plans pp ON pps.production_plan_id = pp.id
         LEFT JOIN sales_order_details sod ON sod.sales_order_id = pp.sales_order_id
         WHERE pps.blocked_by_stage_id = ?`,
        [currentStageId]
      );
      
      for (const nextStage of nextStages) {
        const nextStageId = nextStage.id;
        const nextStageName = nextStage.stage_name;
        const nextStageType = nextStage.stage_type;
        const nextStageEmployeeId = nextStage.assigned_employee_id;
        const planId = nextStage.production_plan_id;
        
        let productName = null;
        if (nextStage.product_details) {
          try {
            const details = typeof nextStage.product_details === 'string' 
              ? JSON.parse(nextStage.product_details) 
              : nextStage.product_details;
            productName = details.itemName || null;
          } catch (e) {
            console.warn('Error parsing product_details for next stage');
          }
        }
        
        console.log(`[EmployeeTask.unlockNextStages] Next stage: ${nextStageId}, Type: ${nextStageType}, Employee: ${nextStageEmployeeId}`);
        
        await pool.execute(
          `UPDATE production_plan_stages SET is_blocked = FALSE WHERE id = ?`,
          [nextStageId]
        );
        console.log(`[EmployeeTask.unlockNextStages] ✓ Stage ${nextStageId} unlocked`);
        
        // Create task for the unlocked stage
        if (nextStageType === 'outsource') {
          // Outsource stage - notify Production Department
          try {
            const AlertsNotification = require('./AlertsNotification');
            
            // Get all employees in Production Department
            const [deptMembers] = await pool.execute(`
              SELECT DISTINCT e.id 
              FROM employees e
              WHERE e.department = 'Production'
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
                console.log(`[EmployeeTask.unlockNextStages] ✓ Outsource notification sent to employee ${member.id}`);
              } catch (notifErr) {
                console.warn(`[EmployeeTask.unlockNextStages] Warning - could not send notification to employee ${member.id}:`, notifErr.message);
              }
            }
          } catch (outsourceError) {
            console.error(`[EmployeeTask.unlockNextStages] Error handling outsource stage unlocking:`, outsourceError.message);
          }
        } else if (nextStageEmployeeId) {
          // In-house stage - create task for employee
          try {
            const taskTitle = productName 
              ? `Task for ${productName}: ${nextStageName}`
              : `Production Stage: ${nextStageName}`;

            const newTaskId = await EmployeeTask.createAssignedTask(nextStageEmployeeId, {
              title: taskTitle,
              description: `Assigned to production plan stage`,
              type: 'production_stage',
              priority: 'medium',
              dueDate: null,
              notes: `Production Plan ID: ${planId}`,
              productionPlanStageId: nextStageId
            });
            console.log(`[EmployeeTask.unlockNextStages] ✓ New task ${newTaskId} created for employee ${nextStageEmployeeId} for stage ${nextStageName}`);
          } catch (createTaskError) {
            console.error(`[EmployeeTask.unlockNextStages] Error creating task for next stage:`, createTaskError.message);
          }
        }
      }
    } catch (error) {
      console.error('[EmployeeTask.unlockNextStages] Error:', error.message);
    }
  }

    /* 
    // Custom Workflow: Notification to Production Department on completion
    // Note: This logic has been moved to employeePortalController.js to support refined workflow
    if (status === 'completed') {
      try {
        // Only trigger for relevant task types that lead to production
        const triggerTypes = ['design_engineering', 'material_requirement', 'production_plan', 'job_card', 'production_stage'];
        
        if (triggerTypes.includes(task.type) || task.production_plan_stage_id || task.work_order_operation_id) {
          console.log(`[EmployeeTask] Triggering production notification for task type: ${task.type || 'unknown'}`);
          
          // Resolve root_card_id if missing
          let rootCardId = task.root_card_id;
          if (!rootCardId && task.sales_order_id) {
            const [rc] = await pool.execute('SELECT id FROM root_cards WHERE sales_order_id = ? LIMIT 1', [task.sales_order_id]);
            if (rc[0]) rootCardId = rc[0].id;
          }
          if (!rootCardId && task.work_order_operation_id) {
            const [rc] = await pool.execute(`
              SELECT wo.root_card_id 
              FROM work_order_operations woo 
              JOIN work_orders wo ON woo.work_order_id = wo.id 
              WHERE woo.id = ? LIMIT 1`, 
              [task.work_order_operation_id]
            );
            if (rc[0]) rootCardId = rc[0].root_card_id;
          }

          // Get Production Department Head / Supervisor (role_id 10 is production_manager)
          const [prodHeads] = await pool.execute(`
            SELECT DISTINCT u.id as user_id, e.id as employee_id
            FROM employees e
            JOIN users u ON e.email = u.email
            WHERE e.department = 'Production'
            AND (e.role_id IN (5, 10, 13, 14) OR e.designation LIKE '%Manager%' OR e.designation LIKE '%Supervisor%')
            ORDER BY (CASE WHEN e.designation LIKE '%Manager%' THEN 0 WHEN e.designation LIKE '%Supervisor%' THEN 1 ELSE 2 END) ASC
            LIMIT 1
          `);

          const DepartmentTask = require('./DepartmentTask');
          const AlertsNotification = require('./AlertsNotification');
          
          // Determine reference info (SO # or Root Card)
          let refInfo = '';
          if (task.sales_order_id) {
            const [so] = await pool.execute('SELECT po_number FROM sales_orders WHERE id = ?', [task.sales_order_id]);
            if (so[0]) refInfo = ` for SO #${so[0].po_number}`;
          }

          const notifMessage = `Task "${task.title}" has been completed${refInfo}. Ready for production entry.`;

          // 1. Create ONE Department Task for the entire production department (role_id 5)
          await DepartmentTask.createDepartmentTask({
            root_card_id: rootCardId,
            role_id: 5, // Production Role
            task_title: `Production Entry: ${task.title}`,
            task_description: `Complete production entry for task ${task.title}${refInfo}`,
            status: 'pending',
            priority: 'high',
            sales_order_id: task.sales_order_id,
            link: '/department/production/department-tasks'
          });

          // 2. Send notification to the Production Head/Supervisor if found
          if (prodHeads.length > 0) {
            await AlertsNotification.create({
              userId: prodHeads[0].user_id,
              alertType: 'production_ready',
              message: notifMessage,
              relatedTable: 'employee_tasks',
              relatedId: taskId,
              priority: 'high',
              link: '/department/production/department-tasks'
            });
            console.log(`[EmployeeTask] ✓ Production notification sent to head: ${prodHeads[0].user_id}`);
          }
          
          console.log(`[EmployeeTask] ✓ Departmental Production Task created for Root Card: ${rootCardId}`);
        }
      } catch (workflowError) {
        console.error('[EmployeeTask] Production workflow trigger failed:', workflowError.message);
      }
    }
    */

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
