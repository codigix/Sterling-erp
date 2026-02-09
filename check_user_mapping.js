const pool = require('./backend/config/database');
async function run() {
  try {
    const [users] = await pool.execute('SELECT id, username, email FROM users');
    console.log('All Users:');
    console.table(users);
    
    for (const user of users) {
      const [emps] = await pool.execute('SELECT id FROM employees WHERE email = ?', [user.email]);
      console.log(`User ${user.id} (${user.username}) -> Employee ID: ${emps.length > 0 ? emps[0].id : 'NONE'}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
