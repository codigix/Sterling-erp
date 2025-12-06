const pool = require('../config/database');

class Role {
  static async findAll() {
    const [rows] = await pool.execute('SELECT * FROM roles');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM roles WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByName(name) {
    const [rows] = await pool.execute('SELECT * FROM roles WHERE name = ?', [name]);
    return rows[0];
  }

  static async create(name, permissions) {
    const [result] = await pool.execute(
      'INSERT INTO roles (name, permissions) VALUES (?, ?)',
      [name, JSON.stringify(permissions)]
    );
    return result.insertId;
  }

  static async update(id, name, permissions) {
    await pool.execute(
      'UPDATE roles SET name = ?, permissions = ? WHERE id = ?',
      [name, JSON.stringify(permissions), id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM roles WHERE id = ?', [id]);
  }
}

module.exports = Role;