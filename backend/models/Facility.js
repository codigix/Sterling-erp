const pool = require('../config/database');

const parseJson = (value, fallback = null) => {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
};

class Facility {
  static async create(data) {
    const [result] = await pool.execute(
      `
        INSERT INTO facilities (name, location, capacity, equipment, status)
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        data.name,
        data.location || null,
        data.capacity || null,
        data.equipment ? JSON.stringify(data.equipment) : null,
        data.status || 'active'
      ]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM facilities WHERE id = ?',
      [id]
    );
    if (rows[0]) {
      return {
        ...rows[0],
        equipment: parseJson(rows[0].equipment)
      };
    }
    return null;
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM facilities WHERE 1=1';
    const params = [];

    if (filters.status && filters.status !== 'all') {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR location LIKE ?)';
      const like = `%${filters.search}%`;
      params.push(like, like);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    return (rows || []).map(row => ({
      ...row,
      equipment: parseJson(row.equipment)
    }));
  }

  static async update(id, data) {
    await pool.execute(
      `
        UPDATE facilities
        SET name = ?, location = ?, capacity = ?, equipment = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [
        data.name,
        data.location || null,
        data.capacity || null,
        data.equipment ? JSON.stringify(data.equipment) : null,
        data.status,
        id
      ]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM facilities WHERE id = ?', [id]);
  }

  static async getAvailableFacilities() {
    const [rows] = await pool.execute(
      'SELECT * FROM facilities WHERE status = "active" ORDER BY name ASC'
    );
    return (rows || []).map(row => ({
      ...row,
      equipment: parseJson(row.equipment)
    }));
  }
}

module.exports = Facility;
