const pool = require('./backend/config/database');
async function check() {
  try {
    const [tasks] = await pool.execute("SELECT * FROM employee_tasks WHERE employee_id = 21");
    console.log('Employee Tasks:', JSON.stringify(tasks, null, 2));
    
    const [workerTasks] = await pool.execute("SELECT * FROM worker_tasks WHERE worker_id = 12");
    console.log('Worker Tasks:', JSON.stringify(workerTasks, null, 2));

    const [notifs] = await pool.execute("SELECT * FROM alerts_notifications WHERE user_id = 12");
    console.log('Notifications:', JSON.stringify(notifs, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
check();
