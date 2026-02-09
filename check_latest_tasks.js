const pool = require('./backend/config/database');
async function run() {
  try {
    const [tasks] = await pool.execute('SELECT * FROM employee_tasks ORDER BY created_at DESC LIMIT 10');
    console.log('Latest 10 tasks in employee_tasks:');
    console.table(tasks);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
