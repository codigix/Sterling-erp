const pool = require('../config/database');
const { parseJsonField, stringifyJsonField } = require('../utils/salesOrderHelpers');

class SalesOrderStep {
  static async createTable() {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS sales_order_steps (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sales_order_id INT NOT NULL,
        step_id INT NOT NULL,
        step_key VARCHAR(50) NOT NULL,
        step_name VARCHAR(100) NOT NULL,
        status ENUM('pending', 'in_progress', 'completed', 'on_hold', 'approved', 'rejected') DEFAULT 'pending',
        data JSON,
        assigned_to INT,
        started_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id),
        UNIQUE KEY unique_so_step (sales_order_id, step_id),
        INDEX idx_so_step_status (sales_order_id, status),
        INDEX idx_step_key (step_key)
      )
    `);
  }

  static async findByIdAndStep(salesOrderId, stepId) {
    const [rows] = await pool.execute(
      `SELECT * FROM sales_order_steps WHERE sales_order_id = ? AND step_id = ?`,
      [salesOrderId, stepId]
    );
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static async findBySalesOrderId(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT * FROM sales_order_steps WHERE sales_order_id = ? ORDER BY step_id ASC`,
      [salesOrderId]
    );
    return rows.map(this.formatRow);
  }

  static async findByStepKey(salesOrderId, stepKey) {
    const [rows] = await pool.execute(
      `SELECT * FROM sales_order_steps WHERE sales_order_id = ? AND step_key = ?`,
      [salesOrderId, stepKey]
    );
    return rows[0] ? this.formatRow(rows[0]) : null;
  }

  static async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO sales_order_steps 
       (sales_order_id, step_id, step_key, step_name, status, data, assigned_to, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.salesOrderId,
        data.stepId,
        data.stepKey,
        data.stepName,
        data.status || 'pending',
        stringifyJsonField(data.data),
        data.assignedTo || null,
        data.notes || null
      ]
    );
    return result.insertId;
  }

  static async update(salesOrderId, stepId, data) {
    await pool.execute(
      `UPDATE sales_order_steps 
       SET status = ?, data = ?, assigned_to = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ? AND step_id = ?`,
      [
        data.status,
        stringifyJsonField(data.data),
        data.assignedTo || null,
        data.notes || null,
        salesOrderId,
        stepId
      ]
    );
  }

  static async updateStatus(salesOrderId, stepId, status) {
    const completedAtValue = status === 'completed' ? new Date() : null;
    await pool.execute(
      `UPDATE sales_order_steps 
       SET status = ?, completed_at = COALESCE(completed_at, ?), updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ? AND step_id = ?`,
      [status, status === 'completed' ? new Date() : null, salesOrderId, stepId]
    );
  }

  static async startStep(salesOrderId, stepId) {
    await pool.execute(
      `UPDATE sales_order_steps 
       SET status = 'in_progress', started_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ? AND step_id = ?`,
      [salesOrderId, stepId]
    );
  }

  static async completeStep(salesOrderId, stepId) {
    await pool.execute(
      `UPDATE sales_order_steps 
       SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ? AND step_id = ?`,
      [salesOrderId, stepId]
    );
  }

  static async assignEmployee(salesOrderId, stepId, employeeId) {
    await pool.execute(
      `UPDATE sales_order_steps 
       SET assigned_to = ?, updated_at = CURRENT_TIMESTAMP
       WHERE sales_order_id = ? AND step_id = ?`,
      [employeeId, salesOrderId, stepId]
    );
  }

  static async getStepProgress(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT step_id, status FROM sales_order_steps WHERE sales_order_id = ? ORDER BY step_id ASC`,
      [salesOrderId]
    );
    
    const totalSteps = rows.length;
    const completedSteps = rows.filter(r => r.status === 'completed').length;
    const inProgressSteps = rows.filter(r => r.status === 'in_progress').length;

    return {
      totalSteps,
      completedSteps,
      inProgressSteps,
      remainingSteps: totalSteps - completedSteps,
      progressPercentage: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
      steps: rows
    };
  }

  static async getCompletedSteps(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT step_id, step_name FROM sales_order_steps 
       WHERE sales_order_id = ? AND status = 'completed' ORDER BY completed_at ASC`,
      [salesOrderId]
    );
    return rows;
  }

  static async getPendingSteps(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT * FROM sales_order_steps 
       WHERE sales_order_id = ? AND status = 'pending' ORDER BY step_id ASC`,
      [salesOrderId]
    );
    return rows.map(this.formatRow);
  }

  static formatRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      salesOrderId: row.sales_order_id,
      stepId: row.step_id,
      stepKey: row.step_key,
      stepName: row.step_name,
      status: row.status,
      data: parseJsonField(row.data),
      assignedTo: row.assigned_to,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = SalesOrderStep;
