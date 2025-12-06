const pool = require('../config/database');

class AlertsNotification {
  static async create(data) {
    const [result] = await pool.execute(
      `
        INSERT INTO alerts_notifications
        (user_id, from_user_id, alert_type, message, related_table, related_id, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.userId,
        data.fromUserId || null,
        data.alertType || 'other',
        data.message,
        data.relatedTable || null,
        data.relatedId || null,
        data.priority || 'medium'
      ]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `
        SELECT an.*, u.username AS recipient_name, fu.username AS sender_name
        FROM alerts_notifications an
        LEFT JOIN users u ON u.id = an.user_id
        LEFT JOIN users fu ON fu.id = an.from_user_id
        WHERE an.id = ?
      `,
      [id]
    );
    return rows[0];
  }

  static async findByUserId(userId, filters = {}) {
    let query = `
      SELECT an.*, u.username AS recipient_name, fu.username AS sender_name
      FROM alerts_notifications an
      LEFT JOIN users u ON u.id = an.user_id
      LEFT JOIN users fu ON fu.id = an.from_user_id
      WHERE an.user_id = ?
    `;
    const params = [userId];

    if (filters.isRead !== undefined) {
      query += ' AND an.is_read = ?';
      params.push(filters.isRead);
    }

    if (filters.alertType && filters.alertType !== 'all') {
      query += ' AND an.alert_type = ?';
      params.push(filters.alertType);
    }

    if (filters.priority && filters.priority !== 'all') {
      query += ' AND an.priority = ?';
      params.push(filters.priority);
    }

    query += ' ORDER BY an.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const [rows] = await pool.execute(query, params);
    return rows || [];
  }

  static async markAsRead(id) {
    await pool.execute(
      'UPDATE alerts_notifications SET is_read = TRUE, read_at = NOW() WHERE id = ?',
      [id]
    );
  }

  static async markAllAsRead(userId) {
    await pool.execute(
      'UPDATE alerts_notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM alerts_notifications WHERE id = ?', [id]);
  }

  static async deleteOldAlerts(daysOld = 30) {
    await pool.execute(
      'DELETE FROM alerts_notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
      [daysOld]
    );
  }

  static async getUnreadCount(userId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS unread_count FROM alerts_notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    return rows[0].unread_count;
  }

  static async getStats(userId) {
    const [rows] = await pool.execute(
      `
        SELECT 
          COUNT(*) as total_alerts,
          SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread,
          SUM(CASE WHEN alert_type = 'task_blocked' THEN 1 ELSE 0 END) as task_blocked,
          SUM(CASE WHEN alert_type = 'status_update' THEN 1 ELSE 0 END) as status_update,
          SUM(CASE WHEN alert_type = 'delay_alert' THEN 1 ELSE 0 END) as delay_alert,
          SUM(CASE WHEN alert_type = 'material_shortage' THEN 1 ELSE 0 END) as material_shortage,
          SUM(CASE WHEN alert_type = 'quality_issue' THEN 1 ELSE 0 END) as quality_issue
        FROM alerts_notifications
        WHERE user_id = ?
      `,
      [userId]
    );
    return rows[0];
  }
}

module.exports = AlertsNotification;
