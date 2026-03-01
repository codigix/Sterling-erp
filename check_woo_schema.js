const pool = require('./backend/config/database');
async function check() {
  try {
    const [cols] = await pool.execute('DESCRIBE work_order_operations');
    console.log(cols.map(c => c.Field));
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
check();
