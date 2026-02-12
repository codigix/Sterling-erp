const pool = require('./backend/config/database');
async function checkEmployeeTask() {
  try {
    const taskId = 12;
    const [rows] = await pool.execute('SELECT * FROM employee_tasks WHERE id = ?', [taskId]);
    console.log(`--- Employee Task ${taskId} ---`);
    console.log(JSON.stringify(rows, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkEmployeeTask();
