const pool = require('../config/database');

class SalesManagement {
  static async create(data) {
    const {
      rootCardId,
      bomId,
      soNumber,
      customerId,
      customerName,
      warehouseId,
      quantity,
      unitPrice,
      taxPercent,
      discount,
      status,
      orderDate,
      deliveryDate,
      notes,
      createdBy
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO sales_orders_management 
      (root_card_id, bom_id, so_number, customer_id, customer_name, warehouse_id, quantity, unit_price, tax_percent, discount, status, order_date, delivery_date, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [rootCardId || null, bomId, soNumber, customerId || null, customerName || null, warehouseId || null, quantity, unitPrice || 0, taxPercent || 18, discount || 0, status || 'Pending', orderDate, deliveryDate, notes, createdBy]
    );

    return result.insertId;
  }

  static async generateNextSONumber() {
    const year = new Date().getFullYear();
    const prefix = `SO-${year}-`;
    
    const [rows] = await pool.execute(
      `SELECT so_number FROM sales_orders_management 
       WHERE so_number LIKE ? 
       ORDER BY so_number DESC LIMIT 1`,
      [`${prefix}%`]
    );

    let nextNumber = 1;
    if (rows.length > 0) {
      const lastNumber = parseInt(rows[0].so_number.split('-').pop());
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  static async getAll() {
    const [rows] = await pool.execute(
      `SELECT so.*, bom.product_name, bom.item_code, 
              COALESCE(so.customer_name, c.name) as customer_name, w.name as warehouse_name,
              rc.po_number as root_card_code, rc.project_name as root_card_title,
              u.username as created_by_name
       FROM sales_orders_management so
       LEFT JOIN bill_of_materials bom ON so.bom_id = bom.id
       LEFT JOIN customers c ON so.customer_id = c.id
       LEFT JOIN warehouses w ON so.warehouse_id = w.id
       LEFT JOIN sales_orders rc ON so.root_card_id = rc.id
       LEFT JOIN users u ON so.created_by = u.id
       ORDER BY so.created_at DESC`
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT so.*, bom.product_name, bom.item_code, 
              COALESCE(so.customer_name, c.name) as customer_name, w.name as warehouse_name,
              rc.po_number as root_card_code, rc.project_name as root_card_title,
              u.username as created_by_name
       FROM sales_orders_management so
       LEFT JOIN bill_of_materials bom ON so.bom_id = bom.id
       LEFT JOIN customers c ON so.customer_id = c.id
       LEFT JOIN warehouses w ON so.warehouse_id = w.id
       LEFT JOIN sales_orders rc ON so.root_card_id = rc.id
       LEFT JOIN users u ON so.created_by = u.id
       WHERE so.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async update(id, data) {
    const {
      rootCardId,
      bomId,
      soNumber,
      customerId,
      customerName,
      warehouseId,
      quantity,
      unitPrice,
      taxPercent,
      discount,
      status,
      orderDate,
      deliveryDate,
      notes
    } = data;

    await pool.execute(
      `UPDATE sales_orders_management SET 
        root_card_id = ?, 
        bom_id = ?, 
        so_number = ?, 
        customer_id = ?, 
        customer_name = ?,
        warehouse_id = ?, 
        quantity = ?, 
        unit_price = ?, 
        tax_percent = ?, 
        discount = ?, 
        status = ?, 
        order_date = ?, 
        delivery_date = ?, 
        notes = ?
      WHERE id = ?`,
      [rootCardId || null, bomId, soNumber, customerId || null, customerName || null, warehouseId || null, quantity, unitPrice || 0, taxPercent || 18, discount || 0, status || 'Pending', orderDate, deliveryDate, notes, id]
    );
  }

  static async updateStatus(id, status) {
    await pool.execute(
      'UPDATE sales_orders_management SET status = ? WHERE id = ?',
      [status, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM sales_orders_management WHERE id = ?', [id]);
  }
}

module.exports = SalesManagement;
