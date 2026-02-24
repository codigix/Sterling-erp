const pool = require('../config/database');
const EmployeeTask = require('./EmployeeTask');

class DepartmentTask {
  static async getDepartmentTasks(roleId, status = null, priority = null) {
    let query = `SELECT 
                    dt.*,
                    rc.title as root_card_title,
                    rc.priority as root_card_priority,
                    rc.code as root_card_code,
                    rc.project_id,
                    p.name as project_name,
                    p.code as project_code,
                    COALESCE(dt.sales_order_id, rc.sales_order_id, p.sales_order_id) as sales_order_id,
                    so.po_number,
                    so.customer,
                    so.total,
                    so.order_date,
                    so.due_date,
                    r.name as role_name,
                    u.username as assigned_by_name,
                    sod.product_details
                 FROM department_tasks dt
                 LEFT JOIN root_cards rc ON dt.root_card_id = rc.id
                 LEFT JOIN projects p ON rc.project_id = p.id
                 LEFT JOIN sales_orders so ON COALESCE(dt.sales_order_id, rc.sales_order_id, p.sales_order_id) = so.id
                 LEFT JOIN sales_order_details sod ON sod.id = (
                    SELECT id FROM sales_order_details 
                    WHERE sales_order_id = so.id 
                    LIMIT 1
                 )
                 LEFT JOIN roles r ON dt.role_id = r.id
                 LEFT JOIN users u ON dt.assigned_by = u.id
                 WHERE dt.role_id = ?`;
    const params = [roleId];

    if (status && status !== 'all') {
      query += ' AND dt.status = ?';
      params.push(status);
    }

    if (priority && priority !== 'all') {
      query += ' AND dt.priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY dt.priority DESC, dt.created_at DESC';
    const [rows] = await pool.execute(query, params);
    
    // Format rows to include product_name
    const formattedRows = (rows || []).map(row => {
      if (row.product_details) {
        try {
          const productDetails = typeof row.product_details === 'string'
            ? JSON.parse(row.product_details)
            : row.product_details;
          row.product_name = productDetails?.itemName || null;
        } catch (e) {
          console.error('Error parsing product_details in getDepartmentTasks:', e);
          row.product_name = null;
        }
      } else {
        row.product_name = null;
      }
      delete row.product_details;
      return row;
    });

    return formattedRows;
  }

  static async getDepartmentTaskById(taskId) {
    const [rows] = await pool.execute(
      `SELECT 
          dt.*,
          rc.title as root_card_title,
          rc.priority as root_card_priority,
          rc.code as root_card_code,
          rc.project_id,
          p.name as project_name,
          p.code as project_code,
          COALESCE(dt.sales_order_id, rc.sales_order_id, p.sales_order_id) as sales_order_id,
          so.po_number,
          so.customer,
          so.total,
          so.order_date,
          so.due_date,
          r.name as role_name,
          u.username as assigned_by_name,
          sod.product_details
       FROM department_tasks dt
       LEFT JOIN root_cards rc ON dt.root_card_id = rc.id
       LEFT JOIN projects p ON rc.project_id = p.id
       LEFT JOIN sales_orders so ON COALESCE(dt.sales_order_id, rc.sales_order_id, p.sales_order_id) = so.id
       LEFT JOIN sales_order_details sod ON sod.id = (
          SELECT id FROM sales_order_details 
          WHERE sales_order_id = so.id 
          LIMIT 1
       )
       LEFT JOIN roles r ON dt.role_id = r.id
       LEFT JOIN users u ON dt.assigned_by = u.id
       WHERE dt.id = ?`,
      [taskId]
    );
    
    if (rows[0]) {
      if (rows[0].product_details) {
        try {
          const productDetails = typeof rows[0].product_details === 'string'
            ? JSON.parse(rows[0].product_details)
            : rows[0].product_details;
          rows[0].product_name = productDetails?.itemName || null;
        } catch (e) {
          console.error('Error parsing product_details in getDepartmentTaskById:', e);
          rows[0].product_name = null;
        }
      } else {
        rows[0].product_name = null;
      }
      delete rows[0].product_details;
    }

    return rows[0] || null;
  }

  static async getDepartmentTasksByRootCard(rootCardId) {
    const [rows] = await pool.execute(
      `SELECT 
          dt.*,
          r.name as role_name,
          u.username as assigned_by_name
       FROM department_tasks dt
       LEFT JOIN roles r ON dt.role_id = r.id
       LEFT JOIN users u ON dt.assigned_by = u.id
       WHERE dt.root_card_id = ?
       ORDER BY dt.created_at DESC`,
      [rootCardId]
    );
    return rows || [];
  }

  static async updateDepartmentTask(taskId, updates) {
    const allowedFields = ['task_title', 'task_description', 'status', 'priority', 'notes'];
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return { affectedRows: 0 };
    }

    // Get current task details for synchronization before update
    const [currentTaskRows] = await pool.execute(
      'SELECT id, root_card_id, task_title, status, notes, sales_order_id, work_order_operation_id FROM department_tasks WHERE id = ?',
      [taskId]
    );

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(taskId);

    const query = `UPDATE department_tasks SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(query, values);

    // Synchronize with employee_tasks if status or priority changed
    if (currentTaskRows.length > 0 && (updates.status || updates.priority)) {
      const task = currentTaskRows[0];
      const syncFields = [];
      const syncValues = [];

      if (updates.status) {
        syncFields.push('status = ?');
        syncValues.push(updates.status);
        if (updates.status === 'completed') {
          syncFields.push('completed_at = CURRENT_TIMESTAMP');
        } else if (updates.status === 'in_progress') {
          syncFields.push('started_at = COALESCE(started_at, CURRENT_TIMESTAMP)');
        }
      }

      if (updates.priority) {
        syncFields.push('priority = ?');
        syncValues.push(updates.priority);
      }

      if (syncFields.length > 0) {
        // Find employee tasks that match this department task
        // We match by title and root_card_id (related_id) OR sales_order_id
        const syncQuery = `
          UPDATE employee_tasks 
          SET ${syncFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
          WHERE title = ? 
          AND (
            (related_id = ? AND related_type = 'root_card')
            ${task.sales_order_id ? 'OR sales_order_id = ?' : ''}
          )
        `;

        const syncParams = [...syncValues, task.task_title, task.root_card_id];
        if (task.sales_order_id) {
          syncParams.push(task.sales_order_id);
        }

        await pool.execute(syncQuery, syncParams);
        console.log(`[DepartmentTask] Synchronized ${updates.status ? 'status' : ''} ${updates.priority ? 'priority' : ''} with employee_tasks for task: ${task.task_title}`);
      }

      // Handle sequential workflow if status changed to completed
      if (updates.status === 'completed') {
        try {
          const notes = typeof task.notes === 'string' ? JSON.parse(task.notes) : task.notes;
          if (notes && notes.workflow_step && task.root_card_id) {
            const WorkflowTaskHelper = require('../utils/workflowTaskHelper');
            await WorkflowTaskHelper.completeAndOpenNext(task.root_card_id, task.task_title);
          }
        } catch (e) {
          console.error(`[DepartmentTask] Error checking workflow for task completion:`, e.message);
        }
      }

      // Special handling for production_entry completion
      if (updates.status === 'completed' && (task.task_title.startsWith('Production Entry:') || task.task_title.startsWith('Production Entry Required:'))) {
        console.log(`[DepartmentTask] Production Entry completed for task: ${task.task_title}`);
        
        // 1. Mark the associated Work Order Operation as completed
        if (task.work_order_operation_id) {
          try {
            await pool.execute(
              "UPDATE work_order_operations SET status = 'completed', actual_end_date = COALESCE(actual_end_date, CURRENT_TIMESTAMP) WHERE id = ?",
              [task.work_order_operation_id]
            );
            console.log(`[DepartmentTask] ✓ Work Order Operation ${task.work_order_operation_id} marked as completed`);

            // 1b. Also update the associated production plan stage if it exists
            const [empTasks] = await pool.execute(
              "SELECT production_plan_stage_id FROM employee_tasks WHERE work_order_operation_id = ? AND production_plan_stage_id IS NOT NULL LIMIT 1",
              [task.work_order_operation_id]
            );

            if (empTasks.length > 0 && empTasks[0].production_plan_stage_id) {
              const stageId = empTasks[0].production_plan_stage_id;
              await pool.execute(
                "UPDATE production_plan_stages SET status = 'completed' WHERE id = ?",
                [stageId]
              );
              console.log(`[DepartmentTask] ✓ Production Plan Stage ${stageId} marked as completed`);

              // 1c. Unlock next stages
              await EmployeeTask.unlockNextStages(stageId);
            }
          } catch (err) {
            console.error(`[DepartmentTask] Error completing operation ${task.work_order_operation_id}:`, err.message);
          }
        }

        // 2. Update root_cards status to completed
        if (task.root_card_id) {
          await pool.execute(
            "UPDATE root_cards SET status = 'completed' WHERE id = ?",
            [task.root_card_id]
          );
          console.log(`[DepartmentTask] ✓ Root Card ${task.root_card_id} marked as completed`);
        }
      }
    }

    return result;
  }

  static async getDepartmentTaskStats(roleId) {
    const [rows] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'on_hold' THEN 1 ELSE 0 END) as on_hold,
        SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical_count
       FROM department_tasks
       WHERE role_id = ?`,
      [roleId]
    );
    return rows[0] || { total: 0, draft: 0, pending: 0, in_progress: 0, completed: 0, on_hold: 0, critical_count: 0 };
  }

