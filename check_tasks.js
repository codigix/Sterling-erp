const pool = require('./backend/config/database');
async function check() {
  try {
    const [tasks] = await pool.execute('SELECT * FROM department_tasks WHERE role_id = 5');
    console.log('Tasks for Role 5:', JSON.stringify(tasks, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
check();