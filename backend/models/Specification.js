const pool = require('../config/database');

class Specification {
  static async create(data) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO specifications (
          root_card_id, title, description, version, file_path, file_name, uploaded_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          data.rootCardId || null,
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

      if (filters.rootCardId) {
        query += ` AND s.root_card_id = ?`;
        params.push(filters.rootCardId);
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

  static async update(id, data) {
    const connection = await pool.getConnection();
    try {
      const sets = [];
      const params = [];

      if (data.title) {
        sets.push('title = ?');
        params.push(data.title);
      }
      if (data.description !== undefined) {
        sets.push('description = ?');
        params.push(data.description);
      }
      if (data.version) {
        sets.push('version = ?');
        params.push(data.version);
      }
      if (data.filePath) {
        sets.push('file_path = ?');
        params.push(data.filePath);
      }
      if (data.fileName) {
        sets.push('file_name = ?');
        params.push(data.fileName);
      }
      if (data.rootCardId) {
        sets.push('root_card_id = ?');
        params.push(data.rootCardId);
      }
      if (data.status) {
        sets.push('status = ?');
        params.push(data.status);
      }

      if (sets.length === 0) return;

      params.push(id);
      await connection.execute(
        `UPDATE specifications SET ${sets.join(', ')} WHERE id = ?`,
        params
      );
    } finally {
      connection.release();
    }
  }
}

module.exports = Specification;
