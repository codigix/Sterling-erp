const pool = require('../config/database');

class GRN {
  static async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO grn (po_id, vendor_id, items, qc_status, receipt_date, transporter_notes) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.po_id || null,
        data.vendor_id || null,
        JSON.stringify(data.items || []),
        data.qc_status || 'pending',
        data.receipt_date || null,
        data.transporter_notes || null
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
      `SELECT g.*, po.po_number, 
              COALESCE(v_po.name, v_direct.name) as vendor_name,
              COALESCE(v_po.id, v_direct.id) as vendor_id,
              COALESCE(v_po.email, v_direct.email) as vendor_email
       FROM grn g
       LEFT JOIN purchase_orders po ON g.po_id = po.id
       LEFT JOIN vendors v_po ON po.vendor_id = v_po.id
       LEFT JOIN vendors v_direct ON g.vendor_id = v_direct.id
       WHERE g.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT g.*, po.po_number, 
             COALESCE(v_po.name, v_direct.name) as vendor_name,
             COALESCE(v_po.id, v_direct.id) as vendor_id
      FROM grn g
      LEFT JOIN purchase_orders po ON g.po_id = po.id
      LEFT JOIN vendors v_po ON po.vendor_id = v_po.id
      LEFT JOIN vendors v_direct ON g.vendor_id = v_direct.id
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
