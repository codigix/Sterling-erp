const pool = require('../config/database');

class Drawing {
  static async create(data) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO drawings (
          root_card_id, name, drawing_number, type, version, 
          status, remarks, file_path, format, size, uploaded_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.rootCardId,
          data.name,
          data.drawingNumber,
          data.type,
          data.version,
          data.status,
          data.remarks,
          data.filePath,
          data.format,
          data.size,
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
        SELECT d.*, rc.title as design_title, u.username as uploaded_by_name
        FROM drawings d
        LEFT JOIN root_cards rc ON d.root_card_id = rc.id
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.search) {
        query += ` AND (d.name LIKE ? OR d.drawing_number LIKE ?)`;
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      if (filters.rootCardId) {
        query += ` AND d.root_card_id = ?`;
        params.push(filters.rootCardId);
      }

      query += ` ORDER BY d.created_at DESC`;

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
        `SELECT * FROM drawings WHERE id = ?`,
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
      await connection.execute('DELETE FROM drawings WHERE id = ?', [id]);
    } finally {
      connection.release();
    }
  }
}

module.exports = Drawing;
