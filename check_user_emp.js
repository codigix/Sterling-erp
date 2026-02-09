const pool = require('./backend/config/database');
async function check() {
  try {
    const [users] = await pool.execute("SELECT id, email, HEX(email) as hex_email FROM users WHERE id = 12");
    console.log('User:', users[0]);
    const [emps] = await pool.execute("SELECT id, email, HEX(email) as hex_email FROM employees WHERE id = 21");
    console.log('Employee:', emps[0]);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
check();
