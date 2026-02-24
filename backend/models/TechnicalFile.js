const pool = require('../config/database');

class TechnicalFile {
  static async create(data) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO technical_files (
          root_card_id, name, category, description, file_path, file_name, uploaded_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          data.rootCardId || null,
          data.name,
          data.category,
          data.description,
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
        SELECT t.*, u.username as uploaded_by_name
        FROM technical_files t
        LEFT JOIN users u ON t.uploaded_by = u.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.search) {
        query += ` AND t.name LIKE ?`;
        params.push(`%${filters.search}%`);
      }

      if (filters.category && filters.category !== 'all') {
        query += ` AND t.category = ?`;
        params.push(filters.category);
      }

      if (filters.rootCardId) {
        query += ` AND t.root_card_id = ?`;
        params.push(filters.rootCardId);
      }

      query += ` ORDER BY t.created_at DESC`;

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
        `SELECT * FROM technical_files WHERE id = ?`,
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
      await connection.execute('DELETE FROM technical_files WHERE id = ?', [id]);
    } finally {
      connection.release();
    }
  }
}

module.exports = TechnicalFile;
