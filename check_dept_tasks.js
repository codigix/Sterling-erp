const pool = require('./backend/config/database');

async function checkDeptTasks() {
  try {
    const [rows] = await pool.execute('SELECT id, task_title, task_description FROM department_tasks');
    rows.forEach(row => {
      console.log(`Task #${row.id}: title = "${row.task_title}", desc = "${row.task_description}"`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDeptTasks();
