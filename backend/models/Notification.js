const pool = require('../config/database');

class Notification {
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];

    if (filters.userId) {
      query += ' AND user_id = ?';
      params.push(filters.userId);
    }

    if (filters.readOnly !== undefined) {
      query += ' AND read_status = ?';
      params.push(filters.readOnly ? 1 : 0);
    }

    if (filters.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    query += ' ORDER BY created_at DESC LIMIT 100';

    const [rows] = await pool.execute(query, params);
    return rows || [];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM notifications WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create(data) {
    const { userId, message, type = 'info', relatedId = null, relatedType = null } = data;
    const [result] = await pool.execute(
      `INSERT INTO notifications (user_id, message, type, related_id, related_type, read_status)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [userId, message, type, relatedId, relatedType]
    );
    return result.insertId;
  }

  static async markAsRead(id) {
    await pool.execute(
      'UPDATE notifications SET read_status = 1 WHERE id = ?',
      [id]
    );
  }

  static async markAllAsRead(userId) {
    await pool.execute(
      'UPDATE notifications SET read_status = 1 WHERE user_id = ?',
      [userId]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM notifications WHERE id = ?', [id]);
  }

  static async getUnreadCount(userId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_status = 0',
      [userId]
    );
    return rows[0].count;
  }
}

module.exports = Notification;
