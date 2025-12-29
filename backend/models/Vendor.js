const pool = require('../config/database');

class Vendor {
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM vendors WHERE 1=1';
    const params = [];

    if (filters.search) {
      query += ' AND (name LIKE ? OR category LIKE ? OR email LIKE ? OR address LIKE ?)';
      const likeSearch = `%${filters.search}%`;
      params.push(likeSearch, likeSearch, likeSearch, likeSearch);
    }

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.vendor_type) {
      query += ' AND vendor_type = ?';
      params.push(filters.vendor_type);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.minRating) {
      query += ' AND rating >= ?';
      params.push(filters.minRating);
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
      `INSERT INTO vendors (name, contact, email, address, phone, category, vendor_type, rating, status, total_orders, total_value, last_order_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        data.name,
        data.contact || null,
        data.email || null,
        data.address || null,
        data.phone || null,
        data.category || null,
        data.vendor_type || 'material_supplier',
        data.rating || 0,
        data.status || 'active',
        data.total_orders || 0,
        data.total_value || 0,
        data.last_order_date || null
      ]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const updates = [];
    const params = [];

    const fields = ['name', 'contact', 'email', 'address', 'phone', 'category', 'vendor_type', 'rating', 'status', 'total_orders', 'total_value', 'last_order_date'];
    
    for (const field of fields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(data[field]);
      }
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
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
        AVG(rating) as avg_rating,
        SUM(total_orders) as total_orders_sum
      FROM vendors
    `);
    return rows[0] || {};
  }

  static async getCategories() {
    const [rows] = await pool.execute(`
      SELECT DISTINCT category FROM vendors WHERE category IS NOT NULL ORDER BY category
    `);
    return rows || [];
  }
}

module.exports = Vendor;
