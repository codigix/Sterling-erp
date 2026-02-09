const pool = require('./backend/config/database');
async function check() {
  try {
    const [emp12] = await pool.execute('SELECT id, first_name, last_name, email FROM employees WHERE id = ?', [12]);
    console.log('Employee with ID 12:', emp12);
    
    const [emp21] = await pool.execute('SELECT id, first_name, last_name, email FROM employees WHERE id = ?', [21]);
    console.log('Employee with ID 21:', emp21);

    const [user12] = await pool.execute('SELECT id, username, email FROM users WHERE id = ?', [12]);
    console.log('User with ID 12:', user12);

  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
check();
