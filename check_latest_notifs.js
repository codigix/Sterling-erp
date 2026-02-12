const pool = require('./backend/config/database');
async function checkNotifs() {
  const [rows] = await pool.execute('SELECT * FROM alerts_notifications ORDER BY created_at DESC LIMIT 10');
  console.log(rows);
  process.exit(0);
}
checkNotifs();
