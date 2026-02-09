const pool = require('./config/database');
async function checkSchema() {
  try {
    const [rows] = await pool.execute('SHOW CREATE TABLE employee_tasks');
    console.log(rows[0]['Create Table']);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
checkSchema();
