const pool = require('./backend/config/database');
async function run() {
  try {
    const userId = 12; // Sudarshan Kale
    const empId = 21; // Sudarshan Kale
    
    console.log(`Checking tasks for User ${userId} and Employee ${empId}`);
    
    const [tasks] = await pool.execute('SELECT * FROM employee_tasks WHERE work_order_operation_id = 111');
    console.log(`Found ${tasks.length} tasks in employee_tasks for operation 111`);
    console.table(tasks);
    
    const [workerTasks] = await pool.execute('SELECT * FROM worker_tasks WHERE worker_id = ?', [userId]);
    console.log(`Found ${workerTasks.length} tasks in worker_tasks for user_id ${userId}`);
    console.table(workerTasks);

    const [notifs] = await pool.execute('SELECT * FROM alerts_notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5', [userId]);
    console.log(`Recent notifications for user ${userId}:`);
    console.table(notifs);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
