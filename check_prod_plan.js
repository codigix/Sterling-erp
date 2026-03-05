const pool = require('./backend/config/database');
async function checkTable() {
  try {
    const [rows] = await pool.execute('DESCRIBE production_plan_details');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkTable();
