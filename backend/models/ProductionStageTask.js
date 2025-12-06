const pool = require('../config/database');

class ProductionStageTask {
  static async create(data, externalConnection = null) {
    const connection = externalConnection || (await pool.getConnection());

    try {
      const [result] = await connection.execute(
        `
          INSERT INTO production_stage_tasks
          (production_stage_id, employee_id, task_name, description, status, priority, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.productionStageId,
          data.employeeId,
          data.taskName,
          data.description || null,
          data.status || 'to_do',
          data.priority || 'medium',
          data.notes || null
        ]
      );

      if (!externalConnection) {
        connection.release();
      }

      return result.insertId;
    } catch (error) {
      if (!externalConnection) {
        connection.release();
      }
      throw error;
    }
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `
        SELECT pst.*, ps.stage_name, rc.title as root_card_title, u.username AS employee_name
        FROM production_stage_tasks pst
        LEFT JOIN production_stages ps ON ps.id = pst.production_stage_id
        LEFT JOIN production_plans pp ON pp.id = ps.production_plan_id
        LEFT JOIN root_cards rc ON rc.project_id = pp.project_id
        LEFT JOIN users u ON u.id = pst.employee_id
        WHERE pst.id = ?
      `,
      [id]
    );
    return rows[0];
  }

  static async findByEmployeeId(employeeId, filters = {}) {
    let query = `
      SELECT pst.*, ps.stage_name, ps.production_plan_id, pp.plan_name, 
             pr.name AS project_name, u.username AS employee_name
      FROM production_stage_tasks pst
      LEFT JOIN production_stages ps ON ps.id = pst.production_stage_id
      LEFT JOIN production_plans pp ON pp.id = ps.production_plan_id
      LEFT JOIN projects pr ON pr.id = pp.project_id
      LEFT JOIN users u ON u.id = pst.employee_id
      WHERE pst.employee_id = ?
    `;
    const params = [employeeId];

    if (filters.status && filters.status !== 'all') {
      query += ' AND pst.status = ?';
      params.push(filters.status);
    }

    if (filters.productionPlanId) {
      query += ' AND pp.id = ?';
      params.push(filters.productionPlanId);
    }

    if (filters.dateFilter === 'today') {
      query += ' AND DATE(pst.assigned_date) = DATE(NOW())';
    } else if (filters.dateFilter === 'week') {
      query += ' AND DATE(pst.assigned_date) >= DATE(NOW()) - INTERVAL 7 DAY';
    } else if (filters.dateFilter === 'month') {
      query += ' AND DATE(pst.assigned_date) >= DATE(NOW()) - INTERVAL 30 DAY';
    }

    query += ' ORDER BY CASE WHEN pst.priority = "high" THEN 0 WHEN pst.priority = "medium" THEN 1 ELSE 2 END, pst.assigned_date DESC';

    const [rows] = await pool.execute(query, params);
    return rows || [];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT pst.*, ps.stage_name, u.username AS employee_name, pp.plan_name
      FROM production_stage_tasks pst
      LEFT JOIN production_stages ps ON ps.id = pst.production_stage_id
      LEFT JOIN production_plans pp ON pp.id = ps.production_plan_id
      LEFT JOIN users u ON u.id = pst.employee_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status && filters.status !== 'all') {
      query += ' AND pst.status = ?';
      params.push(filters.status);
    }

    if (filters.employeeId) {
      query += ' AND pst.employee_id = ?';
      params.push(filters.employeeId);
    }

    if (filters.productionStageId) {
      query += ' AND pst.production_stage_id = ?';
      params.push(filters.productionStageId);
    }

    query += ' ORDER BY pst.assigned_date DESC';

    const [rows] = await pool.execute(query, params);
    return rows || [];
  }

  static async updateStatus(id, status, updates = {}) {
    const allowedUpdates = ['started_date', 'completed_date', 'cancel_reason'];
    let query = 'UPDATE production_stage_tasks SET status = ?';
    const params = [status];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        query += `, ${key} = ?`;
        params.push(value);
      }
    }

    query += ', updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    params.push(id);

    await pool.execute(query, params);
  }

  static async addPause(id, pauseDuration) {
    await pool.execute(
      `
        UPDATE production_stage_tasks
        SET pause_count = pause_count + 1,
            total_pause_duration = total_pause_duration + ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [pauseDuration, id]
    );
  }

  static async getEmployeeStats(employeeId) {
    const [rows] = await pool.execute(
      `
        SELECT 
          COUNT(*) as total_tasks,
          SUM(CASE WHEN status = 'to_do' THEN 1 ELSE 0 END) as to_do,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status = 'pause' THEN 1 ELSE 0 END) as paused,
          SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'cancel' THEN 1 ELSE 0 END) as cancelled
        FROM production_stage_tasks
        WHERE employee_id = ?
      `,
      [employeeId]
    );
    return rows[0];
  }

  static async getProductionStageStats(productionStageId) {
    const [rows] = await pool.execute(
      `
        SELECT 
          COUNT(*) as total_tasks,
          SUM(CASE WHEN status = 'to_do' THEN 1 ELSE 0 END) as to_do,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status = 'pause' THEN 1 ELSE 0 END) as paused,
          SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'cancel' THEN 1 ELSE 0 END) as cancelled
        FROM production_stage_tasks
        WHERE production_stage_id = ?
      `,
      [productionStageId]
    );
    return rows[0];
  }
}

module.exports = ProductionStageTask;
