const pool = require('./backend/config/database');
async function checkData() {
  try {
    const [rows] = await pool.execute('SELECT id, plan_name FROM production_plans');
    console.log(rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkData();
