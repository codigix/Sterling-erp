const pool = require('./backend/config/database');
async function cleanup() {
  try {
    console.log('--- Cleaning up trailing spaces in employees table ---');
    const [result] = await pool.execute(`
      UPDATE employees 
      SET first_name = TRIM(first_name), 
          last_name = TRIM(last_name), 
          login_id = TRIM(login_id),
          email = TRIM(email)
    `);
    console.log(`Updated ${result.affectedRows} employee records`);

    const [employees] = await pool.execute('SELECT id, first_name, last_name, login_id FROM employees WHERE first_name LIKE "%Sudarshan%" OR last_name LIKE "%Kale%"');
    console.log('\n--- Sudarshan Employees After Cleanup ---');
    console.log(JSON.stringify(employees, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
cleanup();
