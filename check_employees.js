const pool = require('./backend/config/database');
async function check() {
  try {
    const [employees] = await pool.execute('SELECT e.id, e.email, e.status, r.name as role_name FROM employees e JOIN roles r ON e.role_id = r.id');
    console.log('Employees:', JSON.stringify(employees, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
check();