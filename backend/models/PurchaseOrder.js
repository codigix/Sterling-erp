const pool = require('../config/database');

class PurchaseOrder {
  static async findAll(filters = {}) {
    let query = `
      SELECT po.*, q.vendor_id, v.name as vendor_name, v.email as vendor_email,
      (SELECT COUNT(*) FROM purchase_order_communications poc WHERE poc.po_id = po.id) as communication_count,
      (SELECT COUNT(*) FROM purchase_order_communications poc WHERE poc.po_id = po.id AND poc.is_read = FALSE) as unread_communication_count
      FROM purchase_orders po 
      LEFT JOIN quotations q ON po.quotation_id = q.id 
      LEFT JOIN vendors v ON q.vendor_id = v.id 
      WHERE 1=1
    `;
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
      `SELECT po.*, q.vendor_id, v.name as vendor_name, v.email as vendor_email
       FROM purchase_orders po
       LEFT JOIN quotations q ON po.quotation_id = q.id
       LEFT JOIN vendors v ON q.vendor_id = v.id
       WHERE po.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByPoNumber(poNumber) {
    const [rows] = await pool.execute(
      `SELECT po.*, q.vendor_id, v.name as vendor_name, v.email as vendor_email
       FROM purchase_orders po
       LEFT JOIN quotations q ON po.quotation_id = q.id
       LEFT JOIN vendors v ON q.vendor_id = v.id
       WHERE po.po_number = ?`,
      [poNumber]
    );
    return rows[0];
  }

  static async create(data) {
    const poNumber = `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const [result] = await pool.execute(
      `INSERT INTO purchase_orders (
        po_number, quotation_id, vendor_id, items, total_amount, expected_delivery_date, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        poNumber,
        data.quotation_id,
        data.vendor_id || null,
        JSON.stringify(data.items || []),
        data.total_amount || 0,
        data.expected_delivery_date || null,
        data.notes || null,
        data.status || 'pending'
      ]
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
      `SELECT po.*, q.vendor_id, v.name as vendor_name, v.email as vendor_email
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

  static async getReceivedQuotes(filters = {}) {
    let query = `SELECT q.*, v.name as vendor_name 
                 FROM quotations q 
                 LEFT JOIN vendors v ON q.vendor_id = v.id 
                 WHERE q.type = 'inbound'`;
    const params = [];

    if (filters.root_card_id) {
      query += ' AND q.sales_order_id = ?';
      params.push(filters.root_card_id);
    }

    query += ' ORDER BY q.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows || [];
  }
}

module.exports = PurchaseOrder;
