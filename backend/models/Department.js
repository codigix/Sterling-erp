const pool = require('../config/database');

class Department {
  static async findAll() {
    const [rows] = await pool.execute(`SELECT * FROM departments WHERE status = 'active' ORDER BY name`);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(`SELECT * FROM departments WHERE id = ?`, [id]);
    return rows[0];
  }

  static async findByName(name) {
    const [rows] = await pool.execute(`SELECT * FROM departments WHERE name = ?`, [name]);
    return rows[0];
  }

  static async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO departments (name, code, description, status) VALUES (?, ?, ?, ?)`,
      [data.name, data.code || null, data.description || null, data.status || 'active']
    );
    return result.insertId;
  }

  static async update(id, data) {
    const updates = [];
    const values = [];
    if (data.name) { updates.push('name = ?'); values.push(data.name); }
    if (data.code) { updates.push('code = ?'); values.push(data.code); }
    if (data.description) { updates.push('description = ?'); values.push(data.description); }
    if (data.status) { updates.push('status = ?'); values.push(data.status); }
    updates.push('updated_at = NOW()');
    values.push(id);
    if (updates.length > 1) {
      await pool.execute(`UPDATE departments SET ${updates.join(', ')} WHERE id = ?`, values);
    }
  }

  static async delete(id) {
    await pool.execute('DELETE FROM departments WHERE id = ?', [id]);
  }
}

module.exports = Department;
