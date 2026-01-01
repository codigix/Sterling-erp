const pool = require('../config/database');

class Quotation {
  static async findAll(filters = {}) {
    let query = `
      SELECT q.*, v.name as vendor_name, ref.quotation_number as reference_number
      FROM quotations q 
      LEFT JOIN vendors v ON q.vendor_id = v.id 
      LEFT JOIN quotations ref ON q.reference_id = ref.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.search) {
      query += ' AND (q.quotation_number LIKE ? OR v.name LIKE ?)';
      const likeSearch = `%${filters.search}%`;
      params.push(likeSearch, likeSearch);
    }

    if (filters.vendor_id) {
      query += ' AND q.vendor_id = ?';
      params.push(filters.vendor_id);
    }

    if (filters.status) {
      query += ' AND q.status = ?';
      params.push(filters.status);
    }

    if (filters.type) {
      query += ' AND q.type = ?';
      params.push(filters.type);
    }

    if (filters.sales_order_id) {
      query += ' AND q.sales_order_id = ?';
      params.push(filters.sales_order_id);
    }

    query += ' ORDER BY q.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows || [];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT q.*, v.name as vendor_name, ref.quotation_number as reference_number
       FROM quotations q 
       LEFT JOIN vendors v ON q.vendor_id = v.id 
       LEFT JOIN quotations ref ON q.reference_id = ref.id
       WHERE q.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByQuotationNumber(quotationNumber) {
    const [rows] = await pool.execute(
      `SELECT q.*, v.name as vendor_name, ref.quotation_number as reference_number
       FROM quotations q 
       LEFT JOIN vendors v ON q.vendor_id = v.id 
       LEFT JOIN quotations ref ON q.reference_id = ref.id
       WHERE q.quotation_number = ?`,
      [quotationNumber]
    );
    return rows[0] || null;
  }

  static async create(data) {
    const quotationNumber = `QT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const [result] = await pool.execute(
      `INSERT INTO quotations (
        vendor_id, quotation_number, total_amount, valid_until, status, items, notes, type, reference_id, sales_order_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        data.vendor_id,
        quotationNumber,
        data.total_amount || 0,
        data.valid_until || null,
        data.status || 'pending',
        JSON.stringify(data.items || []),
        data.notes || null,
        data.type || 'outbound',
        data.reference_id || null,
        data.sales_order_id || null
      ]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const updates = [];
    const params = [];

    const fields = ['vendor_id', 'total_amount', 'valid_until', 'status', 'notes', 'type', 'reference_id', 'sales_order_id'];
    
    for (const field of fields) {
      if (data[field] !== undefined) {
        if (field === 'status' && (data[field] === 'approved' || data[field] === 'rejected')) {
          updates.push(`${field} = ?`);
          params.push(data[field]);
        } else if (field !== 'status') {
          updates.push(`${field} = ?`);
          params.push(data[field]);
        }
      }
    }

    if (data.items !== undefined) {
      updates.push('items = ?');
      params.push(JSON.stringify(data.items));
    }

    if (updates.length === 0) {
      return;
    }

    params.push(id);

    await pool.execute(
      `UPDATE quotations SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM quotations WHERE id = ?', [id]);
  }

  static async getStats() {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
        SUM(total_amount) as total_value
      FROM quotations
    `);
    return rows[0] || {};
  }

  static async getByVendor(vendorId, filters = {}) {
    let query = `
      SELECT q.*, v.name as vendor_name 
      FROM quotations q 
      LEFT JOIN vendors v ON q.vendor_id = v.id 
      WHERE q.vendor_id = ?
    `;
    const params = [vendorId];

    if (filters.status) {
      query += ' AND q.status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY q.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows || [];
  }

  static async changeStatus(id, status) {
    const validStatuses = ['pending', 'approved', 'rejected', 'sent'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    await pool.execute(
      'UPDATE quotations SET status = ? WHERE id = ?',
      [status, id]
    );
  }

  static async getResponses(quotationId) {
    const [rows] = await pool.execute(
      `SELECT q.*, v.name as vendor_name
       FROM quotations q
       LEFT JOIN vendors v ON q.vendor_id = v.id
       WHERE q.reference_id = ? AND q.type = 'inbound'
       ORDER BY q.created_at DESC`,
      [quotationId]
    );
    return rows || [];
  }
}

module.exports = Quotation;
