const pool = require('./backend/config/database');
async function check() {
  try {
    const [cols1] = await pool.execute('DESCRIBE work_order_time_logs');
    console.log('work_order_time_logs:', cols1.map(c => c.Field));
    const [cols2] = await pool.execute('DESCRIBE work_order_quality_entries');
    console.log('work_order_quality_entries:', cols2.map(c => c.Field));
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
check();
