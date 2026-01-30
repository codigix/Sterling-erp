const pool = require('../config/database');

class RootCardReal {
  static async getAll() {
    const [rows] = await pool.execute(
      `SELECT so.*, p.name as project_name, p.code as project_code, p.client_name
       FROM sales_orders so
       LEFT JOIN projects p ON p.sales_order_id = so.id
       ORDER BY so.created_at DESC`
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT so.*, p.name as project_name, p.code as project_code, p.client_name
       FROM sales_orders so
       LEFT JOIN projects p ON p.sales_order_id = so.id
       WHERE so.id = ?`,
      [id]
    );
    return rows[0];
  }
}

module.exports = RootCardReal;
