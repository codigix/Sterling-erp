const pool = require('../../config/database');

exports.getKPIs = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(`
        SELECT
          (SELECT COUNT(*) FROM projects) as total_projects,
          (SELECT COUNT(*) FROM sales_orders) as total_orders,
          (SELECT COUNT(*) FROM users) as total_users
      `);
      res.json(result[0] || {});
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get KPIs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [projects] = await connection.execute(`
        SELECT id, name, status, created_at FROM projects LIMIT 100
      `);
      res.json({ projects, total: projects.length });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    res.json({ departments: [], total: 0 });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getVendors = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [vendors] = await connection.execute(`
        SELECT id, name, contact, created_at FROM vendors LIMIT 100
      `);
      res.json({ vendors, total: vendors.length });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getMaterials = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [materials] = await connection.execute(`
        SELECT id, item_code, batch, quantity, rack, shelf FROM inventory LIMIT 100
      `);
      res.json({ materials, total: materials.length });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProduction = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [plans] = await connection.execute(`
        SELECT 
          pp.id, pp.plan_name, pp.status, pp.planned_start_date, pp.planned_end_date,
          pp.estimated_completion_date, pp.bom_id,
          so.id AS sales_order_id, so.customer
        FROM production_plans pp
        LEFT JOIN sales_orders so ON so.id = pp.sales_order_id
        ORDER BY pp.created_at DESC
        LIMIT 100
      `);
      
      const productionData = plans.map(plan => ({
        id: plan.id,
        name: plan.plan_name,
        status: plan.status,
        customer: plan.customer,
        salesOrderId: plan.sales_order_id,
        plannedStart: plan.planned_start_date,
        plannedEnd: plan.planned_end_date,
        estimatedCompletion: plan.estimated_completion_date,
        bomId: plan.bom_id
      }));

      res.json({ production: productionData, total: plans.length });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get production error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [employees] = await connection.execute(`
        SELECT id, username, email FROM users LIMIT 100
      `);
      res.json({ employees, total: employees.length });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getResources = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [resources] = await connection.execute(`
        SELECT id, item_code, batch, quantity, rack, shelf FROM inventory LIMIT 100
      `);
      res.json({ resources, total: resources.length });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
