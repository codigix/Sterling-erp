const pool = require('./backend/config/database');
async function check() {
  try {
    const [cols] = await pool.execute('DESCRIBE delivery_details');
    console.table(cols);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
check();
