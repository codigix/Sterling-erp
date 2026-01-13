const pool = require('./backend/config/database');
async function listTables() {
  const [rows] = await pool.execute('SHOW TABLES');
  console.log(rows);
  process.exit(0);
}
listTables();
