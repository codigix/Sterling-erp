const pool = require('./backend/config/database');
async function checkIds() {
  try {
    const [any18] = await pool.execute('SELECT * FROM users WHERE id = 18');
    console.log('User ID 18:', any18);
    const [any18e] = await pool.execute('SELECT * FROM employees WHERE id = 18');
    console.log('Employee ID 18:', any18e);
    const [allUsers] = await pool.execute('SELECT id, username FROM users');
    console.log('All User IDs:', allUsers.map(u => u.id).join(', '));
    const [allEmps] = await pool.execute('SELECT id, first_name FROM employees');
    console.log('All Employee IDs:', allEmps.map(e => e.id).join(', '));
    const [tasks] = await pool.execute('SELECT * FROM employee_tasks');
    console.log('Employee Tasks:');
    console.table(tasks);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
checkIds();
