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
      project_scope: parseJson(row.project_scope, null),
      design_details: parseJson(row.design_details, null)
    };
  }

  static async findAll(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.status && filters.status !== 'all') {
      conditions.push('status = ?');
      params.push(filters.status);
    }

    if (filters.search) {
      conditions.push('(customer LIKE ? OR po_number LIKE ? OR project_name LIKE ? OR notes LIKE ?)');
      const like = `%${filters.search}%`;
      params.push(like, like, like, like);
    }

    let query = 'SELECT * FROM sales_orders';

    if (conditions.length) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    const formattedOrders = rows.map(SalesOrder.formatRow);
    
    const includeSteps = filters.includeSteps !== false;
    if (includeSteps) {
      return Promise.all(formattedOrders.map(order => SalesOrder.enrichOrderWithSteps(order)));
    }
    return formattedOrders;
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM sales_orders WHERE id = ?', [id]);
    const order = SalesOrder.formatRow(rows[0]);
    if (!order) return null;
    return SalesOrder.enrichOrderWithSteps(order);
  }

  static async enrichOrderWithSteps(order) {
    try {
      const [clientPO] = await pool.execute(
        'SELECT * FROM client_po_details WHERE sales_order_id = ?',
        [order.id]
      );
      const [salesDetail] = await pool.execute(
        'SELECT * FROM sales_order_details WHERE sales_order_id = ?',
        [order.id]
      );
      const [design] = await pool.execute(
        'SELECT * FROM design_engineering_details WHERE sales_order_id = ?',
        [order.id]
      );
      const [materials] = await pool.execute(
        'SELECT * FROM material_requirements_details WHERE sales_order_id = ?',
        [order.id]
      );
      const [production] = await pool.execute(
        'SELECT * FROM production_plan_details WHERE sales_order_id = ?',
        [order.id]
      );
      const [quality] = await pool.execute(
        'SELECT * FROM quality_check_details WHERE sales_order_id = ?',
        [order.id]
      );
      const [shipment] = await pool.execute(
        'SELECT * FROM shipment_details WHERE sales_order_id = ?',
        [order.id]
      );
      const [delivery] = await pool.execute(
        'SELECT * FROM delivery_details WHERE sales_order_id = ?',
        [order.id]
      );

      return {
        ...order,
        steps: {
          step1_clientPO: clientPO[0] ? SalesOrder.parseStepData(clientPO[0]) : null,
          step2_salesOrder: salesDetail[0] ? SalesOrder.parseStepData(salesDetail[0]) : null,
          step3_design: design[0] ? SalesOrder.parseStepData(design[0]) : null,
          step4_materials: materials[0] ? SalesOrder.parseStepData(materials[0]) : null,
          step5_production: production[0] ? SalesOrder.parseStepData(production[0]) : null,
          step6_quality: quality[0] ? SalesOrder.parseStepData(quality[0]) : null,
          step7_shipment: shipment[0] ? SalesOrder.parseStepData(shipment[0]) : null,
          step8_delivery: delivery[0] ? SalesOrder.parseStepData(delivery[0]) : null
        }
      };
    } catch (error) {
      console.error('Error enriching order with steps:', error);
      return {
        ...order,
        steps: {
          step1_clientPO: null,
          step2_salesOrder: null,
          step3_design: null,
          step4_materials: null,
          step5_production: null,
          step6_quality: null,
          step7_shipment: null,
          step8_delivery: null
        }
      };
    }
  }

  static parseStepData(row) {
    if (!row) return null;
    const parsed = { ...row };
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string') {
        try {
          parsed[key] = JSON.parse(value);
        } catch (e) {
          // Keep as string if not JSON
        }
      }
    }
    return parsed;
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
      const projectNameValue = (data.projectName && data.projectName.trim()) ? data.projectName : `${data.customer}-${data.poNumber}`;
      const projectScopeValue = (data.projectScope && Object.values(data.projectScope).some(v => v)) ? data.projectScope : { application: '', dimensions: '', specifications: '' };

      const [result] = await connection.execute(
        `
          INSERT INTO sales_orders
          (customer, po_number, order_date, due_date, total, currency, status, priority, items, documents, notes, project_scope, project_name, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          JSON.stringify(projectScopeValue),
          projectNameValue,
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
    const updates = {};

    if (data.customer !== undefined && data.customer !== null) updates.customer = data.customer;
    if (data.poNumber !== undefined && data.poNumber !== null) updates.po_number = data.poNumber;
    if (data.orderDate !== undefined && data.orderDate !== null) updates.order_date = data.orderDate;
    if (data.dueDate !== undefined) updates.due_date = data.dueDate || null;
    if (data.total !== undefined && data.total !== null) updates.total = data.total;
    if (data.currency !== undefined) updates.currency = data.currency || 'INR';
    if (data.status !== undefined && data.status !== null) updates.status = data.status;
    if (data.priority !== undefined) updates.priority = data.priority || 'medium';
    if (data.items !== undefined) updates.items = JSON.stringify(data.items || []);
    if (data.documents !== undefined) updates.documents = data.documents ? JSON.stringify(data.documents) : null;
    if (data.notes !== undefined) updates.notes = data.notes || null;
    if (data.projectScope !== undefined && data.projectScope !== null) {
      const projectScopeValue = (data.projectScope && Object.values(data.projectScope).some(v => v)) ? data.projectScope : { application: '', dimensions: '', specifications: '' };
      updates.project_scope = JSON.stringify(projectScopeValue);
    }
    if (data.projectName !== undefined && data.projectName !== null) updates.project_name = data.projectName;

    updates.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);

    await pool.execute(
      `UPDATE sales_orders SET ${setClause} WHERE id = ?`,
      values
    );
  }

  static async updateStatus(id, status) {
    await pool.execute('UPDATE sales_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
  }
}

module.exports = SalesOrder;
