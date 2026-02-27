const pool = require('../config/database');

class PurchaseOrder {
  static async findAll(filters = {}) {
    let query = `
      SELECT po.*, q.vendor_id as q_vendor_id, v.name as vendor_name, v.email as vendor_email,
      mr.mr_number,
      (SELECT COUNT(*) FROM purchase_order_communications poc WHERE poc.po_id = po.id) as communication_count,
      (SELECT COUNT(*) FROM purchase_order_communications poc WHERE poc.po_id = po.id AND poc.is_read = FALSE) as unread_communication_count
      FROM purchase_orders po 
      LEFT JOIN quotations q ON po.quotation_id = q.id 
      LEFT JOIN material_requests mr ON po.material_request_id = mr.id
      LEFT JOIN vendors v ON (q.vendor_id = v.id OR po.vendor_id = v.id) 
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
      `SELECT po.*, v.name as vendor_name, v.email as vendor_email,
       mr.mr_number,
       (SELECT COUNT(*) FROM purchase_order_communications poc WHERE poc.po_id = po.id AND poc.is_read = FALSE) as unread_communication_count
       FROM purchase_orders po
       LEFT JOIN quotations q ON po.quotation_id = q.id
       LEFT JOIN material_requests mr ON po.material_request_id = mr.id
       LEFT JOIN vendors v ON (q.vendor_id = v.id OR po.vendor_id = v.id)
       WHERE po.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByPoNumber(poNumber) {
    const [rows] = await pool.execute(
      `SELECT po.*, v.name as vendor_name, v.email as vendor_email
       FROM purchase_orders po
       LEFT JOIN quotations q ON po.quotation_id = q.id
       LEFT JOIN vendors v ON (q.vendor_id = v.id OR po.vendor_id = v.id)
       WHERE po.po_number = ?`,
      [poNumber]
    );
    return rows[0];
  }

  static async create(data) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    let poNumber = data.po_number;
    if (!poNumber) {
      if (data.material_request_id) {
        poNumber = `PO-MR-${dateStr}-${Math.floor(Math.random() * 1000)}`;
      } else {
        poNumber = `PO-${dateStr}-${Math.floor(Math.random() * 1000)}`;
      }
    }
    
    const [result] = await pool.execute(
      `INSERT INTO purchase_orders (
        po_number, quotation_id, material_request_id, vendor_id, items, 
        subtotal, tax_amount, total_amount, expected_delivery_date, 
        order_date, currency, tax_template, notes, status,
        shipping_address, incoterm, shipping_rule, tax_category,
        payment_terms, payment_due_date, tax_rate, advance_paid, payable_balance
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        poNumber,
        data.quotation_id || null,
        data.material_request_id || null,
        data.vendor_id || null,
        JSON.stringify(data.items || []),
        data.subtotal || 0,
        data.tax_amount || 0,
        data.total_amount || 0,
        data.expected_delivery_date || null,
        data.order_date || new Date(),
        data.currency || 'INR',
        data.tax_template || null,
        data.notes || null,
        data.status || 'draft',
        data.shipping_address || null,
        data.incoterm || 'EXW',
        data.shipping_rule || 'Standard',
        data.tax_category || 'GST',
        data.payment_terms || null,
        data.payment_due_date || null,
        data.tax_rate || 18.00,
        data.advance_paid || 0,
        data.payable_balance || 0
      ]
    );
    return result.insertId;
  }

  static async update(id, data) {
    await pool.execute(
      `UPDATE purchase_orders SET 
        vendor_id = ?, 
        items = ?, 
        subtotal = ?, 
        tax_amount = ?, 
        total_amount = ?, 
        expected_delivery_date = ?, 
        order_date = ?, 
        currency = ?, 
        tax_template = ?, 
        notes = ?,
        shipping_address = ?,
        incoterm = ?,
        shipping_rule = ?,
        tax_category = ?,
        payment_terms = ?,
        payment_due_date = ?,
        tax_rate = ?,
        advance_paid = ?,
        payable_balance = ?
      WHERE id = ?`,
      [
        data.vendor_id || null,
        JSON.stringify(data.items || []),
        data.subtotal || 0,
        data.tax_amount || 0,
        data.total_amount || 0,
        data.expected_delivery_date || null,
        data.order_date || null,
        data.currency || 'INR',
        data.tax_template || null,
        data.notes || null,
        data.shipping_address || null,
        data.incoterm || 'EXW',
        data.shipping_rule || 'Standard',
        data.tax_category || 'GST',
        data.payment_terms || null,
        data.payment_due_date || null,
        data.tax_rate || 18.00,
        data.advance_paid || 0,
        data.payable_balance || 0,
        id
      ]
    );
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
        SUM(total_amount) as total_amount,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted,
        SUM(CASE WHEN status IN ('approved', 'ordered', 'pending') THEN 1 ELSE 0 END) as to_receive,
        SUM(CASE WHEN status IN ('goods arrival', 'received') THEN 1 ELSE 0 END) as partial,
        SUM(CASE WHEN status IN ('fulfilled', 'delivered') THEN 1 ELSE 0 END) as fulfilled
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
