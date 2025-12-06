const pool = require('../config/database');

class PurchaseOrder {
  static async findAll(filters = {}) {
    let query = 'SELECT po.*, q.vendor_id FROM purchase_orders po LEFT JOIN quotations q ON po.quotation_id = q.id WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND po.status = ?';
      params.push(filters.status);
    }

    if (filters.vendorId) {
      query += ' AND q.vendor_id = ?';
      params.push(filters.vendorId);
    }

    query += ' ORDER BY po.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows || [];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT po.*, q.vendor_id, q.pr_id, v.name as vendor_name
       FROM purchase_orders po
       LEFT JOIN quotations q ON po.quotation_id = q.id
       LEFT JOIN vendors v ON q.vendor_id = v.id
       WHERE po.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create(quotationId, items) {
    const [result] = await pool.execute(
      `INSERT INTO purchase_orders (quotation_id, items, status)
       VALUES (?, ?, ?)`,
      [quotationId, JSON.stringify(items), 'pending']
    );
    return result.insertId;
  }

  static async updateStatus(id, status) {
    await pool.execute(
      'UPDATE purchase_orders SET status = ? WHERE id = ?',
      [status, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM purchase_orders WHERE id = ?', [id]);
  }

  static async getByVendor(vendorId) {
    const [rows] = await pool.execute(
      `SELECT po.*, q.vendor_id, v.name as vendor_name
       FROM purchase_orders po
       LEFT JOIN quotations q ON po.quotation_id = q.id
       LEFT JOIN vendors v ON q.vendor_id = v.id
       WHERE q.vendor_id = ?
       ORDER BY po.created_at DESC`,
      [vendorId]
    );
    return rows || [];
  }

  static async getStats() {
    const [rows] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered
       FROM purchase_orders`
    );
    return rows[0];
  }
}

module.exports = PurchaseOrder;
