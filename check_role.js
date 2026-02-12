const pool = require('./backend/config/database');
async function checkRole() {
  const [rows] = await pool.execute('SELECT id, name FROM roles WHERE id IN (4, 5, 10)');
  console.log(rows);
  process.exit(0);
}
checkRole();
