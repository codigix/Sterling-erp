const pool = require('./backend/config/database');
async function checkEmployees() {
  const [rows] = await pool.execute('SELECT e.id, e.first_name, e.last_name, r.name as role_name FROM employees e JOIN roles r ON e.role_id = r.id');
  console.log(rows);
  process.exit(0);
}
checkEmployees();
