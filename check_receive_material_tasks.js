const pool = require('./backend/config/database');
(async () => {
  try {
    const [rows] = await pool.execute("SELECT task_title, notes FROM department_tasks WHERE task_title LIKE '%Receive Material%' OR task_title LIKE '%Process Material%'");
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
