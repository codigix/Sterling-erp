const pool = require('./backend/config/database');

async function checkIds() {
  try {
    console.log("--- Users ---");
    const [users] = await pool.execute("SELECT id, username, email FROM users");
    console.log(JSON.stringify(users, null, 2));

    console.log("\n--- Employees ---");
    const [employees] = await pool.execute("SELECT id, login_id, email FROM employees");
    console.log(JSON.stringify(employees, null, 2));

    console.log("\n--- Roles for Production ---");
    const [roles] = await pool.execute(`
      SELECT u.id, u.username, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE LOWER(r.name) = 'production' OR LOWER(r.name) = 'production_manager'
    `);
    console.log(JSON.stringify(roles, null, 2));

  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

checkIds();
