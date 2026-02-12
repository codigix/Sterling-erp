const pool = require('./backend/config/database');
async function checkUser() {
  const [rows] = await pool.execute('SELECT u.id, u.email, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = 10');
  console.log(rows);
  process.exit(0);
}
checkUser();
