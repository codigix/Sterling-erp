const pool = require('../config/database');

class MaterialRequest {
  static async generateMRNumber() {
    try {
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const [rows] = await pool.execute(
        "SELECT count(*) as count FROM material_requests WHERE mr_number LIKE ?",
        [`MR-${dateStr}-%`]
      );
      const count = (rows[0].count + 1).toString().padStart(3, '0');
      return `MR-${dateStr}-${count}`;
    } catch (e) {
      return `MR-${Date.now()}`;
    }
  }

  static async create(data, connection = null) {
    const conn = connection || (await pool.getConnection());
    let shouldCommit = false;
    
    try {
      if (!connection) {
        await conn.query('START TRANSACTION');
        shouldCommit = true;
      }

      const mrNumber = data.mrNumber || await this.generateMRNumber();

      // Validate sales_order_id existence
      let salesOrderId = data.rootCardId || null;
      if (salesOrderId) {
        const [soRows] = await conn.execute('SELECT id FROM sales_orders WHERE id = ?', [salesOrderId]);
        if (soRows.length === 0) {
          console.warn(`Sales Order ID ${salesOrderId} not found, setting to NULL`);
          salesOrderId = null;
        }
      }

      // 1. Insert Header
      const [headerResult] = await conn.execute(
        `INSERT INTO material_requests 
         (mr_number, sales_order_id, production_plan_id, department, purpose, 
          target_warehouse_id, priority, status, created_by, requested_by, remarks, required_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          mrNumber,
          salesOrderId,
          data.productionPlanId || null,
          data.department || 'Production',
          data.purpose || 'Material Issue',
          data.targetWarehouseId || null,
          data.priority || 'medium',
          data.status || 'draft',
          data.createdBy || null,
          data.requestedBy || data.createdBy || null,
          data.remarks || null,
          (data.requiredDate && data.requiredDate !== '') ? data.requiredDate : null
        ]
      );

      const materialRequestId = headerResult.insertId;

      // 2. Insert Items
      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          await conn.execute(
            `INSERT INTO material_request_items 
             (material_request_id, material_name, material_code, quantity, unit, specification, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              materialRequestId,
              item.materialName,
              item.materialCode || null,
              item.quantity,
              item.unit || 'Nos',
              item.specification || null,
              item.status || 'pending'
            ]
          );
        }
      }

      if (shouldCommit) {
        await conn.query('COMMIT');
      }

      if (!connection) {
        conn.release();
      }

      return materialRequestId;
    } catch (error) {
      if (shouldCommit) {
        await conn.query('ROLLBACK');
      }
      if (!connection) {
        conn.release();
      }
      throw error;
    }
  }

  static async bulkCreate(requests, connection = null) {
    const results = [];
    for (const req of requests) {
      const id = await this.create(req, connection);
      results.push(id);
    }
    return results;
  }

  static async findById(id) {
    // Get Header
    const [rows] = await pool.execute(
      `SELECT mr.*, so.customer, u.username as created_by_name, 
              ru.username as requested_by_name,
              pp.plan_name as production_plan_name,
              w.name as warehouse_name,
              (SELECT COUNT(*) FROM quotations WHERE material_request_id = mr.id AND type = 'outbound') as rfq_count,
              (SELECT COUNT(*) FROM quotations WHERE material_request_id = mr.id AND type = 'inbound' AND status = 'approved') as approved_quotation_count,
              (SELECT id FROM quotations WHERE material_request_id = mr.id AND type = 'inbound' AND status = 'approved' LIMIT 1) as approved_quotation_id
       FROM material_requests mr
       LEFT JOIN sales_orders so ON so.id = mr.sales_order_id
       LEFT JOIN users u ON u.id = mr.created_by
       LEFT JOIN users ru ON ru.id = mr.requested_by
       LEFT JOIN production_plans pp ON pp.id = mr.production_plan_id
       LEFT JOIN warehouses w ON w.id = mr.target_warehouse_id
       WHERE mr.id = ?`,
      [id]
    );

    if (rows.length === 0) return null;

    const header = rows[0];

    // Get Items
    const [itemRows] = await pool.execute(
      `SELECT * FROM material_request_items WHERE material_request_id = ?`,
      [id]
    );

    header.items = itemRows;
    return header;
  }

  static async findAll(filters = {}) {
    let query = `SELECT mr.*, so.customer, u.username as created_by_name, 
                        pp.plan_name as production_plan_name,
                        w.name as warehouse_name
                 FROM material_requests mr
                 LEFT JOIN sales_orders so ON so.id = mr.sales_order_id
                 LEFT JOIN users u ON u.id = mr.created_by
                 LEFT JOIN production_plans pp ON pp.id = mr.production_plan_id
                 LEFT JOIN warehouses w ON w.id = mr.target_warehouse_id
                 WHERE 1=1`;
    const params = [];

    if (filters.rootCardId) {
      query += ' AND mr.sales_order_id = ?';
      params.push(filters.rootCardId);
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
      query += ' AND (mr.mr_number LIKE ? OR mr.department LIKE ?)';
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

    const fields = [
      'status', 'priority', 'remarks', 'required_date', 
      'target_warehouse_id', 'purpose', 'department'
    ];

    for (const field of fields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(data[field]);
      }
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

  static async getStats() {
    const [rows] = await pool.execute(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
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
