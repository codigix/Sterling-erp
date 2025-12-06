const pool = require('../config/database');

class EmployeeTask {
  static async findAll(filters = {}) {
    let query = `SELECT wt.*, u.username, ms.stage_name, rc.title as root_card_title
                 FROM worker_tasks wt
                 LEFT JOIN users u ON wt.worker_id = u.id
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
      `SELECT wt.*, u.username, ms.stage_name, rc.title as root_card_title
       FROM worker_tasks wt
       LEFT JOIN users u ON wt.worker_id = u.id
       LEFT JOIN manufacturing_stages ms ON wt.stage_id = ms.id
       LEFT JOIN root_cards rc ON ms.root_card_id = rc.id
       WHERE wt.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByWorkerId(workerId) {
    const [rows] = await pool.execute(
      `SELECT wt.*, ms.stage_name, rc.title as root_card_title
       FROM worker_tasks wt
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
    let query = `SELECT wt.*, ms.stage_name, rc.title as root_card_title, rc.priority
                 FROM worker_tasks wt
                 LEFT JOIN manufacturing_stages ms ON wt.stage_id = ms.id
                 LEFT JOIN root_cards rc ON ms.root_card_id = rc.id
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
}

module.exports = EmployeeTask;
