const pool = require('../config/database');

class CompanyUpdate {
  static async findAll(filters = {}) {
    let query = `SELECT * FROM company_updates WHERE 1=1`;
    const params = [];

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.priority) {
      query += ' AND priority = ?';
      params.push(filters.priority);
    }

    if (filters.limit) {
      query += ` ORDER BY created_at DESC LIMIT ?`;
      params.push(filters.limit);
    } else {
      query += ' ORDER BY created_at DESC LIMIT 50';
    }

    const [rows] = await pool.execute(query, params);
    return rows || [];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM company_updates WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create(title, description, author, priority = 'medium', category = 'General') {
    const [result] = await pool.execute(
      `INSERT INTO company_updates (title, description, author, priority, category, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [title, description, author, priority, category]
    );
    return result.insertId;
  }

  static async update(id, title, description, author, priority, category) {
    await pool.execute(
      `UPDATE company_updates 
       SET title = ?, description = ?, author = ?, priority = ?, category = ?, updated_at = NOW()
       WHERE id = ?`,
      [title, description, author, priority, category, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM company_updates WHERE id = ?', [id]);
  }

  static async getRecent(limit = 10) {
    const [rows] = await pool.execute(
      `SELECT * FROM company_updates 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [limit]
    );
    return rows || [];
  }

  static async getByCategory(category, limit = 10) {
    const [rows] = await pool.execute(
      `SELECT * FROM company_updates 
       WHERE category = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [category, limit]
    );
    return rows || [];
  }
}

module.exports = CompanyUpdate;
