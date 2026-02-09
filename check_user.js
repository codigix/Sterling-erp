const pool = require('./backend/config/database');
async function checkUser() {
  try {
    const [users] = await pool.execute('SELECT id, username, email FROM users WHERE email LIKE "%kale%" OR username LIKE "%kale%"');
    console.log('--- Users matching "kale" ---');
    console.log(JSON.stringify(users, null, 2));
    
    const [employees] = await pool.execute('SELECT id, first_name, last_name, login_id, email FROM employees WHERE id = 21');
    console.log('\n--- Employee 21 ---');
    console.log(JSON.stringify(employees, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkUser();
