const pool = require('../config/database');

class GRN {
  static async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO grn (po_id, items, qc_status) VALUES (?, ?, ?)`,
      [
        data.po_id,
        JSON.stringify(data.items || []),
        data.qc_status || 'pending'
      ]
    );
    return result.insertId;
  }

  static async findByPoId(poId) {
    const [rows] = await pool.execute(
      `SELECT * FROM grn WHERE po_id = ?`,
      [poId]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT g.*, po.po_number, v.name as vendor_name
       FROM grn g
       JOIN purchase_orders po ON g.po_id = po.id
       JOIN quotations q ON po.quotation_id = q.id
       JOIN vendors v ON q.vendor_id = v.id
       WHERE g.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT g.*, po.po_number, v.name as vendor_name
      FROM grn g
      JOIN purchase_orders po ON g.po_id = po.id
      JOIN quotations q ON po.quotation_id = q.id
      JOIN vendors v ON q.vendor_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ' AND g.qc_status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY g.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows || [];
  }

  static async updateStatus(id, status) {
    await pool.execute(
      'UPDATE grn SET qc_status = ? WHERE id = ?',
      [status, id]
    );
  }
}

module.exports = GRN;
