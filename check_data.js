const pool = require('./backend/config/database');
async function check() {
  try {
    const [notifications] = await pool.execute('SELECT * FROM alerts_notifications ORDER BY created_at DESC LIMIT 10');
    console.log('Recent notifications:', JSON.stringify(notifications, null, 2));
    
    const [tasks] = await pool.execute('SELECT * FROM department_tasks ORDER BY created_at DESC LIMIT 10');
    console.log('Recent department tasks:', JSON.stringify(tasks, null, 2));

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
check();