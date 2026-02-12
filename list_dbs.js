const pool = require('./backend/config/database');
async function listDatabases() {
  const [rows] = await pool.execute('SHOW DATABASES');
  console.log(rows);
  process.exit(0);
}
listDatabases();
