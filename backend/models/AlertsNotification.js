const pool = require('../config/database');
const userCache = new Map();

class AlertsNotification {
  static async resolveUserId(userId) {
    if (!userId) return null;
    
    // Check cache first
    if (userCache.has(userId)) {
      return userCache.get(userId);
    }

    let resolvedUserId = null;
    let inputStr = String(userId);
    
    try {
      // 1. If it's a number, it could be a user_id or an employee_id
      if (!isNaN(userId) && userId !== null) {
        const numericId = parseInt(userId);
        
        // Strategy: We need to be careful because IDs can overlap.
        // Let's first check if this ID exists in the employees table.
        // If it does, we should find the corresponding user_id.
        const [empRows] = await pool.execute(
          "SELECT u.id FROM users u JOIN employees e ON u.email = e.email WHERE e.id = ?", 
          [numericId]
        );
        
        if (empRows.length > 0) {
          resolvedUserId = empRows[0].id;
          console.log(`[AlertsNotification] Resolved numeric ID ${userId} as employee_id -> user_id ${resolvedUserId}`);
        } else {
          // If not an employee ID, check if it's directly a user ID
          const [userRows] = await pool.execute("SELECT id FROM users WHERE id = ?", [numericId]);
          if (userRows.length > 0) {
            resolvedUserId = userRows[0].id;
            console.log(`[AlertsNotification] Resolved numeric ID ${userId} directly as user_id`);
          }
        }
      }

      // 2. If not yet resolved, handle string formats (usernames, emails, demo-*)
      if (!resolvedUserId) {
        let usernameToFind = inputStr;
        if (usernameToFind.startsWith('demo-')) {
          usernameToFind = usernameToFind.replace('demo-', '');
        }
        
        // Try finding by username
        const [users] = await pool.execute("SELECT id FROM users WHERE username = ?", [usernameToFind]);
        if (users.length > 0) {
          resolvedUserId = users[0].id;
          console.log(`[AlertsNotification] Resolved username ${userId} to user_id ${resolvedUserId}`);
        } else {
          // Try with underscore instead of dot
          const normalizedUsername = usernameToFind.replace(/\./g, '_');
          const [users2] = await pool.execute("SELECT id FROM users WHERE username = ?", [normalizedUsername]);
          if (users2.length > 0) {
            resolvedUserId = users2[0].id;
            console.log(`[AlertsNotification] Resolved username ${userId} (normalized) to user_id ${resolvedUserId}`);
          } else {
            // Try as email
            const [users3] = await pool.execute("SELECT id FROM users WHERE email = ?", [usernameToFind]);
            if (users3.length > 0) {
              resolvedUserId = users3[0].id;
              console.log(`[AlertsNotification] Resolved email ${userId} to user_id ${resolvedUserId}`);
            }
          }
        }
      }
      
      // Cache the result if we resolved it
      if (resolvedUserId) {
        userCache.set(userId, parseInt(resolvedUserId));
      }
    } catch (err) {
      console.warn(`[AlertsNotification] Failed to resolve user ${userId}:`, err.message);
    }
    
    return resolvedUserId || userId; // Fallback to original if all else fails
  }

  static async create(data, externalConnection = null) {
    const connection = externalConnection || pool;
    
    // Resolve user IDs if they are demo strings
    const resolvedUserId = await this.resolveUserId(data.userId);
    const resolvedFromUserId = await this.resolveUserId(data.fromUserId);

    const checkQuery = `
      SELECT id FROM alerts_notifications 
      WHERE user_id = ? AND alert_type = ? AND related_id = ? AND message = ? AND is_read = FALSE
      AND created_at > DATE_SUB(NOW(), INTERVAL 30 SECOND)
      LIMIT 1
    `;
    const checkParams = [
      resolvedUserId,
      data.alertType || 'other',
      data.relatedId || null,
      data.message
    ];
    
    const [existing] = await connection.execute(checkQuery, checkParams);
    
    if (existing.length > 0) {
      console.log(`[AlertsNotification] ℹ️ Notification already exists for user ${resolvedUserId}, type ${data.alertType}, relatedId ${data.relatedId}. Skipping creation.`);
      return existing[0].id;
    }
    
    console.log(`[AlertsNotification] 🔔 Creating NEW notification for user ${resolvedUserId}`);
    const [result] = await connection.execute(
      `
        INSERT INTO alerts_notifications
        (user_id, from_user_id, alert_type, message, related_table, related_id, priority, link)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        resolvedUserId,
        resolvedFromUserId || null,
        data.alertType || 'other',
        data.message,
        data.relatedTable || null,
        data.relatedId || null,
        data.priority || 'medium',
        data.link || null
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
    let resolvedUserId = await this.resolveUserId(userId);
    
    let query = `
      SELECT an.*, u.username AS recipient_name, fu.username AS sender_name
      FROM alerts_notifications an
      LEFT JOIN users u ON u.id = an.user_id
      LEFT JOIN users fu ON fu.id = an.from_user_id
      WHERE an.user_id = ?
    `;
    const params = [resolvedUserId];

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
    let resolvedUserId = await this.resolveUserId(userId);

    await pool.execute(
      'UPDATE alerts_notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE',
      [resolvedUserId]
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
    let resolvedUserId = await this.resolveUserId(userId);

    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS unread_count FROM alerts_notifications WHERE user_id = ? AND is_read = FALSE',
      [resolvedUserId]
    );
    return rows[0].unread_count;
  }

  static async getStats(userId) {
    let resolvedUserId = await this.resolveUserId(userId);

    const [rows] = await pool.execute(
      `
        SELECT 
          COUNT(*) as total_alerts,
          SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread,
          SUM(CASE WHEN alert_type = 'task_assigned' THEN 1 ELSE 0 END) as task_assigned,
          SUM(CASE WHEN alert_type = 'status_update' THEN 1 ELSE 0 END) as status_update,
          SUM(CASE WHEN alert_type = 'delay_alert' THEN 1 ELSE 0 END) as delay_alert,
          SUM(CASE WHEN alert_type = 'material_shortage' THEN 1 ELSE 0 END) as material_shortage,
          SUM(CASE WHEN alert_type = 'quality_issue' THEN 1 ELSE 0 END) as quality_issue
        FROM alerts_notifications
        WHERE user_id = ?
      `,
      [resolvedUserId]
    );
    return rows[0];
  }
}

module.exports = AlertsNotification;
