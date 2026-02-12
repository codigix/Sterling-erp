const pool = require('../config/database');

class Warehouse {
  static async findAll() {
    const [rows] = await pool.execute(`SELECT * FROM warehouses WHERE is_active = TRUE ORDER BY name`);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(`SELECT * FROM warehouses WHERE id = ?`, [id]);
    return rows[0];
  }

  static async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO warehouses (name, code, type, department, location, storage_capacity, parent_warehouse_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name, 
        data.code, 
        data.type || null,
        data.department || null,
        data.location || null, 
        data.storage_capacity || null,
        data.parent_warehouse_id || null,
        data.is_active !== undefined ? data.is_active : true
      ]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const fields = ['name', 'code', 'type', 'department', 'location', 'storage_capacity', 'parent_warehouse_id', 'is_active'];
    const updates = [];
    const values = [];

    fields.forEach(field => {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(data[field]);
      }
    });

    if (updates.length === 0) return;

    values.push(id);
    await pool.execute(
      `UPDATE warehouses SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM warehouses WHERE id = ?', [id]);
  }
}

module.exports = Warehouse;
