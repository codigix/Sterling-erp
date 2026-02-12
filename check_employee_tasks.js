const pool = require('./backend/config/database');
async function checkEmployeeTasks() {
  const [rows] = await pool.execute('SELECT * FROM employee_tasks WHERE id IN (9, 10)');
  console.log('Employee Tasks 9, 10:', rows);
  
  const [latest] = await pool.execute('SELECT * FROM employee_tasks ORDER BY created_at DESC LIMIT 5');
  console.log('Latest employee tasks:', latest);
  
  process.exit(0);
}
checkEmployeeTasks();
