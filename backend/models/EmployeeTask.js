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
    return result.insertId;
  }

  static async getAssignedTasks(employeeId, filters = {}) {
    let query = `SELECT et.id, et.employee_id, et.title, et.description, et.type, et.priority, et.status, 
                        et.assigned_by, et.due_date, et.notes, et.started_at, et.completed_at, 
                        et.created_at, et.updated_at, et.production_plan_stage_id,
                        pps.stage_name, rc.title as root_card_title,
                        p.id as project_id, p.name as project_name, p.code as project_code
                 FROM employee_tasks et
                 LEFT JOIN production_plan_stages pps ON et.production_plan_stage_id = pps.id
                 LEFT JOIN production_plans pp ON pps.production_plan_id = pp.id
                 LEFT JOIN root_cards rc ON pp.root_card_id = rc.id
                 LEFT JOIN projects p ON rc.project_id = p.id
                 WHERE et.employee_id = ?`;
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
    return rows || [];
  }

  static async getAssignedTaskById(taskId) {
    const [rows] = await pool.execute(
      `SELECT et.id, et.employee_id, et.title, et.description, et.type, et.priority, et.status, 
              et.assigned_by, et.due_date, et.notes, et.started_at, et.completed_at, 
              et.created_at, et.updated_at, et.production_plan_stage_id,
              pps.stage_name, rc.title as root_card_title,
              p.id as project_id, p.name as project_name, p.code as project_code
       FROM employee_tasks et
       LEFT JOIN production_plan_stages pps ON et.production_plan_stage_id = pps.id
       LEFT JOIN production_plans pp ON pps.production_plan_id = pp.id
       LEFT JOIN root_cards rc ON pp.root_card_id = rc.id
       LEFT JOIN projects p ON rc.project_id = p.id
       WHERE et.id = ?`,
      [taskId]
    );
    return rows[0];
  }

  static async updateAssignedTaskStatus(taskId, status, notes = null) {
    // First get the task to find its production_plan_stage_id
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

    // Sync status directly to production plan stage
    if (task.production_plan_stage_id) {
      await pool.execute(
        `UPDATE production_plan_stages SET status = ? WHERE id = ?`,
        [status, task.production_plan_stage_id]
      );
      console.log(`[EmployeeTask] ✓ Task ${taskId} status changed to '${status}' - Stage ${task.production_plan_stage_id} updated to '${status}'`);
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
