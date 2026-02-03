const pool = require('./backend/config/database');
async function check() {
  try {
    const [rows] = await pool.execute('DESCRIBE production_plan_details');
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
check();