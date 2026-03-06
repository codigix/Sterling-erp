const pool = require('./backend/config/database');

async function checkIds() {
  try {
    console.log("\n--- All Employees ---");
    const [employees] = await pool.execute("SELECT id, login_id, email FROM employees");
    console.log(JSON.stringify(employees, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

checkIds();
