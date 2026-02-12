const pool = require('./backend/config/database');
async function checkTasks() {
  const [rows] = await pool.execute('SELECT role_id, COUNT(*) as count FROM department_tasks GROUP BY role_id');
  console.log(rows);
  const [roles] = await pool.execute('SELECT id, name FROM roles WHERE id IN (' + rows.map(r => r.role_id).join(',') + ')');
  console.log(roles);
  process.exit(0);
}
checkTasks();
