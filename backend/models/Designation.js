const pool = require('../config/database');

class Designation {
  static async findAll() {
    const [rows] = await pool.execute(`
      SELECT * FROM designations 
      WHERE status = 'active'
      ORDER BY name ASC`);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM designations WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const [result] = await pool.execute(
      'INSERT INTO designations (name, description, status) VALUES (?, ?, ?)',
      [data.name, data.description || null, 'active']
    );
    return result.insertId;
  }

  static async update(id, data) {
    const updates = [];
    const values = [];
    
    if (data.name) { updates.push('name = ?'); values.push(data.name); }
    if (data.description !== undefined) { updates.push('description = ?'); values.push(data.description); }
    if (data.status) { updates.push('status = ?'); values.push(data.status); }
    
    updates.push('updated_at = NOW()');
    values.push(id);
    
    if (updates.length > 1) {
      await pool.execute(
        `UPDATE designations SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }
  }

  static async delete(id) {
    await pool.execute('DELETE FROM designations WHERE id = ?', [id]);
  }

  static async setStatus(id, status) {
    await pool.execute(
      'UPDATE designations SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
  }
}

module.exports = Designation;