  static async findByRootCardAndTitle(rootCardId, taskTitle) {
    let query = 'SELECT * FROM department_tasks WHERE task_title = ?';
    const params = [taskTitle];

    if (rootCardId) {
      query += ' AND root_card_id = ?';
      params.push(rootCardId);
    } else {
      query += ' AND root_card_id IS NULL';
    }

    query += ' LIMIT 1';
    
    const [rows] = await pool.execute(query, params);
    return rows[0] || null;
  }

  static async findByOperationAndTitle(operationId, taskTitle) {
    if (!operationId) return null;
    const [rows] = await pool.execute(
      `SELECT * FROM department_tasks WHERE work_order_operation_id = ? AND task_title = ? LIMIT 1`,
      [operationId, taskTitle]
    );
    return rows[0] || null;
  }

  static async create(data, connection = null) {
    return this.createDepartmentTask(data, connection);
  }

  static async createDepartmentTask(data, connection = null) {
    const {
      root_card_id,
      role_id,
      task_title,
      task_description,
      priority = 'medium',
      status = 'draft',
      assigned_by,
      notes = null,
      sales_order_id = null,
      work_order_operation_id = null,
      link = null
    } = data;

    const db = connection || pool;

    const [result] = await db.execute(
      `INSERT INTO department_tasks (
        root_card_id, role_id, task_title, task_description, 
        status, priority, assigned_by, notes, 
        sales_order_id, work_order_operation_id, link
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        root_card_id, role_id, task_title, task_description, 
        status, priority, assigned_by, notes ? JSON.stringify(notes) : null, 
        sales_order_id, work_order_operation_id, link
      ]
    );
    return result;
  }

  static async deleteDepartmentTask(taskId) {
    const [result] = await pool.execute(
      'DELETE FROM department_tasks WHERE id = ?',
      [taskId]
    );
    return result;
  }

  static async deleteBulkDepartmentTasks(taskIds) {
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return { affectedRows: 0 };
    }

    const placeholders = taskIds.map(() => '?').join(',');
    const query = `DELETE FROM department_tasks WHERE id IN (${placeholders})`;
    const [result] = await pool.execute(query, taskIds);
    return result;
  }
}

module.exports = DepartmentTask;
