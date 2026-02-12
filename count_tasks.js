const pool = require('./backend/config/database');
async function countTasks() {
  const [eTasks] = await pool.execute('SELECT COUNT(*) as count FROM employee_tasks');
  console.log('employee_tasks count:', eTasks[0].count);
  const [wTasks] = await pool.execute('SELECT COUNT(*) as count FROM worker_tasks');
  console.log('worker_tasks count:', wTasks[0].count);
  const [notifs] = await pool.execute('SELECT COUNT(*) as count FROM alerts_notifications');
  console.log('alerts_notifications count:', notifs[0].count);
  process.exit(0);
}
countTasks();
