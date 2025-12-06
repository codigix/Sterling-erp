const pool = require('../config/database');

class Material {
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
    return rows || [];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM inventory WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByItemCode(itemCode) {
    const [rows] = await pool.execute(
      'SELECT * FROM inventory WHERE item_code = ?',
      [itemCode]
    );
    return rows[0];
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
    return rows || [];
  }
}

module.exports = Material;
