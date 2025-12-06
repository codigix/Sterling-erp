const pool = require('../config/database');

class MaterialRequest {
  static async create(data, connection = null) {
    const conn = connection || (await pool.getConnection());
    
    try {
      const [result] = await conn.execute(
        `INSERT INTO material_requests 
         (sales_order_id, production_plan_id, material_name, material_code, 
          quantity, unit, specification, required_date, priority, status, created_by, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.salesOrderId,
          data.productionPlanId || null,
          data.materialName,
          data.materialCode || null,
          data.quantity,
          data.unit || 'Nos',
          data.specification || null,
          data.requiredDate || null,
          data.priority || 'medium',
          data.status || 'draft',
          data.createdBy || null,
          data.remarks || null
        ]
      );

      if (!connection) {
        conn.release();
      }

      return result.insertId;
    } catch (error) {
      if (!connection) {
        conn.release();
      }
      throw error;
    }
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT mr.*, so.customer, u.username as created_by_name
       FROM material_requests mr
       LEFT JOIN sales_orders so ON so.id = mr.sales_order_id
       LEFT JOIN users u ON u.id = mr.created_by
       WHERE mr.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findBySalesOrder(salesOrderId) {
    const [rows] = await pool.execute(
      `SELECT mr.* 
       FROM material_requests mr
       WHERE mr.sales_order_id = ?
       ORDER BY mr.created_at DESC`,
      [salesOrderId]
    );
    return rows || [];
  }

  static async findAll(filters = {}) {
    let query = `SELECT mr.*, so.customer, u.username as created_by_name
                 FROM material_requests mr
                 LEFT JOIN sales_orders so ON so.id = mr.sales_order_id
                 LEFT JOIN users u ON u.id = mr.created_by
                 WHERE 1=1`;
    const params = [];

    if (filters.salesOrderId) {
      query += ' AND mr.sales_order_id = ?';
      params.push(filters.salesOrderId);
    }

    if (filters.status && filters.status !== 'all') {
      query += ' AND mr.status = ?';
      params.push(filters.status);
    }

    if (filters.priority) {
      query += ' AND mr.priority = ?';
      params.push(filters.priority);
    }

    if (filters.search) {
      query += ' AND (mr.material_name LIKE ? OR mr.material_code LIKE ?)';
      const likeSearch = `%${filters.search}%`;
      params.push(likeSearch, likeSearch);
    }

    query += ' ORDER BY mr.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows || [];
  }

  static async update(id, data) {
    const updates = [];
    const params = [];

    if (data.materialName !== undefined) {
      updates.push('material_name = ?');
      params.push(data.materialName);
    }
    if (data.quantity !== undefined) {
      updates.push('quantity = ?');
      params.push(data.quantity);
    }
    if (data.specification !== undefined) {
      updates.push('specification = ?');
      params.push(data.specification);
    }
    if (data.requiredDate !== undefined) {
      updates.push('required_date = ?');
      params.push(data.requiredDate);
    }
    if (data.priority !== undefined) {
      updates.push('priority = ?');
      params.push(data.priority);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }
    if (data.remarks !== undefined) {
      updates.push('remarks = ?');
      params.push(data.remarks);
    }

    if (updates.length === 0) {
      return;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await pool.execute(
      `UPDATE material_requests SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  static async updateStatus(id, status) {
    await pool.execute(
      'UPDATE material_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM material_requests WHERE id = ?', [id]);
  }

  static async addVendor(materialRequestId, vendorId, quotedPrice, deliveryDays, notes) {
    const [result] = await pool.execute(
      `INSERT INTO material_request_vendors 
       (material_request_id, vendor_id, quoted_price, delivery_days, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [materialRequestId, vendorId, quotedPrice || null, deliveryDays || null, notes || null]
    );
    return result.insertId;
  }

  static async getVendorsForMaterial(materialRequestId) {
    const [rows] = await pool.execute(
      `SELECT mrv.*, v.name as vendor_name, v.contact, v.email
       FROM material_request_vendors mrv
       LEFT JOIN vendors v ON v.id = mrv.vendor_id
       WHERE mrv.material_request_id = ?
       ORDER BY mrv.quoted_price ASC`,
      [materialRequestId]
    );
    return rows || [];
  }

  static async selectVendor(materialRequestId, vendorId) {
    const connection = await pool.getConnection();
    
    try {
      await connection.query('START TRANSACTION');
      
      await connection.execute(
        'UPDATE material_request_vendors SET selected = FALSE WHERE material_request_id = ?',
        [materialRequestId]
      );
      
      await connection.execute(
        'UPDATE material_request_vendors SET selected = TRUE WHERE material_request_id = ? AND vendor_id = ?',
        [materialRequestId, vendorId]
      );
      
      await connection.query('COMMIT');
    } catch (error) {
      await connection.query('ROLLBACK');
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getStats() {
    const [rows] = await pool.execute(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'ordered' THEN 1 ELSE 0 END) as ordered,
        SUM(CASE WHEN status = 'received' THEN 1 ELSE 0 END) as received
      FROM material_requests
    `);
    return rows[0] || {};
  }
}

module.exports = MaterialRequest;
