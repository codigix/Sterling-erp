const pool = require('../config/database');

class ProductionPhaseMaster {
  static async create(data) {
    const { name, description, hourlyRate = 0, isDefault = false } = data;
    const [result] = await pool.execute(
      'INSERT INTO production_phase_master (name, description, hourly_rate, is_default) VALUES (?, ?, ?, ?)',
      [name, description || null, hourlyRate, isDefault]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await pool.execute('SELECT * FROM production_phase_master ORDER BY name ASC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM production_phase_master WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findByName(name) {
    const [rows] = await pool.execute('SELECT * FROM production_phase_master WHERE name = ?', [name]);
    return rows[0] || null;
  }

  static async update(id, data) {
    const { name, description, hourlyRate = 0, isDefault } = data;
    await pool.execute(
      'UPDATE production_phase_master SET name = ?, description = ?, hourly_rate = ?, is_default = ? WHERE id = ?',
      [name, description || null, hourlyRate, isDefault, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM production_phase_master WHERE id = ?', [id]);
  }
}

module.exports = ProductionPhaseMaster;
