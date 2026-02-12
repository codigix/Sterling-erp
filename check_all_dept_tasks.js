const pool = require('./backend/config/database');
async function checkTasks() {
  const [rows] = await pool.execute("SELECT * FROM department_tasks WHERE role_id != 4");
  console.log('Department Tasks (role_id != 4):', rows);
  
  const [titles] = await pool.execute("SELECT DISTINCT task_title FROM department_tasks");
  console.log('Unique task titles:', titles);
  
  process.exit(0);
}
checkTasks();
