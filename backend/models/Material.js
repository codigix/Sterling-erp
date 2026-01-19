const pool = require('../config/database');

class Material {
  static formatRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      itemCode: row.item_code,
      itemName: row.item_name,
      batch: row.batch,
      specification: row.specification,
      unit: row.unit,
      category: row.category,
      quantity: row.quantity,
      reorderLevel: row.reorder_level,
      location: row.location,
      vendorId: row.vendor_id,
      unitCost: row.unit_cost,
      warehouse: row.warehouse,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM inventory WHERE 1=1';
    const params = [];

    if (filters.itemCode) {
      query += ' AND item_code LIKE ?';
      params.push(`%${filters.itemCode}%`);
    }

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.belowReorderLevel) {
      query += ' AND quantity < reorder_level';
    }

    const [rows] = await pool.execute(query, params);
    return (rows || []).map(Material.formatRow);
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM inventory WHERE id = ?',
      [id]
    );
    return Material.formatRow(rows[0]);
  }

  static async findByItemCode(itemCode) {
    const [rows] = await pool.execute(
      'SELECT * FROM inventory WHERE item_code = ?',
      [itemCode]
    );
    return Material.formatRow(rows[0]);
  }

  static async findByName(itemName) {
    const [rows] = await pool.execute(
      'SELECT * FROM inventory WHERE item_name = ?',
      [itemName]
    );
    return Material.formatRow(rows[0]);
  }

  static async create(data) {
    const { itemCode, itemName, batch, specification, unit, category, quantity, reorderLevel, location, vendorId, unitCost } = data;
    const [result] = await pool.execute(
      `INSERT INTO inventory (item_code, item_name, batch, specification, unit, category, quantity, reorder_level, location, vendor_id, unit_cost)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [itemCode, itemName, batch, specification, unit, category, quantity, reorderLevel, location, vendorId, unitCost]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const { itemName, batch, specification, unit, category, quantity, reorderLevel, location, vendorId, unitCost } = data;
    await pool.execute(
      `UPDATE inventory SET item_name = ?, batch = ?, specification = ?, unit = ?, category = ?, quantity = ?, 
       reorder_level = ?, location = ?, vendor_id = ?, unit_cost = ? WHERE id = ?`,
      [itemName, batch, specification, unit, category, quantity, reorderLevel, location, vendorId, unitCost, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM inventory WHERE id = ?', [id]);
  }

  static async updateQuantity(id, quantity) {
    await pool.execute(
      'UPDATE inventory SET quantity = ? WHERE id = ?',
      [quantity, id]
    );
  }

  static async checkReorderLevels() {
    const [rows] = await pool.execute(
      'SELECT * FROM inventory WHERE quantity < reorder_level'
    );
    return (rows || []).map(Material.formatRow);
  }
}

module.exports = Material;
