const pool = require('../config/database');

const parseJson = (value, fallback = []) => {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
};

class SalesOrder {
  static formatRow(row) {
    if (!row) {
      return null;
    }
    return {
      ...row,
      items: parseJson(row.items),
      documents: parseJson(row.documents),
      project_scope: parseJson(row.project_scope, null)
    };
  }

  static async findAll(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.status && filters.status !== 'all') {
      conditions.push('so.status = ?');
      params.push(filters.status);
    }

    if (filters.search) {
      conditions.push('(so.customer LIKE ? OR so.po_number LIKE ? OR so.notes LIKE ?)');
      const like = `%${filters.search}%`;
      params.push(like, like, like);
    }

    let query = `
      SELECT so.*, p.id AS project_id, p.name AS project_name, p.status AS project_status
      FROM sales_orders so
      LEFT JOIN projects p ON p.sales_order_id = so.id
    `;

    if (conditions.length) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY so.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows.map(SalesOrder.formatRow);
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `
        SELECT so.*, p.id AS project_id, p.name AS project_name, p.status AS project_status
        FROM sales_orders so
        LEFT JOIN projects p ON p.sales_order_id = so.id
        WHERE so.id = ?
      `,
      [id]
    );
    return SalesOrder.formatRow(rows[0]);
  }

  static async getStats() {
    const [rows] = await pool.execute(`
      SELECT
        COUNT(*) AS total_orders,
        COALESCE(SUM(total), 0) AS total_value,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_orders,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved_orders,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_orders,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered_orders
      FROM sales_orders
    `);
    return rows[0];
  }

  static async create(data, externalConnection = null) {
    const connection = externalConnection || (await pool.getConnection());

    try {
      const [result] = await connection.execute(
        `
          INSERT INTO sales_orders
          (customer, po_number, order_date, due_date, total, currency, status, priority, items, documents, notes, project_scope, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.customer,
          data.poNumber,
          data.orderDate,
          data.dueDate || null,
          data.total,
          data.currency || 'INR',
          data.status || 'pending',
          data.priority || 'medium',
          JSON.stringify(data.items || []),
          data.documents ? JSON.stringify(data.documents) : null,
          data.notes || null,
          data.projectScope ? JSON.stringify(data.projectScope) : null,
          data.createdBy || null
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

  static async update(id, data) {
    await pool.execute(
      `
        UPDATE sales_orders
        SET customer = ?, po_number = ?, order_date = ?, due_date = ?, total = ?, currency = ?, status = ?, priority = ?, items = ?, documents = ?, notes = ?, project_scope = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [
        data.customer,
        data.poNumber,
        data.orderDate,
        data.dueDate || null,
        data.total,
        data.currency || 'INR',
        data.status || 'pending',
        data.priority || 'medium',
        JSON.stringify(data.items || []),
        data.documents ? JSON.stringify(data.documents) : null,
        data.notes || null,
        data.projectScope ? JSON.stringify(data.projectScope) : null,
        id
      ]
    );
  }

  static async updateStatus(id, status) {
    await pool.execute('UPDATE sales_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
  }
}

module.exports = SalesOrder;
