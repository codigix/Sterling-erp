const pool = require('./backend/config/database');
async function describeTable() {
  const [rows] = await pool.execute('DESCRIBE department_tasks');
  console.log(rows);
  process.exit(0);
}
describeTable();
