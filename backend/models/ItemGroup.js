const pool = require('../config/database');

class ItemGroup {
  static formatRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  static async findAll() {
    const [rows] = await pool.execute('SELECT * FROM item_groups ORDER BY name ASC');
    return (rows || []).map(ItemGroup.formatRow);
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM item_groups WHERE id = ?',
      [id]
    );
    return ItemGroup.formatRow(rows[0]);
  }

  static async create(data) {
    const { name, description } = data;
    const [result] = await pool.execute(
      'INSERT INTO item_groups (name, description) VALUES (?, ?)',
      [name, description]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const { name, description } = data;
    await pool.execute(
      'UPDATE item_groups SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM item_groups WHERE id = ?', [id]);
  }
}

module.exports = ItemGroup;
