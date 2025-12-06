const pool = require('../config/database');

class Vendor {
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM vendors WHERE 1=1';
    const params = [];

    if (filters.search) {
      query += ' AND (name LIKE ? OR contact LIKE ? OR email LIKE ?)';
      const likeSearch = `%${filters.search}%`;
      params.push(likeSearch, likeSearch, likeSearch);
    }

    query += ' ORDER BY name ASC';

    const [rows] = await pool.execute(query, params);
    return rows || [];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM vendors WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO vendors (name, contact, email, address, phone, created_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        data.name,
        data.contact || null,
        data.email || null,
        data.address || null,
        data.phone || null
      ]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const updates = [];
    const params = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(data.name);
    }
    if (data.contact !== undefined) {
      updates.push('contact = ?');
      params.push(data.contact);
    }
    if (data.email !== undefined) {
      updates.push('email = ?');
      params.push(data.email);
    }
    if (data.address !== undefined) {
      updates.push('address = ?');
      params.push(data.address);
    }
    if (data.phone !== undefined) {
      updates.push('phone = ?');
      params.push(data.phone);
    }

    if (updates.length === 0) {
      return;
    }

    params.push(id);

    await pool.execute(
      `UPDATE vendors SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM vendors WHERE id = ?', [id]);
  }

  static async getStats() {
    const [rows] = await pool.execute(`
      SELECT COUNT(*) as total FROM vendors
    `);
    return rows[0] || {};
  }
}

module.exports = Vendor;
