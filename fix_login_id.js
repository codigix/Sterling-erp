const pool = require('./backend/config/database');
async function fix() {
  try {
    await pool.execute("UPDATE employees SET login_id = 'sudarshan.kale' WHERE id = 21");
    console.log('Fixed login_id for employee 21');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
fix();
