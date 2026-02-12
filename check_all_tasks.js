const pool = require('./backend/config/database');
async function checkTasks() {
  const [rows] = await pool.execute("SELECT * FROM department_tasks WHERE task_title LIKE 'Production Entry%'");
  console.log('Tasks matching title:', rows);
  
  const [all] = await pool.execute("SELECT id, role_id, task_title FROM department_tasks");
  console.log('All department tasks:', all);
  
  process.exit(0);
}
checkTasks();
