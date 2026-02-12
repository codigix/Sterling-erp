const pool = require('./backend/config/database');

async function checkProductionFlow() {
  try {
    const [roles] = await pool.execute("SELECT id, name FROM roles WHERE name = 'Production' OR name = 'production_manager'");
    console.log('Production Roles:', roles);

    const [managerUsers] = await pool.execute(`
      SELECT DISTINCT u.id, u.email, r.name as role_name
      FROM users u 
      LEFT JOIN employees e ON u.email = e.email 
      JOIN roles r ON (e.role_id = r.id OR u.role_id = r.id)
      WHERE (r.name = 'production_manager' OR r.name = 'Production') AND (e.status = 'active' OR e.status IS NULL)
    `);
    console.log('Manager Users to be notified:', managerUsers);

    const [tasks] = await pool.execute("SELECT * FROM department_tasks ORDER BY created_at DESC LIMIT 5");
    console.log('Recent Department Tasks:', tasks);

    const [notifs] = await pool.execute("SELECT * FROM alerts_notifications ORDER BY created_at DESC LIMIT 5");
    console.log('Recent Notifications:', notifs);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkProductionFlow();
