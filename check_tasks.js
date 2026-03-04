const pool = require('./backend/config/database');
async function check() {
  try {
    const [rows] = await pool.execute('SELECT * FROM department_tasks');
    console.log('Total tasks:', rows.length);
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
