const pool = require('./backend/config/database');
async function run() {
  try {
    const [emp] = await pool.execute('SELECT id, first_name, last_name, email FROM employees WHERE first_name LIKE "Sudarshan%"');
    console.log('Employees:', JSON.stringify(emp, null, 2));
    
    const [users] = await pool.execute('SELECT id, username, email FROM users');
    console.log('Users:', JSON.stringify(users, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
