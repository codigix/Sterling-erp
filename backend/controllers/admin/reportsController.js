const pool = require('../../config/database');

// Get system statistics for dashboard
exports.getSystemStats = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    try {
      // Get user statistics
      const [userStats] = await connection.execute(`
        SELECT
          COUNT(*) as total_users,
          SUM(CASE WHEN r.name = 'Admin' THEN 1 ELSE 0 END) as admin_users,
          SUM(CASE WHEN r.name = 'Management' THEN 1 ELSE 0 END) as management_users,
          SUM(CASE WHEN r.name = 'Sales' THEN 1 ELSE 0 END) as sales_users,
          SUM(CASE WHEN r.name = 'Engineering' THEN 1 ELSE 0 END) as engineering_users,
          SUM(CASE WHEN r.name = 'Procurement' THEN 1 ELSE 0 END) as procurement_users,
          SUM(CASE WHEN r.name = 'QC' THEN 1 ELSE 0 END) as qc_users,
          SUM(CASE WHEN r.name = 'Inventory' THEN 1 ELSE 0 END) as inventory_users,
          SUM(CASE WHEN r.name = 'Production Supervisor' THEN 1 ELSE 0 END) as production_users,
          SUM(CASE WHEN r.name = 'Worker' THEN 1 ELSE 0 END) as worker_users
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
      `);

      // Get project statistics
      const [projectStats] = await connection.execute(`
        SELECT
          COUNT(*) as total_projects,
          SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_projects,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_projects,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_projects,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_projects
        FROM projects
      `);

      // Get sales orders statistics
      const [salesStats] = await connection.execute(`
        SELECT
          COUNT(*) as total_orders,
          SUM(total) as total_value,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_orders,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders
        FROM sales_orders
      `);

      // Get inventory statistics
      const [inventoryStats] = await connection.execute(`
        SELECT
          COUNT(*) as total_items,
          SUM(quantity) as total_quantity,
          COUNT(DISTINCT batch) as total_batches,
          COUNT(DISTINCT rack) as total_racks
        FROM inventory
      `);

      // Get recent activity (last 30 days)
      const [recentActivity] = await connection.execute(`
        SELECT
          COUNT(*) as total_activities,
          DATE(created_at) as date,
          'user_created' as type
        FROM users
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 10
      `);

      res.json({
        userStats: userStats[0],
        projectStats: projectStats[0],
        salesStats: salesStats[0],
        inventoryStats: inventoryStats[0],
        recentActivity: recentActivity
      });

    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Generate user report
exports.generateUserReport = async (req, res) => {
  try {
    const { format = 'json', role, status } = req.query;
    const connection = await pool.getConnection();

    try {
      let query = `
        SELECT
          u.id,
          u.username,
          u.email,
          r.name as role,
          u.created_at,
          CASE WHEN u.id = ? THEN 'Active' ELSE 'Active' END as status
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE 1=1
      `;

      const params = [req.user.id];

      if (role) {
        query += ' AND r.name = ?';
        params.push(role);
      }

      query += ' ORDER BY u.created_at DESC';

      const [users] = await connection.execute(query, params);

      if (format === 'csv') {
        // Convert to CSV format
        const csvData = users.map(user => ({
          ID: user.id,
          Username: user.username,
          Email: user.email,
          Role: user.role,
          Created_At: user.created_at,
          Status: user.status
        }));

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="users_report.csv"');

        // Simple CSV generation
        const csvString = [
          Object.keys(csvData[0] || {}).join(','),
          ...csvData.map(row => Object.values(row).join(','))
        ].join('\n');

        res.send(csvString);
      } else {
        res.json({
          report: 'User Report',
          generated_at: new Date(),
          data: users
        });
      }

    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Generate user report error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Generate project report
exports.generateProjectReport = async (req, res) => {
  try {
    const { format = 'json', status } = req.query;
    const connection = await pool.getConnection();

    try {
      let query = `
        SELECT
          p.id,
          p.name,
          p.status,
          p.created_at,
          so.customer,
          so.total as order_value
        FROM projects p
        LEFT JOIN sales_orders so ON p.sales_order_id = so.id
        WHERE 1=1
      `;

      const params = [];

      if (status) {
        query += ' AND p.status = ?';
        params.push(status);
      }

      query += ' ORDER BY p.created_at DESC';

      const [projects] = await connection.execute(query, params);

      if (format === 'csv') {
        const csvData = projects.map(project => ({
          ID: project.id,
          Name: project.name,
          Status: project.status,
          Customer: project.customer || 'N/A',
          Order_Value: project.order_value || 0,
          Created_At: project.created_at
        }));

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="projects_report.csv"');

        const csvString = [
          Object.keys(csvData[0] || {}).join(','),
          ...csvData.map(row => Object.values(row).join(','))
        ].join('\n');

        res.send(csvString);
      } else {
        res.json({
          report: 'Project Report',
          generated_at: new Date(),
          data: projects
        });
      }

    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Generate project report error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};