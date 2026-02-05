const pool = require('./backend/config/database');
async function check() {
  try {
    const [rows] = await pool.execute('SELECT * FROM work_orders ORDER BY created_at DESC LIMIT 5');
    console.log('Last 5 Work Orders:', rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
