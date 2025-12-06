const pool = require('../config/database');

class Project {
  static async create(data, externalConnection = null) {
    const connection = externalConnection || (await pool.getConnection());

    try {
      const [result] = await connection.execute(
        `
          INSERT INTO projects
          (name, code, sales_order_id, client_name, po_number, status, priority, expected_start, expected_end, manager_id, summary)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.name,
          data.code || null,
          data.salesOrderId || null,
          data.clientName || null,
          data.poNumber || null,
          data.status || 'draft',
          data.priority || 'medium',
          data.expectedStart || null,
          data.expectedEnd || null,
          data.managerId || null,
          data.summary || null
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

  static async updateStatus(id, status) {
    await pool.execute('UPDATE projects SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
  }

  static async findAllSummaries() {
    const [rows] = await pool.execute(`
      SELECT p.*, so.customer AS customer_name, so.po_number
      FROM projects p
      LEFT JOIN sales_orders so ON so.id = p.sales_order_id
      ORDER BY p.created_at DESC
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM projects WHERE id = ?', [id]);
    return rows[0];
  }
}

module.exports = Project;
