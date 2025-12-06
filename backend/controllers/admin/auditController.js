const pool = require('../../config/database');

// Get audit logs with pagination and filtering
exports.getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      user_id,
      action,
      table_name,
      start_date,
      end_date
    } = req.query;

    const offset = (page - 1) * limit;
    const connection = await pool.getConnection();

    try {
      // Build the query dynamically
      let query = `
        SELECT
          a.id,
          a.user_id,
          u.username,
          a.action,
          a.table_name,
          a.record_id,
          a.timestamp
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE 1=1
      `;

      const params = [];

      if (user_id) {
        query += ' AND a.user_id = ?';
        params.push(user_id);
      }

      if (action) {
        query += ' AND a.action = ?';
        params.push(action);
      }

      if (table_name) {
        query += ' AND a.table_name = ?';
        params.push(table_name);
      }

      if (start_date) {
        query += ' AND a.timestamp >= ?';
        params.push(start_date);
      }

      if (end_date) {
        query += ' AND a.timestamp <= ?';
        params.push(end_date);
      }

      // Get total count for pagination
      const countQuery = `SELECT COUNT(*) as total FROM (${query}) as subquery`;
      const [countResult] = await connection.execute(countQuery, params);
      const total = countResult[0].total;

      // Add ordering and pagination
      query += ' ORDER BY a.timestamp DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const [logs] = await connection.execute(query, params);

      res.json({
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get audit log statistics
exports.getAuditStats = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    try {
      // Get action statistics
      const [actionStats] = await connection.execute(`
        SELECT
          action,
          COUNT(*) as count
        FROM audit_logs
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY action
        ORDER BY count DESC
      `);

      // Get table statistics
      const [tableStats] = await connection.execute(`
        SELECT
          table_name,
          COUNT(*) as count
        FROM audit_logs
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY table_name
        ORDER BY count DESC
      `);

      // Get daily activity for the last 7 days
      const [dailyStats] = await connection.execute(`
        SELECT
          DATE(timestamp) as date,
          COUNT(*) as activities
        FROM audit_logs
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
      `);

      res.json({
        actionStats,
        tableStats,
        dailyStats
      });

    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get audit log by ID
exports.getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
      const [logs] = await connection.execute(`
        SELECT
          a.*,
          u.username
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.id = ?
      `, [id]);

      if (logs.length === 0) {
        return res.status(404).json({ message: 'Audit log not found' });
      }

      res.json({ log: logs[0] });

    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get audit log by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};