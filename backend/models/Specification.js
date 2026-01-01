const pool = require('../config/database');

class Specification {
  static async create(data) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO specifications (
          title, description, version, file_path, file_name, uploaded_by
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.title,
          data.description,
          data.version,
          data.filePath,
          data.fileName,
          data.uploadedBy
        ]
      );
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  static async findAll(filters = {}) {
    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT s.*, u.username as uploaded_by_name
        FROM specifications s
        LEFT JOIN users u ON s.uploaded_by = u.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.search) {
        query += ` AND s.title LIKE ?`;
        params.push(`%${filters.search}%`);
      }

      query += ` ORDER BY s.created_at DESC`;

      const [rows] = await connection.execute(query, params);
      return rows;
    } finally {
      connection.release();
    }
  }

  static async findById(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM specifications WHERE id = ?`,
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const connection = await pool.getConnection();
    try {
      await connection.execute('DELETE FROM specifications WHERE id = ?', [id]);
    } finally {
      connection.release();
    }
  }
}

module.exports = Specification;
